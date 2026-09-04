'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-[#f4f4f5] min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[#FF3131]/40 bg-[#0A0A0A] p-8 text-center space-y-6 shadow-2xl font-mono">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FF3131] uppercase tracking-widest">
              FATAL_SYSTEM_CRASH // ERROR_BOUNDARY
            </span>
            <h1 className="text-xl font-extrabold text-white">
              Critical System Failure
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {error.message || 'A fatal unhandled error occurred in root execution.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF3131] text-white text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
          >
            <RefreshCw className="h-4 w-4" /> REBOOT_SYSTEM
          </button>
        </div>
      </body>
    </html>
  );
}
