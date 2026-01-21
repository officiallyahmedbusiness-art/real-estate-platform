"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isUuid, parseListingInput } from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";

async function requireDeveloperAccess(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/developer");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "user";
  if (role !== "developer" && role !== "partner" && role !== "admin") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id, role };
}

export async function createListingAction(formData: FormData) {
  const { supabase, userId, role } = await requireDeveloperAccess("/developer");

  const parsed = parseListingInput({
    title: formData.get("title"),
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    size_m2: formData.get("size_m2"),
    description: formData.get("description"),
    amenities: formData.get("amenities"),
    status: formData.get("status"),
  });

  if (!parsed) return;

  let developerId: string | null = null;
  if (role === "admin") {
    const devInput = String(formData.get("developer_id") ?? "");
    developerId = isUuid(devInput) ? devInput : null;
  } else {
    const { data: membership } = await supabase
      .from("developer_members")
      .select("developer_id")
      .eq("user_id", userId)
      .maybeSingle();
    developerId = membership?.developer_id ?? null;
  }

  const status = role === "admin" ? parsed.status : "draft";

  await supabase.from("listings").insert({
    developer_id: developerId,
    owner_user_id: userId,
    title: parsed.title,
    type: parsed.type,
    purpose: parsed.purpose,
    price: parsed.price,
    currency: parsed.currency,
    city: parsed.city,
    area: parsed.area,
    address: parsed.address,
    beds: parsed.beds,
    baths: parsed.baths,
    size_m2: parsed.size_m2,
    description: parsed.description,
    amenities: parsed.amenities,
    status,
  });

  revalidatePath("/developer");
}

export async function updateListingAction(formData: FormData) {
  const { supabase, role } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const parsed = parseListingInput({
    title: formData.get("title"),
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    size_m2: formData.get("size_m2"),
    description: formData.get("description"),
    amenities: formData.get("amenities"),
    status: formData.get("status"),
  });

  if (!parsed) return;

  const status =
    role === "admin" ? parsed.status : parsed.status === "archived" ? "archived" : "draft";

  await supabase
    .from("listings")
    .update({
      title: parsed.title,
      type: parsed.type,
      purpose: parsed.purpose,
      price: parsed.price,
      currency: parsed.currency,
      city: parsed.city,
      area: parsed.area,
      address: parsed.address,
      beds: parsed.beds,
      baths: parsed.baths,
      size_m2: parsed.size_m2,
      description: parsed.description,
      amenities: parsed.amenities,
      status,
    })
    .eq("id", listingId);

  revalidatePath("/developer");
  revalidatePath(`/developer/listings/${listingId}`);
}

export async function deleteListingAction(formData: FormData) {
  const { supabase } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  await supabase.from("listings").delete().eq("id", listingId);
  revalidatePath("/developer");
}

export async function deleteImageAction(formData: FormData) {
  const { supabase } = await requireDeveloperAccess("/developer");
  const listingId = String(formData.get("listing_id") ?? "");
  const path = String(formData.get("path") ?? "");
  if (!isUuid(listingId) || !path) return;

  await supabase.storage.from("property-images").remove([path]);
  await supabase.from("listing_images").delete().eq("listing_id", listingId).eq("path", path);

  revalidatePath(`/developer/listings/${listingId}`);
}
