import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { stringToUuid } from '@/lib/utils/uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, providerId, githubToken, githubUsername } = body;

    if (!uid || typeof uid !== 'string' || !email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required user parameters' }, { status: 400 });
    }

    // Convert string Firebase UID to valid PostgreSQL UUID
    const targetUuid = stringToUuid(uid);
    const supabaseAdmin = createAdminClient();

    // 1. Ensure user entry exists in auth.users via Admin API (prevents profiles_id_fkey violation)
    try {
      const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        id: targetUuid,
        email: email.trim().toLowerCase(),
        email_confirm: true,
        user_metadata: { full_name: displayName || '', avatar_url: photoURL || '' },
      });

      if (createUserError && !createUserError.message.includes('already registered') && !createUserError.message.includes('already exists')) {
        console.warn('Admin createUser notice:', createUserError.message);
      }
    } catch (createErr) {
      console.warn('Admin createUser exception:', createErr);
    }

    // 2. Check if user profile already exists in public.profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, avatar_url, github_username, role, developer_tier')
      .eq('id', targetUuid)
      .maybeSingle();

    // 3. Derive username safely ensuring unique username constraint is satisfied without collision
    let derivedUsername = existingProfile?.username;
    if (!derivedUsername) {
      const rawBase = githubUsername 
        ? githubUsername.toLowerCase()
        : (displayName || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 18);

      const baseUsername = rawBase.length >= 3 ? rawBase : `dev_${rawBase}`;
      let candidateUsername = `${baseUsername}_${targetUuid.slice(0, 4)}`;

      // Verify username uniqueness to avoid unique constraint violations
      const { data: usernameOccupied } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', candidateUsername)
        .maybeSingle();

      if (usernameOccupied && usernameOccupied.id !== targetUuid) {
        candidateUsername = `${baseUsername}_${Date.now().toString(36).slice(-4)}`;
      }

      derivedUsername = candidateUsername;
    }

    const updatedFullName = (displayName && typeof displayName === 'string') 
      ? displayName 
      : existingProfile?.full_name || email.split('@')[0];

    const updatedAvatarUrl = (photoURL && typeof photoURL === 'string')
      ? photoURL
      : existingProfile?.avatar_url || null;

    const updatedGithubUsername = (githubUsername && typeof githubUsername === 'string')
      ? githubUsername
      : existingProfile?.github_username || null;

    // 4. Safe upsert into Supabase `profiles` table
    let upsertResult = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: targetUuid,
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

    if (upsertResult.error && upsertResult.error.message.includes('profiles_id_fkey')) {
      console.warn('Handling foreign key constraint fallback...');
      try {
        await supabaseAdmin.rpc('sync_external_auth_user', {
          p_id: targetUuid,
          p_email: email.trim().toLowerCase(),
          p_raw_user_meta_data: { full_name: updatedFullName, avatar_url: updatedAvatarUrl },
        });

        upsertResult = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: targetUuid,
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
      } catch (retryErr) {
        console.error('Retry failed:', retryErr);
      }
    }

    if (upsertResult.error) {
      console.error('Error upserting Supabase profile:', upsertResult.error);
      return NextResponse.json({ error: upsertResult.error.message }, { status: 500 });
    }

    // 5. Set session cookies for Next.js app session
    const response = NextResponse.json({
      success: true,
      profile: upsertResult.data,
      githubToken: githubToken || null,
    });

    response.cookies.set('omnikon_user_id', targetUuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (githubToken && typeof githubToken === 'string') {
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
