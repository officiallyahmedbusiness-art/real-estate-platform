// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./src/lib/supabaseMiddleware";

export async function middleware(request: NextRequest) {
  // مهم جدًا: دايمًا رجّع NextResponse (حتى لو مش هتعدل حاجة)
  const response = NextResponse.next();

  // updateSession لازم ياخد request + response عشان يقدر يكتب cookies
  return updateSession(request, response);
}

// Apply to all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
