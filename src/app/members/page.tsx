import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublicProfiles, type Profile } from '@/lib/data/profiles';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { Github, Disc as Discord, User, ShieldCheck, ChevronRight, Crown, Wrench, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Community Member & Contributor Directory',
  description: 'Explore the network of Omnikon co-founders, maintainers, builders, and open-source contributors.',
  canonicalUrl: '/members',
});

function MemberCard({ member }: { member: Profile }) {
  return (
    <GlowCard 
      accentColor={member.is_co_founder ? 'cyan' : member.is_core_team ? 'red' : undefined} 
      className="space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {member.is_co_founder ? (
              <StatusBadge status="co-founder" />
            ) : member.is_core_team ? (
              <StatusBadge status="maintainer" />
            ) : (
              <StatusBadge status={member.developer_tier} />
            )}

            {member.is_core_team && (
              <span className="font-mono-terminal text-[10px] font-bold px-2 py-0.5 rounded border border-[#FF3131]/50 bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-1">
                <Crown className="h-3 w-3" /> CORE TEAM
              </span>
            )}
          </div>

          {member.is_ambassador && !member.is_core_team && (
            <span className="font-mono-terminal text-[11px] text-[#EAB308] flex items-center gap-1 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" /> AMBASSADOR
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${member.username}`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#27272A] bg-[#121212] font-mono-terminal text-sm font-bold text-[#FF3131] hover:border-[#38BDF8] transition-colors shadow-sm"
          >
            {member.avatar_url ? (
              <Image
                src={member.avatar_url}
                alt={member.full_name}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors truncate">
              <Link href={`/profile/${member.username}`}>{member.full_name}</Link>
            </h3>
            <p className="font-mono-terminal text-xs text-[#A1A1AA] truncate">
              <Link href={`/profile/${member.username}`} className="hover:underline">
                @{member.username}
              </Link>
            </p>
          </div>
        </div>

        {member.custom_title && (
          <div className="font-mono-terminal text-[11px] text-[#38BDF8] font-bold">
            {member.custom_title}
          </div>
        )}

        {member.bio && (
          <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
            {member.bio}
          </p>
        )}

        {/* Repositories / Skills Preview */}
        {member.skills && member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {member.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded border border-[#27272A] bg-[#121212] px-2 py-0.5 font-mono-terminal text-[10px] text-[#A1A1AA]">
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="font-mono-terminal text-[10px] text-[#71717A] self-center">
                +{member.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Public Handles & Role */}
      <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-xs">
        <span className="text-[#A1A1AA] uppercase text-[10px] tracking-wider font-semibold">
          ROLE: <span className={member.role === 'admin' ? 'text-[#38BDF8] font-bold' : 'text-white'}>{member.role}</span>
        </span>

        <div className="flex items-center gap-3">
          {member.github_username && (
            <a
              href={`https://github.com/${member.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A1A1AA] hover:text-white transition-colors"
              aria-label={`GitHub profile for ${member.username}`}
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {member.discord_username && (
            <span className="text-[#38BDF8] flex items-center gap-1 text-[11px]" title={`Discord: ${member.discord_username}`}>
              <Discord className="h-3.5 w-3.5" />
            </span>
          )}
          <Link
            href={`/profile/${member.username}`}
            className="text-[#38BDF8] hover:underline flex items-center gap-0.5 text-[11px] font-bold"
          >
            PROFILE <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}

export default async function MembersPage() {
  const members = await getPublicProfiles();

  const coreTeamMembers = members.filter((m) => m.is_core_team);
  const communityContributors = members.filter((m) => !m.is_core_team);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="MEMBERS"
        subtitle="Community member directory, core team co-founders, maintainers, and open-source contributors."
      />

      {members.length === 0 ? (
        <EmptyState
          title="NO_MEMBERS_REGISTERED"
          message="No public member profiles currently registered."
        />
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: CORE TEAM (CO-FOUNDERS & MAINTAINERS) */}
          {coreTeamMembers.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#27272A] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#38BDF8] font-mono-terminal font-bold">&gt;</span>
                    <h2 className="font-mono-terminal text-lg font-bold text-white tracking-wider uppercase">
                      CORE_TEAM &amp; LEADERSHIP ({coreTeamMembers.length})
                    </h2>
                  </div>
                  <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                    Co-Founders with admin roles and core maintainers steering the Omnikon open-source ecosystem.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 font-mono-terminal text-[11px] text-[#38BDF8] font-bold">
                    5 CO-FOUNDERS
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#A855F7]/10 border border-[#A855F7]/30 font-mono-terminal text-[11px] text-[#C084FC] font-bold">
                    4 MAINTAINERS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreTeamMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: COMMUNITY BUILDERS & CONTRIBUTORS */}
          {communityContributors.length > 0 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="text-[#22C55E] font-mono-terminal font-bold">&gt;</span>
                  <h2 className="font-mono-terminal text-lg font-bold text-white tracking-wider uppercase">
                    COMMUNITY_CONTRIBUTORS &amp; BUILDERS ({communityContributors.length})
                  </h2>
                </div>
                <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                  Active developers, students, and engineers contributing code and documentation across Omnikon repositories.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityContributors.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AdSlot slotId="members-list-ad" />
    </div>
  );
}
