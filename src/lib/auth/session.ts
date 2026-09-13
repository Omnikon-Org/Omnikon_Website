import { cookies } from 'next/headers';
import { createAdminClient, createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function getCurrentUserSession() {
  const cookieStore = await cookies();
  const customUserId = cookieStore.get('omnikon_user_id')?.value;
  const githubToken = cookieStore.get('github_oauth_token')?.value || process.env.GITHUB_TOKEN || '';

  if (customUserId) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', customUserId)
      .maybeSingle();

    if (profile) {
      return {
        user: {
          id: profile.id,
          email: `${profile.username}@omnikon.dev`,
          user_metadata: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            username: profile.username,
          },
        },
        profile,
        githubToken,
      };
    }
  }

  // Fallback to native Supabase auth session if present
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return {
        user,
        profile: profile || null,
        githubToken,
      };
    }
  } catch (err) {
    console.error('Error fetching Supabase session fallback:', err);
  }

  return { user: null, profile: null, githubToken };
}
