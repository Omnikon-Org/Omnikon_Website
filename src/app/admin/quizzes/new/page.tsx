import React from 'react';
import Link from 'next/link';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { QuizForm } from '@/components/admin/QuizForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewAdminQuizPage() {
  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <Link
        href="/admin/quizzes"
        className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#FF3131] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_QUIZZES_LIST
      </Link>

      <TerminalHeader
        title="CREATE_NEW_QUIZ"
        subtitle="Author a technical skill assessment quiz with questions, multiple-choice options, and grading criteria."
      />

      <QuizForm />
    </div>
  );
}
