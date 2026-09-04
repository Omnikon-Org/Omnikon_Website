import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuizBySlugForClient } from '@/lib/data/quizzes';
import { createClient } from '@/lib/supabase/server';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { QuizRunner } from '@/components/quizzes/QuizRunner';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArrowLeft, Zap, Trophy, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface QuizDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QuizDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlugForClient(slug);

  if (!quiz) {
    return constructMetadata({ title: 'Quiz Not Found', noIndex: true });
  }

  return constructMetadata({
    title: `${quiz.title} — Technical Skill Quiz`,
    description: quiz.description,
    canonicalUrl: `${SITE_CONFIG.url}/quizzes/${quiz.slug}`,
  });
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { slug } = await params;
  const quiz = await getQuizBySlugForClient(slug);

  if (!quiz) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const quizJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: quiz.title,
    description: quiz.description,
    educationalLevel: quiz.difficulty,
    about: {
      '@type': 'Thing',
      name: quiz.category,
    },
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
  };

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Quizzes', item: '/quizzes' },
    { name: quiz.title, item: `/quizzes/${quiz.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="flex items-center justify-between font-mono-terminal text-xs">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#FF3131] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> RETURN_TO_QUIZZES
        </Link>
        <span className="text-[#38BDF8] uppercase font-bold flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" /> {quiz.category}
        </span>
      </div>

      <TerminalHeader
        title={quiz.title}
        subtitle={quiz.description}
      />

      {/* Interactive Quiz Runner */}
      <QuizRunner quiz={quiz} isAuthenticated={!!user} />

      <AdSlot slotId="quiz-detail-ad" />
    </div>
  );
}
