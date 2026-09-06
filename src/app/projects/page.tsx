import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedProjects } from '@/lib/data/projects';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { ProjectsExplorer } from '@/components/projects/ProjectsExplorer';
import { IssueSwipeShowcase } from '@/components/showcase/IssueSwipeShowcase';
import { AdSlot } from '@/components/ads/AdSlot';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Native Open Source Projects Explorer',
  description: 'Discover and contribute to official Omnikon open-source tools, infrastructure libraries, and hackathon projects.',
  canonicalUrl: '/projects',
});

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="PROJECTS"
        subtitle="Native open-source repositories, developer tools, and community-built projects."
      />

      {/* Flagship IssueSwipe & Mentorship Showcase */}
      <IssueSwipeShowcase showQuizMilestone={false} />

      {/* Repositories Explorer with Labels & Live Metrics */}
      <div className="space-y-4 pt-4">
        <h3 className="font-mono-terminal text-lg font-bold text-white flex items-center gap-2">
          <span className="text-[#38BDF8]">&gt;</span> ALL_REPOSITORIES ({projects.length})
        </h3>
        <ProjectsExplorer projects={projects} />
      </div>

      <AdSlot slotId="projects-list-ad" />
    </div>
  );
}
