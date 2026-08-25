# Omnikon 2.0 — Global Search & Content Discovery Architecture

## 1. Overview & Strategy
Omnikon 2.0 implements a unified **PostgreSQL-Powered Global Search Architecture** using Supabase native `tsvector` and `pg_trgm` full-text search capabilities. This avoids the latency, cost, and complexity of heavyweight external search engines (such as Algolia or Elasticsearch) while providing instant, relevant search results across all content types.

---

## 2. Search Scope & Weighting Hierarchy

Search covers 5 core entity domains:

| Domain | Source Table | Search Fields & Weighting | Target Route |
| :--- | :--- | :--- | :--- |
| **Articles & Tutorials** | `articles` | **Weight A**: Title <br> **Weight B**: Summary <br> **Weight C**: MDX Content | `/blogs/[slug]` |
| **Projects & Teardowns** | `projects` | **Weight A**: Project Name, Tech Stack <br> **Weight B**: Description | `/projects/[slug]` |
| **Events & Hackathons** | `events` | **Weight A**: Event Title <br> **Weight B**: Description, Status Label | `/events/[slug]` |
| **Community Members** | `profiles` | **Weight A**: Username, Full Name <br> **Weight B**: Bio, Tier | `/members/[username]` |
| **Community Updates** | `updates` | **Weight A**: Update Title <br> **Weight B**: Update Body | `/updates` |

---

## 3. PostgreSQL Search SQL Strategy

### A. Full-Text Vector Indexing (`tsvector`)
Search vectors are automatically calculated and indexed using Generalized Inverted Indexes (`GIN`):
```sql
-- Example tsvector search query across articles
SELECT 
    id, 
    title, 
    summary, 
    slug,
    ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS rank
FROM articles
WHERE 
    status = 'published' AND
    search_vector @@ websearch_to_tsquery('english', $1)
ORDER BY rank DESC
LIMIT 20;
```

### B. Unified Global Search Database Function (`search_global`)
A single PostgreSQL function executed via Supabase RPC queries all 5 domains in a single database round-trip:

```sql
CREATE OR REPLACE FUNCTION search_global(query_text TEXT)
RETURNS TABLE (
    entity_id UUID,
    entity_type TEXT,
    title TEXT,
    summary TEXT,
    slug TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT id AS entity_id, 'article' AS entity_type, articles.title, articles.summary, articles.slug,
           ts_rank(search_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM articles WHERE status = 'published' AND search_vector @@ websearch_to_tsquery('english', query_text)
    
    UNION ALL
    
    SELECT id AS entity_id, 'project' AS entity_type, projects.name AS title, projects.description AS summary, projects.slug,
           ts_rank(search_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM projects WHERE status = 'published' AND search_vector @@ websearch_to_tsquery('english', query_text)
    
    UNION ALL
    
    SELECT id AS entity_id, 'event' AS entity_type, events.title, events.description AS summary, events.slug,
           ts_rank(search_vector, websearch_to_tsquery('english', query_text)) AS rank
    FROM events WHERE status = 'published' AND search_vector @@ websearch_to_tsquery('english', query_text)
    
    ORDER BY rank DESC
    LIMIT 30;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Content Discovery & Internal Linking Infrastructure

### A. Related Content Algorithm
Single article views (`/blogs/[slug]`) dynamically surface 3 related articles based on shared category and tag overlaps:
```sql
SELECT a2.id, a2.title, a2.slug, a2.summary
FROM articles a1
JOIN article_tags at1 ON at1.article_id = a1.id
JOIN article_tags at2 ON at2.tag_id = at1.tag_id
JOIN articles a2 ON a2.id = at2.article_id
WHERE a1.id = $1 AND a2.id != $1 AND a2.status = 'published'
GROUP BY a2.id
ORDER BY COUNT(at2.tag_id) DESC
LIMIT 3;
```

### B. Taxonomies & Filter Pages
- **Category Discovery**: Dedicated URL routes (`/categories/[slug]`) indexing all articles in a specific category.
- **Tag Discovery**: Dedicated URL routes (`/tags/[slug]`) indexing cross-category articles matching specific technology tags (`nextjs`, `typescript`, `ai`, `hackathon`).

### C. Breadcrumb Navigation
Dynamic breadcrumbs rendered on all sub-pages for SEO and user orientation:
- `Home > Developer Blog > Web Development > Next.js App Router Guide`
- `Home > Projects > Astrodex`
