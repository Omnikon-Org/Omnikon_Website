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

export async function getCachedGitHubData(key: string): Promise<Record<string, unknown> | null> {
  // If service role key is unconfigured, return null safely
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

    if (error) {
      console.error(`Failed to read github_cache for key ${key}:`, error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return data.data;
  } catch (err) {
    console.error(`Unexpected error reading github_cache for key ${key}:`, err);
    return null;
  }
}

export async function getGithubIssuesForRepo(repoName: string): Promise<GitHubIssue[]> {
  const cacheKey = `repo_issues_${repoName}`;
  const cacheTtlSeconds = 3600; // 1 hour

  // 1. Try reading cache
  if (env.supabaseServiceRoleKey) {
    try {
      const adminSupabase = createAdminClient();
      const { data: cacheRow } = await adminSupabase
        .from('github_cache')
        .select('data, expires_at')
        .eq('key', cacheKey)
        .maybeSingle();

      if (cacheRow && cacheRow.expires_at && new Date(cacheRow.expires_at) > new Date()) {
        return cacheRow.data as unknown as GitHubIssue[];
      }
    } catch (err) {
      console.warn(`Cache read failed for issues of ${repoName}:`, err);
    }
  }

  // 2. Fetch fresh issues from GitHub
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Omnikon-Website-Server',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/Omnikon-Org/${repoName}/issues?labels=good%20first%20issue&state=open&per_page=10`,
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
      labels: iss.labels.map((l: any) => l.name),
      commentsCount: iss.comments,
      createdAt: iss.created_at,
    }));

    // 3. Cache fresh issues
    if (env.supabaseServiceRoleKey) {
      try {
        const adminSupabase = createAdminClient();
        const expiresAt = new Date(Date.now() + cacheTtlSeconds * 1000).toISOString();
        await adminSupabase.from('github_cache').upsert(
          {
            key: cacheKey,
            data: issues as unknown as Record<string, unknown>,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (err) {
        console.warn(`Cache write failed for issues of ${repoName}:`, err);
      }
    }

    return issues;
  } catch (err) {
    console.error(`Unexpected error fetching GitHub issues for ${repoName}:`, err);
    return [];
  }
}

