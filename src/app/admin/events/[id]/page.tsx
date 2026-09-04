import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { EventForm } from '@/components/admin/EventForm';
import { ArrowLeft } from 'lucide-react';
import type { Event } from '@/lib/data/events';

export const dynamic = 'force-dynamic';

interface AdminEditEventProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditEventPage({ params }: AdminEditEventProps) {
  const { id } = await params;
  const adminSupabase = createAdminClient();

  const { data: event, error } = await adminSupabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#22C55E] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_EVENTS_LIST
      </Link>

      <TerminalHeader
        title="EDIT_EVENT_RECORD"
        subtitle={`Updating event metadata for ${event.title}`}
      />

      <EventForm initialEvent={event as Event} />
    </div>
  );
}
