import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

const COOKIE_NAME = "locale";

async function detectFromAcceptLanguage(): Promise<Locale> {
  const headerStore = await headers();
  const header = headerStore.get("accept-language") ?? "";
  if (header.toLowerCase().includes("en")) return "en";
  return "ar";
}

export async function getServerLocale(): Promise<Locale> {
  const headerStore = await headers();
  const forced = headerStore.get("x-locale");
  if (forced === "en" || forced === "ar") return forced;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (cookie === "en" || cookie === "ar") return cookie;
  return (await detectFromAcceptLanguage()) || DEFAULT_LOCALE;
}

export function getServerDir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const LOCALE_COOKIE = COOKIE_NAME;




