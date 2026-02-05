"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createCallbackAction, type CallbackActionState } from "@/app/callback/actions";

type SupplyOption = { value: string; label: string };

export type CallbackLabels = {
  title: string;
  subtitle: string;
  name: string;
  phone: string;
  contactMethod: string;
  preferredTime: string;
  preferredDay: string;
  reason: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  successId: string;
  whatsappCta: string;
  backHome: string;
  error: string;
};

const initialState: CallbackActionState = { ok: false, error: null, submitted: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function CallbackForm({
  labels,
  contactMethods,
  contactTimes,
}: {
  labels: CallbackLabels;
  contactMethods: SupplyOption[];
  contactTimes: SupplyOption[];
}) {
  const [state, formAction] = useFormState(createCallbackAction, initialState);

  if (state.submitted && state.ok) {
    return (
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">{labels.successTitle}</h2>
        <p className="text-sm text-[var(--muted)]">{labels.successBody}</p>
        {state.requestId ? (
          <p className="text-xs text-[var(--muted)]">
            {labels.successId}: {state.requestId}
          </p>
        ) : null}
        {state.whatsappLink ? (
          <a href={state.whatsappLink} target="_blank" rel="noreferrer">
            <Button size="sm">{labels.whatsappCta}</Button>
          </a>
        ) : null}
        <Link href="/" className="text-xs text-[var(--muted)] underline">
          {labels.backHome}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{labels.title}</h2>
        <p className="text-sm text-[var(--muted)]">{labels.subtitle}</p>
      </div>
      <form action={formAction} className="space-y-3">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden="true"
          data-no-help
        />
        <FieldInput name="name" label={labels.name} required />
        <FieldInput name="phone" label={labels.phone} inputMode="tel" required />
        <FieldSelect name="contact_method" label={labels.contactMethod} defaultValue="" required>
          <option value="">{labels.contactMethod}</option>
          {contactMethods.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect name="preferred_time" label={labels.preferredTime} defaultValue="" required>
          <option value="">{labels.preferredTime}</option>
          {contactTimes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldInput name="preferred_day" label={labels.preferredDay} />
        <FieldTextarea name="reason" label={labels.reason} />
        {state.submitted && !state.ok ? (
          <p className="text-sm text-[var(--danger)]">{labels.error}</p>
        ) : null}
        <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
      </form>
    </Card>
  );
}
