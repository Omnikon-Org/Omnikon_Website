# Omnikon 2.0 — Content Management Workflow & Editorial Lifecycle

## 1. Editorial Lifecycle Overview

All content assets managed on Omnikon 2.0 (Articles, Tutorials, Engineering Stories, Project Stories, Projects, Events, Updates) progress through a strict 4-stage lifecycle:

```
┌─────────────┐        Submit for Review        ┌─────────────┐
│    DRAFT    ├────────────────────────────────►│   REVIEW    │
└──────▲──────┘                                 └──────┬──────┘
       │                                               │
       │ Request Revision                              │ Approve & Publish
       └───────────────────────────────────────────────┤
                                                       ▼
┌─────────────┐                  Archive        ┌─────────────┐
│  ARCHIVED   │◄────────────────────────────────┤  PUBLISHED  │
└─────────────┘                                 └─────────────┘
```

---

## 2. Stage-by-Stage Specifications

### A. Stage 1: DRAFT
- **Initiator**: `Contributor`, `Editor`, or `Admin`.
- **Visibility**: Private to the author and site editors.
- **Rules**:
  - Content can be edited iteratively without triggering public feeds or search indexers.
  - Required initial fields: Title, Summary, MDX Body, Category, and Type.

### B. Stage 2: REVIEW
- **Initiator**: `Contributor` clicks *"Submit for Review"*.
- **Notification**: Alerts `Editor` team on the Admin Editorial Board (`/admin/content`).
- **Quality Checks Required Before Approval**:
  1. **Technical Authenticity**: Code blocks, architecture clarity, zero AI fluff ([`omnikon-content`](file:///.agents/skills/omnikon-content/SKILL.md)).
  2. **SEO Readiness**: Title, summary, OpenGraph cover image, canonical slug ([`seo-adsense`](file:///.agents/skills/seo-adsense/SKILL.md)).
  3. **AdSense Suitability Check**: Confirms page is a substantial, useful content asset.
- **Editor Actions**:
  - **Approve & Publish**: Transitions status to `Published` and sets `published_at = NOW()`.
  - **Request Revisions**: Transitions status back to `Draft` with inline editorial feedback notes.

### C. Stage 3: PUBLISHED
- **Visibility**: Live on public website, indexable by search engines, included in global search index (`tsvector`), included in category feeds.
- **Automated Side Effects**:
  - Revalidates Next.js static cache tags (`revalidateTag('articles')`).
  - Generates JSON-LD structured data (`BlogPosting` or `TechArticle`).

### D. Stage 4: ARCHIVED
- **Initiator**: `Editor` or `Admin`.
- **Use Cases**: Outdated event listings, deprecated tutorials, or retired project breakdowns.
- **Behavior**: Removed from public category grids and search indexes; access restricted or redirect configured.

---

## 3. Content Management Architecture (`/admin/content`)

The Admin Content Management UI provides editors with complete control over all entities:

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN CONTENT CONTROL BOARD                                 │
├─────────────────────────────────────────────────────────────┤
│ [All (42)]  [Drafts (5)]  [Pending Review (3)]  [Published]  │
├─────────────────────────────────────────────────────────────┤
│ TITLE                   TYPE       AUTHOR   STATUS   ACTIONS│
│ Next.js App Router Guide Tutorial   Pranav   REVIEW   [Approve][Edit]│
│ Astrodex GSSoC Story    Project    Alina    DRAFT    [Edit] │
│ Hackathon 2026 Brief    Event      Admin    PUBLISHED[Archive]│
└─────────────────────────────────────────────────────────────┘
```

### Managed Entities in Admin Layer
1. **Articles & Tutorials**: Create/edit MDX articles, assign categories and tags, schedule publication.
2. **Projects & Teardowns**: Add open-source repos, link GitHub URL, assign program tags (`GSSoC 2026`, `ECSoC 2026`).
3. **Events & Hackathons**: Update registration timelines, post problem statements, publish event recaps.
4. **Updates & Announcement Ticker**: Post community announcements and status updates.
5. **Categories & Tags**: Manage site taxonomies and slugs.
