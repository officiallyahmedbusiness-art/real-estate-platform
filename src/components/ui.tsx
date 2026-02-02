import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[var(--shadow)] hover:brightness-105 border border-transparent",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)]",
  ghost:
    "bg-transparent text-[var(--text)] hover:bg-[var(--accent-soft)] border border-transparent",
  danger:
    "bg-[rgba(244,63,94,0.15)] text-[var(--danger)] hover:bg-[rgba(244,63,94,0.25)] border border-[rgba(244,63,94,0.35)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:p-5 ${className}`}
      {...props}
    />
  );
}

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
      className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
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
      className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
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
      className={`min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
      {children}
    </span>
  );
}

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
