import React from 'react';

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <div className="space-y-2 border-b border-[#27272A] pb-6">
        <div className="h-6 w-48 bg-[#18181B] rounded animate-pulse" />
        <div className="h-4 w-72 bg-[#121212] rounded animate-pulse" />
      </div>

      <div className="h-14 w-full rounded-xl bg-[#0A0A0A] border border-[#27272A] animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl border border-[#27272A] bg-[#0A0A0A] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
