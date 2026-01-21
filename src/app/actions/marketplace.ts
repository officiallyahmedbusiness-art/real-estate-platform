"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";
import { isUuid, parseLeadInput } from "@/lib/validators";

export async function toggleFavoriteAction(listingId: string, nextPath: string) {
  if (!isUuid(listingId)) return;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/listings");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const userId = data.user.id;
  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
  } else {
    await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
  }

  revalidatePath("/listings");
  revalidatePath(`/listing/${listingId}`);
}

export async function createLeadAction(formData: FormData) {
  const payload = {
    listingId: String(formData.get("listingId") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: String(formData.get("source") ?? "web"),
  };

  const parsed = parseLeadInput(payload);
  if (!parsed) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  await supabase.from("leads").insert({
    listing_id: parsed.listingId,
    user_id: data?.user?.id ?? null,
    name: parsed.name,
    phone: parsed.phone || null,
    email: parsed.email || null,
    message: parsed.message || null,
    source: parsed.source || "web",
  });

  revalidatePath(`/listing/${parsed.listingId}`);
}
