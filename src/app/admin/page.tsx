import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { FileText, Plus, CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch real database content status counts
  const [
    { count: draftCount },
    { count: reviewCount },
    { count: publishedCount },
    { count: projectsCount },
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-8">
      <TerminalHeader
        title="CMS_DASHBOARD"
        subtitle="Omnikon Content Management System & Review Queue Overview."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
          >
            <Plus className="h-4 w-4" /> CREATE_ARTICLE
          </Link>
        }
      />

      {/* Real Database Content Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-terminal text-xs">
        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#38BDF8]">
            <span>DRAFTS</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-white">{draftCount || 0}</div>
          <span className="text-[#A1A1AA]">In Progress</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#EAB308]">
            <span>REVIEW QUEUE</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-white">{reviewCount || 0}</div>
          <span className="text-[#A1A1AA]">Awaiting Approval</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span>PUBLISHED</span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-white">{publishedCount || 0}</div>
          <span className="text-[#A1A1AA]">Live Articles</span>
        </div>

        <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
          <div className="flex items-center justify-between text-[#FF3131]">
            <span>PROJECTS</span>
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-white">{projectsCount || 0}</div>
          <span className="text-[#A1A1AA]">Registered Repos</span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-terminal text-xs">
        <GlowCard accentColor="red" className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#FF3131]" /> Article Management
          </h3>
          <p className="text-[#A1A1AA]">
            Draft, review, publish, and manage engineering articles and technical tutorials.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1.5 font-bold text-[#FF3131] hover:underline"
            >
              OPEN_ARTICLE_MANAGER &rarr;
            </Link>
          </div>
        </GlowCard>

        <GlowCard accentColor="cyan" className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#38BDF8]" /> System Audit & Security
          </h3>
          <p className="text-[#A1A1AA]">
            Inspect immutable administrative audit logs and monitor system state changes.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 font-bold text-[#38BDF8] hover:underline"
            >
              VIEW_AUDIT_LOGS &rarr;
            </Link>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
