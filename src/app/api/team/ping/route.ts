import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type PingBody = {
  sessionId?: string | null;
};

function hashIp(raw: string | null) {
  if (!raw) return null;
  const ip = raw.split(",")[0]?.trim();
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) {
    // If profiles table is unavailable or connection failed, treat as service unavailable.
    return NextResponse.json(
      { ok: false, error: "service_unavailable" },
      { status: 503 }
    );
  }

  const role = profile?.role ?? null;
  const allowed = ["owner", "admin", "ops", "staff", "agent", "developer"];
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let body: PingBody = {};
  try {
    body = (await req.json()) as PingBody;
  } catch {
    body = {};
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  const now = new Date().toISOString();
  const userAgent = req.headers.get("user-agent");
  const ipHash = hashIp(req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"));

  if (sessionId) {
    const { data: updated, error: updateError } = await supabase
      .from("team_sessions")
      .update({
        last_seen_at: now,
        user_agent: userAgent,
        ip_hash: ipHash,
      })
      .eq("id", sessionId)
      .eq("user_id", data.user.id)
      .is("ended_at", null)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "service_unavailable" },
        { status: 503 }
      );
    }
    if (updated?.id) {
      return NextResponse.json({ ok: true, sessionId: updated.id });
    }
  }

  await supabase
    .from("team_sessions")
    .update({ ended_at: now })
    .eq("user_id", data.user.id)
    .is("ended_at", null);

  const { data: created, error: createError } = await supabase
    .from("team_sessions")
    .insert({
      user_id: data.user.id,
      started_at: now,
      last_seen_at: now,
      user_agent: userAgent,
      ip_hash: ipHash,
    })
    .select("id")
    .maybeSingle();

  if (createError || !created?.id) {
    return NextResponse.json(
      { ok: false, error: "service_unavailable" },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, sessionId: created.id });
}
