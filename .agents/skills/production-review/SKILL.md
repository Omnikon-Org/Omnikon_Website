---
name: production-review
description: Defines the mandatory pre-deployment audit, quality assurance checklist, and verification protocols for Omnikon 2.0. Use before submitting code changes or approving deployments.
---

# Omnikon Production Review & Quality Assurance Protocol

## 1. Purpose & Scope
The `production-review` skill defines the formal gatekeeper checklist that MUST be passed before any code, component, or content update is merged or deployed to production on Omnikon 2.0 (`https://www.omnikonhub.com/`).

---

## 2. Pre-Deployment Audit Checklist

### Gate 1: Visual Identity & Design System Audit (`omnikon-design`)
- [ ] Visual aesthetic strictly aligns with Omnikon's Cyberpunk / Dev-Terminal dark theme.
- [ ] Primary accent `#FF3131` used correctly without overwhelming the interface.
- [ ] Typography uses `JetBrains Mono` for code/labels/system indicators and `Inter` for body copy.
- [ ] No generic light-mode cards, soft SaaS gradients, or placeholder visual artifacts exist.

### Gate 2: Content Authenticity Audit (`omnikon-content`)
- [ ] All copy is original, substantive, and directly relevant to student developers/OSS.
- [ ] Zero "Lorem Ipsum", AI fluff, or placeholder text.
- [ ] All project listings reference real `Omnikon-Org` repositories (e.g. Astrodex, CNTRL, IssueSwipe).
- [ ] All indexable routes contain meaningful technical substance.

### Gate 3: SEO & Metadata Audit (`seo-adsense`)
- [ ] Page title `<title>` and `<meta name="description">` present, unique, and descriptive.
- [ ] Canonical URL tag (`<link rel="canonical">`) correctly defined.
- [ ] OpenGraph and Twitter social card tags properly configured.
- [ ] Valid JSON-LD structured data (`Organization`, `TechArticle`, `Event`, `BreadcrumbList`) present and error-free.

### Gate 4: AdSense Compliance Audit (`seo-adsense`)
- [ ] AdSense publisher ID `ca-pub-8663425706426895` verified.
- [ ] Content-to-ad ratio verified (substantial content before ad placement).
- [ ] Ads are non-intrusive and placed far from interactive buttons to prevent accidental clicks.
- [ ] Zero deceptive layout tricks (ads are clearly distinguished from site controls).

### Gate 5: GitHub Integration Sync Audit (`github-integration`)
- [ ] All organization links point correctly to `Omnikon-Org`.
- [ ] Rate-limit fallback mechanism (local cache / static fallbacks) functional.
- [ ] Diagnostic status indicators work properly when GitHub API calls fail or timeout.

### Gate 6: Accessibility & Performance Audit (`accessibility-performance`)
- [ ] Text contrast ratios meet WCAG 2.1 AA (minimum 4.5:1 ratio on `#050505`).
- [ ] Full keyboard navigation operational with visible focus indicators.
- [ ] All icon buttons include `aria-label` and images have `alt` tags.
- [ ] Zero layout shifts (CLS < 0.1) caused by image or ad container loading.
- [ ] Target load time < 1.5s LCP achieved.

### Gate 7: Build & Link Integrity Audit
- [ ] Zero JavaScript console errors or unhandled promise rejections.
- [ ] Production build compiles cleanly without typescript/linter warnings.
- [ ] All internal navigation links, breadcrumbs, and footer links resolve properly (zero 404s).

---

## 3. Approval Protocol
A deployment candidate is approved for production **ONLY** when all 7 audit gates pass verification without exceptions or warnings.
