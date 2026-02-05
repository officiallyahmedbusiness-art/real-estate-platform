import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { parseRole } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  const isOwner = actorRole === "owner";
  const isAdmin = actorRole === "admin" || isOwner;

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const targetUserId = typeof payload.targetUserId === "string" ? payload.targetUserId : "";
  const parsedRole = parseRole(payload.newRole);
  if (!targetUserId || !parsedRole) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  if (parsedRole === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (targetProfile?.role === "owner" && parsedRole !== "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: parsedRole })
    .eq("id", targetUserId);

  if (updateError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: "user_role_updated",
    target_user_id: targetUserId,
  });

  return NextResponse.json({ ok: true });
}
