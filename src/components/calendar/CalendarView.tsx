'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/data/events';
import { GlowCard } from '@/components/content/GlowCard';
import { StatusBadge } from '@/components/terminal/StatusBadge';
import { formatDate } from '@/lib/utils';
import { logEvent } from '@/lib/utils/analytics';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  Download, 
  Radio, 
  Users, 
  Grid, 
  List
} from 'lucide-react';

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'ALL') return true;
    return ev.event_type.toLowerCase().includes(filterType.toLowerCase());
  });

  const generateGoogleCalendarUrl = (ev: Event) => {
    const startIso = new Date(ev.start_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(ev.end_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`Omnikon: ${ev.title}`);
    const details = encodeURIComponent(`${ev.summary}\n\nJoin the event: https://www.omnikonhub.com/events/${ev.slug}`);
    const location = encodeURIComponent(ev.location || 'Discord Stage / Online');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const generateIcsFile = (ev: Event) => {
    const startIso = new Date(ev.start_date).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(ev.end_date).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Omnikon 2.0//Community Events//EN',
      'BEGIN:VEVENT',
      `UID:${ev.id}@omnikonhub.com`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Omnikon: ${ev.title}`,
      `DESCRIPTION:${ev.summary} - https://www.omnikonhub.com/events/${ev.slug}`,
      `LOCATION:${ev.location || 'Online'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${ev.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-mono-terminal text-xs">
      {/* Controls Bar: View Toggle & Type Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A]">
        {/* Event Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'HACKATHON', 'WORKSHOP', 'QUIZ', 'COMMUNITY'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-md border text-xs transition-all ${
                filterType === cat
                  ? 'bg-[#38BDF8] text-[#050505] border-[#38BDF8] font-bold'
                  : 'bg-[#121212] text-[#A1A1AA] border-[#27272A] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 border border-[#27272A] p-1 rounded-lg bg-[#121212]">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-[#27272A] text-white font-bold' : 'text-[#71717A] hover:text-white'
            }`}
            title="Chronological List View"
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded flex items-center gap-1 ${
              viewMode === 'grid' ? 'bg-[#27272A] text-white font-bold' : 'text-[#71717A] hover:text-white'
            }`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" /> Grid
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-12 rounded-xl border border-[#27272A] bg-[#0A0A0A] text-center text-[#A1A1AA] space-y-2">
          <CalendarIcon className="h-8 w-8 text-[#38BDF8] mx-auto" />
          <p className="font-bold text-white uppercase">NO_EVENTS_SCHEDULED</p>
          <p>No community events match the selected criteria.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Timeline Mode */
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const isLive = new Date(ev.start_date) <= new Date() && new Date(ev.end_date) >= new Date();

            return (
              <GlowCard
                key={ev.id}
                accentColor={isLive ? 'green' : 'cyan'}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Date Stamp & Title */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold border border-[#22C55E]/40">
                        <Radio className="h-3 w-3 animate-pulse" /> LIVE NOW
                      </span>
                    ) : (
                      <StatusBadge status={ev.status_label || 'Upcoming'} />
                    )}
                    <span className="text-[#38BDF8] uppercase font-bold text-[11px]">{ev.event_type}</span>
                  </div>

                  <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors">
                    <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-[#A1A1AA] text-[11px]">
                    <span className="flex items-center gap-1 text-white">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#38BDF8]" /> {formatDate(ev.start_date)} &mdash; {formatDate(ev.end_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#22C55E]" /> {ev.location || 'Online'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#EAB308]" /> {ev.registrations_count || 0} Registered
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#27272A]">
                  <a
                    href={generateGoogleCalendarUrl(ev)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#38BDF8] transition-all"
                    title="Add to Google Calendar"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-[#38BDF8]" /> Google Cal
                  </a>

                  <button
                    type="button"
                    onClick={() => generateIcsFile(ev)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#27272A] bg-[#121212] text-[#A1A1AA] hover:text-white hover:border-[#22C55E] transition-all"
                    title="Download iCal (.ics) file"
                  >
                    <Download className="h-3.5 w-3.5 text-[#22C55E]" /> .iCal
                  </button>

                  <Link
                    href={`/events/${ev.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#38BDF8] text-[#050505] font-bold hover:bg-[#38BDF8]/90 transition-all shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  >
                    DETAILS <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </GlowCard>
            );
          })}
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <GlowCard key={ev.id} accentColor="cyan" className="flex flex-col justify-between space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <StatusBadge status={ev.status_label || 'Upcoming'} />
                  <span className="text-[#38BDF8] uppercase font-bold">{ev.event_type}</span>
                </div>

                <h3 className="font-mono-terminal text-base font-bold text-white hover:text-[#38BDF8] transition-colors line-clamp-2">
                  <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                </h3>

                <p className="font-sans text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                  {ev.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272A] space-y-3">
                <div className="space-y-1 text-[11px] text-[#A1A1AA]">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{formatDate(ev.start_date)}</span>
                    <span>{ev.location || 'Online'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => generateIcsFile(ev)}
                    className="text-[#22C55E] hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Add to Cal
                  </button>

                  <Link
                    href={`/events/${ev.slug}`}
                    className="font-bold text-[#38BDF8] flex items-center gap-1 hover:underline"
                  >
                    DETAILS <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
