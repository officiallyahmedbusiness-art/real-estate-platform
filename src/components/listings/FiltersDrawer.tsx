"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function FiltersDrawer({
  title,
  subtitle,
  activeCount,
  formId,
  applyLabel,
  resetLabel,
  resetHref,
  children,
}: {
  title: string;
  subtitle: string;
  activeCount: number;
  formId: string;
  applyLabel: string;
  resetLabel: string;
  resetHref: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button type="button" variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        {title}
        {activeCount ? <span className="filters-count">{activeCount}</span> : null}
      </Button>
      {open ? (
        <div className="filters-overlay" role="dialog" aria-modal="true">
          <button className="filters-backdrop" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="filters-sheet">
            <div className="filters-sheet-header">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-xs text-[var(--muted)]">{subtitle}</p>
              </div>
              <button className="filters-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="filters-sheet-body">{children}</div>
            <div className="filters-sheet-actions">
              <a href={resetHref} className="filters-reset">
                {resetLabel}
              </a>
              <Button type="submit" form={formId} className="flex-1">
                {applyLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
