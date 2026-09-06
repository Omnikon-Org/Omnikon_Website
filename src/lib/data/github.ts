import { createAdminClient } from '@/lib/supabase/server';
import { env } from '@/lib/supabase/env';

export interface GitHubCacheItem {
  key: string;
  data: Record<string, unknown>;
  etag: string | null;
  last_modified: string | null;
  expires_at: string;
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  title: string;
  repoName: string;
  url: string;
  labels: string[];
  commentsCount: number;
  createdAt: string;
}

export interface GitHubOrgRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  homepage: string | null;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  pushedAt: string;
}

export interface GitHubMember {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  githubUrl: string;
  role: 'maintainer' | 'builder' | 'contributor' | 'learner' | 'student';
  developerTier: 'maintainer' | 'contributor' | 'builder' | 'learner' | 'student';
  isAmbassador: boolean;
  isCoreTeam?: boolean;
  isCoFounder?: boolean;
  customTitle?: string;
  contributionsCount: number;
  reposContributed: string[];
  bio: string | null;
}

export interface GitHubLiveEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatarUrl: string;
    url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  action: string;
  title: string;
  targetUrl: string;
  createdAt: string;
}

/**
 * Returns clean GitHub API headers with authorization if token is available.
 * Handles single or double quotes around token gracefully.
 */
export function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Omnikon-Website-Server',
  };

  const rawToken = process.env.GITHUB_TOKEN || '';
  const token = rawToken.replace(/^["']|["']$/g, '').trim();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getCachedGitHubData<T>(key: string): Promise<T | null> {
  if (!env.supabaseServiceRoleKey) {
    return null;
  }

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('github_cache')
      .select('data, expires_at')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    if (data.expires_at && new Date(data.expires_at) > new Date()) {
      return data.data as T;
    }

    return null;
  } catch (err) {
    console.error(`Unexpected error reading github_cache for key ${key}:`, err);
    return null;
  }
}

export async function setCachedGitHubData(key: string, data: unknown, ttlSeconds = 1800): Promise<void> {
  if (!env.supabaseServiceRoleKey) {
    return;
  }

  try {
    const adminSupabase = createAdminClient();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await adminSupabase.from('github_cache').upsert(
      {
        key,
        data: data as unknown as Record<string, unknown>,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.warn(`Cache write failed for key ${key}:`, err);
  }
}

/**
 * Fetch all repositories for Omnikon-Org directly with live stars, forks, and topic labels.
 */
export async function getOmnikonOrgRepos(): Promise<GitHubOrgRepo[]> {
  const cacheKey = 'omnikon_org_repos_v2';
  const cached = await getCachedGitHubData<GitHubOrgRepo[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const headers = getGitHubHeaders();
    const response = await fetch('https://api.github.com/orgs/Omnikon-Org/repos?per_page=100&type=all&sort=pushed', {
      headers,
      next: { revalidate: 900 }, // 15 min edge cache
    });

    if (!response.ok) {
      console.warn(`Failed to fetch repos from GitHub: ${response.status}`);
      return [];
    }

    const reposData = await response.json();
    if (!Array.isArray(reposData)) {
      return [];
    }

    // Filter out .github dotfiles repo
    const validRepos = reposData.filter((r: any) => r.name !== '.github');

    const repos: GitHubOrgRepo[] = validRepos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description || 'Omnikon open-source developer project and tools repository.',
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      starsCount: r.stargazers_count || 0,
      forksCount: r.forks_count || 0,
      openIssuesCount: r.open_issues_count || 0,
      language: r.language || 'TypeScript',
      topics: Array.isArray(r.topics) ? r.topics : [],
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
    }));

    await setCachedGitHubData(cacheKey, repos, 900);
    return repos;
  } catch (err) {
    console.error('Error fetching Omnikon-Org repositories:', err);
    return [];
  }
}

/**
 * Fetch members and active open-source contributors across Omnikon-Org repositories.
 */
export const CORE_TEAM_CONFIG: Record<
  string,
  {
    fullName: string;
    isCoFounder: boolean;
    isMaintainer: boolean;
    title: string;
    bio?: string;
    avatarUrl?: string;
  }
> = {
  rishibyte: {
    fullName: 'Rishi Bhardwaj',
    isCoFounder: true,
    isMaintainer: false,
    title: 'Co-Founder · Core Team',
    bio: 'Omnikon Co-Founder · Web Dev & Systems · Open Source Contributor',
  },
  pranav00076: {
    fullName: 'Pranav Thawait',
    isCoFounder: true,
    isMaintainer: false,
    title: 'Co-Founder · Core Team',
    bio: 'Omnikon Co-Founder · Full Stack Engineer & Community Lead',
  },
  'yuvraj-sarathe': {
    fullName: 'Yuvraj Sarathe',
    isCoFounder: true,
    isMaintainer: false,
    title: 'Co-Founder · Core Team',
    bio: 'Omnikon Co-Founder · Production Software Engineer · Core Team',
  },
  wombatfreak6: {
    fullName: 'Wombatfreak6',
    isCoFounder: true,
    isMaintainer: false,
    title: 'Co-Founder · Core Team',
    bio: 'Omnikon Co-Founder · Core Systems & Open Source Architect',
  },
  sharanyobanerjee: {
    fullName: 'Sharanyo Banerjee',
    isCoFounder: true,
    isMaintainer: false,
    title: 'Co-Founder · Core Team',
    bio: 'Omnikon Co-Founder · Open Source Builder & Core Team',
  },
  shantanusongirkar: {
    fullName: 'Shantanu Songirkar',
    isCoFounder: false,
    isMaintainer: true,
    title: 'Core Maintainer',
    bio: 'Omnikon Core Maintainer · Open Source Engineer',
  },
  'azmolwasimhussain-ops': {
    fullName: 'Azmol Wasim Hussain',
    isCoFounder: false,
    isMaintainer: true,
    title: 'Core Maintainer',
    bio: 'Omnikon Core Maintainer · Frontend Engineer · Building Fast & Accessible UIs',
  },
  sourabhx16: {
    fullName: 'Sourabh Patne',
    isCoFounder: false,
    isMaintainer: true,
    title: 'Core Maintainer',
    bio: 'Omnikon Core Maintainer · Core Repository Governance & Contributor Lead',
  },
  prernaanand: {
    fullName: 'Prerna Anand',
    isCoFounder: false,
    isMaintainer: true,
    title: 'Core Maintainer',
    bio: 'Omnikon Core Maintainer · Engineering Programs & Ecosystem Contributor',
  },
};

/**
 * Fetch members and active open-source contributors across Omnikon-Org repositories.
 */
export async function getOmnikonOrgMembers(): Promise<GitHubMember[]> {
  const cacheKey = 'omnikon_org_members_v3';
  const cached = await getCachedGitHubData<GitHubMember[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const headers = getGitHubHeaders();
    const membersMap = new Map<string, GitHubMember>();

    // 1. Fetch Official Org Members
    const orgRes = await fetch('https://api.github.com/orgs/Omnikon-Org/members?per_page=100', {
      headers,
      next: { revalidate: 1800 },
    });

    if (orgRes.ok) {
      const orgMembers = await orgRes.json();
      if (Array.isArray(orgMembers)) {
        for (const m of orgMembers) {
          membersMap.set(m.login.toLowerCase(), {
            id: String(m.id),
            username: m.login,
            fullName: m.login,
            avatarUrl: m.avatar_url,
            githubUrl: m.html_url,
            role: 'maintainer',
            developerTier: 'maintainer',
            isAmbassador: true,
            contributionsCount: 100,
            reposContributed: ['Omnikon-Org Core'],
            bio: 'Omnikon Organization Core Maintainer & Lead',
          });
        }
      }
    }

    // 2. Fetch Contributors across top active repositories
    const topRepos = [
      'Astrodex',
      'CNTRL',
      'UnVibe',
      'SyncCanvas',
      'IssuesSwipe',
      'PackVault',
      'Website',
      'Vantra',
      'schema-cast',
    ];

    for (const repoName of topRepos) {
      try {
        const cRes = await fetch(`https://api.github.com/repos/Omnikon-Org/${repoName}/contributors?per_page=30`, {
          headers,
          next: { revalidate: 1800 },
        });

        if (cRes.ok) {
          const contribs = await cRes.json();
          if (Array.isArray(contribs)) {
            for (const c of contribs) {
              if (c.type !== 'User') continue;
              const key = c.login.toLowerCase();
              const existing = membersMap.get(key);

              if (existing) {
                existing.contributionsCount += c.contributions;
                if (!existing.reposContributed.includes(repoName)) {
                  existing.reposContributed.push(repoName);
                }
              } else {
                let tier: GitHubMember['developerTier'] = 'contributor';
                let role: GitHubMember['role'] = 'contributor';

                if (c.contributions >= 50) {
                  tier = 'builder';
                  role = 'builder';
                } else if (c.contributions <= 2) {
                  tier = 'learner';
                  role = 'learner';
                }

                membersMap.set(key, {
                  id: String(c.id),
                  username: c.login,
                  fullName: c.login,
                  avatarUrl: c.avatar_url,
                  githubUrl: c.html_url,
                  role,
                  developerTier: tier,
                  isAmbassador: false,
                  contributionsCount: c.contributions,
                  reposContributed: [repoName],
                  bio: `Active contributor to ${repoName} in the Omnikon open-source ecosystem.`,
                });
              }
            }
          }
        }
      } catch (repoErr) {
        console.warn(`Failed to fetch contributors for ${repoName}:`, repoErr);
      }
    }

    // 3. Ensure all Core Team members (Co-Founders & Maintainers) are present & correctly configured
    for (const [key, coreConfig] of Object.entries(CORE_TEAM_CONFIG)) {
      const existing = membersMap.get(key);
      if (existing) {
        existing.fullName = coreConfig.fullName;
        existing.isCoreTeam = true;
        existing.isCoFounder = coreConfig.isCoFounder;
        existing.customTitle = coreConfig.title;
        existing.role = 'maintainer';
        existing.developerTier = 'maintainer';
        existing.isAmbassador = true;
        if (coreConfig.bio) existing.bio = coreConfig.bio;
      } else {
        // Fetch user from GitHub if not in contributor list yet
        try {
          const uRes = await fetch(`https://api.github.com/users/${key}`, { headers });
          if (uRes.ok) {
            const uData = await uRes.json();
            membersMap.set(key, {
              id: String(uData.id),
              username: uData.login,
              fullName: coreConfig.fullName,
              avatarUrl: uData.avatar_url,
              githubUrl: uData.html_url,
              role: 'maintainer',
              developerTier: 'maintainer',
              isAmbassador: true,
              isCoreTeam: true,
              isCoFounder: coreConfig.isCoFounder,
              customTitle: coreConfig.title,
              contributionsCount: 50,
              reposContributed: ['Omnikon-Org Core'],
              bio: coreConfig.bio || uData.bio || 'Omnikon Core Team Member',
            });
          }
        } catch (uErr) {
          console.warn(`Could not fetch GitHub user for core team member ${key}:`, uErr);
        }
      }
    }

    // Sort order: Co-Founders first, then Maintainers (Core Team), then other contributors by contributions count
    const coFoundersOrder = ['rishibyte', 'pranav00076', 'yuvraj-sarathe', 'wombatfreak6', 'sharanyobanerjee'];
    const maintainersOrder = ['shantanusongirkar', 'azmolwasimhussain-ops', 'sourabhx16', 'prernaanand'];

    const members = Array.from(membersMap.values()).sort((a, b) => {
      const aKey = a.username.toLowerCase();
      const bKey = b.username.toLowerCase();

      const aCoFounderIdx = coFoundersOrder.indexOf(aKey);
      const bCoFounderIdx = coFoundersOrder.indexOf(bKey);
      if (aCoFounderIdx !== -1 && bCoFounderIdx !== -1) return aCoFounderIdx - bCoFounderIdx;
      if (aCoFounderIdx !== -1) return -1;
      if (bCoFounderIdx !== -1) return 1;

      const aMaintIdx = maintainersOrder.indexOf(aKey);
      const bMaintIdx = maintainersOrder.indexOf(bKey);
      if (aMaintIdx !== -1 && bMaintIdx !== -1) return aMaintIdx - bMaintIdx;
      if (aMaintIdx !== -1) return -1;
      if (bMaintIdx !== -1) return 1;

      return b.contributionsCount - a.contributionsCount;
    });

    await setCachedGitHubData(cacheKey, members, 1800);
    return members;
  } catch (err) {
    console.error('Error fetching Omnikon-Org members:', err);
    return [];
  }
}

/**
 * Fetch live events (commits, PRs, comments, stars) across Omnikon-Org.
 */
export async function getOmnikonLiveEvents(): Promise<GitHubLiveEvent[]> {
  const cacheKey = 'omnikon_org_live_events_v2';
  const cached = await getCachedGitHubData<GitHubLiveEvent[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const headers = getGitHubHeaders();
    const res = await fetch('https://api.github.com/orgs/Omnikon-Org/events?per_page=50', {
      headers,
      next: { revalidate: 120 }, // 2 minute cache for live activity
    });

    if (!res.ok) {
      console.warn(`Failed to fetch events from GitHub: ${res.status}`);
      return [];
    }

    const eventsData = await res.json();
    if (!Array.isArray(eventsData)) {
      return [];
    }

    const parsedEvents: GitHubLiveEvent[] = [];

    for (const e of eventsData) {
      let title = '';
      let targetUrl = `https://github.com/${e.repo?.name || 'Omnikon-Org'}`;

      switch (e.type) {
        case 'PushEvent': {
          const commits = e.payload?.commits || [];
          const commitMsg = commits[0]?.message?.split('\n')[0] || 'Code updates and improvements';
          const branch = e.payload?.ref ? e.payload.ref.replace('refs/heads/', '') : 'main';
          title = `Pushed ${commits.length || 1} commit(s) to ${branch}: "${commitMsg}"`;
          if (commits[0]?.sha) {
            targetUrl = `https://github.com/${e.repo.name}/commit/${commits[0].sha}`;
          }
          break;
        }
        case 'PullRequestEvent': {
          const pr = e.payload?.pull_request;
          const prAction = e.payload?.action || 'updated';
          title = `${prAction.toUpperCase()} PR #${e.payload?.number || pr?.number || ''}: ${pr?.title || 'Open source contribution'}`;
          targetUrl = pr?.html_url || targetUrl;
          break;
        }
        case 'IssueCommentEvent': {
          const issue = e.payload?.issue;
          title = `Commented on issue #${issue?.number || ''}: ${issue?.title || 'Discussion'}`;
          targetUrl = e.payload?.comment?.html_url || issue?.html_url || targetUrl;
          break;
        }
        case 'IssuesEvent': {
          const issue = e.payload?.issue;
          const issueAction = e.payload?.action || 'updated';
          title = `${issueAction.toUpperCase()} issue #${issue?.number || ''}: ${issue?.title || 'Task'}`;
          targetUrl = issue?.html_url || targetUrl;
          break;
        }
        case 'WatchEvent': {
          title = `Starred repository ${e.repo.name.replace('Omnikon-Org/', '')}`;
          break;
        }
        case 'ForkEvent': {
          title = `Forked repository ${e.repo.name.replace('Omnikon-Org/', '')}`;
          break;
        }
        case 'CreateEvent': {
          const refType = e.payload?.ref_type || 'branch';
          title = `Created ${refType} ${e.payload?.ref ? `"${e.payload.ref}"` : ''} on ${e.repo.name.replace('Omnikon-Org/', '')}`;
          break;
        }
        case 'ReleaseEvent': {
          title = `Published release ${e.payload?.release?.tag_name || ''}: ${e.payload?.release?.name || 'New release'}`;
          targetUrl = e.payload?.release?.html_url || targetUrl;
          break;
        }
        default: {
          title = `Activity on ${e.repo.name.replace('Omnikon-Org/', '')}`;
        }
      }

      parsedEvents.push({
        id: String(e.id),
        type: e.type,
        actor: {
          login: e.actor?.login || 'Omnikon Builder',
          avatarUrl: e.actor?.avatar_url || 'https://github.com/ghost.png',
          url: `https://github.com/${e.actor?.login || ''}`,
        },
        repo: {
          name: e.repo?.name || 'Omnikon-Org',
          url: `https://github.com/${e.repo?.name || ''}`,
        },
        action: e.payload?.action || e.type,
        title,
        targetUrl,
        createdAt: e.created_at,
      });
    }

    await setCachedGitHubData(cacheKey, parsedEvents, 120);
    return parsedEvents;
  } catch (err) {
    console.error('Error fetching live GitHub events:', err);
    return [];
  }
}

export async function getGithubIssuesForRepo(
  repoName: string,
  labels: string[] = ['good first issue', 'help wanted']
): Promise<GitHubIssue[]> {
  const cacheKey = `repo_issues_${repoName}`;
  const cached = await getCachedGitHubData<GitHubIssue[]>(cacheKey);
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  try {
    const headers = getGitHubHeaders();
    const labelParam = encodeURIComponent(labels.join(','));
    const response = await fetch(
      `https://api.github.com/repos/Omnikon-Org/${repoName}/issues?labels=${labelParam}&state=open&per_page=10`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch issues from GitHub for ${repoName}: ${response.status}`);
      return [];
    }

    const issuesData = await response.json();
    if (!Array.isArray(issuesData)) {
      return [];
    }

    const issues: GitHubIssue[] = issuesData.map((iss: any) => ({
      id: iss.number,
      title: iss.title,
      repoName,
      url: iss.html_url,
      labels: Array.isArray(iss.labels) ? iss.labels.map((l: any) => (typeof l === 'string' ? l : l.name)) : [],
      commentsCount: iss.comments || 0,
      createdAt: iss.created_at,
    }));

    await setCachedGitHubData(cacheKey, issues, 3600);
    return issues;
  } catch (err) {
    console.error(`Unexpected error fetching GitHub issues for ${repoName}:`, err);
    return [];
  }
}
