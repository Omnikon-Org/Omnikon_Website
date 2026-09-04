import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface Contribution {
  id: string;
  user_id: string;
  project_id: string | null;
  event_id: string | null;
  type: 'github_pr' | 'issue_contribution' | 'article_submission' | 'event_registration' | 'hackathon_participation' | 'community_milestone' | string;
  title: string;
  description: string | null;
  external_url: string | null;
  metadata: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  user?: Partial<Profile> | null;
  project?: { id: string; name: string; slug: string } | null;
  event?: { id: string; title: string; slug: string } | null;
}

export async function getUserContributions(userId: string): Promise<Contribution[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        project:projects(id, name, slug),
        event:events(id, title, slug)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Failed to fetch contributions for user ${userId}:`, error.message);
      return [];
    }

    return (data || []) as Contribution[];
  } catch (err) {
    console.error('Unexpected error fetching user contributions:', err);
    return [];
  }
}

export async function getPublicContributions(limit = 20): Promise<Contribution[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        user:profiles(id, username, full_name, avatar_url, role, developer_tier),
        project:projects(id, name, slug),
        event:events(id, title, slug)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch public contributions:', error.message);
      return [];
    }

    return (data || []) as Contribution[];
  } catch (err) {
    console.error('Unexpected error fetching public contributions:', err);
    return [];
  }
}

export async function recordContribution(payload: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  projectId?: string;
  eventId?: string;
  externalUrl?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
}): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('contributions').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      description: payload.description || null,
      project_id: payload.projectId || null,
      event_id: payload.eventId || null,
      external_url: payload.externalUrl || null,
      metadata: payload.metadata || {},
      is_public: payload.isPublic ?? true,
    });

    if (error) {
      console.error('Failed to record contribution:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error recording contribution:', err);
    return false;
  }
}
