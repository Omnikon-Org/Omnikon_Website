# Omnikon 2.0 — Row Level Security (RLS) Policy Specification (v2 Final)

## 1. Centralized Authorization Architecture
Omnikon 2.0 uses centralized `SECURITY DEFINER` functions with fixed `search_path = public, auth` to evaluate authorization roles (`admin`, `editor`, `contributor`, `member`). This eliminates RLS query recursion, improves query optimization, and prevents role escalation exploits.

---

## 2. Reconciled Security Helper Functions

```sql
-- Helper 1: Check if current user is Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Helper 2: Check if current user is Editor
CREATE OR REPLACE FUNCTION is_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'editor'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Helper 3: Check if current user is Editor or Admin
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('editor'::user_role, 'admin'::user_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Helper 4: Check if current user is Contributor or above
CREATE OR REPLACE FUNCTION is_contributor_or_above()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('contributor'::user_role, 'editor'::user_role, 'admin'::user_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
```

---

## 3. Defense-in-Depth Triggers

### A. Role Field Modification Lock Trigger
```sql
CREATE OR REPLACE FUNCTION enforce_profile_field_locks()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT is_admin() THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) OR
           (NEW.developer_tier IS DISTINCT FROM OLD.developer_tier) OR
           (NEW.is_ambassador IS DISTINCT FROM OLD.is_ambassador) THEN
            RAISE EXCEPTION 'Unauthorized: Only Admins can modify role, developer_tier, or ambassador status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_lock_profile_fields BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION enforce_profile_field_locks();
```

### B. Publication Workflow Enforcer Trigger
```sql
CREATE OR REPLACE FUNCTION enforce_publication_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Only Editors and Admins can transition content to 'published' status
    IF (NEW.status = 'published'::content_status) AND NOT is_editor_or_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only Editors and Admins can publish content.';
    END IF;
    
    -- Stamp reviewer and timestamp if published by editor/admin
    IF (NEW.status = 'published'::content_status AND OLD.status != 'published'::content_status) THEN
        NEW.reviewer_id = auth.uid();
        NEW.reviewed_at = NOW();
        NEW.published_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_article_workflow BEFORE INSERT OR UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION enforce_publication_workflow();
CREATE TRIGGER trg_project_workflow BEFORE INSERT OR UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION enforce_publication_workflow();
CREATE TRIGGER trg_event_workflow BEFORE INSERT OR UPDATE ON events FOR EACH ROW EXECUTE FUNCTION enforce_publication_workflow();
```

---

## 4. Reconciled RLS Policy Statements

### A. Profiles & Profile Private (`profiles`, `profile_private`)
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_private ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone (including Visitors) can read public profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (TRUE);

-- Profiles: Users can update own profile fields (Role lock trigger prevents escalation)
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Profiles: Admins have full access
CREATE POLICY "Admins all profiles" ON profiles FOR ALL TO authenticated USING (is_admin());

-- Private Profiles: Strictly restricted to owner or admin
CREATE POLICY "Users read own private profile" ON profile_private FOR SELECT TO authenticated USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users update own private profile" ON profile_private FOR UPDATE TO authenticated USING (auth.uid() = id);
```

### B. Articles (`articles`)
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read published articles
CREATE POLICY "Public read published articles" ON articles FOR SELECT USING (status = 'published'::content_status);

-- 2. Authors can read their own articles (any status)
CREATE POLICY "Authors read own articles" ON articles FOR SELECT TO authenticated USING (auth.uid() = author_id);

-- 3. Editors & Admins read all articles
CREATE POLICY "Editors read all articles" ON articles FOR SELECT TO authenticated USING (is_editor_or_admin());

-- 4. Contributors can insert drafts assigned to themselves
CREATE POLICY "Contributors insert own draft" ON articles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id AND status IN ('draft'::content_status, 'review'::content_status) AND is_contributor_or_above());

-- 5. Authors can update their own drafts
CREATE POLICY "Authors update own draft" ON articles FOR UPDATE TO authenticated
    USING (auth.uid() = author_id AND status = 'draft'::content_status)
    WITH CHECK (auth.uid() = author_id AND status IN ('draft'::content_status, 'review'::content_status));

-- 6. Editors and Admins update any article
CREATE POLICY "Editors update articles" ON articles FOR UPDATE TO authenticated USING (is_editor_or_admin());

-- 7. Admins can delete articles
CREATE POLICY "Admins delete articles" ON articles FOR DELETE TO authenticated USING (is_admin());
```

### C. Projects (`projects`)
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published projects" ON projects FOR SELECT USING (status = 'published'::content_status);
CREATE POLICY "Authors read own projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Editors read all projects" ON projects FOR SELECT TO authenticated USING (is_editor_or_admin());
CREATE POLICY "Contributors insert own project" ON projects FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id AND status IN ('draft'::content_status, 'review'::content_status) AND is_contributor_or_above());
CREATE POLICY "Authors update own draft project" ON projects FOR UPDATE TO authenticated
    USING (auth.uid() = author_id AND status = 'draft'::content_status);
CREATE POLICY "Editors update projects" ON projects FOR UPDATE TO authenticated USING (is_editor_or_admin());
CREATE POLICY "Admins delete projects" ON projects FOR DELETE TO authenticated USING (is_admin());
```

### D. Events & Event Recaps (`events`, `event_recaps`)
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published events" ON events FOR SELECT USING (status = 'published'::content_status);
CREATE POLICY "Editors read all events" ON events FOR SELECT TO authenticated USING (is_editor_or_admin());
CREATE POLICY "Editors manage events" ON events FOR ALL TO authenticated USING (is_editor_or_admin());

CREATE POLICY "Public read published recaps" ON event_recaps FOR SELECT USING (status = 'published'::content_status);
CREATE POLICY "Editors manage recaps" ON event_recaps FOR ALL TO authenticated USING (is_editor_or_admin());
```

### E. Parent Ownership Junction Table Policies
```sql
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read article tags" ON article_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = article_tags.article_id AND (articles.status = 'published'::content_status OR articles.author_id = auth.uid() OR is_editor_or_admin()))
);

CREATE POLICY "Insert article tags" ON article_tags FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = article_tags.article_id AND (articles.author_id = auth.uid() OR is_editor_or_admin()))
);

CREATE POLICY "Delete article tags" ON article_tags FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM articles WHERE articles.id = article_tags.article_id AND (articles.author_id = auth.uid() OR is_editor_or_admin()))
);
```

### F. Server-Only Tables (`github_cache`, `audit_logs`, `redirects`)
```sql
ALTER TABLE github_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Redirects: No direct public REST access. Accessible via Server Middleware / Admin API
CREATE POLICY "Admins manage redirects" ON redirects FOR ALL TO authenticated USING (is_admin());

-- GitHub Cache: Completely blocked for client tokens. Accessible ONLY via Service Role Key
CREATE POLICY "Deny direct client github_cache" ON github_cache FOR ALL USING (FALSE);

-- Audit Logs: Append-only via server functions. Readable ONLY by Admins. UPDATE/DELETE strictly DENIED.
CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Deny direct update audit logs" ON audit_logs FOR UPDATE USING (FALSE);
CREATE POLICY "Deny direct delete audit logs" ON audit_logs FOR DELETE USING (FALSE);
```
