import React from 'react';

export default function QuizzesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono-terminal text-xs">
      <div className="space-y-2 border-b border-[#27272A] pb-6">
        <div className="h-6 w-56 bg-[#18181B] rounded animate-pulse" />
        <div className="h-4 w-96 bg-[#121212] rounded animate-pulse" />
      </div>

      <div className="h-10 w-full rounded bg-[#0A0A0A] border border-[#27272A] animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-52 rounded-xl border border-[#27272A] bg-[#0A0A0A] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
