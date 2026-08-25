'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-[#FF3131]/40 bg-[#0A0A0A] p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="font-mono-terminal text-xs font-bold text-[#FF3131] uppercase tracking-widest">
            EXCEPTION // UNHANDLED_RUNTIME_ERROR
          </span>
          <h1 className="font-mono-terminal text-xl font-extrabold text-white">
            Application Error Encountered
          </h1>
          <p className="font-mono-terminal text-xs text-[#A1A1AA] leading-relaxed">
            {error.message || 'An unexpected failure occurred while resolving system state.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
        >
          <RefreshCw className="h-4 w-4" /> RETRY_OPERATION
        </button>
      </div>
    </div>
  );
}
