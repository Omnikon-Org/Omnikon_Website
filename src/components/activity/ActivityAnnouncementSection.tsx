'use client';

import React, { useState, useEffect } from 'react';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { Plus, Megaphone, Youtube, ExternalLink, Send, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ActivityAnnouncementSection() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [contentMdx, setContentMdx] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.profile) {
          const profile = data.profile;
          setCurrentUser(profile);

          const allowed =
            profile.role === 'admin' ||
            profile.role === 'editor' ||
            profile.role === 'contributor' ||
            profile.is_co_founder ||
            profile.is_core_team;

          setIsAuthorized(allowed);
        }
      })
      .catch(() => {
        setIsAuthorized(false);
      });
  }, []);

  const handleQuickPreset = (presetType: 'youtube' | 'hackathon' | 'series') => {
    if (presetType === 'youtube') {
      setTitle('🚀 New YouTube Series Launched!');
      setContentMdx('We have officially launched our new YouTube engineering breakdown series! Check out Episode 1 to learn about open-source system architecture and full-stack building.');
      setLinkUrl('https://youtube.com/@omnikon');
    } else if (presetType === 'series') {
      setTitle('📹 Live Workshop Series Update');
      setContentMdx('Join our upcoming weekend live stream workshop on building scalable web apps with Next.js and Supabase.');
      setLinkUrl('https://youtube.com/@omnikon');
    } else if (presetType === 'hackathon') {
      setTitle('🏆 Core Announcement: Hackathon Registration Open');
      setContentMdx('Registration is now officially open for our national student hackathon. Build open source projects and win developer perks!');
      setLinkUrl('/events');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentMdx.trim()) {
      setErrorMsg('Please enter both a title and details for the announcement.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content_mdx: contentMdx,
          link_url: linkUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post announcement.');
      }

      setSuccessMsg('Announcement published successfully to Activity stream!');
      setTitle('');
      setContentMdx('');
      setLinkUrl('');
      setShowForm(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing announcement.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null; // Hidden from regular members or signed-out users
  }

  return (
    <div className="space-y-4 my-6">
      {/* Co-Founder & Core Team Action Bar */}
      <div className="p-4 rounded-xl border border-[#FF3131]/40 bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(255,49,49,0.1)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FF3131]/60 bg-[#FF3131]/10 text-[#FF3131]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono-terminal text-xs font-bold text-white flex items-center gap-2">
              CORE_TEAM & CO-FOUNDER CONSOLE
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#FF3131]/20 text-[#FF3131] border border-[#FF3131]/40 uppercase font-bold">
                {currentUser?.role || 'CORE'}
              </span>
            </div>
            <p className="font-mono-terminal text-[11px] text-[#A1A1AA]">
              Post YouTube series updates, announcements, or official highlights to the live stream.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FF3131] text-white font-mono-terminal text-xs font-bold hover:bg-[#FF3131]/90 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] shrink-0"
        >
          <Plus className="h-4 w-4" /> {showForm ? 'CANCEL' : 'POST_ANNOUNCEMENT'}
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 rounded-lg border border-[#22C55E] bg-[#22C55E]/10 font-mono-terminal text-xs text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Announcement Creation Form */}
      {showForm && (
        <GlowCard accentColor="red" className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2 font-mono-terminal text-xs font-bold text-white">
              <Megaphone className="h-4 w-4 text-[#FF3131]" /> NEW_ANNOUNCEMENT_FORM
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('youtube')}
                className="px-2.5 py-1 rounded border border-[#27272A] bg-[#121212] hover:border-[#FF3131] font-mono-terminal text-[10px] text-[#A1A1AA] hover:text-white flex items-center gap-1 transition-all"
              >
                <Youtube className="h-3 w-3 text-[#FF3131]" /> YouTube Preset
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('series')}
                className="px-2.5 py-1 rounded border border-[#27272A] bg-[#121212] hover:border-[#38BDF8] font-mono-terminal text-[10px] text-[#A1A1AA] hover:text-white transition-all"
              >
                Workshop Preset
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded border border-[#FF3131] bg-[#FF3131]/10 font-mono-terminal text-xs text-[#FF3131] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono-terminal text-xs">
            <div>
              <label className="block text-[#A1A1AA] mb-1 font-bold uppercase">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. 🚀 New YouTube Series: Building Open Source Ecosystems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#27272A] text-white focus:outline-none focus:border-[#FF3131] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[#A1A1AA] mb-1 font-bold uppercase">Details / Description</label>
              <textarea
                rows={3}
                placeholder="Describe your YouTube series, announcement details, links, or milestone..."
                value={contentMdx}
                onChange={(e) => setContentMdx(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#27272A] text-white focus:outline-none focus:border-[#FF3131] transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#A1A1AA] mb-1 font-bold uppercase">External URL / YouTube Link (Optional)</label>
              <input
                type="url"
                placeholder="e.g. https://youtube.com/watch?v=..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#27272A] text-white focus:outline-none focus:border-[#FF3131] transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white font-bold transition-all"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? 'PUBLISHING...' : 'PUBLISH_ANNOUNCEMENT'}</span>
              </button>
            </div>
          </form>
        </GlowCard>
      )}
    </div>
  );
}
