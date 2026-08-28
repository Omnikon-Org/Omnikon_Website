import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'published' | 'review' | 'draft' | 'archived' | 'hackathon' | 'upcoming' | 'completed';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]';

  if (normalized === 'published' || normalized === 'completed') {
    styles = 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
  } else if (normalized === 'active') {
    styles = 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/30 animate-pulse';
  } else if (normalized === 'review' || normalized === 'upcoming') {
    styles = 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30';
  } else if (normalized === 'draft') {
    styles = 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30';
  } else if (normalized === 'hackathon' || normalized === 'featured') {
    styles = 'bg-[#FF3131]/10 text-[#FF3131] border-[#FF3131]/30';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded border font-mono-terminal text-[11px] font-bold uppercase tracking-wider',
        styles,
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}
