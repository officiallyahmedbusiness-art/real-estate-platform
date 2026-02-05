"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type InviteResponse = {
  ok: boolean;
  inviteLink?: string | null;
  error?: string;
};

type InviteUserFormProps = {
  endpoint?: string;
};

export function InviteUserForm({ endpoint = "/api/owner/users" }: InviteUserFormProps) {
  const locale = getClientLocale();
  const t = createT(locale);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInviteLink("");
    setCopied(false);
    setSuccess(false);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? ""),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as InviteResponse;
      if (!res.ok || !data.ok) {
        const code = data.error ?? "invite_failed";
        const key = `owner.users.invite.error.${code}` as const;
        const message = t(key);
        setError(message === key ? t("owner.users.invite.error.invite_failed") : message);
        return;
      }
      if (data.inviteLink) {
        setInviteLink(data.inviteLink);
      }
      if (!data.inviteLink) {
        setSuccess(true);
      }
      form.reset();
    } catch {
      setError(t("owner.users.invite.error.invite_failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <FieldInput
          name="full_name"
          label={t("owner.users.invite.full_name")}
          helpKey="owner.users.invite.full_name"
          placeholder={t("owner.users.invite.full_name")}
          required
        />
        <FieldInput
          name="phone"
          label={t("owner.users.invite.phone")}
          helpKey="owner.users.invite.phone"
          placeholder={t("owner.users.invite.phone")}
        />
        <FieldInput
          name="email"
          label={t("owner.users.invite.email")}
          helpKey="owner.users.invite.email"
          placeholder={t("owner.users.invite.email")}
          type="email"
          required
        />
        <FieldSelect
          name="role"
          label={t("owner.users.invite.role")}
          helpKey="owner.users.invite.role"
          defaultValue="staff"
          required
        >
          <option value="staff">{t("role.staff")}</option>
          <option value="admin">{t("role.admin")}</option>
        </FieldSelect>
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? t("owner.users.invite.loading") : t("owner.users.invite.submit")}
          </Button>
        </div>
      </form>

      {inviteLink ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">{t("owner.users.invite.link")}</p>
          <div className="flex flex-wrap gap-2">
            <Input value={inviteLink} readOnly className="flex-1" data-no-help />
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? t("owner.users.invite.copied") : t("owner.users.invite.copy")}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] p-3 text-sm">
          {t("owner.users.invite.success")}
        </div>
      ) : null}
    </Card>
  );
}
