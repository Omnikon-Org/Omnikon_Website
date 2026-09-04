import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProfileByUsername } from '@/lib/data/profiles';
import { getUserContributions } from '@/lib/data/contributions';
import { createClient } from '@/lib/supabase/server';
import { constructMetadata, generateBreadcrumbJsonLd, SITE_CONFIG } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { ContributionTimeline } from '@/components/profile/ContributionTimeline';
import { formatDate } from '@/lib/utils';
import { 
  Github, 
  Disc as Discord, 
  Globe, 
  Calendar, 
  User, 
  ShieldCheck, 
  Edit3, 
  Code2, 
  Cpu, 
  ArrowLeft 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile || !profile.is_public) {
    return constructMetadata({ title: 'Developer Profile Not Found', noIndex: true });
  }

  return constructMetadata({
    title: `${profile.full_name} (@${profile.username}) — Omnikon Developer`,
    description: profile.bio || `Explore ${profile.full_name}'s open-source contributions and developer journey on Omnikon.`,
    canonicalUrl: `/profile/${profile.username}`,
  });
}

export default async function ProfileDetailPage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  const isOwner = sessionUser?.id === profile.id;

  // If profile is set to private and visitor is not the owner, hide
  if (!profile.is_public && !isOwner) {
    notFound();
  }

  const contributions = await getUserContributions(profile.id);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    alternateName: profile.username,
    description: profile.bio,
    url: `${SITE_CONFIG.url}/profile/${profile.username}`,
    sameAs: [
      profile.github_username ? `https://github.com/${profile.github_username}` : null,
      profile.website_url || null,
    ].filter(Boolean),
  };

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Members', item: '/members' },
    { name: profile.full_name, item: `/profile/${profile.username}` },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 font-mono-terminal text-xs text-[#A1A1AA] hover:text-[#38BDF8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> RETURN_TO_MEMBERS
        </Link>
        {isOwner && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8] font-mono-terminal text-xs font-bold hover:bg-[#38BDF8]/20 transition-all"
          >
            <Edit3 className="h-3.5 w-3.5" /> EDIT_PROFILE
          </Link>
        )}
      </div>

      {/* Profile Header Hero Card */}
      <GlowCard accentColor="red" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#FF3131] bg-[#121212] font-mono-terminal text-2xl font-extrabold text-[#FF3131] shadow-[0_0_20px_rgba(255,49,49,0.3)]">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
                  {profile.full_name}
                </h1>
                {profile.is_ambassador && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#EAB308]/40 bg-[#EAB308]/10 font-mono-terminal text-[10px] font-bold text-[#EAB308]">
                    <ShieldCheck className="h-3 w-3" /> AMBASSADOR
                  </span>
                )}
              </div>

              <p className="font-mono-terminal text-xs text-[#38BDF8]">
                @{profile.username}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#A1A1AA] font-mono-terminal">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#A1A1AA]" />
                  Joined {formatDate(profile.created_at)}
                </span>
                <span>•</span>
                <span>Contributions: <strong className="text-white">{contributions.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Badges Column */}
          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <StatusBadge status={profile.developer_tier} />
            <StatusBadge status={profile.role} />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="font-sans text-sm text-[#A1A1AA] leading-relaxed border-t border-[#27272A] pt-4">
            {profile.bio}
          </p>
        )}

        {/* Technical Skills & Interests */}
        {((profile.skills && profile.skills.length > 0) || (profile.technical_interests && profile.technical_interests.length > 0)) && (
          <div className="space-y-3 pt-4 border-t border-[#27272A] font-mono-terminal text-xs">
            {profile.skills && profile.skills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[#A1A1AA] text-[11px] uppercase flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-[#38BDF8]" /> Verified Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded border border-[#27272A] bg-[#121212] px-2.5 py-1 text-[11px] text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.technical_interests && profile.technical_interests.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[#A1A1AA] text-[11px] uppercase flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-[#22C55E]" /> Engineering Interests:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.technical_interests.map((interest) => (
                    <span key={interest} className="rounded border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-1 text-[11px] text-[#22C55E]">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* External Social Profiles & Links */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#27272A] font-mono-terminal text-xs">
          {profile.github_username && (
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#27272A] bg-[#121212] text-white hover:border-[#38BDF8] transition-all"
            >
              <Github className="h-4 w-4 text-[#38BDF8]" />
              <span>github.com/{profile.github_username}</span>
            </a>
          )}

          {profile.discord_username && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#27272A] bg-[#121212] text-[#A1A1AA]">
              <Discord className="h-4 w-4 text-[#38BDF8]" />
              <span>{profile.discord_username}</span>
            </div>
          )}

          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#27272A] bg-[#121212] text-white hover:border-[#22C55E] transition-all"
            >
              <Globe className="h-4 w-4 text-[#22C55E]" />
              <span>Portfolio Website</span>
            </a>
          )}
        </div>
      </GlowCard>

      {/* Public Contribution History */}
      <section className="space-y-4">
        <TerminalHeader
          title="CONTRIBUTION_HISTORY"
          subtitle={`Verified ecosystem participation, pull requests, and hackathon milestones for ${profile.full_name}.`}
        />

        <ContributionTimeline contributions={contributions} />
      </section>
    </div>
  );
}
