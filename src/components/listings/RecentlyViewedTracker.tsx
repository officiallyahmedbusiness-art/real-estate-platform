"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recentlyViewed/store";

export function RecentlyViewedTracker({ id }: { id: string }) {
  useEffect(() => {
    if (!id) return;
    addRecentlyViewed(id);
  }, [id]);

  return null;
}
