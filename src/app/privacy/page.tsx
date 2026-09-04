import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy',
  description: 'Omnikon Organization Privacy Policy, data protection practices, and user privacy rights.',
  canonicalUrl: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="PRIVACY_POLICY"
        subtitle="Data protection governance, privacy practices, and user rights."
      />

      <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-8 font-mono-terminal text-xs text-[#A1A1AA] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#FF3131]">
            1. Information Collection
          </h2>
          <p>
            Omnikon Organization collects minimal technical information required to authenticate developers, record security audit logs, and serve open-source project metadata. Public profiles include user-submitted GitHub handles, bios, and developer tiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#FF3131]">
            2. Data Usage & Security
          </h2>
          <p>
            Private data (email addresses and IP hash logs) are isolated inside Row-Level Security (RLS) protected storage tables (`profile_private`). We do not sell, license, or monetize private user telemetry.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#FF3131]">
            3. Third-Party Services & Monetization
          </h2>
          <p>
            Our website integrates Google AdSense for policy-compliant programmatic advertising on designated eligible content pages. Google may use cookies to serve ads based on user visits.
          </p>
        </section>
      </div>
    </div>
  );
}
