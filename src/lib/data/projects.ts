import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';
import { getOmnikonOrgRepos, type GitHubOrgRepo } from './github';

export interface Project {
  id: string;
  name: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  repository_url: string;
  demo_url: string | null;
  github_repo_name: string;
  tech_stack: string[];
  program_tag: string | null;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  author_id: string | null;
  reviewer_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
}

function mapGitHubRepoToProject(repo: GitHubOrgRepo): Project {
  let programTag: string | null = null;
  const lowerTopics = repo.topics.map((t) => t.toLowerCase());

  if (lowerTopics.includes('gssoc-2026') || repo.name === 'Astrodex') {
    programTag = 'GSSoC 2026';
  } else if (lowerTopics.includes('escsoc26') || lowerTopics.includes('ecsoc-2026') || repo.name === 'CNTRL') {
    programTag = 'ECSoC 2026';
  }

  const allTags = new Set<string>();
  if (repo.language) allTags.add(repo.language);
  repo.topics.forEach((t) => allTags.add(t));

  const isFeatured = ['Astrodex', 'CNTRL', 'IssuesSwipe', 'UnVibe'].includes(repo.name);

  return {
    id: `gh-${repo.id}`,
    name: repo.name,
    slug: repo.name.toLowerCase(),
    summary: repo.description,
    content_mdx: `# ${repo.name}\n\n${repo.description}\n\n### Repository Details\n- **Primary Language:** ${repo.language || 'TypeScript'}\n- **Stars:** ${repo.starsCount}\n- **Forks:** ${repo.forksCount}\n- **Open Issues:** ${repo.openIssuesCount}\n\nOfficial Repository: [GitHub Repo](${repo.htmlUrl})`,
    featured_image: null,
    repository_url: repo.htmlUrl,
    demo_url: repo.homepage,
    github_repo_name: repo.name,
    tech_stack: Array.from(allTags),
    program_tag: programTag,
    stars_count: repo.starsCount,
    forks_count: repo.forksCount,
    open_issues_count: repo.openIssuesCount,
    author_id: 'omnikon-lead',
    reviewer_id: null,
    status: 'published',
    is_featured: isFeatured,
    seo_title: `${repo.name} — Open Source Project by Omnikon`,
    seo_description: repo.description,
    og_image: null,
    canonical_url: `/projects/${repo.name.toLowerCase()}`,
    review_notes: null,
    submitted_at: repo.updatedAt,
    reviewed_at: repo.updatedAt,
    published_at: repo.updatedAt,
    created_at: repo.updatedAt,
    updated_at: repo.pushedAt,
    author: {
      id: 'omnikon-lead',
      username: 'Omnikon-Org',
      full_name: 'Omnikon Community',
      avatar_url: 'https://avatars.githubusercontent.com/u/161989417?v=4',
      bio: 'Student-powered open-source developer collective.',
      github_username: 'Omnikon-Org',
      discord_username: 'omnikon',
      website_url: 'https://github.com/Omnikon-Org',
      role: 'admin',
      developer_tier: 'maintainer',
      is_ambassador: true,
      skills: ['Open Source', 'Full Stack', 'Developer Tools'],
      technical_interests: ['Systems', 'AI', 'Web3', 'Web Dev'],
      is_public: true,
      created_at: repo.updatedAt,
      updated_at: repo.pushedAt,
    },
  };
}

export async function getPublishedProjects(options?: {
  searchQuery?: string;
  featuredOnly?: boolean;
}): Promise<Project[]> {
  let dbProjects: Project[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('projects')
      .select(`
        *,
        author:profiles!projects_author_id_fkey(id, username, full_name, avatar_url, role, developer_tier)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      query = query.textSearch('search_vector', options.searchQuery.trim(), {
        config: 'english',
        type: 'websearch',
      });
    }

    const { data } = await query;
    if (data && data.length > 0) {
      dbProjects = data as unknown as Project[];
    }
  } catch (err) {
    console.warn('Database projects fetch skipped or empty, falling back to GitHub:', err);
  }

  // Fetch live repos from Omnikon-Org
  const orgRepos = await getOmnikonOrgRepos();
  const gitHubProjects = orgRepos.map(mapGitHubRepoToProject);

  // Merge, avoiding duplicate repo names
  const existingNames = new Set(dbProjects.map((p) => p.github_repo_name.toLowerCase()));
  const mergedProjects = [...dbProjects];

  for (const ghProj of gitHubProjects) {
    if (!existingNames.has(ghProj.github_repo_name.toLowerCase())) {
      if (options?.featuredOnly && !ghProj.is_featured) {
        continue;
      }
      if (options?.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matches =
          ghProj.name.toLowerCase().includes(q) ||
          ghProj.summary.toLowerCase().includes(q) ||
          ghProj.tech_stack.some((t) => t.toLowerCase().includes(q));
        if (!matches) continue;
      }
      mergedProjects.push(ghProj);
    }
  }

  // Sort featured first, then by stars and recency
  return mergedProjects.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return b.stars_count - a.stars_count;
  });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        author:profiles!projects_author_id_fkey(id, username, full_name, avatar_url, bio, github_username, role, developer_tier)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (data) {
      return data as unknown as Project;
    }
  } catch (err) {
    console.warn(`Database single project fetch failed for ${slug}:`, err);
  }

  // Fallback to GitHub repo
  const orgRepos = await getOmnikonOrgRepos();
  const matched = orgRepos.find((r) => r.name.toLowerCase() === slug.toLowerCase());
  if (matched) {
    return mapGitHubRepoToProject(matched);
  }

  return null;
}
