"use client";

import { useEffect } from "react";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function ListingViewTracker({
  listing,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
}) {
  useEffect(() => {
    track("listing_view", buildListingAnalyticsPayload(listing));
  }, [listing]);

  return null;
}
