import type { ComponentPropsWithoutRef } from "react";

export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:p-5 ${className}`}
      {...props}
    />
  );
}
