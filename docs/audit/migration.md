# Migration & Transformation Plan

## 1. Feature Migration Matrix

| CURRENT FEATURE | KEEP | REBUILD | REMOVE | NOTES |
| :--- | :---: | :---: | :---: | :--- |
| **Cyberpunk / Terminal Dark UI Aesthetic** | **X** | | | Maintain Obsidian `#050505`, Neon Red `#FF3131`, `JetBrains Mono` fonts. |
| **Multi-Page Static Navbars/Footers** | | **X** | | Rebuild using modular layout component templates to eliminate copy-paste code. |
| **External Blog Link Aggregator Card Grid** | | | **X** | Remove external link teaser aggregator (root cause of AdSense "Low Value Content" policy issue). |
| **Native Engineering Blog & MDX Platform** | | **X** | | Rebuild as full native publishing platform for long-form technical tutorials. |
| **Hackathon 2026 Phase Tracker** | **X** | | | Maintain real-world hackathon timeline, problem statements, and registration links. |
| **GitHub Org Projects Explorer** | | **X** | | Rebuild with dynamic API integration, local caching, and fallback support. |
| **Developer Journey Roadmap** | **X** | | | Retain student-to-maintainer tier progression (Student -> Learner -> Builder -> Contributor -> Maintainer). |
| **Member Wall & Ambassador Directory** | | **X** | | Rebuild with live GitHub org contributor data & active campus ambassador listings. |
| **Hardcoded Static Activity Ticker** | | | **X** | Remove static fake string ticker; replace with live GitHub org event feed. |
| **Referral Shortlink System (`/omnikon-ref-:id`)** | **X** | | | Retain URL shortlink handler pointing to `r.html`. |
| **Google AdSense Script (`ca-pub-8663425706426895`)** | **X** | | | Keep script integration; restrict ad units strictly to native long-form articles. |

---

## 2. URL Migration & Redirect Map

| CURRENT URL | NEW URL | MIGRATE | REDIRECT | REMOVE | NOTES |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `https://omnikonhub.com/` | `https://omnikonhub.com/` | **X** | | | Primary Homepage |
| `https://omnikonhub.com/index.html` | `https://omnikonhub.com/` | | **X** | | 301 Permanent Redirect to clean root URL |
| `https://omnikonhub.com/projects.html` | `https://omnikonhub.com/projects` | **X** | **X** | | Clean extensionless URL route with 301 redirect |
| `https://omnikonhub.com/blogs.html` | `https://omnikonhub.com/blogs` | **X** | **X** | | Native Blog Hub route with 301 redirect |
| `https://omnikonhub.com/members.html` | `https://omnikonhub.com/members` | **X** | **X** | | Members Directory route with 301 redirect |
| `https://omnikonhub.com/achievements.html` | `https://omnikonhub.com/about` | | **X** | | Redirect stat counters into expanded About/Community Hub |
| `https://omnikonhub.com/ambassadors.html` | `https://omnikonhub.com/ambassadors` | **X** | **X** | | Campus Ambassador route with 301 redirect |
| `https://omnikonhub.com/docs.html` | `https://omnikonhub.com/docs` | **X** | **X** | | Developer Docs & Guidelines route |
| `https://omnikonhub.com/about.html` | `https://omnikonhub.com/about` | **X** | **X** | | About Organization route |
| `https://omnikonhub.com/contact.html` | `https://omnikonhub.com/contact` | **X** | **X** | | Contact Us Form route |
| `https://omnikonhub.com/privacy.html` | `https://omnikonhub.com/privacy` | **X** | **X** | | Legal Privacy Policy route |
| `https://omnikonhub.com/terms.html` | `https://omnikonhub.com/terms` | **X** | **X** | | Legal Terms & Conditions route |
| `https://omnikonhub.com/omnikon-ref-:id` | `https://omnikonhub.com/omnikon-ref-:id` | **X** | | | Shortlink referral redirect route |
