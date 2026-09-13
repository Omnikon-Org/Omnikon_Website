import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session.user || !session.profile) {
      return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      profile: session.profile,
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 200 });
  }
}
