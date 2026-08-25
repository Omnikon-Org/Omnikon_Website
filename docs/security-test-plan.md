# Omnikon 2.0 — Security Test Plan & Verification Mapping

## 1. Overview
This document maps every authorization scenario defined in [`security-test-matrix.md`](file:///Users/pthawait/Documents/GitHub/Omnikon_Website/docs/security-test-matrix.md) to its exact SQL policy, database trigger, helper function, and expected execution result in [`0001_initial_schema.sql`](file:///Users/pthawait/Documents/GitHub/Omnikon_Website/supabase/migrations/0001_initial_schema.sql).

---

## 2. Complete 18-Scenario Security Test Mapping

### TEST 1: Read Published Article
* **Expected Outcome**: Anonymous → PASS | Member → PASS | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Public read published articles" ON articles FOR SELECT
  USING (status = 'published'::content_status);
  ```
* **Enforcing Function / Trigger**: N/A (Public RLS SELECT Policy)
* **Database Behavior**: Select queries returning `status = 'published'` execute cleanly for all connections without requiring authentication headers.

---

### TEST 2: Read Draft Article (Own)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Authors read own articles" ON articles FOR SELECT TO authenticated
  USING (auth.uid() = author_id);
  ```
* **Enforcing Function / Trigger**: `auth.uid()` evaluation against `articles.author_id`.
* **Database Behavior**: Returns rows where `author_id` equals current JWT subject (`auth.uid()`). Unauthenticated connections receive 0 rows.

---

### TEST 3: Read Draft Article (Someone Else's)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Editors read all articles" ON articles FOR SELECT TO authenticated
  USING (public.is_editor_or_admin());
  ```
* **Enforcing Function / Trigger**: `is_editor_or_admin()` SECURITY DEFINER function.
* **Database Behavior**: Contributors and Members receive 0 rows when attempting to query foreign drafts. Editors and Admins receive all matching draft records.

---

### TEST 4: Create Article (`draft` status)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Contributors insert own articles" ON articles FOR INSERT TO authenticated
  WITH CHECK (
      auth.uid() = author_id
      AND status IN ('draft'::content_status, 'review'::content_status)
      AND public.is_contributor_or_above()
  );
  ```
* **Enforcing Function / Trigger**: `is_contributor_or_above()` + `enforce_content_publication_workflow()`.
* **Database Behavior**: Members and Anonymous connections fail with `42501 RLS Violation`. Contributors inserting a draft with `author_id = auth.uid()` succeed.

---

### TEST 5: Modify Own Draft Article
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Authors update own draft articles" ON articles FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND status = 'draft'::content_status)
  WITH CHECK (auth.uid() = author_id AND status IN ('draft'::content_status, 'review'::content_status));
  ```
* **Enforcing Function / Trigger**: `enforce_content_publication_workflow()`
* **Database Behavior**: Contributor updating their own `status = 'draft'` article succeeds provided status remains `draft` or `review`.

---

### TEST 6: Modify Someone Else's Draft
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Editors update articles" ON articles FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin()) WITH CHECK (public.is_editor_or_admin());
  ```
* **Enforcing Function / Trigger**: `is_editor_or_admin()`
* **Database Behavior**: Non-editors attempting to update foreign draft articles fail with `42501 RLS Violation`. Editors can update any article.

---

### TEST 7: Publish Article (`status = 'published'`)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → PASS | Admin → PASS
* **Exact SQL Policy**: `Editors update articles`
* **Enforcing Function / Trigger**: `enforce_content_publication_workflow()` BEFORE INSERT OR UPDATE Trigger:
  ```sql
  IF NEW.status = 'published'::content_status AND NOT public.is_editor_or_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only Editors and Admins can publish content.';
  END IF;
  ```
* **Database Behavior**: Attempt by a Contributor or Member to insert or update an article with `status = 'published'` raises database exception `P0001`. Stamping `reviewer_id` and `published_at` occurs automatically for Editors/Admins.

---

### TEST 8: Modify Profile Bio (Own Profile)
* **Expected Outcome**: Anonymous → FAIL | Member → PASS | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
  ```
* **Enforcing Function / Trigger**: `trg_lock_profile_fields`
* **Database Behavior**: Authenticated users can modify `bio`, `full_name`, `avatar_url`, `github_username`, `discord_username`, `website_url` on their own profile row (`id = auth.uid()`).

---

### TEST 9: Modify Profile Role (`role = 'admin'`)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  WITH CHECK (
      auth.uid() = id
      AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      AND developer_tier = (SELECT p.developer_tier FROM public.profiles p WHERE p.id = auth.uid())
      AND is_ambassador = (SELECT p.is_ambassador FROM public.profiles p WHERE p.id = auth.uid())
  );
  ```
* **Enforcing Function / Trigger**: `enforce_profile_field_locks()` BEFORE UPDATE Trigger:
  ```sql
  IF NOT public.is_admin() THEN
      IF NEW.role IS DISTINCT FROM OLD.role OR NEW.developer_tier IS DISTINCT FROM OLD.developer_tier OR NEW.is_ambassador IS DISTINCT FROM OLD.is_ambassador THEN
          RAISE EXCEPTION 'Unauthorized: Only Admins can modify role, developer_tier, or ambassador status.';
      END IF;
  END IF;
  ```
* **Database Behavior**: Non-admins attempting to change `role`, `developer_tier`, or `is_ambassador` are blocked by BOTH RLS WITH CHECK subquery and trigger exception `P0001`.

---

### TEST 10: Modify Another User's Profile
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Admins manage profiles" ON profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  ```
* **Enforcing Function / Trigger**: `is_admin()`
* **Database Behavior**: Non-admins trying to update `profiles WHERE id != auth.uid()` fail with `42501 RLS Violation`. Admins succeed.

---

### TEST 11: Read Private Profile (`profile_private`)
* **Expected Outcome**: Anonymous → FAIL | Member → 👤 Own Only | Contributor → 👤 Own Only | Editor → 👤 Own Only | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Users read own private profile" ON profile_private FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());
  ```
* **Enforcing Function / Trigger**: `auth.uid() = id` OR `is_admin()`
* **Database Behavior**: Authenticated users receive 0 rows when attempting to read another user's `profile_private` record.

---

### TEST 12: Add Tags to Own Article
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → PASS | Editor → PASS | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Insert article tags" ON article_tags FOR INSERT TO authenticated
  WITH CHECK (
      EXISTS (SELECT 1 FROM articles a WHERE a.id = article_tags.article_id AND (a.author_id = auth.uid() OR public.is_editor_or_admin()))
  );
  ```
* **Enforcing Function / Trigger**: Parent `articles` ownership check in RLS policy.
* **Database Behavior**: Insertion into `article_tags` succeeds if `auth.uid()` matches the parent article's `author_id`.

---

### TEST 13: Add Tags to Someone Else's Article
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → PASS | Admin → PASS
* **Exact SQL Policy**: `Insert article tags`
* **Enforcing Function / Trigger**: Parent `articles` ownership check.
* **Database Behavior**: Non-author contributors attempting to tag someone else's article fail with `42501 RLS Violation`. Editors succeed.

---

### TEST 14: Read GitHub Cache (`github_cache`)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → FAIL (Client Tokens DENIED; Server Service Role ONLY)
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Deny client access to github cache" ON github_cache FOR ALL
  USING (FALSE) WITH CHECK (FALSE);
  ```
* **Enforcing Function / Trigger**: Unconditional `FALSE` RLS Policy.
* **Database Behavior**: Any query over client REST endpoints returns 0 rows. Access is exclusively granted to Next.js Server components using `SUPABASE_SERVICE_ROLE_KEY`.

---

### TEST 15: Modify GitHub Cache Table
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → FAIL (Client Tokens DENIED; Server Service Role ONLY)
* **Exact SQL Policy**: `Deny client access to github cache`
* **Enforcing Function / Trigger**: Unconditional `FALSE` RLS Policy.
* **Database Behavior**: Direct client REST `INSERT`, `UPDATE`, or `DELETE` operations fail with `42501 RLS Violation`.

---

### TEST 16: Read Audit Logs (`audit_logs`)
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());
  ```
* **Enforcing Function / Trigger**: `is_admin()`
* **Database Behavior**: Non-admins receive 0 rows when attempting to query `audit_logs`. Admins receive all immutable log entries.

---

### TEST 17: Modify / Delete Audit Log Entry
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → FAIL (Immutable Logs)
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Deny audit log updates" ON audit_logs FOR UPDATE USING (FALSE) WITH CHECK (FALSE);
  CREATE POLICY "Deny audit log deletes" ON audit_logs FOR DELETE USING (FALSE);
  ```
* **Enforcing Function / Trigger**: Unconditional `FALSE` RLS Policies.
* **Database Behavior**: Any client or admin attempt to `UPDATE` or `DELETE` records from `audit_logs` fails with `42501 RLS Violation`.

---

### TEST 18: Create / Modify URL Redirect
* **Expected Outcome**: Anonymous → FAIL | Member → FAIL | Contributor → FAIL | Editor → FAIL | Admin → PASS
* **Exact SQL Policy**:
  ```sql
  CREATE POLICY "Admins manage redirects" ON redirects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  ```
* **Enforcing Function / Trigger**: `is_admin()`
* **Database Behavior**: Non-admins attempting to insert, update, or delete entries in `redirects` fail with `42501 RLS Violation`.
