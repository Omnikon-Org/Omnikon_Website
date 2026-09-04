'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { QuizWithQuestionsClient } from '@/lib/data/quizzes';
import { logEvent } from '@/lib/utils/analytics';
import { GlowCard } from '@/components/content/GlowCard';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trophy, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  Award
} from 'lucide-react';

interface QuizRunnerProps {
  quiz: QuizWithQuestionsClient;
  isAuthenticated: boolean;
}

interface QuestionBreakdown {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

interface EvaluationResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  passPercentage: number;
  timeSpentSeconds: number;
  breakdown: QuestionBreakdown[];
}

export function QuizRunner({ quiz, isAuthenticated }: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];

  // Log quiz_view on mount
  useEffect(() => {
    logEvent('quiz_view', quiz.id);
  }, [quiz.id]);

  // Timer
  useEffect(() => {
    if (evaluation) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluation]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (evaluation) return; // Locked after evaluation

    if (Object.keys(selectedAnswers).length === 0) {
      logEvent('quiz_started', quiz.id);
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!isAuthenticated) {
      setSubmitError('You must sign in to submit your answers and record your score.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const submissionPayload = {
      quizId: quiz.id,
      timeSpentSeconds: secondsElapsed,
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || '',
      })),
    };

    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate quiz.');
      }

      setEvaluation(data);
      logEvent('quiz_completed', quiz.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If results are evaluated, show comprehensive scorecard
  if (evaluation) {
    return (
      <div className="space-y-8 font-mono-terminal text-xs">
        {/* Results Banner */}
        <div
          className={`p-6 sm:p-8 rounded-xl border text-center space-y-4 ${
            evaluation.passed
              ? 'border-[#22C55E]/60 bg-[#22C55E]/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
              : 'border-[#FF3131]/60 bg-[#FF3131]/10 shadow-[0_0_20px_rgba(255,49,49,0.2)]'
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0A0A] border border-current">
            {evaluation.passed ? (
              <Trophy className="h-7 w-7 text-[#22C55E]" />
            ) : (
              <AlertCircle className="h-7 w-7 text-[#FF3131]" />
            )}
          </div>

          <div className="space-y-1">
            <span
              className={`text-xs font-bold uppercase tracking-widest ${
                evaluation.passed ? 'text-[#22C55E]' : 'text-[#FF3131]'
              }`}
            >
              {evaluation.passed ? 'CHALLENGE_PASSED // REPUTATION_LOGGED' : 'NEEDS_PRACTICE // TRY_AGAIN'}
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              {evaluation.score} / {evaluation.totalQuestions} ({evaluation.percentage}%)
            </h2>
            <p className="font-sans text-xs text-[#A1A1AA]">
              Required Passing Score: {evaluation.passPercentage}% | Time Spent: {formatTimer(evaluation.timeSpentSeconds)}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quizzes/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Trophy className="h-4 w-4" /> VIEW_LEADERBOARD
            </Link>
            <Link
              href="/quizzes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-bold hover:border-[#38BDF8] transition-all"
            >
              EXPLORE_MORE_QUIZZES <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Detailed Questions & Explanations Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#38BDF8]" /> Detailed Review & Explanations
            </h3>
            <span className="text-[#A1A1AA]">
              {evaluation.breakdown.filter((b) => b.isCorrect).length} Correct of {evaluation.totalQuestions}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const b = evaluation.breakdown.find((item) => item.questionId === q.id);
              const isCorrect = b?.isCorrect ?? false;

              return (
                <GlowCard
                  key={q.id}
                  accentColor={isCorrect ? 'green' : 'red'}
                  className="space-y-4 p-5"
                >
                  <div className="flex items-center justify-between font-mono-terminal text-xs">
                    <span className="font-bold text-white">QUESTION {idx + 1}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isCorrect ? 'text-[#22C55E]' : 'text-[#FF3131]'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> CORRECT (+1)
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> INCORRECT (0)
                        </>
                      )}
                    </span>
                  </div>

                  <p className="font-sans text-sm text-white font-medium">{q.question_text}</p>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = b?.selectedOptionId === opt.id;
                      const isCorrectChoice = b?.correctOptionId === opt.id;

                      let itemStyle = 'border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA]';
                      if (isCorrectChoice) {
                        itemStyle = 'border-[#22C55E] bg-[#22C55E]/10 text-white font-bold';
                      } else if (isUserChoice && !isCorrect) {
                        itemStyle = 'border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${itemStyle}`}
                        >
                          <span>{opt.text}</span>
                          {isCorrectChoice && <span className="text-[#22C55E] text-[10px]">CORRECT ANSWER</span>}
                          {isUserChoice && !isCorrectChoice && <span className="text-[#FF3131] text-[10px]">YOUR CHOICE</span>}
                        </div>
                      );
                    })}
                  </div>

                  {b?.explanation && (
                    <div className="p-3 rounded-lg bg-[#121212] border border-[#27272A] font-sans text-xs text-[#A1A1AA] space-y-1">
                      <span className="font-mono-terminal text-[10px] text-[#38BDF8] uppercase font-bold block">
                        EXPLANATION:
                      </span>
                      <p>{b.explanation}</p>
                    </div>
                  )}
                </GlowCard>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA] space-y-2">
        <AlertCircle className="h-8 w-8 text-[#EAB308] mx-auto" />
        <p className="font-bold text-white uppercase">NO_QUESTIONS_AVAILABLE</p>
        <p>This quiz currently has no published questions.</p>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-6 font-mono-terminal text-xs">
      {/* Top Header: Progress & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-[#38BDF8] font-bold uppercase">
            QUESTION {currentIdx + 1} OF {questions.length}
          </span>
          <span className="text-[#A1A1AA]">({answeredCount} answered)</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Clock className="h-4 w-4 text-[#EAB308]" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#18181B] rounded-full h-1.5 overflow-hidden border border-[#27272A]">
        <div
          className="bg-gradient-to-r from-[#38BDF8] to-[#22C55E] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Active Question Card */}
      <GlowCard accentColor="cyan" className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block font-bold">
            DIFFICULTY: {currentQ.difficulty || 'Medium'}
          </span>
          <h2 className="font-sans text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question_text}
          </h2>
        </div>

        {/* Option Selector */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`w-full text-left p-4 rounded-xl border font-sans text-xs sm:text-sm flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'border-[#27272A] bg-[#050505] text-[#A1A1AA] hover:border-[#38BDF8]/50 hover:text-white'
                }`}
              >
                <span>{opt.text}</span>
                <span
                  className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-mono-terminal ${
                    isSelected
                      ? 'border-[#38BDF8] bg-[#38BDF8] text-[#050505]'
                      : 'border-[#27272A] text-[#71717A]'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </GlowCard>

      {submitError && (
        <div className="p-4 rounded-xl border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2 font-mono-terminal">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation & Submission Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" /> PREVIOUS
        </button>

        {/* Question Stepper Jumpers */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = currentIdx === idx;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-7 w-7 rounded border font-bold text-[11px] transition-all ${
                  isCurrent
                    ? 'border-[#38BDF8] bg-[#38BDF8] text-[#050505]'
                    : isAnswered
                    ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#27272A] bg-[#0A0A0A] text-[#71717A]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {currentIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#050505] font-bold hover:bg-[#38BDF8]/90 transition-all"
          >
            NEXT <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitQuiz}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> EVALUATING...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> SUBMIT_ANSWERS
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
