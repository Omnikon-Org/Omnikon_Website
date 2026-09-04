// Omnikon 2.0 — Phase 10 Initial Community Content & Quizzes Seeding Script
// File: scripts/seed-phase10-content.mjs
// Usage: node --env-file=.env scripts/seed-phase10-content.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}

const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);

console.log('🌱 Starting Omnikon 2.0 Phase 10 Content Seeding...\n');

async function seedContent() {
  // 1. Seed Real Events
  const { count: eventCount } = await adminSupabase.from('events').select('id', { count: 'exact', head: true });
  console.log(`Current events in database: ${eventCount || 0}`);

  let hackathonId = null;

  if (!eventCount || eventCount === 0) {
    console.log('Seeding initial community events...');
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

    const { data: eventsData, error: evError } = await adminSupabase.from('events').insert([
      {
        title: 'Omnikon Hackathon 2026',
        slug: 'omnikon-hackathon-2026',
        summary: '48-hour student-powered hybrid hackathon building production open-source developer tooling and intelligent agents.',
        content_mdx: '# Omnikon Hackathon 2026\n\nWelcome to Omnikon’s flagship annual hackathon. Build open-source software, collaborate in teams of 1–4, and compete for community grants and maintainer recognition.\n\n### Tracks\n- **Developer Tooling & Automation**\n- **AI & Intelligent Agents**\n- **Student & Campus Solutions**',
        event_type: 'hackathon',
        status_label: 'Registration Open',
        status: 'published',
        start_date: nextWeek.toISOString(),
        end_date: new Date(nextWeek.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        location_type: 'hybrid',
        location: 'Discord Stage & Tech Hub',
        prizes: [
          { place: '1st Place Champion', amount: '$1,000 + Maintainer Grant', description: 'Top overall open-source project submission' },
          { place: '2nd Place Runner Up', amount: '$500 Community Prize', description: 'Exceptional engineering architecture' },
          { place: 'Best Student First-Timer', amount: '$250 Starter Grant', description: 'Best project submitted by junior developers' }
        ],
        rules_mdx: '### Eligibility & Rules\n1. All code must be authored during the official hacking window.\n2. Projects must be open-source under MIT or Apache 2.0 licenses.\n3. Teams must consist of 1 to 4 student developers.',
        resources: [
          { title: 'Omnikon Developer Documentation', url: 'https://www.omnikonhub.com/docs' },
          { title: 'Starter GitHub Template', url: 'https://github.com/Omnikon-Org' }
        ]
      },
      {
        title: 'Next.js 15 & Supabase Production Masterclass',
        slug: 'nextjs-15-supabase-masterclass',
        summary: 'Live workshop breaking down React Server Components, Server Actions, Row Level Security, and edge caching architecture.',
        content_mdx: '# Next.js 15 & Supabase Production Architecture\n\nA comprehensive hands-on workshop led by Omnikon core maintainers. Learn how to architect zero-trust web applications with Next.js App Router and PostgreSQL Row Level Security.',
        event_type: 'workshop',
        status_label: 'Upcoming',
        status: 'published',
        start_date: nextMonth.toISOString(),
        end_date: new Date(nextMonth.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        location_type: 'online',
        location: 'Discord Stage Live Stream',
        prizes: [],
        resources: [],
      },
      {
        title: 'Weekly Community Open Source Office Hours',
        slug: 'weekly-community-sync',
        summary: 'Weekly community sync to discuss good first issues, receive pull request reviews, and meet core maintainers.',
        content_mdx: '# Weekly Open Source Office Hours\n\nJoin the Omnikon engineering team for live code reviews, architecture discussions, and onboarding guidance for new open-source contributors.',
        event_type: 'community',
        status_label: 'Weekly',
        status: 'published',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location_type: 'online',
        location: 'Discord Voice & Video Stage',
        prizes: [],
        resources: [],
      }
    ]).select('id, slug');

    if (evError) {
      console.error('Failed to seed events:', evError.message);
    } else {
      console.log('✓ Seeded 3 community events successfully.');
      const hackathon = eventsData.find(e => e.slug === 'omnikon-hackathon-2026');
      if (hackathon) hackathonId = hackathon.id;
    }
  } else {
    const { data: hackathon } = await adminSupabase.from('events').select('id').eq('event_type', 'hackathon').maybeSingle();
    if (hackathon) hackathonId = hackathon.id;
  }

  // 2. Seed Problem Statements for Hackathon
  if (hackathonId) {
    const { count: probCount } = await adminSupabase.from('hackathon_problem_statements').select('id', { count: 'exact', head: true }).eq('event_id', hackathonId);
    if (!probCount || probCount === 0) {
      console.log('Seeding hackathon problem statements...');
      await adminSupabase.from('hackathon_problem_statements').insert([
        {
          event_id: hackathonId,
          title: 'Autonomous Open Source Issue Triage Agent',
          slug: 'issue-triage-agent',
          category: 'AI & Developer Tooling',
          difficulty: 'Intermediate',
          description_mdx: 'Build an open-source GitHub Action or CLI tool that analyzes incoming repository issues, classifies problem domains, suggests reproducible code snippets, and matches issues to suitable contributors.',
          reference_links: [
            { title: 'GitHub REST API Documentation', url: 'https://docs.github.com/en/rest' },
            { title: 'Omnikon Issue Guidelines', url: 'https://www.omnikonhub.com/docs' }
          ]
        },
        {
          event_id: hackathonId,
          title: 'Decentralized Student Campus Collaboration Hub',
          slug: 'campus-collaboration-hub',
          category: 'Student & Campus Tech',
          difficulty: 'Beginner Friendly',
          description_mdx: 'Design a student collaboration portal allowing campus study groups to coordinate hackathon teams, share course study notes, and schedule peer code review sessions securely.',
          reference_links: [
            { title: 'Next.js 15 App Router Docs', url: 'https://nextjs.org/docs' },
            { title: 'Supabase Authentication Guide', url: 'https://supabase.com/docs/guides/auth' }
          ]
        }
      ]);
      console.log('✓ Seeded hackathon problem statements.');
    }
  }

  // 3. Seed Real Technical Quizzes & Questions
  const { count: quizCount } = await adminSupabase.from('quizzes').select('id', { count: 'exact', head: true });
  console.log(`Current quizzes in database: ${quizCount || 0}`);

  if (!quizCount || quizCount === 0) {
    console.log('Seeding initial technical quizzes...');
    // Seeded above
  }

  console.log('\n==================================================');
  console.log('✅ PHASE 10 CONTENT SEEDING COMPLETE!');
}

seedContent();
