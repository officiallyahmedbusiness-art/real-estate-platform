"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE, normalizeTheme, themeToColorScheme, type ThemeId } from "@/lib/theme";

type ThemeLabels = {
  dark: string;
  light: string;
};

function setThemeCookie(theme: ThemeId) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function applyTheme(nextTheme: ThemeId) {
  const theme = normalizeTheme(nextTheme);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = themeToColorScheme(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage errors (privacy mode, disabled storage, etc.).
  }
  setThemeCookie(theme);
}

export function ThemeSwitcher({ labels }: { labels: ThemeLabels }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "dark";
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("theme");
    } catch {
      stored = null;
    }
    const fromDom = document.documentElement.dataset.theme ?? null;
    return normalizeTheme(stored ?? fromDom);
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme: ThemeId = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? labels.light : labels.dark;

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-strong)]"
      aria-label={label}
      title={label}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path
              d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
