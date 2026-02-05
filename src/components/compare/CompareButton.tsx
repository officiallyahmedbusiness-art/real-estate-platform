"use client";

import { useEffect, useState } from "react";
import { subscribeCompare, toggleCompare, getCompareIds, COMPARE_LIMIT } from "@/lib/compare/store";
import { useToast } from "@/components/Toast";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function CompareButton({
  listing,
  labels,
  className = "",
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  labels: { add: string; remove: string; limit: string };
  className?: string;
}) {
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const { push } = useToast();

  useEffect(() => subscribeCompare(setCompareIds), []);

  const isSelected = compareIds.includes(listing.id);

  function handleToggle() {
    const beforeCount = compareIds.length;
    const next = toggleCompare(listing.id);
    const nowSelected = next.includes(listing.id);
    if (!nowSelected && isSelected) {
      push(labels.remove);
      track("compare_remove", {
        ...buildListingAnalyticsPayload(listing),
      });
      return;
    }

    if (!nowSelected && beforeCount >= COMPARE_LIMIT) {
      push(labels.limit);
      return;
    }

    push(labels.add);
    track("compare_add", {
      ...buildListingAnalyticsPayload(listing),
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`compare-button ${isSelected ? "is-active" : ""} ${className}`}
      aria-pressed={isSelected}
      aria-label={isSelected ? labels.remove : labels.add}
    >
      <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
    </button>
  );
}
