# Live Website Audit

## 1. Page-by-Page Audit

### A. Homepage (`/index.html`)
- **Navigation Bar**: Fixed top navigation with blurred obsidian background (`#050505`/80), brand logo, navigation links, and "Star on GitHub" CTA button. Mobile hamburger menu toggles drop-down navigation.
- **Hero Section**: Tagline *"We build developer centric open learning, and student developers to create real impact"*, bullet highlights, "Explore Projects" & "Join Community" CTAs, and counter badges (1.6K+ Quiz Registrations, 1.4K+ Hackathon Registrations).
- **Flagship Hackathon Banner**: Omnikon National TechHackathon 2026 milestone tracker (Registration Closed, Problem Statements Released, Submission, Evaluation, Winners).
- **Developer Journey Tiers**: Visual role progression (Student -> Learner -> Builder -> Contributor -> Maintainer).
- **Mentorship & Featured Repos**: Highlights GSSoC 2026 selection (`Astrodex`), ECSoC 2026 selection (`CNTRL`), and `IssueSwipe`.
- **Live Activity Ticker**: Animated stream showing recent PR merges, new contributors, and doc updates.
- **Projects Explorer & Member Wall**: Dynamic preview sections linking to full pages.
- **Footer**: Community links, social channels (GitHub, Discord, Instagram, X, LinkedIn), and legal pages.

### B. Projects Explorer (`/projects.html`)
- **Structure**: Grid of open-source projects hosted under `Omnikon-Org`.
- **Interactivity**: Filter by technology stack or project domain.
- **Utility**: High utility for developers searching for beginner-friendly open-source repositories to contribute to.

### C. Developer Blog (`/blogs.html`)
- **Structure**: Article cards featuring thumbnail image, author name, publication date, platform tag (`Dev.to`, `Hashnode`, `Medium`, `Substack`, `GitHub Pages`, `Personal Blog`), and snippet.
- **Header Stats Ticker**: Displays live counts for Total Articles, Total Authors, and Total Platforms.
- **Article Aggregator Modal**: Allows authorized admins to input a blog URL, server-side scrape metadata (`/api/scrape`), preview title/author, and save to Supabase (`/api/blog-insert`).
- **Interactive Controls**: Real-time search bar, platform dropdown filter, date sorter (Newest/Oldest).

### D. Community Members & Ambassadors (`/members.html` & `/ambassadors.html`)
- **Members Directory**: Grid displaying community members, GitHub handles, role tags (Student, Learner, Builder, Contributor, Maintainer), and contribution activity.
- **Ambassador Program**: Explains campus ambassador responsibilities, perks, leadership tracks, and application flow.

### E. Achievements & Quiz Arena (`/achievements.html`)
- **Metrics Breakdown**: Detailed statistics on hackathon participants (1.4K+), quiz registrations (1.6K+), community events, and project milestones.

### F. Docs, Legal & Utility Pages (`/docs.html`, `/privacy.html`, `/terms.html`, `/contact.html`)
- **Docs Page**: Guidance on GitHub contributions, code of conduct, and organization standards.
- **Privacy & Terms**: Policy compliance documents required for Google AdSense verification.
- **Contact Page**: Direct inquiry form and community Discord links.

---

## 2. Interactive States & UX Audit

| Page / Component | Loading State | Empty State | Error State |
| :--- | :--- | :--- | :--- |
| **Blogs Grid** | Animated spinner with `SYS.BLOG.INIT` label | Graphic icon with "No Articles Listed" & "Share an Article" CTA | Inline alert box: *"Could not retrieve articles from database index"* |
| **Blog Scraper Modal** | Server-side parsing spinner | N/A | Inline error banner: *"Automatic metadata extraction failed. Please fill details manually"* |
| **Projects List** | Skeleton loader cards | *"No matching projects found"* | Fallback static repo list displayed |
| **Member Wall** | Skeleton loader grids | *"No members found for selected role"* | Static core team list fallback |

---

## 3. Classification: Functional Utility vs. Decorative

### Genuinely Useful Features (KEEP & ENHANCE)
1. **GitHub Issue & Project Explorer**: Directly connects developers to active `Omnikon-Org` repositories (Astrodex, CNTRL, IssueSwipe).
2. **Hackathon Event Tracker**: Delivers clear problem statements, submission links, and real-time phase updates.
3. **Developer Journey Roadmap**: Provides clear milestone guidance for student developers evolving into open-source maintainers.
4. **Blog Search & Category Filter**: Enables users to search technical articles by topic or platform.

### Decorative / Fluff Elements (REBUILD OR REPLACE)
1. **Hardcoded Activity Ticker**: Fixed fake activity stream strings rather than live GitHub webhook feeds.
2. **Duplicated Static Navbars/Footers**: Unmaintained copy-pasted HTML blocks across 11 static pages.
3. **External Blog Link Scraping**: Aggregating links to third-party sites rather than hosting complete native technical tutorials (primary cause of AdSense "Low Value Content" violation).
