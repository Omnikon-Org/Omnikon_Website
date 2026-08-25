import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';
import type { Category } from './categories';
import type { Tag } from './tags';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  category_id: string | null;
  type: 'article' | 'tutorial' | 'engineering_story' | 'project_story';
  status: 'draft' | 'review' | 'published' | 'archived';
  reading_time_minutes: number;
  views_count: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  category?: Category | null;
  tags?: Tag[];
}

export async function getPublishedArticles(options?: {
  categorySlug?: string;
  tagSlug?: string;
  searchQuery?: string;
  featuredOnly?: boolean;
}): Promise<Article[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey(id, username, full_name, avatar_url, role, developer_tier),
        category:categories(id, name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      // Use PostgreSQL text search on search_vector
      query = query.textSearch('search_vector', options.searchQuery.trim(), {
        config: 'english',
        type: 'websearch',
      });
    }

    const { data: articlesData, error } = await query;

    if (error) {
      console.error('Failed to fetch articles:', error.message);
      return [];
    }

    if (!articlesData || articlesData.length === 0) {
      return [];
    }

    // Filter by Category Slug if provided
    let filteredArticles = articlesData;
    if (options?.categorySlug) {
      filteredArticles = filteredArticles.filter(
        (art) => art.category && art.category.slug === options.categorySlug
      );
    }

    return filteredArticles as unknown as Article[];
  } catch (err) {
    console.error('Unexpected error fetching articles:', err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey(id, username, full_name, avatar_url, bio, github_username, role, developer_tier),
        category:categories(id, name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch article ${slug}:`, error.message);
      return null;
    }

    return data as unknown as Article;
  } catch (err) {
    console.error(`Unexpected error fetching article ${slug}:`, err);
    return null;
  }
}
