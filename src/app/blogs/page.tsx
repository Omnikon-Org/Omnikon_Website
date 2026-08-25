import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedArticles } from '@/lib/data/articles';
import { getCategories } from '@/lib/data/categories';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { Clock, User, Tag as TagIcon, Search, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Engineering Blogs & Technical Tutorials',
  description: 'Deep-dive software engineering stories, architecture guides, and technical tutorials from Omnikon contributors.',
});

interface BlogsPageProps {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const searchQuery = params.q;

  const [articles, categories] = await Promise.all([
    getPublishedArticles({ categorySlug, searchQuery }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="BLOGS"
        subtitle="Engineering stories, technical tutorials, and architecture breakdowns authored by Omnikon builders."
      />

      {/* Category Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Link
            href="/blogs"
            className={`font-mono-terminal text-xs px-3 py-1.5 rounded-md border transition-all whitespace-nowrap ${
              !categorySlug
                ? 'bg-[#FF3131] text-white border-[#FF3131] font-bold shadow-[0_0_10px_rgba(255,49,49,0.3)]'
                : 'bg-[#121212] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#FF3131]/50'
            }`}
          >
            ALL_CATEGORIES
          </Link>
          {categories.map((cat) => {
            const isSelected = categorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/blogs?category=${cat.slug}`}
                className={`font-mono-terminal text-xs px-3 py-1.5 rounded-md border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#FF3131] text-white border-[#FF3131] font-bold shadow-[0_0_10px_rgba(255,49,49,0.3)]'
                    : 'bg-[#121212] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#FF3131]/50'
                }`}
              >
                {cat.name.toUpperCase()}
              </Link>
            );
          })}
        </div>

        {/* Real Server Full-Text Search Form */}
        <form action="/blogs" method="GET" className="relative shrink-0 md:w-64">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ''}
            placeholder="SEARCH_ARTICLES..."
            className="w-full rounded-md border border-[#27272A] bg-[#121212] py-1.5 pl-8 pr-4 font-mono-terminal text-xs text-white placeholder-[#A1A1AA] focus:border-[#FF3131] focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#A1A1AA]" />
        </form>
      </div>

      {/* Articles Grid / Empty State */}
      {articles.length === 0 ? (
        <EmptyState
          title="NO_ARTICLES_FOUND"
          message={
            searchQuery || categorySlug
              ? 'No published articles matched your search or category filter. Try clearing filters.'
              : 'No articles currently published in the database. Published content will appear here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <GlowCard key={article.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={article.type} />
                  {article.category && (
                    <span className="font-mono-terminal text-[11px] text-[#38BDF8] flex items-center gap-1">
                      <TagIcon className="h-3 w-3" />
                      {article.category.name}
                    </span>
                  )}
                </div>

                <h2 className="font-mono-terminal text-lg font-bold text-white group-hover:text-[#FF3131] transition-colors line-clamp-2">
                  <Link href={`/blogs/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#27272A] space-y-3">
                <div className="flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[#FF3131]" />
                    {article.author?.full_name || 'Omnikon Contributor'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.reading_time_minutes} min read
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono-terminal text-[11px] text-[#A1A1AA]">
                    {formatDate(article.published_at || article.created_at)}
                  </span>
                  <Link
                    href={`/blogs/${article.slug}`}
                    className="font-mono-terminal text-xs font-bold text-[#FF3131] flex items-center gap-1 hover:underline"
                  >
                    READ <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}

      {/* Programmatic AdSlot with CLS Reservoir */}
      <AdSlot slotId="blogs-list-ad" />
    </div>
  );
}
