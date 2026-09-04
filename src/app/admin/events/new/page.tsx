import React from 'react';
import Link from 'next/link';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { EventForm } from '@/components/admin/EventForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewAdminEventPage() {
  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#22C55E] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_EVENTS_LIST
      </Link>

      <TerminalHeader
        title="CREATE_NEW_EVENT"
        subtitle="Publish a new hackathon, technical workshop, coding competition, or community session."
      />

      <EventForm />
    </div>
  );
}
