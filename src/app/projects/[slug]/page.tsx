import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug } from '@/lib/data/projects';
import { getGithubIssuesForRepo } from '@/lib/data/github';
import { getRelatedProjects, getRelatedArticles } from '@/lib/data/recommendations';
import { IssueSwipe } from '@/components/github/IssueSwipe';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { MDXRenderer } from '@/lib/mdx/renderer';
import { RelatedContent } from '@/components/discovery/RelatedContent';
import { AdSlot } from '@/components/ads/AdSlot';
import { Github, ExternalLink, Star, GitFork, AlertCircle, ArrowLeft, GitPullRequest, BookOpen, Sparkles } from 'lucide-react';
import { ViewLogger } from '@/components/analytics/ViewLogger';
import { AnalyticsLink } from '@/components/analytics/AnalyticsLink';

export const dynamic = 'force-dynamic';

interface ProjectDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return constructMetadata({ title: 'Project Not Found', noIndex: true });
  }

  return constructMetadata({
    title: project.seo_title || `${project.name} — Open Source Project`,
    description: project.seo_description || project.summary,
    image: project.og_image || project.featured_image || SITE_CONFIG.ogImage,
    canonicalUrl: project.canonical_url || `${SITE_CONFIG.url}/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [issues, relatedProjects, relatedArticles] = await Promise.all([
    getGithubIssuesForRepo(project.github_repo_name),
    getRelatedProjects(project.id),
    getRelatedArticles(project.id),
  ]);

  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.summary,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    downloadUrl: project.repository_url,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.legalName,
    },
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Projects', item: '/projects' },
    { name: project.name, item: `/projects/${project.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewLogger entityType="project_view" entityId={project.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#38BDF8] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_PROJECTS
      </Link>

      <TerminalHeader
        title={project.name}
        subtitle={project.summary}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <AnalyticsLink
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              entityType="project_github_click"
              entityId={project.id}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
            >
              <Github className="h-4 w-4" /> VIEW_ON_GITHUB
            </AnalyticsLink>
            <AnalyticsLink
              href={`${project.repository_url}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              entityType="contribution_cta_click"
              entityId={project.id}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              <GitPullRequest className="h-4 w-4" /> CONTRIBUTE_TO_PROJECT
            </AnalyticsLink>
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#38BDF8] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#38BDF8]/90 transition-all"
              >
                LIVE_DEMO <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        }
      />

      {/* Metrics & Difficulty Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-[#EAB308]">
            <Star className="h-4 w-4 fill-[#EAB308]" />
            {project.stars_count} Stars
          </span>
          <span className="flex items-center gap-1 text-[#38BDF8]">
            <GitFork className="h-4 w-4" />
            {project.forks_count} Forks
          </span>
          <span className="flex items-center gap-1 text-[#FF3131]">
            <AlertCircle className="h-4 w-4" />
            {project.open_issues_count} Open Issues
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] text-[11px] font-bold">
            <Sparkles className="h-3.5 w-3.5" /> GOOD_FIRST_ISSUES_AVAILABLE
          </span>
        </div>
      </div>

      {/* Tech Stack List */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 font-mono-terminal text-xs">
          <span className="text-[#A1A1AA] uppercase">TECH_STACK:</span>
          {project.tech_stack.map((tech) => (
            <span key={tech} className="rounded border border-[#27272A] bg-[#121212] px-2.5 py-1 text-[11px] text-white">
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Project Overview & Documentation MDX */}
      <article className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-10 leading-relaxed space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#27272A] font-mono-terminal text-xs text-[#38BDF8] font-bold uppercase">
          <BookOpen className="h-4 w-4" /> REPOSITORY_DOCUMENTATION
        </div>
        <MDXRenderer content={project.content_mdx} />
      </article>

      {/* Contribution Guidelines Box */}
      <div className="rounded-xl border border-[#27272A] bg-gradient-to-r from-[#0A0A0A] via-[#121212] to-[#0A0A0A] p-6 font-mono-terminal text-xs space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <GitPullRequest className="h-4 w-4 text-[#22C55E]" /> Contribution Guidelines & Workflow
        </div>
        <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
          All Omnikon projects are hosted on GitHub under the <span className="text-[#38BDF8] font-bold">Omnikon-Org</span> organization. To contribute, fork the repository, pick a good first issue, follow the contributor guidelines in the repository README, and submit a pull request for maintainer code review.
        </p>
        <div className="pt-2">
          <a
            href={`${project.repository_url}#contributing`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#22C55E] hover:underline"
          >
            READ_CONTRIBUTING_GUIDE <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Dynamic Good First Issues List */}
      {issues && issues.length > 0 && (
        <div className="pt-6 border-t border-[#27272A]">
          <IssueSwipe issues={issues} projectId={project.id} />
        </div>
      )}

      {/* Recommendations */}
      <RelatedContent projects={relatedProjects} articles={relatedArticles} />

      <AdSlot slotId="project-detail-ad" />
    </div>
  );
}
