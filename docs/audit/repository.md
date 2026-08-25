# Existing Repository Audit

## 1. Overview
The current repository powers the official Omnikon website ([omnikonhub.com](https://www.omnikonhub.com/)). The project is structured as a multi-page static site (MPA) built with **Vite** and styled using **Tailwind CSS**. Dynamic content is fetched on the client side via Supabase and external APIs, backed by Vercel serverless functions for administrative operations.

---

## 2. Tech Stack & Environment Architecture

| Category | Technology | Usage / Purpose |
| :--- | :--- | :--- |
| **Build Tool & Bundler** | Vite (`vite.config.mjs`) | Multi-page HTML bundling, dev server rewrites |
| **Language** | JavaScript (ES6+) | Client-side interactivity and serverless API functions |
| **Styling Framework** | Tailwind CSS + PostCSS | Utility-first CSS, custom dark mode classes, glowing animations |
| **Package Manager** | `npm` | Dependency management (`package.json`) |
| **Backend & Storage** | Supabase (`@supabase/supabase-js`) | PostgreSQL database index for blog articles |
| **Authentication** | Firebase Auth (Compat SDKs) & Secret Key | Admin authorization key for blog publishing |
| **Serverless Engine** | Vercel Serverless Functions (`api/`) | Server-side metadata scraping and blog insertions |
| **Hosting & Routing** | Vercel | Static page hosting and path rewrites (`vercel.json`) |

---

## 3. Directory & File Structure Audit

```
Website/
├── .github/                  # GitHub Actions workflows & PR templates
├── api/                      # Vercel Serverless Functions
│   ├── scrape.js             # Server-side metadata scraper for blog URLs
│   └── blog-insert.js        # Authorized Supabase blog insertion endpoint
├── assets/                   # Compiled CSS/JS bundles and image assets
├── pages/                    # Multi-page HTML templates
│   ├── index.html            # Homepage (Hero, Hackathon, Developer Journey, Projects)
│   ├── blogs.html            # Developer Blog Aggregator & Submission Modal
│   ├── projects.html         # Omnikon Projects Explorer
│   ├── members.html          # Community Member Directory & Roles
│   ├── achievements.html     # Community Metrics & Milestones
│   ├── ambassadors.html      # Campus Ambassador Program
│   ├── docs.html             # Community Guidelines & Documentation
│   ├── about.html            # About Omnikon Organization
│   ├── contact.html          # Contact Us Form
│   ├── privacy.html          # Privacy Policy
│   ├── terms.html            # Terms & Conditions
│   └── r.html                # Referral & Shortlink Handler (`/omnikon-ref-:id`)
├── public/                   # Static assets served as-is (Logo, favicons, env-public.json)
├── ads.txt                   # Google AdSense Publisher verification file
├── auth.js                   # Client-side Firebase/Supabase auth helpers
├── chatbot.js                # AI assistant widget handler
├── fetch_community_feed.js   # Script for aggregation of community activity
├── fetch_github_data.sh      # Bash script fetching GitHub org stats into JSON
├── generate-env.js           # Build script generating public/env-public.json
├── update-seo.js             # Automated script injecting SEO tags across pages
├── vercel.json               # Vercel URL rewrite rules
├── vite.config.mjs           # Custom Vite configuration plugin
└── package.json              # Project dependencies and script definitions
```

---

## 4. Subsystem Audits

### A. Build System & Routing
- **Vite Configuration**: `vite.config.mjs` defines a custom middleware `pagesRewritePlugin` to mirror Vercel production rewrites in development. E.g., requests to `/` resolve to `/pages/index.html`, and `/omnikon-ref-:id` maps to `/pages/r.html?id=:id`.
- **Vercel Routing**: `vercel.json` maps incoming routes to `/pages/*.html` without forcing explicit `.html` extensions in browser URLs.

### B. Component & Layout Model
- **HTML Redundancy**: Navbars and footers are **duplicated across every HTML file** in `pages/`, requiring manual multi-file edits whenever navigation links change.
- **No Component Framework**: Lacks React/Vue/Svelte components. All UI updates rely on raw JavaScript DOM manipulation (`document.getElementById`, `innerHTML`).

### C. Data Management & API Integrations
- **Supabase Blog Database**: The blog page queries a Supabase `blogs` table on load.
- **GitHub Data Pipeline**: Repository statistics are partially static and partially updated via client scripts or `fetch_github_data.sh` generating `github_summary.json`.

### D. AdSense & Monetization Setup
- **Publisher Account**: Google AdSense Client ID `ca-pub-8663425706426895` is loaded in head tags.
- **Verification**: `ads.txt` is published at site root containing `google.com, pub-8663425706426895, DIRECT, f08c47fec0942fa0`.
