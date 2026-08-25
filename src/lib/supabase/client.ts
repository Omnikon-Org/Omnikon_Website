// Omnikon 2.0 — Browser Supabase Client (Client Components Only)
import { createBrowserClient } from '@supabase/ssr';
import { env } from './env';

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
