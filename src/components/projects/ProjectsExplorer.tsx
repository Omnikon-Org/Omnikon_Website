'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { 
  Github, 
  ExternalLink, 
  Star, 
  GitFork, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Tag, 
  Sparkles,
  Layers
} from 'lucide-react';
import type { Project } from '@/lib/data/projects';

interface ProjectsExplorerProps {
  projects: Project[];
}

export function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Collect top tags/labels across all projects
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    projects.forEach((p) => {
      if (p.program_tag) {
        tagCounts.set(p.program_tag, (tagCounts.get(p.program_tag) || 0) + 1);
      }
      p.tech_stack.forEach((t) => {
        // filter out overly generic single-letter noise
        if (t.length > 1) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
      });
    });

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    return ['ALL', ...sortedTags.slice(0, 10)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech_stack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === 'ALL' ||
        project.program_tag?.toLowerCase() === selectedTag.toLowerCase() ||
        project.tech_stack.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [projects, searchQuery, selectedTag]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Tag filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search projects by name, language, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#27272A] rounded-lg font-mono-terminal text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#38BDF8] transition-colors"
          />
        </div>

        {/* Live Project Count Indicator */}
        <div className="flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span>{filteredProjects.length} REPOSITORIES FOUND</span>
        </div>
      </div>

      {/* Label / Topic Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-mono-terminal text-xs text-[#71717A] flex items-center gap-1 mr-1">
          <Tag className="h-3 w-3" /> LABELS:
        </span>
        {availableTags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`font-mono-terminal text-[11px] px-2.5 py-1 rounded-md transition-all uppercase tracking-wider ${
                isSelected
                  ? 'bg-[#38BDF8] text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : 'bg-[#121212] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#38BDF8]/40'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="NO_MATCHING_PROJECTS"
          message={`No projects match your filter query "${searchQuery || selectedTag}". Try searching for another topic or resetting filters.`}
          actionLabel="CLEAR_FILTERS"
          onAction={() => {
            setSearchQuery('');
            setSelectedTag('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <GlowCard key={project.id} accentColor="cyan" className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-terminal text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                    {project.github_repo_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {project.program_tag && (
                      <span className="font-mono-terminal text-[10px] font-bold px-2 py-0.5 rounded border border-[#A855F7]/50 bg-[#A855F7]/10 text-[#C084FC]">
                        {project.program_tag}
                      </span>
                    )}
                    {project.is_featured && <StatusBadge status="featured" />}
                  </div>
                </div>

                <h2 className="font-mono-terminal text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                  <Link href={`/projects/${project.slug}`}>{project.name}</Link>
                </h2>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                  {project.summary}
                </p>

                {/* Topics / Labels Badges */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tech_stack.slice(0, 6).map((tech) => {
                      const isMentorship = tech.includes('gssoc') || tech.includes('soc');
                      const isGoodFirst = tech.includes('first') || tech.includes('help');
                      return (
                        <button
                          key={tech}
                          onClick={() => setSelectedTag(tech)}
                          className={`rounded border px-2 py-0.5 font-mono-terminal text-[10px] transition-colors ${
                            isMentorship
                              ? 'border-[#A855F7]/40 bg-[#A855F7]/10 text-[#C084FC] hover:border-[#A855F7]'
                              : isGoodFirst
                              ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#4ADE80] hover:border-[#22C55E]'
                              : 'border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#38BDF8]/40'
                          }`}
                        >
                          #{tech}
                        </button>
                      );
                    })}
                    {project.tech_stack.length > 6 && (
                      <span className="font-mono-terminal text-[10px] text-[#71717A] self-center">
                        +{project.tech_stack.length - 6} more
                      </span>
                    )}
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
    </div>
  );
}
