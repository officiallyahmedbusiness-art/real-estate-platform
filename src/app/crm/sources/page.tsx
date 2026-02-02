import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createLeadSourceAction, toggleLeadSourceAction } from "./actions";

export default async function CrmSourcesPage() {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/sources");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: sourcesData } = await supabase
    .from("lead_sources")
    .select("id, slug, name, is_active, created_at")
    .order("created_at", { ascending: false });
  const sources = sourcesData ?? [];

  const canManage = role === "admin" || role === "owner";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.sources.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.sources.subtitle")}</p>
          </div>
          <Link href="/crm">
            <Button size="sm" variant="secondary">
              {t("crm.nav.leads")}
            </Button>
          </Link>
        </div>

        {canManage ? (
          <Card className="space-y-4">
            <form action={createLeadSourceAction} className="grid gap-3 md:grid-cols-3">
              <Input name="slug" placeholder={t("crm.sources.slug")} />
              <Input name="name" placeholder={t("crm.sources.name")} />
              <Button type="submit" size="sm">
                {t("crm.sources.add")}
              </Button>
            </form>
          </Card>
        ) : null}

        <Section title={t("crm.sources.title")} subtitle={t("crm.sources.subtitle")}>
          <div className="grid gap-3">
            {sources.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.sources.empty")}</p>
            ) : (
              sources.map((source) => (
                <Card key={source.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{source.name}</p>
                    <p className="text-xs text-[var(--muted)]">{source.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{source.is_active ? t("crm.sources.active") : t("crm.sources.inactive")}</Badge>
                    {canManage ? (
                      <form action={toggleLeadSourceAction}>
                        <input type="hidden" name="id" value={source.id} />
                        <input type="hidden" name="is_active" value={source.is_active ? "0" : "1"} />
                        <Button size="sm" variant="secondary">
                          {t("crm.sources.toggle")}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </Card>
              ))
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
