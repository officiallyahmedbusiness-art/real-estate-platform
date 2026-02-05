import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ComparePage } from "@/components/compare/ComparePage";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function CompareRoute() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  if (!flags.enableCompare) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-[var(--muted)]">{t("compare.disabled")}</p>
        </main>
        <SiteFooter showCompare />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("compare.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("compare.subtitle")}</p>
        </div>
        <ComparePage labels={{ empty: t("compare.empty") }} />
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}
