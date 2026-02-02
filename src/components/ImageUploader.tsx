"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "property-images";

type ImageUploaderProps = {
  listingId: string;
  existingCount: number;
  labels: {
    title: string;
    hint: string;
    uploading: string;
    error: string;
    pathLabel: string;
  };
};

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function ImageUploader({ listingId, existingCount, labels }: ImageUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      let sort = existingCount;
      for (const file of Array.from(files)) {
        const ext = getExtension(file.name);
        const path = `listings/${listingId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("listing_images").insert({
          listing_id: listingId,
          path,
          sort,
        });

        if (insertError) throw insertError;
        sort += 1;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
        <span className="font-semibold text-[var(--text)]">{labels.title}</span>
        <span>{labels.hint}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only"
        />
        {uploading ? <span className="text-xs">{labels.uploading}</span> : null}
      </label>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <p className="text-xs text-[var(--muted)]">
        {labels.pathLabel}: <span className="text-[var(--text)]">listings/{listingId}/...</span>
      </p>
    </div>
  );
}
