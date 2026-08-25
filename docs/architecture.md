# Omnikon 2.0 — High-Level System Architecture

## 1. Architectural Philosophy
Omnikon 2.0 is built on **Next.js (App Router)** and **TypeScript**, powered by **Supabase PostgreSQL**. The architecture emphasizes:
- **Server Components First**: Maximum rendering on the server for performance, SEO, and security.
- **Client Components at Interactive Boundaries**: Interactive elements (modals, search inputs, active filters, form handlers) are isolated in dedicated Client Components (`'use client'`).
- **Unified Data Layer**: Supabase PostgreSQL serves as the database, auth provider, storage engine, and cache snapshot store. No secondary CMS is used.
- **Server-Side Integration & Resilience**: External integrations (GitHub API, metadata scrapers) run server-side with background revalidation and database fallbacks.

---

## 2. Next.js App Router Structure

```
src/
├── app/
│   ├── (public)/                     # Publicly accessible routes
│   │   ├── page.tsx                  # Homepage (Hero, Hackathon, Developer Journey)
│   │   ├── blogs/                    # Article & Tutorial Hub
│   │   │   ├── page.tsx              # Blogs listing & category filter (Server Component)
│   │   │   └── [slug]/page.tsx       # Single Article view (Server Component)
│   │   ├── projects/                 # Projects Explorer & Teardowns
│   │   │   ├── page.tsx              # Projects grid
│   │   │   └── [slug]/page.tsx       # Detailed project breakdown
│   │   ├── events/                   # Hackathons & Event Recaps
│   │   │   ├── page.tsx              # Events timeline
│   │   │   └── [slug]/page.tsx       # Event detail & recap
│   │   ├── members/                  # Community Member Wall & Directory
│   │   ├── updates/                  # Community announcements feed
│   │   ├── search/                   # Global search page
│   │   ├── about/                    # About Omnikon
│   │   ├── contact/                  # Contact form
│   │   ├── privacy/                  # Legal Privacy Policy
│   │   └── terms/                    # Legal Terms & Conditions
│   ├── (auth)/                       # Authentication views
│   │   ├── login/page.tsx            # Login page
│   │   └── signup/page.tsx           # Signup page
│   ├── (dashboard)/                  # Protected Member & Contributor views
│   │   └── dashboard/page.tsx        # Member profile & saved bookmarks
│   ├── (admin)/                      # Editorial & Admin Management Layer
│   │   ├── admin/                    # Admin Overview & Analytics
│   │   ├── admin/content/            # Content management (Articles, Projects, Events)
│   │   ├── admin/categories/         # Category & Tag management
│   │   └── admin/users/              # User role & permission management
│   ├── api/                          # Next.js Route Handlers
│   │   ├── github/sync/route.ts      # Server-side GitHub background sync
│   │   ├── scrape/route.ts           # Metadata scraping endpoint
│   │   └── ads/settings/route.ts     # AdSense route settings endpoint
│   ├── layout.tsx                    # Root Layout (Nav, Footer, Theme, Providers)
│   └── globals.css                   # Core Design Tokens & CSS Variables
├── components/                       # Reusable Components
│   ├── ui/                           # Base UI Tokens (Buttons, Cards, Badges, Modals)
│   ├── layout/                       # Navbar, Footer, Mobile Drawer, Breadcrumbs
│   ├── content/                      # Article Body, Code Block, Author Card
│   ├── github/                       # Repo Card, Contributor Badge, IssueSwipe Card
│   ├── ads/                          # AdSense Placeholder Container & Script Loader
│   └── admin/                        # Admin Datatables, Workflow Controls
├── lib/                              # Core Utility Modules
│   ├── supabase/                     # Supabase Server/Client utilities & RLS helpers
│   ├── github/                       # GitHub REST/GraphQL API integration client
│   ├── search/                       # PostgreSQL full-text search queries
│   └── utils/                        # Formatters, slugifiers, sanitizers
├── types/                            # TypeScript interfaces & Database definitions
│   ├── database.types.ts             # Auto-generated Supabase database types
│   └── content.types.ts              # Content entities & role permission definitions
└── middleware.ts                     # Next.js Middleware (Auth session, RBAC checks)
```

---

## 3. Server vs. Client Component Boundaries

### Server Components (`Renders on Server`)
- **Use Cases**: All page layouts, article body views, project grids, event listings, search result lists, metadata generation (`generateMetadata`), and database data fetching.
- **Benefits**: Zero client-side JS bundle cost for data fetching, direct Supabase SQL access, instant HTML streaming, SEO optimization.

### Client Components (`'use client'`)
- **Use Cases**: Navbar mobile toggle menu, interactive search input fields, category dropdown filters, blog submission modal forms, IssueSwipe card swiper, toast notifications, ad slot mounts.
- **Rule**: Keep Client Components leaf-level to maximize Server Component rendering trees.

---

## 4. Supabase Integration Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS APPLICATION                    │
├──────────────────────────────┬──────────────────────────────┤
│    SERVER COMPONENTS         │    CLIENT COMPONENTS         │
│    (Server-side SQL/RLS)     │    (Browser Auth/UI State)   │
├──────────────────────────────┼──────────────────────────────┤
│  @supabase/ssr               │  @supabase/ssr               │
│  createClient (Server)       │  createBrowserClient         │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE POSTGRESQL DATABASE                │
│    - Tables: profiles, articles, projects, events, etc.     │
│    - RLS Security Policies (RBAC enforced at database level)│
│    - Storage Buckets: avatars, article-images, project-media│
└─────────────────────────────────────────────────────────────┘
```

1. **Server-Side Supabase Client (`@supabase/ssr`)**: Used in Server Components, Route Handlers, and Server Actions. Respects request cookie sessions and enforces Row Level Security (RLS).
2. **Client-Side Supabase Client**: Used in interactive components for auth state listeners or client-side form submissions.
3. **Database Schema & Types**: TypeScript types automatically synchronized with PostgreSQL tables (`database.types.ts`).

---

## 5. Design System Integration (`omnikon-design`)

Omnikon 2.0 integrates the official design system tokens directly into Tailwind CSS and CSS variables:

- **Root Background**: `#050505` (Deep Obsidian)
- **Container Surfaces**: `#0A0A0A` (Base Surface), `#121212` (Container Low), `#18181B` (Container High)
- **Brand Accent**: `#FF3131` (Neon Red) with glow shadow utilities (`shadow-[0_0_15px_rgba(255,49,49,0.3)]`)
- **Typography**:
  - `font-mono`: `JetBrains Mono` for terminal headers (`SYS.BLOG.INIT`), code tags, badges, navigation, and metrics.
  - `font-sans`: `Inter` for headings, body text, and article copy.
- **Terminal Aesthetics**: Monospace headers, status pulse dots, fine grid overlays (`grid-bg`), 1px borders (`border-[#27272A]`).
