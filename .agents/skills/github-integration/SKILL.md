---
name: github-integration
description: Dictates standards for integrating GitHub Organization (Omnikon-Org) APIs, dynamic repository metrics, member lists, open-source issue tracking, and live contribution feeds. Use when connecting site components to GitHub.
---

# Omnikon GitHub Integration Standards

## 1. Scope & Target Organization
All GitHub integrations across the Omnikon ecosystem connect to the official organization:
- **GitHub Organization**: `Omnikon-Org` (https://github.com/Omnikon-Org)
- **Primary Repositories**:
  - `Astrodex` (Selected in GSSoC 2026)
  - `CNTRL` (Selected in ECSoC 2026)
  - `IssuesSwipe` (GitHub issue discovery tool)
  - `Website` (Official Omnikon website repository)

---

## 2. Dynamic Integration Features

### A. Repository Metrics & Showcase
- **Tracked Attributes**: Star counts, fork counts, primary programming language, open issue count, commit activity.
- **Display Component**: Interactive repository cards with live stats, direct repo links, and contribution tags (`gssoc-2026`, `ecsoc-2026`, `beginner-friendly`).

### B. Member & Contributor Wall
- **Source**: `https://api.github.com/orgs/Omnikon-Org/members` or public contributor listings.
- **Attributes Displayed**: Avatar URL, GitHub username, contribution role (Learner, Builder, Contributor, Maintainer), profile link.

### C. Issue Discovery & "IssueSwipe" Integration
- **Functionality**: Surface beginner-friendly issues (`good-first-issue`, `help-wanted`) across `Omnikon-Org` repos.
- **Interaction**: Enable developers to filter issues by technology stack, difficulty label, or target project.

### D. Live Developer Activity Stream
- **Data Feed**: Simulated or real-time event logs for merged pull requests, new contributors joining, releases published, and security patches.
- **Format**: Terminal ticker feed styled according to `omnikon-design` guidelines.

---

## 3. Technical Execution & Rate Limit Management

### GitHub API Rate Limit Guidelines
- GitHub's unauthenticated REST API limit is **60 requests per hour per IP**.
- **Mandatory Caching Strategy**:
  1. Implement client-side `localStorage` caching with a 15-minute TTL (Time To Live).
  2. Implement server-side/edge proxy caching (Vercel serverless functions / Supabase cache) where feasible.
  3. Include hardcoded static fallback metrics (e.g. baseline star count & project details) if the API rate limit is exceeded or offline.

### Fallback Implementation Pattern
```javascript
async function fetchRepoDetails(repoName) {
    const cacheKey = `omnikon_repo_${repoName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < 15 * 60 * 1000) return data; // 15 min TTL
    }
    
    try {
        const res = await fetch(`https://api.github.com/repos/Omnikon-Org/${repoName}`);
        if (!res.ok) throw new Error('API Rate limit or network error');
        const data = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
        return data;
    } catch (err) {
        console.warn(`[GitHub Integration] Fallback used for ${repoName}:`, err);
        return getStaticFallbackRepoData(repoName);
    }
}
```

### Error Handling & UI States
- Use terminal diagnostic UI alerts (`[SYS.WARN] GitHub API rate-limited - displaying cached data`) rather than silent failure or broken UI cards.
