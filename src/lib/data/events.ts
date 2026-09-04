import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface EventPrize {
  place: string;
  amount: string;
  description?: string;
}

export interface EventResource {
  title: string;
  url: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  registration_url: string | null;
  status_label: string;
  author_id: string | null;
  reviewer_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  is_featured: boolean;
  location_type?: 'online' | 'in_person' | 'hybrid';
  location?: string;
  capacity?: number | null;
  registration_deadline?: string | null;
  prizes?: EventPrize[];
  rules_mdx?: string | null;
  resources?: EventResource[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  registrations_count?: number;
}

export interface HackathonProblemStatement {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  description_mdx: string;
  category: string;
  difficulty: string;
  reference_links: Array<{ title: string; url: string }>;
  created_at: string;
  updated_at: string;
}

export interface EventRecap {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  winner_team_name: string | null;
  author_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export async function getPublishedEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, role),
        event_registrations(count)
      `)
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch events:', error.message);
      return [];
    }

    return (data || []).map((ev: any) => ({
      ...ev,
      registrations_count: ev.event_registrations?.[0]?.count || 0,
    })) as Event[];
  } catch (err) {
    console.error('Unexpected error fetching events:', err);
    return [];
  }
}

export async function getFilteredEvents(
  eventType?: string,
  timeStatus: 'all' | 'active' | 'upcoming' | 'past' = 'all'
): Promise<Event[]> {
  const allEvents = await getPublishedEvents();
  const now = new Date();

  return allEvents.filter((ev) => {
    // Type filter
    if (eventType && eventType !== 'ALL') {
      const normalizedType = ev.event_type.toLowerCase();
      const target = eventType.toLowerCase();
      if (!normalizedType.includes(target) && !target.includes(normalizedType)) {
        return false;
      }
    }

    const startDate = new Date(ev.start_date);
    const endDate = new Date(ev.end_date);

    // Time status filter
    if (timeStatus === 'active') {
      return startDate <= now && endDate >= now;
    }
    if (timeStatus === 'upcoming') {
      return startDate > now;
    }
    if (timeStatus === 'past') {
      return endDate < now;
    }

    return true;
  });
}

export async function getUpcomingAndActiveEvents(limit = 6): Promise<Event[]> {
  const allEvents = await getPublishedEvents();
  const now = new Date();

  return allEvents
    .filter((ev) => new Date(ev.end_date) >= now)
    .slice(0, limit);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, bio, role),
        event_registrations(count)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch event ${slug}:`, error.message);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      registrations_count: data.event_registrations?.[0]?.count || 0,
    } as unknown as Event;
  } catch (err) {
    console.error(`Unexpected error fetching event ${slug}:`, err);
    return null;
  }
}

export async function getHackathonProblemStatements(eventId: string): Promise<HackathonProblemStatement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('hackathon_problem_statements')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Failed to fetch problem statements for event ${eventId}:`, error.message);
      return [];
    }

    return (data || []) as unknown as HackathonProblemStatement[];
  } catch (err) {
    console.error('Unexpected error fetching problem statements:', err);
    return [];
  }
}

export async function getEventRecaps(eventId?: string): Promise<EventRecap[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('event_recaps')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch event recaps:', error.message);
      return [];
    }

    return (data || []) as unknown as EventRecap[];
  } catch (err) {
    console.error('Unexpected error fetching event recaps:', err);
    return [];
  }
}
