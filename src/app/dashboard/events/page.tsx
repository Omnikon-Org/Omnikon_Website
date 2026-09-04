import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserRegistrations } from '@/lib/data/registrations';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { formatDate } from '@/lib/utils';
import { Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardEventsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const registrations = await getUserRegistrations(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#38BDF8] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_DASHBOARD
      </Link>

      <TerminalHeader
        title="EVENT_REGISTRATIONS"
        subtitle="Manage your confirmed hackathons, competitions, and developer workshops."
      />

      {registrations.length === 0 ? (
        <EmptyState
          title="NO_EVENT_REGISTRATIONS"
          message="You have not registered for any upcoming hackathons or events yet."
          actionLabel="EXPLORE_ACTIVE_EVENTS"
          actionHref="/events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => {
            const ev = reg.event;
            if (!ev) return null;

            return (
              <GlowCard key={reg.id} accentColor="green" className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={ev.status_label || 'Upcoming'} />
                    <span className="font-mono-terminal text-[11px] text-[#22C55E] uppercase font-bold">
                      {ev.event_type}
                    </span>
                  </div>

                  <h3 className="font-mono-terminal text-lg font-bold text-white hover:text-[#22C55E] transition-colors">
                    <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                  </h3>

                  <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {ev.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#27272A] space-y-3 font-mono-terminal text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#22C55E]" />
                      Start: {formatDate(ev.start_date)}
                    </span>
                    <span>Status: <strong className="text-[#22C55E] uppercase">{reg.status}</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#A1A1AA]">
                      Registered {formatDate(reg.created_at)}
                    </span>
                    <Link
                      href={`/events/${ev.slug}`}
                      className="font-bold text-[#22C55E] flex items-center gap-1 hover:underline"
                    >
                      VIEW_EVENT <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
