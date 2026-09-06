import { createClient } from '@/lib/supabase/server';
import type { Profile } from './profiles';

export interface EventPrize {
  place: string;
  amount: string;
  description?: string;
}

export interface EventResource {
  title: string;
  url: string;
  description?: string;
}

export interface AmbassadorLeaderboardEntry {
  rank: number;
  name: string;
  referrals: number;
  avatarUrl?: string;
  isTopThree?: boolean;
}

export interface HackathonWinner {
  place: string;
  placeNumber: 1 | 2 | 3;
  teamName: string;
  leaderName: string;
  score: string;
  badge: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  registration_url: string | null;
  status_label: string;
  author_id: string | null;
  reviewer_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  is_featured: boolean;
  location_type?: 'online' | 'in_person' | 'hybrid';
  location?: string;
  capacity?: number | null;
  registration_deadline?: string | null;
  prizes?: EventPrize[];
  rules_mdx?: string | null;
  resources?: EventResource[];
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  registrations_count?: number;
  stats?: {
    completeRegistrations: string;
    totalRegistrations: string;
    totalImpressions: string;
    ratingsAndReviews: string;
    engineeringPercentage: string;
    phase1Submissions: string;
    phase2Submissions: string;
    finalSubmissions: string;
  };
  winners?: HackathonWinner[];
  ambassadors?: AmbassadorLeaderboardEntry[];
}

export interface HackathonProblemStatement {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  description_mdx: string;
  category: string;
  difficulty: string;
  reference_links: Array<{ title: string; url: string }>;
  created_at: string;
  updated_at: string;
}

export interface EventRecap {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  summary: string;
  content_mdx: string;
  featured_image: string | null;
  winner_team_name: string | null;
  author_id: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Official Omnikon National Hackathon 2026 data with real Unstop stats, verified winners, and ambassador leaderboard
 */
export const OFFICIAL_OMNIKON_NATIONAL_HACKATHON: Event = {
  id: 'omnikon-national-hackathon-2026',
  title: 'Omnikon National Hackathon 2026',
  slug: 'omnikon-national-hackathon-2026',
  summary: 'Omnikon’s premier national hybrid hackathon on Unstop. Over 3.3K+ complete registrations, multi-phase technical evaluations, and student developer teams shipping real-world open-source software.',
  content_mdx: `# Omnikon National Hackathon 2026

The flagship open-source software engineering competition by Omnikon on Unstop. Student developers and engineering teams competed across multiple rigorous evaluation phases to design, architect, and ship high-impact production applications.

### Event Overview
- **Complete Registrations:** 3.3K (Total Registrations: 4.6K)
- **Total Impressions:** 257.1K
- **Engineering Participants:** 94.8% (4,355 Developers)
- **Phase 1 Idea Submissions:** 940 / 3.3K
- **Phase 2 Prototype / PPT Submissions:** 219 / 289
- **Final Live Submissions:** 120 / 126

Official Event Portal: [View on Unstop](https://unstop.com/hackathons/omnikon-national-hackathon-2026-omnikon-1715716)
`,
  featured_image: null,
  event_type: 'hackathon',
  start_date: '2026-08-07T00:00:00Z',
  end_date: '2026-08-14T23:59:59Z',
  registration_url: 'https://unstop.com/hackathons/omnikon-national-hackathon-2026-omnikon-1715716',
  status_label: 'Winners Declared',
  author_id: null,
  reviewer_id: null,
  status: 'published',
  is_featured: true,
  location_type: 'hybrid',
  location: 'Unstop & Omnikon Tech Arena',
  capacity: 5000,
  registration_deadline: '2026-08-14T18:29:00Z',
  prizes: [
    { place: '🥇 1st Place', amount: 'Winner Champion Trophy + Cash Grant', description: 'Awarded to Team Odysseus (Aryan Rawat + Team)' },
    { place: '🥈 2nd Place', amount: 'Runner-Up Cup + Grant', description: 'Awarded to Team Level UP (Garvit Sengar + Team)' },
    { place: '🥉 3rd Place', amount: '2nd Runner-Up Cup + Grant', description: 'Awarded to Team Veerpratapsinghnathawat11 (Veer Pratap Singh Nathawat + Team)' },
  ],
  rules_mdx: `### Hackathon Guidelines & Evaluation Criteria
1. **Originality & Engineering Depth:** Solutions evaluated on software architecture, code quality, and robustness.
2. **Multi-Phase Verification:** All finalists submitted verified demos and code repositories.
3. **Open Source Standard:** Projects licensed under permissive open-source licenses.`,
  resources: [
    { title: 'Official Opportunity on Unstop', url: 'https://unstop.com/hackathons/omnikon-national-hackathon-2026-omnikon-1715716' },
  ],
  seo_title: 'Omnikon National Hackathon 2026 — Winners & Dashboard',
  seo_description: 'Official winners, unstop metrics, and ambassador leaderboard for Omnikon National Hackathon 2026.',
  og_image: null,
  canonical_url: '/events/omnikon-national-hackathon-2026',
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-20T00:00:00Z',
  registrations_count: 3300,
  stats: {
    completeRegistrations: '3.3K',
    totalRegistrations: '4.6K',
    totalImpressions: '257.1K',
    ratingsAndReviews: '10',
    engineeringPercentage: '94.8%',
    phase1Submissions: '940',
    phase2Submissions: '219',
    finalSubmissions: '120',
  },
  winners: [
    {
      place: '🥇 1st Place',
      placeNumber: 1,
      teamName: 'Team Odysseus',
      leaderName: 'Aryan Rawat + Team',
      score: '9.600',
      badge: 'CHAMPION_GOLD',
    },
    {
      place: '🥈 2nd Place',
      placeNumber: 2,
      teamName: 'Team Level UP',
      leaderName: 'Garvit Sengar + Team',
      score: '9.580',
      badge: 'RUNNER_UP_SILVER',
    },
    {
      place: '🥉 3rd Place',
      placeNumber: 3,
      teamName: 'Team Veerpratapsinghnathawat11',
      leaderName: 'Veer Pratap Singh Nathawat + Team',
      score: '9.350',
      badge: 'SECOND_RUNNER_UP_BRONZE',
    },
  ],
  ambassadors: [
    { rank: 1, name: 'Harsh', referrals: 112, isTopThree: true },
    { rank: 2, name: 'Srija Pathrala', referrals: 88, isTopThree: true },
    { rank: 3, name: 'Meenal Pandey', referrals: 73, isTopThree: true },
    { rank: 4, name: 'Mohit Agarwal', referrals: 52 },
    { rank: 5, name: 'Anchal Yadav', referrals: 35 },
    { rank: 6, name: 'Vedant Singh', referrals: 30 },
    { rank: 7, name: 'Rahul Pagadala', referrals: 25 },
    { rank: 8, name: 'Debraj Pal', referrals: 21 },
    { rank: 9, name: 'Pytech', referrals: 4 },
    { rank: 10, name: 'Varun ND', referrals: 2 },
    { rank: 11, name: 'Rajesh Satthuri', referrals: 2 },
  ],
};

export async function getPublishedEvents(): Promise<Event[]> {
  let dbEvents: Event[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, role),
        event_registrations(count)
      `)
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (!error && data) {
      dbEvents = data.map((ev: any) => ({
        ...ev,
        registrations_count: ev.event_registrations?.[0]?.count || 0,
      })) as Event[];
    }
  } catch (err) {
    console.warn('Failed to fetch events from DB:', err);
  }

  // Replace or merge with official national hackathon
  const filteredDbEvents = dbEvents.filter(
    (e) => e.slug !== 'omnikon-hackathon-2026' && e.slug !== 'omnikon-national-hackathon-2026'
  );

  return [OFFICIAL_OMNIKON_NATIONAL_HACKATHON, ...filteredDbEvents];
}

export async function getFilteredEvents(
  eventType?: string,
  timeStatus: 'all' | 'active' | 'upcoming' | 'past' = 'all'
): Promise<Event[]> {
  const allEvents = await getPublishedEvents();
  const now = new Date();

  return allEvents.filter((ev) => {
    // Type filter
    if (eventType && eventType !== 'ALL') {
      const normalizedType = ev.event_type.toLowerCase();
      const target = eventType.toLowerCase();
      if (!normalizedType.includes(target) && !target.includes(normalizedType)) {
        return false;
      }
    }

    // Special handling for the completed national hackathon
    if (ev.slug === 'omnikon-national-hackathon-2026') {
      if (timeStatus === 'past' || timeStatus === 'all') return true;
      return false;
    }

    const startDate = new Date(ev.start_date);
    const endDate = new Date(ev.end_date);

    if (timeStatus === 'active') {
      return startDate <= now && endDate >= now;
    }
    if (timeStatus === 'upcoming') {
      return startDate > now;
    }
    if (timeStatus === 'past') {
      return endDate < now;
    }

    return true;
  });
}

export async function getUpcomingAndActiveEvents(limit = 6): Promise<Event[]> {
  const allEvents = await getPublishedEvents();
  const now = new Date();

  return allEvents
    .filter((ev) => new Date(ev.end_date) >= now)
    .slice(0, limit);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (
    slug === 'omnikon-national-hackathon-2026' ||
    slug === 'omnikon-hackathon-2026'
  ) {
    return OFFICIAL_OMNIKON_NATIONAL_HACKATHON;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        author:profiles!events_author_id_fkey(id, username, full_name, avatar_url, bio, role),
        event_registrations(count)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch event ${slug}:`, error.message);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      registrations_count: data.event_registrations?.[0]?.count || 0,
    } as unknown as Event;
  } catch (err) {
    console.error(`Unexpected error fetching event ${slug}:`, err);
    return null;
  }
}

export async function getHackathonProblemStatements(eventId: string): Promise<HackathonProblemStatement[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('hackathon_problem_statements')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Failed to fetch problem statements for event ${eventId}:`, error.message);
      return [];
    }

    return (data || []) as unknown as HackathonProblemStatement[];
  } catch (err) {
    console.error('Unexpected error fetching problem statements:', err);
    return [];
  }
}

export async function getEventRecaps(eventId?: string): Promise<EventRecap[]> {
  const nationalRecap: EventRecap = {
    id: 'recap-national-hackathon-2026',
    event_id: 'omnikon-national-hackathon-2026',
    title: 'Omnikon National Hackathon 2026 Concludes with 3.3K+ Registrations',
    slug: 'omnikon-national-hackathon-2026-recap',
    summary: 'Team Odysseus clinches 1st Place with 9.600 score, followed by Team Level UP (9.580) and Team Veerpratapsinghnathawat11 (9.350).',
    content_mdx: 'Detailed recaps and code reviews of the top 3 projects from the national finals.',
    featured_image: null,
    winner_team_name: 'Team Odysseus (Aryan Rawat + Team)',
    author_id: null,
    status: 'published',
    published_at: '2026-08-16T12:00:00Z',
    created_at: '2026-08-16T12:00:00Z',
    updated_at: '2026-08-16T12:00:00Z',
  };

  try {
    const supabase = await createClient();
    let query = supabase
      .from('event_recaps')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data } = await query;
    const dbRecaps = (data || []) as unknown as EventRecap[];

    if (!eventId || eventId === 'omnikon-national-hackathon-2026') {
      return [nationalRecap, ...dbRecaps.filter((r) => r.slug !== nationalRecap.slug)];
    }

    return dbRecaps;
  } catch (err) {
    console.error('Unexpected error fetching event recaps:', err);
    return [nationalRecap];
  }
}
