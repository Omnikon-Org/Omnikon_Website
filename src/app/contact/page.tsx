import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { ContactForm } from '@/components/contact/ContactForm';
import { 
  Mail, 
  Disc as Discord, 
  Github, 
  Linkedin, 
  Twitter, 
  Clock, 
  ShieldAlert, 
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us, Partnerships & Community Channels',
  description: 'Reach the Omnikon Core Team, join our Discord community, collaborate on hackathons, or report security issues.',
  canonicalUrl: '/contact',
});

const FREQUENT_QUESTIONS = [
  {
    q: 'How do I submit a project for an Omnikon Hackathon?',
    a: 'Hackathons are coordinated directly through our official Unstop portals and Discord stage channels. Submissions require open-source GitHub repositories under permissive licenses.',
  },
  {
    q: 'How can our company or college sponsor or host a masterclass?',
    a: 'We welcome partnerships with developer tools, cloud infrastructure, and fintech ecosystems (e.g. Upstox). Reach out via email at contact@omnikonhub.com or submit the dispatch form above.',
  },
  {
    q: 'Where do I report security vulnerabilities?',
    a: 'Please send confidential vulnerability disclosures directly to contact@omnikonhub.com with reproduction steps. We acknowledge security reports within 24 hours.',
  },
  {
    q: 'How do I advance through Developer Journey tiers?',
    a: 'Tiers are updated automatically by contributing verified PRs to Omnikon-Org repositories, participating in technical quizzes, and publishing peer-reviewed blog tutorials.',
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <TerminalHeader
        title="COMMUNICATIONS_GRID // CONTACT"
        subtitle="Connect with the Omnikon core engineering team, join active developer channels, sponsor hackathons, or submit partnerships."
      />

      {/* Main Grid: Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email */}
        <GlowCard accentColor="red" className="p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-[#FF3131]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono-terminal text-sm font-bold text-white">Direct Email</h3>
              <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                Official inquiries, partnerships & masterclasses.
              </p>
            </div>
          </div>
          <a
            href={`mailto:${SITE_CONFIG.contactEmail}`}
            className="font-mono-terminal text-xs text-[#FF3131] font-bold hover:underline break-all"
          >
            {SITE_CONFIG.contactEmail} &rarr;
          </a>
        </GlowCard>

        {/* Discord */}
        <GlowCard accentColor="cyan" className="p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-[#5865F2]">
              <Discord className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono-terminal text-sm font-bold text-white">Discord Community</h3>
              <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                Live voice stages, hackathon teams, and real-time help.
              </p>
            </div>
          </div>
          <a
            href={SITE_CONFIG.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-terminal text-xs text-[#38BDF8] font-bold hover:underline inline-flex items-center gap-1"
          >
            JOIN_DISCORD <ExternalLink className="h-3 w-3" />
          </a>
        </GlowCard>

        {/* LinkedIn */}
        <GlowCard accentColor="cyan" className="p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-[#0A66C2]">
              <Linkedin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono-terminal text-sm font-bold text-white">LinkedIn Organization</h3>
              <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                Official career updates, partnerships, and announcements.
              </p>
            </div>
          </div>
          <a
            href={SITE_CONFIG.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-terminal text-xs text-[#38BDF8] font-bold hover:underline inline-flex items-center gap-1"
          >
            OMNIKON_ORG <ExternalLink className="h-3 w-3" />
          </a>
        </GlowCard>

        {/* Twitter / X */}
        <GlowCard accentColor="green" className="p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#27272A] bg-[#121212] text-white">
              <Twitter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono-terminal text-sm font-bold text-white">Twitter / X</h3>
              <p className="font-sans text-xs text-[#A1A1AA] mt-1">
                Quick updates, build in public snippets, and tech threads.
              </p>
            </div>
          </div>
          <a
            href={SITE_CONFIG.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-terminal text-xs text-[#22C55E] font-bold hover:underline inline-flex items-center gap-1"
          >
            @OmnikonOrg <ExternalLink className="h-3 w-3" />
          </a>
        </GlowCard>
      </div>

      {/* Two Column Layout: Interactive Form + Response SLA & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {/* Response Metrics & Office Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-4 font-mono-terminal text-xs">
            <div className="flex items-center gap-2 text-white font-bold border-b border-[#27272A] pb-3">
              <Clock className="h-4 w-4 text-[#22C55E]" /> RESPONSE_METRICS
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Community Discord:</span>
                <span className="text-[#22C55E] font-bold">&lt; 1 Hour</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Direct Email:</span>
                <span className="text-white font-bold">&lt; 24 Hours</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>GitHub Issues:</span>
                <span className="text-[#38BDF8] font-bold">&lt; 48 Hours</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Security Disclosures:</span>
                <span className="text-[#FF3131] font-bold">&lt; 12 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-3 font-mono-terminal text-xs">
            <div className="flex items-center gap-2 text-white font-bold border-b border-[#27272A] pb-3">
              <ShieldAlert className="h-4 w-4 text-[#FF3131]" /> SECURITY_REPORTING
            </div>
            <p className="text-[#A1A1AA] leading-relaxed">
              Discovered a vulnerability in an Omnikon service or repository? Email our security officers directly at{' '}
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-[#FF3131] underline">
                {SITE_CONFIG.contactEmail}
              </a>{' '}
              with reproducible proof-of-concept steps.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion/Cards */}
      <section className="space-y-4 pt-4 border-t border-[#27272A]">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#38BDF8]" />
          <h2 className="font-mono-terminal text-base font-bold text-white uppercase tracking-wider">
            FREQUENTLY_ASKED_QUESTIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FREQUENT_QUESTIONS.map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-[#27272A] bg-[#0A0A0A] space-y-2">
              <h3 className="font-mono-terminal text-xs font-bold text-white flex items-start gap-2">
                <span className="text-[#38BDF8]">Q:</span> {item.q}
              </h3>
              <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed pl-4">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
