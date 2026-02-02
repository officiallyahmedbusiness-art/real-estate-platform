import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Section, Badge, Textarea, Stat } from "@/components/ui";
import {
  PROPERTY_TYPE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  MEDIA_TYPE_OPTIONS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  addLeadNoteAction,
  createListingAction,
  updateLeadStatusAction,
  submitListingAction,
  createProjectAction,
  submitProjectAction,
  createMediaSubmissionAction,
} from "./actions";
import {
  createT,
  getLeadStatusLabelKey,
  getPropertyTypeLabelKey,
  getPurposeLabelKey,
  getSubmissionStatusLabelKey,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { pickLocalizedText } from "@/lib/localize";

export default async function DeveloperPage() {
  const { user, role } = await requireRole(["owner", "developer", "admin"], "/developer");
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";

  const locale = await getServerLocale();
  const t = createT(locale);
  const roleLabelMap: Record<string, string> = {
    owner: "role.owner",
    developer: "role.developer",
    admin: "role.admin",
    ops: "role.ops",
    staff: "role.staff",
    agent: "role.agent",
  };
  const roleLabel = t(roleLabelMap[role] ?? "role.staff");

  const { data: membershipData } = await supabase
    .from("developer_members")
    .select("developer_id, developers(name)")
    .eq("user_id", user.id);
  const memberships =
    (membershipData as
      | Array<{ developer_id: string; developers: { name: string } | { name: string }[] | null }>
      | null) ?? [];

  const developerIds = memberships.map((m) => m.developer_id);
  const primaryDeveloperId = developerIds[0] ?? null;
  const primaryDeveloperName = Array.isArray(memberships[0]?.developers)
    ? memberships[0]?.developers[0]?.name ?? null
    : memberships[0]?.developers?.name ?? null;

  let projectQuery = supabase
    .from("projects")
    .select("id, title_ar, title_en, city, area, submission_status, submitted_at, project_code")
    .order("created_at", { ascending: false })
    .limit(30);

  if (developerIds.length > 0) {
    projectQuery = projectQuery.or(
      `owner_user_id.eq.${user.id},developer_id.in.(${developerIds.join(",")})`
    );
  } else {
    projectQuery = projectQuery.eq("owner_user_id", user.id);
  }

  const { data: projectsData } = await projectQuery;
  const projects = projectsData ?? [];
  const projectIds = projects.map((project) => project.id);

  let listingQuery = supabase
    .from("listings")
    .select(
      "id, title, title_ar, title_en, price, currency, city, status, submission_status, purpose, type, created_at, developer_id, listing_code, unit_code, project_id"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (developerIds.length > 0) {
    listingQuery = listingQuery.or(
      `owner_user_id.eq.${user.id},developer_id.in.(${developerIds.join(",")})`
    );
  } else {
    listingQuery = listingQuery.eq("owner_user_id", user.id);
  }

  const { data: listingsData } = await listingQuery;
  const listings = listingsData ?? [];
  const listingIds = listings.map((l) => l.id);

  const noteIds = [...listingIds, ...projectIds];
  const notesByEntity = new Map<string, { note: string; created_at: string }>();
  if (noteIds.length > 0) {
    const { data: notesData } = await supabase
      .from("submission_notes")
      .select("entity_type, entity_id, note, created_at, visibility")
      .in("entity_id", noteIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      const key = `${note.entity_type}:${note.entity_id}`;
      if (!notesByEntity.has(key)) {
        notesByEntity.set(key, note);
      }
    });
  }

  const leadCounts = new Map<string, number>();
  if (listingIds.length > 0) {
    const { data: leadsData } = await supabase.from("leads").select("listing_id").in(
      "listing_id",
      listingIds
    );
    const leads = leadsData ?? [];
    leads.forEach((lead) => {
      leadCounts.set(lead.listing_id, (leadCounts.get(lead.listing_id) ?? 0) + 1);
    });
  }

  let recentLeads: Array<{
    id: string;
    listing_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    message: string | null;
    status: string | null;
    created_at: string;
    listings: { title: string } | { title: string }[] | null;
  }> = [];
  if (listingIds.length > 0) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, listing_id, name, phone, email, message, status, created_at, listings(title)")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false })
      .limit(20);
    recentLeads = (leadsData as typeof recentLeads) ?? [];
  }

  const leadIds = recentLeads.map((lead) => lead.id);
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

  const totalListings = listings.length;
  const totalProjects = projects.length;
  const pendingCount =
    listings.filter((listing) => ["submitted", "under_review"].includes(listing.submission_status ?? "")).length +
    projects.filter((project) => ["submitted", "under_review"].includes(project.submission_status ?? "")).length;
  const totalLeads = recentLeads.length;

  const { data: mediaData } = await supabase
    .from("submission_media")
    .select("id, media_type, url, submission_status, listing_id, project_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const mediaSubmissions = mediaData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("developer.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("submission.portal.subtitle")}</p>
            <p className="text-xs text-[var(--muted)]">
              {primaryDeveloperName
                ? t("developer.subtitle.company", { name: primaryDeveloperName })
                : t("developer.subtitle.empty")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/developer/import">
              <Button size="sm" variant="secondary">
                {t("developer.import.title")}
              </Button>
            </Link>
            <Link href="/developer/ads">
              <Button size="sm" variant="secondary">
                {t("nav.ads")}
              </Button>
            </Link>
            <Badge>{roleLabel}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("developer.stats.total")} value={totalListings} />
          <Stat label={t("developer.stats.projects")} value={totalProjects} />
          <Stat label={t("developer.stats.pending")} value={pendingCount} />
          <Stat label={t("developer.stats.leads")} value={totalLeads} />
        </div>

        <Section title={t("submission.section.projects")} subtitle={t("project.create.title")}>
          <Card>
            <form action={createProjectAction} className="grid gap-4 md:grid-cols-3">
              {primaryDeveloperId ? (
                <input type="hidden" name="developer_id" value={primaryDeveloperId} />
              ) : null}
              <Input name="title_ar" placeholder={t("submission.field.title_ar")} required />
              <Input name="title_en" placeholder={t("submission.field.title_en")} />
              <Input name="city" placeholder={t("project.form.city")} required />
              <Input name="area" placeholder={t("project.form.area")} />
              <Input name="address" placeholder={t("project.form.address")} />
              <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                <Textarea name="description_ar" placeholder={t("submission.field.desc_ar")} />
                <Textarea name="description_en" placeholder={t("submission.field.desc_en")} />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit">{t("project.create.submit")}</Button>
              </div>
            </form>
          </Card>

          {projects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => {
                const title = pickLocalizedText(
                  locale,
                  project.title_ar,
                  project.title_en,
                  project.title_ar || project.title_en
                );
                const projectNote = notesByEntity.get(`project:${project.id}`);
                const statusLabel = t(
                  getSubmissionStatusLabelKey(project.submission_status ?? "draft")
                );
                return (
                  <Card
                    key={project.id}
                    className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-[var(--muted)]">{project.city}</p>
                      {project.project_code ? (
                        <p className="text-xs text-[var(--muted)]">
                          {t("submission.field.project_code")}: {project.project_code}
                        </p>
                      ) : null}
                      {projectNote ? (
                        <p className="text-xs text-[var(--muted)]">
                          {t("developer.leads.lastNote", { note: projectNote.note })}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>{statusLabel}</Badge>
                      <Link href={`/developer/projects/${project.id}`}>
                        <Button size="sm" variant="secondary">
                          {t("project.manage")}
                        </Button>
                      </Link>
                      {["draft", "needs_changes"].includes(project.submission_status ?? "") ? (
                        <form action={submitProjectAction}>
                          <input type="hidden" name="project_id" value={project.id} />
                          <Button size="sm">{t("submission.action.submit")}</Button>
                        </form>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("submission.section.inventory")} subtitle={t("developer.create.subtitle")}>
          {projects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.project.required")}</p>
            </Card>
          ) : (
            <Card>
              <form action={createListingAction} className="grid gap-4 md:grid-cols-3">
                {primaryDeveloperId ? (
                  <input type="hidden" name="developer_id" value={primaryDeveloperId} />
                ) : null}
                <Select name="project_id" defaultValue="" required>
                  <option value="">{t("developer.form.project")}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {pickLocalizedText(
                        locale,
                        project.title_ar,
                        project.title_en,
                        project.title_ar || project.title_en
                      )}
                    </option>
                  ))}
                </Select>
                <Input name="title" placeholder={t("developer.form.title")} required />
                <Input name="title_ar" placeholder={t("submission.field.title_ar")} />
                <Input name="title_en" placeholder={t("submission.field.title_en")} />
                <Select name="type" defaultValue="">
                  <option value="">{t("filters.type")}</option>
                  {PROPERTY_TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(item.labelKey)}
                    </option>
                  ))}
                </Select>
                <input type="hidden" name="purpose" value="new-development" />
                <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
                  {t(getPurposeLabelKey("new-development"))}
                </div>
                <Input name="price" placeholder={t("developer.form.price")} required />
                <Input name="currency" placeholder={t("developer.form.currency")} defaultValue="EGP" />
                <Input name="city" placeholder={t("filters.city")} required />
                <Input name="area" placeholder={t("filters.area")} />
                <Input name="address" placeholder={t("developer.form.address")} />
                <Input name="beds" placeholder={t("filters.beds")} defaultValue="0" />
                <Input name="baths" placeholder={t("filters.baths")} defaultValue="0" />
                <Input name="size_m2" placeholder={t("developer.form.size")} />
                <Input name="amenities" placeholder={t("developer.form.amenities")} />
                {isAdmin ? (
                  <Select name="status" defaultValue="draft">
                    <option value="draft">{t("status.draft")}</option>
                    <option value="published">{t("status.published")}</option>
                    <option value="archived">{t("status.archived")}</option>
                  </Select>
                ) : (
                  <input type="hidden" name="status" value="draft" />
                )}
                <div className="md:col-span-3">
                  <Textarea name="description" placeholder={t("developer.form.description")} />
                </div>
                <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                  <Textarea name="description_ar" placeholder={t("submission.field.desc_ar")} />
                  <Textarea name="description_en" placeholder={t("submission.field.desc_en")} />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button type="submit">{t("developer.create.submit")}</Button>
                </div>
              </form>
            </Card>
          )}
        </Section>

        <Section title={t("developer.listings.title")} subtitle={t("developer.listings.subtitle")}>
          {listings.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.listings.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => {
                const displayTitle = pickLocalizedText(
                  locale,
                  listing.title_ar,
                  listing.title_en,
                  listing.title
                );
                const submissionLabel = t(
                  getSubmissionStatusLabelKey(listing.submission_status ?? "draft")
                );
                const listingNote = notesByEntity.get(`listing:${listing.id}`);
                return (
                <Card
                  key={listing.id}
                  className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{displayTitle}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {listing.city} - {t(getPropertyTypeLabelKey(listing.type))} - {t(getPurposeLabelKey(listing.purpose))}
                    </p>
                    {listing.listing_code || listing.unit_code ? (
                      <p className="text-xs text-[var(--muted)]">
                        {listing.listing_code ? `${t("submission.field.listing_code")}: ${listing.listing_code}` : ""}
                        {listing.listing_code && listing.unit_code ? " • " : ""}
                        {listing.unit_code ? `${t("submission.field.unit_code")}: ${listing.unit_code}` : ""}
                      </p>
                    ) : null}
                    {listingNote ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: listingNote.note })}
                      </p>
                    ) : null}
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      {formatPrice(listing.price, listing.currency, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{submissionLabel}</Badge>
                    {listing.status === "published" ? (
                      <Badge>{t("status.published")}</Badge>
                    ) : null}
                    <Badge>{t("developer.stats.leads")}: {leadCounts.get(listing.id) ?? 0}</Badge>
                    <Link href={`/developer/listings/${listing.id}`}>
                      <Button size="sm" variant="secondary">
                        {t("developer.listings.manage")}
                      </Button>
                    </Link>
                    {["draft", "needs_changes"].includes(listing.submission_status ?? "") ? (
                      <form action={submitListingAction}>
                        <input type="hidden" name="listing_id" value={listing.id} />
                        <Button size="sm">{t("submission.action.submit")}</Button>
                      </form>
                    ) : null}
                  </div>
                </Card>
              );
              })}
            </div>
          )}
        </Section>

        <Section title={t("submission.section.media")} subtitle={t("media.submit.title")}>
          <Card>
            <form action={createMediaSubmissionAction} className="grid gap-4 md:grid-cols-4">
              <Select name="project_id" defaultValue="">
                <option value="">{t("submission.section.projects")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {pickLocalizedText(
                      locale,
                      project.title_ar,
                      project.title_en,
                      project.title_ar || project.title_en
                    )}
                  </option>
                ))}
              </Select>
              <Select name="listing_id" defaultValue="">
                <option value="">{t("submission.section.inventory")}</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {pickLocalizedText(locale, listing.title_ar, listing.title_en, listing.title)}
                  </option>
                ))}
              </Select>
              <Select name="media_type" defaultValue="brochure">
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </Select>
              <Input name="url" placeholder={t("media.submit.url")} />
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit">{t("media.submit.add")}</Button>
              </div>
            </form>
          </Card>

          {mediaSubmissions.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {mediaSubmissions.map((item) => {
                const typeLabel =
                  MEDIA_TYPE_OPTIONS.find((opt) => opt.value === item.media_type)?.labelKey ??
                  "media.type.other";
                const statusLabel = t(
                  getSubmissionStatusLabelKey(item.submission_status ?? "draft")
                );
                return (
                  <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t(typeLabel)}</p>
                      <a href={item.url ?? "#"} className="text-xs text-[var(--muted)] underline">
                        {item.url ?? "-"}
                      </a>
                    </div>
                    <Badge>{statusLabel}</Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("developer.leads.title")} subtitle={t("developer.leads.subtitle")}>
          {recentLeads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.leads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentLeads.map((lead) => {
                const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-[var(--muted)]">
                        {t("account.leads.listing", { title: listing?.title ?? lead.listing_id })}
                      </p>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>
                    <p className="text-base font-semibold">{lead.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>{lead.email ?? "-"}</span>
                      <span>{lead.phone ?? "-"}</span>
                    </div>
                    {lead.message ? (
                      <p className="text-sm text-[var(--muted)]">{lead.message}</p>
                    ) : null}
                    {leadNotesById.get(lead.id) ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: leadNotesById.get(lead.id)?.note ?? "" })}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">{t("developer.leads.noNote")}</p>
                    )}
                    <form action={addLeadNoteAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <Input name="note" placeholder={t("developer.leads.addNote")} className="flex-1" />
                      <Button size="sm" variant="secondary" type="submit">
                        {t("developer.leads.addNote")}
                      </Button>
                    </form>
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



