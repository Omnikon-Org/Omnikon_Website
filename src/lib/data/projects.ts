import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface Project {
  id: string;
  name: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  repository_url: string;
  demo_url: string | null;
  github_repo_name: string;
  tech_stack: string[];
  program_tag: string | null;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  author_id: string | null;
  reviewer_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
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
}

export async function getPublishedProjects(options?: {
  searchQuery?: string;
  featuredOnly?: boolean;
}): Promise<Project[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('projects')
      .select(`
        *,
        author:profiles!projects_author_id_fkey(id, username, full_name, avatar_url, role, developer_tier)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      query = query.textSearch('search_vector', options.searchQuery.trim(), {
        config: 'english',
        type: 'websearch',
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch projects:', error.message);
      return [];
    }

    return (data || []) as unknown as Project[];
  } catch (err) {
    console.error('Unexpected error fetching projects:', err);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        author:profiles!projects_author_id_fkey(id, username, full_name, avatar_url, bio, github_username, role, developer_tier)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch project ${slug}:`, error.message);
      return null;
    }

    return data as unknown as Project;
  } catch (err) {
    console.error(`Unexpected error fetching project ${slug}:`, err);
    return null;
  }
}
