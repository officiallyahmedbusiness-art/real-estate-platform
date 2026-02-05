import type { ReactNode } from "react";

export function ListingsGrid({ children, view }: { children: ReactNode; view: "grid" | "list" }) {
  if (view === "list") {
    return <div className="grid gap-4">{children}</div>;
  }
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
