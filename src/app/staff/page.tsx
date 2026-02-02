import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Badge, Stat, Textarea } from "@/components/ui";
import { PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS, UNIT_STATUS_OPTIONS } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import { createT, getSubmissionStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import {
  createResaleListingAction,
  duplicateResaleListingAction,
  updateResaleSubmissionStatusAction,
} from "@/app/staff/actions";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(["owner", "admin", "ops", "staff", "agent"], "/staff");
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const query = getParam(params, "q");
  const statusFilter = getParam(params, "status");

  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");
  const canViewOwner = Boolean(ownerAccess);

  type ListingSummary = {
    id: string;
    title: string | null;
    status: string | null;
    submission_status: string | null;
    listing_code: string | null;
  };

  type IntakeRow = {
    listing_id: string;
    agent_name: string | null;
    owner_name: string | null;
    owner_phone: string | null;
    unit_code: string | null;
    city: string | null;
    area: string | null;
    address: string | null;
    price: number | null;
    currency: string | null;
    listing: ListingSummary | ListingSummary[] | null;
  };

  let rows: Array<IntakeRow & { listing: ListingSummary | null }> = [];
  if (canViewOwner) {
    let intakeQuery = supabase
      .from("resale_intake")
      .select(
        "listing_id, agent_name, owner_name, owner_phone, unit_code, city, area, address, price, currency, listing: listings(id, title, status, submission_status, listing_code)"
      )
      .order("created_at", { ascending: false });
    if (query) {
      intakeQuery = intakeQuery.or(
        `unit_code.ilike.%${query}%,owner_phone.ilike.%${query}%,address.ilike.%${query}%`
      );
    }
    const { data } = await intakeQuery;
    rows = (data as IntakeRow[] | null ?? [])
      .map((row) => ({
        ...row,
        listing: Array.isArray(row.listing) ? row.listing[0] : row.listing,
      }))
      .filter((row) => row.listing);
  } else {
    let listingsQuery = supabase
      .from("listings")
      .select(
        "id, title, status, submission_status, listing_code, unit_code, city, area, address, price, currency, agent_name"
      )
      .eq("inventory_source", "resale")
      .order("created_at", { ascending: false });
    if (query) {
      listingsQuery = listingsQuery.or(
        `listing_code.ilike.%${query}%,unit_code.ilike.%${query}%,address.ilike.%${query}%`
      );
    }
    const { data } = await listingsQuery;
    rows = (data ?? []).map((listing) => ({
      listing_id: listing.id,
      agent_name: listing.agent_name ?? null,
      owner_name: null,
      owner_phone: null,
      unit_code: listing.unit_code ?? null,
      city: listing.city ?? null,
      area: listing.area ?? null,
      address: listing.address ?? null,
      price: listing.price ?? null,
      currency: listing.currency ?? null,
      listing: {
        id: listing.id,
        title: listing.title ?? null,
        status: listing.status ?? null,
        submission_status: listing.submission_status ?? null,
        listing_code: listing.listing_code ?? null,
      },
    }));
  }

  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["agent"])
    .order("full_name", { ascending: true });
  const agents = agentsData ?? [];

  const filtered = statusFilter
    ? rows.filter((row) => {
        const submission = row.listing?.submission_status ?? "draft";
        const status = row.listing?.status ?? "draft";
        if (statusFilter === "published") return status === "published";
        if (statusFilter === "submitted") {
          return ["submitted", "under_review", "needs_changes", "approved"].includes(submission);
        }
        return submission === statusFilter;
      })
    : rows;

  const total = filtered.length;
  const draftCount = filtered.filter(
    (row) => row.listing?.submission_status === "draft"
  ).length;
  const submittedCount = filtered.filter((row) =>
    ["submitted", "under_review", "needs_changes", "approved"].includes(
      row.listing?.submission_status ?? "draft"
    )
  ).length;
  const publishedCount = filtered.filter(
    (row) => row.listing?.status === "published"
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{t("staff.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("staff.subtitle")}</p>
          </div>
          <Link href="/staff/import">
            <Button size="sm" variant="secondary">
              {t("staff.import.title")}
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("staff.stats.total")} value={formatNumber(total, locale)} />
          <Stat label={t("staff.stats.draft")} value={formatNumber(draftCount, locale)} />
          <Stat label={t("staff.stats.submitted")} value={formatNumber(submittedCount, locale)} />
          <Stat
            label={t("staff.stats.published")}
            value={formatNumber(publishedCount, locale)}
          />
        </div>

        <Card className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <Input name="q" placeholder={t("staff.search.placeholder")} defaultValue={query} />
            <Select name="status" defaultValue={statusFilter}>
              <option value="">{t("staff.filter.all")}</option>
              <option value="draft">{t("staff.filter.draft")}</option>
              <option value="submitted">{t("staff.filter.submitted")}</option>
              <option value="published">{t("staff.filter.published")}</option>
            </Select>
            <Button type="submit" size="sm">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{t("staff.form.title")}</h2>
            <p className="text-sm text-[var(--muted)]">{t("staff.form.subtitle")}</p>
          </div>
          <form action={createResaleListingAction} className="grid gap-4 md:grid-cols-3">
            <Input name="title" placeholder={t("staff.form.title")} />
            <Select name="unit_status" defaultValue="available">
              {UNIT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
            <Input name="listing_code" placeholder={t("staff.form.internalCode")} />
            <Input name="unit_code" placeholder={t("staff.form.unitCode")} />
            <Select name="type" required>
              <option value="">{t("staff.form.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
            <Select name="purpose" required>
              <option value="">{t("staff.form.purpose")}</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </Select>
            <Input name="price" type="number" placeholder={t("staff.form.price")} required />
            <Input name="currency" placeholder={t("staff.form.currency")} defaultValue="EGP" />
            <Input name="city" placeholder={t("staff.form.city")} required />
            <Input name="area" placeholder={t("staff.form.area")} />
            <Input name="address" placeholder={t("staff.form.address")} required />
            <Input name="beds" type="number" placeholder={t("staff.form.beds")} />
            <Input name="baths" type="number" placeholder={t("staff.form.baths")} />
            <Input name="size_m2" type="number" placeholder={t("staff.form.size")} />
            <Select name="agent_user_id" defaultValue="">
              <option value="">{t("staff.form.agent")}</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.full_name ?? agent.id}
                </option>
              ))}
            </Select>
            <Input name="agent_name" placeholder={t("staff.form.agentFallback")} />
            {canViewOwner ? (
              <>
                <Input name="owner_name" placeholder={t("staff.form.ownerName")} />
                <Input name="owner_phone" placeholder={t("staff.form.ownerPhone")} />
              </>
            ) : null}
            <Input name="floor" placeholder={t("staff.form.floor")} />
            <Input name="finishing" placeholder={t("staff.form.finishing")} />
            <Input name="meters" placeholder={t("staff.form.meters")} />
            <Input name="reception" placeholder={t("staff.form.reception")} />
            <Input name="view" placeholder={t("staff.form.view")} />
            <Input name="building" placeholder={t("staff.form.building")} />
            <Input name="entrance" placeholder={t("staff.form.entrance")} />
            <Input name="commission" placeholder={t("staff.form.commission")} />
            <Input name="intake_date" type="date" placeholder={t("staff.form.date")} />
            <Input name="requested" placeholder={t("staff.form.requested")} />
            <Input name="target" placeholder={t("staff.form.target")} />
            <Input name="ad_channel" placeholder={t("staff.form.adChannel")} />
            <Input name="description" placeholder={t("staff.form.description")} />
            <Input name="title_ar" placeholder={t("submission.field.title_ar")} />
            <Input name="title_en" placeholder={t("submission.field.title_en")} />
            <Input name="description_ar" placeholder={t("submission.field.desc_ar")} />
            <Input name="description_en" placeholder={t("submission.field.desc_en")} />
            {canViewOwner ? (
              <Input
                name="last_owner_contact_at"
                type="datetime-local"
                placeholder={t("staff.form.lastOwnerContactAt")}
              />
            ) : null}
            {canViewOwner ? (
              <Input
                name="next_owner_followup_at"
                type="datetime-local"
                placeholder={t("staff.form.nextOwnerFollowupAt")}
              />
            ) : null}
            <div className="md:col-span-3">
              <Textarea name="notes" placeholder={t("staff.form.notes")} />
            </div>
            {canViewOwner ? (
              <>
                <div className="md:col-span-3">
                  <Textarea name="owner_notes" placeholder={t("staff.form.ownerNotes")} />
                </div>
                <div className="md:col-span-3">
                  <Textarea
                    name="last_owner_contact_note"
                    placeholder={t("staff.form.lastOwnerContactNote")}
                  />
                </div>
              </>
            ) : null}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" name="elevator" value="1" />
                {t("staff.form.elevator")}
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input type="checkbox" name="kitchen" value="1" />
                {t("staff.form.kitchen")}
              </label>
            </div>
            <div className="md:col-span-3 flex items-center justify-between">
              <p className="text-xs text-[var(--muted)]">
                {t("staff.form.notes")}
              </p>
              <Button type="submit" size="sm">
                {t("staff.form.submit")}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-sm">
            <span>{t("staff.table.status")}</span>
            <span>{formatNumber(total, locale)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-right">{t("staff.table.code")}</th>
                  <th className="px-4 py-3 text-right">{t("staff.table.unitCode")}</th>
                  {canViewOwner ? (
                    <>
                      <th className="px-4 py-3 text-right">{t("staff.table.owner")}</th>
                      <th className="px-4 py-3 text-right">{t("staff.table.phone")}</th>
                    </>
                  ) : null}
                  <th className="px-4 py-3 text-right">{t("staff.table.price")}</th>
                  <th className="px-4 py-3 text-right">{t("staff.table.status")}</th>
                  <th className="px-4 py-3 text-right">{t("staff.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canViewOwner ? 7 : 5}
                      className="px-4 py-6 text-center text-[var(--muted)]"
                    >
                      {t("listings.empty")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const listing = row.listing;
                    const submission = listing?.submission_status ?? "draft";
                    const statusKey =
                      listing?.status === "published"
                        ? "submission.status.published"
                        : getSubmissionStatusLabelKey(submission);
                    return (
                      <tr key={row.listing_id} className="border-b border-[var(--border)]">
                        <td className="px-4 py-3">{listing?.listing_code ?? "-"}</td>
                        <td className="px-4 py-3">{row.unit_code ?? "-"}</td>
                        {canViewOwner ? (
                          <>
                            <td className="px-4 py-3">{row.owner_name ?? "-"}</td>
                            <td className="px-4 py-3">{row.owner_phone ?? "-"}</td>
                          </>
                        ) : null}
                        <td className="px-4 py-3">
                          {row.price
                            ? formatPrice(row.price, row.currency ?? "EGP", locale)
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge>{t(statusKey)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/staff/units/${row.listing_id}`}>
                              <Button size="sm" variant="secondary">
                                {t("staff.actions.manage")}
                              </Button>
                            </Link>
                            <form action={duplicateResaleListingAction}>
                              <input type="hidden" name="listing_id" value={row.listing_id} />
                              <Button size="sm" variant="ghost">
                                {t("staff.actions.duplicate")}
                              </Button>
                            </form>
                            {listing?.status !== "published" ? (
                              <form action={updateResaleSubmissionStatusAction}>
                                <input type="hidden" name="listing_id" value={row.listing_id} />
                                <input
                                  type="hidden"
                                  name="submission_status"
                                  value="submitted"
                                />
                                <Button size="sm" variant="ghost">
                                  {t("staff.actions.submit")}
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
