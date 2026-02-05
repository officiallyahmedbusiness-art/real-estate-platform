import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { logAudit } from "@/lib/audit";

const DEFAULT_EMAIL = "foxm575@gmail.com";
const DEFAULT_PHONE = "01020614022";
const DEFAULT_NAME = "Foxm Admin";

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
  if (actorRole !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const secret = process.env.OWNER_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }
  const token = (await cookies()).get("owner_token")?.value ?? "";
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const email = clean(payload.email).toLowerCase() || DEFAULT_EMAIL;
  const phone = clean(payload.phone) || DEFAULT_PHONE;
  const full_name = clean(payload.full_name) || DEFAULT_NAME;

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, phone: phone || null, role: "admin" },
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

  if (targetProfile?.role === "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: targetUserId,
      full_name,
      phone: phone || null,
      email,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  await logAudit(supabase, {
    actor_user_id: data.user.id,
    action: "admin_invited",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: { role: "admin", email },
  });

  return NextResponse.json({ ok: true, inviteLink });
}

