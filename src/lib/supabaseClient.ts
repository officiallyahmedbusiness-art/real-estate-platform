// src/lib/supabaseClient.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * =========================================================
 * Supabase Browser Client (Client Components only)
 * =========================================================
 *
 * Why:
 * - Used inside "use client" components (Auth UI, client widgets, etc.)
 * - Reads NEXT_PUBLIC_* env vars (safe for browser)
 *
 * Important:
 * - Env reads must be STATIC (process.env.NEXT_PUBLIC_...) so Next can inline them.
 * - Do NOT use dynamic access like process.env[name] in client modules.
 */

/** Optional lightweight debug logs (no secrets) */
const DEBUG =
  process.env.NEXT_PUBLIC_DEBUG_SUPABASE === "1" ||
  process.env.NEXT_PUBLIC_SUPABASE_DEBUG === "1";

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(`[supabaseClient] ${message}`, meta ?? "");
}

function mustGetEnv(name: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) {
    // Clear, actionable message
    throw new Error(
      `[supabaseClient] Missing env var: ${name}. ` +
        `Add it to .env.local then restart dev server.`
    );
  }
  return v;
}

// Static reads (required for Next/Turbopack inlining in the browser)
const SUPABASE_URL = mustGetEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const SUPABASE_ANON_KEY = mustGetEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

debugLog("Initialized env (non-secret)", {
  hasUrl: Boolean(SUPABASE_URL),
  hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  nodeEnv: process.env.NODE_ENV,
});

/**
 * Singleton browser client.
 * - Keeps auth session in cookies so Server Components / Middleware can read it.
 * - Use ONLY in client components.
 */
export const supabase: SupabaseClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/**
 * Optional helper if you prefer calling a function (same singleton instance).
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  return supabase;
}
