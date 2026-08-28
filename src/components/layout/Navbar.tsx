'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Menu, X, Shield, Code, Calendar, Users, BookOpen, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { name: 'Blogs & Articles', href: '/blogs', icon: BookOpen },
  { name: 'Projects', href: '/projects', icon: Code },
  { name: 'Events & Recaps', href: '/events', icon: Calendar },
  { name: 'Members & Directory', href: '/members', icon: Users },
  { name: 'Docs & Guidelines', href: '/docs', icon: Shield },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const dynamicAuthItem = sessionUser
    ? { name: 'Dashboard', href: '/dashboard', icon: UserIcon }
    : { name: 'Sign In', href: '/login', icon: UserIcon };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272A] bg-[#050505]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#FF3131] rounded-md px-1 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#27272A] bg-[#0A0A0A] text-[#FF3131] transition-colors group-hover:border-[#FF3131] group-hover:shadow-[0_0_15px_rgba(255,49,49,0.3)]">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono-terminal text-lg font-extrabold tracking-wider text-white group-hover:text-[#FF3131] transition-colors">
              OMNIKON<span className="text-[#FF3131]">.</span>
            </span>
            <span className="font-mono-terminal text-[10px] text-[#A1A1AA] tracking-widest uppercase">
              SYS.V2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-mono-terminal text-xs font-medium px-3 py-2 rounded-md transition-all duration-150 flex items-center gap-2 border border-transparent',
                  isActive
                    ? 'text-white bg-[#121212] border-[#27272A] shadow-inner text-[#FF3131]'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] hover:border-[#27272A]'
                )}
              >
                <item.icon className={cn('h-3.5 w-3.5', isActive ? 'text-[#FF3131]' : 'text-[#A1A1AA]')} />
                {item.name}
              </Link>
            );
          })}

          <Link
            href={dynamicAuthItem.href}
            className={cn(
              'font-mono-terminal text-xs font-medium px-3 py-2 rounded-md transition-all duration-150 flex items-center gap-2 border border-transparent',
              pathname === dynamicAuthItem.href
                ? 'text-white bg-[#121212] border-[#27272A] shadow-inner text-[#FF3131]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] hover:border-[#27272A]'
            )}
          >
            <dynamicAuthItem.icon className={cn('h-3.5 w-3.5', pathname === dynamicAuthItem.href ? 'text-[#FF3131]' : 'text-[#A1A1AA]')} />
            {dynamicAuthItem.name}
          </Link>
        </nav>

        {/* System Online Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 border border-[#27272A] bg-[#0A0A0A] px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="font-mono-terminal text-[11px] font-medium text-[#A1A1AA]">
            STATUS: <span className="text-[#22C55E]">ONLINE</span>
          </span>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A1A1AA] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF3131] rounded-md"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272A] bg-[#0A0A0A] px-4 pt-2 pb-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'font-mono-terminal text-sm font-medium px-4 py-3 rounded-md flex items-center gap-3 border',
                  isActive
                    ? 'bg-[#121212] text-[#FF3131] border-[#FF3131]/40'
                    : 'text-[#A1A1AA] hover:text-white border-[#27272A]'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          <Link
            href={dynamicAuthItem.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'font-mono-terminal text-sm font-medium px-4 py-3 rounded-md flex items-center gap-3 border',
              pathname === dynamicAuthItem.href
                ? 'bg-[#121212] text-[#FF3131] border-[#FF3131]/40'
                : 'text-[#A1A1AA] hover:text-white border-[#27272A]'
            )}
          >
            <dynamicAuthItem.icon className="h-4 w-4" />
            {dynamicAuthItem.name}
          </Link>
        </div>
      )}
    </header>
  );
}

