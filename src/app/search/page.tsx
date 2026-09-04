import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { globalSearch } from '@/lib/data/search';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { SearchInput } from '@/components/search/SearchInput';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatDate } from '@/lib/utils';
import { 
  BookOpen, 
  Code, 
  Calendar, 
  Users, 
  Star, 
  GitFork, 
  AlertCircle, 
  ArrowRight,
  Clock,
  User as UserIcon,
  Tag as TagIcon
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Global Ecosystem Search',
  description: 'Search across all published technical articles, open-source repositories, active hackathons, and community member profiles on Omnikon.',
  canonicalUrl: '/search',
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', tab = 'all' } = await searchParams;
  const searchResults = await globalSearch(q);

  const { query, totalResults, articles, projects, events, members } = searchResults;

  const tabs = [
    { id: 'all', label: `ALL (${totalResults})` },
    { id: 'articles', label: `ARTICLES (${articles.length})` },
    { id: 'projects', label: `PROJECTS (${projects.length})` },
    { id: 'events', label: `EVENTS (${events.length})` },
    { id: 'members', label: `MEMBERS (${members.length})` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="GLOBAL_SEARCH"
        subtitle="Full-text discovery across engineering blogs, open-source repositories, hackathons, and member directory."
      />

      {/* Interactive Search Input */}
      <SearchInput initialQuery={query} autoFocus={!query} />

      {query ? (
        <div className="space-y-6">
          {/* Result Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#27272A] pb-3 scrollbar-none font-mono-terminal text-xs">
            {tabs.map((t) => {
              const isSelected = tab === t.id;
              const targetUrl = `/search?q=${encodeURIComponent(query)}&tab=${t.id}`;

              return (
                <Link
                  key={t.id}
                  href={targetUrl}
                  className={`px-3 py-1.5 rounded-md border whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#FF3131] text-white border-[#FF3131] font-bold shadow-[0_0_10px_rgba(255,49,49,0.3)]'
                      : 'bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#FF3131]/50'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          {totalResults === 0 ? (
            <EmptyState
              title="NO_SEARCH_MATCHES"
              message={`No records found matching "${query}". Try searching with broader keywords like "Next.js", "Supabase", "Hackathon", or "Open Source".`}
            />
          ) : (
            <div className="space-y-8">
              {/* Articles Group */}
              {(tab === 'all' || tab === 'articles') && articles.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 font-mono-terminal text-sm font-bold text-white uppercase border-b border-[#27272A] pb-2">
                    <BookOpen className="h-4 w-4 text-[#FF3131]" /> Technical Articles ({articles.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((art) => (
                      <GlowCard key={art.id} className="flex flex-col justify-between space-y-3 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <StatusBadge status={art.type} />
                            {art.category && (
                              <span className="font-mono-terminal text-[11px] text-[#38BDF8] flex items-center gap-1">
                                <TagIcon className="h-3 w-3" /> {art.category.name}
                              </span>
                            )}
                          </div>
                          <h4 className="font-mono-terminal text-base font-bold text-white hover:text-[#FF3131] transition-colors">
                            <Link href={`/blogs/${art.slug}`}>{art.title}</Link>
                          </h4>
                          <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {art.reading_time_minutes} min read
                          </span>
                          <Link href={`/blogs/${art.slug}`} className="text-[#FF3131] font-bold hover:underline flex items-center gap-1">
                            READ <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Group */}
              {(tab === 'all' || tab === 'projects') && projects.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 font-mono-terminal text-sm font-bold text-white uppercase border-b border-[#27272A] pb-2">
                    <Code className="h-4 w-4 text-[#38BDF8]" /> Open Source Projects ({projects.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <GlowCard key={proj.id} accentColor="cyan" className="flex flex-col justify-between space-y-3 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-mono-terminal text-xs text-[#38BDF8] font-bold">
                            <span>{proj.github_repo_name}</span>
                          </div>
                          <h4 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors">
                            <Link href={`/projects/${proj.slug}`}>{proj.name}</Link>
                          </h4>
                          <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                            {proj.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[#EAB308]">
                              <Star className="h-3 w-3 fill-[#EAB308]" /> {proj.stars_count}
                            </span>
                            <span className="flex items-center gap-1 text-[#38BDF8]">
                              <GitFork className="h-3 w-3" /> {proj.forks_count}
                            </span>
                            <span className="flex items-center gap-1 text-[#FF3131]">
                              <AlertCircle className="h-3 w-3" /> {proj.open_issues_count}
                            </span>
                          </div>
                          <Link href={`/projects/${proj.slug}`} className="text-[#38BDF8] font-bold hover:underline flex items-center gap-1">
                            DETAILS <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Events Group */}
              {(tab === 'all' || tab === 'events') && events.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 font-mono-terminal text-sm font-bold text-white uppercase border-b border-[#27272A] pb-2">
                    <Calendar className="h-4 w-4 text-[#22C55E]" /> Hackathons & Events ({events.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((ev) => (
                      <GlowCard key={ev.id} accentColor="green" className="flex flex-col justify-between space-y-3 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <StatusBadge status={ev.status_label || 'Upcoming'} />
                            <span className="font-mono-terminal text-[11px] text-[#22C55E] uppercase font-bold">{ev.event_type}</span>
                          </div>
                          <h4 className="font-mono-terminal text-base font-bold text-white hover:text-[#22C55E] transition-colors">
                            <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                          </h4>
                          <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                            {ev.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-[11px] text-[#A1A1AA]">
                          <span>{formatDate(ev.start_date)}</span>
                          <Link href={`/events/${ev.slug}`} className="text-[#22C55E] font-bold hover:underline flex items-center gap-1">
                            VIEW <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </GlowCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Members Group */}
              {(tab === 'all' || tab === 'members') && members.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 font-mono-terminal text-sm font-bold text-white uppercase border-b border-[#27272A] pb-2">
                    <Users className="h-4 w-4 text-[#EAB308]" /> Community Members ({members.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((mem) => (
                      <GlowCard key={mem.id} className="flex items-center justify-between p-4 font-mono-terminal text-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#27272A] bg-[#121212] font-bold text-[#FF3131]">
                            {mem.avatar_url ? (
                              <Image src={mem.avatar_url} alt={mem.full_name} width={40} height={40} className="h-full w-full object-cover" />
                            ) : (
                              <UserIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-white hover:text-[#38BDF8]">
                              <Link href={`/profile/${mem.username}`}>{mem.full_name}</Link>
                            </h4>
                            <span className="text-[#A1A1AA]">@{mem.username}</span>
                          </div>
                        </div>
                        <StatusBadge status={mem.developer_tier} />
                      </GlowCard>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Default State with Suggested Discovery Keywords */
        <div className="p-8 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center font-mono-terminal text-xs text-[#A1A1AA] space-y-4">
          <p className="font-bold text-white uppercase text-sm">POPULAR_DISCOVERY_TOPICS</p>
          <p className="text-[#A1A1AA] max-w-md mx-auto">
            Search our ecosystem by topic, technology stack, hackathon problem statements, or contributor handle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['Next.js', 'Supabase', 'TypeScript', 'Tailwind', 'Hackathon', 'Good First Issue', 'Python', 'RLS', 'Cyberpunk'].map((keyword) => (
              <Link
                key={keyword}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#121212] text-white hover:border-[#FF3131] hover:text-[#FF3131] transition-all"
              >
                #{keyword}
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot slotId="search-results-ad" />
    </div>
  );
}
