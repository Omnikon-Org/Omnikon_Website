import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service',
  description: 'Omnikon Organization Terms of Service and community code of conduct.',
  canonicalUrl: '/terms',
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <TerminalHeader
        title="TERMS_OF_SERVICE"
        subtitle="Terms of platform usage, community code of conduct, and intellectual property."
      />

      <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 sm:p-8 font-mono-terminal text-xs text-[#A1A1AA] space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#38BDF8]">
            1. Acceptable Use Policy
          </h2>
          <p>
            By accessing Omnikon platforms, contributors agree to adhere to open-source licensing, respect community members, and refrain from submitting malicious code, spam, or unauthorized access attempts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#38BDF8]">
            2. Content Rights & Licensing
          </h2>
          <p>
            Technical articles, tutorials, and open-source project submissions remain the property of their respective authors, licensed under specified open-source licenses (e.g. MIT, Apache 2.0).
          </p>
        </section>
      </div>
    </div>
  );
}
