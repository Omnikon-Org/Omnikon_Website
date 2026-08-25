# Google AdSense Audit

## 1. AdSense Publisher Configuration

| Attribute | Details / Code Value |
| :--- | :--- |
| **Publisher ID** | `ca-pub-8663425706426895` |
| **Script Injected** | `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8663425706426895" crossorigin="anonymous"></script>` |
| **`ads.txt` Record** | `google.com, pub-8663425706426895, DIRECT, f08c47fec0942fa0` |
| **Current Status** | Active code in headers; previous policy review flagged *"Low Value Content"* |

---

## 2. Existing Ad Placements & Vulnerabilities

### Current Ad Unit Code
In-article ad block embedded on `blogs.html` (lines 740-750):
```html
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8663425706426895"
     data-ad-slot="2153298266"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Risk Assessment & Policy Deficiencies

1. **Ad Loading on Thin / Empty Content Pages**:
   - On `blogs.html`, the AdSense script and `<ins>` unit executed immediately upon page load, even when the Supabase database returned 0 articles or when the loading spinner was active.
   - Showing ads on empty loading containers violates Google Publisher Policies regarding ad serving on pages with no content.
2. **Proximity to Interactive UI Buttons**:
   - Ad containers placed near search input fields and modal trigger buttons create risks of accidental clicks.
3. **Unreserved Layout Height (CLS Risk)**:
   - Ad containers lacked explicit `min-height` declarations in CSS, causing sudden layout shifts (CLS) when Google Auto Ads or display ads rendered asynchronously.

---

## 3. Ad Placement Authorization Matrix for Omnikon 2.0

### Approved Pages (Ads ALLOWED under strict conditions)
- ✅ **Native Technical Articles / Tutorials**: In-feed or end-of-article slots placed after at least 400+ words of main content.
- ✅ **Project Detail Breakdown Pages**: Sidebar or bottom contextual banners on long-form project documentation.

### Prohibited Pages (Ads STRICTLY FORBIDDEN)
- ❌ **Homepage (`/`)**: Main hub should remain 100% clean and focused on community onboarding & hackathons.
- ❌ **Contact Us (`/contact`)**: Form utility page with no article body text.
- ❌ **Privacy Policy & Terms (`/privacy`, `/terms`)**: Legal compliance routes.
- ❌ **Referral & Redirect Routes (`/r`, `/omnikon-ref-*`)**: Shortlink redirect handlers.
- ❌ **Empty Search Results / 404 Pages**: Any view displaying zero items or error alerts.

---

## 4. Technical Safeguards for Omnikon 2.0
1. **Dynamic Ad Gatekeeper**: Execute `(adsbygoogle = window.adsbygoogle || []).push({})` ONLY after verifying that native article content has loaded and total word count exceeds 400 words.
2. **Fixed Height Reservoirs**: Wrap all `<ins class="adsbygoogle">` tags in CSS containers with `min-height: 280px` to eliminate Cumulative Layout Shift (CLS).
3. **No Auto-Ads Interference**: Disable Auto Ads on navigation bars, hero sections, and CTA button areas using `data-adbreak-type` or CSS exclusion tags.
