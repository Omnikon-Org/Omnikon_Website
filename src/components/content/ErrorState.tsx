import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export function ErrorState({ title = 'SYSTEM_ERROR_ENCOUNTERED', message = 'Unable to resolve request. Please try again later.' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 rounded-xl border border-[#FF3131]/40 bg-[#0A0A0A] text-center space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="font-mono-terminal text-sm font-bold text-[#FF3131] uppercase tracking-wider">
        {title}
      </h3>
      <p className="font-mono-terminal text-xs text-[#A1A1AA] max-w-md">
        {message}
      </p>
    </div>
  );
}
