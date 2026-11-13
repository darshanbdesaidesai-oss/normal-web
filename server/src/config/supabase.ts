import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Service role client - ONLY for server operations that need elevated access after explicit authorization check
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Anonymous client for token validation or non-privileged reads
export const supabaseAnon: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Factory function to create a scoped Supabase client with the caller's JWT
export function createScopedClient(token: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}
