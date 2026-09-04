import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedProjects } from '@/lib/data/projects';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { Github, ExternalLink, Star, GitFork, AlertCircle, ArrowRight } from 'lucide-react';

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

      {projects.length === 0 ? (
        <EmptyState
          title="NO_PROJECTS_FOUND"
          message="No published open-source projects currently registered in the database."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <GlowCard key={project.id} accentColor="cyan" className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-terminal text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                    {project.github_repo_name}
                  </span>
                  {project.is_featured && <StatusBadge status="featured" />}
                </div>

                <h2 className="font-mono-terminal text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                  <Link href={`/projects/${project.slug}`}>{project.name}</Link>
                </h2>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                  {project.summary}
                </p>

                {/* Tech Stack Badges */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-[#27272A] bg-[#121212] px-2 py-0.5 font-mono-terminal text-[10px] text-[#A1A1AA]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#27272A] space-y-3">
                {/* Repository Metrics */}
                <div className="flex items-center justify-between font-mono-terminal text-xs text-[#A1A1AA]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#EAB308]">
                      <Star className="h-3.5 w-3.5 fill-[#EAB308]" />
                      {project.stars_count}
                    </span>
                    <span className="flex items-center gap-1 text-[#38BDF8]">
                      <GitFork className="h-3.5 w-3.5" />
                      {project.forks_count}
                    </span>
                    <span className="flex items-center gap-1 text-[#FF3131]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {project.open_issues_count}
                    </span>
                  </div>

                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A1A1AA] hover:text-white transition-colors"
                    aria-label={`GitHub repository for ${project.name}`}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {project.demo_url ? (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono-terminal text-xs text-[#38BDF8] flex items-center gap-1 hover:underline"
                    >
                      LIVE_DEMO <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span />
                  )}

                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-mono-terminal text-xs font-bold text-[#38BDF8] flex items-center gap-1 hover:underline"
                  >
                    DETAILS <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}

      <AdSlot slotId="projects-list-ad" />
    </div>
  );
}
