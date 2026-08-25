import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: 'red' | 'cyan' | 'green';
}

export function GlowCard({ children, className, accentColor = 'red', ...props }: GlowCardProps) {
  let hoverGlow = 'hover:border-[#FF3131]/60 hover:shadow-[0_0_20px_rgba(255,49,49,0.15)]';

  if (accentColor === 'cyan') {
    hoverGlow = 'hover:border-[#38BDF8]/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]';
  } else if (accentColor === 'green') {
    hoverGlow = 'hover:border-[#22C55E]/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]';
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 transition-all duration-200 hover:bg-[#121212]',
        hoverGlow,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
