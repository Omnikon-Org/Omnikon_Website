import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { BookOpen, Shield, Code, GitPullRequest } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Community Guidelines & Technical Documentation',
  description: 'Official documentation, open-source contribution guidelines, and governance standards for Omnikon.',
  canonicalUrl: '/docs',
});

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="DOCS"
        subtitle="Community standards, developer journey guidelines, and open-source contribution protocols."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlowCard accentColor="red">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-[#FF3131]">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-mono-terminal text-base font-bold text-white">Contribution Workflow</h3>
              <p className="font-mono-terminal text-xs text-[#A1A1AA] leading-relaxed">
                Omnikon operates on a transparent 4-stage content workflow: Draft &rarr; Submit for Review &rarr; Editor Approval &rarr; Publication.
              </p>
            </div>
          </div>
        </GlowCard>

        <GlowCard accentColor="cyan">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-[#38BDF8]">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-mono-terminal text-base font-bold text-white">Developer Journey Tiers</h3>
              <p className="font-mono-terminal text-xs text-[#A1A1AA] leading-relaxed">
                Grow from Student &rarr; Learner &rarr; Builder &rarr; Contributor &rarr; Maintainer by building native projects and authoring technical guides.
              </p>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
