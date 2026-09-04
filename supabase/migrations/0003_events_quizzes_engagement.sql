-- ============================================================================
-- Omnikon 2.0 — Migration 0003: Community Events, Quizzes & Engagement Ecosystem
-- ============================================================================

-- 1. Extend events table with community metadata
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'online' NOT NULL,
    ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Discord & Online' NOT NULL,
    ADD COLUMN IF NOT EXISTS capacity INT,
    ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]'::JSONB NOT NULL,
    ADD COLUMN IF NOT EXISTS rules_mdx TEXT,
    ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::JSONB NOT NULL;

-- 2. Create hackathon_problem_statements table
CREATE TABLE IF NOT EXISTS hackathon_problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description_mdx TEXT NOT NULL,
    category TEXT DEFAULT 'General' NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate' NOT NULL,
    reference_links JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Beginner' NOT NULL,
    estimated_duration_minutes INT DEFAULT 10 NOT NULL,
    pass_percentage INT DEFAULT 70 NOT NULL,
    status content_status DEFAULT 'published'::content_status NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of { id: string, text: string }
    correct_option_id TEXT NOT NULL, -- Evaluated server-side ONLY
    explanation TEXT NOT NULL, -- Returned to client ONLY after submission
    difficulty TEXT DEFAULT 'Medium' NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    score INT NOT NULL CHECK (score >= 0),
    total_questions INT NOT NULL CHECK (total_questions > 0),
    percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    time_spent_seconds INT DEFAULT 0 NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
    selected_option_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Enable Row Level Security (RLS) on all 5 new tables
ALTER TABLE hackathon_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: hackathon_problem_statements
CREATE POLICY "Public read hackathon problem statements"
    ON hackathon_problem_statements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = hackathon_problem_statements.event_id
            AND events.status = 'published'
        )
    );

CREATE POLICY "Editors manage problem statements"
    ON hackathon_problem_statements FOR ALL
    USING (public.is_editor_or_admin());

-- 9. RLS Policies: quizzes
CREATE POLICY "Public read published quizzes"
    ON quizzes FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authors view own draft quizzes"
    ON quizzes FOR SELECT
    USING (auth.uid() = author_id);

CREATE POLICY "Contributors create quizzes"
    ON quizzes FOR INSERT
    WITH CHECK (public.is_contributor_or_above());

CREATE POLICY "Editors manage quizzes"
    ON quizzes FOR ALL
    USING (public.is_editor_or_admin());

-- 10. RLS Policies: quiz_questions
-- Public can read questions of published quizzes (client fetcher strips correct_option_id)
CREATE POLICY "Public read quiz questions"
    ON quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = quiz_questions.quiz_id
            AND quizzes.status = 'published'
        )
    );

CREATE POLICY "Editors manage quiz questions"
    ON quiz_questions FOR ALL
    USING (public.is_editor_or_admin());

-- 11. RLS Policies: quiz_attempts
CREATE POLICY "Users read own quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Public read public leaderboard attempts"
    ON quiz_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = quiz_attempts.user_id
            AND profiles.is_public = true
        )
    );

CREATE POLICY "Users insert own quiz attempt"
    ON quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Editors manage quiz attempts"
    ON quiz_attempts FOR ALL
    USING (public.is_editor_or_admin());

-- 12. RLS Policies: quiz_answers
CREATE POLICY "Users read own quiz answers"
    ON quiz_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users insert own quiz answers"
    ON quiz_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_answers.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "Editors manage quiz answers"
    ON quiz_answers FOR ALL
    USING (public.is_editor_or_admin());

-- 13. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_hackathon_problems_event_id ON hackathon_problem_statements(event_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
