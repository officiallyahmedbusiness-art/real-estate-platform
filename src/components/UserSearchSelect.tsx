"use client";

import { useMemo, useState } from "react";
import { FieldInput } from "@/components/FieldHelp";
import { Button } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

export type UserSearchOption = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role?: string | null;
};

type Props = {
  users: UserSearchOption[];
  name?: string;
  label: string;
  helpKey?: string;
  placeholder?: string;
  required?: boolean;
};

function formatUser(option: UserSearchOption) {
  const primary = option.full_name || option.email || option.phone || option.id.slice(0, 8);
  const secondary = [option.email, option.phone].filter(Boolean).join(" - ");
  return secondary ? `${primary} (${secondary})` : primary;
}

export function UserSearchSelect({
  users,
  name = "user_id",
  label,
  helpKey,
  placeholder,
  required = false,
}: Props) {
  const locale = getClientLocale();
  const t = createT(locale);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const selected = users.find((user) => user.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 8);
    return users
      .filter((user) => {
        const hay = [user.full_name, user.email, user.phone, user.id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }, [query, users]);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <FieldInput
        name={`${name}_search`}
        label={label}
        helpKey={helpKey}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {selected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
          <span className="text-[var(--muted)]">{t("admin.partners.selectedUser")}</span>
          <span className="font-semibold">{formatUser(selected)}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedId("");
              setQuery("");
            }}
          >
            {t("admin.partners.clearSelection")}
          </Button>
        </div>
      ) : null}
      <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">{t("crm.leads.empty")}</p>
        ) : (
          filtered.map((user) => (
            <button
              key={user.id}
              type="button"
              className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-start text-xs text-[var(--text)] transition hover:border-[var(--accent)]"
              onClick={() => {
                setSelectedId(user.id);
                setQuery(formatUser(user));
              }}
            >
              <span className="font-semibold">
                {user.full_name || user.email || user.phone || user.id.slice(0, 8)}
              </span>
              <span className="text-[var(--muted)]">
                {[user.email, user.phone].filter(Boolean).join(" - ") || user.id}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
