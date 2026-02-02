"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getPublicBaseUrl, safeNextPath } from "@/lib/paths";

export async function requestResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) return;

  const supabase = await createSupabaseServerClient();
  const baseUrl = getPublicBaseUrl();
  const redirectTo = baseUrl
    ? `${baseUrl}/auth/reset/callback`
    : "/auth/reset/callback";

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  const nextPath = safeNextPath(String(formData.get("next") ?? ""), "/auth");
  redirect(`/auth/forgot?sent=1&next=${encodeURIComponent(nextPath)}`);
}
