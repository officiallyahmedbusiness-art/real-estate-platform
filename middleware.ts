// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./src/lib/supabaseMiddleware";
import { LOCALE_COOKIE } from "./src/lib/i18n.server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const inferred = acceptLanguage.toLowerCase().includes("en") ? "en" : "ar";
  const locale = existing === "en" || existing === "ar" ? existing : inferred;

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
