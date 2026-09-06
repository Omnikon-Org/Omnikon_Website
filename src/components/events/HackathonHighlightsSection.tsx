'use client';

import React from 'react';
import { 
  Trophy, 
  Crown, 
  Award, 
  Medal, 
  Users, 
  TrendingUp, 
  BarChart2, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  ShieldCheck
} from 'lucide-react';
import type { HackathonWinner, AmbassadorLeaderboardEntry } from '@/lib/data/events';

interface HackathonHighlightsSectionProps {
  stats: {
    completeRegistrations: string;
    totalRegistrations: string;
    totalImpressions: string;
    ratingsAndReviews: string;
    engineeringPercentage: string;
    phase1Submissions: string;
    phase2Submissions: string;
    finalSubmissions: string;
  };
  winners: HackathonWinner[];
  ambassadors: AmbassadorLeaderboardEntry[];
  unstopUrl: string;
}

export function HackathonHighlightsSection({
  stats,
  winners,
  ambassadors,
  unstopUrl,
}: HackathonHighlightsSectionProps) {
  const topAmbassadors = ambassadors.slice(0, 3);
  const remainingAmbassadors = ambassadors.slice(3);

  return (
    <div className="space-y-10 my-8">
      {/* 1. UNSTOP DASHBOARD STATS OVERVIEW */}
      <div className="rounded-2xl border-2 border-[#FF3131]/40 bg-gradient-to-br from-[#1C0A0A] via-[#0D0505] to-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-[0_0_30px_rgba(255,49,49,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 font-mono-terminal text-[10px] font-bold text-[#22C55E]">
                COMPLETED
              </span>
              <span className="font-mono-terminal text-xs text-[#A1A1AA]">Unstop Live Opportunity Dashboard</span>
            </div>
            <h3 className="font-mono-terminal text-xl font-bold text-white tracking-wide">
              Omnikon National Hackathon 2026 Metrics
            </h3>
          </div>

          <a
            href={unstopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF3131] hover:bg-[#FF3131]/90 text-white font-mono-terminal text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,49,49,0.3)] self-start sm:self-auto"
          >
            VIEW_OPPORTUNITY_ON_UNSTOP <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#27272A] bg-[#121212]/90 space-y-1">
            <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
              <span>COMPLETE REGISTRATIONS</span>
              <Users className="h-3.5 w-3.5 text-[#38BDF8]" />
            </div>
            <div className="font-mono-terminal text-3xl font-extrabold text-white">
              {stats.completeRegistrations}
            </div>
            <div className="font-mono-terminal text-[10px] text-[#71717A]">
              Total Registrations: {stats.totalRegistrations}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#27272A] bg-[#121212]/90 space-y-1">
            <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
              <span>TOTAL IMPRESSIONS</span>
              <TrendingUp className="h-3.5 w-3.5 text-[#A855F7]" />
            </div>
            <div className="font-mono-terminal text-3xl font-extrabold text-[#C084FC]">
              {stats.totalImpressions}
            </div>
            <div className="font-mono-terminal text-[10px] text-[#71717A]">
              Across Indian Universities
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#27272A] bg-[#121212]/90 space-y-1">
            <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
              <span>RATINGS &amp; REVIEWS</span>
              <Award className="h-3.5 w-3.5 text-[#EAB308]" />
            </div>
            <div className="font-mono-terminal text-3xl font-extrabold text-[#EAB308]">
              {stats.ratingsAndReviews}
            </div>
            <div className="font-mono-terminal text-[10px] text-[#71717A]">
              Verified Feedback
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#27272A] bg-[#121212]/90 space-y-1">
            <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
              <span>ENGINEERING SHARE</span>
              <BarChart2 className="h-3.5 w-3.5 text-[#22C55E]" />
            </div>
            <div className="font-mono-terminal text-3xl font-extrabold text-[#22C55E]">
              {stats.engineeringPercentage}
            </div>
            <div className="font-mono-terminal text-[10px] text-[#71717A]">
              4,355 Technical Students
            </div>
          </div>
        </div>

        {/* Phase Funnel Submissions */}
        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0E0E0E] space-y-3">
          <div className="font-mono-terminal text-xs text-[#A1A1AA] uppercase font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#38BDF8]" /> Multi-Phase Submission Funnel
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-terminal text-xs">
            <div className="p-3 rounded-lg border border-[#27272A] bg-[#141414] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase block">Phase 1 — Idea Submissions</span>
                <span className="font-bold text-white text-sm">{stats.phase1Submissions} Teams</span>
              </div>
              <span className="text-[10px] text-[#22C55E] font-bold">100% SCREENED</span>
            </div>

            <div className="p-3 rounded-lg border border-[#27272A] bg-[#141414] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase block">Phase 2 — PPT / Architecture</span>
                <span className="font-bold text-white text-sm">{stats.phase2Submissions} Finalists</span>
              </div>
              <span className="text-[10px] text-[#38BDF8] font-bold">TECHNICAL JURY</span>
            </div>

            <div className="p-3 rounded-lg border border-[#27272A] bg-[#141414] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase block">Final Evaluation Submissions</span>
                <span className="font-bold text-white text-sm">{stats.finalSubmissions} Finalists</span>
              </div>
              <span className="text-[10px] text-[#EAB308] font-bold">LIVE DEMOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL WINNERS PODIUM */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
          <Trophy className="h-5 w-5 text-[#EAB308]" />
          <h3 className="font-mono-terminal text-lg font-bold text-white uppercase tracking-wider">
            Official Hackathon Winners Declared
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {winners.map((winner) => {
            const isGold = winner.placeNumber === 1;
            const isSilver = winner.placeNumber === 2;
            const isBronze = winner.placeNumber === 3;

            return (
              <div
                key={winner.teamName}
                className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                  isGold
                    ? 'border-[#EAB308] bg-gradient-to-b from-[#1C1708] to-[#0A0A0A] shadow-[0_0_25px_rgba(234,179,8,0.25)] md:-translate-y-2'
                    : isSilver
                    ? 'border-[#A1A1AA]/60 bg-gradient-to-b from-[#161618] to-[#0A0A0A]'
                    : 'border-[#B45309]/60 bg-gradient-to-b from-[#1A1009] to-[#0A0A0A]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md font-mono-terminal text-xs font-black uppercase ${
                      isGold
                        ? 'bg-[#EAB308] text-black shadow-md'
                        : isSilver
                        ? 'bg-[#A1A1AA] text-black'
                        : 'bg-[#B45309] text-white'
                    }`}>
                      {winner.place}
                    </span>
                    <span className="font-mono-terminal text-xs font-bold text-white">
                      Score: <span className="text-[#22C55E]">{winner.score}</span>
                    </span>
                  </div>

                  <h4 className="font-mono-terminal text-xl font-bold text-white pt-1">
                    {winner.teamName}
                  </h4>

                  <div className="font-mono-terminal text-xs text-[#A1A1AA] flex items-center gap-1.5">
                    <span className="text-[#71717A]">Team Lead:</span>
                    <span className="text-white font-semibold">{winner.leaderName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-[11px]">
                  <span className="text-[#A1A1AA]">Verified Finals Result</span>
                  <span className="text-[#EAB308] font-bold">★ Certified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AMBASSADOR LEADERBOARD PODIUM & RANKINGS */}
      <div className="rounded-2xl border-2 border-[#FF3131]/40 bg-gradient-to-b from-[#140606] via-[#0A0A0A] to-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(255,49,49,0.15)]">
        <div className="text-center space-y-2 border-b border-[#27272A] pb-6">
          <div className="font-mono-terminal text-xs text-[#FF3131] uppercase tracking-widest font-bold">
            OMNIKON NATIONAL HACKATHON 2026
          </div>
          <h3 className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            AMBASSADOR LEADERBOARD
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto">
            Thank you to all our incredible ambassadors for driving the Omnikon movement across universities!
          </p>
        </div>

        {/* Top 3 Podium Cards (Rank 2, Rank 1, Rank 3 layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
          {/* Rank 2: Srija Pathrala */}
          {topAmbassadors[1] && (
            <div className="order-2 md:order-1 p-5 rounded-2xl border border-[#A1A1AA]/50 bg-[#121214] text-center space-y-3">
              <div className="inline-flex h-8 w-8 rounded-full bg-[#A1A1AA] text-black font-mono-terminal font-bold items-center justify-center text-sm shadow-md">
                2
              </div>
              <div className="h-16 w-16 mx-auto rounded-full border-2 border-[#A1A1AA] bg-[#27272A] flex items-center justify-center font-mono-terminal text-lg font-bold text-white">
                SP
              </div>
              <h4 className="font-mono-terminal text-base font-bold text-white">
                {topAmbassadors[1].name}
              </h4>
              <div className="p-2 rounded-lg bg-[#0A0A0A] border border-[#27272A]">
                <div className="font-mono-terminal text-2xl font-black text-white">
                  {topAmbassadors[1].referrals}
                </div>
                <div className="font-mono-terminal text-[10px] text-[#A1A1AA] uppercase">
                  Verified Referrals
                </div>
              </div>
            </div>
          )}

          {/* Rank 1: Harsh (Crown & Center) */}
          {topAmbassadors[0] && (
            <div className="order-1 md:order-2 p-6 rounded-2xl border-2 border-[#EAB308] bg-gradient-to-b from-[#241A06] to-[#0E0E0E] text-center space-y-3 shadow-[0_0_25px_rgba(234,179,8,0.3)] md:-translate-y-4">
              <div className="flex items-center justify-center gap-1">
                <Crown className="h-6 w-6 text-[#EAB308]" />
              </div>
              <div className="inline-flex h-9 w-9 rounded-full bg-[#EAB308] text-black font-mono-terminal font-black items-center justify-center text-base shadow-lg">
                1
              </div>
              <div className="h-20 w-20 mx-auto rounded-full border-2 border-[#EAB308] bg-[#1E1605] flex items-center justify-center font-mono-terminal text-xl font-bold text-[#EAB308]">
                H
              </div>
              <h4 className="font-mono-terminal text-lg font-extrabold text-white">
                {topAmbassadors[0].name}
              </h4>
              <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#EAB308]/50">
                <div className="font-mono-terminal text-3xl font-black text-[#EAB308]">
                  {topAmbassadors[0].referrals}
                </div>
                <div className="font-mono-terminal text-[10px] text-[#A1A1AA] uppercase font-bold">
                  Verified Referrals
                </div>
              </div>
            </div>
          )}

          {/* Rank 3: Meenal Pandey */}
          {topAmbassadors[2] && (
            <div className="order-3 md:order-3 p-5 rounded-2xl border border-[#B45309]/50 bg-[#160E08] text-center space-y-3">
              <div className="inline-flex h-8 w-8 rounded-full bg-[#B45309] text-white font-mono-terminal font-bold items-center justify-center text-sm shadow-md">
                3
              </div>
              <div className="h-16 w-16 mx-auto rounded-full border-2 border-[#B45309] bg-[#271C12] flex items-center justify-center font-mono-terminal text-lg font-bold text-white">
                MP
              </div>
              <h4 className="font-mono-terminal text-base font-bold text-white">
                {topAmbassadors[2].name}
              </h4>
              <div className="p-2 rounded-lg bg-[#0A0A0A] border border-[#27272A]">
                <div className="font-mono-terminal text-2xl font-black text-white">
                  {topAmbassadors[2].referrals}
                </div>
                <div className="font-mono-terminal text-[10px] text-[#A1A1AA] uppercase">
                  Verified Referrals
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ranks 4 to 11 Grid */}
        <div className="pt-4 border-t border-[#27272A] space-y-3">
          <div className="text-center font-mono-terminal text-xs text-[#FF3131] font-bold">
            ★ YOUR EFFORTS. OUR GROWTH. BUILDING THE IMPOSSIBLE TOGETHER. ★
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono-terminal text-xs">
            {remainingAmbassadors.map((amb) => (
              <div
                key={amb.rank}
                className="p-3 rounded-xl border border-[#27272A] bg-[#0E0E0E] text-center space-y-1 hover:border-[#FF3131]/40 transition-colors"
              >
                <div className="text-[10px] text-[#FF3131] font-bold">#{amb.rank}</div>
                <div className="font-bold text-white truncate" title={amb.name}>
                  {amb.name}
                </div>
                <div className="text-sm font-black text-[#22C55E] pt-1">
                  {amb.referrals}
                </div>
                <div className="text-[9px] text-[#71717A] uppercase">Referrals</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>REGISTRATIONS ARE NOW CLOSED · THIS LEADERBOARD IS FINAL</span>
          <span className="text-[#EAB308] font-bold flex items-center gap-1">
            <Award className="h-4 w-4" /> CERTIFICATES AWARDED BASED ON ACHIEVEMENTS
          </span>
        </div>
      </div>
    </div>
  );
}
