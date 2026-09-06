import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';
import { getOmnikonLiveEvents, type GitHubLiveEvent } from './github';

export interface Contribution {
  id: string;
  user_id: string;
  project_id: string | null;
  event_id: string | null;
  type: 'github_pr' | 'issue_contribution' | 'article_submission' | 'event_registration' | 'hackathon_participation' | 'community_milestone' | string;
  title: string;
  description: string | null;
  external_url: string | null;
  metadata: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  user?: Partial<Profile> | null;
  project?: { id: string; name: string; slug: string } | null;
  event?: { id: string; title: string; slug: string } | null;
}

function mapGitHubEventToContribution(e: GitHubLiveEvent): Contribution {
  let contributionType = 'community_milestone';
  if (e.type === 'PullRequestEvent') {
    contributionType = 'github_pr';
  } else if (e.type === 'PushEvent') {
    contributionType = 'github_pr';
  } else if (e.type === 'IssuesEvent' || e.type === 'IssueCommentEvent') {
    contributionType = 'issue_contribution';
  } else if (e.type === 'WatchEvent') {
    contributionType = 'community_milestone';
  }

  const repoShortName = e.repo.name.replace('Omnikon-Org/', '');

  return {
    id: `gh-evt-${e.id}`,
    user_id: `gh-${e.actor.login}`,
    project_id: null,
    event_id: null,
    type: contributionType,
    title: e.title,
    description: `@${e.actor.login} on repository ${repoShortName}`,
    external_url: e.targetUrl,
    metadata: {
      action: e.action,
      repo: e.repo.name,
      actor: e.actor.login,
      avatarUrl: e.actor.avatarUrl,
    },
    is_public: true,
    created_at: e.createdAt,
    user: {
      username: e.actor.login,
      full_name: e.actor.login,
      avatar_url: e.actor.avatarUrl,
      role: 'contributor',
      developer_tier: 'contributor',
      github_username: e.actor.login,
    },
    project: {
      id: repoShortName,
      name: repoShortName,
      slug: repoShortName.toLowerCase(),
    },
    event: null,
  };
}

export async function getUserContributions(userId: string): Promise<Contribution[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        project:projects(id, name, slug),
        event:events(id, title, slug)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Contribution[];
    }
  } catch (err) {
    console.error(`Failed to fetch user contributions for ${userId}:`, err);
  }

  return [];
}

export async function getPublicContributions(limit = 30): Promise<Contribution[]> {
  let dbContributions: Contribution[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        *,
        user:profiles(id, username, full_name, avatar_url, role, developer_tier),
        project:projects(id, name, slug),
        event:events(id, title, slug)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      dbContributions = data as Contribution[];
    }
  } catch (err) {
    console.warn('Database public contributions fetch empty or skipped:', err);
  }

  // Fetch live events from GitHub
  const ghEvents = await getOmnikonLiveEvents();
  const mappedGhContributions = ghEvents.map(mapGitHubEventToContribution);

  const merged = [...dbContributions, ...mappedGhContributions];

  // Sort by latest created_at
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return merged.slice(0, limit);
}

export async function recordContribution(payload: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  projectId?: string;
  eventId?: string;
  externalUrl?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
}): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('contributions').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      description: payload.description || null,
      project_id: payload.projectId || null,
      event_id: payload.eventId || null,
      external_url: payload.externalUrl || null,
      metadata: payload.metadata || {},
      is_public: payload.isPublic ?? true,
    });

    if (error) {
      console.error('Failed to record contribution:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error recording contribution:', err);
    return false;
  }
}
