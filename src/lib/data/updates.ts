import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface Update {
  id: string;
  title: string;
  content_mdx: string;
  link_url: string | null;
  author_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
}

export async function getPublishedUpdates(): Promise<Update[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('updates')
      .select(`
        *,
        author:profiles!updates_author_id_fkey(id, username, full_name, avatar_url, role)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch updates:', error.message);
      return [];
    }

    return (data || []) as unknown as Update[];
  } catch (err) {
    console.error('Unexpected error fetching updates:', err);
    return [];
  }
}
