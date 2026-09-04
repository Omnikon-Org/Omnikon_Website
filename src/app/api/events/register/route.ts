import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to register.' }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId parameter.' }, { status: 400 });
    }

    // Fetch event details to ensure it exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, slug, status')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError || !event || event.status !== 'published') {
      return NextResponse.json({ error: 'Event not found or not open for registration.' }, { status: 404 });
    }

    // Insert event registration (unique constraint prevents duplicates)
    const { error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        status: 'registered',
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Record contribution activity
    await supabase.from('contributions').insert({
      user_id: user.id,
      event_id: eventId,
      type: 'event_registration',
      title: `Registered for ${event.title}`,
      description: `Confirmed participation in hackathon track: ${event.title}`,
      external_url: `/events/${event.slug}`,
      is_public: true,
    });

    return NextResponse.json({ success: true, message: 'Successfully registered for event!' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error during event registration.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId parameter.' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Registration cancelled.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error during cancellation.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
