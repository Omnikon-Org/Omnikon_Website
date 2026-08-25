import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({ title = 'NO_RECORDS_FOUND', message = 'No data available in this directory.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#27272A] bg-[#121212] text-[#A1A1AA]">
        <Database className="h-5 w-5" />
      </div>
      <h3 className="font-mono-terminal text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
        {title}
      </h3>
      <p className="font-mono-terminal text-xs text-[#A1A1AA] max-w-sm">
        {message}
      </p>
    </div>
  );
}
