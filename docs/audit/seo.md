# SEO Audit

## 1. Metadata & Identifiers Audit

| Page | Title Tag (`<title>`) | Meta Description | Canonical URL Tag | Structured Data (JSON-LD) |
| :--- | :--- | :--- | :--- | :--- |
| `/index.html` | Omnikon \| Open Source Community for Developers | Present (Generic OG summary) | Present (`https://omnikonhub.com/`) | Incomplete / Inline script |
| `/blogs.html` | Developer Blog \| Omnikon | Present (*"Read latest technical articles..."*) | Present (`https://omnikonhub.com/pages/blogs.html`) | BreadcrumbList & Blog schema |
| `/projects.html` | Projects Explorer \| Omnikon | Missing or duplicate | Present (`/pages/projects.html`) | Missing |
| `/members.html` | Community Members \| Omnikon | Generic | Present (`/pages/members.html`) | Missing |
| `/achievements.html` | Achievements \| Omnikon | Generic | Present (`/pages/achievements.html`) | Missing |
| `/ambassadors.html` | Campus Ambassador \| Omnikon | Present | Present (`/pages/ambassadors.html`) | Missing |
| `/docs.html` | Documentation \| Omnikon | Present | Present (`/pages/docs.html`) | Missing |

---

## 2. Issues & Vulnerabilities Identified

### A. Canonical Path Discrepancy
- The existing site uses canonical URLs pointing to `/pages/blogs.html` rather than clean URLs (`https://omnikonhub.com/blogs`).
- This causes canonical mismatches when Vercel rewrites clean URLs, confusing search engine crawlers.

### B. Inconsistent Heading Hierarchy (`<h1>` - `<h6>`)
- Several pages contain multiple `<h1>` elements (e.g. logo title in header + page main title), violating single `<h1>` hierarchy rules.
- Heading tags in blog card previews use `<h3>` tags out of document sequence.

### C. Image Alt Text & Accessibility Attributes
- Header logo `<img src="/assets/LogoOmnikon.jpeg">` has alt text `"Omnikon Logo"`.
- Member avatar graphics and repository cards on index pages lack descriptive `alt` tags or use generic filenames (`image.png`).

### D. Structured Data Deficiencies
- `JSON-LD` schemas exist only on `blogs.html` and are hardcoded into script tags.
- Missing `Organization` schema on homepage, `Event` schema on Hackathon 2026 section, and `SoftwareApplication` schema on project pages.

### E. Sitemap & Robots.txt Status
- `robots.txt` exists at root allowing all crawlers:
```
User-agent: *
Allow: /
Sitemap: https://www.omnikonhub.com/sitemap.xml
```
- `sitemap.xml` includes static routes with static priority tags. Needs automated generation for dynamic blog posts and project routes.

---

## 3. SEO Action Plan for Omnikon 2.0

1. **Clean Route Standard**: Enforce canonical URLs with clean extensionless paths (`https://www.omnikonhub.com/blogs`, `/projects`, `/members`).
2. **Single `<h1>` Policy**: Restrict page templates to one `<h1>` header per route.
3. **Comprehensive Schema Injection**:
   - `Organization` & `WebSite` schema on homepage.
   - `BlogPosting` & `TechArticle` schema on native articles.
   - `Event` schema for Hackathon events.
   - `BreadcrumbList` on all nested pages.
4. **Automated Dynamic Sitemap**: Generate sitemap entries automatically during production builds.
