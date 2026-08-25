import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { env } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

const GITHUB_ORG = 'Omnikon-Org';
const CACHE_KEY = 'org_summary_metrics';
const CACHE_TTL_SECONDS = 3600; // 1 hour server cache

interface GitHubOrgStats {
  orgName: string;
  publicReposCount: number;
  totalStars: number;
  totalForks: number;
  totalOpenIssues: number;
  updatedAt: string;
  isCached: boolean;
}

export async function GET() {
  const fallbackData: GitHubOrgStats = {
    orgName: GITHUB_ORG,
    publicReposCount: 0,
    totalStars: 0,
    totalForks: 0,
    totalOpenIssues: 0,
    updatedAt: new Date().toISOString(),
    isCached: false,
  };

  try {
    // 1. Check Supabase github_cache table via Server Admin Client (if configured)
    if (env.supabaseServiceRoleKey) {
      const adminSupabase = createAdminClient();
      const { data: cacheRow } = await adminSupabase
        .from('github_cache')
        .select('data, expires_at')
        .eq('key', CACHE_KEY)
        .maybeSingle();

      if (cacheRow && cacheRow.expires_at && new Date(cacheRow.expires_at) > new Date()) {
        return NextResponse.json({
          ...(cacheRow.data as object),
          isCached: true,
        });
      }
    }

    // 2. Fetch fresh data from GitHub REST API
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Omnikon-Website-Server',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [orgRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/orgs/${GITHUB_ORG}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100`, { headers, next: { revalidate: 3600 } }),
    ]);

    if (!orgRes.ok || !reposRes.ok) {
      console.warn(`GitHub API response not ok: org=${orgRes.status}, repos=${reposRes.status}`);
      // If fresh API call fails, attempt to return stale cache if available
      return NextResponse.json(fallbackData);
    }

    const orgData = await orgRes.json();
    const reposData: Array<{ stargazers_count?: number; forks_count?: number; open_issues_count?: number }> = await reposRes.json();

    const totalStars = reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = reposData.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    const totalOpenIssues = reposData.reduce((acc, r) => acc + (r.open_issues_count || 0), 0);

    const freshStats: GitHubOrgStats = {
      orgName: orgData.login || GITHUB_ORG,
      publicReposCount: orgData.public_repos || reposData.length || 0,
      totalStars,
      totalForks,
      totalOpenIssues,
      updatedAt: new Date().toISOString(),
      isCached: false,
    };

    // 3. Upsert fresh stats into Supabase github_cache
    if (env.supabaseServiceRoleKey) {
      const adminSupabase = createAdminClient();
      const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();

      await adminSupabase.from('github_cache').upsert(
        {
          key: CACHE_KEY,
          data: freshStats as unknown as Record<string, unknown>,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
    }

    return NextResponse.json(freshStats);
  } catch (err) {
    console.error('Error fetching GitHub stats:', err);
    return NextResponse.json(fallbackData);
  }
}
