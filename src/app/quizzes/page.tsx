import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedQuizzes } from '@/lib/data/quizzes';
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
  ExternalLink,
  Flame,
  Sparkles,
  CheckCircle2,
  Users,
  Compass
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Technical Quizzes & Competitions',
  description: 'Participate in official Omnikon technical quizzes and engineering challenges hosted on Unstop across AI/ML, frontend architecture, and computer science.',
  canonicalUrl: '/quizzes',
});

interface QuizzesPageProps {
  searchParams: Promise<{ category?: string }>;
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'ALL_CHALLENGES' },
  { id: 'AI_&_ML', label: 'AI_&_MACHINE_LEARNING' },
  { id: 'Frontend', label: 'FRONTEND_ARCHITECTURE' },
];

export default async function QuizzesPage({ searchParams }: QuizzesPageProps) {
  const { category = 'ALL' } = await searchParams;

  const quizzes = await getPublishedQuizzes(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="TECHNICAL_QUIZZES"
        subtitle="Validate your engineering foundations across AI/ML, frontend architecture, modern frameworks, data structures, and databases on Unstop."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://unstop.com/quiz/ai-ml-challenge-2026-foundations-quiz-omnikon-1729546"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              <ExternalLink className="h-4 w-4" /> EXPLORE_ON_UNSTOP
            </a>
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
                  accentColor={quiz.is_featured ? 'red' : 'cyan'}
                  className="flex flex-col justify-between space-y-4 p-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono-terminal text-[11px] gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] font-bold">
                          {quiz.category}
                        </span>
                        {quiz.badge_label && (
                          <span className="px-2 py-0.5 rounded border border-[#EAB308]/40 bg-[#EAB308]/10 text-[#EAB308] font-bold text-[10px]">
                            {quiz.badge_label}
                          </span>
                        )}
                      </div>
                      <span className="text-[#EAB308] font-bold">{quiz.difficulty}</span>
                    </div>

                    <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors">
                      {quiz.external_url ? (
                        <a href={quiz.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          {quiz.title} <ExternalLink className="h-3.5 w-3.5 text-[#A1A1AA] shrink-0" />
                        </a>
                      ) : (
                        <Link href={`/quizzes/${quiz.slug}`}>{quiz.title}</Link>
                      )}
                    </h3>

                    <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                      {quiz.description}
                    </p>

                    {quiz.stats_summary && (
                      <div className="p-2 rounded bg-[#121212] border border-[#27272A] font-mono-terminal text-[10px] text-[#A1A1AA]">
                        {quiz.stats_summary}
                      </div>
                    )}
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
                      {quiz.external_url ? (
                        <a
                          href={quiz.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#FF3131] flex items-center gap-1 hover:underline"
                        >
                          OPEN_ON_UNSTOP <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={`/quizzes/${quiz.slug}`}
                          className="font-bold text-[#38BDF8] flex items-center gap-1 hover:underline"
                        >
                          START_QUIZ <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Unstop Competition Platform & Rules */}
        <div className="space-y-6">
          <GlowCard accentColor="red" className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-mono-terminal text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FF3131]" /> Unstop Competition Hub
              </h3>
              <span className="font-mono-terminal text-[10px] px-2 py-0.5 rounded bg-[#FF3131]/20 text-[#FF3131] border border-[#FF3131]/40 font-bold">
                OFFICIAL
              </span>
            </div>

            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Omnikon organizes all competitive quizzes and foundation assessments directly through Unstop. Compete against student engineers nationwide, earn certificates, and qualify for awards.
            </p>

            <div className="space-y-2.5 font-mono-terminal text-xs">
              <div className="p-3 rounded-lg bg-[#050505] border border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-white font-bold">National Recognition</span>
                </div>
                <span className="text-[#A1A1AA] text-[10px]">Unstop Verified</span>
              </div>

              <div className="p-3 rounded-lg bg-[#050505] border border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#EAB308]" />
                  <span className="text-white font-bold">Certificates & Awards</span>
                </div>
                <span className="text-[#A1A1AA] text-[10px]">Top Performers</span>
              </div>

              <div className="p-3 rounded-lg bg-[#050505] border border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#38BDF8]" />
                  <span className="text-white font-bold">1600+ Registrations</span>
                </div>
                <span className="text-[#22C55E] text-[10px]">Quiz Arena</span>
              </div>
            </div>

            <a
              href="https://unstop.com/quiz/ai-ml-challenge-2026-foundations-quiz-omnikon-1729546"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> EXPLORE_ON_UNSTOP
            </a>
          </GlowCard>

          {/* Validation & Reputation Rules */}
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-3 font-mono-terminal text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Award className="h-4 w-4 text-[#38BDF8]" /> Skill Verification & Guidelines
            </div>
            <p className="font-sans text-xs leading-relaxed">
              Quizzes evaluate core computer science topics, full-stack fundamentals, and artificial intelligence models with timed evaluations and proctored scoring on Unstop. Successful completion issues official credentials for your engineering portfolio.
            </p>
          </div>
        </div>
      </div>

      <AdSlot slotId="quizzes-catalog-ad" />
    </div>
  );
}
