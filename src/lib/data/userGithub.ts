import { getGitHubHeaders, getCachedGitHubData, setCachedGitHubData } from './github';

export interface UserGitHubData {
  username: string;
  name: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  bio: string | null;
  htmlUrl: string;
  created_at: string;
  repos: {
    id: number;
    name: string;
    description: string | null;
    htmlUrl: string;
    stargazersCount: number;
    language: string | null;
    fork: boolean;
  }[];
  recentEvents: {
    id: string;
    type: string;
    repoName: string;
    created_at: string;
  }[];
}

export async function fetchUserGitHubData(accessToken?: string, username?: string): Promise<UserGitHubData | null> {
  const token = accessToken || process.env.GITHUB_TOKEN;
  if (!token && !username) {
    return null;
  }

  const cacheKey = `user_gh_data_${username || 'oauth_user'}`;
  const cached = await getCachedGitHubData<UserGitHubData>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Omnikon-Website-Server',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else if (process.env.GITHUB_TOKEN) {
      const cleanToken = process.env.GITHUB_TOKEN.replace(/^["']|["']$/g, '').trim();
      headers.Authorization = `Bearer ${cleanToken}`;
    }

    const userUrl = username 
      ? `https://api.github.com/users/${username}`
      : 'https://api.github.com/user';

    const userRes = await fetch(userUrl, { headers, next: { revalidate: 600 } });
    if (!userRes.ok) {
      console.warn(`Failed to fetch GitHub user info: ${userRes.status}`);
      return null;
    }

    const u = await userRes.json();

    const reposUrl = u.repos_url || `https://api.github.com/users/${u.login}/repos?sort=updated&per_page=6`;
    const reposRes = await fetch(`${reposUrl}?sort=updated&per_page=6`, { headers, next: { revalidate: 600 } });
    const reposData = reposRes.ok ? await reposRes.json() : [];

    const eventsUrl = `https://api.github.com/users/${u.login}/events?per_page=10`;
    const eventsRes = await fetch(eventsUrl, { headers, next: { revalidate: 300 } });
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    const formattedData: UserGitHubData = {
      username: u.login,
      name: u.name || u.login,
      avatarUrl: u.avatar_url,
      publicRepos: u.public_repos || 0,
      followers: u.followers || 0,
      following: u.following || 0,
      bio: u.bio || null,
      htmlUrl: u.html_url,
      created_at: u.created_at,
      repos: Array.isArray(reposData)
        ? reposData.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            htmlUrl: r.html_url,
            stargazersCount: r.stargazers_count || 0,
            language: r.language,
            fork: r.fork || false,
          }))
        : [],
      recentEvents: Array.isArray(eventsData)
        ? eventsData.map((e: any) => ({
            id: String(e.id),
            type: e.type,
            repoName: e.repo?.name || '',
            created_at: e.created_at,
          }))
        : [],
    };

    await setCachedGitHubData(cacheKey, formattedData, 600);
    return formattedData;
  } catch (err) {
    console.error('Error fetching user GitHub data:', err);
    return null;
  }
}
