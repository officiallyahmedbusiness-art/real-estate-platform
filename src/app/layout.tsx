import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cairo, Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { HelpModeProvider } from "@/components/FieldHelp";
import { DebugCursorInspector } from "@/components/DebugCursorInspector";
import { ThemeScript } from "@/components/ThemeScript";
import { HeaderScroll } from "@/components/HeaderScroll";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createT } from "@/lib/i18n";
import { getServerDir, getServerLocale } from "@/lib/i18n.server";
import { THEME_COOKIE, normalizeTheme, themeToColorScheme } from "@/lib/theme";
import { getPublicBaseUrl } from "@/lib/paths";
import { buildLocalBusinessJsonLd } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/settings";

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
  const baseUrl = getPublicBaseUrl();

  return {
    title: `${t("brand.name")} | ${t("brand.domain")}`,
    description: t("brand.tagline"),
    alternates: baseUrl
      ? {
          canonical: baseUrl,
          languages: {
            ar: `${baseUrl}/?lang=ar`,
            en: `${baseUrl}/?lang=en`,
          },
        }
      : undefined,
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
  const t = createT(locale);
  const dir = getServerDir(locale);
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const colorScheme = themeToColorScheme(theme);
  const showDebugCursor = process.env.NODE_ENV === "development";
  const baseUrl = getPublicBaseUrl() || null;
  const settings = await getSiteSettings();
  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    name: t("brand.name"),
    url: baseUrl,
    address: settings.office_address ?? null,
    locale,
  });

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      style={{ colorScheme }}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${notoSansArabic.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <HelpModeProvider>
              <HeaderScroll />
              {children}
              {showDebugCursor ? <DebugCursorInspector /> : null}
            </HelpModeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}




