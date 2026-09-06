import { createClient } from '@/lib/supabase/server';
import { getOmnikonOrgMembers, type GitHubMember } from './github';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  discord_username: string | null;
  website_url: string | null;
  role: 'member' | 'contributor' | 'editor' | 'admin';
  developer_tier: 'student' | 'learner' | 'builder' | 'contributor' | 'maintainer';
  is_ambassador: boolean;
  is_core_team?: boolean;
  is_co_founder?: boolean;
  custom_title?: string;
  skills: string[];
  technical_interests: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

function mapGitHubMemberToProfile(m: GitHubMember): Profile {
  return {
    id: `gh-user-${m.id}`,
    username: m.username,
    full_name: m.fullName || m.username,
    avatar_url: m.avatarUrl,
    bio: m.bio || `Open-source contributor across Omnikon repositories (${m.reposContributed.join(', ')}).`,
    github_username: m.username,
    discord_username: null,
    website_url: m.githubUrl,
    role: m.isCoFounder || m.role === 'maintainer' ? 'admin' : 'contributor',
    developer_tier: m.developerTier,
    is_ambassador: m.isAmbassador,
    is_core_team: !!m.isCoreTeam,
    is_co_founder: !!m.isCoFounder,
    custom_title: m.customTitle,
    skills: m.reposContributed,
    technical_interests: ['Open Source', 'TypeScript', 'Full Stack', 'Systems & Architecture'],
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getPublicProfiles(): Promise<Profile[]> {
  let dbProfiles: Profile[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, github_username, discord_username, website_url, role, developer_tier, is_ambassador, skills, technical_interests, is_public, created_at, updated_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      dbProfiles = data as Profile[];
    }
  } catch (err) {
    console.warn('Database profiles fetch empty or skipped:', err);
  }

  // Fetch real org members & contributors from GitHub
  const ghMembers = await getOmnikonOrgMembers();
  const mappedGhProfiles = ghMembers.map(mapGitHubMemberToProfile);

  // Merge, avoiding duplicate usernames
  const existingUsernames = new Set(dbProfiles.map((p) => p.username.toLowerCase()));
  const merged = [...dbProfiles];

  for (const ghP of mappedGhProfiles) {
    if (!existingUsernames.has(ghP.username.toLowerCase())) {
      merged.push(ghP);
    }
  }

  return merged;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, github_username, discord_username, website_url, role, developer_tier, is_ambassador, skills, technical_interests, is_public, created_at, updated_at')
      .eq('username', username)
      .maybeSingle();

    if (!error && data) {
      return data as Profile;
    }
  } catch (err) {
    console.warn(`Database profile fetch failed for ${username}:`, err);
  }

  // Fallback to GitHub members
  const ghMembers = await getOmnikonOrgMembers();
  const matched = ghMembers.find((m) => m.username.toLowerCase() === username.toLowerCase());
  if (matched) {
    return mapGitHubMemberToProfile(matched);
  }

  return null;
}
