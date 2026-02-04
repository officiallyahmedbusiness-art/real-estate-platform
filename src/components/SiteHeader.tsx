import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { HelpModeToggle } from "@/components/FieldHelp";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getSiteSettings } from "@/lib/settings";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

type HeaderRole =
  | "guest"
  | "developer"
  | "owner"
  | "admin"
  | "ops"
  | "staff"
  | "agent";

export async function SiteHeader() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data?.user ?? null;

  let role: HeaderRole = "guest";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as HeaderRole) ?? "guest";
  }

  const isAuthed = role !== "guest";
  const isDeveloperPortal =
    role === "developer" || role === "admin" || role === "ops" || role === "staff" || role === "owner";
  const isAdmin = role === "admin" || role === "owner";
  const isStaff = role === "admin" || role === "ops" || role === "staff" || role === "owner";
  const isAgent = role === "agent";
  const isCrmUser = isStaff || isAgent;
  const showDeveloperAds = role === "developer";
  const showAdminAds = isAdmin;
  const settings = await getSiteSettings();
  const whatsappLink = settings.whatsapp_link || null;

  const themeLabels = {
    dark: t("theme.dark"),
    light: t("theme.light"),
  };

  const langLabels = {
    ar: t("lang.ar"),
    en: t("lang.en"),
  };

  const currentLayer =
    role === "owner"
      ? t("layer.owner")
      : role === "admin"
        ? t("layer.admin")
        : role === "developer"
          ? t("layer.developer")
          : role === "ops" || role === "staff" || role === "agent"
            ? t("layer.staff")
            : t("layer.public");

  const layerOptions = [
    { href: "/", label: t("layer.public") },
    { href: "/listings", label: t("nav.listings") },
    ...(isDeveloperPortal ? [{ href: "/developer", label: t("layer.developer") }] : []),
    ...(showDeveloperAds ? [{ href: "/developer/ads", label: t("nav.ads") }] : []),
    ...(isStaff ? [{ href: "/staff", label: t("layer.staff") }] : []),
    ...(isCrmUser ? [{ href: "/crm", label: t("nav.crm") }] : []),
    ...(isAdmin ? [{ href: "/admin", label: t("layer.admin") }] : []),
    ...(showAdminAds ? [{ href: "/admin/ads", label: t("nav.ads") }] : []),
    ...(isAdmin ? [{ href: "/admin/reports", label: t("nav.reports") }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-3 lg:py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Logo name={t("brand.name")} imageClassName="h-8 sm:h-10 md:h-12" />
            </Link>
            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] lg:inline-flex">
              {t("brand.tagline")}
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher locale={locale} labels={langLabels} />
            <ThemeSwitcher labels={themeLabels} />
            <HelpModeToggle />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <details className="group relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] shadow-[var(--shadow)]">
                <span className="text-[var(--muted)]">{t("layer.current")}</span>
                <span>{currentLayer}</span>
              </summary>
              <div className="absolute right-0 mt-2 min-w-[180px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow)]">
                {layerOptions.map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </details>
            <LanguageSwitcher locale={locale} labels={langLabels} />
            <ThemeSwitcher labels={themeLabels} />
            <HelpModeToggle />
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
              >
                {t("nav.dashboard")}
              </Link>
            ) : null}
          </div>
        </div>

        <nav className="hidden items-center gap-5 pb-4 text-sm font-medium text-[var(--muted)] lg:flex">
          <Link href="/listings" className="hover:text-[var(--text)]">
            {t("nav.listings")}
          </Link>
          <Link href="/about" className="hover:text-[var(--text)]">
            {t("nav.about")}
          </Link>
          <Link href="/careers" className="hover:text-[var(--text)]">
            {t("nav.careers")}
          </Link>
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
              {t("nav.contact")}
            </a>
          ) : null}
          {isDeveloperPortal ? (
            <Link href="/developer" className="hover:text-[var(--text)]">
              {t("nav.partners")}
            </Link>
          ) : null}
          {showDeveloperAds ? (
            <Link href="/developer/ads" className="hover:text-[var(--text)]">
              {t("nav.ads")}
            </Link>
          ) : null}
          {isStaff ? (
            <Link href="/staff" className="hover:text-[var(--text)]">
              {t("nav.staff")}
            </Link>
          ) : null}
          {isCrmUser ? (
            <Link href="/crm" className="hover:text-[var(--text)]">
              {t("nav.crm")}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="hover:text-[var(--text)]">
              {t("nav.admin")}
            </Link>
          ) : null}
          {showAdminAds ? (
            <Link href="/admin/ads" className="hover:text-[var(--text)]">
              {t("nav.ads")}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin/reports" className="hover:text-[var(--text)]">
              {t("nav.reports")}
            </Link>
          ) : null}
          {isAuthed ? (
            <Link href="/account" className="hover:text-[var(--text)]">
              {t("nav.account")}
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 lg:hidden">
        <details className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
          <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-[var(--text)] sm:text-sm">
            {t("nav.menu")}
            <span className="transition group-open:rotate-180">v</span>
          </summary>
          <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
            <Link href="/listings" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
              {t("nav.listings")}
            </Link>
            <Link href="/about" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
              {t("nav.about")}
            </Link>
            <Link href="/careers" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
              {t("nav.careers")}
            </Link>
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]"
              >
                {t("nav.contact")}
              </a>
            ) : null}
            {isDeveloperPortal ? (
              <Link href="/developer" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.partners")}
              </Link>
            ) : null}
            {showDeveloperAds ? (
              <Link href="/developer/ads" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.ads")}
              </Link>
            ) : null}
            {isStaff ? (
              <Link href="/staff" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.staff")}
              </Link>
            ) : null}
            {isCrmUser ? (
              <Link href="/crm" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.crm")}
              </Link>
            ) : null}
            {isAdmin ? (
              <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.admin")}
              </Link>
            ) : null}
            {showAdminAds ? (
              <Link href="/admin/ads" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.ads")}
              </Link>
            ) : null}
            {isAdmin ? (
              <Link href="/admin/reports" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.reports")}
              </Link>
            ) : null}
            {isAuthed ? (
              <Link href="/account" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                {t("nav.account")}
              </Link>
            ) : null}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs font-semibold text-[var(--muted)]">
              {t("layer.current")}: {currentLayer}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <LanguageSwitcher locale={locale} labels={langLabels} />
              <ThemeSwitcher labels={themeLabels} />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

