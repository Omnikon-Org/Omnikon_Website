import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      type,
      status,
      created_at,
      published_at,
      author:profiles!articles_author_id_fkey(username, full_name)
    `)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <TerminalHeader
        title="ARTICLE_MANAGEMENT"
        subtitle="Manage engineering blogs, technical tutorials, and draft workflow states."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all"
          >
            <Plus className="h-4 w-4" /> CREATE_ARTICLE
          </Link>
        }
      />

      {error ? (
        <div className="p-4 rounded border border-[#FF3131] bg-[#FF3131]/10 font-mono-terminal text-xs text-[#FF3131]">
          Failed to load articles: {error.message}
        </div>
      ) : !articles || articles.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA]">
          NO_ARTICLES_FOUND IN DATABASE.
        </div>
      ) : (
        <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] overflow-hidden font-mono-terminal text-xs">
          <table className="w-full text-left">
            <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA]">
              <tr>
                <th className="p-3.5">TITLE</th>
                <th className="p-3.5">TYPE</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">AUTHOR</th>
                <th className="p-3.5">DATE</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {articles.map((art) => {
                const authorData = art.author as unknown as { full_name?: string } | { full_name?: string }[] | null;
                const authorName = Array.isArray(authorData)
                  ? authorData[0]?.full_name
                  : authorData?.full_name || 'Contributor';

                return (
                  <tr key={art.id} className="hover:bg-[#121212]/50 transition-colors">
                    <td className="p-3.5 font-bold text-white max-w-xs truncate">{art.title}</td>
                    <td className="p-3.5"><StatusBadge status={art.type} /></td>
                    <td className="p-3.5"><StatusBadge status={art.status} /></td>
                    <td className="p-3.5 text-[#A1A1AA]">{authorName}</td>
                    <td className="p-3.5 text-[#A1A1AA]">{formatDate(art.published_at || art.created_at)}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        href={`/blogs/${art.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[#38BDF8] hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <Link
                        href={`/admin/articles/${art.id}`}
                        className="inline-flex items-center gap-1 text-[#FF3131] hover:underline font-bold"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
