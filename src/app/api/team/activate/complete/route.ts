import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const TEAM_ROLES = new Set(["owner", "admin", "ops", "staff", "agent", "developer"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const phone = clean(payload.phone);
  const fullName = clean(payload.full_name);
  const password = clean(payload.password);

  if (!phone || password.length < 6) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, phone, full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? null;
  if (!role || !TEAM_ROLES.has(role)) {
    return NextResponse.json({ ok: false, error: "not_invited" }, { status: 403 });
  }

  const storedPhone = (profile?.phone ?? "").trim();
  if (!storedPhone || storedPhone !== phone) {
    return NextResponse.json({ ok: false, error: "mismatch" }, { status: 403 });
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    return NextResponse.json({ ok: false, error: "password_failed" }, { status: 400 });
  }

  if (fullName && !profile?.full_name) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
  }

  return NextResponse.json({ ok: true });
}

