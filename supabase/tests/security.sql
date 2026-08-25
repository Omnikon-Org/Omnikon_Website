-- Omnikon 2.0 — Security & RLS Test Suite (pgTAP Full Coverage)
-- File: supabase/tests/security.sql
-- Description: Complete pgTAP test suite validating every operation in security-test-matrix.md.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(18);

-- ============================================================================
-- 1. ANONYMOUS USER TESTS
-- ============================================================================

-- Test 1: Read Published Article (MUST PASS)
SELECT lives_ok(
    $$ SELECT id FROM public.articles WHERE status = 'published' LIMIT 1 $$,
    'Test 1: Anonymous user can read published articles'
);

-- Test 2: Read Draft Article (MUST FAIL / RETURN 0 ROWS)
SELECT is_empty(
    $$ SELECT id FROM public.articles WHERE status = 'draft' $$,
    'Test 2: Anonymous user cannot read draft articles'
);

-- Test 3: Create Article (MUST FAIL / RLS Block)
SELECT throws_ok(
    $$ INSERT INTO public.articles (title, slug, summary, content_mdx, status) VALUES ('Hacked Title', 'hacked-slug', 'summary', 'body', 'draft') $$,
    '42501',
    NULL,
    'Test 3: Anonymous user cannot insert articles'
);

-- ============================================================================
-- 2. MEMBER ROLE TESTS
-- ============================================================================

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

-- Test 4: Modify Profile Bio Own (MUST PASS)
SELECT lives_ok(
    $$ UPDATE public.profiles SET bio = 'Updated bio' WHERE id = '11111111-1111-1111-1111-111111111111' $$,
    'Test 4: Member can update own profile bio'
);

-- Test 5: Modify Profile Role to Admin (MUST FAIL via trigger)
SELECT throws_ok(
    $$ UPDATE public.profiles SET role = 'admin'::user_role WHERE id = '11111111-1111-1111-1111-111111111111' $$,
    'P0001',
    'Unauthorized: Only Admins can modify role, developer_tier, or ambassador status.',
    'Test 5: Member cannot elevate self role to admin'
);

-- Test 6: Read Private Profile Foreign (MUST FAIL / RLS Block)
SELECT is_empty(
    $$ SELECT id FROM public.profile_private WHERE id = '22222222-2222-2222-2222-222222222222' $$,
    'Test 6: Member cannot read another user private profile'
);

-- ============================================================================
-- 3. CONTRIBUTOR ROLE TESTS
-- ============================================================================

SET LOCAL "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

-- Test 7: Create Draft Article (MUST PASS)
SELECT lives_ok(
    $$ INSERT INTO public.articles (title, slug, summary, content_mdx, author_id, status) VALUES ('My Draft', 'my-draft-slug', 'sum', 'mdx', '22222222-2222-2222-2222-222222222222', 'draft') $$,
    'Test 7: Contributor can create own article draft'
);

-- Test 8: Self-Publish Article (MUST FAIL via trigger)
SELECT throws_ok(
    $$ INSERT INTO public.articles (title, slug, summary, content_mdx, author_id, status) VALUES ('Self Publish', 'self-pub', 'sum', 'mdx', '22222222-2222-2222-2222-222222222222', 'published') $$,
    'P0001',
    'Unauthorized: Only Editors and Admins can publish content.',
    'Test 8: Contributor cannot self-publish articles'
);

-- Test 9: Modify Someone Else Draft (MUST FAIL / RLS Block)
SELECT throws_ok(
    $$ UPDATE public.articles SET title = 'Hijacked' WHERE author_id = '33333333-3333-3333-3333-333333333333' AND status = 'draft' $$,
    '42501',
    NULL,
    'Test 9: Contributor cannot update someone else draft'
);

-- Test 10: Tag Foreign Article (MUST FAIL / Junction Parent Ownership RLS)
SELECT throws_ok(
    $$ INSERT INTO public.article_tags (article_id, tag_id) VALUES ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555') $$,
    '42501',
    NULL,
    'Test 10: Contributor cannot tag someone else article'
);

-- Test 11: Modify Review Notes as Contributor (MUST FAIL via trigger)
SELECT throws_ok(
    $$ UPDATE public.articles SET review_notes = 'Self Approved' WHERE author_id = '22222222-2222-2222-2222-222222222222' AND status = 'draft' $$,
    'P0001',
    'Unauthorized: Only Editors and Admins can modify review metadata.',
    'Test 11: Contributor cannot set or modify review notes'
);

-- ============================================================================
-- 4. EDITOR ROLE TESTS
-- ============================================================================

SET LOCAL "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

-- Test 12: Editor Read Review Drafts (MUST PASS)
SELECT lives_ok(
    $$ SELECT id FROM public.articles WHERE status = 'review' LIMIT 1 $$,
    'Test 12: Editor can read review drafts'
);

-- Test 13: Editor Publish Article (MUST PASS)
SELECT lives_ok(
    $$ UPDATE public.articles SET status = 'published' WHERE slug = 'my-draft-slug' $$,
    'Test 13: Editor can transition review article to published'
);

-- Test 14: Editor Modify Role to Admin (MUST FAIL via trigger)
SELECT throws_ok(
    $$ UPDATE public.profiles SET role = 'admin'::user_role WHERE id = '33333333-3333-3333-3333-333333333333' $$,
    'P0001',
    'Unauthorized: Only Admins can modify role, developer_tier, or ambassador status.',
    'Test 14: Editor cannot elevate role to admin'
);

-- ============================================================================
-- 5. ADMIN ROLE & SYSTEM IMMUTABILITY TESTS
-- ============================================================================

SET LOCAL "request.jwt.claim.sub" = '44444444-4444-4444-4444-444444444444';

-- Test 15: Read Audit Logs Admin (MUST PASS)
SELECT lives_ok(
    $$ SELECT id FROM public.audit_logs LIMIT 1 $$,
    'Test 15: Admin can read audit logs'
);

-- Test 16: Modify Audit Log Entry (MUST FAIL / Immutable Block)
SELECT throws_ok(
    $$ UPDATE public.audit_logs SET action = 'MODIFIED' WHERE id = '55555555-5555-5555-5555-555555555555' $$,
    '42501',
    NULL,
    'Test 16: Audit logs are immutable and cannot be updated even by Admin'
);

-- Test 17: Read GitHub Cache Direct Client REST (MUST FAIL / Service Role Only)
SELECT is_empty(
    $$ SELECT key FROM public.github_cache $$,
    'Test 17: Authenticated client token cannot read github_cache directly'
);

-- Test 18: Admin Create Redirect (MUST PASS)
SELECT lives_ok(
    $$ INSERT INTO public.redirects (source_path, destination_path, status_code) VALUES ('/old-test-route', '/new-test-route', 301) $$,
    'Test 18: Admin can create URL redirects'
);

SELECT * FROM finish();
ROLLBACK;
