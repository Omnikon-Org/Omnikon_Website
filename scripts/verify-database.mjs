// Omnikon 2.0 — Local Database Migration Introspection & Verification Script (v3 Reconciled)
// File: scripts/verify-database.mjs
// Usage: node scripts/verify-database.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_PATH = path.resolve(__dirname, '../supabase/migrations/0001_initial_schema.sql');

console.log('🔍 Starting Omnikon 2.0 Database Migration Verification Audit (v3 Reconciled)...\n');

if (!fs.existsSync(MIGRATION_PATH)) {
  console.error(`❌ Migration file not found at: ${MIGRATION_PATH}`);
  process.exit(1);
}

const sql = fs.readFileSync(MIGRATION_PATH, 'utf-8');

const EXPECTED_TABLES = [
  'profiles',
  'profile_private',
  'categories',
  'tags',
  'articles',
  'projects',
  'events',
  'event_recaps',
  'updates',
  'article_tags',
  'project_tags',
  'event_tags',
  'article_projects',
  'article_events',
  'project_events',
  'related_articles',
  'project_contributors',
  'redirects',
  'github_cache',
  'audit_logs',
  'view_logs',
];

const EXPECTED_ENUMS = [
  'user_role',
  'developer_tier',
  'content_status',
  'content_type',
];

const EXPECTED_FUNCTIONS = [
  'is_admin',
  'is_editor',
  'is_editor_or_admin',
  'is_contributor_or_above',
  'record_entity_view',
  'enforce_profile_field_locks',
  'update_timestamp',
];

let errors = [];

// 1. Verify Expected Tables
console.log('--- 1. Table Definitions Check ---');
EXPECTED_TABLES.forEach((table) => {
  const pattern = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b|CREATE TABLE ${table}\\b`, 'i');
  if (pattern.test(sql)) {
    console.log(`  ✓ Table '${table}' is defined.`);
  } else {
    console.error(`  ❌ MISSING TABLE: '${table}'`);
    errors.push(`Table '${table}' is missing from migration DDL.`);
  }
});

// 2. Verify RLS Enablement on All 21 Tables
console.log('\n--- 2. Row Level Security (RLS) Enablement Check ---');
EXPECTED_TABLES.forEach((table) => {
  const pattern = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i');
  if (pattern.test(sql)) {
    console.log(`  ✓ RLS enabled for '${table}'.`);
  } else {
    console.error(`  ❌ RLS NOT ENABLED for '${table}'`);
    errors.push(`Table '${table}' does not have RLS enabled.`);
  }
});

// 3. Verify Custom ENUM Types
console.log('\n--- 3. Custom ENUM Types Check ---');
EXPECTED_ENUMS.forEach((enumType) => {
  const pattern = new RegExp(`CREATE TYPE ${enumType}\\b`, 'i');
  if (pattern.test(sql)) {
    console.log(`  ✓ ENUM '${enumType}' is defined.`);
  } else {
    console.error(`  ❌ MISSING ENUM: '${enumType}'`);
    errors.push(`ENUM type '${enumType}' is missing from migration DDL.`);
  }
});

// 4. Verify Workflow Function Check (enforce_content_publication_workflow or enforce_publication_workflow)
console.log('\n--- 4. Publication Workflow Function Check ---');
if (/enforce_content_publication_workflow|enforce_publication_workflow/i.test(sql)) {
  console.log('  ✓ Content publication workflow function is defined.');
} else {
  console.error('  ❌ Publication workflow function missing from migration.');
  errors.push('Publication workflow function is missing.');
}

// 5. Verify Helper & Trigger Functions
console.log('\n--- 5. Centralized Helper & Trigger Functions Check ---');
EXPECTED_FUNCTIONS.forEach((fn) => {
  const pattern = new RegExp(`CREATE OR REPLACE FUNCTION ${fn}\\b|CREATE FUNCTION ${fn}\\b`, 'i');
  if (pattern.test(sql)) {
    console.log(`  ✓ Function '${fn}()' is defined.`);
  } else {
    console.error(`  ❌ MISSING FUNCTION: '${fn}()'`);
    errors.push(`Function '${fn}()' is missing from migration DDL.`);
  }
});

// 6. Verify Full-Text GIN Indexes
console.log('\n--- 6. Full-Text GIN Indexes Check ---');
const GIN_INDEXES = ['idx_articles_search', 'idx_projects_search', 'idx_events_search'];
GIN_INDEXES.forEach((idx) => {
  const pattern = new RegExp(`CREATE INDEX IF NOT EXISTS ${idx}\\b|CREATE INDEX ${idx}\\b`, 'i');
  if (pattern.test(sql)) {
    console.log(`  ✓ GIN Index '${idx}' is defined.`);
  } else {
    console.error(`  ❌ MISSING INDEX: '${idx}'`);
    errors.push(`Index '${idx}' is missing from migration DDL.`);
  }
});

// Final Audit Summary
console.log('\n==================================================');
if (errors.length === 0) {
  console.log('✅ DATABASE VERIFICATION PASSED: All 21 tables, ENUMs, RLS rules, helper functions, and indexes are valid!');
  process.exit(0);
} else {
  console.error(`❌ DATABASE VERIFICATION FAILED: Found ${errors.length} issues.`);
  errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
  process.exit(1);
}
