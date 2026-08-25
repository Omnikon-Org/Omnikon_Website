---
name: seo-adsense
description: Guides technical SEO implementation (JSON-LD, meta tags, canonicals) and policy-compliant AdSense ad placement for Omnikon. Use when adding metadata, structured data, or ad units to pages.
---

# Omnikon SEO & Policy-Compliant AdSense Integration

## 1. Core Principles & Philosophy
SEO and AdSense strategies on Omnikon must prioritize **genuine user value** and **strict policy compliance**. We build search visibility by offering high-quality developer resources, not through SEO tricks. AdSense monetization must be clean, non-intrusive, and compliant with Google Publisher Policies.

---

## 2. Technical SEO Standards

### Meta Tags & Page Identifiers
Every indexable HTML page must include:
```html
<title>Descriptive Title | Omnikon</title>
<meta name="description" content="150-160 character summary of technical content.">
<meta name="keywords" content="Omnikon, Open Source, Developer Community, Hackathons, Tech Stack">
<meta name="theme-color" content="#050505">
<link rel="canonical" href="https://www.omnikonhub.com/exact-page.html">
<meta name="robots" content="index, follow">
```

### Social Graph (OpenGraph & Twitter Cards)
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta property="og:type" content="website">
<meta property="og:image" content="https://www.omnikonhub.com/assets/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://www.omnikonhub.com/assets/og-cover.png">
```

### Structured Data (JSON-LD Schemas)
Insert valid schema blocks in `<head>`:
- **Homepage**: `Organization` & `WebSite`
- **Articles & Blogs**: `BlogPosting` or `TechArticle` with author, publisher, and mainEntityOfPage.
- **Hackathons**: `Event` with start/end dates, location/virtual URL, and event status.
- **Sub-pages**: `BreadcrumbList` tracking path hierarchy (`Home > PageName`).

---

## 3. Policy-Compliant AdSense Integration

### Publisher Details
- **AdSense Client ID**: `ca-pub-8663425706426895`
- **Script Tag**:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8663425706426895" crossorigin="anonymous"></script>
```

### Ad Placement Rules
1. **Content-to-Ad Ratio**: Pages must have substantial, readable text content (minimum 300+ words of main content) before any ad unit is included.
2. **Contextual Placement**: Place ad units naturally between major content blocks (e.g. between article body sections) or at the end of long articles.
3. **No Interactive Interference**: Never place ads directly adjacent to critical navigation buttons, CTA buttons ("Star on GitHub", "Submit Hackathon"), or form inputs to prevent accidental clicks.
4. **Distinct Container & Layout**: Ad containers must be clearly distinguishable from native UI elements.

### STRICT ADSENSE POLICY PROHIBITIONS
- ❌ **No Ad Tricks or Masking**: Do not style ads to look like site download buttons, terminal consoles, or primary action buttons.
- ❌ **No Ads on Thin / Empty Pages**: Never load AdSense script on login pages, empty search results, 404 pages, or pages with minimal text.
- ❌ **No Auto-Refreshing Ad Containers**: Do not force ad refreshes via timers or hidden web worker scripts.
- ❌ **No Policy Violation Risks**: Ensure no content violates Google Publisher Policies (copyrighted code dumps, low-value automated scrapers without editorial context).
