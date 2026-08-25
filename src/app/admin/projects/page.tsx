import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Star, GitFork, AlertCircle, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      slug,
      github_repo_name,
      repository_url,
      stars_count,
      forks_count,
      open_issues_count,
      status,
      created_at,
      published_at
    `)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6 font-mono-terminal text-xs">
      <TerminalHeader
        title="PROJECT_MANAGEMENT"
        subtitle="Manage open-source repository listings and repository metrics."
      />

      {error ? (
        <div className="p-4 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131]">
          Failed to load projects: {error.message}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center text-[#A1A1AA]">
          NO_PROJECTS_REGISTERED IN DATABASE.
        </div>
      ) : (
        <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-[#27272A] bg-[#121212] text-[#A1A1AA]">
              <tr>
                <th className="p-3.5">PROJECT NAME</th>
                <th className="p-3.5">GITHUB REPO</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">METRICS</th>
                <th className="p-3.5">DATE</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-[#121212]/50 transition-colors">
                  <td className="p-3.5 font-bold text-white">{proj.name}</td>
                  <td className="p-3.5 text-[#38BDF8]">{proj.github_repo_name}</td>
                  <td className="p-3.5"><StatusBadge status={proj.status} /></td>
                  <td className="p-3.5 text-[#A1A1AA]">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[#EAB308]">
                        <Star className="h-3 w-3 fill-[#EAB308]" /> {proj.stars_count}
                      </span>
                      <span className="flex items-center gap-1 text-[#38BDF8]">
                        <GitFork className="h-3 w-3" /> {proj.forks_count}
                      </span>
                      <span className="flex items-center gap-1 text-[#FF3131]">
                        <AlertCircle className="h-3 w-3" /> {proj.open_issues_count}
                      </span>
                    </span>
                  </td>
                  <td className="p-3.5 text-[#A1A1AA]">{formatDate(proj.published_at || proj.created_at)}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <a
                      href={proj.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#38BDF8] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Repo
                    </a>
                    <Link
                      href={`/projects/${proj.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[#FF3131] hover:underline font-bold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
