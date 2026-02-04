import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createActivityAction } from "./actions";

const ACTIVITY_TYPES = [
  { value: "call_attempted", labelKey: "crm.activity.type.call_attempted" },
  { value: "call_answered", labelKey: "crm.activity.type.call_answered" },
  { value: "meeting", labelKey: "crm.activity.type.meeting" },
  { value: "note", labelKey: "crm.activity.type.note" },
  { value: "follow_up", labelKey: "crm.activity.type.follow_up" },
  { value: "whatsapp", labelKey: "crm.activity.type.whatsapp" },
  { value: "email", labelKey: "crm.activity.type.email" },
];

export default async function CrmActivitiesPage() {
  await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/activities");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: activitiesData } = await supabase
    .from("lead_activities")
    .select("id, lead_id, customer_id, activity_type, outcome, notes, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(80);
  const activities = activitiesData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(60);
  const leads = leadsData ?? [];

  const { data: customersData } = await supabase
    .from("customers")
    .select("id, full_name, phone_e164")
    .order("created_at", { ascending: false })
    .limit(60);
  const customers = customersData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.activities.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.activities.subtitle")}</p>
          </div>
          <Link href="/crm">
            <Button size="sm" variant="secondary">
              {t("crm.nav.leads")}
            </Button>
          </Link>
        </div>

        <Card className="space-y-4">
          <form action={createActivityAction} className="grid gap-3 md:grid-cols-4">
            <FieldSelect
              name="activity_type"
              label={t("crm.activities.type")}
              helpKey="crm.activities.type"
              defaultValue=""
            >
              <option value="">{t("crm.activities.type")}</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="lead_id"
              label={t("crm.activities.lead")}
              helpKey="crm.activities.lead"
              defaultValue=""
            >
              <option value="">{t("crm.activities.lead")}</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="customer_id"
              label={t("crm.activities.customer")}
              helpKey="crm.activities.customer"
              defaultValue=""
            >
              <option value="">{t("crm.activities.customer")}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name ?? customer.phone_e164 ?? customer.id}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="occurred_at"
              label={t("crm.activities.occurred_at")}
              helpKey="crm.activities.occurred_at"
              type="datetime-local"
            />
            <FieldInput
              name="outcome"
              label={t("crm.activities.outcome")}
              helpKey="crm.activities.outcome"
              placeholder={t("crm.activities.outcome")}
              wrapperClassName="md:col-span-2"
            />
            <FieldTextarea
              name="notes"
              label={t("crm.activities.notes")}
              helpKey="crm.activities.notes"
              placeholder={t("crm.activities.notes")}
              wrapperClassName="md:col-span-3"
            />
            <Button type="submit" size="sm">
              {t("crm.activities.create")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.activities.title")} subtitle={t("crm.activities.subtitle")}>
          <div className="grid gap-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.activities.empty")}</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} className="space-y-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge>{t(`crm.activity.type.${activity.activity_type}` as const)}</Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(activity.occurred_at).toLocaleString(locale)}
                    </span>
                  </div>
                  {activity.outcome ? <p>{activity.outcome}</p> : null}
                  {activity.notes ? <p className="text-xs text-[var(--muted)]">{activity.notes}</p> : null}
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
