import { createAdminClient } from '@/lib/supabase/server';
import { env } from '@/lib/supabase/env';

export interface GitHubCacheItem {
  key: string;
  data: Record<string, unknown>;
  etag: string | null;
  last_modified: string | null;
  expires_at: string;
  updated_at: string;
}

export async function getCachedGitHubData(key: string): Promise<Record<string, unknown> | null> {
  // If service role key is unconfigured, return null safely
  if (!env.supabaseServiceRoleKey) {
    return null;
  }

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('github_cache')
      .select('data, expires_at')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Failed to read github_cache for key ${key}:`, error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return data.data;
  } catch (err) {
    console.error(`Unexpected error reading github_cache for key ${key}:`, err);
    return null;
  }
}
