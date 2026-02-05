import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validators";
import { updateCustomerAction } from "./actions";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";

export default async function CrmCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { role, user } = await requireRole(
    ["owner", "admin", "ops", "staff", "agent"],
    `/crm/customers/${id}`
  );
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManageCustomer = isOwner || isAdmin;
  const canViewFullCustomer = isOwner || isAdmin;

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic select strings from masked views.
  const supabaseAny = supabase as any;
  const locale = await getServerLocale();
  const t = createT(locale);
  const leadsTable = canViewFullCustomer ? "leads" : "leads_masked";
  const customersTable = canViewFullCustomer ? "customers" : "customers_masked";

  const customerSelect = canViewFullCustomer
    ? "id, full_name, phone_raw, phone_e164, email, intent, preferred_areas, budget_min, budget_max, lead_source, created_at"
    : "id, full_name, phone_e164, email, intent, preferred_areas, budget_min, budget_max, lead_source, created_at";

  const { data: customer } = await supabaseAny
    .from(customersTable)
    .select(customerSelect)
    .eq("id", id)
    .maybeSingle();
  if (!customer) notFound();

  const { data: piiRequestsData } = isAdmin
    ? await supabase
        .from("pii_change_requests")
        .select("id, status, requested_at, review_note")
        .eq("table_name", "customers")
        .eq("row_id", id)
        .eq("requested_by", user.id)
        .order("requested_at", { ascending: false })
        .limit(5)
    : { data: [] as Array<{ id: string; status: string; requested_at: string; review_note: string | null }> };
  const piiRequests = piiRequestsData ?? [];

  const leadSelect = canViewFullCustomer
    ? "id, status, lead_source, created_at, listings(title)"
    : "id, status, lead_source, created_at, listing_title";
  type LeadRow = {
    id: string;
    status: string | null;
    lead_source: string | null;
    created_at: string;
    listings?: { title: string | null } | { title: string | null }[] | null;
    listing_title?: string | null;
  };
  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select(leadSelect)
    .eq("customer_id", id)
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as LeadRow[];

  const { data: activitiesData } = await supabase
    .from("lead_activities")
    .select("id, activity_type, occurred_at, outcome, notes")
    .eq("customer_id", id)
    .order("occurred_at", { ascending: false })
    .limit(20);
  const activities = activitiesData ?? [];

  const budgetLabel =
    customer.budget_min || customer.budget_max
      ? `${customer.budget_min ? formatPrice(customer.budget_min, "EGP", locale) : ""}${
          customer.budget_min && customer.budget_max ? " - " : ""
        }${customer.budget_max ? formatPrice(customer.budget_max, "EGP", locale) : ""}`
      : "-";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{customer.full_name ?? "-"}</h1>
            <p className="text-sm text-[var(--muted)]">{customer.phone_e164 ?? "-"}</p>
          </div>
          <Link href="/crm/customers">
            <Button size="sm" variant="secondary">
              {t("staff.actions.back")}
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.intent")}</p>
            <p className="text-sm font-semibold">{customer.intent ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.area")}</p>
            <p className="text-sm font-semibold">{customer.preferred_areas?.[0] ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.budget")}</p>
            <p className="text-sm font-semibold">{budgetLabel}</p>
          </Card>
        </div>

        {canManageCustomer ? (
          <Section title={t("crm.customers.edit.title")} subtitle={t("crm.customers.edit.subtitle")}>
            <Card className="space-y-4">
              {!isOwner ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                  {t("crm.customers.piiNotice")}
                </div>
              ) : null}
              <form action={updateCustomerAction} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="customer_id" value={customer.id} />
                <input type="hidden" name="next_path" value={`/crm/customers/${customer.id}`} />
                <FieldInput
                  name="full_name"
                  label={t("crm.customers.form.full_name")}
                  helpKey="crm.customers.full_name"
                  defaultValue={customer.full_name ?? ""}
                  placeholder={t("crm.customers.form.full_name")}
                />
                <FieldInput
                  name="phone_e164"
                  label={t("crm.customers.form.phone")}
                  helpKey="crm.customers.phone_e164"
                  defaultValue={customer.phone_e164 ?? ""}
                  placeholder={t("crm.customers.form.phone")}
                />
                <FieldInput
                  name="phone_raw"
                  label={t("crm.customers.form.phoneRaw")}
                  helpKey="crm.customers.phone_raw"
                  defaultValue={customer.phone_raw ?? ""}
                  placeholder={t("crm.customers.form.phoneRaw")}
                />
                <FieldInput
                  name="email"
                  label={t("crm.customers.form.email")}
                  helpKey="crm.customers.email"
                  defaultValue={customer.email ?? ""}
                  placeholder={t("crm.customers.form.email")}
                  type="email"
                />
                <FieldInput
                  name="intent"
                  label={t("crm.customers.form.intent")}
                  helpKey="crm.customers.intent"
                  defaultValue={customer.intent ?? ""}
                  placeholder={t("crm.customers.form.intent")}
                />
                <FieldInput
                  name="preferred_areas"
                  label={t("crm.customers.form.areas")}
                  helpKey="crm.customers.preferred_areas"
                  defaultValue={customer.preferred_areas?.join(", ") ?? ""}
                  placeholder={t("crm.customers.form.areas")}
                />
                <FieldInput
                  name="budget_min"
                  label={t("crm.customers.form.budgetMin")}
                  helpKey="crm.customers.budget_min"
                  defaultValue={customer.budget_min ?? ""}
                  placeholder={t("crm.customers.form.budgetMin")}
                  type="number"
                />
                <FieldInput
                  name="budget_max"
                  label={t("crm.customers.form.budgetMax")}
                  helpKey="crm.customers.budget_max"
                  defaultValue={customer.budget_max ?? ""}
                  placeholder={t("crm.customers.form.budgetMax")}
                  type="number"
                />
                <FieldInput
                  name="lead_source"
                  label={t("crm.customers.form.source")}
                  helpKey="crm.customers.lead_source"
                  defaultValue={customer.lead_source ?? ""}
                  placeholder={t("crm.customers.form.source")}
                />
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <Button type="submit" size="sm" variant="secondary">
                    {t("crm.customers.form.save")}
                  </Button>
                  {isOwner ? (
                    <OwnerDeleteDialog
                      entityId={customer.id}
                      endpoint="/api/owner/customers/delete"
                      title={t("crm.customers.delete.title")}
                      description={t("crm.customers.delete.subtitle")}
                    />
                  ) : (
                    <OwnerDeleteDialog
                      entityId={customer.id}
                      endpoint="/api/pii-requests"
                      title={t("crm.customers.delete.requestTitle")}
                      description={t("crm.customers.delete.requestSubtitle")}
                      mode="request"
                      payload={{ table_name: "customers", action: "hard_delete_request" }}
                    />
                  )}
                </div>
              </form>
              {isAdmin ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                  <p className="mb-2 font-semibold text-[var(--text)]">{t("admin.pii.title")}</p>
                  {piiRequests.length === 0 ? (
                    <p>{t("admin.pii.empty")}</p>
                  ) : (
                    <ul className="grid gap-1">
                      {piiRequests.map((request) => (
                        <li key={request.id} className="flex flex-wrap justify-between gap-2">
                          <span>#{request.id.slice(0, 8)}</span>
                          <span>{request.status}</span>
                          <span>{new Date(request.requested_at).toLocaleString(locale)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </Card>
          </Section>
        ) : (
          <Card className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            {t("crm.customers.adminOnly")}
          </Card>
        )}

        <Section title={t("crm.leads.title")} subtitle={t("crm.leads.subtitle")}>
          <div className="grid gap-3">
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              leads.map((lead) => {
                const listing = canViewFullCustomer
                  ? Array.isArray(lead.listings)
                    ? lead.listings[0]
                    : lead.listings
                  : lead.listing_title
                    ? { title: lead.listing_title }
                    : null;
                return (
                  <Card key={lead.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{listing?.title ?? t("crm.leads.noListing")}</p>
                      <p className="text-xs text-[var(--muted)]">{lead.lead_source ?? "web"}</p>
                    </div>
                    <Badge>{lead.status}</Badge>
                  </Card>
                );
              })
            )}
          </div>
        </Section>

        <Section title={t("crm.activities.title")} subtitle={t("crm.activities.subtitle")}>
          <div className="grid gap-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.activities.empty")}</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
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
