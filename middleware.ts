// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./src/lib/supabaseMiddleware";
import { LOCALE_COOKIE } from "./src/lib/i18n.server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const langParam = url.searchParams.get("lang");

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const inferred = acceptLanguage.toLowerCase().includes("en") ? "en" : "ar";
  const localeCandidate = existing === "en" || existing === "ar" ? existing : inferred;
  const locale = langParam === "en" || langParam === "ar" ? langParam : localeCandidate;

  const requestHeaders = new Headers(request.headers);
  if (langParam === "en" || langParam === "ar") {
    requestHeaders.set("x-locale", langParam);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return updateSession(request, response);
}

// Apply to all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
