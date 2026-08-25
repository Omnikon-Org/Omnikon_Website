-- Omnikon 2.0 — Initial Supabase PostgreSQL Migration (v3 Reconciled)
-- Target: Supabase PostgreSQL
-- Purpose: Reconciles the Omnikon 2.0 schema, RLS, security matrix and
-- consistency requirements into one migration.
--
-- IMPORTANT:
-- 1. This migration is intended for a fresh Supabase project / clean migration.
-- 2. It does not contain destructive DROP statements.
-- 3. Service-role/server code bypasses RLS as intended for server-only tables.
-- 4. Anonymous visitors are represented by the absence of auth.uid(); no
--    "visitor" profile role is required.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'contributor', 'editor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE developer_tier AS ENUM
        ('student', 'learner', 'builder', 'contributor', 'maintainer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM
        ('draft', 'review', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM
        ('article', 'tutorial', 'engineering_story', 'project_story');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE redirect_status_code AS ENUM ('301', '302', '307', '308');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS profile_private (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    ip_logs JSONB DEFAULT '[]'::JSONB NOT NULL,
    notification_settings JSONB DEFAULT '{"email_alerts": true}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
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
    reading_time_minutes INT DEFAULT 5 NOT NULL CHECK (reading_time_minutes > 0),
    views_count INT DEFAULT 0 NOT NULL CHECK (views_count >= 0),
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
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

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    featured_image TEXT,
    repository_url TEXT NOT NULL,
    demo_url TEXT,
    github_repo_name TEXT NOT NULL,
    tech_stack TEXT[] DEFAULT '{}'::TEXT[],
    program_tag TEXT,
    stars_count INT DEFAULT 0 NOT NULL CHECK (stars_count >= 0),
    forks_count INT DEFAULT 0 NOT NULL CHECK (forks_count >= 0),
    open_issues_count INT DEFAULT 0 NOT NULL CHECK (open_issues_count >= 0),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
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

CREATE TABLE IF NOT EXISTS events (
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
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT event_dates_valid CHECK (end_date >= start_date),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content_mdx, '')), 'C')
    ) STORED
);

CREATE TABLE IF NOT EXISTS event_recaps (
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
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_mdx TEXT NOT NULL,
    link_url TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. RELATIONSHIP TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS project_tags (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE IF NOT EXISTS event_tags (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_projects (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, project_id)
);

CREATE TABLE IF NOT EXISTS article_events (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, event_id)
);

CREATE TABLE IF NOT EXISTS project_events (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, event_id)
);

CREATE TABLE IF NOT EXISTS related_articles (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, related_article_id),
    CONSTRAINT disallow_self_relation CHECK (article_id <> related_article_id)
);

CREATE TABLE IF NOT EXISTS project_contributors (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_description TEXT NOT NULL,
    PRIMARY KEY (project_id, profile_id)
);

-- ============================================================================
-- 4. SERVER / SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT UNIQUE NOT NULL,
    destination_path TEXT NOT NULL,
    status_code redirect_status_code DEFAULT '301'::redirect_status_code NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS github_cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    etag TEXT,
    last_modified TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
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

CREATE TABLE IF NOT EXISTS view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 5. TIMESTAMP AUTOMATION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_profiles
    BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_profile_private
    BEFORE UPDATE ON profile_private FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_articles
    BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_projects
    BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_events
    BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_event_recaps
    BEFORE UPDATE ON event_recaps FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_updates
    BEFORE UPDATE ON updates FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_redirects
    BEFORE UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION update_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 6. CENTRALIZED AUTHORIZATION HELPERS
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'::user_role
    );
$$;

CREATE OR REPLACE FUNCTION is_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'editor'::user_role
    );
$$;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('editor'::user_role, 'admin'::user_role)
    );
$$;

CREATE OR REPLACE FUNCTION is_contributor_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN (
              'contributor'::user_role,
              'editor'::user_role,
              'admin'::user_role
          )
    );
$$;

-- ============================================================================
-- 7. PROFILE PRIVILEGE LOCK
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_profile_field_locks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role
           OR NEW.developer_tier IS DISTINCT FROM OLD.developer_tier
           OR NEW.is_ambassador IS DISTINCT FROM OLD.is_ambassador
        THEN
            RAISE EXCEPTION
                'Unauthorized: Only Admins can modify role, developer_tier, or ambassador status.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER trg_lock_profile_fields
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION enforce_profile_field_locks();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 8. CONTENT WORKFLOW
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_content_publication_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'published'::content_status
       AND NOT public.is_editor_or_admin()
    THEN
        RAISE EXCEPTION
            'Unauthorized: Only Editors and Admins can publish content.';
    END IF;

    -- Contributors cannot inject review metadata.
    IF NOT public.is_editor_or_admin() AND TG_TABLE_NAME <> 'updates' THEN
        IF TG_OP = 'INSERT' THEN
            IF NEW.reviewer_id IS NOT NULL
               OR NEW.reviewed_at IS NOT NULL
               OR NEW.review_notes IS NOT NULL
            THEN
                RAISE EXCEPTION
                    'Unauthorized: Only Editors and Admins can set review metadata.';
            END IF;
        ELSE
            IF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id
               OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
               OR NEW.review_notes IS DISTINCT FROM OLD.review_notes
            THEN
                RAISE EXCEPTION
                    'Unauthorized: Only Editors and Admins can modify review metadata.';
            END IF;
        END IF;
    END IF;

    -- Stamp review/publish metadata when content becomes published.
    IF NEW.status = 'published'::content_status
       AND (
           TG_OP = 'INSERT'
           OR OLD.status IS DISTINCT FROM 'published'::content_status
       )
    THEN
        IF TG_TABLE_NAME <> 'updates' THEN
            NEW.reviewer_id = auth.uid();
            NEW.reviewed_at = NOW();
        END IF;

        NEW.published_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER trg_article_workflow
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION enforce_content_publication_workflow();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_project_workflow
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION enforce_content_publication_workflow();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_event_workflow
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION enforce_content_publication_workflow();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_event_recap_workflow
    BEFORE INSERT OR UPDATE ON event_recaps
    FOR EACH ROW EXECUTE FUNCTION enforce_content_publication_workflow();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_workflow
    BEFORE INSERT OR UPDATE ON updates
    FOR EACH ROW EXECUTE FUNCTION enforce_content_publication_workflow();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 9. AUTH SIGNUP PROFILE CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    requested_username TEXT;
BEGIN
    requested_username :=
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'username', ''),
            'user_' || substr(NEW.id::text, 1, 8)
        );

    INSERT INTO public.profiles (
        id, username, full_name, avatar_url, role, developer_tier
    )
    VALUES (
        NEW.id,
        requested_username,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            'Omnikon Developer'
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        'member'::user_role,
        'student'::developer_tier
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profile_private (id, email)
    VALUES (NEW.id, COALESCE(NEW.email, ''))
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 10. VIEW COUNTER RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION record_entity_view(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_ip_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_entity_type NOT IN ('article', 'project', 'event', 'event_recap') THEN
        RAISE EXCEPTION 'Invalid entity type.';
    END IF;

    IF p_ip_hash IS NULL OR char_length(p_ip_hash) < 8 THEN
        RAISE EXCEPTION 'Invalid IP hash.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.view_logs
        WHERE entity_type = p_entity_type
          AND entity_id = p_entity_id
          AND ip_hash = p_ip_hash
          AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
        INSERT INTO public.view_logs(entity_type, entity_id, ip_hash)
        VALUES (p_entity_type, p_entity_id, p_ip_hash);

        IF p_entity_type = 'article' THEN
            UPDATE public.articles
            SET views_count = views_count + 1
            WHERE id = p_entity_id
              AND status = 'published'::content_status;
        END IF;
    END IF;
END;
$$;

-- ============================================================================
-- 11. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_status_pub
    ON articles(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_status_pub
    ON projects(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_status_start
    ON events(status, start_date ASC);

CREATE INDEX IF NOT EXISTS idx_articles_author
    ON articles(author_id);

CREATE INDEX IF NOT EXISTS idx_articles_reviewer
    ON articles(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_articles_category
    ON articles(category_id);

CREATE INDEX IF NOT EXISTS idx_projects_author
    ON projects(author_id);

CREATE INDEX IF NOT EXISTS idx_projects_reviewer
    ON projects(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_event_recaps_event
    ON event_recaps(event_id);

CREATE INDEX IF NOT EXISTS idx_event_recaps_author
    ON event_recaps(author_id);

CREATE INDEX IF NOT EXISTS idx_updates_author
    ON updates(author_id);

CREATE INDEX IF NOT EXISTS idx_github_cache_expires
    ON github_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
    ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_view_logs_debounce
    ON view_logs(entity_type, entity_id, ip_hash, created_at);

CREATE INDEX IF NOT EXISTS idx_articles_search
    ON articles USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_projects_search
    ON projects USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_events_search
    ON events USING GIN(search_vector);

-- ============================================================================
-- 12. ENABLE RLS ON EVERY APPLICATION TABLE
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 13. RLS POLICY CLEANUP
-- ============================================================================
-- This makes the migration safe to re-run after policy changes.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'profiles','profile_private','categories','tags','articles',
              'projects','events','event_recaps','updates','article_tags',
              'project_tags','event_tags','article_projects','article_events',
              'project_events','related_articles','project_contributors',
              'redirects','github_cache','audit_logs','view_logs'
          )
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename
        );
    END LOOP;
END $$;

-- ============================================================================
-- 14. PROFILES
-- ============================================================================

CREATE POLICY "Public read profiles"
ON profiles FOR SELECT
USING (TRUE);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND developer_tier = (
        SELECT p.developer_tier FROM public.profiles p WHERE p.id = auth.uid()
    )
    AND is_ambassador = (
        SELECT p.is_ambassador FROM public.profiles p WHERE p.id = auth.uid()
    )
);

CREATE POLICY "Admins manage profiles"
ON profiles FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 15. PRIVATE PROFILES
-- ============================================================================

CREATE POLICY "Users read own private profile"
ON profile_private FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own private profile"
ON profile_private FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No client INSERT/DELETE policy: signup trigger/server only.

-- ============================================================================
-- 16. CATEGORIES
-- ============================================================================

CREATE POLICY "Public read categories"
ON categories FOR SELECT
USING (TRUE);

CREATE POLICY "Editors manage categories"
ON categories FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

-- ============================================================================
-- 17. TAGS
-- ============================================================================

CREATE POLICY "Public read tags"
ON tags FOR SELECT
USING (TRUE);

CREATE POLICY "Contributors insert tags"
ON tags FOR INSERT TO authenticated
WITH CHECK (public.is_contributor_or_above());

CREATE POLICY "Editors update tags"
ON tags FOR UPDATE TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Admins delete tags"
ON tags FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================================================
-- 18. ARTICLES
-- ============================================================================

CREATE POLICY "Public read published articles"
ON articles FOR SELECT
USING (status = 'published'::content_status);

CREATE POLICY "Authors read own articles"
ON articles FOR SELECT TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Editors read all articles"
ON articles FOR SELECT TO authenticated
USING (public.is_editor_or_admin());

CREATE POLICY "Contributors insert own articles"
ON articles FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = author_id
    AND status IN ('draft'::content_status, 'review'::content_status)
    AND public.is_contributor_or_above()
);

CREATE POLICY "Authors update own draft articles"
ON articles FOR UPDATE TO authenticated
USING (
    auth.uid() = author_id
    AND status = 'draft'::content_status
)
WITH CHECK (
    auth.uid() = author_id
    AND status IN ('draft'::content_status, 'review'::content_status)
);

CREATE POLICY "Editors update articles"
ON articles FOR UPDATE TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Admins delete articles"
ON articles FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================================================
-- 19. PROJECTS
-- ============================================================================

CREATE POLICY "Public read published projects"
ON projects FOR SELECT
USING (status = 'published'::content_status);

CREATE POLICY "Authors read own projects"
ON projects FOR SELECT TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Editors read all projects"
ON projects FOR SELECT TO authenticated
USING (public.is_editor_or_admin());

CREATE POLICY "Contributors insert own projects"
ON projects FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = author_id
    AND status IN ('draft'::content_status, 'review'::content_status)
    AND public.is_contributor_or_above()
);

CREATE POLICY "Authors update own draft projects"
ON projects FOR UPDATE TO authenticated
USING (
    auth.uid() = author_id
    AND status = 'draft'::content_status
)
WITH CHECK (
    auth.uid() = author_id
    AND status IN ('draft'::content_status, 'review'::content_status)
);

CREATE POLICY "Editors update projects"
ON projects FOR UPDATE TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Admins delete projects"
ON projects FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================================================
-- 20. EVENTS
-- ============================================================================

CREATE POLICY "Public read published events"
ON events FOR SELECT
USING (status = 'published'::content_status);

CREATE POLICY "Editors read all events"
ON events FOR SELECT TO authenticated
USING (public.is_editor_or_admin());

CREATE POLICY "Editors manage events"
ON events FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

-- ============================================================================
-- 21. EVENT RECAPS
-- ============================================================================

CREATE POLICY "Public read published recaps"
ON event_recaps FOR SELECT
USING (status = 'published'::content_status);

CREATE POLICY "Editors read all recaps"
ON event_recaps FOR SELECT TO authenticated
USING (public.is_editor_or_admin());

CREATE POLICY "Editors manage recaps"
ON event_recaps FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

-- ============================================================================
-- 22. UPDATES
-- ============================================================================

CREATE POLICY "Public read published updates"
ON updates FOR SELECT
USING (status = 'published'::content_status);

CREATE POLICY "Editors read all updates"
ON updates FOR SELECT TO authenticated
USING (public.is_editor_or_admin());

CREATE POLICY "Editors manage updates"
ON updates FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

-- ============================================================================
-- 23. JUNCTION TABLES — PARENT VISIBILITY / OWNERSHIP
-- ============================================================================

CREATE POLICY "Read article tags"
ON article_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_tags.article_id
          AND (
              a.status = 'published'::content_status
              OR a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Insert article tags"
ON article_tags FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_tags.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Delete article tags"
ON article_tags FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_tags.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Read project tags"
ON project_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_tags.project_id
          AND (
              p.status = 'published'::content_status
              OR p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Insert project tags"
ON project_tags FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_tags.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Delete project tags"
ON project_tags FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_tags.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Read event tags"
ON event_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = event_tags.event_id
          AND (
              e.status = 'published'::content_status
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Editors manage event tags"
ON event_tags FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Read article projects"
ON article_projects FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_projects.article_id
          AND (
              a.status = 'published'::content_status
              OR a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Insert article projects"
ON article_projects FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_projects.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Delete article projects"
ON article_projects FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_projects.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Read article events"
ON article_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_events.article_id
          AND (
              a.status = 'published'::content_status
              OR a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Insert article events"
ON article_events FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_events.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Delete article events"
ON article_events FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = article_events.article_id
          AND (
              a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Read project events"
ON project_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_events.project_id
          AND (
              p.status = 'published'::content_status
              OR p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Insert project events"
ON project_events FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_events.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Delete project events"
ON project_events FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_events.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Read related articles"
ON related_articles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM articles a
        WHERE a.id = related_articles.article_id
          AND (
              a.status = 'published'::content_status
              OR a.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Editors manage related articles"
ON related_articles FOR ALL TO authenticated
USING (public.is_editor_or_admin())
WITH CHECK (public.is_editor_or_admin());

-- ============================================================================
-- 24. PROJECT CONTRIBUTORS
-- ============================================================================

CREATE POLICY "Read project contributors"
ON project_contributors FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_contributors.project_id
          AND (
              p.status = 'published'::content_status
              OR p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Project owners manage contributors"
ON project_contributors FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_contributors.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Project owners update contributors"
ON project_contributors FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_contributors.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_contributors.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

CREATE POLICY "Project owners delete contributors"
ON project_contributors FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_contributors.project_id
          AND (
              p.author_id = auth.uid()
              OR public.is_editor_or_admin()
          )
    )
);

-- ============================================================================
-- 25. REDIRECTS
-- ============================================================================

CREATE POLICY "Admins manage redirects"
ON redirects FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 26. SERVER-ONLY TABLES
-- ============================================================================

CREATE POLICY "Deny client access to github cache"
ON github_cache FOR ALL
USING (FALSE)
WITH CHECK (FALSE);

CREATE POLICY "Admins read audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Deny audit log updates"
ON audit_logs FOR UPDATE
USING (FALSE)
WITH CHECK (FALSE);

CREATE POLICY "Deny audit log deletes"
ON audit_logs FOR DELETE
USING (FALSE);

-- No client INSERT policy on audit_logs.
-- Server-side SECURITY DEFINER functions / service role may write.

CREATE POLICY "Deny direct view log access"
ON view_logs FOR ALL
USING (FALSE)
WITH CHECK (FALSE);

-- ============================================================================
-- 27. FUNCTION EXECUTION PRIVILEGES
-- ============================================================================
-- Do not expose internal helper functions to anon clients.
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_editor() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_editor_or_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_contributor_or_above() FROM PUBLIC;
REVOKE ALL ON FUNCTION enforce_profile_field_locks() FROM PUBLIC;
REVOKE ALL ON FUNCTION enforce_content_publication_workflow() FROM PUBLIC;
REVOKE ALL ON FUNCTION handle_new_user_signup() FROM PUBLIC;

-- View recording is intended to be callable by the application.
GRANT EXECUTE ON FUNCTION record_entity_view(TEXT, UUID, TEXT) TO anon, authenticated;

-- ============================================================================
-- 28. VERIFICATION ASSERTIONS
-- ============================================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'profiles','profile_private','categories','tags','articles','projects',
        'events','event_recaps','updates','article_tags','project_tags',
        'event_tags','article_projects','article_events','project_events',
        'related_articles','project_contributors','redirects','github_cache',
        'audit_logs','view_logs'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY expected_tables LOOP
        IF to_regclass('public.' || t) IS NULL THEN
            RAISE EXCEPTION 'Schema verification failed: missing table %', t;
        END IF;
    END LOOP;
END;
$$;

-- End of Omnikon 2.0 v3 Reconciled Migration.
