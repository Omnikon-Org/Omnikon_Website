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
      className={`my-8 min-h-[160px] sm:min-h-[220px] w-full rounded-xl border border-dashed border-[#FF3131]/50 bg-[#0A0A0A] p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group ${className || ''}`}
      aria-label="Google Ads Placeholder Container"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF3131]/5 via-transparent to-[#FF3131]/5 pointer-events-none" />
      
      <div className="font-mono-terminal text-[11px] text-[#FF3131] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-[#FF3131] animate-pulse" />
        GOOGLE_ADS_PLACEHOLDER
      </div>
      <p className="font-mono-terminal text-xs text-[#A1A1AA] max-w-md">
        [ ADVERTISEMENT SPACE &bull; SLOT_ID: <span className="text-white">{slotId || 'default-slot'}</span> ]
      </p>
      <span className="mt-3 inline-block px-3 py-1 rounded border border-[#27272A] bg-[#121212] font-mono-terminal text-[10px] text-[#71717A]">
        Format: {format} &bull; Publisher: {SITE_CONFIG.adSensePublisherId}
      </span>

      {/* Production Google AdSense Unit Container */}
      <ins
        className="adsbygoogle"
        style={{ display: 'none' }}
        data-ad-client={SITE_CONFIG.adSensePublisherId}
        data-ad-slot={slotId || 'default-slot'}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
