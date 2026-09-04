import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor' && profile.role !== 'contributor')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
    }

    const body = await req.json();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('events')
      .insert({
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        content_mdx: body.content_mdx,
        event_type: body.event_type || 'hackathon',
        status_label: body.status_label || 'Upcoming',
        status: body.status || 'published',
        start_date: body.start_date,
        end_date: body.end_date,
        location_type: body.location_type || 'online',
        location: body.location || 'Discord Stage / Online',
        registration_url: body.registration_url || null,
        rules_mdx: body.rules_mdx || null,
        author_id: user.id,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
