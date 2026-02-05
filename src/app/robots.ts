import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicBaseUrl() || "https://hrtaj.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
