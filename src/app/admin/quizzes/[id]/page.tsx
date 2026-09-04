import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getQuizWithAnswers } from '@/lib/data/quizzes';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { QuizForm } from '@/components/admin/QuizForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminEditQuizProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditQuizPage({ params }: AdminEditQuizProps) {
  const { id } = await params;
  const quizData = await getQuizWithAnswers(id);

  if (!quizData) {
    notFound();
  }

  const { quiz, questions } = quizData;

  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#FF3131] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_QUIZZES_LIST
      </Link>

      <TerminalHeader
        title="EDIT_TECHNICAL_QUIZ"
        subtitle={`Updating quiz configuration and questions for ${quiz.title}`}
      />

      <QuizForm initialQuiz={quiz} initialQuestions={questions} />
    </div>
  );
}
