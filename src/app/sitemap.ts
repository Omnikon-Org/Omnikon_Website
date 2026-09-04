import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quizzes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quizzes/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/activity`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const supabase = createAdminClient();

    const [
      { data: articles },
      { data: projects },
      { data: events },
      { data: quizzes },
      { data: members },
    ] = await Promise.all([
      supabase.from('articles').select('slug, updated_at').eq('status', 'published'),
      supabase.from('projects').select('slug, updated_at').eq('status', 'published'),
      supabase.from('events').select('slug, updated_at').eq('status', 'published'),
      supabase.from('quizzes').select('slug, updated_at').eq('status', 'published'),
      supabase.from('profiles').select('username, updated_at').eq('is_public', true),
    ]);

    const articleUrls: MetadataRoute.Sitemap = (articles || []).map((art) => ({
      url: `${baseUrl}/blogs/${art.slug}`,
      lastModified: new Date(art.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const projectUrls: MetadataRoute.Sitemap = (projects || []).map((proj) => ({
      url: `${baseUrl}/projects/${proj.slug}`,
      lastModified: new Date(proj.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const eventUrls: MetadataRoute.Sitemap = (events || []).map((ev) => ({
      url: `${baseUrl}/events/${ev.slug}`,
      lastModified: new Date(ev.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const quizUrls: MetadataRoute.Sitemap = (quizzes || []).map((qz) => ({
      url: `${baseUrl}/quizzes/${qz.slug}`,
      lastModified: new Date(qz.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const memberUrls: MetadataRoute.Sitemap = (members || []).map((mem) => ({
      url: `${baseUrl}/profile/${mem.username}`,
      lastModified: new Date(mem.updated_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...articleUrls, ...projectUrls, ...eventUrls, ...quizUrls, ...memberUrls];
  } catch (err) {
    console.error('Failed to generate dynamic sitemap entries:', err);
    return staticRoutes;
  }
}
