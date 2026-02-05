"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedSearches, removeSavedSearch, markSearchRun, subscribeSavedSearches, type SavedSearch } from "@/lib/savedSearch/store";
import { Button, Card } from "@/components/ui";

export function SavedSearchesList({
  labels,
}: {
  labels: { empty: string; run: string; remove: string; lastRun: string };
}) {
  const [items, setItems] = useState<SavedSearch[]>(() => getSavedSearches());

  useEffect(() => subscribeSavedSearches(setItems), []);

  if (!items.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{labels.empty}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const href = item.queryString ? `/listings?${item.queryString}` : "/listings";
        return (
          <Card key={item.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{item.name}</p>
                {item.lastRunAt ? (
                  <p className="text-xs text-[var(--muted)]">
                    {labels.lastRun}: {new Date(item.lastRunAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={href}
                  onClick={() => markSearchRun(item.id)}
                  className="text-sm font-semibold text-[var(--accent)]"
                >
                  {labels.run}
                </Link>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeSavedSearch(item.id)}>
                  {labels.remove}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
