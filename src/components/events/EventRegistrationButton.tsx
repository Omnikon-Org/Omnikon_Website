'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/utils/analytics';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EventRegistrationButtonProps {
  eventId: string;
  eventTitle: string;
  initialIsRegistered?: boolean;
  isAuthenticated?: boolean;
}

export function EventRegistrationButton({
  eventId,
  eventTitle,
  initialIsRegistered = false,
  isAuthenticated = false,
}: EventRegistrationButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    logEvent('event_registration_started', eventId);

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register for event.');
      }

      setIsRegistered(true);
      logEvent('event_registration_completed', eventId);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your event registration?')) {
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/events/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel registration.');
      }

      setIsRegistered(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E] font-mono-terminal text-xs font-bold">
          <CheckCircle className="h-4 w-4" /> CONFIRMED_REGISTRATION
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="font-mono-terminal text-[11px] text-[#A1A1AA] hover:text-[#FF3131] underline disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Cancel Registration'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        disabled={loading}
        onClick={handleRegister}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-mono-terminal text-xs font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> REGISTERING...
          </>
        ) : (
          <>
            <Calendar className="h-4 w-4" /> REGISTER_FOR_EVENT
          </>
        )}
      </button>

      {errorMsg && (
        <span className="font-mono-terminal text-[10px] text-[#FF3131] flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errorMsg}
        </span>
      )}
    </div>
  );
}
