import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, getEventRecaps, getHackathonProblemStatements } from '@/lib/data/events';
import { checkEventRegistration } from '@/lib/data/registrations';
import { getRelatedEvents } from '@/lib/data/recommendations';
import { createClient } from '@/lib/supabase/server';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { MDXRenderer } from '@/lib/mdx/renderer';
import { GlowCard } from '@/components/content/GlowCard';
import { RelatedContent } from '@/components/discovery/RelatedContent';
import { AdSlot } from '@/components/ads/AdSlot';
import { EventRegistrationButton } from '@/components/events/EventRegistrationButton';
import { formatDate } from '@/lib/utils';
import { 
  Calendar, 
  ExternalLink, 
  ArrowLeft, 
  Trophy, 
  MapPin, 
  Users, 
  Clock, 
  Code2, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  Layers,
  Award
} from 'lucide-react';
import { ViewLogger } from '@/components/analytics/ViewLogger';

export const dynamic = 'force-dynamic';

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return constructMetadata({ title: 'Event Not Found', noIndex: true });
  }

  return constructMetadata({
    title: event.seo_title || `${event.title} — Omnikon Community Event`,
    description: event.seo_description || event.summary,
    image: event.og_image || event.featured_image || SITE_CONFIG.ogImage,
    canonicalUrl: event.canonical_url || `${SITE_CONFIG.url}/events/${event.slug}`,
  });
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [isRegistered, recaps, problemStatements, relatedEvents] = await Promise.all([
    user ? checkEventRegistration(event.id, user.id) : Promise.resolve(false),
    getEventRecaps(event.id),
    getHackathonProblemStatements(event.id),
    getRelatedEvents(event.id),
  ]);

  const isHackathon = event.event_type.toLowerCase().includes('hackathon');

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.location_type === 'online'
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/MixedEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
  };

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Events', item: '/events' },
    { name: event.title, item: `/events/${event.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewLogger entityType={isHackathon ? 'hackathon_view' : 'event_view'} entityId={event.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <Link
        href="/events"
        className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#22C55E] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_EVENTS
      </Link>

      <TerminalHeader
        title={event.title}
        subtitle={event.summary}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <EventRegistrationButton
              eventId={event.id}
              eventTitle={event.title}
              initialIsRegistered={isRegistered}
              isAuthenticated={!!user}
            />
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#22C55E] font-mono-terminal text-xs font-bold transition-all"
              >
                EXTERNAL_PORTAL <ExternalLink className="h-3.5 w-3.5 text-[#22C55E]" />
              </a>
            )}
          </div>
        }
      />

      {/* Event Metrics & Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs text-[#A1A1AA]">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={event.status_label || 'Upcoming'} />
          <span className="flex items-center gap-1.5 text-white">
            <Calendar className="h-4 w-4 text-[#22C55E]" />
            {formatDate(event.start_date)} &mdash; {formatDate(event.end_date)}
          </span>
          <span className="flex items-center gap-1.5 text-white">
            <MapPin className="h-4 w-4 text-[#38BDF8]" />
            {event.location || 'Discord & Online'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#22C55E] font-bold">
            <Users className="h-3.5 w-3.5" /> {event.registrations_count || 0} Registered
          </span>
          <span className="uppercase text-[#FF3131] font-bold px-2 py-0.5 rounded border border-[#FF3131]/40 bg-[#FF3131]/10">
            {event.event_type}
          </span>
        </div>
      </div>

      {/* Main Content & Overview */}
      <article className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-10 leading-relaxed space-y-4 font-mono-terminal text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#27272A] font-mono-terminal text-xs text-[#22C55E] font-bold uppercase">
          <BookOpen className="h-4 w-4" /> EVENT_OVERVIEW_&_DESCRIPTION
        </div>
        <MDXRenderer content={event.content_mdx} />
      </article>

      {/* HACKATHON PROBLEM STATEMENTS */}
      {problemStatements.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3 font-mono-terminal">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#FF3131]" /> Hackathon Problem Statements ({problemStatements.length})
            </h3>
            <span className="text-xs text-[#A1A1AA]">Official Competition Tracks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemStatements.map((prob) => (
              <GlowCard key={prob.id} accentColor="red" className="space-y-3 p-5">
                <div className="flex items-center justify-between font-mono-terminal text-[11px]">
                  <span className="px-2 py-0.5 rounded border border-[#FF3131]/40 bg-[#FF3131]/10 text-[#FF3131] font-bold">
                    TRACK: {prob.category}
                  </span>
                  <span className="text-[#EAB308] font-bold">DIFFICULTY: {prob.difficulty}</span>
                </div>

                <h4 className="font-mono-terminal text-base font-bold text-white">{prob.title}</h4>

                <div className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
                  <MDXRenderer content={prob.description_mdx} />
                </div>

                {prob.reference_links && prob.reference_links.length > 0 && (
                  <div className="pt-2 border-t border-[#27272A] space-y-1 font-mono-terminal text-[11px]">
                    <span className="text-[#A1A1AA] uppercase">STARTER_RESOURCES:</span>
                    <div className="flex flex-wrap gap-2">
                      {prob.reference_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#38BDF8] hover:underline flex items-center gap-1"
                        >
                          {link.title} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </GlowCard>
            ))}
          </div>
        </section>
      )}

      {/* PRIZES & AWARDS SECTION */}
      {event.prizes && event.prizes.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3 font-mono-terminal">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-[#EAB308]" /> Prizes & Ecosystem Recognition
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {event.prizes.map((prize, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs text-center space-y-2 shadow-inner"
              >
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block font-bold">
                  {prize.place}
                </span>
                <div className="text-xl font-extrabold text-[#EAB308]">{prize.amount}</div>
                {prize.description && <p className="font-sans text-[11px] text-[#A1A1AA]">{prize.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RULES & GUIDELINES */}
      {event.rules_mdx && (
        <section className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 space-y-3 font-mono-terminal text-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-[#FF3131]" /> Rules, Eligibility & Submission Guidelines
          </div>
          <div className="font-sans text-xs text-[#A1A1AA] leading-relaxed pt-2 border-t border-[#27272A]">
            <MDXRenderer content={event.rules_mdx} />
          </div>
        </section>
      )}

      {/* Event Recaps Section */}
      {recaps.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-mono-terminal text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#EAB308]" /> Event Recaps & Winners
          </h3>
          {recaps.map((recap) => (
            <GlowCard key={recap.id} className="space-y-3">
              <div className="flex items-center justify-between font-mono-terminal">
                <span className="text-xs font-bold text-[#EAB308]">
                  WINNER: {recap.winner_team_name || 'Team Champion'}
                </span>
                <span className="text-[11px] text-[#A1A1AA]">
                  {formatDate(recap.published_at)}
                </span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white">{recap.title}</h4>
              <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">{recap.summary}</p>
            </GlowCard>
          ))}
        </div>
      )}

      {/* Related Events */}
      <RelatedContent events={relatedEvents} />

      <AdSlot slotId="event-detail-ad" />
    </div>
  );
}
