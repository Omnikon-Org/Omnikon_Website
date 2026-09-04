import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Zap, Plus, Edit, HelpCircle, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminQuizzesPage() {
  const adminSupabase = createAdminClient();

  const { data: quizzes } = await adminSupabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(count),
      quiz_attempts(count)
    `)
    .order('created_at', { ascending: false });

  const quizList = (quizzes || []).map((q: any) => ({
    ...q,
    question_count: q.quiz_questions?.[0]?.count || 0,
    attempts_count: q.quiz_attempts?.[0]?.count || 0,
  }));

  return (
    <div className="space-y-8 font-mono-terminal text-xs">
      <TerminalHeader
        title="QUIZ_MANAGEMENT"
        subtitle="Create, edit, and publish technical skill assessment quizzes, questions, and grading criteria."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/quizzes/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              <Plus className="h-4 w-4" /> CREATE_QUIZ
            </Link>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        <table className="w-full text-left">
          <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA] uppercase text-[10px]">
            <tr>
              <th className="p-3.5">QUIZ_TITLE</th>
              <th className="p-3.5">CATEGORY</th>
              <th className="p-3.5">DIFFICULTY</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-center">QUESTIONS</th>
              <th className="p-3.5 text-center">ATTEMPTS</th>
              <th className="p-3.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {quizList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#A1A1AA]">
                  No technical quizzes registered in system.
                </td>
              </tr>
            ) : (
              quizList.map((q) => (
                <tr key={q.id} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3.5 font-bold text-white max-w-[220px] truncate">
                    <Link href={`/quizzes/${q.slug}`} className="hover:text-[#38BDF8]" target="_blank">
                      {q.title}
                    </Link>
                  </td>
                  <td className="p-3.5 text-[#38BDF8]">{q.category}</td>
                  <td className="p-3.5 text-[#EAB308]">{q.difficulty}</td>
                  <td className="p-3.5">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="p-3.5 text-center text-white font-bold">
                    {q.question_count}
                  </td>
                  <td className="p-3.5 text-center text-[#22C55E] font-bold">
                    {q.attempts_count}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/quizzes/${q.id}`}
                      className="inline-flex items-center gap-1 text-[#38BDF8] hover:underline"
                    >
                      <Edit className="h-3 w-3" /> EDIT
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
