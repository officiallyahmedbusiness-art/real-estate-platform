import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function SupplyDeveloperPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("supply.developer.portal.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("supply.developer.portal.subtitle")}</p>
        </div>
        <Card className="space-y-4">
          <p className="text-sm text-[var(--muted)]">{t("supply.developer.portal.note")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/team/login">
              <Button>{t("supply.developer.portal.cta")}</Button>
            </Link>
            <Link href="/callback">
              <Button variant="secondary">{t("supply.developer.portal.callback")}</Button>
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
