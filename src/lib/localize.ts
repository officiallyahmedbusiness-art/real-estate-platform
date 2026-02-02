import type { Locale } from "@/lib/i18n";

export function pickLocalizedText(
  locale: Locale,
  ar?: string | null,
  en?: string | null,
  fallback?: string | null
) {
  const primary = locale === "ar" ? ar : en;
  const secondary = locale === "ar" ? en : ar;
  return primary || secondary || fallback || "";
}
