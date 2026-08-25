import React from 'react';
import { Terminal } from 'lucide-react';

export function LoadingState({ message = 'FETCHING_SYSTEM_DATA...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#FF3131]/40 bg-[#121212] text-[#FF3131] animate-pulse">
        <Terminal className="h-6 w-6" />
      </div>
      <div className="font-mono-terminal text-xs font-bold text-[#FF3131] tracking-widest animate-pulse">
        {message}
      </div>
    </div>
  );
}
