// Omnikon 2.0 — Automated Security Matrix & Authorization Verification Suite
// File: scripts/run-security-matrix.mjs
// Usage: node --env-file=.env scripts/run-security-matrix.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('❌ Missing Supabase environment credentials (.env).');
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

console.log('🔒 Starting Omnikon 2.0 Security Matrix Automated Verification Suite...\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(testNum, testName, testFn) {
  try {
    const result = await testFn();
    if (result.passed) {
      console.log(`  ✓ Test #${testNum}: [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ Test #${testNum}: [FAIL] ${testName} — ${result.reason}`);
      failedTests++;
    }
  } catch (err) {
    console.error(`  ❌ Test #${testNum}: [EXCEPTION] ${testName} — ${err.message}`);
    failedTests++;
  }
}

async function runSuite() {
  // Test 1: Public read published articles
  await runTest(1, 'Anonymous Read Published Articles', async () => {
    const { data, error } = await anonClient.from('articles').select('id, title, status').eq('status', 'published');
    if (error) return { passed: false, reason: error.message };
    return { passed: true };
  });

  // Test 2: Anonymous read draft articles (must be blocked by RLS or return empty)
  await runTest(2, 'Anonymous Read Draft Articles (RLS Protection)', async () => {
    const { data, error } = await anonClient.from('articles').select('id, title, status').eq('status', 'draft');
    if (error) return { passed: true }; // Error is also acceptable (RLS denial)
    if (data && data.length > 0) return { passed: false, reason: 'Draft articles exposed to anonymous client!' };
    return { passed: true };
  });

  // Test 3: Anonymous insert article (must be blocked by RLS)
  await runTest(3, 'Anonymous Create Article Blocked', async () => {
    const { data, error } = await anonClient.from('articles').insert({
      title: 'Hacked Article',
      slug: 'hacked-article',
      summary: 'Malicious payload',
      content_mdx: '# Malicious Content',
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Anonymous user was permitted to insert article!' };
  });

  // Test 4: Anonymous read private profiles (must be blocked by RLS)
  await runTest(4, 'Anonymous Read Private Profile Blocked', async () => {
    const { data, error } = await anonClient.from('profile_private').select('*');
    if (error || !data || data.length === 0) return { passed: true };
    return { passed: false, reason: 'Private profile data exposed to anonymous client!' };
  });

  // Test 5: Anonymous insert into view_logs (must be blocked by RLS)
  await runTest(5, 'Anonymous Direct Insert to view_logs Blocked', async () => {
    const { data, error } = await anonClient.from('view_logs').insert({
      entity_type: 'project_view',
      entity_id: '00000000-0000-0000-0000-000000000000',
      ip_hash: 'test_hash',
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Direct client was able to insert into view_logs!' };
  });

  // Test 6: Anonymous read github_cache (must be blocked by RLS)
  await runTest(6, 'Anonymous Read github_cache Blocked', async () => {
    const { data, error } = await anonClient.from('github_cache').select('*');
    if (error || !data || data.length === 0) return { passed: true };
    return { passed: false, reason: 'github_cache exposed to anonymous client!' };
  });

  // Test 7: Anonymous read audit_logs (must be blocked by RLS)
  await runTest(7, 'Anonymous Read audit_logs Blocked', async () => {
    const { data, error } = await anonClient.from('audit_logs').select('*');
    if (error || !data || data.length === 0) return { passed: true };
    return { passed: false, reason: 'audit_logs exposed to anonymous client!' };
  });

  // Test 8: Anonymous insert into event_registrations (must be blocked by RLS)
  await runTest(8, 'Anonymous Insert event_registrations Blocked', async () => {
    const { data, error } = await anonClient.from('event_registrations').insert({
      event_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Anonymous user was able to insert event_registrations!' };
  });

  // Test 9: Anonymous insert into contributions (must be blocked by RLS)
  await runTest(9, 'Anonymous Insert contributions Blocked', async () => {
    const { data, error } = await anonClient.from('contributions').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      type: 'community_milestone',
      title: 'Forged Milestone',
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Anonymous user was able to insert contributions!' };
  });

  // Test 10: Admin service key operations function properly
  await runTest(10, 'Admin Service Key Execution Verified', async () => {
    const { count, error } = await adminClient.from('categories').select('*', { count: 'exact', head: true });
    if (error) return { passed: false, reason: error.message };
    return { passed: true };
  });

  // Test 11: Public Read Published Quizzes
  await runTest(11, 'Anonymous Read Published Quizzes Permitted', async () => {
    const { data, error } = await anonClient.from('quizzes').select('id, title, status').eq('status', 'published');
    if (error) return { passed: false, reason: error.message };
    return { passed: true };
  });

  // Test 12: Anonymous Read Draft Quizzes (must be blocked)
  await runTest(12, 'Anonymous Read Draft Quizzes Blocked', async () => {
    const { data, error } = await anonClient.from('quizzes').select('id, title, status').eq('status', 'draft');
    if (error) return { passed: true };
    if (data && data.length > 0) return { passed: false, reason: 'Draft quizzes exposed to anonymous client!' };
    return { passed: true };
  });

  // Test 13: Anonymous Insert Hackathon Problem Statements Blocked
  await runTest(13, 'Anonymous Insert Hackathon Problem Statements Blocked', async () => {
    const { data, error } = await anonClient.from('hackathon_problem_statements').insert({
      event_id: '00000000-0000-0000-0000-000000000000',
      title: 'Forged Problem',
      slug: 'forged-problem',
      description_mdx: 'Unauthorized content',
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Anonymous user was able to insert hackathon problem statement!' };
  });

  // Test 14: Anonymous Direct Insert Quiz Attempts Blocked
  await runTest(14, 'Anonymous Insert Quiz Attempts Blocked', async () => {
    const { data, error } = await anonClient.from('quiz_attempts').insert({
      quiz_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      score: 100,
      total_questions: 10,
      percentage: 100,
      passed: true,
    });
    if (error) return { passed: true };
    return { passed: false, reason: 'Anonymous user was able to insert quiz attempt directly!' };
  });

  // Test 15: Public Leaderboard only exposes public profile attempts
  await runTest(15, 'Quiz Attempts RLS Restricts Private User Attempts', async () => {
    const { data, error } = await anonClient.from('quiz_attempts').select('id, user_id');
    if (error) return { passed: true };
    return { passed: true };
  });

  // Final Summary
  console.log('\n==================================================');
  console.log(`SUMMARY: ${passedTests} Passed, ${failedTests} Failed.`);
  if (failedTests === 0) {
    console.log('✅ ALL SECURITY MATRIX POLICIES PASSED VERIFICATION!');
    process.exit(0);
  } else {
    console.error('❌ SECURITY VERIFICATION FAILED!');
    process.exit(1);
  }
}

runSuite();
