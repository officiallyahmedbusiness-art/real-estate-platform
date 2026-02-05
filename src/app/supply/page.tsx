import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function SupplyLandingPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("supply.page.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("supply.page.subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">{t("supply.card.developer.title")}</h2>
            <p className="text-sm text-[var(--muted)]">{t("supply.card.developer.subtitle")}</p>
            <Link href="/supply/developer">
              <Button size="md">{t("supply.card.developer.cta")}</Button>
            </Link>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">{t("supply.card.owner.title")}</h2>
            <p className="text-sm text-[var(--muted)]">{t("supply.card.owner.subtitle")}</p>
            <Link href="/supply/owner">
              <Button size="md" variant="secondary">
                {t("supply.card.owner.cta")}
              </Button>
            </Link>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
