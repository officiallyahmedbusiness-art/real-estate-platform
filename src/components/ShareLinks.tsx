"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";

type ShareLabels = {
  publicLabel: string;
  internalLabel: string;
  printLabel: string;
  copyLabel: string;
  publicHint: string;
  internalHint: string;
};

type SharePaths = {
  publicPath: string;
  internalPath?: string | null;
  printPath: string;
};

export function ShareLinks({ labels, paths }: { labels: ShareLabels; paths: SharePaths }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const items = [
    {
      id: "public",
      label: labels.publicLabel,
      hint: labels.publicHint,
      url: `${origin}${paths.publicPath}`,
    },
    ...(paths.internalPath
      ? [
          {
            id: "internal",
            label: labels.internalLabel,
            hint: labels.internalHint,
            url: `${origin}${paths.internalPath}`,
          },
        ]
      : []),
    {
      id: "print",
      label: labels.printLabel,
      hint: "",
      url: `${origin}${paths.printPath}`,
    },
  ];

  async function copy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{item.label}</span>
            {item.id === "print" ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent)]">
                {labels.printLabel}
              </a>
            ) : null}
          </div>
          {item.hint ? <p className="text-xs text-[var(--muted)]">{item.hint}</p> : null}
          <div className="flex items-center gap-2">
            <Input readOnly value={item.url} className="text-xs" />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => copy(item.url, item.id)}
            >
              {copied === item.id ? "OK" : labels.copyLabel}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
