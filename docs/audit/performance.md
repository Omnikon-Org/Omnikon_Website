# Performance & Core Web Vitals Audit

## 1. Metric Targets & Current Assessment

| Metric | Target | Current Status | Risk Level | Primary Cause |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | `< 1.5s` | Moderate (~2.1s) | Medium | Uncompressed JPEG images & un-preloaded fonts |
| **INP** (Interaction to Next Paint) | `< 200ms` | Fast (~120ms) | Low | Debounced event listeners needed for inputs |
| **CLS** (Cumulative Layout Shift) | `< 0.1` | Poor (~0.25) | **HIGH** | Dynamic AdSense insertion & image dimensions |

---

## 2. Identified Bottlenecks & Optimization Opportunities

### A. Dynamic Layout Shift (CLS Vulnerability)
- **Problem**: AdSense script (`adsbygoogle.js`) and Supabase blog card renderer insert elements into the DOM without pre-allocated container heights. When ads load, the page content jumps down by 250px-300px.
- **Solution**: Set explicit CSS `min-height` reservoirs on ad slots (`min-height: 280px`) and skeleton loader placeholders for blog/project cards.

### B. Font Loading & FOIT
- **Problem**: `Inter` and `JetBrains Mono` Google Fonts are imported via render-blocking `<link rel="stylesheet">` tags without optimal preconnect configurations across all HTML pages.
- **Solution**: Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` with `display=swap` parameter.

### C. Uncompressed Assets & Image Optimization
- **Problem**: Images such as `LogoOmnikon-BC6S2juO.jpeg` and project cover graphics are served as uncompressed JPEGs without explicit `width` and `height` attributes.
- **Solution**: Convert all static site graphics to compressed `WebP`/`AVIF` formats, supply explicit dimensions, and apply `loading="lazy"` to below-the-fold media.

### D. Duplicate SDK Inclusions
- **Problem**: Page templates include full Firebase compatibility scripts (`firebase-app-compat.js`, `firebase-auth-compat.js`) alongside Supabase client scripts, even on pages that do not use authentication.
- **Solution**: Load Firebase/Supabase SDK scripts conditionally only on routes that require database or authentication interactions.

### E. Client-Side API Bottlenecks
- **Problem**: GitHub API requests for org repos and stargazers execute un-cached client-side calls on every page load.
- **Solution**: Implement client-side `localStorage` caching with 15-minute TTL and server-side edge caching for GitHub metrics.
