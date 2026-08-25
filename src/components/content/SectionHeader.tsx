import React from 'react';

interface SectionHeaderProps {
  tag: string;
  title: string;
  description?: string;
}

export function SectionHeader({ tag, title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-2 mb-8">
      <div className="font-mono-terminal text-xs font-bold text-[#FF3131] uppercase tracking-widest flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-[#FF3131] inline-block rounded-full"></span>
        {tag}
      </div>
      <h2 className="font-mono-terminal text-xl sm:text-3xl font-extrabold text-white tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="font-mono-terminal text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
