'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { logEvent } from '@/lib/utils/analytics';

interface SearchInputProps {
  initialQuery?: string;
  autoFocus?: boolean;
}

export function SearchInput({ initialQuery = '', autoFocus = false }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      logEvent('search_performed', '00000000-0000-0000-0000-000000000000');
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    router.push('/search');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-[#A1A1AA]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, repositories, hackathons, and members... (Press '/' to focus)"
          className="w-full rounded-xl border border-[#27272A] bg-[#0A0A0A] py-3.5 pl-12 pr-24 font-mono-terminal text-sm text-white placeholder-[#71717A] focus:border-[#FF3131] focus:outline-none shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-[#A1A1AA] hover:text-white"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_10px_rgba(255,49,49,0.3)]"
          >
            SEARCH
          </button>
        </div>
      </div>
    </form>
  );
}
