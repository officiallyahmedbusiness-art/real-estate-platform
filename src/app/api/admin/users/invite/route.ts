import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

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

  const full_name = clean(payload.full_name);
  const phone = clean(payload.phone);
  const email = clean(payload.email).toLowerCase();
  const role = clean(payload.role);

  if (!full_name || full_name.length < 2 || full_name.length > 80) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (phone && (phone.length < 7 || phone.length > 30)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!email || !email.includes("@") || email.length > 120) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff" && role !== "ops" && role !== "agent" && role !== "developer") {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, phone: phone || null, role },
      redirectTo,
    }
  );

  if (inviteError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  const inviteLink = null;
  let targetUserId = inviteData?.user?.id ?? null;

  if (!targetUserId) {
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (usersError) break;
      const users = usersData?.users ?? [];
      const match = users.find((user) => (user.email ?? "").toLowerCase() === email);
      if (match?.id) {
        targetUserId = match.id;
        break;
      }
      if (users.length < perPage) break;
      if (usersData?.lastPage && page >= usersData.lastPage) break;
      page += 1;
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "user_lookup_failed" }, { status: 400 });
  }

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: targetUserId,
      full_name,
      phone: phone || null,
      email,
      role,
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: "user_invited",
    target_user_id: targetUserId,
    target_email: email,
  });

  return NextResponse.json({ ok: true, inviteLink });
}
