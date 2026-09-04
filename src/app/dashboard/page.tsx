import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserContributions } from '@/lib/data/contributions';
import { getUserRegistrations } from '@/lib/data/registrations';
import { getPublishedProjects } from '@/lib/data/projects';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { ProfileSettings } from '@/components/dashboard/ProfileSettings';
import { ContributionTimeline } from '@/components/profile/ContributionTimeline';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { 
  CheckSquare, 
  Square, 
  ChevronRight, 
  User, 
  Terminal, 
  BookOpen, 
  Code, 
  Calendar, 
  LayoutGrid, 
  Activity,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const DEVELOPER_JOURNEY_TIERS = ['student', 'learner', 'builder', 'contributor', 'maintainer'];

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
      avatar_url,
      bio,
      github_username,
      discord_username,
      website_url,
      role,
      developer_tier,
      is_ambassador,
      skills,
      technical_interests,
      is_public,
      created_at
    `)
    .eq('id', user.id)
    .maybeSingle();

  if (dbError || !profile) {
    redirect('/login');
  }

  // Parallel data fetching
  const [contributions, registrations, projects] = await Promise.all([
    getUserContributions(user.id),
    getUserRegistrations(user.id),
    getPublishedProjects(),
  ]);

  const recommendedProjects = projects.slice(0, 2);

  // Compute profile completion score
  const profileSteps = [
    { label: 'Register Omnikon Account', done: true },
    { label: 'Set Full Name & Username', done: !!(profile.full_name && profile.username) },
    { label: 'Write Bio', done: !!profile.bio },
    { label: 'Link GitHub Account', done: !!profile.github_username },
    { label: 'Add Verified Skills', done: !!(profile.skills && profile.skills.length > 0) },
    { label: 'Register for First Event / Hackathon', done: registrations.length > 0 },
  ];

  const completedSteps = profileSteps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedSteps / profileSteps.length) * 100);

  const currentTierIndex = DEVELOPER_JOURNEY_TIERS.indexOf(profile.developer_tier);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <TerminalHeader
        title="DEVELOPER_DASHBOARD"
        subtitle={`Welcome to the ecosystem, user_${profile.username}. Access developer tools, contribution history, and hackathons.`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/profile/${profile.username}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
            >
              <User className="h-4 w-4 text-[#38BDF8]" /> VIEW_PUBLIC_PROFILE
            </Link>

            {(profile.role === 'admin' || profile.role === 'editor') && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 shadow-[0_0_15px_rgba(255,49,49,0.3)] transition-all"
              >
                <LayoutGrid className="h-4 w-4" /> ADMIN_CMS_PANEL
              </Link>
            )}
          </div>
        }
      />

      {/* Developer Journey Tier Visualization */}
      <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-white uppercase text-xs flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FF3131]" /> Developer Journey Progression:
          </span>
          <span className="text-[#A1A1AA]">
            CURRENT_TIER: <strong className="text-[#22C55E] uppercase">{profile.developer_tier}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {DEVELOPER_JOURNEY_TIERS.map((tier, idx) => {
            const isCompleted = idx <= currentTierIndex;
            const isCurrent = idx === currentTierIndex;

            return (
              <div
                key={tier}
                className={`p-2.5 rounded border text-center font-mono-terminal text-[11px] uppercase transition-all ${
                  isCurrent
                    ? 'border-[#22C55E] bg-[#22C55E]/10 text-white font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : isCompleted
                    ? 'border-[#27272A] bg-[#121212] text-[#22C55E]'
                    : 'border-[#1C1C1E] bg-[#050505] text-[#71717A]'
                }`}
              >
                0{idx + 1}. {tier}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Onboarding, Settings & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Completion Progress Card */}
          <GlowCard accentColor="red" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#FF3131]" /> Ecosystem Onboarding
              </h3>
              <span className="font-bold text-white">{progressPercent}% COMPLETED</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#18181B] rounded-full h-2 overflow-hidden border border-[#27272A]">
              <div
                className="bg-gradient-to-r from-[#FF3131] to-[#22C55E] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="pt-2 border-t border-[#27272A] space-y-2.5">
              {profileSteps.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-2.5 rounded bg-[#050505] border border-[#1c1c1e]"
                >
                  <div className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckSquare className="h-4 w-4 text-[#22C55E] shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                    )}
                    <span className={item.done ? 'text-[#A1A1AA] line-through' : 'text-white font-bold'}>
                      {item.label}
                    </span>
                  </div>

                  {!item.done && (
                    <a
                      href="#profile-settings"
                      className="font-bold text-[#FF3131] hover:underline shrink-0"
                    >
                      Complete &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Profile Settings Form */}
          <ProfileSettings initialProfile={profile} />

          {/* User Contributions History */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="font-mono-terminal text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#38BDF8]" /> Recent Contribution Activity
              </h3>
              <span className="text-[#A1A1AA]">{contributions.length} Logged Items</span>
            </div>

            <ContributionTimeline contributions={contributions} />
          </div>
        </div>

        {/* Right Column: User Journey Status / Registered Events / Recommended Projects */}
        <div className="space-y-6">
          {/* Developer Credentials Card */}
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
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">VISIBILITY:</span>
                <span className={profile.is_public ? 'text-[#22C55E] font-bold' : 'text-[#A1A1AA]'}>
                  {profile.is_public ? 'PUBLIC' : 'PRIVATE'}
                </span>
              </div>
            </div>
          </GlowCard>

          {/* Registered Events Card */}
          <GlowCard accentColor="cyan" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono-terminal text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> My Event Registrations
              </h3>
              <span className="text-[#38BDF8] font-bold">{registrations.length}</span>
            </div>

            {registrations.length === 0 ? (
              <div className="p-3 rounded bg-[#050505] border border-[#27272A] text-[#A1A1AA] text-center space-y-1">
                <p>No active event registrations.</p>
                <Link href="/events" className="text-[#38BDF8] font-bold hover:underline inline-block">
                  Browse Hackathons &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.slice(0, 3).map((reg) => (
                  <div key={reg.id} className="p-2.5 rounded bg-[#050505] border border-[#27272A] flex items-center justify-between">
                    <span className="text-white font-bold truncate">{reg.event?.title || 'Registered Event'}</span>
                    <Link href="/dashboard/events" className="text-[#38BDF8] hover:underline shrink-0 ml-2">
                      Manage &rarr;
                    </Link>
                  </div>
                ))}
                {registrations.length > 3 && (
                  <Link href="/dashboard/events" className="block text-center text-[#38BDF8] hover:underline pt-1">
                    View All {registrations.length} Registrations &rarr;
                  </Link>
                )}
              </div>
            )}
          </GlowCard>

          {/* Recommended Projects Card */}
          <GlowCard accentColor="red" className="space-y-4">
            <h3 className="font-mono-terminal text-xs font-extrabold text-[#FF3131] uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-4 w-4" /> Recommended Projects
            </h3>

            {recommendedProjects.length === 0 ? (
              <div className="p-3 rounded bg-[#050505] border border-[#27272A] text-[#A1A1AA] text-center">
                <p>No published projects found.</p>
                <Link href="/projects" className="text-[#FF3131] font-bold hover:underline">
                  Browse Catalog &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recommendedProjects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded bg-[#050505] border border-[#27272A] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#38BDF8] font-bold truncate">{proj.name}</span>
                      <Link href={`/projects/${proj.slug}`} className="text-[#FF3131] hover:underline shrink-0 ml-2">
                        Explore &rarr;
                      </Link>
                    </div>
                    <p className="font-sans text-[11px] text-[#A1A1AA] line-clamp-2 leading-relaxed">
                      {proj.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>

          {/* Quick Links Card */}
          <GlowCard className="space-y-3">
            <h3 className="font-mono-terminal text-xs font-extrabold text-white uppercase tracking-wider">
              Ecosystem Navigation
            </h3>
            <div className="space-y-2">
              <Link href="/activity" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <Activity className="h-4 w-4 text-[#38BDF8]" /> Community Activity
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <Link href="/blogs" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <BookOpen className="h-4 w-4 text-[#FF3131]" /> Technical Blogs
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <Link href="/projects" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <Code className="h-4 w-4 text-[#22C55E]" /> Projects Directory
                </span>
                <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <Link href="/events" className="flex items-center justify-between p-2 rounded bg-[#050505] hover:bg-[#121212] transition-colors border border-[#27272A]">
                <span className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-[#EAB308]" /> Hackathons
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
