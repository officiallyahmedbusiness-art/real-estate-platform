"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

const MAX_CV_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function submitCareerApplicationAction(formData: FormData) {
  const roleTitle = clean(formData.get("role_title"));
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")) || null;
  const phone = clean(formData.get("phone")) || null;
  const message = clean(formData.get("message")) || null;
  const locale = clean(formData.get("locale")) || null;
  const cv = formData.get("cv");

  if (!roleTitle || !name) {
    return;
  }

  if (!(cv instanceof File)) {
    return;
  }

  if (!ALLOWED_TYPES.has(cv.type)) {
    return;
  }

  if (cv.size > MAX_CV_SIZE) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const id = crypto.randomUUID();
  const path = `applications/${id}/${safeFileName(cv.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("career-uploads")
    .upload(path, cv, { contentType: cv.type, upsert: false });
  if (uploadError) return;

  const { error: insertError } = await supabase.from("career_applications").insert({
    role_title: roleTitle,
    name,
    email,
    phone,
    message,
    cv_path: path,
    cv_filename: cv.name,
    locale,
  });

  if (insertError) {
    await supabase.storage.from("career-uploads").remove([path]);
    return;
  }
}
