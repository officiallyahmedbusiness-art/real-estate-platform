import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SavedSearchesList } from "@/components/search/SavedSearchesList";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function SavedSearchesPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  if (!flags.enableSavedSearch) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-[var(--muted)]">{t("savedSearch.disabled")}</p>
        </main>
        <SiteFooter showCompare />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("savedSearch.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("savedSearch.subtitle")}</p>
        </div>
        <SavedSearchesList
          labels={{
            empty: t("savedSearch.empty"),
            run: t("savedSearch.run"),
            remove: t("savedSearch.remove"),
            lastRun: t("savedSearch.lastRun"),
          }}
        />
      </main>
      <SiteFooter showCompare />
    </div>
  );
}
