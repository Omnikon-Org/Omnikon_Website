import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublicContributions } from '@/lib/data/contributions';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { ContributionTimeline } from '@/components/profile/ContributionTimeline';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { Radio, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Live Community Activity & Ecosystem Feed',
  description: 'Real-time open-source contribution feed, pull requests, and live commit activity across Omnikon-Org.',
  canonicalUrl: '/activity',
});

export default async function ActivityFeedPage() {
  const contributions = await getPublicContributions(50);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="COMMUNITY_ACTIVITY"
        subtitle="Live stream of verified pull requests, commits, good first issues, and discussions across Omnikon."
      />

      {/* Live Stream Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-[#22C55E] font-bold">LIVE STREAM ACTIVE</span>
          <span className="text-[#71717A]">|</span>
          <span className="text-[#A1A1AA]">Omnikon-Org GitHub Event Pipeline</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[#71717A]">
          <span>{contributions.length} EVENTS STREAMED</span>
        </div>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          title="NO_ACTIVITY_LOGGED"
          message="No public ecosystem activity recorded yet. Live repository events from Omnikon-Org will stream here."
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
