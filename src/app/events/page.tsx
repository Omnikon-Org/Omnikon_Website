import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedEvents, getEventRecaps } from '@/lib/data/events';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { Calendar, Trophy, ExternalLink, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Hackathons, Competitions & Event Recaps',
  description: 'Participate in upcoming Omnikon hackathons, explore track guidelines, and review winning team recaps.',
});

export default async function EventsPage() {
  const [events, recaps] = await Promise.all([
    getPublishedEvents(),
    getEventRecaps(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="EVENTS"
        subtitle="Upcoming hackathons, developer meetups, problem statements, and event recaps."
      />

      {/* Section 1: Events & Hackathons */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
          <Calendar className="h-5 w-5 text-[#22C55E]" />
          <h2 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider">
            Hackathons & Competitions
          </h2>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="NO_ACTIVE_EVENTS"
            message="No upcoming hackathons registered in database at this moment."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <GlowCard key={event.id} accentColor="green" className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={event.status_label || 'Upcoming'} />
                    <span className="font-mono-terminal text-[11px] text-[#22C55E] uppercase font-bold">
                      {event.event_type}
                    </span>
                  </div>

                  <h3 className="font-mono-terminal text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors">
                    <Link href={`/events/${event.slug}`}>{event.title}</Link>
                  </h3>

                  <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {event.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#27272A] space-y-3">
                  <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                    <span>Start: {formatDate(event.start_date)}</span>
                    <span>End: {formatDate(event.end_date)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {event.registration_url ? (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-terminal text-xs text-[#22C55E] flex items-center gap-1 hover:underline"
                      >
                        REGISTER <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={`/events/${event.slug}`}
                      className="font-mono-terminal text-xs font-bold text-[#22C55E] flex items-center gap-1 hover:underline"
                    >
                      VIEW_DETAILS <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Event Recaps */}
      {recaps.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
            <Trophy className="h-5 w-5 text-[#EAB308]" />
            <h2 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider">
              Hackathon Winner Recaps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recaps.map((recap) => (
              <GlowCard key={recap.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-terminal text-xs font-bold text-[#EAB308] uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 fill-[#EAB308]" />
                    WINNER: {recap.winner_team_name || 'Team Champion'}
                  </span>
                  <span className="font-mono-terminal text-[11px] text-[#A1A1AA]">
                    {formatDate(recap.published_at)}
                  </span>
                </div>

                <h3 className="font-mono-terminal text-base font-bold text-white">
                  {recap.title}
                </h3>
                <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
                  {recap.summary}
                </p>
              </GlowCard>
            ))}
          </div>
        </div>
      )}

      <AdSlot slotId="events-list-ad" />
    </div>
  );
}
