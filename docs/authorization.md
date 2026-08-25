# Omnikon 2.0 — Role-Based Authorization & Security Model

## 1. Role Definitions & Hierarchy

```
   ┌─────────┐
   │  Admin  │  (Full system management, role assignment, ad settings)
   └────┬────┘
        │
   ┌────▼────┐
   │ Editor  │  (Content review, publishing, category management)
   └────┬────┘
        │
   ┌────▼────┐
   │Contributor│ (Draft content creation, project submission)
   └────┬────┘
        │
   ┌────▼────┐
   │ Member  │  (Registered community profiles, bookmarks, discussions)
   └────┬────┘
        │
   ┌────▼────┐
   │ Visitor │  (Unauthenticated public guests - read published items)
   └─────────┘
```

---

## 2. Granular Permissions Matrix

| Entity / Action | Visitor | Member | Contributor | Editor | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Read Published Content (Articles, Projects, Events)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Global Search** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage Own Profile (Bio, Links)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create Article Drafts** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Submit Content for Review** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Review & Edit Any Draft** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Publish / Archive Articles** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Manage Projects & Events** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Manage Categories & Tags** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Promote User Roles (e.g. Member → Editor)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Configure AdSense Routes & System Settings** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Supabase Row Level Security (RLS) Policies

All PostgreSQL tables enforce Supabase Row Level Security (RLS) at the database tier.

### A. Articles Table RLS Policies
```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (including Visitors) can read published articles
CREATE POLICY "Public read published articles" ON articles
    FOR SELECT
    USING (status = 'published');

-- 2. Contributors can read their own drafts
CREATE POLICY "Contributors read own articles" ON articles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = author_id);

-- 3. Editors and Admins can read all articles (draft, review, published, archived)
CREATE POLICY "Editors read all articles" ON articles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('editor', 'admin')
        )
    );

-- 4. Contributors can insert drafts assigned to themselves
CREATE POLICY "Contributors insert own draft" ON articles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = author_id AND 
        status IN ('draft', 'review')
    );

-- 5. Editors and Admins can update any article (publish, edit, archive)
CREATE POLICY "Editors update articles" ON articles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('editor', 'admin')
        )
    );
```

### B. User Profiles Table RLS Policies
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view public profiles
CREATE POLICY "Public profiles read" ON profiles
    FOR SELECT
    USING (TRUE);

-- 2. Users can update their own profile fields (except role)
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Prevents self-role escalation
    );

-- 3. Only Admins can modify user roles
CREATE POLICY "Admins modify profiles" ON profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

---

## 4. Next.js Authorization Layer

### A. Route Guard Middleware (`middleware.ts`)
Next.js middleware inspects Supabase auth session tokens and checks user roles against protected routes:
- `/admin/*`: Requires `role IN ('editor', 'admin')`
- `/dashboard/*`: Requires authenticated session (`role IN ('member', 'contributor', 'editor', 'admin')`)
- Unauthenticated access to protected routes triggers a 307 redirect to `/login?returnTo=...`.

### B. Server Action Authorization Wrapper Pattern
```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function assertUserRole(allowedRoles: Array<'contributor' | 'editor' | 'admin'>) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized: Authentication required');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !allowedRoles.includes(profile.role)) {
        throw new Error('Forbidden: Insufficient privileges');
    }

    return { user, profile };
}
```
