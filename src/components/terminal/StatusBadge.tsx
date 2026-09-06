import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'published' 
  | 'review' 
  | 'draft' 
  | 'archived' 
  | 'hackathon' 
  | 'upcoming' 
  | 'completed'
  | 'co-founder'
  | 'maintainer'
  | 'core-team'
  | 'builder'
  | 'contributor'
  | 'learner'
  | 'student';

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
  } else if (normalized === 'co-founder') {
    styles = 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]';
  } else if (normalized === 'maintainer') {
    styles = 'bg-[#A855F7]/15 text-[#C084FC] border-[#A855F7]/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]';
  } else if (normalized === 'core team' || normalized === 'core-team') {
    styles = 'bg-[#FF3131]/15 text-[#FF3131] border-[#FF3131]/50 shadow-[0_0_12px_rgba(255,49,49,0.25)]';
  } else if (normalized === 'builder') {
    styles = 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/40';
  } else if (normalized === 'contributor') {
    styles = 'bg-[#EAB308]/15 text-[#FACC15] border-[#EAB308]/40';
  } else if (normalized === 'learner') {
    styles = 'bg-[#38BDF8]/10 text-[#7DD3FC] border-[#38BDF8]/30';
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
