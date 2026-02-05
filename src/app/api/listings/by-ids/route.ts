import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  let ids: string[] = [];
  try {
    const body = await request.json();
    ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
  } catch {
    ids = [];
  }

  const unique = Array.from(new Set(ids)).slice(0, 200);
  if (unique.length === 0) {
    return NextResponse.json({ listings: [] });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, status, created_at, amenities, floor, listing_images(path, sort)"
    )
    .in("id", unique)
    .eq("status", "published");

  if (error) {
    return NextResponse.json({ listings: [] }, { status: 500 });
  }

  return NextResponse.json({ listings: data ?? [] });
}
