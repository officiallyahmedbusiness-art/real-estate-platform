"use client";

import { usePathname, useSearchParams } from "next/navigation";

type LanguageSwitcherProps = {
  locale: "ar" | "en";
  labels: {
    ar: string;
    en: string;
  };
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? labels.en : labels.ar;

  function setLocale(next: "ar" | "en") {
    const params = searchParams?.toString();
    const url = `${pathname}${params ? `?${params}` : ""}`;
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    localStorage.setItem("locale", next);
    window.location.assign(url);
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] shadow-sm transition hover:-translate-y-px md:text-sm"
      aria-label={label}
    >
      {label}
    </button>
  );
}
