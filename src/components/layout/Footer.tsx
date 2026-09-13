import React from 'react';
import Link from 'next/link';
import { Terminal, Github, Disc as Discord, Linkedin, Twitter, Mail, Shield, Heart } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#27272A] bg-[#050505] text-[#A1A1AA] pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#27272A]">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#FF3131]">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-mono-terminal text-lg font-bold tracking-wider text-white">
                OMNIKON<span className="text-[#FF3131]">.</span>
              </span>
            </Link>
            <p className="font-mono-terminal text-xs text-[#A1A1AA] max-w-md leading-relaxed">
              Omnikon is an elite developer organization, open-source project ecosystem, hackathon accelerator, and technical knowledge hub built for engineering excellence.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={SITE_CONFIG.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Omnikon LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#38BDF8] hover:border-[#38BDF8] hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-all"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Omnikon Discord Community"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#5865F2] hover:border-[#5865F2] hover:shadow-[0_0_10px_rgba(88,101,242,0.3)] transition-all"
                title="Discord"
              >
                <Discord className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Omnikon on X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-white hover:border-white hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all"
                title="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={SITE_CONFIG.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Omnikon GitHub Organization"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-white hover:border-[#FF3131] hover:shadow-[0_0_10px_rgba(255,49,49,0.3)] transition-all"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.contactEmail}`}
                aria-label="Email Omnikon"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#22C55E] hover:border-[#22C55E] hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all"
                title={`Email: ${SITE_CONFIG.contactEmail}`}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-mono-terminal text-xs font-bold text-white uppercase tracking-widest text-[#FF3131]">
              Ecosystem
            </h3>
            <ul className="space-y-2 font-mono-terminal text-xs">
              <li>
                <Link href="/blogs" className="hover:text-white transition-colors">
                  Engineering Blogs
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Open Source Projects
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Hackathons & Events
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  Community Calendar
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="hover:text-white transition-colors">
                  Technical Quizzes
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-white transition-colors">
                  Member Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h3 className="font-mono-terminal text-xs font-bold text-white uppercase tracking-widest text-[#38BDF8]">
              Docs & Governance
            </h3>
            <ul className="space-y-2 font-mono-terminal text-xs">
              <li>
                <Link href="/docs#conduct" className="hover:text-white transition-colors">
                  Code of Conduct
                </Link>
              </li>
              <li>
                <Link href="/docs#contributing" className="hover:text-white transition-colors">
                  Contributing Guide
                </Link>
              </li>
              <li>
                <Link href="/docs#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/docs#license" className="hover:text-white transition-colors">
                  License (MIT)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 font-mono-terminal text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#22C55E]" />
            <span>SYS.CORE.OS v2.0 &copy; {new Date().getFullYear()} Omnikon Organization. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#A1A1AA]">
            Built with <Heart className="h-3 w-3 text-[#FF3131] fill-[#FF3131] inline mx-0.5" /> for Open Source Developers.
          </div>
        </div>
      </div>
    </footer>
  );
}
