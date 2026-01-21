// src/lib/supabaseServer.ts
import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * =========================================================
 * Supabase Server Client (Server Components / Route Handlers / Server Actions)
 * =========================================================
 *
 * IMPORTANT:
 * - Do NOT import/use this file in middleware or client components.
 * - Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY only.
 * - cookies() in Next 16 can be async -> we await it.
 */

const DEBUG =
  process.env.NEXT_PUBLIC_DEBUG_SUPABASE === "1" ||
  process.env.DEBUG_SUPABASE_SERVER === "1";

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (!DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(`[supabaseServer] ${message}`, meta ?? "");
}

function mustGetEnv(name: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) {
    throw new Error(
      `[supabaseServer] Missing env var: ${name}. ` +
        `Add it to .env.local then restart dev server.`
    );
  }
  return v;
}

// Static env reads (server can do dynamic too, but static reduces mistakes)
const SUPABASE_URL = mustGetEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const SUPABASE_ANON_KEY = mustGetEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

type CookieKV = { name: string; value: string };

function toSupabaseCookies(entries: CookieKV[]) {
  return entries.map(({ name, value }) => ({ name, value }));
}

/**
 * In a correct App Router server runtime, cookieStore.getAll() exists.
 * If it doesn't, you're calling this from the wrong place (middleware/client)
 * or a non-request context.
 */
function safeGetAllCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): CookieKV[] {
  const anyStore = cookieStore as any;

  if (typeof anyStore.getAll !== "function") {
    const hint =
      "cookieStore.getAll() is not available. " +
      "Use createSupabaseServerClient() ONLY in Server Components / Route Handlers / Server Actions. " +
      "Do NOT use it in middleware or client code.";

    logDebug("Cookie store missing getAll()", {
      availableKeys: Object.keys(anyStore ?? {}),
    });

    throw new Error(`[supabaseServer] ${hint}`);
  }

  try {
    const all = anyStore.getAll() as Array<{ name: string; value: string }>;
    return all.map(({ name, value }) => ({ name, value }));
  } catch (err) {
    // If the runtime behaves unexpectedly, raise a clearer message than "Auth session missing!"
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[supabaseServer] Failed to read cookies via cookieStore.getAll(): ${msg}`
    );
  }
}

/**
 * Cookie mutations may be blocked in some Server Component contexts.
 * We should not crash render if mutation is blocked.
 * Middleware is responsible for refresh/setting cookies reliably.
 */
function safeSetCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>
) {
  try {
    for (const { name, value, options } of cookiesToSet) {
      // In RSC, cookieStore can be read-only, this may throw.
      (cookieStore as any).set?.(name, value, options);
    }
  } catch (err) {
    logDebug("Cookie set blocked by runtime context (ignored).", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Create Supabase server client (Server Components / Route Handlers / Server Actions)
 *
 * Usage:
 *   const supabase = await createSupabaseServerClient();
 *   const { data } = await supabase.auth.getUser();
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  logDebug("Creating server client", {
    hasUrl: Boolean(SUPABASE_URL),
    hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  });

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        const all = safeGetAllCookies(cookieStore);
        return toSupabaseCookies(all);
      },
      setAll(cookiesToSet) {
        safeSetCookies(cookieStore, cookiesToSet);
      },
    },
  });
}

export async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { ok: false as const, user: null, error: error.message };
  }

  return { ok: true as const, user: data.user ?? null, error: null as string | null };
}

export async function requireServerUser() {
  const res = await getServerUser();
  if (!res.ok || !res.user) {
    throw new Error("Unauthorized: user is not authenticated.");
  }
  return res.user;
}
