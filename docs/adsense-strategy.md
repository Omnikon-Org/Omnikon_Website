# Omnikon 2.0 — Policy-Compliant AdSense Integration Strategy

## 1. Executive Strategy & Compliance Principles

Omnikon 2.0 integrates Google AdSense (`ca-pub-8663425706426895`) with strict adherence to **Google Publisher Policies**.

### CORE ELIGIBILITY PRINCIPLES (NO ARBITRARY WORD COUNTS)
- ❌ **No Arbitrary Word Counts**: Ad eligibility is **NEVER** based on reaching an arbitrary word count threshold (e.g. "400+ words"). Ads are never inserted simply because a page passes a character metric.
- ✅ **Qualitative Value Eligibility**: Ads are permitted **ONLY** on pages that provide:
  1. **Substantial Standalone Content**: The page delivers complete, meaningful information.
  2. **Originality & Technical Substance**: High-quality tutorials, guides, or project breakdowns written for developers.
  3. **High User Experience Value**: Ad units must never obscure text, interfere with navigation buttons, or cause dynamic layout shifts.
  4. **Policy Compliance**: Content strictly adheres to Google Publisher Guidelines (zero copyright infringement, zero scraper link feeds).

---

## 2. AdSense System Abstraction Architecture

The AdSense integration is implemented as a clean, modular React component abstraction (`<AdSlot />`) controlled by route-level authorization guards and a master environment toggle:

```
┌─────────────────────────────────────────────────────────────┐
│                 ADSENSE GATEKEEPER SYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│ Master Toggle: NEXT_PUBLIC_ADSENSE_ENABLED=true             │
│ Route Exclusion Guard: isRouteAdEligible(pathname)          │
├──────────────────────────────┬──────────────────────────────┤
│    EXCLUDED ROUTES (BLOCK)   │    APPROVED ROUTES (ALLOW)   │
│    - Homepage (/)            │    - Long-form Tutorials    │
│    - Search (/search)        │    - Technical Articles      │
│    - Auth (/login, /signup)  │    - Detailed Project Docs  │
│    - Admin (/admin/*)        │                              │
│    - Legal (/privacy, /terms)│                              │
│    - Empty / 404 Pages       │                              │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
        [Do Not Render]              Render <AdSlot /> 
                                     (Wrapped in min-height 
                                      CLS-safe container)
```

---

## 3. Route Exclusion Matrix

| Page Route / Template | Ad Eligibility | Justification / Policy Reason |
| :--- | :---: | :--- |
| **Homepage (`/`)** | ❌ **DISABLED** | Core community landing hub; must remain 100% clean and distraction-free. |
| **Search Page (`/search`)** | ❌ **DISABLED** | Dynamic query utility page; prohibited under search result ad placement rules. |
| **Auth Pages (`/login`, `/signup`)** | ❌ **DISABLED** | Form utility pages with zero article content. |
| **Admin Layer (`/admin/*`)** | ❌ **DISABLED** | Internal management interface. |
| **Contact Us (`/contact`)** | ❌ **DISABLED** | Form utility route. |
| **Legal Pages (`/privacy`, `/terms`)** | ❌ **DISABLED** | Policy documents; prohibited from monetization. |
| **Error / 404 Pages** | ❌ **DISABLED** | Zero value / error pages. |
| **Referral Redirects (`/r/*`)** | ❌ **DISABLED** | Shortlink redirect handlers. |
| **Native Technical Articles (`/blogs/[slug]`)** | ✅ **ALLOWED** | Substantial, original, long-form technical guides. |
| **Detailed Project Breakdown (`/projects/[slug]`)**| ✅ **ALLOWED** | Substantial open-source architectural documentation. |

---

## 4. Layout Shift (CLS) Safeguards & Component Code

To prevent Cumulative Layout Shift (CLS) when Google AdSense scripts render ads asynchronously, all ad units are rendered inside pre-allocated CSS height containers:

```tsx
// src/components/ads/AdSlot.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const EXCLUDED_ROUTES = [
  '/',
  '/search',
  '/login',
  '/signup',
  '/contact',
  '/privacy',
  '/terms',
];

interface AdSlotProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export default function AdSlot({ slotId, format = 'auto' }: AdSlotProps) {
  const pathname = usePathname();

  // 1. Master toggle & Route exclusion check
  const isEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
  const isExcluded = EXCLUDED_ROUTES.includes(pathname) || pathname.startsWith('/admin');

  useEffect(() => {
    if (isEnabled && !isExcluded) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('[AdSense] Slot push error:', err);
      }
    }
  }, [isEnabled, isExcluded, pathname]);

  if (!isEnabled || isExcluded) return null;

  return (
    <div className="my-8 w-full min-h-[280px] bg-[#0A0A0A] border border-[#27272A] p-2 flex items-center justify-center relative overflow-hidden">
      <span className="text-[10px] font-mono text-[#A1A1AA] absolute top-1 right-2 uppercase tracking-widest">
        ADVERTISEMENT
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '250px' }}
        data-ad-client="ca-pub-8663425706426895"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```
