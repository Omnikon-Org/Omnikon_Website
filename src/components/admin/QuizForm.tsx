'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, QuizQuestionFull } from '@/lib/data/quizzes';
import { GlowCard } from '@/components/content/GlowCard';
import { Save, Plus, Trash2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface QuizFormProps {
  initialQuiz?: Partial<Quiz>;
  initialQuestions?: QuizQuestionFull[];
}

interface QuestionDraft {
  id?: string;
  question_text: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
  difficulty: string;
}

export function QuizForm({ initialQuiz, initialQuestions = [] }: QuizFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialQuiz?.title || '',
    slug: initialQuiz?.slug || '',
    description: initialQuiz?.description || '',
    category: initialQuiz?.category || 'JavaScript',
    difficulty: initialQuiz?.difficulty || 'Beginner',
    estimated_duration_minutes: initialQuiz?.estimated_duration_minutes || 10,
    pass_percentage: initialQuiz?.pass_percentage || 70,
    status: initialQuiz?.status || 'published',
  });

  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuestions.length > 0
      ? initialQuestions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_id: q.correct_option_id,
          explanation: q.explanation,
          difficulty: q.difficulty || 'Medium',
        }))
      : [
          {
            question_text: '',
            options: [
              { id: 'a', text: '' },
              { id: 'b', text: '' },
              { id: 'c', text: '' },
              { id: 'd', text: '' },
            ],
            correct_option_id: 'a',
            explanation: '',
            difficulty: 'Medium',
          },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' },
        ],
        correct_option_id: 'a',
        explanation: '',
        difficulty: 'Medium',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question #${i + 1} text cannot be empty.`);
        setIsSubmitting(false);
        return;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setError(`Option ${opt.id.toUpperCase()} in Question #${i + 1} cannot be blank.`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const isNew = !initialQuiz?.id;
      const res = await fetch(isNew ? '/api/admin/quizzes' : `/api/admin/quizzes/${initialQuiz?.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save quiz.');
      }

      setSuccess('Quiz and questions successfully saved!');
      router.refresh();
      if (isNew && data.id) {
        router.push(`/admin/quizzes/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono-terminal text-xs">
      {error && (
        <div className="p-4 rounded-xl border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]">
          {success}
        </div>
      )}

      {/* Quiz Metadata */}
      <GlowCard accentColor="red" className="space-y-4 p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quiz Metadata</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Quiz Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
              placeholder="e.g. JavaScript Core Fundamentals"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
              placeholder="e.g. javascript-core-fundamentals"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="React">React & Next.js</option>
              <option value="DSA">DSA & Algorithms</option>
              <option value="SQL">SQL & Databases</option>
              <option value="Python">Python</option>
              <option value="Architecture">System Design</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Est. Duration (Mins)</label>
            <input
              type="number"
              min={1}
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Pass Percentage (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              value={formData.pass_percentage}
              onChange={(e) => setFormData({ ...formData, pass_percentage: Number(e.target.value) })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#A1A1AA] uppercase">Description</label>
          <textarea
            required
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            placeholder="Overview of concepts evaluated in this quiz"
          />
        </div>
      </GlowCard>

      {/* Quiz Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Quiz Questions ({questions.length})
          </h3>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#38BDF8] text-[#050505] font-bold hover:bg-[#38BDF8]/90 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> ADD_QUESTION
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <GlowCard key={idx} accentColor="cyan" className="space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="font-bold text-white uppercase">QUESTION #{idx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-[#FF3131] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> REMOVE
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] uppercase">Question Text</label>
                <textarea
                  required
                  rows={2}
                  value={q.question_text}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx].question_text = e.target.value;
                    setQuestions(next);
                  }}
                  className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
                  placeholder="e.g. What is the output of typeof null in JavaScript?"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="text-[#A1A1AA] uppercase block">Options (Select Correct Answer radio)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        q.correct_option_id === opt.id
                          ? 'border-[#22C55E] bg-[#22C55E]/10'
                          : 'border-[#27272A] bg-[#050505]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct_opt_${idx}`}
                        checked={q.correct_option_id === opt.id}
                        onChange={() => {
                          const next = [...questions];
                          next[idx].correct_option_id = opt.id;
                          setQuestions(next);
                        }}
                        className="text-[#22C55E] focus:ring-0"
                      />
                      <span className="text-[#A1A1AA] font-bold uppercase">{opt.id.toUpperCase()}:</span>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const next = [...questions];
                          next[idx].options[optIdx].text = e.target.value;
                          setQuestions(next);
                        }}
                        className="w-full bg-transparent text-white focus:outline-none text-xs"
                        placeholder={`Option ${opt.id.toUpperCase()} text`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] uppercase">Detailed Explanation (Returned only after submission)</label>
                <textarea
                  required
                  rows={2}
                  value={q.explanation}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx].explanation = e.target.value;
                    setQuestions(next);
                  }}
                  className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
                  placeholder="Explain why the correct option is right and cite engineering details."
                />
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> COMMITTING...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> COMMIT_QUIZ_AND_QUESTIONS
            </>
          )}
        </button>
      </div>
    </form>
  );
}
