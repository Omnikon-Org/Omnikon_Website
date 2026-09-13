'use client';

import React, { useState } from 'react';
import { 
  DownloadCloud, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X,
  Globe,
  User,
  Layers
} from 'lucide-react';
import { GlowCard } from '@/components/content/GlowCard';

export function SyncArticlesButton({ onComplete }: { onComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<'devto' | 'hashnode' | 'both'>('devto');
  const [mode, setMode] = useState<'personal' | 'custom'>('personal');
  const [username, setUsername] = useState('');
  const [hashnodeHost, setHashnodeHost] = useState('');
  const [loading, setLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    message: string;
    details?: { total: number; inserted: number; updated: number; errors: string[] };
  } | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatusResult(null);
    setLogMessages([
      `[SYS.INIT] Preparing dispatch to extractor service...`,
      `[CONFIG] Source: ${source.toUpperCase()} | Target: ${mode === 'personal' ? 'AUTHENTICATED_ACCOUNT' : 'THIRD_PARTY_ID'}`,
    ]);

    try {
      setLogMessages((prev) => [...prev, `[QUERY] Fetching articles and markdown payloads...`]);

      const res = await fetch('/api/admin/articles/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          username: mode === 'custom' ? username.trim() : undefined,
          hashnodeHost: mode === 'custom' ? hashnodeHost.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync articles');
      }

      setLogMessages((prev) => [
        ...prev,
        `[SUCCESS] Received ${data.summary?.total || 0} articles.`,
        `[SUPABASE] +${data.summary?.inserted || 0} inserted, ~${data.summary?.updated || 0} updated.`,
        `[COMPLETED] Database transaction committed successfully.`,
      ]);

      setStatusResult({
        success: true,
        message: data.message,
        details: data.summary,
      });

      if (onComplete) onComplete();
    } catch (err: any) {
      setLogMessages((prev) => [...prev, `[ERROR] Execution halted: ${err.message}`]);
      setStatusResult({
        success: false,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8] font-mono-terminal text-xs font-bold hover:bg-[#38BDF8]/20 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
      >
        <DownloadCloud className="h-4 w-4 text-[#38BDF8]" />
        <span>FETCH_&_SYNC_ARTICLES</span>
      </button>

      {/* Modal / Terminal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#27272A] bg-[#0A0A0A] p-6 shadow-2xl space-y-6 font-mono-terminal text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ARTICLE_EXTRACTOR // AUTOMATION_HUB
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-[#121212]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Config Form */}
            <div className="space-y-4">
              {/* Mode Toggle: Personal Account vs Third-Party User */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">EXTRACTION_TARGET</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('personal')}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs transition-all ${
                      mode === 'personal'
                        ? 'bg-[#38BDF8] text-[#050505] border-[#38BDF8] font-bold'
                        : 'bg-[#121212] border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" /> My Authenticated Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('custom')}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs transition-all ${
                      mode === 'custom'
                        ? 'bg-[#38BDF8] text-[#050505] border-[#38BDF8] font-bold'
                        : 'bg-[#121212] border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" /> Third-Person / Custom ID
                  </button>
                </div>
              </div>

              {/* Source Platforms */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA]">SOURCE_PLATFORM</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['devto', 'hashnode', 'both'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      className={`py-2 px-3 rounded-lg border text-xs capitalize transition-all ${
                        source === s
                          ? 'bg-[#22C55E] text-[#050505] border-[#22C55E] font-bold'
                          : 'bg-[#121212] border-[#27272A] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {s === 'both' ? 'Both (Dev.to & Hashnode)' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Inputs */}
              {mode === 'custom' && (
                <div className="space-y-3 p-3 rounded-lg border border-[#27272A] bg-[#121212]">
                  {(source === 'devto' || source === 'both') && (
                    <div className="space-y-1">
                      <label className="text-[#A1A1AA] text-[11px]">
                        DEV.TO USERNAME / ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. pranav_thawait_4c3d1f4766 or fireship"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[#27272A] bg-[#0A0A0A] text-white placeholder-[#52525B] focus:border-[#38BDF8] focus:outline-none"
                      />
                    </div>
                  )}

                  {(source === 'hashnode' || source === 'both') && (
                    <div className="space-y-1">
                      <label className="text-[#A1A1AA] text-[11px]">
                        HASHNODE BLOG DOMAIN / HANDLE
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. engineering.hashnode.dev or @username"
                        value={hashnodeHost}
                        onChange={(e) => setHashnodeHost(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[#27272A] bg-[#0A0A0A] text-white placeholder-[#52525B] focus:border-[#38BDF8] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Storage Destination Notice */}
              <div className="p-3 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/5 text-[#A1A1AA] space-y-1 text-[11px]">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#22C55E]" /> DIRECT_SUPABASE_PERSISTENCE
                </div>
                <p>
                  Articles will be extracted, converted to website native Markdown, and stored directly into the Supabase database. Omnikon renders them with zero API overhead.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSync}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#38BDF8] text-[#050505] font-bold hover:bg-[#38BDF8]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> FETCHING_&_STORING...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4" /> START_EXTRACTION
                  </>
                )}
              </button>
            </div>

            {/* Terminal Console Logs */}
            {logMessages.length > 0 && (
              <div className="p-3.5 rounded-lg border border-[#27272A] bg-[#050505] space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                <div className="text-[#A1A1AA] uppercase tracking-wider text-[10px]">
                  CONSOLE_OUTPUT
                </div>
                {logMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.includes('[SUCCESS]') || msg.includes('[COMPLETED]')
                        ? 'text-[#22C55E]'
                        : msg.includes('[ERROR]')
                        ? 'text-[#FF3131]'
                        : 'text-[#38BDF8]'
                    }
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}

            {/* Final Status */}
            {statusResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  statusResult.success
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#FF3131]/40 bg-[#FF3131]/10 text-[#FF3131]'
                }`}
              >
                {statusResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#FF3131]" />
                )}
                <span>{statusResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
