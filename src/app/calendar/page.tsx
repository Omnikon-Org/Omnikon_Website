import React from 'react';
import type { Metadata } from 'next';
import { getPublishedEvents } from '@/lib/data/events';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AdSlot } from '@/components/ads/AdSlot';
import { ViewLogger } from '@/components/analytics/ViewLogger';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Community Calendar & Hackathon Roadmap',
  description: 'Chronological timeline of upcoming hackathons, technical quizzes, developer workshops, and open-source sync sessions across Omnikon.',
  canonicalUrl: '/calendar',
});

export default async function CommunityCalendarPage() {
  const events = await getPublishedEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewLogger entityType="calendar_view" entityId="00000000-0000-0000-0000-000000000000" />

      <TerminalHeader
        title="COMMUNITY_CALENDAR"
        subtitle="Chronological timeline of upcoming hackathons, technical quizzes, engineering workshops, and open-source contribution sprints."
      />

      <CalendarView events={events} />

      <AdSlot slotId="calendar-ad" />
    </div>
  );
}
