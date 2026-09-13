import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });
  response.cookies.delete('omnikon_user_id');
  response.cookies.delete('github_oauth_token');
  return response;
}
