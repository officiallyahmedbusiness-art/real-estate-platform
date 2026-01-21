const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function getPublicImageUrl(path?: string | null) {
  if (!path || !SUPABASE_URL) return null;
  const cleaned = path.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${encodeURI(
    cleaned
  )}`;
}
