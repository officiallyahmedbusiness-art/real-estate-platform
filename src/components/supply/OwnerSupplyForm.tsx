"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { FieldFile, FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createOwnerSupplyAction, type SupplyActionState } from "@/app/supply/actions";

type SupplyOption = { value: string; label: string };

export type OwnerSupplyLabels = {
  title: string;
  subtitle: string;
  ownerType: string;
  fullName: string;
  phone: string;
  email: string;
  contactMethod: string;
  preferredTime: string;
  preferredDay: string;
  contactReason: string;
  propertyType: string;
  purpose: string;
  area: string;
  addressNotes: string;
  sizeM2: string;
  rooms: string;
  baths: string;
  priceExpectation: string;
  readyToShow: string;
  photos: string;
  mediaLink: string;
  notes: string;
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

export function OwnerSupplyForm({
  labels,
  ownerTypes,
  contactMethods,
  contactTimes,
  propertyTypes,
  purposes,
  readyOptions,
}: {
  labels: OwnerSupplyLabels;
  ownerTypes: SupplyOption[];
  contactMethods: SupplyOption[];
  contactTimes: SupplyOption[];
  propertyTypes: SupplyOption[];
  purposes: SupplyOption[];
  readyOptions: SupplyOption[];
}) {
  const [state, formAction] = useFormState(createOwnerSupplyAction, initialState);

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
        <FieldSelect name="owner_type" label={labels.ownerType} defaultValue="" required>
          <option value="">{labels.ownerType}</option>
          {ownerTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldInput name="full_name" label={labels.fullName} required />
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
        <div className="md:col-span-2">
          <FieldTextarea name="contact_reason" label={labels.contactReason} />
        </div>
        <FieldSelect name="property_type" label={labels.propertyType} defaultValue="" required>
          <option value="">{labels.propertyType}</option>
          {propertyTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldSelect name="purpose" label={labels.purpose} defaultValue="" required>
          <option value="">{labels.purpose}</option>
          {purposes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldInput name="area" label={labels.area} required />
        <FieldInput name="address_notes" label={labels.addressNotes} />
        <FieldInput name="size_m2" label={labels.sizeM2} type="number" inputMode="numeric" />
        <FieldInput name="rooms" label={labels.rooms} type="number" inputMode="numeric" />
        <FieldInput name="baths" label={labels.baths} type="number" inputMode="numeric" />
        <FieldInput
          name="price_expectation"
          label={labels.priceExpectation}
          type="number"
          inputMode="numeric"
        />
        <FieldSelect name="ready_to_show" label={labels.readyToShow} defaultValue="">
          <option value="">{labels.readyToShow}</option>
          {readyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
        <FieldFile name="photos" label={labels.photos} multiple />
        <FieldInput name="media_link" label={labels.mediaLink} />
        <div className="md:col-span-2">
          <FieldTextarea name="notes" label={labels.notes} />
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
