'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/lib/data/events';
import { GlowCard } from '@/components/content/GlowCard';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';

interface EventFormProps {
  initialEvent?: Partial<Event>;
}

export function EventForm({ initialEvent }: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    slug: initialEvent?.slug || '',
    summary: initialEvent?.summary || '',
    content_mdx: initialEvent?.content_mdx || '',
    event_type: initialEvent?.event_type || 'hackathon',
    status_label: initialEvent?.status_label || 'Upcoming',
    status: initialEvent?.status || 'published',
    start_date: initialEvent?.start_date ? new Date(initialEvent.start_date).toISOString().slice(0, 16) : '',
    end_date: initialEvent?.end_date ? new Date(initialEvent.end_date).toISOString().slice(0, 16) : '',
    location_type: initialEvent?.location_type || 'online',
    location: initialEvent?.location || 'Discord Stage / Online',
    registration_url: initialEvent?.registration_url || '',
    rules_mdx: initialEvent?.rules_mdx || '',
    is_featured: initialEvent?.is_featured || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const isNew = !initialEvent?.id;
      const res = await fetch(isNew ? '/api/admin/events' : `/api/admin/events/${initialEvent?.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event.');
      }

      setSuccess('Event record successfully committed to database!');
      router.refresh();
      if (isNew && data.id) {
        router.push(`/admin/events/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono-terminal text-xs">
      {error && (
        <div className="p-4 rounded-xl border border-[#FF3131] bg-[#FF3131]/10 text-[#FF3131] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]">
          {success}
        </div>
      )}

      <GlowCard accentColor="green" className="space-y-4 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Event Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
              placeholder="e.g. Omnikon Winter Hackathon 2026"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
              placeholder="e.g. omnikon-winter-hackathon-2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Event Type</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
            >
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="quiz">Technical Quiz</option>
              <option value="competition">Coding Competition</option>
              <option value="community">Community Session</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Status Label</label>
            <input
              type="text"
              value={formData.status_label}
              onChange={(e) => setFormData({ ...formData, status_label: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
              placeholder="Upcoming, Live Now, Registrations Open"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Publication Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">End Date & Time</label>
            <input
              type="datetime-local"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">Location / Online Portal</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
              placeholder="e.g. Discord Stage, Zoom Room, Main Auditorium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A1A1AA] uppercase">External Registration Link (Optional)</label>
            <input
              type="url"
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
              className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[#A1A1AA] uppercase">Summary (Short Description)</label>
          <textarea
            required
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white focus:border-[#22C55E] focus:outline-none"
            placeholder="Brief 1-2 sentence overview for event cards"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[#A1A1AA] uppercase">Full Description (MDX Supported)</label>
          <textarea
            required
            rows={6}
            value={formData.content_mdx}
            onChange={(e) => setFormData({ ...formData, content_mdx: e.target.value })}
            className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white font-mono text-xs focus:border-[#22C55E] focus:outline-none"
            placeholder="# Event Details & Agenda&#10;&#10;Explain format, timeline, and topics."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[#A1A1AA] uppercase">Rules & Guidelines (MDX Supported)</label>
          <textarea
            rows={4}
            value={formData.rules_mdx}
            onChange={(e) => setFormData({ ...formData, rules_mdx: e.target.value })}
            className="w-full rounded-lg border border-[#27272A] bg-[#050505] p-2.5 text-white font-mono text-xs focus:border-[#22C55E] focus:outline-none"
            placeholder="Rules, team formation guidelines, and judging criteria."
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#22C55E] text-[#050505] font-bold hover:bg-[#22C55E]/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> SAVING...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> COMMIT_EVENT
              </>
            )}
          </button>
        </div>
      </GlowCard>
    </form>
  );
}
