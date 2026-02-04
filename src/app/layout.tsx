import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cairo, Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { HelpModeProvider } from "@/components/FieldHelp";
import { DebugCursorInspector } from "@/components/DebugCursorInspector";
import { ThemeScript } from "@/components/ThemeScript";
import { HeaderScroll } from "@/components/HeaderScroll";
import { createT } from "@/lib/i18n";
import { getServerDir, getServerLocale } from "@/lib/i18n.server";
import { THEME_COOKIE, normalizeTheme, themeToColorScheme } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = createT(locale);

  return {
    title: `${t("brand.name")} | ${t("brand.domain")}`,
    description: t("brand.tagline"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = getServerDir(locale);
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const colorScheme = themeToColorScheme(theme);
  const showDebugCursor = process.env.NODE_ENV === "development";

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      style={{ colorScheme }}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${notoSansArabic.variable} antialiased`}
      >
        <HelpModeProvider>
          <HeaderScroll />
          {children}
          {showDebugCursor ? <DebugCursorInspector /> : null}
        </HelpModeProvider>
      </body>
    </html>
  );
}




