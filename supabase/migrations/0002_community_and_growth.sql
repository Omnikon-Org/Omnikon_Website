-- ============================================================================
-- Omnikon 2.0 — Migration 0002: Community Activation & Contribution System
-- ============================================================================

-- 1. Extend profiles with skills, technical_interests, and public visibility toggle
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    ADD COLUMN IF NOT EXISTS technical_interests TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true NOT NULL;

-- 2. Create contributions table for ecosystem activity and milestone tracking
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    external_url TEXT,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create event_registrations table for hackathon & workshop participation
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'registered' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_event_user_registration UNIQUE (event_id, user_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for contributions table
CREATE POLICY "Public read public contributions"
    ON contributions FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users read own contributions"
    ON contributions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own contributions"
    ON contributions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own contributions"
    ON contributions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editors manage contributions"
    ON contributions FOR ALL
    USING (public.is_editor_or_admin());

-- 6. RLS Policies for event_registrations table
CREATE POLICY "Users read own registrations"
    ON event_registrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own registration"
    ON event_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own registration"
    ON event_registrations FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Editors read all registrations"
    ON event_registrations FOR SELECT
    USING (public.is_editor_or_admin());

CREATE POLICY "Editors manage event registrations"
    ON event_registrations FOR ALL
    USING (public.is_editor_or_admin());

-- 7. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
