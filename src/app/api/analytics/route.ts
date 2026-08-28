import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const VALID_EVENT_TYPES = [
  'project_view',
  'project_github_click',
  'issue_click',
  'article_view',
  'event_view',
  'signup',
  'primary_cta_click',
];

// Reusable static namespace UUID for global click events that lack direct entity association
const GLOBAL_EVENT_UUID = '00000000-0000-0000-0000-000000000000';

export async function POST(req: NextRequest) {
  try {
    const { entityType, entityId } = await req.json();

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing required parameters: entityType, entityId' }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 });
    }

    // IP hashing for privacy compliance
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('view_logs')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        ip_hash: ipHash,
      });

    if (error) {
      console.error('Database insertion failure in analytics API:', error.message);
      return NextResponse.json({ error: 'Database logger failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected failure occurred inside analytics backend.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
