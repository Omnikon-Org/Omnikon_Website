import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, providerId, githubToken, githubUsername } = body;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required user parameters' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Check if user profile already exists by id (or uid)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, avatar_url, github_username, role, developer_tier')
      .eq('id', uid)
      .maybeSingle();

    // Derive username from email or displayName or githubUsername
    let derivedUsername = existingProfile?.username;
    if (!derivedUsername) {
      if (githubUsername) {
        derivedUsername = githubUsername.toLowerCase();
      } else {
        const base = (displayName || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20);
        derivedUsername = `${base}_${uid.slice(0, 5)}`;
      }
    }

    const updatedFullName = displayName || existingProfile?.full_name || email.split('@')[0];
    const updatedAvatarUrl = photoURL || existingProfile?.avatar_url || null;
    const updatedGithubUsername = githubUsername || existingProfile?.github_username || null;

    // 2. Upsert profile into Supabase `profiles` table
    const { data: upsertedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: uid,
        username: derivedUsername,
        full_name: updatedFullName,
        avatar_url: updatedAvatarUrl,
        github_username: updatedGithubUsername,
        role: existingProfile?.role || 'contributor',
        developer_tier: existingProfile?.developer_tier || 'builder',
        is_public: true,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      console.error('Error upserting Supabase profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 3. Create response and set session cookie for Next.js app session
    const response = NextResponse.json({
      success: true,
      profile: upsertedProfile,
      githubToken: githubToken || null,
    });

    // Store firebase user id and token in secure cookies so server components can authenticate
    response.cookies.set('omnikon_user_id', uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (githubToken) {
      response.cookies.set('github_oauth_token', githubToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
