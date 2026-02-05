"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button, Card } from "@/components/ui";
import { FieldInput, FieldTextarea } from "@/components/FieldHelp";
import { createLeadActionWithState, type LeadActionState } from "@/app/actions/marketplace";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export type LeadFormLabels = {
  title: string;
  subtitle?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  error: string;
  back?: string;
  whatsappFallback?: string;
};

const initialState: LeadActionState = { ok: false, error: null, submitted: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function LeadForm({
  listingId,
  source = "web",
  labels,
  className = "",
  whatsappLink,
  backHref,
  id = "lead-form",
}: {
  listingId: string;
  source?: string;
  labels: LeadFormLabels;
  className?: string;
  whatsappLink?: string | null;
  backHref?: string;
  id?: string;
}) {
  const [state, formAction] = useFormState(createLeadActionWithState, initialState);

  if (state.submitted && state.ok) {
    return (
      <Card className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold">{labels.successTitle}</h3>
        <p className="text-sm text-[var(--muted)]">{labels.successBody}</p>
        {whatsappLink ? (
          <a href={whatsappLink} target="_blank" rel="noreferrer">
            <Button size="sm">{labels.whatsappFallback ?? "WhatsApp"}</Button>
          </a>
        ) : null}
        {backHref && labels.back ? (
          <a href={backHref} className="text-xs text-[var(--muted)] underline">
            {labels.back}
          </a>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{labels.title}</h3>
        {labels.subtitle ? <p className="text-sm text-[var(--muted)]">{labels.subtitle}</p> : null}
      </div>
      <form
        id={id}
        action={formAction}
        className="space-y-3"
        onSubmit={() =>
          track("lead_submit", { source, ...buildListingAnalyticsPayload({ id: listingId }) })
        }
      >
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden="true"
          data-no-help
        />
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="source" value={source} />
        <FieldInput
          name="name"
          label={labels.name}
          helpKey="lead.name"
          placeholder={labels.name}
          required
        />
        <FieldInput
          name="phone"
          label={labels.phone}
          helpKey="lead.phone"
          placeholder={labels.phone}
          inputMode="tel"
        />
        <FieldInput
          name="email"
          label={labels.email}
          helpKey="lead.email"
          placeholder={labels.email}
          type="email"
        />
        <FieldTextarea
          name="message"
          label={labels.message}
          helpKey="lead.message"
          placeholder={labels.message}
        />
        {state.submitted && !state.ok ? (
          <p className="text-sm text-[var(--danger)]">{labels.error}</p>
        ) : null}
        <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
        {whatsappLink && labels.whatsappFallback ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--muted)] underline"
          >
            {labels.whatsappFallback}
          </a>
        ) : null}
        {backHref && labels.back ? (
          <a href={backHref} className="text-xs text-[var(--muted)] underline">
            {labels.back}
          </a>
        ) : null}
      </form>
    </Card>
  );
}
