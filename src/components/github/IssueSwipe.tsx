import React from 'react';
import { GitPullRequest, Tag, ExternalLink } from 'lucide-react';
import { GlowCard } from '@/components/content/GlowCard';

export interface GitHubIssue {
  id: number;
  title: string;
  repoName: string;
  url: string;
  labels: string[];
  commentsCount: number;
  createdAt: string;
}

interface IssueSwipeProps {
  issues?: GitHubIssue[];
}

export function IssueSwipe({ issues = [] }: IssueSwipeProps) {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono-terminal text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-[#22C55E]" /> Good First Issues & Contribution Opportunities
        </h3>
        <span className="font-mono-terminal text-xs text-[#A1A1AA]">Omnikon-Org Repositories</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.slice(0, 6).map((issue) => (
          <GlowCard key={issue.id} accentColor="green" className="p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#22C55E]">
                <span className="font-bold">{issue.repoName}</span>
                <span>#{issue.id}</span>
              </div>
              <h4 className="font-mono-terminal text-sm font-bold text-white line-clamp-2">
                <a href={issue.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {issue.title}
                </a>
              </h4>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#27272A]">
              <div className="flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <span key={label} className="inline-flex items-center gap-1 rounded bg-[#18181B] border border-[#27272A] px-2 py-0.5 font-mono-terminal text-[10px] text-[#A1A1AA]">
                    <Tag className="h-2.5 w-2.5 text-[#22C55E]" />
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono-terminal text-[10px] text-[#A1A1AA]">
                  {issue.commentsCount} comments
                </span>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-terminal text-xs font-bold text-[#22C55E] flex items-center gap-1 hover:underline"
                >
                  CLAIM_ISSUE <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
