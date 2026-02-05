import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export type SiteSettings = {
  office_address: string | null;
  working_hours: string | null;
  response_sla: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  whatsapp_message_template: string | null;
  whatsapp_message_language: string | null;
};

const SETTINGS_KEYS: Array<keyof SiteSettings> = [
  "office_address",
  "working_hours",
  "response_sla",
  "logo_url",
  "whatsapp_number",
  "primary_phone",
  "secondary_phone",
  "contact_email",
  "instagram_url",
  "facebook_url",
  "tiktok_url",
  "youtube_url",
  "linkedin_url",
  "whatsapp_message_template",
  "whatsapp_message_language",
];

const PLACEHOLDER_COMPANY_INFO = {
  office_address: [/مدينة\s*نصر/, /عباس\s*العقاد/],
  working_hours: [
    /(?:10|١٠)\s*ص/,
    /(?:9|٩)\s*م/,
  ],
  response_sla: [
    /(?:10|١٠)\s*دقائق?/,
  ],
} as const;

function normalizeCompanyInfo(value: string) {
  return value
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholderCompanyInfo(key: "office_address" | "working_hours" | "response_sla", value: string) {
  const normalized = normalizeCompanyInfo(value);
  const patterns = PLACEHOLDER_COMPANY_INFO[key];
  return patterns.every((pattern) => pattern.test(normalized));
}

const EMPTY_SETTINGS: SiteSettings = SETTINGS_KEYS.reduce((acc, key) => {
  acc[key] = null;
  return acc;
}, {} as SiteSettings);

export async function getSiteSettings(): Promise<SiteSettings> {
  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[settings] Falling back to empty settings:", (error as Error).message);
    }
    return { ...EMPTY_SETTINGS };
  }

  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[settings] Failed to load settings, using empty defaults:", error.message);
    }
    return { ...EMPTY_SETTINGS };
  }

  const settings: SiteSettings = { ...EMPTY_SETTINGS };
  (data ?? []).forEach((row) => {
    const key = row.key as keyof SiteSettings;
    if (SETTINGS_KEYS.includes(key)) {
      const value = typeof row.value === "string" ? row.value.trim() : null;
      if (value && (key === "office_address" || key === "working_hours" || key === "response_sla")) {
        settings[key] = isPlaceholderCompanyInfo(key, value) ? null : value;
      } else {
        settings[key] = value || null;
      }
    }
  });

  return settings;
}
