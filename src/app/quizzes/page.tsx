import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedQuizzes, getQuizLeaderboard } from '@/lib/data/quizzes';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { 
  Zap, 
  Trophy, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Code, 
  CheckCircle2, 
  Flame,
  User as UserIcon
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Technical Quizzes & Skill Validation',
  description: 'Test your engineering knowledge in JavaScript, DSA, React, SQL, Python, and system architecture. Earn verified score badges and rise on the community leaderboard.',
  canonicalUrl: '/quizzes',
});

interface QuizzesPageProps {
  searchParams: Promise<{ category?: string }>;
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'ALL_CATEGORIES' },
  { id: 'JavaScript', label: 'JAVASCRIPT' },
  { id: 'React', label: 'REACT_&_NEXT' },
  { id: 'DSA', label: 'DSA_&_ALGORITHMS' },
  { id: 'SQL', label: 'SQL_&_DATABASES' },
  { id: 'Python', label: 'PYTHON' },
  { id: 'Architecture', label: 'SYSTEM_DESIGN' },
];

export default async function QuizzesPage({ searchParams }: QuizzesPageProps) {
  const { category = 'ALL' } = await searchParams;

  const [quizzes, leaderboard] = await Promise.all([
    getPublishedQuizzes(category),
    getQuizLeaderboard('all_time'),
  ]);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="TECHNICAL_QUIZZES"
        subtitle="Validate your engineering foundations across modern languages, data structures, full-stack frameworks, and databases."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quizzes/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Trophy className="h-4 w-4" /> COMMUNITY_LEADERBOARD
            </Link>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#27272A] pb-3 scrollbar-none font-mono-terminal text-xs">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = category.toLowerCase() === tab.id.toLowerCase() || (tab.id === 'ALL' && category === 'ALL');
          const targetUrl = tab.id === 'ALL' ? '/quizzes' : `/quizzes?category=${encodeURIComponent(tab.id)}`;

          return (
            <Link
              key={tab.id}
              href={targetUrl}
              className={`px-3 py-1.5 rounded-md border whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#FF3131] text-white border-[#FF3131] font-bold shadow-[0_0_10px_rgba(255,49,49,0.3)]'
                  : 'bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#FF3131]/50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Quizzes Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <h2 className="font-mono-terminal text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FF3131]" /> Active Quizzes ({quizzes.length})
            </h2>
            <span className="font-mono-terminal text-xs text-[#A1A1AA]">Category: {category}</span>
          </div>

          {quizzes.length === 0 ? (
            <EmptyState
              title="NO_QUIZZES_FOUND"
              message={`No technical quizzes published under category "${category}". Browse all categories or contribute new challenges.`}
              actionLabel="VIEW_ALL_QUIZZES"
              actionHref="/quizzes"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <GlowCard
                  key={quiz.id}
                  accentColor="cyan"
                  className="flex flex-col justify-between space-y-4 p-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono-terminal text-[11px]">
                      <span className="px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-bold">
                        {quiz.category}
                      </span>
                      <span className="text-[#EAB308] font-bold">{quiz.difficulty}</span>
                    </div>

                    <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors">
                      <Link href={`/quizzes/${quiz.slug}`}>{quiz.title}</Link>
                    </h3>

                    <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#27272A] space-y-3 font-mono-terminal text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-[#38BDF8]" /> {quiz.question_count || 0} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#EAB308]" /> ~{quiz.estimated_duration_minutes} mins
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#22C55E]">
                        Pass Rate: {quiz.pass_percentage}%
                      </span>
                      <Link
                        href={`/quizzes/${quiz.slug}`}
                        className="font-bold text-[#38BDF8] flex items-center gap-1 hover:underline"
                      >
                        START_QUIZ <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Top Leaderboard Podium Preview & Rules */}
        <div className="space-y-6">
          <GlowCard accentColor="green" className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-mono-terminal text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#EAB308]" /> Top Ranked Engineers
              </h3>
              <Link
                href="/quizzes/leaderboard"
                className="font-mono-terminal text-xs text-[#22C55E] hover:underline"
              >
                Full Board &rarr;
              </Link>
            </div>

            {top3.length === 0 ? (
              <div className="p-4 text-center font-mono-terminal text-xs text-[#A1A1AA]">
                No quiz scores recorded yet. Be the first to take a quiz!
              </div>
            ) : (
              <div className="space-y-2.5 font-mono-terminal text-xs">
                {top3.map((entry) => (
                  <div
                    key={entry.user_id}
                    className="p-3 rounded-lg bg-[#050505] border border-[#27272A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          entry.rank === 1
                            ? 'bg-[#EAB308] text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                            : entry.rank === 2
                            ? 'bg-[#A1A1AA] text-black'
                            : 'bg-[#B45309] text-white'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div>
                        <Link
                          href={`/profile/${entry.username}`}
                          className="font-bold text-white hover:text-[#38BDF8] block truncate max-w-[120px]"
                        >
                          {entry.full_name}
                        </Link>
                        <span className="text-[10px] text-[#A1A1AA]">@{entry.username}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[#22C55E] font-bold block">{entry.total_score} pts</span>
                      <span className="text-[10px] text-[#A1A1AA]">{entry.quizzes_passed} passed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>

          {/* Validation & Reputation Rules */}
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-3 font-mono-terminal text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="h-4 w-4 text-[#38BDF8]" /> Skill Verification Rules
            </div>
            <p className="font-sans text-xs leading-relaxed">
              Quizzes evaluate core computer science topics and full-stack fundamentals with randomized questions and server-side validation. Scoring 70% or higher logs an official verified milestone on your public developer profile and awards community leaderboard points.
            </p>
          </div>
        </div>
      </div>

      <AdSlot slotId="quizzes-catalog-ad" />
    </div>
  );
}
