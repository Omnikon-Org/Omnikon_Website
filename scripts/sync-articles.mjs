#!/usr/bin/env node
// Omnikon 2.0 — Standalone Article Sync Automation Script
// Usage:
//   node --env-file=.env --env-file=.env.local scripts/sync-articles.mjs
//   node --env-file=.env --env-file=.env.local scripts/sync-articles.mjs --devto-user=fireship
//   node --env-file=.env --env-file=.env.local scripts/sync-articles.mjs --hashnode-host=engineering.hashnode.dev

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEVTO_API_KEY = process.env.DEVTO_API_KEY;
const HASHNODE_ACCESS_TOKEN = process.env.HASHNODE_ACCESS_TOKEN;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in environment');
  process.exit(1);
}

const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Parse CLI Arguments
const args = process.argv.slice(2);
const devtoUserArg = args.find((a) => a.startsWith('--devto-user='))?.split('=')[1];
const hashnodeHostArg = args.find((a) => a.startsWith('--hashnode-host='))?.split('=')[1];

console.log('🚀 Starting Omnikon Article Sync Automation...\n');

async function syncDevto() {
  const isPersonal = !devtoUserArg && !!DEVTO_API_KEY;
  const endpoint = isPersonal
    ? 'https://dev.to/api/articles/me/all?per_page=100'
    : `https://dev.to/api/articles?username=${encodeURIComponent(devtoUserArg || '')}&per_page=100`;

  console.log(`📡 Fetching Dev.to articles from ${endpoint}...`);

  const headers = {
    'User-Agent': 'Omnikon-Sync-Bot/2.0',
  };
  if (DEVTO_API_KEY) headers['api-key'] = DEVTO_API_KEY;

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    throw new Error(`Dev.to API returned ${res.status}: ${await res.text()}`);
  }

  const list = await res.json();
  console.log(`✓ Fetched ${list.length} articles from Dev.to.`);

  let inserted = 0;
  let updated = 0;

  for (const item of list) {
    let markdown = item.body_markdown || '';
    if (!markdown && item.id) {
      try {
        const dRes = await fetch(`https://dev.to/api/articles/${item.id}`, { headers });
        if (dRes.ok) {
          const detail = await dRes.json();
          markdown = detail.body_markdown || detail.description || '';
        }
      } catch {
        markdown = item.description || '';
      }
    }

    const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const summary = item.description || markdown.slice(0, 200) + '...';

    const { data: existing } = await adminSupabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const payload = {
      title: item.title,
      slug,
      summary,
      content_mdx: markdown,
      featured_image: item.cover_image || item.social_image || null,
      canonical_url: item.canonical_url || item.url || null,
      type: 'article',
      status: 'published',
      reading_time_minutes: item.reading_time_minutes || 4,
      published_at: item.published_at || item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await adminSupabase.from('articles').update(payload).eq('id', existing.id);
      updated++;
    } else {
      await adminSupabase.from('articles').insert({
        ...payload,
        created_at: payload.published_at,
      });
      inserted++;
    }
  }

  console.log(`✅ Dev.to Sync Complete: +${inserted} inserted, ~${updated} updated.`);
}

async function syncHashnode() {
  if (!hashnodeHostArg) {
    console.log('ℹ️ No Hashnode host specified (--hashnode-host=<domain>). Skipping Hashnode.');
    return;
  }

  const host = hashnodeHostArg.includes('.') ? hashnodeHostArg : `${hashnodeHostArg.replace('@', '')}.hashnode.dev`;
  console.log(`📡 Fetching Hashnode articles from https://${host}/rss.xml...`);

  const res = await fetch(`https://${host}/rss.xml`, {
    headers: { 'User-Agent': 'Omnikon-Sync-Bot/2.0' },
  });

  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch Hashnode RSS (${res.status}). Skipping.`);
    return;
  }

  const xmlText = await res.text();
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  console.log(`✓ Fetched ${itemMatches.length} posts from Hashnode RSS.`);

  let inserted = 0;
  let updated = 0;

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';

    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : '';

    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
    const content = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';
    const summary = content.replace(/<[^>]+>/g, '').slice(0, 220) + '...';
    const slug = link.split('/').filter(Boolean).pop() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!title) continue;

    const { data: existing } = await adminSupabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    const payload = {
      title,
      slug,
      summary,
      content_mdx: content,
      featured_image: null,
      canonical_url: link || null,
      type: 'article',
      status: 'published',
      reading_time_minutes: Math.max(1, Math.round(content.length / 1000)),
      published_at: pubDate,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await adminSupabase.from('articles').update(payload).eq('id', existing.id);
      updated++;
    } else {
      await adminSupabase.from('articles').insert({
        ...payload,
        created_at: pubDate,
      });
      inserted++;
    }
  }

  console.log(`✅ Hashnode Sync Complete: +${inserted} inserted, ~${updated} updated.`);
}

async function run() {
  try {
    await syncDevto();
    await syncHashnode();
    console.log('\n🎉 ALL ARTICLES SYNCHRONIZED DIRECTLY INTO SUPABASE!');
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

run();
