"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";

function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;
  if (!env) return "";
  return env.startsWith("http") ? env : `https://${env}`;
}

export async function requestResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) return;

  const supabase = await createSupabaseServerClient();
  const redirectTo = getBaseUrl()
    ? `${getBaseUrl()}/auth/reset/callback`
    : "/auth/reset/callback";

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  const nextPath = safeNextPath(String(formData.get("next") ?? ""), "/auth");
  redirect(`/auth/forgot?sent=1&next=${encodeURIComponent(nextPath)}`);
}
