# Omnikon 2.0 — Phase 7 Database & Ecosystem Content Audit

This document records the exact row metrics, schema configurations, and record states for all database tables on the live remote Supabase instance (`ap-northeast-2` region). It delineates real existing production content, missing content, and content requiring manual human creation.

---

## 1. Live Database Inspection & Metrics

| Database Table | Live Rows | Status | Schema Purpose / Content Type |
| :--- | :---: | :---: | :--- |
| `profiles` | **0** | Missing | Developer profiles (username, full_name, avatar, bio, tier, role) |
| `profile_private` | **0** | Missing | Private contact information & emails |
| `articles` | **0** | Missing | Technical blogs, system architecture tutorials, engineering breakdowns |
| `projects` | **0** | Missing | Native open-source repositories & tools catalog |
| `events` | **0** | Missing | Hackathons, workshops, competitions, meetups |
| `event_recaps` | **0** | Missing | Completed hackathon winner recaps and showcase entries |
| `updates` | **0** | Missing | Technical announcements & release updates |
| `categories` | **5** | **Seeded** | Core taxonomy: Web Dev, AI/ML, Open Source, Hackathons, Tutorials |
| `tags` | **10** | **Seeded** | Technology taxonomy: Next.js, TS, React, Supabase, Python, etc. |
| `redirects` | **11** | **Seeded** | Preserved legacy route mappings (e.g., `/blogs.html` &rarr; `/blogs`) |
| `view_logs` | **0** | **Ready** | Privacy-conscious interaction analytics logs (RLS enabled, admin-only write) |
| `audit_logs` | **0** | **Ready** | Immutable CMS & administrative action logs |
| `github_cache` | **0** | **Ready** | GitHub organization API responses cache |
| Junction Tables (8) | **0** | **Ready** | `article_tags`, `project_tags`, `event_tags`, `article_projects`, etc. |

---

## 2. Content Categorization

### A. Real Existing Production Content
1. **Taxonomy Categories (5 Records)**:
   - `Web Development` (`web-dev`)
   - `AI & Machine Learning` (`ai-ml`)
   - `Open Source Ecosystems` (`open-source`)
   - `Hackathons & Competitions` (`hackathons`)
   - `Engineering Tutorials` (`tutorials`)
2. **Taxonomy Tags (10 Records)**:
   - `Next.js`, `TypeScript`, `Tailwind CSS`, `Supabase`, `React`, `Python`, `Node.js`, `PostgreSQL`, `GraphQL`, `Docker`.
3. **Legacy URL Preservation Redirects (11 Records)**:
   - Directs legacy HTML and legacy URL paths (`/blogs.html`, `/events.html`, `/projects.html`, etc.) to clean Next.js App Router canonical routes.

---

### B. Missing Content
- **Developer Profiles**: No member or maintainer profiles exist in `profiles`.
- **Open-Source Projects**: No repositories are registered in `projects`.
- **Technical Articles**: No engineering guides or tutorials exist in `articles`.
- **Hackathons & Events**: No active, upcoming, or completed events exist in `events`.
- **Event Recaps**: No past hackathon winner entries exist in `event_recaps`.
- **System Updates**: No announcements exist in `updates`.

---

### C. Content Requiring Manual Human Creation

To activate each section without placeholder or fabricated data, the following verified real content must be created by the Omnikon team:

1. **Maintainer Profiles (Admin / Editor)**:
   - Require real authenticated users registered through Supabase Auth.
   - Core organizer/maintainer profiles with actual GitHub usernames, avatars, and bios.
2. **Omnikon Monolith Repository Registration**:
   - Register the official open-source website project (`Omnikon-Org/Omnikon_Website`) with genuine summary, tech stack (`['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase']`), and MDX architecture documentation.
3. **Verified Hackathon / Workshop Announcements**:
   - At least 1 legitimate upcoming hackathon with actual dates, tracks, and official registration URLs.
4. **Peer-Reviewed Engineering Tutorials**:
   - High-value technical guides (e.g., "Designing Scalable Row Level Security in Supabase", "App Router Architecture in Next.js 15") authored by real developers.

---

## 3. Strict Anti-Fabrication Declarations

In strict adherence to the project standards and Phase 7 requirements:
- **NO Fake Users / Contributors**: Zero synthetic profile accounts will be inserted.
- **NO Fake Star Counts / GitHub Metrics**: All GitHub statistics must derive from live GitHub API metrics or real repository states.
- **NO Fabricated Hackathons or Winner Recaps**: All competition data must represent actual verified events.
- **NO Ghost Articles**: No articles will be attributed to fictitious personas or generated as filler copy.
- **Intentional Empty States**: While database rows are 0, all user-facing directories (`/blogs`, `/projects`, `/events`, `/members`) display intentional, styled `<EmptyState />` UI components explaining that real published items will appear once created.
