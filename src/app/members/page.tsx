import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublicProfiles } from '@/lib/data/profiles';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { EmptyState } from '@/components/content/EmptyState';
import { AdSlot } from '@/components/ads/AdSlot';
import { Github, Disc as Discord, User, ShieldCheck, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'Community Member & Contributor Directory',
  description: 'Explore the network of Omnikon builders, contributors, campus ambassadors, and core maintainers.',
  canonicalUrl: '/members',
});

export default async function MembersPage() {
  const members = await getPublicProfiles();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="MEMBERS"
        subtitle="Community member directory, developer tiers, and contributor profiles."
      />

      {members.length === 0 ? (
        <EmptyState
          title="NO_MEMBERS_REGISTERED"
          message="No public member profiles currently registered in the database."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <GlowCard key={member.id} className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={member.developer_tier} />
                  {member.is_ambassador && (
                    <span className="font-mono-terminal text-[11px] text-[#EAB308] flex items-center gap-1 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" /> AMBASSADOR
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/profile/${member.username}`}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#27272A] bg-[#121212] font-mono-terminal text-sm font-bold text-[#FF3131] hover:border-[#FF3131] transition-colors"
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.full_name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Link>
                  <div>
                    <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors">
                      <Link href={`/profile/${member.username}`}>{member.full_name}</Link>
                    </h3>
                    <p className="font-mono-terminal text-xs text-[#A1A1AA]">
                      <Link href={`/profile/${member.username}`} className="hover:underline">
                        @{member.username}
                      </Link>
                    </p>
                  </div>
                </div>

                {member.bio && (
                  <p className="font-sans text-xs text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>
                )}

                {/* Skills Preview */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded border border-[#27272A] bg-[#121212] px-2 py-0.5 font-mono-terminal text-[10px] text-[#A1A1AA]">
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="font-mono-terminal text-[10px] text-[#A1A1AA] self-center">
                        +{member.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Public Handles */}
              <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono-terminal text-xs">
                <span className="text-[#A1A1AA] uppercase text-[10px] tracking-wider font-semibold">
                  ROLE: <span className="text-white">{member.role}</span>
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
          ))}
        </div>
      )}

      <AdSlot slotId="members-list-ad" />
    </div>
  );
}
