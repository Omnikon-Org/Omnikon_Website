-- Omnikon 2.0 — Initial Database Seed (Taxonomies & Redirects Only)
-- File: supabase/seed.sql
-- Description: Inserts production taxonomy categories, default technology tags, and legacy URL redirects. No fake users or placeholder content.

-- 1. TAXONOMY CATEGORIES
INSERT INTO public.categories (name, slug, description)
VALUES 
    ('Web Development', 'web-development', 'Modern web technologies, frontend frameworks, APIs, and performance optimization.'),
    ('AI & Machine Learning', 'ai-machine-learning', 'Artificial intelligence models, machine learning algorithms, and LLM integrations.'),
    ('Open Source', 'open-source', 'Open-source contribution guides, maintainer insights, and project breakdowns.'),
    ('Hackathons', 'hackathons', 'Hackathon announcements, problem statements, track guides, and winner recaps.'),
    ('Engineering Tutorials', 'tutorials', 'Step-by-step developer guides and architecture breakdowns.')
ON CONFLICT (slug) DO NOTHING;

-- 2. TECHNOLOGY TAGS
INSERT INTO public.tags (name, slug)
VALUES 
    ('Next.js', 'nextjs'),
    ('TypeScript', 'typescript'),
    ('React', 'react'),
    ('Supabase', 'supabase'),
    ('Tailwind CSS', 'tailwind-css'),
    ('Python', 'python'),
    ('GitHub', 'github'),
    ('Open Source', 'open-source'),
    ('Hackathon', 'hackathon'),
    ('AI', 'ai')
ON CONFLICT (slug) DO NOTHING;

-- 3. LEGACY URL REDIRECT PRESERVATION
INSERT INTO public.redirects (source_path, destination_path, status_code)
VALUES 
    ('/index.html', '/', 301),
    ('/blogs.html', '/blogs', 301),
    ('/projects.html', '/projects', 301),
    ('/members.html', '/members', 301),
    ('/achievements.html', '/about', 301),
    ('/ambassadors.html', '/ambassadors', 301),
    ('/docs.html', '/docs', 301),
    ('/about.html', '/about', 301),
    ('/contact.html', '/contact', 301),
    ('/privacy.html', '/privacy', 301),
    ('/terms.html', '/terms', 301)
ON CONFLICT (source_path) DO NOTHING;
