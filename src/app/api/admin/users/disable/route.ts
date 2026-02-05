import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

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
  const disabled = Boolean(payload.disabled);
  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ban_duration = disabled ? "876000h" : "none";
  const { error: banError } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration,
  });

  if (banError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: !disabled })
    .eq("id", targetUserId);

  if (profileError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: disabled ? "user_disabled" : "user_enabled",
    target_user_id: targetUserId,
  });

  return NextResponse.json({ ok: true });
}
