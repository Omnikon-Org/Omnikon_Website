'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo/metadata';

interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const EXCLUDED_ROUTES = ['/', '/contact', '/privacy', '/terms'];

export function AdSlot({ slotId, format = 'auto', className }: AdSlotProps) {
  const pathname = usePathname();

  // Enforce Route Exclusions (Homepage, Legal, Contact, Referrals)
  const isExcluded =
    EXCLUDED_ROUTES.includes(pathname) ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/admin');

  if (isExcluded) {
    return null;
  }

  return (
    <div
      className={`my-8 min-h-[280px] w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4 flex items-center justify-center text-center ${className || ''}`}
      aria-label="Advertisement Container"
    >
      {/* Production Google AdSense Unit Container */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '280px', width: '100%' }}
        data-ad-client={SITE_CONFIG.adSensePublisherId}
        data-ad-slot={slotId || 'default-slot'}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
