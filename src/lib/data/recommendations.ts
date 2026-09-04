import { createClient } from '@/lib/supabase/server';
import type { Article } from './articles';
import type { Project } from './projects';
import type { Event } from './events';

export async function getRelatedArticles(currentArticleId: string, categoryId?: string | null, limit = 2): Promise<Article[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('articles')
      .select(`
        id, title, slug, summary, type, reading_time_minutes, published_at, created_at,
        category:categories(name, slug),
        author:profiles(full_name, username)
      `)
      .eq('status', 'published')
      .neq('id', currentArticleId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch related articles:', error.message);
      return [];
    }

    return (data || []) as unknown as Article[];
  } catch (err) {
    console.error('Unexpected error fetching related articles:', err);
    return [];
  }
}

export async function getRelatedProjects(currentProjectId: string, limit = 2): Promise<Project[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, slug, summary, github_repo_name, tech_stack, stars_count, forks_count, open_issues_count')
      .eq('status', 'published')
      .neq('id', currentProjectId)
      .order('stars_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch related projects:', error.message);
      return [];
    }

    return (data || []) as unknown as Project[];
  } catch (err) {
    console.error('Unexpected error fetching related projects:', err);
    return [];
  }
}

export async function getRelatedEvents(currentEventId: string, limit = 2): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, summary, event_type, start_date, end_date, status_label')
      .eq('status', 'published')
      .neq('id', currentEventId)
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch related events:', error.message);
      return [];
    }

    return (data || []) as unknown as Event[];
  } catch (err) {
    console.error('Unexpected error fetching related events:', err);
    return [];
  }
}
