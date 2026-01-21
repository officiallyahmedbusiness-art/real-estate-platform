"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  isUuid,
  parseDeveloperInput,
  parseMemberInput,
  parseRole,
} from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";

async function requireAdmin(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase };
}

export async function updateUserRoleAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!isUuid(userId)) return;
  const parsedRole = parseRole(role);
  if (!parsedRole) return;

  await supabase.from("profiles").update({ role: parsedRole }).eq("id", userId);
  revalidatePath("/admin");
}

export async function createDeveloperAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseDeveloperInput({
    name: formData.get("name"),
  });
  if (!parsed) return;

  await supabase.from("developers").insert({ name: parsed.name });
  revalidatePath("/admin");
}

export async function addDeveloperMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseMemberInput({
    developer_id: formData.get("developer_id"),
    user_id: formData.get("user_id"),
    role: formData.get("role"),
  });
  if (!parsed) return;

  await supabase.from("developer_members").insert({
    developer_id: parsed.developer_id,
    user_id: parsed.user_id,
    role: parsed.role || "member",
  });

  revalidatePath("/admin");
}

export async function updateListingStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const listingId = String(formData.get("listing_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!isUuid(listingId)) return;
  if (!["draft", "published", "archived"].includes(status)) return;

  await supabase.from("listings").update({ status }).eq("id", listingId);
  revalidatePath("/admin");
  revalidatePath(`/listing/${listingId}`);
}
