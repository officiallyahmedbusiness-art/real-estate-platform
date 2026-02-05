"use client";

import { useState } from "react";
import { addSavedSearch, type SavedSearch } from "@/lib/savedSearch/store";
import { useToast } from "@/components/Toast";
import { Button, Card } from "@/components/ui";

export function SaveSearchModal({
  queryString,
  defaultName,
  labels,
}: {
  queryString: string;
  defaultName: string;
  labels: {
    open: string;
    title: string;
    nameLabel: string;
    save: string;
    cancel: string;
    saved: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const { push } = useToast();

  function handleSave() {
    if (!name.trim()) return;
    const item: SavedSearch = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      queryString,
      createdAt: new Date().toISOString(),
    };
    addSavedSearch(item);
    push(labels.saved);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        {labels.open}
      </Button>
      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">{labels.title}</h3>
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">{labels.nameLabel}</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {labels.cancel}
                </Button>
                <Button type="button" size="sm" onClick={handleSave}>
                  {labels.save}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
