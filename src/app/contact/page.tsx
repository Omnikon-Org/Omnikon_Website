import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { Mail, Disc as Discord, Github } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us & Community Channels',
  description: 'Get in touch with the Omnikon Core Team, join our Discord community, or open an issue on GitHub.',
  canonicalUrl: '/contact',
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="CONTACT"
        subtitle="Connect with the Omnikon core team, report security vulnerabilities, or join our community channels."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlowCard accentColor="red">
          <div className="space-y-3 text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#27272A] bg-[#121212] text-[#FF3131]">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-mono-terminal text-base font-bold text-white">Direct Email</h3>
            <p className="font-mono-terminal text-xs text-[#A1A1AA]">
              Contact our organizing team directly for partnerships and inquiries.
            </p>
            <a
              href="mailto:team@omnikonhub.com"
              className="inline-flex items-center gap-2 font-mono-terminal text-xs font-bold text-[#FF3131] hover:underline"
            >
              team@omnikonhub.com
            </a>
          </div>
        </GlowCard>

        <GlowCard accentColor="cyan">
          <div className="space-y-3 text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#27272A] bg-[#121212] text-[#38BDF8]">
              <Discord className="h-6 w-6" />
            </div>
            <h3 className="font-mono-terminal text-base font-bold text-white">Discord Community</h3>
            <p className="font-mono-terminal text-xs text-[#A1A1AA]">
              Join active developer channels, hackathon teams, and discussion threads.
            </p>
            <a
              href={SITE_CONFIG.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono-terminal text-xs font-bold text-[#38BDF8] hover:underline"
            >
              JOIN_DISCORD
            </a>
          </div>
        </GlowCard>

        <GlowCard accentColor="green">
          <div className="space-y-3 text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#27272A] bg-[#121212] text-[#22C55E]">
              <Github className="h-6 w-6" />
            </div>
            <h3 className="font-mono-terminal text-base font-bold text-white">GitHub Issues</h3>
            <p className="font-mono-terminal text-xs text-[#A1A1AA]">
              Submit bug reports, feature requests, or open-source pull requests.
            </p>
            <a
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono-terminal text-xs font-bold text-[#22C55E] hover:underline"
            >
              OPEN_GITHUB_ISSUE
            </a>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
