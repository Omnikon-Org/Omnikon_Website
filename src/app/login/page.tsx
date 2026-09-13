'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithGithub } from '@/lib/firebase/client';
import { TerminalHeader } from '@/components/terminal/TerminalHeader';
import { GlowCard } from '@/components/content/GlowCard';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Github } from 'lucide-react';
import { GithubAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleSyncWithSupabase = async (user: any, githubToken?: string, githubUsername?: string) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerData?.[0]?.providerId || 'firebase',
          githubToken,
          githubUsername,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync authentication profile');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Synchronization error. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      await handleSyncWithSupabase(result.user);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGithub();
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      // Extract github username if present
      const githubUsername = (result.user as any).reloadUserInfo?.screenName || result.user.displayName;

      await handleSyncWithSupabase(result.user, accessToken, githubUsername);
    } catch (err: any) {
      console.error('GitHub Auth Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with GitHub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 space-y-8">
      <TerminalHeader
        title="FIREBASE_AUTH"
        subtitle="Authenticate using Google or GitHub to access your developer dashboard & ecosystem profile."
      />

      <GlowCard className="space-y-6">
        <div className="space-y-4 font-mono-terminal text-xs">
          {errorMsg && (
            <div className="p-3 rounded border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-4 rounded-lg bg-[#050505] border border-[#27272A] space-y-2 text-[#A1A1AA] leading-relaxed">
            <div className="flex items-center gap-2 text-white font-bold">
              <Terminal className="h-4 w-4 text-[#FF3131]" /> IDENTITY_PROVIDERS
            </div>
            <p>
              Login via Google or GitHub to automatically synchronize your profile into the Supabase database.
            </p>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-lg border border-[#27272A] bg-[#121212] hover:bg-[#18181B] text-white font-bold flex items-center justify-center gap-3 transition-all hover:border-[#38BDF8] disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>{loading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleGithubSignIn}
              className="w-full py-3 px-4 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(255,49,49,0.3)] disabled:opacity-50"
            >
              <Github className="h-4 w-4" />
              <span>{loading ? 'CONNECTING...' : 'CONTINUE WITH GITHUB'}</span>
            </button>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
