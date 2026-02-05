import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/paths";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl() || "https://hrtaj.com";
  const now = new Date();

  const staticRoutes = ["", "/about", "/listings", "/careers", "/partners"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "published")
      .limit(1000);

    (data ?? []).forEach((listing) => {
      entries.push({
        url: `${baseUrl}/listing/${listing.id}`,
        lastModified: listing.updated_at ? new Date(listing.updated_at) : now,
      });
    });
  } catch {
    // ignore sitemap fetch errors
  }

  return entries;
}
