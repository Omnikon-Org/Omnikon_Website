import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Edit, Users, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const adminSupabase = createAdminClient();

  const { data: events } = await adminSupabase
    .from('events')
    .select(`
      *,
      event_registrations(count)
    `)
    .order('created_at', { ascending: false });

  const eventList = (events || []).map((ev: any) => ({
    ...ev,
    registrations_count: ev.event_registrations?.[0]?.count || 0,
  }));

  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <TerminalHeader
        title="EVENT_MANAGEMENT"
        subtitle="Create and administer hackathons, workshops, coding competitions, and community sessions."
        action={
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <Plus className="h-4 w-4" /> CREATE_EVENT
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        <table className="w-full text-left">
          <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA] uppercase text-[10px]">
            <tr>
              <th className="p-3.5">EVENT_TITLE</th>
              <th className="p-3.5">TYPE</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5">DATES</th>
              <th className="p-3.5">LOCATION</th>
              <th className="p-3.5 text-center">REGISTRATIONS</th>
              <th className="p-3.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {eventList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#A1A1AA]">
                  No events registered in system.
                </td>
              </tr>
            ) : (
              eventList.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3.5 font-bold text-white max-w-[220px] truncate">
                    <Link href={`/events/${ev.slug}`} className="hover:text-[#38BDF8]" target="_blank">
                      {ev.title}
                    </Link>
                  </td>
                  <td className="p-3.5 uppercase text-[#38BDF8]">{ev.event_type}</td>
                  <td className="p-3.5">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="p-3.5 text-[#A1A1AA] whitespace-nowrap">
                    {formatDate(ev.start_date)}
                  </td>
                  <td className="p-3.5 text-[#A1A1AA]">{ev.location || 'Online'}</td>
                  <td className="p-3.5 text-center text-[#22C55E] font-bold">
                    {ev.registrations_count}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/events/${ev.id}`}
                      className="inline-flex items-center gap-1 text-[#38BDF8] hover:underline"
                    >
                      <Edit className="h-3 w-3" /> EDIT
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
