import { createClient } from '@/lib/supabase/server';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export async function getTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch tags:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching tags:', err);
    return [];
  }
}
