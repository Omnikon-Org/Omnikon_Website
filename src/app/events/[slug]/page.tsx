import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, getEventRecaps } from '@/lib/data/events';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { MDXRenderer } from '@/lib/mdx/renderer';
import { GlowCard } from '@/components/content/GlowCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { Calendar, ExternalLink, ArrowLeft, Trophy } from 'lucide-react';

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
    title: event.seo_title || `${event.title} — Hackathon & Event`,
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

  const recaps = await getEventRecaps(event.id);

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
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
          event.registration_url ? (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              REGISTER_NOW <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : undefined
        }
      />

      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-4">
          <StatusBadge status={event.status_label || 'Upcoming'} />
          <span className="flex items-center gap-1.5 text-white">
            <Calendar className="h-4 w-4 text-[#22C55E]" />
            {formatDate(event.start_date)} &mdash; {formatDate(event.end_date)}
          </span>
        </div>

        <span className="uppercase text-[#22C55E] font-bold">{event.event_type}</span>
      </div>

      {/* Event Details MDX */}
      <article className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-10 leading-relaxed space-y-4">
        <MDXRenderer content={event.content_mdx} />
      </article>

      {/* Event Recaps Section */}
      {recaps.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-mono-terminal text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#EAB308]" /> Event Recaps & Winners
          </h3>
          {recaps.map((recap) => (
            <GlowCard key={recap.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono-terminal text-xs font-bold text-[#EAB308]">
                  WINNER: {recap.winner_team_name || 'Team Champion'}
                </span>
                <span className="font-mono-terminal text-[11px] text-[#A1A1AA]">
                  {formatDate(recap.published_at)}
                </span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white">{recap.title}</h4>
              <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">{recap.summary}</p>
            </GlowCard>
          ))}
        </div>
      )}

      <AdSlot slotId="event-detail-ad" />
    </div>
  );
}
