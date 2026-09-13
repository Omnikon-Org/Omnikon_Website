import { createAdminClient } from '@/lib/supabase/server';

export interface ExtractedArticle {
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  canonical_url: string | null;
  reading_time_minutes: number;
  tags: string[];
  published_at: string;
  source: 'devto' | 'hashnode';
  source_id?: string;
  author_name?: string;
}

/**
 * Fetch articles from Dev.to
 * - If apiKey is present and no third-party username is specified: fetches personal articles (published + unlisted)
 * - If username is specified: fetches public articles from that user
 */
export async function fetchDevtoArticles(options: {
  apiKey?: string;
  username?: string;
}): Promise<ExtractedArticle[]> {
  const isPersonal = !options.username && !!options.apiKey;
  const endpoint = isPersonal
    ? 'https://dev.to/api/articles/me/all?per_page=100'
    : `https://dev.to/api/articles?username=${encodeURIComponent(options.username || '')}&per_page=100`;

  const headers: Record<string, string> = {
    'User-Agent': 'Omnikon-Article-Extractor/2.0',
    Accept: 'application/json',
  };

  if (options.apiKey) {
    headers['api-key'] = options.apiKey;
  }

  const res = await fetch(endpoint, { headers, cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Dev.to API error (${res.status}): ${errorText}`);
  }

  const list: any[] = await res.json();
  if (!Array.isArray(list)) {
    throw new Error('Unexpected response format from Dev.to');
  }

  // If personal, we already have body_markdown in some listings, but let's fetch full article detail if needed
  const articles: ExtractedArticle[] = [];

  for (const item of list) {
    let markdown = item.body_markdown || '';

    // If body_markdown is missing (common in public listing), fetch full article by ID
    if (!markdown && item.id) {
      try {
        const detailRes = await fetch(`https://dev.to/api/articles/${item.id}`, { headers });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          markdown = detail.body_markdown || detail.description || '';
        }
      } catch (err) {
        console.warn(`Failed to fetch detail for Dev.to article ${item.id}:`, err);
        markdown = item.description || '';
      }
    }

    const tagList: string[] = Array.isArray(item.tag_list)
      ? item.tag_list
      : typeof item.tags === 'string'
      ? item.tags.split(',').map((t: string) => t.trim())
      : [];

    articles.push({
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: item.description || (markdown.slice(0, 200) + '...'),
      content_mdx: markdown,
      featured_image: item.cover_image || item.social_image || null,
      canonical_url: item.canonical_url || item.url || null,
      reading_time_minutes: item.reading_time_minutes || 4,
      tags: tagList,
      published_at: item.published_at || item.created_at || new Date().toISOString(),
      source: 'devto',
      source_id: String(item.id),
      author_name: item.user?.name || item.user?.username || 'Omnikon Contributor',
    });
  }

  return articles;
}

/**
 * Fetch articles from Hashnode
 * Supports publication host (e.g. blog.domain.com or username.hashnode.dev)
 */
export async function fetchHashnodeArticles(options: {
  hostOrUsername: string;
  token?: string;
}): Promise<ExtractedArticle[]> {
  const host = options.hostOrUsername.includes('.')
    ? options.hostOrUsername
    : `${options.hostOrUsername.replace('@', '')}.hashnode.dev`;

  // Query RSS feed or GraphQL if available
  const rssUrl = `https://${host}/rss.xml`;
  const res = await fetch(rssUrl, {
    headers: { 'User-Agent': 'Omnikon-Article-Extractor/2.0' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      `Failed to access Hashnode blog at ${rssUrl} (${res.status}). Verify the blog domain/handle.`
    );
  }

  const xmlText = await res.text();
  return parseHashnodeRss(xmlText);
}

function parseHashnodeRss(xmlText: string): ExtractedArticle[] {
  const articles: ExtractedArticle[] = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';

    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : '';

    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
    let content = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';

    // Strip basic html tags for summary
    const summary = content.replace(/<[^>]+>/g, '').slice(0, 220) + '...';

    // Extract slug from link
    const slug = link.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (title) {
      articles.push({
        title,
        slug,
        summary,
        content_mdx: content,
        featured_image: null,
        canonical_url: link || null,
        reading_time_minutes: Math.max(1, Math.round(content.length / 1000)),
        tags: ['Engineering', 'Hashnode'],
        published_at: pubDate,
        source: 'hashnode',
        source_id: slug,
        author_name: 'Omnikon Contributor',
      });
    }
  }

  return articles;
}

/**
 * Persist articles directly into Supabase
 * Upserts by slug to ensure idempotence and prevent duplicates
 */
export async function importArticlesToSupabase(articles: ExtractedArticle[]) {
  const supabase = createAdminClient();

  // 1. Fetch available categories to map tags to category_id
  const { data: categories } = await supabase.from('categories').select('id, name, slug');
  const catMap = new Map<string, string>();
  if (categories) {
    for (const c of categories) {
      catMap.set(c.slug.toLowerCase(), c.id);
      catMap.set(c.name.toLowerCase(), c.id);
    }
  }

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const art of articles) {
    try {
      // Find suitable category_id or default to tutorials / web-development
      let categoryId = null;
      for (const tag of art.tags) {
        const normTag = tag.toLowerCase();
        if (catMap.has(normTag)) {
          categoryId = catMap.get(normTag);
          break;
        }
      }
      if (!categoryId && catMap.has('tutorials')) {
        categoryId = catMap.get('tutorials');
      }

      // Check if article with this slug already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', art.slug)
        .maybeSingle();

      const payload = {
        title: art.title,
        slug: art.slug,
        summary: art.summary,
        content_mdx: art.content_mdx,
        featured_image: art.featured_image,
        canonical_url: art.canonical_url,
        category_id: categoryId,
        type: 'article',
        status: 'published',
        reading_time_minutes: art.reading_time_minutes,
        published_at: art.published_at,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) {
          errors.push(`Failed to update ${art.slug}: ${updateError.message}`);
        } else {
          updated++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('articles')
          .insert({
            ...payload,
            created_at: art.published_at,
          });

        if (insertError) {
          errors.push(`Failed to insert ${art.slug}: ${insertError.message}`);
        } else {
          inserted++;
        }
      }
    } catch (err: any) {
      errors.push(`Error processing ${art.slug}: ${err.message}`);
    }
  }

  return {
    total: articles.length,
    inserted,
    updated,
    errors,
  };
}
