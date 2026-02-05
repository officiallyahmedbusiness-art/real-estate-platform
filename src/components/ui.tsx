import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function Section({
  title,
  subtitle,
  kicker,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {kicker}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-[var(--text)] sm:text-xl">{title}</h2>
          {subtitle ? (
            <p className="text-xs text-[var(--muted)] sm:text-sm">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Input({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`min-h-[120px] w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export { Button, Card, Badge, Skeleton };

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
    </Card>
  );
}
