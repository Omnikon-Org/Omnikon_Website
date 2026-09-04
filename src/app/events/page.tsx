import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getFilteredEvents, getEventRecaps, type Event } from '@/lib/data/events';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { 
  Calendar, 
  Trophy, 
  ArrowRight, 
  Radio, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Community Events, Hackathons & Workshops',
  description: 'Join hackathons, compete in technical quizzes, attend workshops, build projects, and grow with the Omnikon community.',
  canonicalUrl: '/events',
});

interface EventsPageProps {
  searchParams: Promise<{ type?: string }>;
}

const EVENT_TYPE_TABS = [
  { id: 'ALL', label: 'ALL_ACTIVITIES' },
  { id: 'HACKATHON', label: 'HACKATHONS' },
  { id: 'QUIZ', label: 'TECHNICAL_QUIZZES' },
  { id: 'WORKSHOP', label: 'WORKSHOPS' },
  { id: 'COMPETITION', label: 'CODING_COMPETITIONS' },
  { id: 'COMMUNITY', label: 'COMMUNITY_SESSIONS' },
];

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { type = 'ALL' } = await searchParams;

  const [activeEvents, upcomingEvents, pastEvents, recaps] = await Promise.all([
    getFilteredEvents(type, 'active'),
    getFilteredEvents(type, 'upcoming'),
    getFilteredEvents(type, 'past'),
    getEventRecaps(),
  ]);

  const hasAnyEvents = activeEvents.length > 0 || upcomingEvents.length > 0 || pastEvents.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <TerminalHeader
        title="WHAT'S HAPPENING AT OMNIKON"
        subtitle="Join hackathons, compete in technical quizzes, attend workshops, build projects, and grow with the Omnikon student developer community."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
            >
              <Calendar className="h-4 w-4 text-[#38BDF8]" /> COMMUNITY_CALENDAR
            </Link>
            <Link
              href="/quizzes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              <Zap className="h-4 w-4" /> TAKE_A_QUIZ
            </Link>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#27272A] pb-3 scrollbar-none font-mono-terminal text-xs">
        {EVENT_TYPE_TABS.map((tab) => {
          const isSelected = type.toUpperCase() === tab.id;
          const targetUrl = tab.id === 'ALL' ? '/events' : `/events?type=${tab.id}`;

          return (
            <Link
              key={tab.id}
              href={targetUrl}
              className={`px-3 py-1.5 rounded-md border whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#22C55E] text-[#050505] border-[#22C55E] font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#22C55E]/50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {!hasAnyEvents ? (
        <EmptyState
          title="NO_EVENTS_IN_CATEGORY"
          message={`No events found matching category filter "${type}". Browse other active community tracks or view all activities.`}
          actionLabel="RESET_FILTERS"
          actionHref="/events"
        />
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: ACTIVE & LIVE NOW */}
          {activeEvents.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#22C55E]/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
                  </span>
                  <h2 className="font-mono-terminal text-lg font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[#22C55E]" /> Live Now & Registration Open ({activeEvents.length})
                  </h2>
                </div>
                <span className="font-mono-terminal text-xs text-[#22C55E] font-bold">HAPPENING_TODAY</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEvents.map((event) => (
                  <EventCard key={event.id} event={event} isLive />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: UPCOMING ACTIVITIES */}
          {upcomingEvents.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <h2 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#38BDF8]" /> Upcoming Schedule ({upcomingEvents.length})
                </h2>
                <span className="font-mono-terminal text-xs text-[#A1A1AA]">Chronological Roadmap</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: PAST EVENTS & RECAPS */}
          {pastEvents.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <h2 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#EAB308]" /> Past Events Archive ({pastEvents.length})
                </h2>
                <span className="font-mono-terminal text-xs text-[#A1A1AA]">Completed Milestones</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} isPast />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* SECTION 4: HACKATHON RECAPS */}
      {recaps.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-[#27272A]">
          <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
            <Trophy className="h-5 w-5 text-[#EAB308]" />
            <h2 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider">
              Hackathon Winners & Recaps
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
        </section>
      )}

      <AdSlot slotId="events-list-ad" />
    </div>
  );
}

function EventCard({ event, isLive = false, isPast = false }: { event: Event; isLive?: boolean; isPast?: boolean }) {
  const isHackathon = event.event_type.toLowerCase().includes('hackathon');
  const accentColor = isLive ? 'green' : isHackathon ? 'red' : 'cyan';

  return (
    <GlowCard accentColor={accentColor} className="flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 font-mono-terminal text-[11px]">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold border border-[#22C55E]/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE NOW
              </span>
            ) : isPast ? (
              <span className="text-[#A1A1AA] font-bold uppercase">COMPLETED</span>
            ) : (
              <StatusBadge status={event.status_label || 'Upcoming'} />
            )}
          </div>
          <span className="text-white uppercase font-bold tracking-wider">
            {event.event_type}
          </span>
        </div>

        <h3 className="font-mono-terminal text-lg font-bold text-white hover:text-[#22C55E] transition-colors line-clamp-2">
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>

        <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
          {event.summary}
        </p>
      </div>

      <div className="pt-4 border-t border-[#27272A] space-y-3 font-mono-terminal text-xs">
        <div className="space-y-1.5 text-[11px] text-[#A1A1AA]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-white">
              <Calendar className="h-3.5 w-3.5 text-[#38BDF8]" /> {formatDate(event.start_date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#22C55E]" /> {event.location || 'Online'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-[#A1A1AA]" /> {event.registrations_count || 0} Registered
            </span>
            {event.location_type && (
              <span className="uppercase text-[#38BDF8] font-bold">{event.location_type}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {event.registration_url && !isPast ? (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22C55E] font-bold flex items-center gap-1 hover:underline"
            >
              PORTAL <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span />
          )}

          <Link
            href={`/events/${event.slug}`}
            className="font-bold text-[#22C55E] flex items-center gap-1 hover:underline"
          >
            {isPast ? 'VIEW_RECAP' : 'EXPLORE_EVENT'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}
