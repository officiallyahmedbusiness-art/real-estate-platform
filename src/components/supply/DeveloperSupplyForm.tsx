"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { FieldFile, FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import {
  createDeveloperSupplyAction,
  type SupplyActionState,
} from "@/app/supply/actions";

type SupplyOption = { value: string; label: string };

export type DeveloperSupplyLabels = {
  title: string;
  subtitle: string;
  companyName: string;
  contactPerson: string;
  roleTitle: string;
  phone: string;
  email: string;
  contactMethod: string;
  preferredTime: string;
  preferredDay: string;
  preferredNotes: string;
  contactReason: string;
  city: string;
  projectsSummary: string;
  inventoryType: string;
  unitCount: string;
  brochureUrl: string;
  attachments: string;
  cooperationTerms: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  successId: string;
  whatsappCta: string;
  backToSupply: string;
  error: string;
};

const initialState: SupplyActionState = { ok: false, error: null, submitted: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function DeveloperSupplyForm({
  labels,
  contactMethods,
  contactTimes,
  inventoryOptions,
}: {
  labels: DeveloperSupplyLabels;
  contactMethods: SupplyOption[];
  contactTimes: SupplyOption[];
  inventoryOptions: SupplyOption[];
}) {
  const [state, formAction] = useFormState(createDeveloperSupplyAction, initialState);

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
        <Link href="/supply" className="text-xs text-[var(--muted)] underline">
          {labels.backToSupply}
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
      <form action={formAction} className="grid gap-4 md:grid-cols-2" encType="multipart/form-data">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden="true"
          data-no-help
        />
        <FieldInput name="company_name" label={labels.companyName} required />
        <FieldInput name="contact_person_name" label={labels.contactPerson} required />
        <FieldInput name="role_title" label={labels.roleTitle} />
        <FieldInput name="phone" label={labels.phone} inputMode="tel" required />
        <FieldInput name="email" label={labels.email} type="email" />
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
        <FieldInput name="preferred_contact_notes" label={labels.preferredNotes} />
        <FieldInput name="city" label={labels.city} />
        <div className="md:col-span-2">
          <FieldTextarea name="projects_summary" label={labels.projectsSummary} required />
        </div>
        <FieldSelect name="inventory_type" label={labels.inventoryType} defaultValue="" required>
          <option value="">{labels.inventoryType}</option>
          {inventoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldInput
          name="unit_count_estimate"
          label={labels.unitCount}
          inputMode="numeric"
          type="number"
        />
        <FieldInput name="brochure_url" label={labels.brochureUrl} />
        <FieldFile name="attachments" label={labels.attachments} multiple />
        <div className="md:col-span-2">
          <FieldTextarea name="cooperation_terms_interest" label={labels.cooperationTerms} />
        </div>
        <div className="md:col-span-2">
          <FieldTextarea name="contact_reason" label={labels.contactReason} />
        </div>
        {state.submitted && !state.ok ? (
          <p className="text-sm text-[var(--danger)] md:col-span-2">{labels.error}</p>
        ) : null}
        <div className="md:col-span-2">
          <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
        </div>
      </form>
    </Card>
  );
}
