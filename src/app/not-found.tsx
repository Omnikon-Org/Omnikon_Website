import React from 'react';
import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-[#FF3131]/40 bg-[#0A0A0A] p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
          <Terminal className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="font-mono-terminal text-xs font-bold text-[#FF3131] uppercase tracking-widest">
            ERROR 404 // PATH_NOT_FOUND
          </span>
          <h1 className="font-mono-terminal text-2xl font-extrabold text-white">
            System Resource Unavailable
          </h1>
          <p className="font-mono-terminal text-xs text-[#A1A1AA] leading-relaxed">
            The requested URI path does not exist in the Omnikon OS directory routing table.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)]"
        >
          <ArrowLeft className="h-4 w-4" /> RETURN_TO_ROOT
        </Link>
      </div>
    </div>
  );
}
