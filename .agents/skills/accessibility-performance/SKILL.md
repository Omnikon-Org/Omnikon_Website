---
name: accessibility-performance
description: Enforces WCAG 2.1 AA accessibility, contrast standards on dark mode, keyboard navigation, semantic HTML, and Core Web Vitals optimization. Use when building UI, optimizing assets, or auditing page performance.
---

# Omnikon Accessibility & Web Performance Standards

## 1. Accessibility (WCAG 2.1 AA Standards)

### A. Dark Mode Contrast Compliance
Omnikon's native dark mode (`#050505`) requires strict contrast management to ensure legibility:
- **Normal Text (< 18pt)**: Minimum **4.5:1** contrast ratio against background surfaces.
- **Large Text (>= 18pt or 14pt bold)**: Minimum **3.0:1** contrast ratio.
- **Primary Accent (`#FF3131`) Usage**: Must be paired with high-contrast text when used as a button background (`#050505` text on `#FF3131` button background), or used purely as borders/accent indicators when paired with `#FAFAFA` white text.
- **Muted Text (`#A1A1AA`)**: Must maintain 4.5:1 contrast against `#050505` and `#0A0A0A` containers.

### B. Keyboard Navigation & Focus Ring Rules
- All interactive elements (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`) must be fully navigable via keyboard (`Tab` and `Shift+Tab`).
- **Focus Ring Styling**: Never use `outline: none` without a visible high-contrast custom replacement:
```css
a:focus-visible, button:focus-visible, input:focus-visible {
    outline: 2px solid #FF3131;
    outline-offset: 2px;
}
```

### C. Semantic HTML & ARIA Attributes
- Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **Icon Buttons**: Every button containing only an icon must provide a descriptive `aria-label` attribute (e.g. `aria-label="Star on GitHub"`, `aria-label="Close modal"`).
- **Images**: All `<img>` elements must have meaningful `alt` attributes describing the graphic content.

---

## 2. Core Web Vitals & Web Performance Optimization

### Target Performance Metrics
- **LCP (Largest Contentful Paint)**: `< 1.5 seconds`
- **INP (Interaction to Next Paint)**: `< 200 ms`
- **CLS (Cumulative Layout Shift)**: `< 0.1`

### Optimization Protocols

#### 1. Image & Asset Optimization
- Use modern compressed formats (`WebP` or `AVIF`).
- Explicitly define `width` and `height` attributes on `<img>` tags to eliminate layout shift (CLS).
- Preload above-the-fold hero images or logos:
```html
<link rel="preload" as="image" href="/assets/LogoOmnikon.jpeg">
```
- Set `loading="lazy"` on all below-the-fold media images.

#### 2. Fonts & External Resources
- Preconnect to Google Font domains:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```
- Use `display=swap` in Google Font query parameters to avoid FOIT (Flash of Unstyled Text).

#### 3. Layout Shift Prevention (CLS Protection)
- Ad Containers & Dynamic Widgets: Reserve explicit minimum height containers for AdSense units and dynamic Supabase/GitHub cards so page layout does not jump when content loads:
```css
.ad-slot-container {
    min-height: 280px;
    width: 100%;
}
```

#### 4. Event Listener & Script Performance
- Debounce real-time inputs (e.g., search bar inputs on blog/members pages) to prevent main-thread lag.
- Defer non-critical third-party analytics or external scripts.
