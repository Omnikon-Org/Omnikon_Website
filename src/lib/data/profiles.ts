import { createClient } from '@/lib/supabase/server';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  discord_username: string | null;
  website_url: string | null;
  role: 'member' | 'contributor' | 'editor' | 'admin';
  developer_tier: 'student' | 'learner' | 'builder' | 'contributor' | 'maintainer';
  is_ambassador: boolean;
  skills: string[];
  technical_interests: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPublicProfiles(): Promise<Profile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, github_username, discord_username, website_url, role, developer_tier, is_ambassador, skills, technical_interests, is_public, created_at, updated_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch profiles:', error.message);
      return [];
    }

    return (data || []) as Profile[];
  } catch (err) {
    console.error('Unexpected error fetching profiles:', err);
    return [];
  }
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, github_username, discord_username, website_url, role, developer_tier, is_ambassador, skills, technical_interests, is_public, created_at, updated_at')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch profile for username ${username}:`, error.message);
      return null;
    }

    return data as Profile | null;
  } catch (err) {
    console.error(`Unexpected error fetching profile for ${username}:`, err);
    return null;
  }
}
