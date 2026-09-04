import React from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/data/articles';
import type { Project } from '@/lib/data/projects';
import type { Event } from '@/lib/data/events';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { BookOpen, Code, Calendar, ArrowRight, Star } from 'lucide-react';

interface RelatedContentProps {
  articles?: Article[];
  projects?: Project[];
  events?: Event[];
}

export function RelatedContent({ articles = [], projects = [], events = [] }: RelatedContentProps) {
  const hasItems = articles.length > 0 || projects.length > 0 || events.length > 0;

  if (!hasItems) {
    return null;
  }

  return (
    <div className="space-y-6 pt-6 border-t border-[#27272A] font-mono-terminal text-xs">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        EXPLORE_RELATED_CONTENT
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((art) => (
          <GlowCard key={art.id} className="flex flex-col justify-between space-y-3 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={art.type} />
                <span className="text-[11px] text-[#FF3131] flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Technical Article
                </span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white hover:text-[#FF3131] transition-colors line-clamp-1">
                <Link href={`/blogs/${art.slug}`}>{art.title}</Link>
              </h4>
              <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                {art.summary}
              </p>
            </div>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[#A1A1AA] text-[10px]">{formatDate(art.published_at || art.created_at)}</span>
              <Link href={`/blogs/${art.slug}`} className="text-[#FF3131] font-bold hover:underline flex items-center gap-1">
                READ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </GlowCard>
        ))}

        {projects.map((proj) => (
          <GlowCard key={proj.id} accentColor="cyan" className="flex flex-col justify-between space-y-3 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#38BDF8]">{proj.github_repo_name}</span>
                <span className="text-[11px] text-[#38BDF8] flex items-center gap-1">
                  <Code className="h-3 w-3" /> Repository
                </span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white hover:text-[#38BDF8] transition-colors line-clamp-1">
                <Link href={`/projects/${proj.slug}`}>{proj.name}</Link>
              </h4>
              <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                {proj.summary}
              </p>
            </div>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[#EAB308] flex items-center gap-1 text-[10px]">
                <Star className="h-3 w-3 fill-[#EAB308]" /> {proj.stars_count} Stars
              </span>
              <Link href={`/projects/${proj.slug}`} className="text-[#38BDF8] font-bold hover:underline flex items-center gap-1">
                DETAILS <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </GlowCard>
        ))}

        {events.map((ev) => (
          <GlowCard key={ev.id} accentColor="green" className="flex flex-col justify-between space-y-3 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={ev.status_label || 'Upcoming'} />
                <span className="text-[11px] text-[#22C55E] flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Event
                </span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white hover:text-[#22C55E] transition-colors line-clamp-1">
                <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
              </h4>
              <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                {ev.summary}
              </p>
            </div>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[#A1A1AA] text-[10px]">{formatDate(ev.start_date)}</span>
              <Link href={`/events/${ev.slug}`} className="text-[#22C55E] font-bold hover:underline flex items-center gap-1">
                VIEW <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
