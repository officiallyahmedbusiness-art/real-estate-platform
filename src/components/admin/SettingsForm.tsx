"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea, FieldWrapper } from "@/components/FieldHelp";
import { useToast } from "@/components/Toast";
import type { SiteSettings } from "@/lib/settings";
import { normalizeEgyptPhone } from "@/lib/settings/validation";
import { buildWhatsAppLink } from "@/lib/whatsapp/message";
import { updateSettingsAction, SETTINGS_INITIAL_STATE, type SettingsActionState } from "@/app/admin/settings/actions";

const TEMPLATE_VARS = [
  "{brand}",
  "{listing_url}",
  "{listing_title}",
  "{price}",
  "{area}",
  "{city}",
  "{ref}",
  "{purpose}",
  "{property_type}",
];

export function SettingsForm({
  settings,
  t,
}: {
  settings: SiteSettings;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [state, formAction] = useFormState<SettingsActionState, FormData>(
    updateSettingsAction,
    SETTINGS_INITIAL_STATE
  );

  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [waNumber, setWaNumber] = useState(settings.whatsapp_number ?? "");

  useEffect(() => {
    if (state.ok) {
      push(t("settings.saveSuccess"));
    }
  }, [state.ok, push, t]);

  const whatsappPreview = useMemo(() => {
    const normalized = waNumber ? normalizeEgyptPhone(waNumber) : null;
    if (!normalized) return null;
    return buildWhatsAppLink(normalized, "")?.replace(/\?text=$/, "") ?? null;
  }, [waNumber]);

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setLogoError(null);
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/settings/logo", { method: "POST", body: formData });
      const payload = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !payload.ok || !payload.url) {
        throw new Error(payload.error || "upload_failed");
      }
      setLogoUrl(payload.url);
      push(t("settings.logoUploaded"));
      router.refresh();
    } catch {
      setLogoError(t("settings.logoError"));
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleLogoRemove() {
    setLogoUploading(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/admin/settings/logo", { method: "DELETE" });
      const payload = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || "remove_failed");
      }
      setLogoUrl("");
      push(t("settings.logoRemoved"));
      router.refresh();
    } catch {
      setLogoError(t("settings.logoError"));
    } finally {
      setLogoUploading(false);
    }
  }

  function renderError(field: string) {
    if (!state.errors?.[field]) return null;
    return <p className="text-xs text-[var(--danger)]">{t("settings.validation")}</p>;
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.companyInfo.title")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("settings.companyInfo.hint")}</p>
        </div>
        <FieldTextarea
          name="office_address"
          label={t("settings.officeAddress")}
          helpKey="admin.settings.office_address"
          defaultValue={settings.office_address ?? ""}
        />
        {renderError("office_address")}
        <FieldInput
          name="working_hours"
          label={t("settings.workingHours")}
          helpKey="admin.settings.working_hours"
          defaultValue={settings.working_hours ?? ""}
        />
        {renderError("working_hours")}
        <FieldInput
          name="response_sla"
          label={t("settings.responseSla")}
          helpKey="admin.settings.response_sla"
          defaultValue={settings.response_sla ?? ""}
        />
        {renderError("response_sla")}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.brandContact.title")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("settings.brandContact.hint")}</p>
        </div>
        <FieldWrapper label={t("settings.logo")}
          helpKey="admin.settings.logo">
          <div className="space-y-3">
            {logoUrl ? (
              <img src={logoUrl} alt={t("settings.logo")} className="h-16 w-auto rounded-md" />
            ) : (
              <p className="text-xs text-[var(--muted)]">{t("settings.logoEmpty")}</p>
            )}
            <input type="hidden" name="logo_url" value={logoUrl} data-no-help />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
              disabled={logoUploading}
              className="text-sm"
              data-no-help
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={handleLogoRemove} disabled={!logoUrl || logoUploading}>
                {t("settings.logoRemove")}
              </Button>
            </div>
            {logoError ? <p className="text-xs text-[var(--danger)]">{logoError}</p> : null}
            {renderError("logo_url")}
          </div>
        </FieldWrapper>

        <FieldInput
          name="whatsapp_number"
          label={t("settings.whatsappNumber")}
          helpKey="admin.settings.whatsapp_number"
          defaultValue={settings.whatsapp_number ?? ""}
          onChange={(event) => setWaNumber(event.currentTarget.value)}
        />
        {whatsappPreview ? (
          <p className="text-xs text-[var(--muted)]">{t("settings.whatsappPreview", { link: whatsappPreview })}</p>
        ) : null}
        {renderError("whatsapp_number")}

        <FieldInput
          name="primary_phone"
          label={t("settings.primaryPhone")}
          helpKey="admin.settings.primary_phone"
          defaultValue={settings.primary_phone ?? ""}
        />
        {renderError("primary_phone")}
        <FieldInput
          name="secondary_phone"
          label={t("settings.secondaryPhone")}
          helpKey="admin.settings.secondary_phone"
          defaultValue={settings.secondary_phone ?? ""}
        />
        {renderError("secondary_phone")}
        <FieldInput
          name="contact_email"
          label={t("settings.contactEmail")}
          helpKey="admin.settings.contact_email"
          defaultValue={settings.contact_email ?? ""}
          type="email"
        />
        {renderError("contact_email")}

        <FieldInput
          name="instagram_url"
          label={t("settings.instagram")}
          helpKey="admin.settings.instagram_url"
          defaultValue={settings.instagram_url ?? ""}
        />
        {renderError("instagram_url")}
        <FieldInput
          name="facebook_url"
          label={t("settings.facebook")}
          helpKey="admin.settings.facebook_url"
          defaultValue={settings.facebook_url ?? ""}
        />
        {renderError("facebook_url")}
        <FieldInput
          name="tiktok_url"
          label={t("settings.tiktok")}
          helpKey="admin.settings.tiktok_url"
          defaultValue={settings.tiktok_url ?? ""}
        />
        {renderError("tiktok_url")}
        <FieldInput
          name="youtube_url"
          label={t("settings.youtube")}
          helpKey="admin.settings.youtube_url"
          defaultValue={settings.youtube_url ?? ""}
        />
        {renderError("youtube_url")}
        <FieldInput
          name="linkedin_url"
          label={t("settings.linkedin")}
          helpKey="admin.settings.linkedin_url"
          defaultValue={settings.linkedin_url ?? ""}
        />
        {renderError("linkedin_url")}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.whatsappTemplate.title")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("settings.whatsappTemplate.hint")}</p>
        </div>
        <FieldTextarea
          name="whatsapp_message_template"
          label={t("settings.whatsappTemplate.label")}
          helpKey="admin.settings.whatsapp_message_template"
          defaultValue={settings.whatsapp_message_template ?? ""}
          className="min-h-[140px]"
        />
        {renderError("whatsapp_message_template")}
        <FieldSelect
          name="whatsapp_message_language"
          label={t("settings.whatsappTemplate.language")}
          helpKey="admin.settings.whatsapp_message_language"
          defaultValue={settings.whatsapp_message_language ?? ""}
        >
          <option value="">{t("settings.whatsappTemplate.languageAuto")}</option>
          <option value="ar">{t("lang.ar")}</option>
          <option value="en">{t("lang.en")}</option>
        </FieldSelect>
        {renderError("whatsapp_message_language")}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARS.map((variable) => (
            <button
              key={variable}
              type="button"
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
              onClick={() => {
                navigator.clipboard?.writeText(variable).then(() => push(t("settings.varCopied"))).catch(() => {});
              }}
            >
              {variable}
            </button>
          ))}
        </div>
      </Card>

      {state.errors?.form ? (
        <p className="text-sm text-[var(--danger)]">{t("settings.saveError")}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="md">
          {t("settings.save")}
        </Button>
      </div>
    </form>
  );
}
