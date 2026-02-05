"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">حصل خطأ غير متوقع</h2>
      <p className="text-sm text-[var(--muted)]">من فضلك جرّب مرة تانية.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
