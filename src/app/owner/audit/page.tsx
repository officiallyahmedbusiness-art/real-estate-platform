import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireOwnerAccess } from "@/lib/owner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function OwnerAuditPage({
  searchParams,
}: {
  searchParams?: {
    action?: string;
    entity_type?: string;
    actor_user_id?: string;
    from?: string;
    to?: string;
  };
}) {
  await requireOwnerAccess("/owner/audit");
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("audit_log")
    .select(
      "id, created_at, action, entity_type, entity_id, metadata, actor_user_id, profiles(full_name, email, staff_code)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (searchParams?.action) {
    query = query.eq("action", searchParams.action);
  }
  if (searchParams?.entity_type) {
    query = query.eq("entity_type", searchParams.entity_type);
  }
  if (searchParams?.actor_user_id) {
    query = query.eq("actor_user_id", searchParams.actor_user_id);
  }
  if (searchParams?.from) {
    query = query.gte("created_at", searchParams.from);
  }
  if (searchParams?.to) {
    query = query.lte("created_at", searchParams.to);
  }

  const { data } = await query;
  const entries = data ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">{t("owner.audit.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("owner.audit.subtitle")}</p>
        </div>

        <Section title={t("owner.audit.filters")} subtitle={t("owner.audit.filtersHint")}>
          <Card>
            <form className="grid gap-3 md:grid-cols-6">
              <Input name="action" placeholder={t("owner.audit.action")} defaultValue={searchParams?.action ?? ""} />
              <Input
                name="entity_type"
                placeholder={t("owner.audit.entity")}
                defaultValue={searchParams?.entity_type ?? ""}
              />
              <Input
                name="actor_user_id"
                placeholder={t("owner.audit.actor")}
                defaultValue={searchParams?.actor_user_id ?? ""}
              />
              <Input name="from" type="date" defaultValue={searchParams?.from ?? ""} />
              <Input name="to" type="date" defaultValue={searchParams?.to ?? ""} />
              <Button type="submit" size="sm">
                {t("owner.audit.apply")}
              </Button>
            </form>
          </Card>
        </Section>

        <Section title={t("owner.audit.table")} subtitle={t("owner.audit.tableHint")}>
          {entries.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("owner.audit.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {entries.map((entry) => {
                const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
                return (
                  <Card key={entry.id} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{entry.action}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {entry.entity_type} · {entry.entity_id ?? "-"}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {profile?.full_name ?? "-"} · {profile?.email ?? "-"} ·{" "}
                      {profile?.staff_code ?? "-"}
                    </div>
                    <pre className="rounded-xl bg-[var(--surface)] p-3 text-xs text-[var(--muted)] overflow-auto">
                      {JSON.stringify(entry.metadata ?? {}, null, 2)}
                    </pre>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

