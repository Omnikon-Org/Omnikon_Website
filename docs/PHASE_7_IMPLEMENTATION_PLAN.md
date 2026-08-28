# Omnikon 2.0 — Phase 7 Implementation Plan (Reconciled with Audits)

This plan details the technical steps to transform the Omnikon 2.0 platform from a technically verified site into an active, clearly positioned, and highly useful student-powered developer ecosystem.

---

## 1. Objectives

- **Product Positioning**: Refine homepage messaging to ensure a first-time visitor understands Omnikon's open-source community focus within 5–10 seconds.
- **Content Seeding & Audit**: Perform a comprehensive content audit (`docs/PHASE_7_CONTENT_AUDIT.md`). Seed only real, verified profiles, projects, and events. No fake statistics, community numbers, or fake repository activity will be introduced.
- **Ecosystem Contribution Loops**: Enrich project detail pages with technology stacks, GitHub stats, active issue trackers, and open-source contribution terminology (e.g., "Good First Issue", "Open on GitHub", "Contribute").
- **Onboarding Journey**: Route successfully authenticated users to a dedicated `/dashboard` layout presenting a "next-steps" onboarding card. Keep `/login` strictly focused on credential authentication.
- **Ecosystem Metrics & Analytics**: Reuse the existing `view_logs` table via a server-only `/api/analytics` endpoint to log clicks and views (e.g. project views, GitHub redirects, issue clicks) without exposing database secrets.

---

## 2. Proposed Changes & Implementation Stages

### Stage 1: Repository + Production Database Audit
- Confirm that database migrations are applied.
- Inspect `package.json`, `next.config.mjs`, and Tailwind CSS structures.

### Stage 2: Content Audit
- Create `docs/PHASE_7_CONTENT_AUDIT.md`.
- Detail existing database row status for profiles, articles, projects, events, and updates.
- Formulate a clear content requirement checklist of actual, non-fabricated records.

### Stage 3: Homepage & Product Positioning
- Modify `src/app/page.tsx` to align with the core visual brand positioning:
  - "Omnikon is a student-powered open-source developer community where you learn by building, contribute to real projects, participate in hackathons, and grow as a developer."
  - Introduce core ecosystem landmarks: `LEARN`, `BUILD`, `CONTRIBUTE`, `COMPETE`, `GROW`.
  - Primary CTA: "Explore Projects". Secondary CTA: "Join Omnikon".

### Stage 4: Projects & Contribution Explorer
- Enhance `/projects/[slug]/page.tsx` with:
  - Technical Stack and Project Status indicators.
  - Integration of the `IssueSwipe` component to render active repository issues.
  - CTAs using standard contribution terminology: "Open on GitHub", "Good First Issue", "Start Contributing", "Explore Issue". No claiming/ownership labels.

### Stage 5: Events & Articles Experience
- Restructure the `/events` and `/events/[slug]` views to clearly mark event states: `UPCOMING`, `ACTIVE`, `COMPLETED`.
- Update detail headers to emphasize actionable steps ("Register Now", "Read Event Recap").

### Stage 6: Authenticated Onboarding & Dashboard
- Create the `/dashboard` route ([`src/app/dashboard/page.tsx`](file:///Users/pthawait/Documents/GitHub/Omnikon_Website/src/app/dashboard/page.tsx)) for authenticated members.
- Display a clear welcome onboarding card containing next actions: completing their developer profile, exploring active repositories, and claiming beginner issues.
- Keep `/login` focused purely on sign-in, sign-up, and password recovery.

### Stage 7: Analytics Tracking
- Prohibit client-side access to database tables.
- Implement `/api/analytics` server route.
- Reuse the existing `view_logs` table by mapping clicks and view events using `createAdminClient()`.
- Document analytics definitions in `docs/PHASE_7_ANALYTICS.md`.

### Stage 8: UX, Accessibility, SEO, and Performance Refinement
- Ensure WCAG 2.1 AA keyboard focus indicators, visible text contrasts, and semantic HTML5 tag hierarchies are clean.
- Ensure canonical headers always point to `https://www.omnikonhub.com/`.

---

## 3. Verification Plan

### Stage 9: Local Runtime Verification
- Start local production server and execute full route audits:
  - `./node_modules/.bin/tsc --noEmit`
  - `./node_modules/.bin/next lint`
  - `./node_modules/.bin/next build`
  - `node scripts/verify-database.mjs`
  - `node scripts/run-security-matrix.mjs`

### Stage 10: Deployed Vercel Runtime Verification
- Verify routing, authentication, Supabase connectivity, and canonical links directly on the deployed URL:
  - Deployed: `https://omnikon-website.vercel.app/`
  - Production Domain: `https://www.omnikonhub.com/`

### Stage 11: Final Phase 7 Report
- Create `docs/PHASE_7_RUNTIME_VERIFICATION.md` detailing actual runtime E2E test results, console outputs, and blockers.
