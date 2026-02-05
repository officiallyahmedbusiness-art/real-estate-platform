import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function AdminFlagsPage() {
  await requireRole(["owner", "admin"], "/admin/flags");
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  const items = [
    { key: "enableCompare", value: flags.enableCompare },
    { key: "enableSavedSearch", value: flags.enableSavedSearch },
    { key: "enableEnglish", value: flags.enableEnglish },
    { key: "enableLeadCRM", value: flags.enableLeadCRM },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("admin.flags.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("admin.flags.subtitle")}</p>
        </div>

        <Card className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="font-medium">{item.key}</span>
              <span className={item.value ? "text-[var(--success)]" : "text-[var(--muted)]"}>
                {item.value ? t("admin.flags.enabled") : t("admin.flags.disabled")}
              </span>
            </div>
          ))}
        </Card>

        <Link href="/admin" className="text-sm text-[var(--muted)] underline">
          {t("admin.homepage.back")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
