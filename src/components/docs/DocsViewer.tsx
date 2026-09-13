'use client';

import React, { useState, useEffect } from 'react';
import { GlowCard } from '@/components/content/GlowCard';
import { 
  HeartHandshake, 
  GitPullRequest, 
  ShieldCheck, 
  Scale, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Terminal,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

type DocTab = 'conduct' | 'contributing' | 'privacy' | 'license';

const DOC_ITEMS = [
  {
    id: 'conduct' as DocTab,
    label: 'CODE_OF_CONDUCT',
    title: 'Code of Conduct',
    description: 'Community standards, acceptable interactions & enforcement protocols.',
    icon: HeartHandshake,
    accent: 'red' as const,
  },
  {
    id: 'contributing' as DocTab,
    label: 'CONTRIBUTING_GUIDE',
    title: 'Contributing to Omnikon',
    description: 'Forking, branching, coding standards & submitting pull requests.',
    icon: GitPullRequest,
    accent: 'green' as const,
  },
  {
    id: 'privacy' as DocTab,
    label: 'PRIVACY_POLICY',
    title: 'Privacy Policy',
    description: 'Data protection practices, RLS isolation & programmatic ad compliance.',
    icon: ShieldCheck,
    accent: 'cyan' as const,
  },
  {
    id: 'license' as DocTab,
    label: 'LICENSE_MIT',
    title: 'MIT License',
    description: 'Official open-source permissive licensing terms for Omnikon software.',
    icon: Scale,
    accent: 'yellow' as const,
  },
];

export function DocsViewer() {
  const [activeTab, setActiveTab] = useState<DocTab>('conduct');
  const [copied, setCopied] = useState(false);

  // Sync with URL hash if provided
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as DocTab;
      if (['conduct', 'contributing', 'privacy', 'license'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const handleTabChange = (tab: DocTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`);
    }
  };

  const copyLicense = () => {
    const text = `MIT License

Copyright (c) 2026 Omnikon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="space-y-3 lg:col-span-1">
        <div className="font-mono-terminal text-xs text-[#A1A1AA] uppercase tracking-widest px-1">
          NAVIGATION_TREE
        </div>
        <div className="space-y-1.5 font-mono-terminal text-xs">
          {DOC_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-[#121212] border-[#FF3131] text-white font-bold shadow-[0_0_12px_rgba(255,49,49,0.2)]'
                    : 'bg-[#0A0A0A] border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#27272A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#FF3131]' : 'text-[#A1A1AA]'}`} />
                  <span>{item.title}</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-90 text-[#FF3131]' : 'opacity-40'}`} />
              </button>
            );
          })}
        </div>

        {/* Source info */}
        <div className="p-4 rounded-lg border border-[#27272A] bg-[#0A0A0A] font-mono-terminal text-[11px] text-[#A1A1AA] space-y-2">
          <div className="text-white font-bold flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-[#38BDF8]" /> SOURCE_REPOSITORY
          </div>
          <p>
            Documentation synchronized directly with the official Omnikon repository:
          </p>
          <a
            href="https://github.com/Omnikon-Org/Website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#38BDF8] hover:underline"
          >
            Omnikon-Org/Website <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="lg:col-span-3">
        {/* 1. CODE OF CONDUCT */}
        {activeTab === 'conduct' && (
          <GlowCard accentColor="red" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#27272A] pb-4 space-y-1">
              <div className="font-mono-terminal text-xs text-[#FF3131] font-bold">SYS.DOCS // ETHICS_V1</div>
              <h2 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
                Omnikon Community Code of Conduct
              </h2>
              <p className="font-mono-terminal text-xs text-[#A1A1AA]">
                Adapted from the official Omnikon-Org/Website repository guidelines.
              </p>
            </div>

            <div className="space-y-6 font-sans text-sm text-[#D4D4D8] leading-relaxed">
              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> 1. Our Standards
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Omnikon is dedicated to providing a harassment-free, welcoming, and empowering experience for all contributors regardless of experience level, background, gender, sexual orientation, disability, or technology stack.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-terminal text-xs pt-1">
                  <div className="p-3 rounded border border-[#27272A] bg-[#121212]">
                    <span className="text-[#22C55E] font-bold">✓ Be Respectful:</span> Treat peers, mentors, and beginners with empathy and dignity.
                  </div>
                  <div className="p-3 rounded border border-[#27272A] bg-[#121212]">
                    <span className="text-[#22C55E] font-bold">✓ Be Welcoming:</span> Encourage junior student developers asking questions.
                  </div>
                  <div className="p-3 rounded border border-[#27272A] bg-[#121212]">
                    <span className="text-[#22C55E] font-bold">✓ Accept Feedback:</span> Gracefully accept constructive code review comments.
                  </div>
                  <div className="p-3 rounded border border-[#27272A] bg-[#121212]">
                    <span className="text-[#22C55E] font-bold">✓ Professional Collaboration:</span> Focus on software excellence and shared goals.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF3131]" /> 2. Unacceptable Behavior
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  The following behaviors are strictly prohibited across all Omnikon GitHub repositories, Discord voice/text channels, hackathon stages, and community forums:
                </p>
                <ul className="list-disc list-inside space-y-1.5 font-mono-terminal text-xs text-[#F87171] pl-2">
                  <li>Harassment, stalking, or discriminatory jokes and language.</li>
                  <li>Hate speech or personal attacks targeting individuals or groups.</li>
                  <li>Trolling, insulting/derogatory comments, and political disruption.</li>
                  <li>Publishing others&apos; private information (doxxing) without explicit consent.</li>
                  <li>Disruptive behavior in hackathon reviews, spamming, or fraudulent submissions.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> 3. Enforcement & Reporting
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Instances of abusive, harassing, or unacceptable behavior can be reported directly to the Omnikon leadership team at{' '}
                  <a href="mailto:contact@omnikonhub.com" className="text-[#38BDF8] font-bold hover:underline">
                    contact@omnikonhub.com
                  </a>{' '}
                  or by opening a confidential ticket in our{' '}
                  <a href={SITE_CONFIG.discordUrl} target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] font-bold hover:underline">
                    Discord Community
                  </a>. All complaints are reviewed promptly with strict confidentiality.
                </p>
              </div>
            </div>
          </GlowCard>
        )}

        {/* 2. CONTRIBUTING GUIDE */}
        {activeTab === 'contributing' && (
          <GlowCard accentColor="green" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#27272A] pb-4 space-y-1">
              <div className="font-mono-terminal text-xs text-[#22C55E] font-bold">SYS.DOCS // WORKFLOW_V1</div>
              <h2 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
                Contributing to Omnikon
              </h2>
              <p className="font-mono-terminal text-xs text-[#A1A1AA]">
                Thank you for contributing to our student-powered open-source ecosystem!
              </p>
            </div>

            <div className="space-y-6 font-sans text-sm text-[#D4D4D8] leading-relaxed">
              <div className="space-y-3">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Getting Started
                </h3>
                <div className="space-y-2 font-mono-terminal text-xs">
                  <div className="p-3 rounded-lg border border-[#27272A] bg-[#121212] flex items-start gap-3">
                    <span className="text-[#22C55E] font-bold">01.</span>
                    <div>
                      <strong className="text-white">Fork the Repository:</strong> Navigate to{' '}
                      <a href="https://github.com/Omnikon-Org/Website" target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] underline">
                        github.com/Omnikon-Org/Website
                      </a>{' '}
                      and click <em>Fork</em> to your personal GitHub account.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#27272A] bg-[#121212] flex items-start gap-3">
                    <span className="text-[#22C55E] font-bold">02.</span>
                    <div>
                      <strong className="text-white">Clone Your Fork:</strong>
                      <pre className="mt-1 p-2 rounded bg-[#050505] text-[#22C55E] overflow-x-auto">
                        git clone https://github.com/&lt;your-username&gt;/Website.git
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#27272A] bg-[#121212] flex items-start gap-3">
                    <span className="text-[#22C55E] font-bold">03.</span>
                    <div>
                      <strong className="text-white">Create a Feature Branch:</strong>
                      <pre className="mt-1 p-2 rounded bg-[#050505] text-[#22C55E] overflow-x-auto">
                        git checkout -b feature/your-feature-name
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#27272A] bg-[#121212] flex items-start gap-3">
                    <span className="text-[#22C55E] font-bold">04.</span>
                    <div>
                      <strong className="text-white">Install Dependencies & Run Dev Server:</strong>
                      <pre className="mt-1 p-2 rounded bg-[#050505] text-[#22C55E] overflow-x-auto">
                        npm install && npm run dev
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#27272A] bg-[#121212] flex items-start gap-3">
                    <span className="text-[#22C55E] font-bold">05.</span>
                    <div>
                      <strong className="text-white">Commit & Open Pull Request:</strong> Ensure your commits have descriptive messages and submit a PR to the <code>main</code> branch with screenshots or verification evidence.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#38BDF8]" /> Guidelines & Standards
                </h3>
                <ul className="list-disc list-inside space-y-1.5 font-mono-terminal text-xs text-[#A1A1AA] pl-2">
                  <li><strong className="text-white">Follow Project Architecture:</strong> Respect component boundaries, server actions, and type definitions.</li>
                  <li><strong className="text-white">Write Clean Code:</strong> Ensure clean formatting, minimal bundle overhead, and accessible semantic HTML.</li>
                  <li><strong className="text-white">Test Your Changes:</strong> Always verify responsiveness on mobile screens and dark mode palette before pushing.</li>
                  <li><strong className="text-white">Link Related Issues:</strong> Reference issue numbers (e.g. <code>Fixes #42</code>) in PR descriptions.</li>
                </ul>
              </div>
            </div>
          </GlowCard>
        )}

        {/* 3. PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <GlowCard accentColor="cyan" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#27272A] pb-4 space-y-1">
              <div className="font-mono-terminal text-xs text-[#38BDF8] font-bold">SYS.DOCS // PRIVACY_V1</div>
              <h2 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
                Privacy Policy & Data Protection
              </h2>
              <p className="font-mono-terminal text-xs text-[#A1A1AA]">
                How Omnikon handles user authentication, telemetry, and platform security.
              </p>
            </div>

            <div className="space-y-6 font-sans text-sm text-[#D4D4D8] leading-relaxed">
              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase text-[#38BDF8]">
                  1. Information We Collect
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Omnikon collects minimal technical information required to authenticate developers, record security audit logs, verify open-source project submissions, and facilitate hackathon evaluations.
                </p>
                <ul className="list-disc list-inside space-y-1 font-mono-terminal text-xs text-[#A1A1AA] pl-2">
                  <li>Public GitHub profile info (handle, public email, avatar, display name).</li>
                  <li>User-submitted developer profile bios, skills, and portfolio URLs.</li>
                  <li>Quiz submission responses and hackathon project metadata.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase text-[#38BDF8]">
                  2. Row-Level Security (RLS) & Storage
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  All sensitive fields (including email addresses, IP hash audit logs, and account session tokens) are partitioned behind PostgreSQL Row Level Security (RLS) policies. We do not sell, rent, or trade private user telemetry with any third parties.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase text-[#38BDF8]">
                  3. Programmatic Ads & Cookies
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Omnikon integrates Google AdSense to serve non-intrusive developer tools ads. Google and third-party vendors may use cookies to serve ads based on prior web visits. Users can opt out of personalized advertising by visiting Google Ad Settings.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono-terminal text-base font-bold text-white uppercase text-[#38BDF8]">
                  4. Your Rights & Inquiries
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  You have the right to inspect, update, or request deletion of your account data at any time. To exercise these rights, email us at{' '}
                  <a href="mailto:contact@omnikonhub.com" className="text-[#38BDF8] font-bold hover:underline">
                    contact@omnikonhub.com
                  </a>.
                </p>
              </div>
            </div>
          </GlowCard>
        )}

        {/* 4. MIT LICENSE */}
        {activeTab === 'license' && (
          <GlowCard accentColor="cyan" className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#27272A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono-terminal text-xs text-[#EAB308] font-bold">SYS.DOCS // OPEN_SOURCE_LICENSE</div>
                <h2 className="font-mono-terminal text-xl sm:text-2xl font-extrabold text-white">
                  MIT License
                </h2>
                <p className="font-mono-terminal text-xs text-[#A1A1AA]">
                  Official open-source license from Omnikon-Org/Website
                </p>
              </div>

              <button
                type="button"
                onClick={copyLicense}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#27272A] bg-[#121212] font-mono-terminal text-xs text-white hover:border-[#EAB308] transition-all shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#22C55E]" /> COPIED_TO_CLIPBOARD
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#EAB308]" /> COPY_LICENSE_TEXT
                  </>
                )}
              </button>
            </div>

            <div className="p-5 rounded-xl border border-[#27272A] bg-[#050505] font-mono-terminal text-xs text-[#D4D4D8] leading-relaxed space-y-4">
              <div className="text-white font-bold">
                MIT License<br />
                Copyright (c) 2026 Omnikon
              </div>

              <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the &quot;Software&quot;), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
              </p>

              <p>
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
              </p>

              <p className="text-[#A1A1AA]">
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                SOFTWARE.
              </p>
            </div>
          </GlowCard>
        )}
      </div>
    </div>
  );
}
