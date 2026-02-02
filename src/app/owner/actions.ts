"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isUuid, parseRole } from "@/lib/validators";
import { requireOwnerAccess } from "@/lib/owner";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function unlockOwnerAction(formData: FormData) {
  const nextPath = clean(formData.get("next")) || "/owner/users";
  const tokenInput = clean(formData.get("owner_token"));
  const secret = process.env.OWNER_SECRET ?? "";

  if (!secret || tokenInput !== secret) {
    redirect(`/owner?next=${encodeURIComponent(nextPath)}&error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set("owner_token", secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  redirect(nextPath);
}

export async function updateOwnerRoleAction(formData: FormData) {
  const nextPath = "/owner/users";
  const { supabase, userId: actorId } = await requireOwnerAccess(nextPath);
  const userId = clean(formData.get("user_id"));
  const role = parseRole(formData.get("role"));
  if (!isUuid(userId) || !role) return;
  if (role === "owner" && userId !== actorId) return;

  await supabase.from("profiles").update({ role }).eq("id", userId);
  const hdrs = await headers();
  await logAudit(supabase, {
    actor_user_id: actorId,
    action: "role_updated",
    entity_type: "profile",
    entity_id: userId,
    metadata: { role },
    ip: hdrs.get("x-forwarded-for"),
    user_agent: hdrs.get("user-agent"),
  });

  revalidatePath(nextPath);
}

export async function updateSiteSettingsAction(formData: FormData) {
  const nextPath = "/owner/settings";
  const { supabase, userId: actorId } = await requireOwnerAccess(nextPath);
  const facebook_url = clean(formData.get("facebook_url"));
  const public_email = clean(formData.get("public_email"));
  const linkedin_url = clean(formData.get("linkedin_url"));
  const tiktok_url = clean(formData.get("tiktok_url"));
  const whatsapp_number = clean(formData.get("whatsapp_number"));
  const whatsapp_link = clean(formData.get("whatsapp_link"));

  const entries = [
    { key: "facebook_url", value: facebook_url },
    { key: "public_email", value: public_email },
    { key: "linkedin_url", value: linkedin_url },
    { key: "tiktok_url", value: tiktok_url },
    { key: "whatsapp_number", value: whatsapp_number },
    { key: "whatsapp_link", value: whatsapp_link },
  ];

  await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
  const hdrs = await headers();
  await logAudit(supabase, {
    actor_user_id: actorId,
    action: "site_settings_updated",
    entity_type: "site_settings",
    metadata: {
      keys: entries.map((entry) => entry.key),
    },
    ip: hdrs.get("x-forwarded-for"),
    user_agent: hdrs.get("user-agent"),
  });

  revalidatePath(nextPath);
}
