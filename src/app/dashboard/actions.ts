// src/app/dashboard/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function safeNextPath(input: unknown, fallback = "/dashboard") {
  const val = typeof input === "string" ? input : "";
  if (!val) return fallback;
  if (!val.startsWith("/")) return fallback;
  if (val.startsWith("//")) return fallback; // prevent //evil.com
  return val;
}

/**
 * Logout server action
 * - Uses server-side Supabase client
 * - Clears auth cookies via Supabase
 * - Revalidates dashboard to avoid stale UI
 * - Redirects to /auth?next=...
 *
 * NOTE:
 * - We read `next` from formData (reliable) instead of Referer (unreliable).
 */
export async function logoutAction(formData?: FormData) {
  const supabase = await createSupabaseServerClient();

  // Even if signOut errors, proceed to redirect (goal is to exit UI).
  await supabase.auth.signOut();

  // Prevent stale UI after logout
  revalidatePath("/dashboard");

  const next = safeNextPath(formData?.get("next"), "/dashboard");
  redirect(`/auth?next=${encodeURIComponent(next)}`);
}
