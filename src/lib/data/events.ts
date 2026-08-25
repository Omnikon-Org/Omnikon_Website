import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

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
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
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
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, role)
      `)
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch events:', error.message);
      return [];
    }

    return (data || []) as unknown as Event[];
  } catch (err) {
    console.error('Unexpected error fetching events:', err);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, bio, role)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch event ${slug}:`, error.message);
      return null;
    }

    return data as unknown as Event;
  } catch (err) {
    console.error(`Unexpected error fetching event ${slug}:`, err);
    return null;
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
