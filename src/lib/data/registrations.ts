import { createClient } from '@/lib/supabase/server';
import type { Event } from './events';

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event?: Event;
}

export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to fetch event registrations for user ${userId}:`, error.message);
      return [];
    }

    return (data || []) as unknown as EventRegistration[];
  } catch (err) {
    console.error('Unexpected error fetching user registrations:', err);
    return [];
  }
}

export async function checkEventRegistration(eventId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to check registration status:', error.message);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Unexpected error checking registration:', err);
    return false;
  }
}
