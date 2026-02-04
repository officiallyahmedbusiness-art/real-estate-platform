import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-full bg-[var(--surface-2)]" />
            <div className="h-4 w-56 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-full bg-[var(--surface-2)]" />
            <div className="h-9 w-20 rounded-full bg-[var(--surface-2)]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-full bg-[var(--surface-2)]" />
              <div className="h-4 w-48 rounded-full bg-[var(--surface-2)]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-xl bg-[var(--surface-2)]" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]"
            >
              <div className="h-40 rounded-xl bg-[var(--surface-2)]" />
              <div className="mt-4 h-5 w-2/3 rounded-full bg-[var(--surface-2)]" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-[var(--surface-2)]" />
              <div className="mt-4 h-9 w-28 rounded-full bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      </main>
      <SiteFooter showFloating />
    </div>
  );
}
