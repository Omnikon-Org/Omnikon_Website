import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();

    if (!session.user || !session.profile) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const profile = session.profile;
    const isAllowed =
      profile.role === 'admin' ||
      profile.role === 'editor' ||
      profile.role === 'contributor' ||
      profile.is_co_founder ||
      profile.is_core_team;

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Forbidden. Announcements can only be posted by co-founders, core team, or authorized members.' },
        { status: 403 }
      );
    }

    const { title, content_mdx, link_url } = await req.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!content_mdx || typeof content_mdx !== 'string' || content_mdx.trim().length === 0) {
      return NextResponse.json({ error: 'Details content is required.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('updates')
      .insert({
        title: title.trim(),
        content_mdx: content_mdx.trim(),
        link_url: link_url && typeof link_url === 'string' ? link_url.trim() : null,
        author_id: profile.id,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error inserting update announcement:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      update: updateData,
      message: 'Announcement published successfully to Activity Feed!',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish announcement.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
