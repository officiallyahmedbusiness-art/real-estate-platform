import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function mustGetEnv(name: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) {
    throw new Error(
      `[supabaseAdmin] Missing env var: ${name}. ` +
        `Add it to .env.local then restart the server.`
    );
  }
  return v;
}

export function createSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = mustGetEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleKey = mustGetEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
