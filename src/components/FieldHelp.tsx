"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import { getFieldHelp } from "@/lib/fieldHelp";

const HELP_MODE_KEY = "hrtaj.helpMode";

type HelpModeContextValue = {
  helpMode: boolean;
  setHelpMode: (value: boolean) => void;
};

const HelpModeContext = createContext<HelpModeContextValue | null>(null);

export function HelpModeProvider({ children }: { children: React.ReactNode }) {
  const [helpMode, setHelpMode] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HELP_MODE_KEY) === "1";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from persisted user preference.
      setHelpMode(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HELP_MODE_KEY, helpMode ? "1" : "0");
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-help-mode", helpMode ? "1" : "0");
  }, [helpMode]);

  const value = useMemo(() => ({ helpMode, setHelpMode }), [helpMode]);

  return <HelpModeContext.Provider value={value}>{children}</HelpModeContext.Provider>;
}

export function useHelpMode() {
  const ctx = useContext(HelpModeContext);
  if (!ctx) {
    throw new Error("HelpModeProvider is missing in the tree.");
  }
  return ctx;
}

function applyLabel(text: string, label?: string) {
  if (!label) return text;
  return text.replace(/{{label}}/g, label);
}

function HelpContent({ helpKey, label }: { helpKey: string; label?: string }) {
  const entry = getFieldHelp(helpKey);

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">عنوان الحقل</p>
        <p>{applyLabel(entry.what_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الغرض من الحقل</p>
        <p>{applyLabel(entry.purpose_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الفكرة الرئيسية</p>
        <p>{applyLabel(entry.idea_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">خطوات الاستخدام</p>
        <ul className="list-disc space-y-1 ps-5">
          {entry.steps_ar.map((step) => (
            <li key={step}>{applyLabel(step, label)}</li>
          ))}
        </ul>
      </div>
      {entry.example_ar ? (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">{"\u0645\u062b\u0627\u0644"}</p>
          <p>{applyLabel(entry.example_ar, label)}</p>
        </div>
      ) : null}
      {entry.rules_ar && entry.rules_ar.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">قواعد الاستخدام</p>
          <ul className="list-disc space-y-1 ps-5">
            {entry.rules_ar.map((rule) => (
              <li key={rule}>{applyLabel(rule, label)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function FieldHelpIcon({ helpKey, label }: { helpKey: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const entry = getFieldHelp(helpKey);
  const resolvedLabel = label ?? entry.label_ar;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="field-help-icon"
        aria-label={`\u0634\u0631\u062d \u0627\u0644\u062d\u0642\u0644: ${resolvedLabel}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        i
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="field-help-backdrop"
            aria-label="\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0634\u0631\u062d"
            onClick={() => setOpen(false)}
          />
          <div className="field-help-popover">
            <div className="space-y-2">
              <p className="text-sm font-semibold">{resolvedLabel}</p>
              <HelpContent helpKey={helpKey} label={label} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function FieldHelpBlock({ helpKey, label }: { helpKey: string; label?: string }) {
  const { helpMode } = useHelpMode();
  if (!helpMode) return null;
  const entry = getFieldHelp(helpKey);
  const resolvedLabel = label ?? entry.label_ar;
  return (
    <Card className="field-help-block">
      <p className="text-sm font-semibold">{resolvedLabel}</p>
      <HelpContent helpKey={helpKey} label={label} />
    </Card>
  );
}

export function FieldWrapper({
  label,
  helpKey,
  children,
  className = "",
  labelClassName = "",
}: {
  label: string;
  helpKey?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex flex-wrap items-center gap-2 ${labelClassName}`}>
        <label className="text-sm text-[var(--muted)]">{label}</label>
        {helpKey ? <FieldHelpIcon helpKey={helpKey} label={label} /> : null}
      </div>
      {children}
      {helpKey ? <FieldHelpBlock helpKey={helpKey} label={label} /> : null}
    </div>
  );
}

export function FieldInput({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        {...props}
        className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      />
    </FieldWrapper>
  );
}

export function FieldSelect({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<"select"> & {
  label: string;
  helpKey?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <select
        {...props}
        className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

export function FieldTextarea({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  helpKey?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <textarea
        {...props}
        className={`min-h-[120px] w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      />
    </FieldWrapper>
  );
}

export function FieldCheckbox({
  label,
  helpKey,
  wrapperClassName = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input type="checkbox" {...props} />
        <span>{label}</span>
        {helpKey ? <FieldHelpIcon helpKey={helpKey} label={label} /> : null}
      </label>
      {helpKey ? <FieldHelpBlock helpKey={helpKey} label={label} /> : null}
    </div>
  );
}

export function FieldFile({
  label,
  helpKey,
  wrapperClassName = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        type="file"
        {...props}
        className="w-full rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
      />
    </FieldWrapper>
  );
}

export function HelpModeToggle({
  className = "",
  locale,
}: {
  className?: string;
  locale?: "ar" | "en";
}) {
  const { helpMode, setHelpMode } = useHelpMode();
  const resolvedLocale = locale ?? getClientLocale();
  const t = createT(resolvedLocale);

  return (
    <Button
      type="button"
      variant={helpMode ? "primary" : "secondary"}
      size="sm"
      className={className}
      onClick={() => setHelpMode(!helpMode)}
      aria-pressed={helpMode}
    >
      {helpMode ? t("help.mode.on") : t("help.mode.off")}
    </Button>
  );
}
