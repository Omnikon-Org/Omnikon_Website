import React from 'react';
import Link from 'next/link';
import { Database, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'NO_RECORDS_FOUND',
  message = 'No data available in this directory.',
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center space-y-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#27272A] bg-[#121212] text-[#A1A1AA]">
        <Database className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="font-mono-terminal text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          {title}
        </h3>
        <p className="font-mono-terminal text-xs text-[#A1A1AA] max-w-sm">
          {message}
        </p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
        >
          {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
