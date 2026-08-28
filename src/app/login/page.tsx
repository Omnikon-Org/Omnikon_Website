'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || `user_${Date.now().toString(36)}`,
              full_name: fullName || 'Omnikon Developer',
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setInfoMsg('Account created successfully! Check your email for confirmation or sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected auth failure occurred.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 space-y-8">
      <TerminalHeader
        title={isSignUp ? 'REGISTER' : 'LOGIN'}
        subtitle="Authenticate to access Omnikon CMS & developer dashboard."
      />

      <GlowCard className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 font-mono-terminal text-xs">
          {errorMsg && (
            <div className="p-3 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]">
              {infoMsg}
            </div>
          )}

          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[#A1A1AA] uppercase">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dev_handle"
                  className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Developer Name"
                  className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#FF3131]" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@omnikonhub.com"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#FF3131]" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded border border-[#27272A] bg-[#121212] p-2.5 text-white focus:border-[#FF3131] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : isSignUp ? 'CREATE_ACCOUNT' : 'SIGN_IN'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#27272A] text-center font-mono-terminal text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-[#38BDF8] hover:underline"
          >
            {isSignUp ? 'Already registered? Sign in' : 'New contributor? Register account'}
          </button>
        </div>
      </GlowCard>
    </div>
  );
}
