'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { Save, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryOption {
  id: string;
  name: string;
}

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  type: 'article' | 'tutorial' | 'engineering_story' | 'project_story';
  status: 'draft' | 'review' | 'published' | 'archived';
  category_id: string | null;
  reading_time_minutes: number;
}

interface ArticleEditorProps {
  initialData?: ArticleData;
  categories: CategoryOption[];
  userRole: 'contributor' | 'editor' | 'admin' | string;
}

export function ArticleEditor({ initialData, categories, userRole }: ArticleEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [contentMdx, setContentMdx] = useState(initialData?.content_mdx || '');
  const [type, setType] = useState(initialData?.type || 'article');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || (categories[0]?.id || ''));
  const [readingTime, setReadingTime] = useState(initialData?.reading_time_minutes || 5);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const generateSlug = (rawTitle: string) => {
    return rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData?.id) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (targetStatus: 'draft' | 'review' | 'published' | 'archived') => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Contributor security check
    if (userRole === 'contributor' && targetStatus === 'published') {
      setErrorMsg('Unauthorized: Contributors cannot directly publish content. Submit for review instead.');
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg('Authentication session expired. Please log in again.');
        setSaving(false);
        return;
      }

      const payload = {
        title,
        slug,
        summary,
        content_mdx: contentMdx,
        type,
        status: targetStatus,
        category_id: categoryId || null,
        reading_time_minutes: Number(readingTime) || 5,
        author_id: initialData?.id ? undefined : user.id,
      };

      let resError;

      if (initialData?.id) {
        const { error } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', initialData.id);
        resError = error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(payload);
        resError = error;
      }

      if (resError) {
        setErrorMsg(resError.message);
      } else {
        setStatus(targetStatus);
        setSuccessMsg(`Article successfully saved as ${targetStatus.toUpperCase()}.`);
        setTimeout(() => {
          router.push('/admin/articles');
          router.refresh();
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected save error occurred.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#FF3131] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> RETURN_TO_ARTICLE_LIST
      </Link>

      <TerminalHeader
        title={initialData?.id ? 'EDIT_ARTICLE' : 'NEW_ARTICLE'}
        subtitle="Author technical articles, tutorials, and engineering breakdowns using Markdown/MDX."
      />

      <GlowCard className="space-y-5 font-mono-terminal text-xs">
        {errorMsg && (
          <div className="p-3 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase font-bold">ARTICLE TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Building Resilient Microservices with Go"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase font-bold">URL SLUG</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="building-resilient-microservices-with-go"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <label className="text-[#A1A1AA] uppercase font-bold">SHORT SUMMARY</label>
          <textarea
            rows={2}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Concise overview of technical concepts covered..."
            className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
          />
        </div>

        {/* Type & Category & Reading Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase font-bold">CONTENT TYPE</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ArticleData['type'])}
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            >
              <option value="article">ARTICLE</option>
              <option value="tutorial">TUTORIAL</option>
              <option value="engineering_story">ENGINEERING_STORY</option>
              <option value="project_story">PROJECT_STORY</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase font-bold">CATEGORY</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase font-bold">READING TIME (MIN)</label>
            <input
              type="number"
              min={1}
              value={readingTime}
              onChange={(e) => setReadingTime(Number(e.target.value))}
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>
        </div>

        {/* MDX Body Editor */}
        <div className="space-y-1">
          <label className="text-[#A1A1AA] uppercase font-bold">MARKDOWN / MDX CONTENT</label>
          <textarea
            rows={14}
            required
            value={contentMdx}
            onChange={(e) => setContentMdx(e.target.value)}
            placeholder="# Section Heading&#10;&#10;Write technical tutorial using standard Markdown fences..."
            className="w-full rounded border border-[#27272A] bg-[#121212] p-3 text-white font-mono-terminal text-xs focus:border-[#FF3131] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Workflow Controls */}
        <div className="pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-4">
          <div className="text-[#A1A1AA]">
            CURRENT_STATUS: <span className="text-white font-bold uppercase">{status}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#38BDF8] font-bold inline-flex items-center gap-2 transition-all"
            >
              <Save className="h-4 w-4" /> SAVE_DRAFT
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('review')}
              className="px-4 py-2.5 rounded-lg bg-[#EAB308] text-[#050505] font-bold inline-flex items-center gap-2 hover:bg-[#EAB308]/90 transition-all"
            >
              <Send className="h-4 w-4" /> SUBMIT_FOR_REVIEW
            </button>

            {(userRole === 'editor' || userRole === 'admin') && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('published')}
                className="px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-bold inline-flex items-center gap-2 hover:bg-[#FF3131]/90 shadow-[0_0_15px_rgba(255,49,49,0.3)] transition-all"
              >
                <CheckCircle className="h-4 w-4" /> PUBLISH_NOW
              </button>
            )}
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
