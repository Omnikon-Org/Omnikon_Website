# Security Audit

## 1. Vulnerability Assessment & Findings

| Vulnerability Area | Risk Level | Description | Recommended Remediation |
| :--- | :--- | :--- | :--- |
| **API Authorization Key Handling** | **HIGH** | The admin key for blog insertions is validated in `/api/blog-insert` via request body string comparison. If passed via client inputs without TLS or rate limits, it risks brute-force exposure. | Enforce server-side environment variable key verification with IP rate-limiting and authorization bearer headers. |
| **Unsafe HTML Rendering (XSS Risk)** | **MEDIUM** | Blog preview descriptions and dynamic metadata scraped via `/api/scrape` are injected directly into the DOM using `.innerHTML = ...` without sanitization. | Use `textContent` for plain text inputs, or sanitize HTML using `DOMPurify` before injecting scraped metadata. |
| **Public API Keys & Client Storage** | **LOW** | `generate-env.js` reads `.env` variables and outputs `public/env-public.json`. Firebase and Supabase client keys are public by design, but require strict backend RLS policies. | Enforce strict Cloud Firestore and Supabase Row Level Security (RLS) policies to prevent unauthorized writes. |
| **GitHub Token Exposure** | **LOW** | No raw GitHub PAT tokens were committed in the repository. Client requests use unauthenticated REST calls. | Use serverless proxy routes (`/api/github-stats`) to attach server-side tokens securely without exposing them to the browser. |
| **Input Sanitization & Scraping** | **MEDIUM** | `/api/scrape` accepts user-supplied URL queries (`?url=...`) without SSRF (Server-Side Request Forgery) protection or URL protocol validation (`http:` / `https:`). | Validate URL protocols strictly, block internal network IPs (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`), and restrict scraping targets to approved domain schemes. |

---

## 2. Security Protocol Checklist for Omnikon 2.0
- [ ] **Zero Hardcoded Secrets**: Ensure `.env` is gitignored and no API secret keys exist in committed code.
- [ ] **SSRF Defense**: Add URL target validation in serverless scraping routes.
- [ ] **XSS Sanitization**: Sanitize all user-generated content and scraped metadata prior to DOM insertion.
- [ ] **Supabase Row Level Security (RLS)**: Restrict public table operations on Supabase to `SELECT` operations only. All `INSERT`/`UPDATE` operations must pass through authenticated serverless endpoints.
- [ ] **Content Security Policy (CSP)**: Add CSP HTTP headers restricting script execution sources to trusted domains (`googlesyndication.com`, `googleapis.com`, `supabase.co`, `firebaseio.com`).
