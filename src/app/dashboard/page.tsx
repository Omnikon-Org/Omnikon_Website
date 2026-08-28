import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { ProfileSettings } from '@/components/dashboard/ProfileSettings';
import { CheckSquare, Square, ChevronRight, User, Terminal, BookOpen, Code, Calendar, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MemberDashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the user's profile
  const { data: profile, error: dbError } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      bio,
      github_username,
      discord_username,
      website_url,
      role,
      developer_tier
    `)
    .eq('id', user.id)
    .maybeSingle();

  if (dbError || !profile) {
    // If the database trigger hasn't finished seeding or there was an error, redirect to login
    redirect('/login');
  }

  // Compute onboarding checklist status
  const checklist = [
    { label: 'Register Omnikon Account', done: true },
    { label: 'Complete Developer Profile (set Bio & GitHub)', done: !!(profile.bio && profile.github_username) },
    { label: 'Explore Active Repositories', done: false, href: '/projects', btnLabel: 'Browse Projects' },
    { label: 'Contribute to Good First Issues', done: false, href: '/projects', btnLabel: 'Find Issues' },
    { label: 'Attend Hackathons & Study Tutorials', done: false, href: '/events', btnLabel: 'Explore Events' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <TerminalHeader
        title="DEVELOPER_DASHBOARD"
        subtitle={`Welcome to the ecosystem, user_${profile.username}. Access tools, contributions, and community pathways.`}
        action={
          (profile.role === 'admin' || profile.role === 'editor') ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 shadow-[0_0_15px_rgba(255,49,49,0.3)] transition-all"
            >
              <LayoutGrid className="h-4 w-4" /> ADMIN_CMS_PANEL
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Onboarding and Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard accentColor="red" className="space-y-4">
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#FF3131]" /> Welcome to Omnikon
            </h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              You are officially connected to Omnikon 2.0. As a student-powered open-source hub, our mission is to empower developers to learn by building. Use the roadmap checklist below to guide your onboarding.
            </p>

            <div className="pt-2 border-t border-[#27272A] space-y-3">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded bg-[#050505] border border-[#1c1c1e]"
                >
                  <div className="flex items-center gap-3">
                    {item.done ? (
                      <CheckSquare className="h-4 w-4 text-[#22C55E] shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                    )}
                    <span className={item.done ? 'text-[#A1A1AA] line-through' : 'text-white font-bold'}>
                      {item.label}
                    </span>
                  </div>

                  {!item.done && item.href && (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 font-bold text-[#FF3131] hover:underline shrink-0"
                    >
                      {item.btnLabel} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </GlowCard>

          <ProfileSettings initialProfile={profile} />
        </div>

        {/* Right Column: User Journey Status / Stats */}
        <div className="space-y-6">
          <GlowCard accentColor="green" className="space-y-4">
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-[#EAB308]" /> Developer Credentials
            </h3>

            <div className="space-y-3 pt-2 border-t border-[#27272A]">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">DEV_HANDLE:</span>
                <span className="text-white font-bold">{profile.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">ROLE_PRIVILEGE:</span>
                <span className="text-[#38BDF8] uppercase font-bold">{profile.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">DEV_TIER:</span>
                <span className="text-[#22C55E] uppercase font-bold">{profile.developer_tier}</span>
              </div>
            </div>
          </GlowCard>

          <GlowCard accentColor="cyan" className="space-y-3">
            <h3 className="font-mono-terminal text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="space-y-2.5">
              <Link href="/blogs" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <BookOpen className="h-4 w-4 text-[#38BDF8]" /> Technical Blogs
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <Link href="/projects" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <Code className="h-4 w-4 text-[#38BDF8]" /> Project Catalogues
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <Link href="/events" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-[#38BDF8]" /> Active Events
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
