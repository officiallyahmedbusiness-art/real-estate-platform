import { requireRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  await requireRole(["owner", "admin"], "/admin/settings");
  const locale = await getServerLocale();
  const t = createT(locale);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("settings.subtitle")}</p>
        </div>
        <SettingsForm settings={settings} t={t} />
      </main>
      <SiteFooter />
    </div>
  );
}
