# Omnikon 2.0 — Consolidated System Requirements (Revised Architecture)

## 1. Strategic Vision & Core Objectives
Omnikon 2.0 is the official digital platform for **Omnikon** ([omnikonhub.com](https://www.omnikonhub.com/)), an open-source community empowering student developers, open-source contributors, and hackathon innovators.

### Primary Objectives
1. **Preserve Distinct Visual Identity**: Maintain Omnikon's signature Cyberpunk / Dev-Terminal dark aesthetic ([`omnikon-design`](file:///.agents/skills/omnikon-design/SKILL.md))—Obsidian `#050505` background, `#FF3131` neon red accent, `JetBrains Mono` code typography, glowing borders, and HUD status elements.
2. **Next.js App Router & TypeScript Architecture**: Transition to Next.js App Router with Server Components as the default, paired with TypeScript for strict type safety and high performance.
3. **Native Content & Admin System**: Build a robust, native editorial management platform on Supabase PostgreSQL (supporting Articles, Tutorials, Engineering Stories, Project Stories, Projects, Events, Updates, Members, Contributors, Achievements, Categories, Tags) with draft -> review -> published -> archived workflows.
4. **PostgreSQL-Powered Global Search**: Implement a clean, fast PostgreSQL full-text search (`tsvector` / `pg_trgm`) covering all content types.
5. **Server-Side GitHub Integration**: Implement server-side GitHub API integration with ISR/revalidation caching and static fallbacks, ensuring resilience even when GitHub is unavailable.
6. **Policy-Compliant AdSense Abstraction**: Implement a clean ad management abstraction for Google AdSense (`ca-pub-8663425706426895`) based on UX, originality, and publisher compliance rather than arbitrary word counts.
7. **Interactive Developer Journey**: Transform the student-to-maintainer tier progression (`Student` → `Learner` → `Builder` → `Contributor` → `Maintainer`) into a real product feature linked to actual articles, projects, and contribution opportunities.

---

## 2. Technology Stack & Architecture

| Layer | Technology | Role & Specifications |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Server Components by default; Client Components only for interactive UI |
| **Language** | **TypeScript** | Strict end-to-end type safety |
| **Database & Auth** | **Supabase PostgreSQL** | Primary database, authentication, file storage, and RLS security |
| **Styling System** | **Tailwind CSS + Custom Tokens** | Dark mode native, custom grid overlays (`grid-bg`), glowing borders (`#FF3131`) |
| **Search Engine** | **PostgreSQL Full-Text (`tsvector`)** | Unified global search across articles, projects, events, members, and updates |
| **Hosting & Deployment** | **Vercel** | Edge network deployment, ISR revalidation, automatic SSL |

---

## 3. Role-Based Access Control (RBAC) Matrix

| Role | Target Users | Key Permissions |
| :--- | :--- | :--- |
| **Visitor** | Anonymous site guests | Read published content, search content, view public profiles |
| **Member** | Registered community members | Manage own profile, save bookmarks, participate in discussions |
| **Contributor** | Verified open-source builders | Draft articles, submit project updates, link GitHub PRs |
| **Editor** | Content managers & mentors | Review submissions, edit content, manage categories/tags, publish/archive |
| **Admin** | Core organization leads | Full system access, manage user roles, system configuration, ad toggles |

---

## 4. Content Lifecycle & Workflow

All content entities (Articles, Tutorials, Engineering Stories, Projects, Events, Updates) adhere to a 4-state lifecycle:
`Draft` → `Review` → `Published` → `Archived`

- **Draft**: Author creating or editing content (private to author and editors).
- **Review**: Submitted for editorial validation (editors review quality, SEO, and guidelines).
- **Published**: Live on site, indexed by search engines, eligible for discovery.
- **Archived**: Hidden from main feeds, accessible via direct link or historical records.

---

## 5. AdSense Strategy & Eligibility Rules

- **Publisher ID**: `ca-pub-8663425706426895` (`ads.txt` verified).
- **Eligibility Criteria**: Ad units are eligible **ONLY** on pages that deliver substantial, original, useful content with high user experience value. **Word count is NOT used as an eligibility threshold.**
- **Route Exclusions**: Ads are strictly **DISABLED** on:
  - Homepage (`/`)
  - Authentication routes (`/login`, `/signup`, `/auth/*`)
  - Admin & Dashboard pages (`/admin/*`)
  - Search results page (`/search`)
  - Contact Us (`/contact`)
  - 404 & Error routes
  - Legal Policy pages (`/privacy`, `/terms`)
  - Redirect handlers & thin/empty views
- **CLS Safe Containers**: Reserved minimum height wrapper (`min-height: 280px`) on all ad units.

---

## 6. GitHub Integration Architecture

```
┌──────────────────────────────────────┐
│   GitHub REST & GraphQL API v3/v4    │
└──────────────────┬───────────────────┘
                   │ Server-Side Fetch
                   ▼
┌──────────────────────────────────────┐
│  Next.js Server API / ISR Revalidate │
│  (Tag-based revalidation, 1-hr TTL)  │
└──────────────────┬───────────────────┘
                   │
                   ├──► [Primary] PostgreSQL Cache Snapshot
                   │
                   ▼
┌──────────────────────────────────────┐
│  Next.js Server Components (UI)      │
│  (Renders seamlessly if API is down) │
└──────────────────────────────────────┘
```

- Primary source of truth for public display is the **server-cached snapshot in PostgreSQL**, revalidated periodically via background tasks or Next.js `revalidateTag`.
- Front-end remains 100% operational with zero UI breakage even if GitHub API is offline.

---

## 7. Pre-Deployment Quality Assurance Gate (`production-review`)

All releases must pass the 7 formal audit gates:
1. **Visual Identity Audit**: Dark obsidian `#050505`, neon red `#FF3131`, `JetBrains Mono` code labels.
2. **Content Authenticity Audit**: Genuine technical depth, no AI fluff, valid project links.
3. **SEO & Metadata Audit**: Canonical URLs, JSON-LD schemas, OpenGraph tags, heading hierarchy.
4. **AdSense Compliance Audit**: Policy-compliant ad unit placement, route exclusions active, CLS containers verified.
5. **GitHub Integration Audit**: Server-side revalidation active, fallback snapshot verified.
6. **Accessibility & Performance Audit**: WCAG 2.1 AA contrast (>= 4.5:1), keyboard focus rings, LCP < 1.5s, CLS < 0.1.
7. **Build Integrity Audit**: Zero console errors, clean build compile, valid link resolution.
