import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Shield, FileText, Code, Clock, LogOut, Lock, BarChart3, Calendar, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch authenticated user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, developer_tier')
    .eq('id', user.id)
    .maybeSingle();

  // RBAC Boundary: Deny 'member' role from accessing CMS admin suite
  if (!profile || profile.role === 'member') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
          <Lock className="h-7 w-7" />
        </div>
        <div className="space-y-2 font-mono-terminal">
          <span className="text-xs text-[#FF3131] uppercase tracking-widest font-bold">
            ERROR 403 // INSUFFICIENT_PRIVILEGES
          </span>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-xs text-[#A1A1AA]">
            CMS management is restricted to authorized Contributors, Editors, and Admins. Your account tier: <span className="text-white font-bold">{profile?.role || 'member'}</span>.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all"
        >
          RETURN_TO_ROOT
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#27272A] bg-[#0A0A0A] p-6 space-y-6 shrink-0 font-mono-terminal text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF3131] font-bold">
            <Shield className="h-4 w-4" />
            <span>OMNIKON CMS v2.0</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA]">
            User: <span className="text-white">{profile.username}</span> ({profile.role})
          </p>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <Clock className="h-4 w-4 text-[#38BDF8]" /> Dashboard
          </Link>
          <Link
            href="/admin/events"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <Calendar className="h-4 w-4 text-[#22C55E]" /> Events & Hackathons
          </Link>
          <Link
            href="/admin/quizzes"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <Zap className="h-4 w-4 text-[#FF3131]" /> Technical Quizzes
          </Link>
          <Link
            href="/admin/articles"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#EAB308]" /> Article Management
          </Link>
          <Link
            href="/admin/projects"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <Code className="h-4 w-4 text-[#38BDF8]" /> Open Source Projects
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-[#22C55E]" /> Telemetry & Analytics
          </Link>
          {profile.role === 'admin' && (
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#121212] transition-colors"
            >
              <Shield className="h-4 w-4 text-[#EAB308]" /> System Audit Logs
            </Link>
          )}
        </nav>

        <div className="pt-6 border-t border-[#27272A]">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#FF3131] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> SIGN_OUT
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Body */}
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
