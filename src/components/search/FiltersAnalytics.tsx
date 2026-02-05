"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function FiltersAnalytics({ formIds }: { formIds: string[] }) {
  useEffect(() => {
    const handlers: Array<() => void> = [];

    formIds.forEach((id) => {
      const form = document.getElementById(id) as HTMLFormElement | null;
      if (!form) return;
      const handleSubmit = () => {
        const data = new FormData(form);
        const summary: Record<string, string> = {};
        ["transaction", "type", "city", "area", "priceMin", "priceMax", "beds", "baths", "sort"].forEach(
          (key) => {
            const value = data.get(key);
            if (typeof value === "string" && value) summary[key] = value;
          }
        );
        const amenities = data.getAll("amenities").filter((item) => typeof item === "string");
        if (amenities.length) summary.amenities = String(amenities.length);
        track("filter_apply", summary);
      };
      form.addEventListener("submit", handleSubmit);
      handlers.push(() => form.removeEventListener("submit", handleSubmit));
    });

    return () => {
      handlers.forEach((cleanup) => cleanup());
    };
  }, [formIds]);

  return null;
}
