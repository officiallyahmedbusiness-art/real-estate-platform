import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section, Stat } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { SUBMISSION_STATUS_OPTIONS } from "@/lib/constants";
import { createT, getSubmissionStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  updateListingStatusAction,
  updateListingSubmissionStatusAction,
  updateProjectSubmissionStatusAction,
} from "./actions";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminPage() {
  const { role } = await requireRole(["owner", "admin"], "/admin");
  const isAdmin = role === "admin" || role === "owner";
  const canViewFullLeads = isAdmin;
  const leadsTable = canViewFullLeads ? "leads" : "leads_masked";
  const supabase = await createSupabaseServerClient();

  const locale = await getServerLocale();
  const t = createT(locale);

  const today = startOfToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const { count: unitsToday = 0 } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: unitsWeek = 0 } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { count: leadsToday = 0 } = await supabase
    .from(leadsTable)
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: leadsWeek = 0 } = await supabase
    .from(leadsTable)
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { data: pendingData } = await supabase
    .from("listings")
    .select("id, title, city, price, currency, status, created_at")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(10);
  const pendingListings = pendingData ?? [];

  const { data: reviewListingsData } = await supabase
    .from("listings")
    .select("id, title, city, submission_status, listing_code, unit_code")
    .in("submission_status", ["submitted", "under_review", "needs_changes", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(20);
  const reviewListings = reviewListingsData ?? [];

  const { data: reviewProjectsData } = await supabase
    .from("projects")
    .select("id, title_ar, title_en, city, submission_status, project_code")
    .in("submission_status", ["submitted", "under_review", "needs_changes", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(20);
  const reviewProjects = reviewProjectsData ?? [];

  const { data: topDevelopersData } = await supabase
    .from("report_top_developers")
    .select("developer_id, name, units")
    .limit(5);
  const topDevelopers = topDevelopersData ?? [];

  const reviewStatusOptions = isAdmin
    ? SUBMISSION_STATUS_OPTIONS
    : SUBMISSION_STATUS_OPTIONS.filter((option) => option.value !== "published");

  const badgeRoleKey = role === "owner" ? "role.owner" : "role.admin";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("admin.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/homepage">
              <Button size="sm" variant="secondary">
                {t("admin.homepage.manage")}
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button size="sm" variant="secondary">
                {t("settings.manage")}
              </Button>
            </Link>
            <Link href="/admin/flags">
              <Button size="sm" variant="secondary">
                {t("admin.flags.manage")}
              </Button>
            </Link>
            <Badge>{t(badgeRoleKey)}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("admin.stats.today")} value={unitsToday} />
          <Stat label={t("admin.stats.week")} value={unitsWeek} />
          <Stat label={t("admin.stats.leadsToday")} value={leadsToday} />
          <Stat label={t("admin.stats.leadsWeek")} value={leadsWeek} />
        </div>

        <Section title={t("admin.hub.title")} subtitle={t("admin.hub.subtitle")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <div>
                <p className="text-sm font-semibold">{t("admin.hub.crm.title")}</p>
                <p className="text-xs text-[var(--muted)]">{t("admin.hub.crm.subtitle")}</p>
              </div>
              <Link href="/admin/crm/requests">
                <Button size="sm">{t("admin.hub.crm.cta")}</Button>
              </Link>
            </Card>
            <Card className="space-y-3">
              <div>
                <p className="text-sm font-semibold">{t("admin.hub.team.title")}</p>
                <p className="text-xs text-[var(--muted)]">{t("admin.hub.team.subtitle")}</p>
              </div>
              <Link href="/admin/team/users">
                <Button size="sm">{t("admin.hub.team.cta")}</Button>
              </Link>
            </Card>
            <Card className="space-y-3">
              <div>
                <p className="text-sm font-semibold">{t("admin.hub.partners.title")}</p>
                <p className="text-xs text-[var(--muted)]">{t("admin.hub.partners.subtitle")}</p>
              </div>
              <Link href="/admin/partners-supply">
                <Button size="sm">{t("admin.hub.partners.cta")}</Button>
              </Link>
            </Card>
            <Card className="space-y-3">
              <div>
                <p className="text-sm font-semibold">{t("admin.hub.marketing.title")}</p>
                <p className="text-xs text-[var(--muted)]">{t("admin.hub.marketing.subtitle")}</p>
              </div>
              <Link href="/admin/partners">
                <Button size="sm">{t("admin.hub.marketing.cta")}</Button>
              </Link>
            </Card>
          </div>
        </Section>

        <Section title={t("admin.top.title")} subtitle={t("admin.top.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {topDevelopers.map((dev) => (
              <Card key={dev.developer_id}>
                <p className="text-lg font-semibold">{dev.name}</p>
                <p className="text-sm text-[var(--muted)]">{t("developer.stats.total")}: {dev.units}</p>
              </Card>
            ))}
          </div>
        </Section>

        {isAdmin ? (
          <Section title={t("admin.approvals.title")} subtitle={t("admin.approvals.subtitle")}>
            {pendingListings.length === 0 ? (
              <Card>
                <p className="text-sm text-[var(--muted)]">{t("admin.approvals.empty")}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-lg font-semibold">{listing.title}</p>
                      <p className="text-sm text-[var(--muted)]">{listing.city}</p>
                    </div>
                    <form action={updateListingStatusAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <FieldSelect
                        label={t("admin.approvals.status")}
                        helpKey="admin.approvals.status"
                        name="status"
                        defaultValue="draft"
                        wrapperClassName="min-w-[180px]"
                      >
                        <option value="draft">{t("status.draft")}</option>
                        <option value="published">{t("status.published")}</option>
                        <option value="archived">{t("status.archived")}</option>
                      </FieldSelect>
                      <Button size="sm" variant="secondary" type="submit">
                        {t("admin.approvals.update")}
                      </Button>
                    </form>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        ) : null}

        <Section title={t("admin.review.title")} subtitle={t("admin.review.subtitle")}>
          {reviewListings.length === 0 && reviewProjects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviewProjects.map((project) => {
                const title = project.title_ar ?? project.title_en ?? project.id;
                const statusLabel = t(
                  getSubmissionStatusLabelKey(project.submission_status ?? "draft")
                );
                return (
                  <Card key={project.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">{t("submission.section.projects")}</p>
                        <p className="text-base font-semibold">{title}</p>
                        <p className="text-xs text-[var(--muted)]">{project.city ?? "-"}</p>
                        {project.project_code ? (
                          <p className="text-xs text-[var(--muted)]">
                            {t("submission.field.project_code")}: {project.project_code}
                          </p>
                        ) : null}
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <form action={updateProjectSubmissionStatusAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="project_id" value={project.id} />
                      <FieldSelect
                        label={t("admin.review.submissionStatus")}
                        helpKey="admin.review.submission_status"
                        name="submission_status"
                        defaultValue={project.submission_status ?? "submitted"}
                      >
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldInput
                        label={t("admin.review.note.label")}
                        helpKey="admin.review.note"
                        name="note"
                        placeholder={t("admin.review.note.placeholder")}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.approvals.update")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                );
              })}
              {reviewListings.map((listing) => {
                const statusLabel = t(
                  getSubmissionStatusLabelKey(listing.submission_status ?? "draft")
                );
                return (
                  <Card key={listing.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">{t("submission.section.inventory")}</p>
                        <p className="text-base font-semibold">{listing.title}</p>
                        <p className="text-xs text-[var(--muted)]">{listing.city ?? "-"}</p>
                        {listing.listing_code || listing.unit_code ? (
                          <p className="text-xs text-[var(--muted)]">
                            {listing.listing_code ? `${t("submission.field.listing_code")}: ${listing.listing_code}` : ""}
                            {listing.listing_code && listing.unit_code ? " • " : ""}
                            {listing.unit_code ? `${t("submission.field.unit_code")}: ${listing.unit_code}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <form action={updateListingSubmissionStatusAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <FieldSelect
                        label={t("admin.review.submissionStatus")}
                        helpKey="admin.review.submission_status"
                        name="submission_status"
                        defaultValue={listing.submission_status ?? "submitted"}
                      >
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldInput
                        label={t("admin.review.note.label")}
                        helpKey="admin.review.note"
                        name="note"
                        placeholder={t("admin.review.note.placeholder")}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.approvals.update")}
                        </Button>
                      </div>
                    </form>
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



