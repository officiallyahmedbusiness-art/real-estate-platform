"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export type CleanupState = {
  ok: boolean;
  error?: string;
  before?: Record<string, boolean>;
  after?: Record<string, boolean>;
};

const TARGET_KEYS = [
  "office_address",
  "working_hours",
  "response_sla",
  "facebook_url",
  "instagram_url",
  "linkedin_url",
  "tiktok_url",
  "youtube_url",
  "whatsapp_number",
  "whatsapp_link",
  "public_email",
  "contact_email",
];

function hasGarbage(value: string) {
  return /\?{3,}/.test(value) || value.includes("ï¿½");
}

function shouldNullify(key: string, value: string) {
  if (!value) return false;
  if (hasGarbage(value)) return true;

  if (
    /Nasr City/i.test(value) ||
    /Abbas/i.test(value) ||
    /10\s*AM/i.test(value) ||
    /10\s*minutes/i.test(value) ||
    /Trust & Contact/i.test(value)
  ) {
    return true;
  }

  if (
    key === "office_address" &&
    /\u0645\u062F\u064A\u0646\u0629\s*\u0646\u0635\u0631|\u0639\u0628\u0627\u0633\s*\u0627\u0644\u0639\u0642\u0627\u062F/.test(
      value
    )
  ) {
    return true;
  }
  if (key === "working_hours" && /(10|\u0661\u0660)\s*\u0635|(?:9|\u0669)\s*\u0645/.test(value)) {
    return true;
  }
  if (key === "response_sla" && /(10|\u0661\u0660)\s*\u062F\u0642\u0627\u0626\u0642?/.test(value)) {
    return true;
  }

  const exactMatches = new Set([
    "https://www.facebook.com/share/1C1fQLJD2W/",
    "https://www.instagram.com/hrtaj.co",
    "https://www.linkedin.com/in/hrtaj-real-estate-519564307",
    "https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD",
    "hrtaj4realestate@gmail.com",
    "hrtajrealestate@gmail.com",
    "+201020614022",
    "https://wa.me/201020614022",
  ]);

  return exactMatches.has(value.trim());
}

export async function cleanupSettingsAction(
  _prevState: CleanupState
): Promise<CleanupState> {
  void _prevState;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return { ok: false, error: "unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "owner") {
    return { ok: false, error: "forbidden" };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const { data: rows, error: fetchError } = await admin
    .from("site_settings")
    .select("key,value")
    .in("key", TARGET_KEYS);

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  const beforeMap: Record<string, boolean> = Object.fromEntries(
    TARGET_KEYS.map((key) => [key, false])
  );
  const flagged =
    (rows ?? []).filter((row) => {
      const value = typeof row.value === "string" ? row.value : "";
      beforeMap[row.key] = Boolean(value);
      return shouldNullify(row.key, value);
    }) ?? [];

  for (const row of flagged) {
    const { error: delError } = await admin
      .from("site_settings")
      .delete()
      .eq("key", row.key)
      .eq("value", row.value);
    if (delError) {
      return { ok: false, error: delError.message };
    }
  }

  const { data: afterRows, error: afterError } = await admin
    .from("site_settings")
    .select("key,value")
    .in("key", TARGET_KEYS);

  if (afterError) {
    return { ok: false, error: afterError.message };
  }

  const afterMap: Record<string, boolean> = Object.fromEntries(
    TARGET_KEYS.map((key) => [key, false])
  );
  (afterRows ?? []).forEach((row) => {
    const value = typeof row.value === "string" ? row.value : "";
    afterMap[row.key] = Boolean(value);
  });

  return { ok: true, before: beforeMap, after: afterMap };
}
