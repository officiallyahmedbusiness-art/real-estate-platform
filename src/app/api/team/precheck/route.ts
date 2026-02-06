import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TEAM_ROLES = new Set(["owner", "admin", "ops", "staff", "agent", "developer"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function findUserByEmail(admin: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    const users = data?.users ?? [];
    const match = users.find((user) => (user.email ?? "").toLowerCase() === email);
    if (match) return match;
    if (users.length < perPage) break;
    if (data?.lastPage && page >= data.lastPage) break;
    page += 1;
  }
  return null;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const email = clean(payload.email).toLowerCase();
  const phone = clean(payload.phone);

  if (!email || !email.includes("@") || !phone) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const user = await findUserByEmail(admin, email);

  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "not_invited" }, { status: 404 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, phone, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? null;
  const storedPhone = (profile?.phone ?? "").trim();
  const isActive = profile?.is_active !== false;

  if (!role || !TEAM_ROLES.has(role) || !isActive) {
    return NextResponse.json({ ok: false, error: "not_invited" }, { status: 404 });
  }

  if (!storedPhone || storedPhone !== phone) {
    return NextResponse.json({ ok: false, error: "mismatch" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

