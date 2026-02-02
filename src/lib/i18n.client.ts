import { DEFAULT_LOCALE, type Locale } from "./i18n";

export function getClientLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const lang = document.documentElement.getAttribute("lang");
  return lang === "en" ? "en" : "ar";
}
