import React from 'react';
import Link from 'next/link';
import { GlowCard } from '@/components/content/GlowCard';
import { Sparkles, ArrowRight, Github, ExternalLink, Flame, CheckCircle2 } from 'lucide-react';

export function IssueSwipePromoCard() {
  return (
    <GlowCard accentColor="cyan" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-pulse" />
          <h3 className="font-mono-terminal text-sm font-extrabold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Discover Open-Source Issues
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-mono-terminal text-[10px] font-bold">
          FEATURED_TOOL
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="font-mono-terminal text-base font-extrabold text-white flex items-center gap-2">
          IssuesSwipe — Tinder for Good First Issues <Flame className="h-4 w-4 text-[#FF3131]" />
        </h4>
        <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
          Struggling to find beginner-friendly open-source issues? Use <strong className="text-white">IssuesSwipe</strong> to swipe through curated GitHub issues, filter by tech stack (TypeScript, Python, Go), and start contributing to Omnikon projects instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-terminal pt-1">
        <div className="p-2 rounded bg-[#050505] border border-[#27272A] flex items-center gap-2 text-[#A1A1AA]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" /> Swipe good-first-issues
        </div>
        <div className="p-2 rounded bg-[#050505] border border-[#27272A] flex items-center gap-2 text-[#A1A1AA]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" /> Track contribution streaks
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Link
          href="/issueswipe"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#38BDF8]/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
        >
          LAUNCH_ISSUESWIPE <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="https://github.com/Omnikon-Org/IssuesSwipe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] font-mono-terminal text-xs font-bold hover:text-white transition-all"
        >
          <Github className="h-3.5 w-3.5" /> REPO_SOURCE <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </GlowCard>
  );
}
