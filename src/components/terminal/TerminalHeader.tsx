import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TerminalHeader({ title, subtitle, action }: TerminalHeaderProps) {
  return (
    <div className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] overflow-hidden shadow-2xl">
      {/* Terminal Bar Window Controls */}
      <div className="flex items-center justify-between border-b border-[#27272A] bg-[#050505] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF3131] inline-block opacity-80"></span>
          <span className="h-3 w-3 rounded-full bg-[#EAB308] inline-block opacity-80"></span>
          <span className="h-3 w-3 rounded-full bg-[#22C55E] inline-block opacity-80"></span>
          <span className="ml-2 font-mono-terminal text-xs text-[#A1A1AA] font-semibold tracking-wider">
            OMNIKON://{title.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <Terminal className="h-3.5 w-3.5 text-[#FF3131]" />
          <span className="font-mono-terminal text-[11px] uppercase tracking-widest text-[#A1A1AA]">bash</span>
        </div>
      </div>

      {/* Terminal Title Body */}
      <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] font-mono-terminal text-[11px] text-[#FF3131]">
            <span className="text-[#22C55E]">$</span> cat /omnikon/system/{title.toLowerCase()}.md
          </div>
          <h1 className="font-mono-terminal text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="font-mono-terminal text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
