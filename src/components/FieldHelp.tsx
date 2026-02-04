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
  const [helpMode, setHelpMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(HELP_MODE_KEY) === "1";
    } catch {
      return false;
    }
  });

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

function HelpContent({ helpKey }: { helpKey: string }) {
  const entry = getFieldHelp(helpKey);

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">عنوان الحقل</p>
        <p>{entry.what_ar}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الغرض من الحقل</p>
        <p>{entry.purpose_ar}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الفكرة الرئيسية</p>
        <p>{entry.idea_ar}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">خطوات التوضيح</p>
        <ul className="list-disc space-y-1 ps-5">
          {entry.steps_ar.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
      {entry.example_ar ? (
        <div>
      <p className="text-xs font-semibold text-[var(--muted)]">مثال</p>
          <p>{entry.example_ar}</p>
        </div>
      ) : null}
      {entry.rules_ar && entry.rules_ar.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">قواعد استخدام</p>
          <ul className="list-disc space-y-1 ps-5">
            {entry.rules_ar.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function FieldHelpIcon({ helpKey }: { helpKey: string }) {
  const [open, setOpen] = useState(false);
  const entry = getFieldHelp(helpKey);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="field-help-icon"
        aria-label={`?????? ?????: ${entry.label_ar}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        i
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="field-help-backdrop"
            aria-label="????? ????????"
            onClick={() => setOpen(false)}
          />
          <div className="field-help-popover">
            <div className="space-y-2">
              <p className="text-sm font-semibold">{entry.label_ar}</p>
              <HelpContent helpKey={helpKey} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function FieldHelpBlock({ helpKey }: { helpKey: string }) {
  const { helpMode } = useHelpMode();
  if (!helpMode) return null;
  const entry = getFieldHelp(helpKey);
  return (
    <Card className="field-help-block">
      <p className="text-sm font-semibold">{entry.label_ar}</p>
      <HelpContent helpKey={helpKey} />
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
  helpKey: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex items-center gap-2 ${labelClassName}`}>
        <label className="text-sm text-[var(--muted)]">{label}</label>
        <FieldHelpIcon helpKey={helpKey} />
      </div>
      {children}
      <FieldHelpBlock helpKey={helpKey} />
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
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        {...props}
        className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
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
  helpKey: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <select
        {...props}
        className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
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
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <textarea
        {...props}
        className={`min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
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
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input type="checkbox" {...props} />
        <span>{label}</span>
        <FieldHelpIcon helpKey={helpKey} />
      </label>
      <FieldHelpBlock helpKey={helpKey} />
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
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        type="file"
        {...props}
        className="w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
      />
    </FieldWrapper>
  );
}

export function HelpModeToggle({ className = "" }: { className?: string }) {
  const { helpMode, setHelpMode } = useHelpMode();
  const locale = getClientLocale();
  const t = createT(locale);

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
