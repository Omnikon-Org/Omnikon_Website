# Omnikon 2.0 — Security Test Matrix & Verification Checklist (v2 Final)

## 1. Overview & Verification Strategy
This security test matrix defines the formal verification suite for Omnikon 2.0 authorization policies. Every operational combination across user roles (`Anonymous User`, `Member`, `Contributor`, `Editor`, `Admin`) is validated against database Row Level Security (RLS) policies, database triggers, and API guards.

---

## 2. Reconciled Security Test Matrix

| # | Operation Description | Anonymous | Member | Contributor | Editor | Admin | Failure Guard / Reason |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | Read Published Article | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | Publicly accessible to all users |
| **2** | Read Draft Article (Own) | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | ✅ PASS | RLS restricts draft reads to author or editors |
| **3** | Read Draft Article (Someone else's) | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | RLS blocks reading non-owned drafts for contributors |
| **4** | Create Article (`draft` status) | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | ✅ PASS | RLS restricts INSERT to `is_contributor_or_above()` |
| **5** | Modify Own Draft Article | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | ✅ PASS | RLS permits author to update own draft |
| **6** | Modify Someone Else's Draft | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | RLS blocks non-editors from updating foreign drafts |
| **7** | Publish Article (`status = 'published'`) | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | `enforce_publication_workflow()` trigger blocks non-editors |
| **8** | Modify Profile Bio (Own Profile) | ❌ FAIL | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | RLS permits updating own public profile fields |
| **9** | Modify Profile Role (`role = 'admin'`) | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | `enforce_profile_field_locks()` trigger blocks non-admins |
| **10**| Modify Another User's Profile | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | RLS restricts profile updates to owner or admin |
| **11**| Read Private Profile (`profile_private`) | ❌ FAIL | 👤 Own Only | 👤 Own Only | 👤 Own Only | ✅ PASS | RLS restricts `profile_private` to owner or admin |
| **12**| Add Tags to Own Article | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | ✅ PASS | Junction RLS verifies parent article ownership |
| **13**| Add Tags to Someone Else's Article | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | ✅ PASS | Junction RLS blocks tag inserts for foreign articles |
| **14**| Read GitHub Cache (`github_cache`) | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | RLS blocks direct client REST calls (Server-only via Service Key) |
| **15**| Modify GitHub Cache Table | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | RLS blocks direct client REST calls (Server-only via Service Key) |
| **16**| Read Audit Logs (`audit_logs`) | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | RLS restricts audit log reads strictly to `is_admin()` |
| **17**| Modify / Delete Audit Log Entry | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | RLS blocks UPDATE/DELETE for ALL users (Immutable Logs) |
| **18**| Create / Modify URL Redirect | ❌ FAIL | ❌ FAIL | ❌ FAIL | ❌ FAIL | ✅ PASS | RLS restricts redirect management to `is_admin()` |

---

## 3. Test Assertions Summary
- 🟢 **Public Content Integrity**: Anonymous visitors can ONLY read content where `status = 'published'`. All draft, review, and archived content attempts fail with `403 RLS Block`.
- 🔴 **Role Escalation Defense**: Attempts by normal users or editors to mutate their own `role` field fail via database trigger exception (`enforce_profile_field_locks()`).
- 🔒 **Data Isolation & Privileges**: Direct client attempts to read/write `github_cache` or modify `audit_logs` fail unconditionally for browser tokens.
