# Omnikon 2.0 — Content Model & Entity Specifications

## 1. Executive Summary
The content model for Omnikon 2.0 structures all public technical assets into strongly-typed relational entities stored in Supabase PostgreSQL. It ensures that every indexable entity contains substantial, original documentation, clear author attribution, complete workflow state tracking (`draft`, `review`, `published`, `archived`), and consistent SEO metadata fields.

---

## 2. Content Entity Specifications

### A. Articles (`articles`)
- **Types**: `article` (General Tech Post), `tutorial` (Step-by-step Technical Guide), `engineering_story` (Deep Engineering Breakdown), `project_story` (Open Source Project Teardown).
- **Core Fields**:
  - `id`: UUID (Primary Key)
  - `title`: String
  - `slug`: String (Unique URL key, e.g. `nextjs-app-router-guide`)
  - `summary`: String (Concise 1-2 sentence excerpt)
  - `content_mdx`: Text (Long-form MDX with code blocks, headings, images)
  - `featured_image`: String (Image URL)
  - `author_id`: UUID (References `profiles.id`)
  - `reviewer_id`: UUID (References `profiles.id`)
  - `category_id`: UUID (References `categories.id`)
  - `type`: Enum (`article`, `tutorial`, `engineering_story`, `project_story`)
  - `status`: Enum (`draft`, `review`, `published`, `archived`)
  - `reading_time_minutes`: Integer
  - `views_count`: Integer
- **SEO Metadata Strategy**:
  - `seo_title`: String
  - `seo_description`: String
  - `og_image`: String
  - `canonical_url`: String
- **Workflow Timestamps**: `submitted_at`, `reviewed_at`, `published_at`, `created_at`, `updated_at`.

---

### B. Projects (`projects`)
- **Purpose**: Showcase community open-source repositories hosted under `Omnikon-Org` (`Astrodex`, `CNTRL`, `IssueSwipe`) with full architectural documentation.
- **Core Fields**:
  - `id`: UUID (Primary Key)
  - `name`: String
  - `slug`: String (Unique URL key, e.g. `astrodex`)
  - `summary`: String (Project elevator pitch)
  - `content_mdx`: Text (Full architectural documentation, setup steps, contribution guides)
  - `featured_image`: String
  - `repository_url`: String (e.g. `https://github.com/Omnikon-Org/Astrodex`)
  - `demo_url`: String (Live deployment URL)
  - `github_repo_name`: String (e.g. `Astrodex`)
  - `program_tag`: String (e.g. `GSSoC 2026`, `ECSoC 2026`)
  - `stars_count`, `forks_count`, `open_issues_count`: Integers (Updated via GitHub background sync)
  - `author_id`, `reviewer_id`: UUID (References `profiles.id`)
  - `status`: Enum (`draft`, `review`, `published`, `archived`)
- **SEO Metadata Strategy**: `seo_title`, `seo_description`, `og_image`, `canonical_url`.

---

### C. Events (`events`)
- **Purpose**: Manage hackathons, quizzes, and workshops (e.g. Omnikon National TechHackathon 2026).
- **Core Fields**:
  - `id`: UUID (Primary Key)
  - `title`: String
  - `slug`: String (Unique URL key, e.g. `national-techhackathon-2026`)
  - `summary`: String
  - `content_mdx`: Text (Full hackathon rules, problem statement details, track guidelines)
  - `featured_image`: String
  - `event_type`: String (`hackathon`, `quiz`, `workshop`)
  - `start_date`, `end_date`: Timestamps
  - `registration_url`: String
  - `status_label`: String (`Registration Closed`, `Problem Statements Released`, `Active`)
  - `status`: Enum (`draft`, `review`, `published`, `archived`)
- **SEO Metadata Strategy**: `seo_title`, `seo_description`, `og_image`, `canonical_url`.

---

### D. Event Recaps (`event_recaps`)
- **Purpose**: Comprehensive post-event documentation celebrating hackathon winners and project outcomes.
- **Core Fields**:
  - `id`: UUID (Primary Key)
  - `event_id`: UUID (References `events.id`)
  - `title`: String
  - `slug`: String (Unique URL key, e.g. `techhackathon-2026-winners-recap`)
  - `summary`: String
  - `content_mdx`: Text (Full recap story, winning solutions, judging panel insights)
  - `featured_image`: String
  - `winner_team_name`: String (Optional)
  - `author_id`, `reviewer_id`: UUID (References `profiles.id`)
  - `status`: Enum (`draft`, `review`, `published`, `archived`)
- **SEO Metadata Strategy**: `seo_title`, `seo_description`, `og_image`, `canonical_url`.

---

### E. Updates (`updates`)
- **Purpose**: Announcements, security alerts, and live community news feed items.
- **Core Fields**:
  - `id`: UUID (Primary Key)
  - `title`: String
  - `content_mdx`: Text (Brief markdown message)
  - `link_url`: String (Optional CTA target)
  - `author_id`: UUID (References `profiles.id`)
  - `published_at`: Timestamp

---

### F. Members & Contributors (`profiles`)
- **Purpose**: Public member profiles and developer journey tracking.
- **Core Fields**: `username`, `full_name`, `avatar_url`, `bio`, `github_username`, `discord_username`, `role`, `developer_tier` (`student` → `learner` → `builder` → `contributor` → `maintainer`), `is_ambassador`.

---

## 3. Editorial Quality & Content Standards

1. **Substantial Substance**: Every published article, project teardown, or event brief must contain complete, readable text with code blocks or diagrams.
2. **Zero Placeholder Copy**: No draft markers ("Lorem ipsum", "TODO: Fill text") permitted in published status.
3. **Valid SEO Metadata**: Every published item requires `seo_title`, `seo_description`, and `og_image`.
