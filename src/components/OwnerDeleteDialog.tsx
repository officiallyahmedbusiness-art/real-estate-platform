"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type DeleteResponse = { ok?: boolean; error?: string };

export function OwnerDeleteDialog({
  entityId,
  endpoint,
  title,
  description,
  confirmLabel,
  mode = "delete",
  payload,
}: {
  entityId: string;
  endpoint: string;
  title: string;
  description: string;
  confirmLabel?: string;
  mode?: "delete" | "request";
  payload?: Record<string, unknown>;
}) {
  const router = useRouter();
  const locale = getClientLocale();
  const t = createT(locale);

  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const required = confirmLabel ?? "DELETE";
  const canSubmit = confirm.trim().toUpperCase() === required;

  async function handleDelete() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: entityId, confirm: required }),
      });
      const data = (await res.json()) as DeleteResponse;
      if (!res.ok || !data.ok) {
        setError(t("owner.delete.error"));
        setLoading(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("owner.delete.error"));
    } finally {
      setLoading(false);
    }
  }

  const triggerLabel =
    mode === "request" ? t("owner.delete.requestButton") : t("owner.delete.button");
  const submitLabel =
    mode === "request" ? t("owner.delete.requestConfirm") : t("owner.delete.confirm");
  const loadingLabel =
    mode === "request" ? t("owner.delete.requestLoading") : t("owner.delete.loading");

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted)]">{description}</p>
            </div>
            <div className="space-y-2">
              <FieldInput
                label={t("owner.delete.confirmLabel")}
                helpKey="owner.delete.confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder={required}
              />
              <p className="text-xs text-[var(--muted)]">
                {t("owner.delete.confirmHint", { value: required })}
              </p>
            </div>
            {error ? (
              <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
                {error}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                {t("owner.delete.cancel")}
              </Button>
              <Button type="button" variant="danger" size="sm" disabled={!canSubmit || loading} onClick={handleDelete}>
                {loading ? loadingLabel : submitLabel}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
