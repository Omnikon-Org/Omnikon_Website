import React from 'react';

export default function ActivityLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <div className="space-y-2 border-b border-[#27272A] pb-6">
        <div className="h-6 w-56 bg-[#18181B] rounded animate-pulse" />
        <div className="h-4 w-96 bg-[#121212] rounded animate-pulse" />
      </div>

      <div className="space-y-4 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-[#27272A] bg-[#0A0A0A] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
