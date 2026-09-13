'use client';

import React, { useState } from 'react';
import { GlowCard } from '@/components/content/GlowCard';
import { Send, CheckCircle2, AlertCircle, MessageSquare, Terminal } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Construct a prefilled mailto as a reliable zero-backend fallback, while showing instant terminal confirmation
    const subjectPrefix = `[Omnikon ${formData.subject.toUpperCase()}]`;
    const mailtoUrl = `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(
      `${subjectPrefix} Inquiry from ${formData.name}`
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.subject}\n\nMessage:\n${formData.message}`
    )}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Trigger user default email client with formatted message
      window.location.href = mailtoUrl;
    }, 600);
  };

  return (
    <GlowCard accentColor="red" className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF3131] animate-pulse" />
          <h2 className="font-mono-terminal text-base font-bold text-white uppercase tracking-wider">
            TRANSMIT_DISPATCH // MESSAGE_TERMINAL
          </h2>
        </div>
        <span className="font-mono-terminal text-[11px] text-[#22C55E]">
          SLA: &lt; 24_HOURS
        </span>
      </div>

      {submitted ? (
        <div className="p-6 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 text-center space-y-3 font-mono-terminal">
          <CheckCircle2 className="h-10 w-10 text-[#22C55E] mx-auto animate-bounce" />
          <h3 className="text-white font-bold text-sm">DISPATCH_QUEUED_SUCCESSFULLY</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            Your inquiry has been formulated and opened in your email client. You can also contact us directly at{' '}
            <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-[#22C55E] underline">
              {SITE_CONFIG.contactEmail}
            </a>.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', subject: 'general', message: '' });
            }}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-[#27272A] text-white text-xs hover:border-[#22C55E]"
          >
            SEND_ANOTHER_DISPATCH
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono-terminal text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-[#A1A1AA] block">
                NAME / HANDLE <span className="text-[#FF3131]">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder="e.g. Alex Turing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white placeholder-[#52525B] focus:border-[#FF3131] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-[#A1A1AA] block">
                DIRECT_EMAIL <span className="text-[#FF3131]">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="alex@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white placeholder-[#52525B] focus:border-[#FF3131] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="text-[#A1A1AA] block">
              DISPATCH_DOMAIN
            </label>
            <select
              id="contact-subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white focus:border-[#FF3131] focus:outline-none transition-colors"
            >
              <option value="general">General Community Inquiry</option>
              <option value="hackathon">Hackathon & Sponsorship Partnerships</option>
              <option value="security">Vulnerability Disclosure / Security Report</option>
              <option value="mentorship">Mentorship & Contributor Support</option>
              <option value="events">Masterclass & Workshop Collaboration</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-[#A1A1AA] block">
              MESSAGE_PAYLOAD <span className="text-[#FF3131]">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              placeholder="Outline your inquiry, proposal, or feedback with relevant links..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#27272A] bg-[#0A0A0A] text-white placeholder-[#52525B] focus:border-[#FF3131] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#FF3131] text-white font-bold hover:bg-[#FF3131]/90 shadow-[0_0_15px_rgba(255,49,49,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>ENCRYPTING_&_TRANSMITTING...</span>
            ) : (
              <>
                <Send className="h-4 w-4" /> TRANSMIT_TO_CORE_TEAM
              </>
            )}
          </button>
        </form>
      )}
    </GlowCard>
  );
}
