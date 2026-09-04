import React from 'react';
import Link from 'next/link';
import type { Contribution } from '@/lib/data/contributions';
import { formatDate } from '@/lib/utils';
import { 
  GitPullRequest, 
  GitCommit, 
  BookOpen, 
  Calendar, 
  Trophy, 
  Sparkles, 
  ExternalLink,
  Code2
} from 'lucide-react';

interface ContributionTimelineProps {
  contributions: Contribution[];
}

export function ContributionTimeline({ contributions = [] }: ContributionTimelineProps) {
  if (contributions.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA] space-y-2">
        <Code2 className="h-6 w-6 text-[#A1A1AA] mx-auto opacity-60" />
        <p className="font-bold text-white uppercase">NO_CONTRIBUTIONS_LOGGED</p>
        <p>This developer has not logged public ecosystem contributions yet.</p>
      </div>
    );
  }

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'github_pr':
        return <GitPullRequest className="h-4 w-4 text-[#38BDF8]" />;
      case 'issue_contribution':
        return <GitCommit className="h-4 w-4 text-[#22C55E]" />;
      case 'article_submission':
      case 'article_published':
        return <BookOpen className="h-4 w-4 text-[#FF3131]" />;
      case 'event_registration':
      case 'hackathon_participation':
        return <Calendar className="h-4 w-4 text-[#EAB308]" />;
      case 'community_milestone':
        return <Trophy className="h-4 w-4 text-[#EAB308]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#38BDF8]" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'github_pr':
        return 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]';
      case 'issue_contribution':
        return 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]';
      case 'article_submission':
      case 'article_published':
        return 'border-[#FF3131]/40 bg-[#FF3131]/10 text-[#FF3131]';
      case 'event_registration':
      case 'hackathon_participation':
        return 'border-[#EAB308]/40 bg-[#EAB308]/10 text-[#EAB308]';
      case 'community_milestone':
        return 'border-[#EAB308]/40 bg-[#EAB308]/10 text-[#EAB308]';
      default:
        return 'border-[#27272A] bg-[#121212] text-[#A1A1AA]';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#27272A]">
      {contributions.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Icon on Timeline */}
          <div className="absolute -left-[27px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#27272A] bg-[#0A0A0A] group-hover:border-[#FF3131] transition-colors">
            {getContributionIcon(item.type)}
          </div>

          <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#38BDF8]/40 transition-all space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono-terminal text-[10px] font-bold uppercase ${getBadgeColor(item.type)}`}>
                  {item.type.replace(/_/g, ' ')}
                </span>
                {item.project && (
                  <Link
                    href={`/projects/${item.project.slug}`}
                    className="font-mono-terminal text-xs text-[#38BDF8] hover:underline"
                  >
                    @{item.project.name}
                  </Link>
                )}
                {item.event && (
                  <Link
                    href={`/events/${item.event.slug}`}
                    className="font-mono-terminal text-xs text-[#22C55E] hover:underline"
                  >
                    #{item.event.title}
                  </Link>
                )}
              </div>

              <span className="font-mono-terminal text-[11px] text-[#A1A1AA]">
                {formatDate(item.created_at)}
              </span>
            </div>

            <h4 className="font-mono-terminal text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
              {item.title}
            </h4>

            {item.description && (
              <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
                {item.description}
              </p>
            )}

            {item.external_url && (
              <div className="pt-2">
                <a
                  href={item.external_url}
                  target={item.external_url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono-terminal text-xs font-bold text-[#38BDF8] hover:underline"
                >
                  VIEW_ACTIVITY <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
