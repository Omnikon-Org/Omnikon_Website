import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getQuizLeaderboard } from '@/lib/data/quizzes';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { Trophy, ArrowLeft, User as UserIcon, Medal, Zap, Target, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Community Quiz Leaderboard & Rankings',
  description: 'Top student developers and engineers ranked by technical quiz performance, consistency, and problem-solving accuracy on Omnikon.',
  canonicalUrl: '/quizzes/leaderboard',
});

interface LeaderboardPageProps {
  searchParams: Promise<{ timeframe?: string }>;
}

const TIMEFRAME_TABS = [
  { id: 'all_time', label: 'ALL_TIME' },
  { id: 'monthly', label: 'THIS_MONTH' },
  { id: 'weekly', label: 'THIS_WEEK' },
];

export default async function QuizLeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const { timeframe = 'all_time' } = await searchParams;
  const validTimeframe = (timeframe === 'weekly' || timeframe === 'monthly') ? timeframe : 'all_time';

  const leaderboard = await getQuizLeaderboard(validTimeframe);
  const podium = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-mono-terminal text-xs">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#22C55E] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_QUIZZES
      </Link>

      <TerminalHeader
        title="COMMUNITY_LEADERBOARD"
        subtitle="Rankings computed automatically via server-validated technical quiz submissions and skill milestones."
      />

      {/* Timeframe Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
        {TIMEFRAME_TABS.map((tab) => {
          const isSelected = validTimeframe === tab.id;
          const targetUrl = `/quizzes/leaderboard?timeframe=${tab.id}`;

          return (
            <Link
              key={tab.id}
              href={targetUrl}
              className={`px-3.5 py-1.5 rounded-md border transition-all ${
                isSelected
                  ? 'bg-[#22C55E] text-[#050505] border-[#22C55E] font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#22C55E]/50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {leaderboard.length === 0 ? (
        <EmptyState
          title="NO_SCORES_LOGGED"
          message={`No quiz scores have been recorded for the selected timeframe "${validTimeframe}". Complete a technical quiz to claim rank #1!`}
          actionLabel="TAKE_A_QUIZ"
          actionHref="/quizzes"
        />
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {podium.map((entry, idx) => {
              const colors = [
                { border: 'border-[#EAB308]', text: 'text-[#EAB308]', medal: 'GOLD_01', bg: 'bg-[#EAB308]/10' },
                { border: 'border-[#A1A1AA]', text: 'text-[#A1A1AA]', medal: 'SILVER_02', bg: 'bg-[#A1A1AA]/10' },
                { border: 'border-[#B45309]', text: 'text-[#B45309]', medal: 'BRONZE_03', bg: 'bg-[#B45309]/10' },
              ][idx];

              return (
                <div
                  key={entry.user_id}
                  className={`p-6 rounded-xl border ${colors.border} ${colors.bg} space-y-4 text-center shadow-lg relative`}
                >
                  <span className={`text-[10px] font-bold tracking-widest ${colors.text} uppercase`}>
                    RANK #{entry.rank} {'//'} {colors.medal}
                  </span>

                  <div className="mx-auto relative h-16 w-16 rounded-full overflow-hidden border-2 border-white/20 bg-[#121212] flex items-center justify-center">
                    {entry.avatar_url ? (
                      <Image
                        src={entry.avatar_url}
                        alt={entry.full_name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-[#A1A1AA]" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-base hover:text-[#38BDF8]">
                      <Link href={`/profile/${entry.username}`}>{entry.full_name}</Link>
                    </h3>
                    <span className="text-[#A1A1AA] text-[11px]">@{entry.username}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="text-2xl font-extrabold text-white">{entry.total_score} <span className="text-xs text-[#22C55E]">pts</span></div>
                    <div className="text-[11px] text-[#A1A1AA]">
                      {entry.quizzes_passed} passed | {entry.avg_percentage}% accuracy
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Ranked Table */}
          <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA] uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">RANK</th>
                  <th className="p-3.5">ENGINEER</th>
                  <th className="p-3.5">TIER</th>
                  <th className="p-3.5 text-right">TOTAL_POINTS</th>
                  <th className="p-3.5 text-right">PASSED</th>
                  <th className="p-3.5 text-right">ACCURACY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {leaderboard.map((entry) => (
                  <tr key={entry.user_id} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3.5 font-bold text-white">#{entry.rank}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[#18181B] border border-[#27272A] shrink-0">
                          {entry.avatar_url ? (
                            <Image
                              src={entry.avatar_url}
                              alt={entry.full_name}
                              width={28}
                              height={28}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-4 w-4 m-auto text-[#A1A1AA]" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/profile/${entry.username}`}
                            className="font-bold text-white hover:text-[#38BDF8]"
                          >
                            {entry.full_name}
                          </Link>
                          <span className="text-[#71717A] text-[10px] block">@{entry.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={entry.developer_tier} />
                    </td>
                    <td className="p-3.5 text-right font-bold text-[#22C55E]">{entry.total_score}</td>
                    <td className="p-3.5 text-right text-white">{entry.quizzes_passed}</td>
                    <td className="p-3.5 text-right text-[#38BDF8]">{entry.avg_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdSlot slotId="quiz-leaderboard-ad" />
    </div>
  );
}
