import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug } from '@/lib/data/projects';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { MDXRenderer } from '@/lib/mdx/renderer';
import { AdSlot } from '@/components/ads/AdSlot';
import { Github, ExternalLink, Star, GitFork, AlertCircle, ArrowLeft } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
            >
              <Github className="h-4 w-4" /> GITHUB_REPO
            </a>
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

      {/* Metrics Bar */}
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

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <span key={tech} className="rounded border border-[#27272A] bg-[#121212] px-2 py-0.5 text-[10px] text-[#A1A1AA]">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Project Details MDX */}
      <article className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-10 leading-relaxed space-y-4">
        <MDXRenderer content={project.content_mdx} />
      </article>

      <AdSlot slotId="project-detail-ad" />
    </div>
  );
}
