import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug } from '@/lib/data/articles';
import { getRelatedArticles, getRelatedProjects } from '@/lib/data/recommendations';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { MDXRenderer } from '@/lib/mdx/renderer';
import { RelatedContent } from '@/components/discovery/RelatedContent';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { Clock, User, ArrowLeft, Tag as TagIcon, Eye } from 'lucide-react';
import { ViewLogger } from '@/components/analytics/ViewLogger';

export const dynamic = 'force-dynamic';

interface ArticleDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return constructMetadata({ title: 'Article Not Found', noIndex: true });
  }

  const canonicalUrl = `${SITE_CONFIG.url}/blogs/${article.slug}`;

  return constructMetadata({
    title: article.seo_title || article.title,
    description: article.seo_description || article.summary,
    image: article.og_image || article.featured_image || SITE_CONFIG.ogImage,
    canonicalUrl: article.canonical_url || canonicalUrl,
  });
}

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const canonicalUrl = article.canonical_url || `${SITE_CONFIG.url}/blogs/${article.slug}`;

  // Fetch related content concurrently
  const [relatedArticles, relatedProjects] = await Promise.all([
    getRelatedArticles(article.id, article.category_id),
    getRelatedProjects(article.id),
  ]);

  // Structured Data JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': article.type === 'tutorial' ? 'TechArticle' : 'BlogPosting',
    headline: article.title,
    description: article.summary,
    image: [article.featured_image || SITE_CONFIG.ogImage],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author?.full_name || 'Omnikon Contributor',
      url: article.author?.github_username ? `https://github.com/${article.author.github_username}` : SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.legalName,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/assets/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Blogs', item: '/blogs' },
    { name: article.title, item: `/blogs/${article.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <ViewLogger entityType="article_view" entityId={article.id} />
      {/* Inject Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#FF3131] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> RETURN_TO_BLOGS
        </Link>
        <StatusBadge status={article.type} />
      </div>

      <TerminalHeader
        title={article.title}
        subtitle={article.summary}
      />

      {/* Article Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#FF3131]" />
            <span className="text-white font-bold">{article.author?.full_name || 'Omnikon Contributor'}</span>
          </div>
          {article.category && (
            <span className="flex items-center gap-1 text-[#38BDF8]">
              <TagIcon className="h-3.5 w-3.5" />
              {article.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.reading_time_minutes} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {article.views_count} views
          </span>
          <span>{formatDate(article.published_at || article.created_at)}</span>
        </div>
      </div>

      {/* MDX Article Body */}
      <article className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-10 leading-relaxed space-y-4">
        <MDXRenderer content={article.content_mdx} />
      </article>

      {/* Contextual Recommendations Widget */}
      <RelatedContent articles={relatedArticles} projects={relatedProjects} />

      {/* Policy Compliant AdSlot */}
      <AdSlot slotId="article-detail-ad" />
    </div>
  );
}
