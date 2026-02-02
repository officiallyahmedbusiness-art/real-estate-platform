"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";

const DEFAULT_BUCKET = "property-attachments";
const DOC_BUCKET = "property-docs";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const CATEGORY_SET = new Set([
  "unit_photos",
  "building_entry",
  "view",
  "plan",
  "contract",
  "owner_docs",
  "other",
]);

const FILE_TYPE_MAP: Record<string, "image" | "pdf" | "video" | "doc" | "other"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "application/pdf": "pdf",
  "video/mp4": "video",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBool(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "on";
}

function guessFileType(file: File) {
  return FILE_TYPE_MAP[file.type] ?? null;
}

function bucketForCategory(category: string) {
  if (category === "contract" || category === "owner_docs") return DOC_BUCKET;
  return DEFAULT_BUCKET;
}

async function requireStaff(nextPath: string) {
  return requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
}

export async function uploadAttachmentAction(formData: FormData) {
  const { user } = await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");

  const listingId = clean(formData.get("listing_id"));
  const category = clean(formData.get("category")) || "unit_photos";
  const title = clean(formData.get("title")) || null;
  const note = clean(formData.get("note")) || null;

  if (!isUuid(listingId)) {
    return { ok: false, error: "Invalid listing id." };
  }
  if (!CATEGORY_SET.has(category)) {
    return { ok: false, error: "Invalid category." };
  }
  if ((category === "contract" || category === "owner_docs") && !ownerAccess) {
    return { ok: false, error: "Owner documents require approval." };
  }

  const files = formData.getAll("files").filter((item) => item instanceof File) as File[];
  if (!files.length) {
    return { ok: false, error: "No files uploaded." };
  }

  const { data: existing } = await supabase
    .from("unit_attachments")
    .select("sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: false })
    .limit(1);
  let sortOrder = existing?.[0]?.sort_order ?? 0;

  const results: { name: string; status: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      results.push({ name: file.name, status: "too_large" });
      continue;
    }

    const fileType = guessFileType(file);
    if (!fileType) {
      results.push({ name: file.name, status: "unsupported_type" });
      continue;
    }

    const attachmentId = crypto.randomUUID();
    const safeName = file.name.replace(/\s+/g, "_");
    const bucket = bucketForCategory(category);
    const path = `listings/${listingId}/${attachmentId}/${safeName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      results.push({ name: file.name, status: "upload_failed" });
      continue;
    }

    const { error: insertError } = await supabase.from("unit_attachments").insert({
      id: attachmentId,
      listing_id: listingId,
      created_by: user.id,
      bucket,
      file_path: path,
      file_type: fileType,
      category,
      title,
      note,
      sort_order: sortOrder,
      metadata: { name: file.name, size: file.size, contentType: file.type },
    });

    if (insertError) {
      await supabase.storage.from(bucket).remove([path]);
      results.push({ name: file.name, status: "db_failed" });
      continue;
    }

    sortOrder += 1;
    results.push({ name: file.name, status: "ok" });
  }

  await supabase.from("resale_intake").update({ has_images: true }).eq("listing_id", listingId);
  await supabase.from("listings").update({ has_images: true }).eq("id", listingId);
  revalidatePath("/staff");
  revalidatePath(`/staff/units/${listingId}`);
  revalidatePath(`/listing/${listingId}`);

  return { ok: true, results };
}

export async function deleteAttachmentAction(formData: FormData) {
  await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");

  const attachmentId = clean(formData.get("attachment_id"));
  if (!isUuid(attachmentId)) return { ok: false, error: "Invalid attachment id." };

  const { data: attachment } = await supabase
    .from("unit_attachments")
    .select("id, file_path, listing_id, bucket, category")
    .eq("id", attachmentId)
    .maybeSingle();
  if (!attachment) return { ok: false, error: "Attachment not found." };
  if ((attachment.category === "contract" || attachment.category === "owner_docs") && !ownerAccess) {
    return { ok: false, error: "Owner documents require approval." };
  }

  await supabase.storage
    .from(attachment.bucket || DEFAULT_BUCKET)
    .remove([attachment.file_path]);
  await supabase.from("unit_attachments").delete().eq("id", attachmentId);

  const { count } = await supabase
    .from("unit_attachments")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", attachment.listing_id);
  if (!count) {
    await supabase
      .from("resale_intake")
      .update({ has_images: false })
      .eq("listing_id", attachment.listing_id);
    await supabase.from("listings").update({ has_images: false }).eq("id", attachment.listing_id);
  }

  revalidatePath("/staff");
  revalidatePath(`/staff/units/${attachment.listing_id}`);
  revalidatePath(`/listing/${attachment.listing_id}`);

  return { ok: true };
}

export async function updateAttachmentMetaAction(formData: FormData) {
  await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");

  const attachmentId = clean(formData.get("attachment_id"));
  if (!isUuid(attachmentId)) return { ok: false, error: "Invalid attachment id." };

  const category = formData.get("category");
  const title = formData.get("title");
  const note = formData.get("note");
  const hasPrimary = formData.has("is_primary");
  const hasPublished = formData.has("is_published");
  const isPrimary = parseBool(formData.get("is_primary"));
  const isPublished = parseBool(formData.get("is_published"));
  const sortOrderRaw = clean(formData.get("sort_order"));
  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : null;

  const { data: attachment } = await supabase
    .from("unit_attachments")
    .select("id, listing_id, category")
    .eq("id", attachmentId)
    .maybeSingle();
  if (!attachment) return { ok: false, error: "Attachment not found." };
  if ((attachment.category === "contract" || attachment.category === "owner_docs") && !ownerAccess) {
    return { ok: false, error: "Owner documents require approval." };
  }

  if (hasPrimary && isPrimary) {
    await supabase
      .from("unit_attachments")
      .update({ is_primary: false })
      .eq("listing_id", attachment.listing_id)
      .neq("id", attachmentId);
  }

  const updates: Record<string, unknown> = {};
  if (hasPrimary) updates.is_primary = isPrimary;
  if (hasPublished) {
    const nextPublished =
      attachment.category === "contract" || attachment.category === "owner_docs"
        ? false
        : isPublished;
    updates.is_published = nextPublished;
  }

  if (category !== null) {
    const cleaned = clean(category);
    if ((cleaned === "contract" || cleaned === "owner_docs") && !ownerAccess) {
      return { ok: false, error: "Owner documents require approval." };
    }
    if (CATEGORY_SET.has(cleaned)) updates.category = cleaned;
  }
  if (title !== null) updates.title = clean(title) || null;
  if (note !== null) updates.note = clean(note) || null;
  if (sortOrder !== null && Number.isFinite(sortOrder)) updates.sort_order = sortOrder;

  if (updates.category === "contract" || updates.category === "owner_docs") {
    updates.is_published = false;
  }

  await supabase.from("unit_attachments").update(updates).eq("id", attachmentId);

  revalidatePath("/staff");
  revalidatePath(`/staff/units/${attachment.listing_id}`);
  revalidatePath(`/listing/${attachment.listing_id}`);

  return { ok: true };
}

export async function reorderAttachmentsAction(formData: FormData) {
  await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();

  const listingId = clean(formData.get("listing_id"));
  const ordered = clean(formData.get("ordered_ids"));
  if (!isUuid(listingId)) return { ok: false, error: "Invalid listing id." };
  if (!ordered) return { ok: false, error: "Missing order." };

  const ids = ordered.split(",").map((id) => id.trim()).filter(Boolean);
  let sortOrder = 0;
  for (const id of ids) {
    if (!isUuid(id)) continue;
    await supabase
      .from("unit_attachments")
      .update({ sort_order: sortOrder })
      .eq("id", id)
      .eq("listing_id", listingId);
    sortOrder += 1;
  }

  revalidatePath(`/staff/units/${listingId}`);
  return { ok: true };
}

export async function getAttachmentSignedUrlAction(formData: FormData) {
  await requireStaff("/staff");
  const supabase = await createSupabaseServerClient();

  const attachmentId = clean(formData.get("attachment_id"));
  if (!isUuid(attachmentId)) return { ok: false, error: "Invalid attachment id." };

  const { data: attachment } = await supabase
    .from("unit_attachments")
    .select("file_path, bucket")
    .eq("id", attachmentId)
    .maybeSingle();
  if (!attachment) return { ok: false, error: "Attachment not found." };

  const { data, error } = await supabase.storage
    .from(attachment.bucket || DEFAULT_BUCKET)
    .createSignedUrl(attachment.file_path, 60 * 15);
  if (error) return { ok: false, error: "Signed URL failed." };

  return { ok: true, url: data.signedUrl };
}
