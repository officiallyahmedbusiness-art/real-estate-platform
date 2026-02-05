import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const BUCKET = "property-images";

export const dynamic = "force-dynamic";

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "png";
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { ok: false, status: 401 } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "staff";
  if (role !== "admin" && role !== "owner") return { ok: false, status: 403 } as const;

  return { ok: true, userId: data.user.id } as const;
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  const ext = getExtension(file.name);
  const path = `brand/logo-${Date.now()}.${ext}`;

  const admin = createSupabaseAdminClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/png",
  });

  if (uploadError) {
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 400 });
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData?.publicUrl ?? null;
  if (!publicUrl) {
    return NextResponse.json({ ok: false, error: "url_failed" }, { status: 400 });
  }

  await admin.from("site_settings").upsert({ key: "logo_url", value: publicUrl }, { onConflict: "key" });

  return NextResponse.json({ ok: true, url: publicUrl });
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false }, { status: auth.status });
  }

  const admin = createSupabaseAdminClient();
  await admin.from("site_settings").delete().eq("key", "logo_url");

  return NextResponse.json({ ok: true });
}
