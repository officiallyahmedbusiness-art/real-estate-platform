import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { logActivity } from "@/lib/activity";

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
  if (
    profile?.role !== "owner" &&
    profile?.role !== "admin" &&
    profile?.role !== "ops" &&
    profile?.role !== "staff"
  ) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return { supabase, userId: data.user.id };
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { supabase, userId } = guard;

  const apiUrl = process.env.HRTAJ_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ ok: false, error: "HRTAJ_API_URL missing" }, { status: 500 });
  }

  const formData = await request.formData();
  const type = (formData.get("type") as string | null) ?? "resale";
  const endpoint = type === "projects" ? "projects" : "resale";

  const res = await fetch(`${apiUrl}/v1/import/${endpoint}`, {
    method: "POST",
    headers: {
      "X-HRTAJ-IMPORT-KEY": process.env.HRTAJ_IMPORT_API_KEY ?? "",
    },
    body: formData,
  });

  const data = await res.json();
  await logActivity(supabase, {
    actor_user_id: userId,
    action: "import_run",
    entity: "import",
    meta: {
      type: endpoint,
      rows_total: data?.data?.rows_total ?? null,
      rows_inserted: data?.data?.rows_inserted ?? null,
      rows_updated: data?.data?.rows_updated ?? null,
      rows_failed: data?.data?.rows_failed ?? null,
    },
  });
  return NextResponse.json(data, { status: res.status });
}
