"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  created_at?: string | null;
  is_active?: boolean | null;
};

type Props = {
  profiles: ProfileRow[];
  actorRole: "owner" | "admin";
};

type ApiResponse = {
  ok: boolean;
  error?: string;
};

export function UserManagementList({ profiles, actorRole }: Props) {
  const locale = getClientLocale();
  const t = createT(locale);
  const [rows, setRows] = useState<ProfileRow[]>(profiles);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const isOwner = actorRole === "owner";

  const roleOptions = useMemo(
    () => [
      { value: "developer", label: t("role.developer") },
      { value: "staff", label: t("role.staff") },
      { value: "ops", label: t("role.ops") },
      { value: "agent", label: t("role.agent") },
      { value: "admin", label: t("role.admin") },
    ],
    [t]
  );

  async function handleRoleSubmit(event: React.FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    setError("");
    setBusyId(userId);
    const formData = new FormData(event.currentTarget);
    const newRole = String(formData.get("role") ?? "");

    try {
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        setError(t("admin.users.error.generic"));
        return;
      }
      setRows((prev) =>
        prev.map((row) => (row.id === userId ? { ...row, role: newRole } : row))
      );
    } catch {
      setError(t("admin.users.error.generic"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDisableToggle(userId: string, disabled: boolean) {
    setError("");
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/users/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, disabled }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        setError(t("admin.users.error.generic"));
        return;
      }
      setRows((prev) =>
        prev.map((row) => (row.id === userId ? { ...row, is_active: !disabled } : row))
      );
    } catch {
      setError(t("admin.users.error.generic"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="space-y-4">
      {rows.map((profile) => {
        const isOwnerRow = profile.role === "owner";
        const locked = isOwnerRow && !isOwner;
        const isInactive = profile.is_active === false;
        return (
          <form
            key={profile.id}
            onSubmit={(event) => handleRoleSubmit(event, profile.id)}
            className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 last:border-none"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{profile.full_name ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.id}</p>
                <p className="text-xs text-[var(--muted)]">{profile.created_at ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.email ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.phone ?? "-"}</p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {isOwnerRow ? <Badge>{t("admin.users.locked")}</Badge> : null}
                {isInactive ? <Badge>{t("admin.users.disabled")}</Badge> : null}
                <FieldSelect
                  label={t("admin.users.role")}
                  helpKey="admin.users.role"
                  name="role"
                  defaultValue={profile.role ?? "staff"}
                  disabled={locked}
                  wrapperClassName="min-w-[180px]"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FieldSelect>
                <Button size="sm" variant="secondary" type="submit" disabled={locked || busyId === profile.id}>
                  {t("admin.users.update")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  disabled={locked || busyId === profile.id}
                  onClick={() => handleDisableToggle(profile.id, !isInactive)}
                >
                  {isInactive ? t("admin.users.enable") : t("admin.users.disable")}
                </Button>
              </div>
            </div>
          </form>
        );
      })}
      {error ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
          {error}
        </div>
      ) : null}
    </Card>
  );
}
