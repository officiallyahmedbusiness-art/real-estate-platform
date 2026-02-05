"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompareIds, subscribeCompare } from "@/lib/compare/store";
import { Button } from "@/components/ui";

export function CompareBar({ labels }: { labels: { title: string; action: string } }) {
  const [ids, setIds] = useState<string[]>(() => getCompareIds());

  useEffect(() => subscribeCompare(setIds), []);

  if (ids.length < 2) return null;

  return (
    <div className="compare-bar" role="region" aria-label={labels.title}>
      <span className="compare-bar-text">
        {labels.title} ({ids.length})
      </span>
      <Link href="/compare">
        <Button size="sm">{labels.action}</Button>
      </Link>
    </div>
  );
}
