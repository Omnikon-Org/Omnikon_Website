'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { User, Github, MessageSquare, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface ProfileSettingsProps {
  initialProfile: {
    id: string;
    username: string;
    full_name: string;
    bio: string | null;
    github_username: string | null;
    discord_username: string | null;
    website_url: string | null;
    role: string;
    developer_tier: string;
  };
}

export function ProfileSettings({ initialProfile }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [githubUsername, setGithubUsername] = useState(initialProfile.github_username || '');
  const [discordUsername, setDiscordUsername] = useState(initialProfile.discord_username || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile.website_url || '');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio || null,
          github_username: githubUsername || null,
          discord_username: discordUsername || null,
          website_url: websiteUrl || null,
        })
        .eq('id', initialProfile.id);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard accentColor="cyan" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <h3 className="font-mono-terminal text-sm font-extrabold text-white uppercase tracking-wider">
            Developer Profile Setup
          </h3>
          <p className="font-sans text-xs text-[#A1A1AA]">
            Customize your credentials and showcase your GitHub open-source history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={initialProfile.developer_tier} />
          <StatusBadge status={initialProfile.role} />
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4 font-mono-terminal text-xs">
        {success && (
          <div className="p-3 rounded border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131]">
            SYSTEM_ERROR: {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#38BDF8]" /> Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5 text-[#38BDF8]" /> GitHub Username
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="github_handle"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#38BDF8]" /> Discord Username
            </label>
            <input
              type="text"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="discord_handle"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#38BDF8]" /> Website URL
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.dev"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#38BDF8]" /> Biography / Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about your technology interests and open-source contributions..."
            rows={4}
            className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#38BDF8] focus:outline-none font-sans"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded bg-[#38BDF8] text-[#050505] font-bold hover:bg-[#38BDF8]/90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50"
          >
            {loading ? 'SAVING_CHANGES...' : 'SAVE_PROFILE'}
          </button>
        </div>
      </form>
    </GlowCard>
  );
}
