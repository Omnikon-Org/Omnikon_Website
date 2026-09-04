import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublicContributions } from '@/lib/data/contributions';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { ContributionTimeline } from '@/components/profile/ContributionTimeline';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Live Community Activity & Ecosystem Feed',
  description: 'Real-time open-source contribution feed, hackathon participation milestones, and technical publications across Omnikon.',
  canonicalUrl: '/activity',
});

export default async function ActivityFeedPage() {
  const contributions = await getPublicContributions(30);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="COMMUNITY_ACTIVITY"
        subtitle="Live stream of verified pull requests, good first issues, hackathon registrations, and publications across Omnikon."
      />

      {contributions.length === 0 ? (
        <EmptyState
          title="NO_ACTIVITY_LOGGED"
          message="No public ecosystem activity recorded in the database yet. Activity from registered members and open-source contributors will appear here."
          actionLabel="EXPLORE_PROJECTS"
          actionHref="/projects"
        />
      ) : (
        <div className="space-y-6">
          <ContributionTimeline contributions={contributions} />
        </div>
      )}

      <AdSlot slotId="activity-feed-ad" />
    </div>
  );
}
