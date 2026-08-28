# Omnikon 2.0 — Phase 7 Privacy-Conscious Analytics Strategy

This document details the tracking schema, table definitions, RLS constraints, and client-side logging details used to monitor community interaction and platform engagement.

---

## 1. Database Table Inspection (`view_logs`)

Omnikon 2.0 reuses the existing, optimized `view_logs` database table. This avoids creating redundant database schemas and simplifies auditing.

### Table Schema
```sql
CREATE TABLE IF NOT EXISTS view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Table Security & Row Level Security (RLS)
- **RLS Status**: **ENABLED**.
- **Write Policy**: Anonymous or Authenticated clients are strictly **BLOCKED** from inserting or selecting directly into the `view_logs` table.
- **Insert Policy**: Bypassed safely on the server side using the server-only `createAdminClient()` powered by the secret `SUPABASE_SERVICE_ROLE_KEY`.

---

## 2. Event Log Definition

| Event Type (`entity_type`) | Trigger Scenario | `entity_id` Mapping |
| :--- | :--- | :--- |
| `project_view` | Project details page rendering | `projects.id` (Project UUID) |
| `project_github_click` | Visitor clicks "View on GitHub" repo link | `projects.id` (Project UUID) |
| `issue_click` | Visitor clicks a "Contribute" button on a Good First Issue | `projects.id` (Project UUID) |
| `article_view` | Technical article detail view renders | `articles.id` (Article UUID) |
| `event_view` | Hackathon/Event detail view renders | `events.id` (Event UUID) |
| `signup` | New member registers/completes profile | `profiles.id` (User UUID) |
| `primary_cta_click` | Visitor clicks "Explore Projects" hero CTA on home | `00000000-0000-0000-0000-000000000000` (Global Namespace UUID) |

---

## 3. Client Logging Integration

To log an interaction, import and invoke the `logEvent` utility from `@/lib/utils/analytics`:

```typescript
import { logEvent } from '@/lib/utils/analytics';

// Example: Tracking GitHub link click on a project card
logEvent('project_github_click', project.id);
```

### Unload Optimizations
The client utility uses `navigator.sendBeacon` if available. This ensures the request is sent asynchronously even if the user closes or navigates away from the page (e.g., clicking external GitHub redirects), falling back automatically to fetch.

---

## 4. Privacy & Anonymity Compliance
- **No Personal Identifiable Information (PII)**: Individual IP addresses are hashed using SHA-256 on the server before writing. They are never stored as plain text.
- **Debounce Window**: If the same hashed IP executes a duplicate event within a 1-hour window, the trigger or logger will drop the request to prevent metric inflating.
- **Service Secret Security**: `SUPABASE_SERVICE_ROLE_KEY` is kept server-side only in Vercel environment variables, keeping credentials isolated from client bundles.
