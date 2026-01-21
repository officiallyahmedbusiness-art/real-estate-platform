// src/lib/supabaseMiddleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function mustGet(name: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) {
    throw new Error(
      `[supabaseMiddleware] Missing env var: ${name}. Add it to .env.local then restart dev server.`
    );
  }
  return v;
}

const SUPABASE_URL = mustGet(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const SUPABASE_ANON_KEY = mustGet(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Keeps the auth session fresh on every request.
 * This is the KEY piece that prevents "Auth session missing!" on the server.
 */
export async function updateSession(req: NextRequest, res: NextResponse) {
  // createServerClient in middleware context
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      // Read cookies from the incoming request
      getAll() {
        return req.cookies.getAll();
      },
      // Write cookies to the outgoing response
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  // This triggers session refresh logic if needed.
  // It will also ensure auth cookies are attached to res via setAll().
  await supabase.auth.getUser();

  return res;
}
