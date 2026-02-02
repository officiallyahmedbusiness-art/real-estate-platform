import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { ImportClient } from "./ImportClient";

export default async function StaffImportPage() {
  await requireRole(["owner", "admin", "ops", "staff"], "/staff/import");
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("staff.import.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("staff.import.subtitle")}</p>
          </div>
          <Link href="/staff">
            <Button size="sm" variant="secondary">
              {t("staff.actions.back")}
            </Button>
          </Link>
        </div>

        <ImportClient
          type="resale"
          labels={{
            format: t("staff.import.format"),
            notes: t("staff.import.notes"),
            submit: t("staff.import.submit"),
            loading: t("staff.import.loading"),
            rowsTotal: t("staff.import.rowsTotal"),
            rowsInserted: t("staff.import.rowsInserted"),
            rowsUpdated: t("staff.import.rowsUpdated"),
            rowsFailed: t("staff.import.rowsFailed"),
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
