"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button, Card } from "@/components/ui";
import { cleanupSettingsAction, type CleanupState } from "./actions";

type CleanupLabels = {
  body: string;
  button: string;
  running: string;
  before: string;
  after: string;
  present: string;
  empty: string;
  success: string;
  errorUnauthorized: string;
  errorForbidden: string;
  errorGeneric: string;
};

const initialState: CleanupState = { ok: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function StatusChip({ active, labels }: { active: boolean; labels: Pick<CleanupLabels, "present" | "empty"> }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
        active ? "bg-[rgba(34,197,94,0.18)] text-[var(--text)]" : "bg-[var(--surface-2)] text-[var(--muted)]"
      }`}
    >
      {active ? labels.present : labels.empty}
    </span>
  );
}

export function CleanupSettingsForm({ labels }: { labels: CleanupLabels }) {
  const [state, formAction] = useFormState(cleanupSettingsAction, initialState);

  const errorMessage =
    state.error === "unauthorized"
      ? labels.errorUnauthorized
      : state.error === "forbidden"
        ? labels.errorForbidden
        : state.error
          ? labels.errorGeneric.replace("{{message}}", state.error)
          : "";

  const keys = Array.from(
    new Set([...(state.before ? Object.keys(state.before) : []), ...(state.after ? Object.keys(state.after) : [])])
  );

  return (
    <Card className="space-y-4">
      <p className="text-sm text-[var(--muted)]">{labels.body}</p>
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <SubmitButton label={labels.button} pendingLabel={labels.running} />
        {state.ok ? (
          <span className="text-xs font-semibold text-[var(--accent)]">{labels.success}</span>
        ) : null}
      </form>

      {errorMessage ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.1)] p-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      {keys.length > 0 ? (
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{labels.before}</p>
            <ul className="space-y-2">
              {keys.map((key) => (
                <li key={`before-${key}`} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--muted)]">{key}</span>
                  <StatusChip active={Boolean(state.before?.[key])} labels={labels} />
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{labels.after}</p>
            <ul className="space-y-2">
              {keys.map((key) => (
                <li key={`after-${key}`} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--muted)]">{key}</span>
                  <StatusChip active={Boolean(state.after?.[key])} labels={labels} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
