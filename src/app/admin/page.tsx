import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Select, Section, Stat } from "@/components/ui";
import { LEAD_STATUS_OPTIONS, SUBMISSION_STATUS_OPTIONS } from "@/lib/constants";
import { createT, getLeadStatusLabelKey, getSubmissionStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  addDeveloperMemberAction,
  addLeadNoteAction,
  assignLeadAction,
  createDeveloperAction,
  updateLeadStatusAction,
  updateListingStatusAction,
  updateUserRoleAction,
  updateListingSubmissionStatusAction,
  updateProjectSubmissionStatusAction,
} from "./actions";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminPage() {
  const { role } = await requireRole(["owner", "admin"], "/admin");
  const isOwner = role === "owner";
  const isAdmin = role === "admin" || role === "owner";
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
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: leadsWeek = 0 } = await supabase
    .from("leads")
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

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const profiles = profilesData ?? [];

  const { data: developersData } = await supabase
    .from("developers")
    .select("id, name")
    .order("name", { ascending: true });
  const developers = developersData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name, phone, email, status, assigned_to, created_at, listing_id, listings(title)")
    .order("created_at", { ascending: false })
    .limit(20);
  const leads = leadsData ?? [];

  const leadIds = leads.map((lead) => lead.id);
  const leadNotesById = new Map<string, { note: string; created_at: string }>();
  if (leadIds.length > 0) {
    const { data: notesData } = await supabase
      .from("lead_notes")
      .select("lead_id, note, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      if (!leadNotesById.has(note.lead_id)) {
        leadNotesById.set(note.lead_id, note);
      }
    });
  }

  const profileNameById = new Map(
    profiles.map((profile) => [profile.id, profile.full_name ?? profile.id])
  );
  const roleLabelKeyMap: Record<string, string> = {
    owner: "role.owner",
    developer: "role.developer",
    admin: "role.admin",
    ops: "role.ops",
    staff: "role.staff",
    agent: "role.agent",
  };
  const formatRoleLabel = (value?: string | null) =>
    t(roleLabelKeyMap[value ?? "staff"] ?? "role.staff");
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
            <Badge>{t(badgeRoleKey)}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("admin.stats.today")} value={unitsToday} />
          <Stat label={t("admin.stats.week")} value={unitsWeek} />
          <Stat label={t("admin.stats.leadsToday")} value={leadsToday} />
          <Stat label={t("admin.stats.leadsWeek")} value={leadsWeek} />
        </div>

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
                    <form action={updateListingStatusAction} className="flex items-center gap-3">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <Select name="status" defaultValue="draft" className="min-w-[140px]">
                        <option value="draft">{t("status.draft")}</option>
                        <option value="published">{t("status.published")}</option>
                        <option value="archived">{t("status.archived")}</option>
                      </Select>
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
                      <Select name="submission_status" defaultValue={project.submission_status ?? "submitted"}>
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </Select>
                      <Input name="note" placeholder={t("admin.review.note.placeholder")} />
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
                      <Select name="submission_status" defaultValue={listing.submission_status ?? "submitted"}>
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </Select>
                      <Input name="note" placeholder={t("admin.review.note.placeholder")} />
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

        <Section title={t("admin.leads.title")} subtitle={t("admin.leads.subtitle")}>
          {leads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.leads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => {
                const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
                const statusLabel = t(getLeadStatusLabelKey(lead.status ?? "new"));
                const assignedName = lead.assigned_to
                  ? profileNameById.get(lead.assigned_to) ?? lead.assigned_to
                  : t("admin.leads.unassigned");
                const lastNote = leadNotesById.get(lead.id);

                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">
                          {t("account.leads.listing", { title: listing?.title ?? lead.listing_id })}
                        </p>
                        <p className="text-base font-semibold">{lead.name}</p>
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>{lead.email ?? "-"}</span>
                      <span>{lead.phone ?? "-"}</span>
                      <span>{t("admin.leads.assigned", { name: assignedName })}</span>
                    </div>
                    {lastNote ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: lastNote.note })}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">{t("developer.leads.noNote")}</p>
                    )}
                    <div className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <form action={updateLeadStatusAction} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="lead_id" value={lead.id} />
                        <Select name="status" defaultValue={lead.status ?? "new"}>
                          {LEAD_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {t(option.labelKey)}
                            </option>
                          ))}
                        </Select>
                        <Button size="sm" variant="secondary" type="submit">
                          {t("developer.leads.update")}
                        </Button>
                      </form>
                      <form action={assignLeadAction} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="lead_id" value={lead.id} />
                        <Select name="assigned_to" defaultValue={lead.assigned_to ?? ""}>
                          <option value="">{t("admin.leads.unassigned")}</option>
                          {profiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profile.full_name ?? profile.id} ({formatRoleLabel(profile.role)})
                            </option>
                          ))}
                        </Select>
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.leads.assign")}
                        </Button>
                      </form>
                    </div>
                    <form action={addLeadNoteAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <Input name="note" placeholder={t("admin.leads.addNote")} className="flex-1" />
                      <Button size="sm" variant="secondary" type="submit">
                        {t("admin.leads.addNote")}
                      </Button>
                    </form>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        {isAdmin ? (
          <Section title={t("admin.partners.title")} subtitle={t("admin.partners.subtitle")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-lg font-semibold">{t("admin.partners.add")}</h3>
                <form action={createDeveloperAction} className="mt-3 space-y-3">
                  <Input name="name" placeholder={t("admin.partners.add")} required />
                  <Button type="submit">{t("admin.partners.addBtn")}</Button>
                </form>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">{t("admin.partners.link")}</h3>
                <form action={addDeveloperMemberAction} className="mt-3 space-y-3">
                  <Select name="developer_id" defaultValue="">
                    <option value="">{t("admin.partners.selectDeveloper")}</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </Select>
                  <Input name="user_id" placeholder={t("admin.partners.userId")} required />
                  <Input name="role" placeholder={t("admin.partners.roleHint")} />
                  <Button type="submit">{t("admin.partners.linkBtn")}</Button>
                </form>
              </Card>
            </div>
          </Section>
        ) : null}

        {isOwner ? (
          <Section title={t("admin.users.title")} subtitle={t("admin.users.subtitle")}>
            <Card className="space-y-4">
              {profiles.map((profile) => (
                <form
                  key={profile.id}
                  action={updateUserRoleAction}
                  className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 last:border-none"
                >
                  <input type="hidden" name="user_id" value={profile.id} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{profile.full_name ?? "-"}</p>
                      <p className="text-xs text-[var(--muted)]">{profile.id}</p>
                      <p className="text-xs text-[var(--muted)]">{profile.phone ?? "-"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select name="role" defaultValue={profile.role}>
                        <option value="developer">{t("role.developer")}</option>
                        <option value="staff">{t("role.staff")}</option>
                        <option value="ops">{t("role.ops")}</option>
                        <option value="agent">{t("role.agent")}</option>
                        <option value="admin">{t("role.admin")}</option>
                      </Select>
                      <Button size="sm" variant="secondary" type="submit">
                        {t("admin.users.update")}
                      </Button>
                    </div>
                  </div>
                </form>
              ))}
            </Card>
          </Section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}



