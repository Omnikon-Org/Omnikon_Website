# Omnikon 2.0 — Server-Side GitHub Integration Architecture

## 1. Executive Architecture Overview

Omnikon 2.0 connects to the official organization **`Omnikon-Org`** ([github.com/Omnikon-Org](https://github.com/Omnikon-Org)) via a **Server-Side Integration Pipeline**.

### CRITICAL CACHING RULES
- ❌ **No `localStorage` as Primary Source of Truth**: Client-side storage is **NEVER** used as the primary cache for GitHub data.
- ✅ **Server-Side Source of Truth**: All GitHub metrics, repository metadata, stargazers, and member rosters are fetched on the server, cached in PostgreSQL (`github_cache`), and revalidated in the background via Next.js Incremental Static Revalidation (ISR) or scheduled CRON triggers.
- ✅ **Zero-Downtime Resilience**: If GitHub API experiences downtime, network timeouts, or rate limits, the application serves stale cached snapshots from PostgreSQL, guaranteeing **100% frontend uptime**.

---

## 2. GitHub Integration Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│               GITHUB REST & GRAPHQL API                     │
│               (orgs/Omnikon-Org/repos, members, etc.)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      Server-Side Authenticated Fetch
                      (GITHUB_TOKEN: 5,000 req/hr limit)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            NEXT.JS ROUTE HANDLER / REVALIDATION             │
│            (`app/api/github/sync/route.ts`)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      Write Fresh Snapshot
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE POSTGRESQL DATABASE                  │
│               Table: `github_cache` (JSONB Payload)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      Read Cached Data
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            NEXT.JS SERVER COMPONENTS (UI)                   │
│            (Rendered HTML streamed to browser)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Integrated Features

### A. Repository Metrics & Showcase
- **Tracked Repositories**: `Astrodex` (GSSoC 2026), `CNTRL` (ECSoC 2026), `IssuesSwipe`, `Website`.
- **Metrics Ingested**: Star counts, fork counts, open issue count, primary language, latest commit timestamp, release tags.

### B. "IssueSwipe" Open Source Discovery Tool
- **Functionality**: Queries `Omnikon-Org` repos for issues tagged `good-first-issue` or `help-wanted`.
- **Server Cache**: Caches active issue lists in PostgreSQL every 1 hour, allowing developers to swipe through active open-source tasks without hitting API rate limits.

### C. Live Activity Stream Ticker
- **Feed Source**: `GET /orgs/Omnikon-Org/events` (public activity log).
- **Transformation**: Parses PR merges, repository stars, new releases, and security commits into a developer HUD ticker stream on the homepage.

---

## 4. Server-Side Cache & Fallback Implementation

```typescript
// src/lib/github/fetcher.ts
import { createServerClient } from '@/lib/supabase/server';

export async function getCachedGitHubData<T>(cacheKey: string, fetchFn: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
  const supabase = await createServerClient();

  // 1. Attempt to fetch fresh data from GitHub API
  try {
    const freshData = await fetchFn();
    
    // Save snapshot to PostgreSQL github_cache
    await supabase.from('github_cache').upsert({
      key: cacheKey,
      data: freshData as any,
      expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    return freshData;
  } catch (error) {
    console.warn(`[GitHub Integration] API Fetch failed for ${cacheKey}. Reverting to database cache snapshot:`, error);

    // 2. Fallback: Retrieve stale snapshot from PostgreSQL
    const { data: cached } = await supabase
      .from('github_cache')
      .select('data')
      .eq('key', cacheKey)
      .single();

    if (cached?.data) {
      return cached.data as T;
    }

    throw new Error(`[GitHub Integration] Critical: No cached data available for ${cacheKey}`);
  }
}
```
