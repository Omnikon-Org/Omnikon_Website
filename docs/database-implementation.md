# Omnikon 2.0 — Database Implementation & Deployment Guide

## 1. Executive Overview
This document outlines the deployment, execution, testing, and operational workflows for the Omnikon 2.0 Supabase PostgreSQL database. The migration script [`0001_initial_schema.sql`](file:///Users/pthawait/Documents/GitHub/Omnikon_Website/supabase/migrations/0001_initial_schema.sql) provisions all 21 core tables, custom ENUMs, SECURITY DEFINER helper functions, defense-in-depth triggers, performance GIN indexes, and Row Level Security (RLS) policies.

---

## 2. Migration Artifacts & Structure

```
supabase/
├── migrations/
│   └── 0001_initial_schema.sql    # Primary SQL DDL & RLS Security Migration
├── tests/
│   └── security.sql               # Automated pgTAP Security & RLS Test Suite
└── seed.sql                       # Safe initial taxonomies & URL redirects seed

scripts/
└── verify-database.mjs            # Local node introspection & verification script
```

---

## 3. Environment Variables & Credentials Strategy

Configure the following environment variables in `.env.local` or Vercel project configuration:

```bash
# --- Public Client Variables (Safe for Browser Bundle) ---
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... # Anon key enforced by RLS policies

# --- Server-Only Secret Variables (NEVER Expose to Browser) ---
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # Service role key (bypasses RLS for server jobs)
GITHUB_TOKEN=ghp_...                    # Server-side GitHub API access token
```

### Critical Security Rule
- **Service Role Key Isolation**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies. It MUST ONLY be used in Next.js Server Components, Route Handlers (`app/api/*`), or Server Actions. It must **NEVER** be prefixed with `NEXT_PUBLIC_` or bundled in client-side code.

---

## 4. Local Development & Deployment Workflows

### A. Local Supabase CLI Setup
1. **Initialize Local Supabase Environment**:
   ```bash
   npx supabase init
   ```
2. **Start Local PostgreSQL Container**:
   ```bash
   npx supabase start
   ```
3. **Apply Migration & Seed Data**:
   ```bash
   npx supabase db reset
   ```
   *(This automatically applies `migrations/0001_initial_schema.sql` and populates taxonomies via `seed.sql`)*.

### B. Deploying to Remote Supabase Environment
1. **Link to Remote Supabase Project**:
   ```bash
   npx supabase link --project-ref <your-project-id>
   ```
2. **Push Migration**:
   ```bash
   npx supabase db push
   ```

---

## 5. Automated Security & Schema Verification

### A. Local Migration Verification Script
Run the automated schema verification script to validate that all 21 tables, custom ENUMs, triggers, helper functions, and RLS policies exist in the migration DDL:

```bash
node scripts/verify-database.mjs
```

### B. Running Automated pgTAP Security Tests
Execute the security test suite against a local or staging database instance to verify RLS boundaries across all 5 user roles:

```bash
npx supabase test db --test-path supabase/tests/security.sql
```

---

## 6. Server-Only Operations & Service Role Usage

The following system subsystems require the **Supabase Service Role Key** to execute backend operations:

1. **GitHub Server Cache (`github_cache`)**:
   - Next.js Route Handlers (`app/api/github/sync/route.ts`) use the Service Role client to read/write cached repository metadata, stargazers, and issue lists. Direct client access is denied by RLS.
2. **System Audit Logs (`audit_logs`)**:
   - Backend API functions use the Service Role client or database triggers to record administrative actions (`actor_id`, `action`, `entity_type`, `old_state`, `new_state`).
3. **URL Redirect Resolution (`redirects`)**:
   - Next.js Edge Middleware uses the server client to query `redirects` for 301 URL rewrites without exposing direct REST endpoints to browsers.
