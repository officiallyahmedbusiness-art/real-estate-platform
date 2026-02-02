import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createVisitAction, updateVisitNotesAction, updateVisitStatusAction } from "./actions";

const STATUS_OPTIONS = [
  { value: "scheduled", key: "visits.status.scheduled" },
  { value: "completed", key: "visits.status.completed" },
  { value: "rescheduled", key: "visits.status.rescheduled" },
  { value: "canceled", key: "visits.status.canceled" },
  { value: "no_show", key: "visits.status.no_show" },
];

export default async function VisitsPage() {
  await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/visits");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: visitsData } = await supabase
    .from("field_visits")
    .select("id, listing_id, lead_id, assigned_to, scheduled_at, status, notes, outcome, next_followup_at, listings(title), leads(name)")
    .order("scheduled_at", { ascending: true })
    .limit(80);
  const visits = visitsData ?? [];

  const { data: listingsData } = await supabase
    .from("listings")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(40);
  const listings = listingsData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(40);
  const leads = leadsData ?? [];

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["admin", "ops", "agent"])
    .order("full_name", { ascending: true });
  const profiles = profilesData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("visits.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("visits.subtitle")}</p>
        </div>

        <Card className="space-y-4">
          <form action={createVisitAction} className="grid gap-3 md:grid-cols-4">
            <Select name="listing_id" defaultValue="">
              <option value="">{t("visits.form.listing")}</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </Select>
            <Select name="lead_id" defaultValue="">
              <option value="">{t("visits.form.lead")}</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </Select>
            <Select name="assigned_to" defaultValue="">
              <option value="">{t("visits.form.assigned")}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name ?? profile.id}
                </option>
              ))}
            </Select>
            <Input name="scheduled_at" type="datetime-local" />
            <Textarea name="notes" placeholder={t("visits.form.notes")} className="md:col-span-3" />
            <Button type="submit" size="sm" className="md:col-span-1">
              {t("visits.form.create")}
            </Button>
          </form>
        </Card>

        <div className="grid gap-4">
          {visits.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t("visits.empty")}</p>
          ) : (
            visits.map((visit) => {
              const listing = Array.isArray(visit.listings) ? visit.listings[0] : visit.listings;
              const lead = Array.isArray(visit.leads) ? visit.leads[0] : visit.leads;
              return (
                <Card key={visit.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{listing?.title ?? t("visits.noListing")}</p>
                      <p className="text-xs text-[var(--muted)]">{lead?.name ?? t("visits.noLead")}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(visit.scheduled_at).toLocaleString(locale)}
                      </p>
                    </div>
                    <Badge>{t(`visits.status.${visit.status}`)}</Badge>
                  </div>

                  <form action={updateVisitStatusAction} className="flex flex-wrap items-center gap-3">
                    <input type="hidden" name="visit_id" value={visit.id} />
                    <Select name="status" defaultValue={visit.status}>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.key)}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" size="sm" variant="secondary">
                      {t("visits.update")}
                    </Button>
                  </form>

                  <form action={updateVisitNotesAction} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]">
                    <input type="hidden" name="visit_id" value={visit.id} />
                    <Input name="outcome" placeholder={t("visits.form.outcome")} defaultValue={visit.outcome ?? ""} />
                    <Input
                      name="next_followup_at"
                      type="datetime-local"
                      defaultValue={
                        visit.next_followup_at
                          ? new Date(visit.next_followup_at).toISOString().slice(0, 16)
                          : ""
                      }
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      {t("visits.updateNotes")}
                    </Button>
                  </form>
                </Card>
              );
            })
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
