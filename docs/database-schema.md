# Omnikon 2.0 — Fully Reconciled Supabase PostgreSQL Schema Specification (v2 Final)

## 1. Database Overview & Architecture
Omnikon 2.0 uses **Supabase PostgreSQL** as its unified data platform. This document provides the complete, 100% reconciled DDL schema. Every entity, column, foreign key, index, trigger, and constraint referenced across all system documentation (`NEW_SITE_REQUIREMENTS.md`, `rls-policies.md`, `security-test-matrix.md`, `content-model.md`) is fully defined herein.

---

## 2. Entity Relationship Diagram (ERD v2 Final)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     profiles     │◄──────┤     articles     │──────►│    categories    │
└────────┬─────────┘       └────────┬─────────┘       └──────────────────┘
         │                          │
         │  ┌───────────────────────┼───────────────────────┐
         │  │                       │                       │
         ▼  ▼                       ▼                       ▼
┌──────────────────┐       ┌──────────────────┐    ┌──────────────────┐
│     projects     │◄─────►│      events      │    │   event_recaps   │
└────────┬─────────┘       └────────┬─────────┘    └──────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐    ┌──────────────────┐
│  project_tags    │       │   article_tags   │    │  profile_private │
└──────────────────┘       └──────────────────┘    └──────────────────┘
```

---

## 3. SQL Types & Custom ENUMs

```sql
-- Security & Authorization Roles
CREATE TYPE user_role AS ENUM ('member', 'contributor', 'editor', 'admin');

-- Educational & Community Developer Tiers
CREATE TYPE developer_tier AS ENUM ('student', 'learner', 'builder', 'contributor', 'maintainer');

-- Content Workflow Lifecycle States
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Article & Tutorial Types
CREATE TYPE content_type AS ENUM ('article', 'tutorial', 'engineering_story', 'project_story');

-- HTTP Redirect Status Codes
CREATE TYPE redirect_status_code AS ENUM (301, 302, 307, 308);
```

---

## 4. Complete Reconciled SQL Schemas

### A. Profiles & Privacy (`profiles`, `profile_private`)

```sql
-- Public Profile Data
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    github_username TEXT,
    discord_username TEXT,
    website_url TEXT,
    role user_role DEFAULT 'member'::user_role NOT NULL,
    developer_tier developer_tier DEFAULT 'student'::developer_tier NOT NULL,
    is_ambassador BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_valid_chars CHECK (username ~* '^[a-zA-Z0-9_-]+$')
);

-- Private Profile Data (Restricted to Profile Owner & Server)
CREATE TABLE profile_private (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    ip_logs JSONB DEFAULT '[]'::JSONB NOT NULL,
    notification_settings JSONB DEFAULT '{"email_alerts": true}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### B. Taxonomies (`categories`, `tags`)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### C. Articles & Tutorials (`articles`)

```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type content_type DEFAULT 'article'::content_type NOT NULL,
    status content_status DEFAULT 'draft'::content_status NOT NULL,
    reading_time_minutes INT DEFAULT 5 NOT NULL,
    views_count INT DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- SEO Metadata Strategy
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Workflow Metadata & Audit Fields
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Full-Text Search Vector
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content_mdx, '')), 'C')
    ) STORED
);
```

### D. Open Source Projects (`projects`)

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    featured_image TEXT,
    repository_url TEXT NOT NULL,
    demo_url TEXT,
    github_repo_name TEXT NOT NULL,
    program_tag TEXT,
    stars_count INT DEFAULT 0 NOT NULL,
    forks_count INT DEFAULT 0 NOT NULL,
    open_issues_count INT DEFAULT 0 NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- SEO Metadata Strategy
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Workflow Metadata
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content_mdx, '')), 'C')
    ) STORED
);
```

### E. Events & Hackathons (`events`)

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    featured_image TEXT,
    event_type TEXT DEFAULT 'hackathon' NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_url TEXT,
    status_label TEXT DEFAULT 'Upcoming' NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- SEO Metadata Strategy
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Workflow Metadata
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content_mdx, '')), 'C')
    ) STORED
);
```

### F. Event Recaps (`event_recaps`)

```sql
CREATE TABLE event_recaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    featured_image TEXT,
    winner_team_name TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    
    -- SEO Metadata Strategy
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    
    -- Workflow Metadata
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### G. Community Updates (`updates`)

```sql
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    link_url TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### H. Tag Junction Tables (`article_tags`, `project_tags`, `event_tags`)

```sql
CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE project_tags (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE event_tags (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);
```

### I. Entity Relationship Junction Tables

```sql
CREATE TABLE article_projects (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, project_id)
);

CREATE TABLE article_events (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, event_id)
);

CREATE TABLE project_events (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, event_id)
);

CREATE TABLE related_articles (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, related_article_id),
    CONSTRAINT disallow_self_relation CHECK (article_id != related_article_id)
);

CREATE TABLE project_contributors (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_description TEXT NOT NULL,
    PRIMARY KEY (project_id, profile_id)
);
```

### J. System Routing, Cache & Audit Tables (`redirects`, `github_cache`, `audit_logs`, `view_logs`)

```sql
CREATE TABLE redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT UNIQUE NOT NULL,
    destination_path TEXT NOT NULL,
    status_code redirect_status_code DEFAULT 301::redirect_status_code NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE github_cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    etag TEXT,
    last_modified TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 5. Centralized Timestamps & Triggers

```sql
-- Centralized Updated_At Timestamp Function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Applied Triggers across all mutable entities
CREATE TRIGGER trg_update_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_profile_private BEFORE UPDATE ON profile_private FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_articles BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_event_recaps BEFORE UPDATE ON event_recaps FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_updates BEFORE UPDATE ON updates FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_redirects BEFORE UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

## 6. Targeted Performance Indexes

```sql
-- Slugs & Route Resolution
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_event_recaps_slug ON event_recaps(slug);
CREATE INDEX idx_redirects_source ON redirects(source_path);

-- Status & Date Filters
CREATE INDEX idx_articles_status_pub ON articles(status, published_at DESC);
CREATE INDEX idx_projects_status_pub ON projects(status, published_at DESC);
CREATE INDEX idx_events_status_start ON events(status, start_date ASC);

-- Foreign Key Lookups
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_reviewer ON articles(reviewer_id);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_projects_author ON projects(author_id);
CREATE INDEX idx_events_author ON events(author_id);

-- System Expiration & Audit Lookups
CREATE INDEX idx_github_cache_expires ON github_cache(expires_at);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_view_logs_debounce ON view_logs(entity_type, entity_id, ip_hash, created_at);

-- GIN Search Vector Indexes
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX idx_events_search ON events USING GIN(search_vector);
```
