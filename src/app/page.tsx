import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AnalyticsNextLink } from '@/components/analytics/AnalyticsNextLink';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublishedArticles } from '@/lib/data/articles';
import { getPublishedProjects } from '@/lib/data/projects';
import { getPublishedEvents } from '@/lib/data/events';
import { getPublicProfiles } from '@/lib/data/profiles';
import { getPublishedUpdates } from '@/lib/data/updates';
import { getPublishedQuizzes } from '@/lib/data/quizzes';
import { getPublicContributions } from '@/lib/data/contributions';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { SectionHeader } from '@/components/content/SectionHeader';
import { formatDate, formatNumber } from '@/lib/utils';
import { 
  Terminal, 
  ArrowRight, 
  Code, 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Star, 
  GitFork, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  Radio,
  Clock,
  Activity,
  Trophy,
  Award
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Omnikon — Student-Powered Open-Source Developer Community',
  description: 'Omnikon is a student-powered open-source developer community where you learn by building, contribute to real projects, participate in hackathons, and grow as a developer.',
  canonicalUrl: '/',
});

const DEVELOPER_JOURNEY_STAGES = [
  {
    stage: '01. STUDENT',
    tier: 'student',
    title: 'Explore & Learn Fundamentals',
    description: 'Access high-quality engineering tutorials, open-source guidelines, and community discord channels.',
    color: 'text-[#A1A1AA]',
    borderColor: 'border-[#27272A]',
    actionLabel: 'EXPLORE_GUIDES',
    actionHref: '/docs',
  },
  {
    stage: '02. LEARNER',
    tier: 'learner',
    title: 'Study System Architectures',
    description: 'Read deep-dive tech articles, break down open-source codebases, and participate in hackathon workshops.',
    color: 'text-[#38BDF8]',
    borderColor: 'border-[#38BDF8]/40',
    actionLabel: 'READ_TUTORIALS',
    actionHref: '/blogs',
  },
  {
    stage: '03. BUILDER',
    tier: 'builder',
    title: 'Build Native Projects',
    description: 'Ship full-stack applications, submit hackathon projects, and earn contributor reputation badges.',
    color: 'text-[#22C55E]',
    borderColor: 'border-[#22C55E]/40',
    actionLabel: 'EXPLORE_REPOS',
    actionHref: '/projects',
  },
  {
    stage: '04. CONTRIBUTOR',
    tier: 'contributor',
    title: 'Author Pull Requests',
    description: 'Write peer-reviewed technical articles, contribute to good-first-issues, and review community submissions.',
    color: 'text-[#EAB308]',
    borderColor: 'border-[#EAB308]/40',
    actionLabel: 'START_CONTRIBUTING',
    actionHref: '/projects',
  },
  {
    stage: '05. MAINTAINER',
    tier: 'maintainer',
    title: 'Steer Open Source Ecosystems',
    description: 'Lead core repository governance, mentor emerging builders, and publish official engineering standards.',
    color: 'text-[#FF3131]',
    borderColor: 'border-[#FF3131]/60',
    actionLabel: 'CONNECT_LEADS',
    actionHref: '/contact',
  },
];

export default async function HomePage() {
  const [articles, projects, events, members, updates, quizzes, contributions] = await Promise.all([
    getPublishedArticles(),
    getPublishedProjects(),
    getPublishedEvents(),
    getPublicProfiles(),
    getPublishedUpdates(),
    getPublishedQuizzes(),
    getPublicContributions(4),
  ]);

  const featuredArticles = articles.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  const activeEvent = events.find((e) => e.status_label === 'Upcoming' || e.status_label === 'Active') || events[0];
  const featuredQuiz = quizzes[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. HERO SECTION */}
      <section className="space-y-8">
        <TerminalHeader
          title="OMNIKON"
          subtitle="Omnikon is a student-powered open-source developer community where you learn by building, contribute to real projects, participate in hackathons, and grow as a developer."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <AnalyticsNextLink
                href="/projects"
                entityType="primary_cta_click"
                entityId="00000000-0000-0000-0000-000000000000"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 shadow-[0_0_20px_rgba(255,49,49,0.4)] transition-all"
              >
                EXPLORE_PROJECTS <ArrowRight className="h-4 w-4" />
              </AnalyticsNextLink>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#22C55E] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#22C55E]/90 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
              >
                <Calendar className="h-4 w-4" /> COMMUNITY_EVENTS
              </Link>
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
              >
                <Zap className="h-4 w-4 text-[#38BDF8]" /> TAKE_A_QUIZ
              </Link>
            </div>
          }
        />

        {/* Hero Mission Statement Card */}
        <div className="rounded-xl border border-[#27272A] bg-gradient-to-r from-[#0A0A0A] via-[#121212] to-[#0A0A0A] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#FF3131] uppercase tracking-widest font-bold">
              <Sparkles className="h-4 w-4 text-[#FF3131]" /> THE_DIGITAL_HOME_OF_STUDENT_BUILDERS
            </div>
            <h2 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
              Learn by Building. Ship Open Source. Compete in Hackathons.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#A1A1AA] max-w-3xl leading-relaxed">
              Omnikon is engineered to bridge the gap between classroom theory and real-world software engineering. We host student hackathons, publish peer-reviewed tech articles, run skill validation quizzes, and connect you directly to active beginner-friendly repositories.
            </p>
          </div>

          <div className="shrink-0 font-mono-terminal text-xs text-right border-t md:border-t-0 md:border-l border-[#27272A] pt-4 md:pt-0 md:pl-6 space-y-1">
            <div className="text-[#A1A1AA]">SYS_BUILD: <span className="text-white">v2.0.0-PROD</span></div>
            <div className="text-[#A1A1AA]">COMMUNITY: <span className="text-[#22C55E]">STUDENT_POWERED</span></div>
            <div className="text-[#A1A1AA]">ORGANIZATION: <span className="text-[#38BDF8]">OMNIKON-ORG</span></div>
          </div>
        </div>

        {/* Core Ecosystem Landmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/events" className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#22C55E]/60 transition-all space-y-2 block">
            <div className="font-mono-terminal text-[10px] text-[#22C55E] tracking-widest font-bold">01. PARTICIPATE</div>
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase">Hackathons & Events</h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Fast-paced coding competitions, problem statement tracks, workshops, and prizes.
            </p>
          </Link>

          <Link href="/quizzes" className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#38BDF8]/60 transition-all space-y-2 block">
            <div className="font-mono-terminal text-[10px] text-[#38BDF8] tracking-widest font-bold">02. VALIDATE</div>
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase">Technical Quizzes</h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Test skills in JS, React, DSA, SQL, and earn rank points on the community leaderboard.
            </p>
          </Link>

          <Link href="/projects" className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#FF3131]/60 transition-all space-y-2 block">
            <div className="font-mono-terminal text-[10px] text-[#FF3131] tracking-widest font-bold">03. CONTRIBUTE</div>
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase">Open Source Repos</h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Explore beginner-friendly issues on GitHub and submit verified pull requests.
            </p>
          </Link>

          <Link href="/blogs" className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#EAB308]/60 transition-all space-y-2 block">
            <div className="font-mono-terminal text-[10px] text-[#EAB308] tracking-widest font-bold">04. LEARN</div>
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase">Tech Articles</h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Peer-reviewed engineering guides, tutorials, and system design breakdowns.
            </p>
          </Link>

          <Link href="/members" className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] hover:border-[#A1A1AA]/60 transition-all space-y-2 block">
            <div className="font-mono-terminal text-[10px] text-[#A1A1AA] tracking-widest font-bold">05. PROGRESS</div>
            <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase">Developer Profile</h3>
            <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
              Earn developer journey tiers based on verified code contributions and achievements.
            </p>
          </Link>
        </div>
      </section>

      {/* 2. HAPPENING AT OMNIKON (DYNAMIC COMMUNITY ACTIVITY STREAM) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <SectionHeader
            tag="LIVE_COMMUNITY_PULSE"
            title="Happening at Omnikon Right Now"
            description="Active hackathons, technical quizzes, workshops, and verified contributor milestones."
          />
          <Link
            href="/calendar"
            className="hidden sm:inline-flex items-center gap-1 font-mono-terminal text-xs text-[#38BDF8] font-bold hover:underline"
          >
            VIEW_FULL_SCHEDULE <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Featured Active/Upcoming Event */}
          {activeEvent ? (
            <GlowCard accentColor="green" className="flex flex-col justify-between space-y-4 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono-terminal text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold border border-[#22C55E]/40">
                    <Radio className="h-3 w-3 animate-pulse" /> {activeEvent.status_label || 'ACTIVE'}
                  </span>
                  <span className="text-[#38BDF8] uppercase font-bold">{activeEvent.event_type}</span>
                </div>

                <h3 className="font-mono-terminal text-lg font-bold text-white hover:text-[#22C55E] transition-colors">
                  <Link href={`/events/${activeEvent.slug}`}>{activeEvent.title}</Link>
                </h3>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                  {activeEvent.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272A] space-y-2 font-mono-terminal text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                  <span className="flex items-center gap-1 text-white">
                    <Calendar className="h-3.5 w-3.5 text-[#38BDF8]" /> {formatDate(activeEvent.start_date)}
                  </span>
                  <span className="text-[#22C55E]">{activeEvent.registrations_count || 0} Registered</span>
                </div>

                <Link
                  href={`/events/${activeEvent.slug}`}
                  className="w-full text-center block py-2 rounded-lg bg-[#22C55E] text-[#050505] font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  EXPLORE_EVENT &rarr;
                </Link>
              </div>
            </GlowCard>
          ) : (
            <div className="p-6 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA]">
              No active events right now. Check back soon!
            </div>
          )}

          {/* Card 2: Featured Technical Quiz Challenge */}
          {featuredQuiz ? (
            <GlowCard accentColor="red" className="flex flex-col justify-between space-y-4 p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono-terminal text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF3131]/20 text-[#FF3131] font-bold border border-[#FF3131]/40">
                    <Zap className="h-3 w-3" /> FEATURED_CHALLENGE
                  </span>
                  <span className="text-[#EAB308] uppercase font-bold">{featuredQuiz.difficulty}</span>
                </div>

                <h3 className="font-mono-terminal text-lg font-bold text-white hover:text-[#FF3131] transition-colors">
                  <Link href={`/quizzes/${featuredQuiz.slug}`}>{featuredQuiz.title}</Link>
                </h3>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                  {featuredQuiz.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272A] space-y-2 font-mono-terminal text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                  <span className="text-[#38BDF8]">Category: {featuredQuiz.category}</span>
                  <span className="text-white">~{featuredQuiz.estimated_duration_minutes} mins</span>
                </div>

                <Link
                  href={`/quizzes/${featuredQuiz.slug}`}
                  className="w-full text-center block py-2 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_10px_rgba(255,49,49,0.3)]"
                >
                  START_QUIZ_NOW &rarr;
                </Link>
              </div>
            </GlowCard>
          ) : (
            <div className="p-6 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA]">
              No active quizzes at the moment.
            </div>
          )}

          {/* Card 3: Live Community Contribution Stream */}
          <GlowCard accentColor="cyan" className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono-terminal text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-[#38BDF8] font-bold">
                  <Activity className="h-3.5 w-3.5" /> RECENT_MILESTONES
                </span>
                <Link href="/activity" className="text-[#A1A1AA] hover:text-white">
                  Live Feed &rarr;
                </Link>
              </div>

              {contributions.length === 0 ? (
                <p className="font-sans text-xs text-[#A1A1AA]">
                  No recent public milestones recorded yet. Be the first to register an achievement!
                </p>
              ) : (
                <div className="space-y-2.5 font-mono-terminal text-xs">
                  {contributions.map((c) => (
                    <div key={c.id} className="p-2.5 rounded bg-[#050505] border border-[#27272A] flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-white font-bold block truncate">{c.title}</span>
                        <span className="text-[10px] text-[#71717A]">
                          @{c.user?.username || 'member'} &bull; {formatDate(c.created_at)}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] shrink-0 font-bold">
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#27272A] font-mono-terminal text-xs">
              <Link
                href="/activity"
                className="w-full text-center block py-2 rounded-lg border border-[#27272A] bg-[#121212] text-white hover:border-[#38BDF8] transition-all"
              >
                VIEW_COMMUNITY_FEED &rarr;
              </Link>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* 3. LIVE OMNIKON METRICS */}
      <section className="space-y-4">
        <SectionHeader
          tag="REAL_TIME_METRICS"
          title="Live System Statistics"
          description="Verified counts fetched directly from Supabase PostgreSQL database."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono-terminal text-[11px] text-[#A1A1AA] uppercase">DATABASE METRICS</span>
              <BookOpen className="h-4 w-4 text-[#FF3131]" />
            </div>
            <div className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white">
              {articles.length}
            </div>
            <div className="font-mono-terminal text-[11px] text-[#A1A1AA]">Published Articles</div>
          </div>

          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono-terminal text-[11px] text-[#A1A1AA] uppercase">DATABASE METRICS</span>
              <Code className="h-4 w-4 text-[#38BDF8]" />
            </div>
            <div className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white">
              {projects.length}
            </div>
            <div className="font-mono-terminal text-[11px] text-[#A1A1AA]">Open Source Projects</div>
          </div>

          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono-terminal text-[11px] text-[#A1A1AA] uppercase">DATABASE METRICS</span>
              <Calendar className="h-4 w-4 text-[#22C55E]" />
            </div>
            <div className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white">
              {events.length}
            </div>
            <div className="font-mono-terminal text-[11px] text-[#A1A1AA]">Events & Hackathons</div>
          </div>

          <div className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono-terminal text-[11px] text-[#A1A1AA] uppercase">DATABASE METRICS</span>
              <Users className="h-4 w-4 text-[#EAB308]" />
            </div>
            <div className="font-mono-terminal text-2xl sm:text-3xl font-extrabold text-white">
              {members.length}
            </div>
            <div className="font-mono-terminal text-[11px] text-[#A1A1AA]">Verified Members</div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED TECHNICAL CONTENT */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <SectionHeader
            tag="ENGINEERING_JOURNAL"
            title="Featured Technical Articles"
            description="Peer-reviewed software architecture guides and production tutorials."
          />
          <Link
            href="/blogs"
            className="hidden sm:inline-flex items-center gap-1 font-mono-terminal text-xs text-[#FF3131] font-bold hover:underline"
          >
            VIEW_ALL_ARTICLES <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredArticles.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA]">
            NO_FEATURED_ARTICLES_PUBLISHED
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((art) => (
              <GlowCard key={art.id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={art.type} />
                    {art.category && (
                      <span className="font-mono-terminal text-[11px] text-[#38BDF8]">
                        {art.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-mono-terminal text-base font-bold text-white group-hover:text-[#FF3131] transition-colors line-clamp-2">
                    <Link href={`/blogs/${art.slug}`}>{art.title}</Link>
                  </h3>
                  <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                  <span>{formatDate(art.published_at || art.created_at)}</span>
                  <Link href={`/blogs/${art.slug}`} className="text-[#FF3131] font-bold hover:underline">
                    READ &rarr;
                  </Link>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </section>

      {/* 5. OPEN SOURCE PROJECTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <SectionHeader
            tag="OPEN_SOURCE_ECOSYSTEM"
            title="Featured Open Source Projects"
            description="Native repositories maintained by Omnikon developers."
          />
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1 font-mono-terminal text-xs text-[#38BDF8] font-bold hover:underline"
          >
            EXPLORE_ALL_PROJECTS <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA]">
            NO_FEATURED_PROJECTS_REGISTERED
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <GlowCard key={project.id} accentColor="cyan" className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-terminal text-xs font-bold text-[#38BDF8]">
                      {project.github_repo_name}
                    </span>
                    {project.is_featured && <StatusBadge status="featured" />}
                  </div>
                  <h3 className="font-mono-terminal text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                    <Link href={`/projects/${project.slug}`}>{project.name}</Link>
                  </h3>
                  <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-xs text-[#A1A1AA]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#EAB308]">
                      <Star className="h-3.5 w-3.5 fill-[#EAB308]" /> {formatNumber(project.stars_count)}
                    </span>
                    <span className="flex items-center gap-1 text-[#38BDF8]">
                      <GitFork className="h-3.5 w-3.5" /> {formatNumber(project.forks_count)}
                    </span>
                  </div>
                  <Link href={`/projects/${project.slug}`} className="text-[#38BDF8] font-bold hover:underline">
                    DETAILS &rarr;
                  </Link>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </section>

      {/* 6. DEVELOPER JOURNEY */}
      <section className="space-y-6">
        <SectionHeader
          tag="DEVELOPER_PATHWAY"
          title="The Omnikon Developer Journey"
          description="A structured 5-stage progression model from learner to open-source maintainer."
        />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DEVELOPER_JOURNEY_STAGES.map((stg) => (
            <div
              key={stg.stage}
              className={`p-5 rounded-xl border ${stg.borderColor} bg-[#0A0A0A] space-y-3 hover:bg-[#121212] transition-all flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <span className={`font-mono-terminal text-[11px] font-bold ${stg.color}`}>
                  {stg.stage}
                </span>
                <h3 className="font-mono-terminal text-sm font-bold text-white leading-snug">
                  {stg.title}
                </h3>
                <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed">
                  {stg.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#27272A] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={stg.tier} />
                </div>
                <Link
                  href={stg.actionHref}
                  className="w-full text-center py-1.5 rounded border border-[#27272A] hover:border-white font-mono-terminal text-[10px] text-[#A1A1AA] hover:text-white transition-all"
                >
                  {stg.actionLabel} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. RECENT UPDATES FEED */}
      {updates.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            tag="COMMUNITY_FEED"
            title="System Updates & Announcements"
            description="Official updates published by Omnikon editors."
          />

          <div className="space-y-3">
            {updates.slice(0, 3).map((up) => (
              <div key={up.id} className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-terminal text-[11px] text-[#FF3131] font-bold">UPDATES</span>
                    <h4 className="font-mono-terminal text-sm font-bold text-white">{up.title}</h4>
                  </div>
                  <p className="font-sans text-xs text-[#A1A1AA]">{up.content_mdx}</p>
                </div>
                <span className="font-mono-terminal text-[11px] text-[#A1A1AA] shrink-0">
                  {formatDate(up.published_at || up.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. FINAL CONVERSION CTA */}
      <section className="rounded-2xl border border-[#27272A] bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF3131]/40 bg-[#121212] text-[#FF3131]">
          <Terminal className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="font-mono-terminal text-xs font-bold text-[#FF3131] uppercase tracking-widest">
            JOIN_THE_ECOSYSTEM
          </span>
          <h2 className="font-mono-terminal text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Build Production-Grade Open Source?
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Explore engineering tutorials, contribute to good-first-issues, participate in hackathons, or test your skills with technical quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#22C55E] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            EXPLORE_HACKATHONS <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_20px_rgba(255,49,49,0.3)]"
          >
            TAKE_A_QUIZ
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
          >
            BROWSE_REPOSITORIES
          </Link>
        </div>
      </section>
    </div>
  );
}
