import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Static Public Supabase Client (No cookies dependency).
 * Enables static page rendering & Next.js cache revalidation for public data functions.
 */
export function createPublicClient() {
  return createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
}
