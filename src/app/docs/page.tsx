import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { DocsViewer } from '@/components/docs/DocsViewer';
import { 
  HeartHandshake, 
  GitPullRequest, 
  ShieldCheck, 
  Scale, 
  ExternalLink,
  BookOpen,
  Terminal,
  FileCode2
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Documentation, Code of Conduct, Contributing & Governance',
  description: 'Official developer guidelines, community Code of Conduct, Contributing workflows, Privacy Policy, and MIT License for Omnikon.',
  canonicalUrl: '/docs',
});

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="COMMUNITY_DOCS_&_GOVERNANCE"
        subtitle="Open standards, community code of conduct, contribution protocols, data protection policy, and open-source licensing."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/Omnikon-Org/Website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white font-mono-terminal text-xs font-bold hover:border-[#38BDF8] transition-all"
            >
              <ExternalLink className="h-4 w-4 text-[#38BDF8]" /> GITHUB_REPOSITORY
            </a>
            <a
              href={SITE_CONFIG.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
            >
              JOIN_DEVELOPER_DISCORD
            </a>
          </div>
        }
      />

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1 font-mono-terminal">
          <div className="flex items-center justify-between text-[#FF3131]">
            <span className="text-[11px] uppercase">ETHICS_STANDARD</span>
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold text-white">Code of Conduct</div>
          <p className="text-[11px] text-[#A1A1AA]">Inclusive & professional space</p>
        </div>

        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1 font-mono-terminal">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[11px] uppercase">DEVELOPER_FLOW</span>
            <GitPullRequest className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold text-white">Contributing Guide</div>
          <p className="text-[11px] text-[#A1A1AA]">Branching, testing & PR review</p>
        </div>

        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1 font-mono-terminal">
          <div className="flex items-center justify-between text-[#38BDF8]">
            <span className="text-[11px] uppercase">DATA_GOVERNANCE</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold text-white">Privacy Policy</div>
          <p className="text-[11px] text-[#A1A1AA]">Zero tracking, RLS security</p>
        </div>

        <div className="p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-1 font-mono-terminal">
          <div className="flex items-center justify-between text-[#EAB308]">
            <span className="text-[11px] uppercase">OPEN_SOURCE</span>
            <Scale className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold text-white">MIT License</div>
          <p className="text-[11px] text-[#A1A1AA]">Permissive developer license</p>
        </div>
      </div>

      {/* Interactive Docs Viewer Component */}
      <DocsViewer />
    </div>
  );
}
