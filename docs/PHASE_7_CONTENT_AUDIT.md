# Omnikon 2.0 — Phase 7 Database Content Audit

This document records the exact row metrics and record states for all database tables on the live remote Supabase instance (`ap-northeast-2` region). It outlines missing content requirements and defines the checklist for the Omnikon team.

---

## 1. Content Audit Summary

| Database Table | Rows Found | Content Status | Content Type / Description |
| :--- | :---: | :---: | :--- |
| `profiles` | **0** | EMPTY | Community member / developer profiles |
| `profile_private` | **0** | EMPTY | Personal contact, email, and address info |
| `articles` | **0** | EMPTY | Technical blogs, guides, and engineering tutorials |
| `projects` | **0** | EMPTY | Open-source repositories and tools Explorer |
| `events` | **0** | EMPTY | Hackathons, workshops, and competitions |
| `event_recaps` | **0** | EMPTY | Summaries and winners from completed events |
| `updates` | **0** | EMPTY | Technical launch and community release updates |
| `categories` | **5** | SEEDED | Web Dev, AI/ML, Open Source, Hackathons, Tutorials |
| `tags` | **10** | SEEDED | Tech stacks (Next.js, TS, React, Supabase, Python, etc.) |
| `redirects` | **11** | SEEDED | Legacy URL preservation mappings (e.g. `/blogs.html` &rarr; `/blogs`) |

---

## 2. Identified Content Gaps & Requirements

Since the main directories (`/blogs`, `/projects`, `/events`, `/members`, `/admin`) are currently empty of live data, the frontend renders standard fallback `<EmptyState />` templates. To make the platform feel alive and genuinely useful to new visitors, the following foundational production content is required.

> [!IMPORTANT]
> In compliance with security and audit guidelines, **NO fabricated data** (fake users, fake repositories, mock comments, simulated hackathon winners, or imaginary star counts) shall be seeded or displayed in production.

### A. Profiles Content Requirement
- **Maintainer Profiles**: At least 2 profiles representing core organizers/mentors of Omnikon.
  - Required fields: Name, Avatar, Bio, Role (`admin` or `editor`), Developer Tier (`maintainer`), GitHub username.
- **Member Profiles**: A way for actual student members to sign up and populate the directory via standard onboarding.

### B. Projects Content Requirement
- **Omnikon Monolith Repository**: 1 entry representing the official open-source website project explorer.
  - Required fields: Name, Slug (`omnikon-website-v2`), Summary, MDX details body, GitHub Repository URL (`https://github.com/Omnikon-Org/Omnikon_Website`), Tech Stack (`['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase']`), Status (`published`).

### C. Events Content Requirement
- **Active / Upcoming Event**: At least 1 real upcoming hackathon or accelerator session.
  - Required fields: Name, Description, Date, Status (`active` or `upcoming`), Registration link.
- **Legacy / Completed Event**: At least 1 past hackathon showing problem statements and tracks.

### D. Articles Content Requirement
- **Foundational Tutorials**: At least 2 high-quality, peer-reviewed technical tutorials.
  - Required topics: Next.js App Router optimization, Supabase RLS design patterns, or Git collaboration guides.

---

## 3. Legitimacy Verification Checklist

Before publishing or seeding any record on the Cloud database:
- [ ] Confirm all profile IDs match real auth users.
- [ ] Confirm GitHub repository URLs point to actual active public repositories in the `Omnikon-Org` organization.
- [ ] Ensure that open-source issues rendered in the UI match actual open issues retrieved from the GitHub API.
- [ ] Verify that all event registration targets and dates are actual dates (no dummy placeholders).
- [ ] Audit that no AI-generated filler copy exists in articles or tutorials.
