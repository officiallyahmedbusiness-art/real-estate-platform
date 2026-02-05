"use client";

type LanguageSwitcherProps = {
  locale: "ar" | "en";
  labels: {
    ar: string;
    en: string;
  };
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? labels.en : labels.ar;

  function setLocale(next: "ar" | "en") {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)] shadow-sm transition hover:-translate-y-px sm:px-3 sm:text-xs md:py-1.5 md:text-sm"
      aria-label={label}
    >
      {label}
    </button>
  );
}
