/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import Script from "next/script";
import { THEME_COOKIE } from "@/lib/theme";

export function ThemeScript() {
  const script = `
    (() => {
      try {
        const getCookie = (name) => {
          const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
          return match ? decodeURIComponent(match[1]) : null;
        };
        const cookieTheme = getCookie('${THEME_COOKIE}');
        const stored = localStorage.getItem('theme');
        const theme = cookieTheme || stored || 'dark';
        const normalized = theme === 'light' || theme === 'dark' ? theme : 'dark';
        const root = document.documentElement;
        root.dataset.theme = normalized;
        root.style.colorScheme = normalized === 'light' ? 'light' : 'dark';
        if (!cookieTheme) {
          document.cookie = '${THEME_COOKIE}=' + normalized + '; path=/; max-age=31536000; samesite=lax';
        }
      } catch (e) {
        const root = document.documentElement;
        root.dataset.theme = 'dark';
        root.style.colorScheme = 'dark';
      }
    })();
  `;

  return (
    <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: script }} />
  );
}
