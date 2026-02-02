import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const apiUrl = process.env.HRTAJ_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ ok: false, error: "HRTAJ_API_URL missing" }, { status: 500 });
  }

  const res = await fetch(`${apiUrl}/v1/reports/daily`, {
    headers: {
      "X-HRTAJ-ADMIN-KEY": process.env.HRTAJ_ADMIN_API_KEY ?? "",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
