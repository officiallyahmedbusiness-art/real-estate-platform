import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { ImportClient } from "@/app/staff/import/ImportClient";

export default async function DeveloperImportPage() {
  await requireRole(["owner", "developer", "admin"], "/developer/import");
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("developer.import.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("developer.import.subtitle")}</p>
          </div>
          <Link href="/developer">
            <Button size="sm" variant="secondary">
              {t("developer.edit.back")}
            </Button>
          </Link>
        </div>

        <ImportClient
          type="projects"
          labels={{
            format: t("developer.import.format"),
            notes: t("developer.import.notes"),
            submit: t("developer.import.submit"),
            loading: t("developer.import.loading"),
            rowsTotal: t("developer.import.rowsTotal"),
            rowsInserted: t("developer.import.rowsInserted"),
            rowsUpdated: t("developer.import.rowsUpdated"),
            rowsFailed: t("developer.import.rowsFailed"),
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
