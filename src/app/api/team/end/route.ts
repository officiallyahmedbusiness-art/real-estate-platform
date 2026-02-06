import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type EndBody = {
  sessionId?: string | null;
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: EndBody = {};
  try {
    body = (await req.json()) as EndBody;
  } catch {
    body = {};
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  if (!sessionId) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();

  await supabase
    .from("team_sessions")
    .update({ ended_at: now, last_seen_at: now })
    .eq("id", sessionId)
    .eq("user_id", data.user.id);

  return NextResponse.json({ ok: true });
}

