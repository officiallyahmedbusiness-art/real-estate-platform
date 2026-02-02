export type ThemeId = "dark" | "light";

export const THEME_COOKIE = "theme";

export function normalizeTheme(value?: string | null): ThemeId {
  if (value === "light" || value === "dark") return value;
  return "dark";
}

export function themeToColorScheme(theme: ThemeId) {
  return theme === "light" ? "light" : "dark";
}
