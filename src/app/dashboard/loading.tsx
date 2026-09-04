import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[#18181B] rounded animate-pulse" />
          <div className="h-4 w-72 bg-[#121212] rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-[#18181B] rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 animate-pulse" />
          <div className="h-80 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 animate-pulse" />
          <div className="h-48 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
