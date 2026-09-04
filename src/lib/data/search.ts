import { createClient } from '@/lib/supabase/server';
import type { Article } from './articles';
import type { Project } from './projects';
import type { Event } from './events';
import type { Profile } from './profiles';

export interface SearchResults {
  query: string;
  totalResults: number;
  articles: Article[];
  projects: Project[];
  events: Event[];
  members: Profile[];
}

export async function globalSearch(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();

  if (!query) {
    return {
      query: '',
      totalResults: 0,
      articles: [],
      projects: [],
      events: [],
      members: [],
    };
  }

  try {
    const supabase = await createClient();
    const pattern = `%${query}%`;

    const [
      { data: articlesData, error: artErr },
      { data: projectsData, error: projErr },
      { data: eventsData, error: evErr },
      { data: membersData, error: memErr },
    ] = await Promise.all([
      // Search published articles
      supabase
        .from('articles')
        .select(`
          id, title, slug, summary, type, reading_time_minutes, published_at, created_at,
          category:categories(name, slug),
          author:profiles(full_name, username)
        `)
        .eq('status', 'published')
        .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
        .limit(10),

      // Search published projects
      supabase
        .from('projects')
        .select('id, name, slug, summary, github_repo_name, tech_stack, stars_count, forks_count, open_issues_count')
        .eq('status', 'published')
        .or(`name.ilike.${pattern},summary.ilike.${pattern},github_repo_name.ilike.${pattern}`)
        .limit(10),

      // Search published events
      supabase
        .from('events')
        .select('id, title, slug, summary, event_type, start_date, end_date, status_label')
        .eq('status', 'published')
        .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
        .limit(10),

      // Search public members
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, developer_tier, skills')
        .eq('is_public', true)
        .or(`full_name.ilike.${pattern},username.ilike.${pattern},bio.ilike.${pattern}`)
        .limit(10),
    ]);

    const articles = (articlesData || []) as unknown as Article[];
    const projects = (projectsData || []) as unknown as Project[];
    const events = (eventsData || []) as unknown as Event[];
    const members = (membersData || []) as unknown as Profile[];

    const totalResults = articles.length + projects.length + events.length + members.length;

    return {
      query,
      totalResults,
      articles,
      projects,
      events,
      members,
    };
  } catch (err) {
    console.error(`Global search failed for query "${query}":`, err);
    return {
      query,
      totalResults: 0,
      articles: [],
      projects: [],
      events: [],
      members: [],
    };
  }
}
