'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Github, 
  ExternalLink, 
  Rocket, 
  Monitor, 
  Check, 
  X, 
  Zap,
  Award,
  Flame,
  Users,
  Code2
} from 'lucide-react';

interface IssueSwipeShowcaseProps {
  showQuizMilestone?: boolean;
}

export function IssueSwipeShowcase({ showQuizMilestone = true }: IssueSwipeShowcaseProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-10">
      {/* LEFT COLUMN: Mentorship Programs & Ecosystem Highlights */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 1: Selected for Mentorship Programs */}
        <div className="relative overflow-hidden rounded-2xl border border-[#A855F7]/30 bg-gradient-to-br from-[#130B22]/80 via-[#0A0A0A] to-[#0A0A0A] p-6 backdrop-blur-sm shadow-[0_0_25px_rgba(168,85,247,0.12)] flex-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Badges Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/15 font-mono-terminal text-[11px] font-bold text-[#C084FC]">
                <Award className="h-3.5 w-3.5 text-[#C084FC]" /> ACHIEVEMENT
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#27272A] bg-[#18181B] font-mono-terminal text-[10px] text-[#A1A1AA]">
                Open Source
              </span>
            </div>

            <h3 className="font-mono-terminal text-lg font-bold text-white mb-4">
              Selected for Mentorship Programs
            </h3>

            {/* Selected Repositories List */}
            <div className="space-y-3">
              {/* Astrodex */}
              <a
                href="https://github.com/Omnikon-Org/Astrodex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-[#27272A] bg-[#121212]/80 hover:border-[#A855F7]/60 hover:bg-[#18181B] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EC4899]/30 bg-[#EC4899]/10 text-[#F472B6]">
                    <Rocket className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-mono-terminal text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      Astrodex
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                      <span>Selected in</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-mono-terminal text-[10px] font-bold">
                        GSSoC 2026
                      </span>
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[#71717A] group-hover:text-white transition-colors" />
              </a>

              {/* CNTRL */}
              <a
                href="https://github.com/Omnikon-Org/CNTRL"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-[#27272A] bg-[#121212]/80 hover:border-[#A855F7]/60 hover:bg-[#18181B] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A78BFA]">
                    <Monitor className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-mono-terminal text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      CNTRL
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                      <span>Selected in</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#A855F7]/10 text-[#C084FC] border border-[#A855F7]/30 font-mono-terminal text-[10px] font-bold">
                        ECSoC 2026
                      </span>
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[#71717A] group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#27272A] flex items-center justify-between text-xs font-mono-terminal text-[#A1A1AA]">
            <span>National Mentorship Selection</span>
            <span className="text-[#38BDF8] font-bold">2026 Cohort</span>
          </div>
        </div>

        {/* Card 2: Only rendered if showQuizMilestone is enabled (e.g. homepage overview), otherwise shows community OSS metrics */}
        {showQuizMilestone ? (
          <div className="relative overflow-hidden rounded-2xl border border-[#27272A] bg-gradient-to-br from-[#121212] to-[#0A0A0A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded border border-[#22C55E]/40 bg-[#22C55E]/10 font-mono-terminal text-[10px] font-bold text-[#4ADE80]">
                COMPLETED
              </span>
              <span className="font-mono-terminal text-[10px] text-[#71717A]">
                Legacy Challenge
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-mono-terminal text-base font-bold text-white">Frontend Quiz Arena</h4>
                <p className="font-mono-terminal text-xs text-[#A1A1AA]">Omnikon Skill Arena Milestone</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B]">
                <div className="font-mono-terminal text-base font-bold text-[#FF3131]">1600+</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Registrations</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B]">
                <div className="font-mono-terminal text-base font-bold text-[#FF3131]">168.9K</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Impressions</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B]">
                <div className="font-mono-terminal text-base font-bold text-white">264</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Reviews</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B]">
                <div className="font-mono-terminal text-base font-bold text-[#22C55E]">71.4%</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Engineering</div>
              </div>
            </div>

            <p className="font-sans text-xs text-[#A1A1AA] pt-1">
              Massive student engagement across engineering colleges.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-[#27272A] bg-gradient-to-br from-[#121212] to-[#0A0A0A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 font-mono-terminal text-[10px] font-bold text-[#38BDF8]">
                CONTRIBUTION_TRACKS
              </span>
              <span className="font-mono-terminal text-[10px] text-[#71717A]">
                Omnikon-Org
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-mono-terminal text-base font-bold text-white">Native Projects Ecosystem</h4>
                <p className="font-mono-terminal text-xs text-[#A1A1AA]">Open Source Developer Tools &amp; Engines</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B] text-center">
                <div className="font-mono-terminal text-base font-bold text-[#38BDF8]">13+</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Repositories</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B] text-center">
                <div className="font-mono-terminal text-base font-bold text-[#22C55E]">37+</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Contributors</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181B] text-center">
                <div className="font-mono-terminal text-base font-bold text-[#EAB308]">100%</div>
                <div className="font-mono-terminal text-[10px] text-[#71717A] uppercase">Open Source</div>
              </div>
            </div>

            <p className="font-sans text-xs text-[#A1A1AA] pt-1">
              Explore good-first-issues and author verified PRs across all active repositories.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: IssueSwipe Flagship Showcase Advertisement */}
      <div className="lg:col-span-7 relative overflow-hidden rounded-2xl border-2 border-[#A855F7]/50 bg-gradient-to-br from-[#1F1035] via-[#10091E] to-[#08050D] p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Glow ambient effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#A855F7]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#6366F1]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Header Tag */}
          <div className="flex items-center gap-2">
            <span className="font-mono-terminal text-xs text-[#A855F7] font-bold">&lt; / &gt;</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/15 font-mono-terminal text-[11px] font-bold text-[#D8B4FE] tracking-wider uppercase">
              • OPEN SOURCE PROJECT
            </span>
          </div>

          {/* Title & Graphic Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Copy Content */}
            <div className="md:col-span-7 space-y-4">
              <h2 className="font-mono-terminal text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                IssueSwipe
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                Swipe through GitHub issues like Tinder.<br />
                Find beginner-friendly issues.<br />
                Contribute faster.<br />
                <span className="text-[#C084FC] font-semibold">Build your OSS profile.</span>
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Good First Issues',
                  'Smart Matching',
                  'GitHub Sync',
                  'Open Source',
                  'Fast Review',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-[#A855F7]/30 bg-[#2E1065]/50 font-mono-terminal text-xs font-semibold text-[#E9D5FF] hover:border-[#A855F7] transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Custom 3D Glowing Card Graphic */}
            <div className="md:col-span-5 flex items-center justify-center relative py-4">
              <div className="relative flex items-center justify-center">
                {/* Purple glowing circular aura */}
                <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#9333EA]/30 to-[#C084FC]/30 blur-xl animate-pulse" />

                {/* Outer ring */}
                <div className="relative w-44 h-44 rounded-full border-2 border-[#A855F7]/40 bg-[#160D29] flex flex-col items-center justify-center p-4 shadow-2xl">
                  {/* Cancel X badge */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-[#EF4444]/60 bg-[#450A0A] flex items-center justify-center text-[#EF4444] shadow-md">
                    <X className="h-4 w-4" />
                  </div>

                  {/* Accept Check badge */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-[#22C55E]/60 bg-[#052E16] flex items-center justify-center text-[#22C55E] shadow-md">
                    <Check className="h-4 w-4" />
                  </div>

                  {/* Central App Card Icon Stack */}
                  <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                    <div className="h-16 w-12 rounded-lg border border-[#A855F7] bg-gradient-to-b from-[#7E22CE] to-[#4C1D95] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                      <Zap className="h-6 w-6 text-white animate-bounce" />
                    </div>
                    <div className="font-mono-terminal text-xs font-black text-white tracking-widest uppercase mt-1">
                      ISSUES
                    </div>
                    <div className="font-mono-terminal text-[10px] font-bold text-[#C084FC] tracking-widest uppercase">
                      SWIPE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="relative pt-6 border-t border-[#A855F7]/25 flex flex-wrap items-center gap-4 mt-6">
          <a
            href="https://github.com/Omnikon-Org/IssuesSwipe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#27272A] bg-[#121212] font-mono-terminal text-xs font-bold text-white hover:bg-[#1C1917] hover:border-white transition-all shadow-sm"
          >
            <Github className="h-4 w-4" /> VIEW_REPOSITORY
          </a>

          <a
            href="https://github.com/Omnikon-Org/IssuesSwipe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#A855F7] font-mono-terminal text-xs font-extrabold text-white hover:from-[#A855F7] hover:to-[#C084FC] transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] transform hover:-translate-y-0.5"
          >
            <ExternalLink className="h-4 w-4" /> LAUNCH_LIVE_DEMO
          </a>
        </div>
      </div>
    </div>
  );
}
