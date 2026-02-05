import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateDeveloperSupplyAction, updateOwnerSupplyAction } from "./actions";

const BUCKET = "supply-uploads";
const statusSet = new Set(["new", "in_review", "contacted", "approved", "rejected"]);

const statusLabelKeys: Record<string, string> = {
  new: "supply.status.new",
  in_review: "supply.status.in_review",
  contacted: "supply.status.contacted",
  approved: "supply.status.approved",
  rejected: "supply.status.rejected",
};

const contactMethodLabelKeys: Record<string, string> = {
  whatsapp: "contact.method.whatsapp",
  call: "contact.method.call",
  email: "contact.method.email",
};

const contactTimeLabelKeys: Record<string, string> = {
  morning: "home.request.contact.morning",
  afternoon: "home.request.contact.afternoon",
  evening: "home.request.contact.evening",
  any: "home.request.contact.any",
};

const inventoryLabelMap: Record<string, string> = {
  "مشروع كامل": "supply.developer.inventory.full",
  "وحدات متفرقة": "supply.developer.inventory.units",
  "مرحلة": "supply.developer.inventory.phase",
};

const ownerTypeLabelMap: Record<string, string> = {
  "مالك": "supply.owner.type.owner",
  "وسيط": "supply.owner.type.broker",
  "مفوّض": "supply.owner.type.authorized",
};

const ownerPurposeLabelMap: Record<string, string> = {
  "بيع": "supply.owner.purpose.sale",
  "إيجار": "supply.owner.purpose.rent",
};

type Attachment = {
  path: string;
  url: string | null;
  type?: string | null;
  name?: string | null;
  size?: number | null;
};

type AttachmentWithUrl = Attachment & { signedUrl: string | null };

type DeveloperRequestRow = {
  id: string;
  company_name: string;
  contact_person_name: string;
  role_title: string | null;
  phone: string;
  email: string | null;
  contact_method: string;
  preferred_time: string;
  preferred_day: string | null;
  preferred_contact_notes: string | null;
  contact_reason: string | null;
  city: string | null;
  projects_summary: string;
  inventory_type: string;
  unit_count_estimate: number | null;
  brochure_url: string | null;
  attachments: Attachment[] | null;
  cooperation_terms_interest: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
};

type OwnerRequestRow = {
  id: string;
  owner_type: string;
  full_name: string;
  phone: string;
  email: string | null;
  contact_method: string;
  preferred_time: string;
  preferred_day: string | null;
  contact_reason: string | null;
  property_type: string;
  purpose: string;
  area: string;
  address_notes: string | null;
  size_m2: number | null;
  rooms: number | null;
  baths: number | null;
  price_expectation: number | null;
  ready_to_show: boolean | null;
  photos: Attachment[] | null;
  media_link: string | null;
  notes: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
};

function parseDateParam(value?: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function buildIsoDate(date: string, endOfDay: boolean) {
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return new Date(`${date}${suffix}`).toISOString();
}

async function withSignedUrls(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  items: Attachment[] | null
): Promise<AttachmentWithUrl[]> {
  if (!items || items.length === 0) return [];

  return Promise.all(
    items.map(async (item) => {
      const path = item.path;
      if (!path) {
        return { ...item, signedUrl: null };
      }
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
      return { ...item, signedUrl: error ? null : data?.signedUrl ?? null };
    })
  );
}

export default async function AdminSupplyPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  await requireRole(["owner", "admin"], "/admin/supply");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const statusParam = typeof searchParams?.status === "string" ? searchParams.status : "";
  const fromParam = typeof searchParams?.from === "string" ? searchParams.from : "";
  const toParam = typeof searchParams?.to === "string" ? searchParams.to : "";

  const status = statusSet.has(statusParam) ? statusParam : "";
  const from = parseDateParam(fromParam);
  const to = parseDateParam(toParam);

  const developerQuery = supabase
    .from("supply_developer_requests")
    .select(
      "id, company_name, contact_person_name, role_title, phone, email, contact_method, preferred_time, preferred_day, preferred_contact_notes, contact_reason, city, projects_summary, inventory_type, unit_count_estimate, brochure_url, attachments, cooperation_terms_interest, status, internal_notes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const ownerQuery = supabase
    .from("supply_owner_requests")
    .select(
      "id, owner_type, full_name, phone, email, contact_method, preferred_time, preferred_day, contact_reason, property_type, purpose, area, address_notes, size_m2, rooms, baths, price_expectation, ready_to_show, photos, media_link, notes, status, internal_notes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) {
    developerQuery.eq("status", status);
    ownerQuery.eq("status", status);
  }
  if (from) {
    const fromIso = buildIsoDate(from, false);
    developerQuery.gte("created_at", fromIso);
    ownerQuery.gte("created_at", fromIso);
  }
  if (to) {
    const toIso = buildIsoDate(to, true);
    developerQuery.lte("created_at", toIso);
    ownerQuery.lte("created_at", toIso);
  }

  const { data: developerData } = await developerQuery;
  const { data: ownerData } = await ownerQuery;

  const developerRequests = (developerData ?? []) as DeveloperRequestRow[];
  const ownerRequests = (ownerData ?? []) as OwnerRequestRow[];

  const developerWithFiles = await Promise.all(
    developerRequests.map(async (request) => ({
      ...request,
      attachments: await withSignedUrls(supabase, request.attachments),
    }))
  );

  const ownerWithFiles = await Promise.all(
    ownerRequests.map(async (request) => ({
      ...request,
      photos: await withSignedUrls(supabase, request.photos),
    }))
  );

  const statusOptions = [
    { value: "", label: t("admin.supply.filters.status") },
    ...Array.from(statusSet).map((value) => ({
      value,
      label: t(statusLabelKeys[value] ?? "supply.status.new"),
    })),
  ];

  const renderFiles = (
    items: AttachmentWithUrl[] | null,
    emptyLabel: string,
    linkLabel: string
  ) => {
    if (!items || items.length === 0) {
      return <p className="text-xs text-[var(--muted)]">{emptyLabel}</p>;
    }

    return (
      <ul className="grid gap-2 text-xs">
        {items.map((item) => {
          const name = item.name ?? item.path.split("/").pop() ?? "file";
          return (
            <li key={item.path} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[var(--muted)]">{name}</span>
              {item.signedUrl ? (
                <a
                  href={item.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)]"
                >
                  {linkLabel}
                </a>
              ) : (
                <span>{linkLabel}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderStatusBadge = (value: string) => (
    <Badge>{t(statusLabelKeys[value] ?? "supply.status.new")}</Badge>
  );

  const resolveLabel = (value: string, map: Record<string, string>) =>
    map[value] ? t(map[value]) : value;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <Section title={t("admin.supply.title")} subtitle={t("admin.supply.subtitle")}>
          <Card>
            <form method="get" className="grid gap-3 md:grid-cols-3">
              <FieldSelect
                name="status"
                label={t("admin.supply.filters.status")}
                defaultValue={status}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                type="date"
                name="from"
                label={t("admin.supply.filters.from")}
                defaultValue={from ?? ""}
              />
              <FieldInput
                type="date"
                name="to"
                label={t("admin.supply.filters.to")}
                defaultValue={to ?? ""}
              />
              <div className="md:col-span-3 flex justify-end">
                <Button size="sm" type="submit" variant="secondary">
                  {t("admin.supply.filters.apply")}
                </Button>
              </div>
            </form>
          </Card>
        </Section>

        <Section title={t("admin.supply.developer.title")}>
          {developerWithFiles.length === 0 ? (
            <Card className="text-sm text-[var(--muted)]">{t("admin.supply.empty")}</Card>
          ) : (
            <div className="grid gap-4">
              {developerWithFiles.map((request) => (
                <details
                  key={request.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                    <span>{request.company_name}</span>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      {renderStatusBadge(request.status)}
                      <span>{new Date(request.created_at).toLocaleString(locale)}</span>
                    </div>
                  </summary>
                  <div className="mt-4 grid gap-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.request_id")}</p>
                        <p className="text-sm">{request.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.created_at")}</p>
                        <p className="text-sm">{new Date(request.created_at).toLocaleString(locale)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.contact_person_name")}</p>
                        <p>{request.contact_person_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.role_title")}</p>
                        <p>{request.role_title ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.phone")}</p>
                        <p dir="ltr">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.email")}</p>
                        <p>{request.email ?? "-"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.contact_method")}</p>
                        <p>{t(contactMethodLabelKeys[request.contact_method] ?? "contact.method.call")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.preferred_time")}</p>
                        <p>{t(contactTimeLabelKeys[request.preferred_time] ?? "home.request.contact.any")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.preferred_day")}</p>
                        <p>{request.preferred_day ?? "-"}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.contact_reason")}</p>
                        <p>{request.contact_reason ?? "-"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.inventory_type")}</p>
                        <p>{resolveLabel(request.inventory_type, inventoryLabelMap)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.unit_count_estimate")}</p>
                        <p>{request.unit_count_estimate ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.city")}</p>
                        <p>{request.city ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.brochure_url")}</p>
                        {request.brochure_url ? (
                          <a
                            href={request.brochure_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--accent)]"
                          >
                            {request.brochure_url}
                          </a>
                        ) : (
                          <p>-</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.projects_summary")}</p>
                      <p className="whitespace-pre-wrap text-sm">{request.projects_summary}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("supply.developer.form.cooperation_terms_interest")}</p>
                      <p className="whitespace-pre-wrap text-sm">{request.cooperation_terms_interest ?? "-"}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("admin.supply.attachments")}</p>
                      {renderFiles(
                        request.attachments as AttachmentWithUrl[] | null,
                        t("admin.supply.empty"),
                        t("admin.supply.attachments")
                      )}
                    </div>

                    <form action={updateDeveloperSupplyAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="request_id" value={request.id} />
                      <FieldSelect
                        name="status"
                        label={t("admin.supply.update")}
                        defaultValue={request.status}
                      >
                        {Array.from(statusSet).map((value) => (
                          <option key={value} value={value}>
                            {t(statusLabelKeys[value] ?? "supply.status.new")}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldTextarea
                        name="internal_notes"
                        label={t("admin.supply.internal_notes")}
                        defaultValue={request.internal_notes ?? ""}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.supply.update")}
                        </Button>
                      </div>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </Section>

        <Section title={t("admin.supply.owner.title")}>
          {ownerWithFiles.length === 0 ? (
            <Card className="text-sm text-[var(--muted)]">{t("admin.supply.empty")}</Card>
          ) : (
            <div className="grid gap-4">
              {ownerWithFiles.map((request) => (
                <details
                  key={request.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                    <span>{request.full_name}</span>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      {renderStatusBadge(request.status)}
                      <span>{new Date(request.created_at).toLocaleString(locale)}</span>
                    </div>
                  </summary>
                  <div className="mt-4 grid gap-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.request_id")}</p>
                        <p className="text-sm">{request.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.created_at")}</p>
                        <p className="text-sm">{new Date(request.created_at).toLocaleString(locale)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.owner_type")}</p>
                        <p>{resolveLabel(request.owner_type, ownerTypeLabelMap)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.phone")}</p>
                        <p dir="ltr">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.email")}</p>
                        <p>{request.email ?? "-"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.contact_method")}</p>
                        <p>{t(contactMethodLabelKeys[request.contact_method] ?? "contact.method.call")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.preferred_time")}</p>
                        <p>{t(contactTimeLabelKeys[request.preferred_time] ?? "home.request.contact.any")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.preferred_day")}</p>
                        <p>{request.preferred_day ?? "-"}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs text-[var(--muted)]">{t("admin.supply.contact_reason")}</p>
                        <p>{request.contact_reason ?? "-"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.property_type")}</p>
                        <p>{request.property_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.purpose")}</p>
                        <p>{resolveLabel(request.purpose, ownerPurposeLabelMap)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.area")}</p>
                        <p>{request.area}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.address_notes")}</p>
                        <p>{request.address_notes ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.size_m2")}</p>
                        <p>{request.size_m2 ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.rooms")}</p>
                        <p>{request.rooms ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.baths")}</p>
                        <p>{request.baths ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.price_expectation")}</p>
                        <p>{request.price_expectation ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.ready_to_show")}</p>
                        <p>
                          {request.ready_to_show === null
                            ? "-"
                            : request.ready_to_show
                              ? t("supply.owner.ready.yes")
                              : t("supply.owner.ready.no")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.notes")}</p>
                      <p className="whitespace-pre-wrap text-sm">{request.notes ?? "-"}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("supply.owner.form.media_link")}</p>
                      {request.media_link ? (
                        <a
                          href={request.media_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)]"
                        >
                          {request.media_link}
                        </a>
                      ) : (
                        <p>-</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">{t("admin.supply.photos")}</p>
                      {renderFiles(
                        request.photos as AttachmentWithUrl[] | null,
                        t("admin.supply.empty"),
                        t("admin.supply.photos")
                      )}
                    </div>

                    <form action={updateOwnerSupplyAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="request_id" value={request.id} />
                      <FieldSelect
                        name="status"
                        label={t("admin.supply.update")}
                        defaultValue={request.status}
                      >
                        {Array.from(statusSet).map((value) => (
                          <option key={value} value={value}>
                            {t(statusLabelKeys[value] ?? "supply.status.new")}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldTextarea
                        name="internal_notes"
                        label={t("admin.supply.internal_notes")}
                        defaultValue={request.internal_notes ?? ""}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.supply.update")}
                        </Button>
                      </div>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
