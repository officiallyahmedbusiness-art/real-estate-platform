"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "property-images";

type ImageUploaderProps = {
  listingId: string;
  existingCount: number;
};

function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function ImageUploader({ listingId, existingCount }: ImageUploaderProps) {
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

        const { error: insertError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listingId,
            path,
            sort,
          });

        if (insertError) throw insertError;
        sort += 1;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر رفع الصور.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(event) => handleFiles(event.target.files)}
          className="text-sm text-white/70"
        />
        {uploading ? <span className="text-xs text-white/50">جارٍ الرفع...</span> : null}
      </div>
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      <p className="text-xs text-white/50">
        المسار: <span className="text-white/70">listings/{listingId}/...</span>
      </p>
    </div>
  );
}
