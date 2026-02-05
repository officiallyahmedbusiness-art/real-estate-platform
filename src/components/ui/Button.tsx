import type { ComponentPropsWithoutRef } from "react";

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
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export type { ButtonSize, ButtonVariant };
