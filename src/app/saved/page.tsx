import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SavedListings } from "@/components/favorites/SavedListings";
import { FavoritesSyncBanner } from "@/components/favorites/FavoriteButton";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getSiteSettings } from "@/lib/settings";
import { getFlags } from "@/lib/flags";

export default async function SavedPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const settings = await getSiteSettings();
  const flags = getFlags();
  const callNumber = settings.primary_phone ?? settings.whatsapp_number;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("saved.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("saved.subtitle")}</p>
        </div>
        <FavoritesSyncBanner
          labels={{
            title: t("saved.syncPrompt"),
            action: t("saved.syncAction"),
            done: t("saved.syncDone"),
          }}
        />
        <SavedListings
          locale={locale}
          whatsappNumber={settings.whatsapp_number}
          whatsappTemplate={settings.whatsapp_message_template}
          callNumber={callNumber}
          enableCompare={flags.enableCompare}
        />
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}
