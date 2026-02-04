import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge } from "@/components/ui";
import { FieldCheckbox, FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { AttachmentsManager } from "@/components/AttachmentsManager";
import { ImageUploader } from "@/components/ImageUploader";
import { ShareLinks } from "@/components/ShareLinks";
import {
  ATTACHMENT_CATEGORY_OPTIONS,
  ATTACHMENT_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  UNIT_STATUS_OPTIONS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { getSubmissionStatusLabelKey, createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateResaleListingAction, updateResaleSubmissionStatusAction } from "@/app/staff/actions";
import {
  deleteAttachmentAction,
  getAttachmentSignedUrlAction,
  reorderAttachmentsAction,
  updateAttachmentMetaAction,
  uploadAttachmentAction,
} from "@/app/staff/units/[id]/actions";

export default async function StaffUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], `/staff/units/${id}`);
  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");
  const canViewOwner = Boolean(ownerAccess);
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, title_ar, title_en, description, description_ar, description_en, type, purpose, price, currency, city, area, address, beds, baths, size_m2, listing_code, unit_code, status, submission_status, inventory_source, hr_owner_user_id, unit_status, agent_user_id, agent_name, floor, elevator, finishing, meters, reception, kitchen, view, building, has_images, commission, intake_date, target, ad_channel, requested"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing || listing.inventory_source !== "resale") notFound();

  const { data: intake } = canViewOwner
    ? await supabase.from("resale_intake").select("*").eq("listing_id", id).maybeSingle()
    : { data: null };

  const { data: agentsData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["agent"])
    .order("full_name", { ascending: true });
  const agents = agentsData ?? [];

  const { data: lastUpdater } = listing?.hr_owner_user_id
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", listing.hr_owner_user_id)
        .maybeSingle()
    : { data: null };
  const lastUpdaterLabel =
    lastUpdater?.full_name ?? lastUpdater?.email ?? listing?.hr_owner_user_id ?? "-";

  const { data: imagesData } = await supabase
    .from("listing_images")
    .select("id")
    .eq("listing_id", id);
  const imageCount = imagesData?.length ?? 0;

  const { data: attachmentsData } = await supabase
    .from("unit_attachments")
    .select(
      "id, file_path, file_type, category, title, note, sort_order, is_primary, is_published, metadata, bucket"
    )
    .eq("listing_id", id)
    .order("sort_order", { ascending: true });

  const attachments = await Promise.all(
    (attachmentsData ?? []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from(item.bucket ?? "property-attachments")
        .createSignedUrl(item.file_path, 60 * 60);
      return {
        ...item,
        signed_url: signed?.signedUrl ?? null,
      };
    })
  );

  const previewImage =
    attachments.find((item) => item.file_type === "image" && item.signed_url)?.signed_url ?? null;

  const submissionKey =
    listing.status === "published"
      ? "submission.status.published"
      : getSubmissionStatusLabelKey(listing.submission_status ?? "draft");
  const unitStatusKey =
    UNIT_STATUS_OPTIONS.find(
      (option) => option.value === (listing.unit_status ?? "available")
    )?.labelKey ?? "staff.unitStatus.available";

  const lastContactValue = intake?.last_owner_contact_at
    ? new Date(intake.last_owner_contact_at).toISOString().slice(0, 16)
    : "";
  const nextFollowupValue = intake?.next_owner_followup_at
    ? new Date(intake.next_owner_followup_at).toISOString().slice(0, 16)
    : "";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Link href="/staff" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              {t("staff.actions.back")}
            </Link>
            <h1 className="text-2xl font-semibold">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(submissionKey)}</Badge>
              <Badge>{t(unitStatusKey)}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={updateResaleSubmissionStatusAction}>
              <input type="hidden" name="listing_id" value={listing.id} />
              <input type="hidden" name="submission_status" value="submitted" />
              <Button type="submit" size="sm" variant="secondary">
                {t("staff.actions.submit")}
              </Button>
            </form>
            {role === "admin" || role === "owner" ? (
              <form action={updateResaleSubmissionStatusAction}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <input type="hidden" name="submission_status" value="published" />
                <Button type="submit" size="sm">
                  {t("staff.actions.publish")}
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="space-y-6">
            <form action={updateResaleListingAction} className="space-y-6">
              <input type="hidden" name="listing_id" value={listing.id} />

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{t("staff.section.basics")}</h3>
                  <p className="text-xs text-[var(--muted)]">
                    {t("staff.form.lastUpdatedBy")}: {lastUpdaterLabel}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldInput
                    name="title"
                    label={t("staff.form.title")}
                    helpKey="staff.listing.title"
                    placeholder={t("staff.form.title")}
                    defaultValue={listing.title}
                  />
                  <FieldSelect
                    name="unit_status"
                    label={t("staff.form.unitStatus")}
                    helpKey="staff.listing.unit_status"
                    defaultValue={listing.unit_status ?? "available"}
                  >
                    {UNIT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    name="listing_code"
                    label={t("staff.form.internalCode")}
                    helpKey="staff.listing.listing_code"
                    placeholder={t("staff.form.internalCode")}
                    defaultValue={listing.listing_code ?? ""}
                  />
                  <FieldInput
                    name="unit_code"
                    label={t("staff.form.unitCode")}
                    helpKey="staff.listing.unit_code"
                    placeholder={t("staff.form.unitCode")}
                    defaultValue={listing.unit_code ?? intake?.unit_code ?? ""}
                  />
                  <FieldSelect
                    name="type"
                    label={t("staff.form.type")}
                    helpKey="staff.listing.type"
                    defaultValue={listing.type}
                  >
                    {PROPERTY_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldSelect
                    name="purpose"
                    label={t("staff.form.purpose")}
                    helpKey="staff.listing.purpose"
                    defaultValue={listing.purpose}
                  >
                    {PURPOSE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    name="price"
                    label={t("staff.form.price")}
                    helpKey="staff.listing.price"
                    type="number"
                    placeholder={t("staff.form.price")}
                    defaultValue={listing.price ?? ""}
                  />
                  <FieldInput
                    name="currency"
                    label={t("staff.form.currency")}
                    helpKey="staff.listing.currency"
                    placeholder={t("staff.form.currency")}
                    defaultValue={listing.currency ?? "EGP"}
                  />
                  <FieldInput
                    name="city"
                    label={t("staff.form.city")}
                    helpKey="staff.listing.city"
                    placeholder={t("staff.form.city")}
                    defaultValue={listing.city ?? ""}
                  />
                  <FieldInput
                    name="area"
                    label={t("staff.form.area")}
                    helpKey="staff.listing.area"
                    placeholder={t("staff.form.area")}
                    defaultValue={listing.area ?? ""}
                  />
                  <FieldInput
                    name="address"
                    label={t("staff.form.address")}
                    helpKey="staff.listing.address"
                    placeholder={t("staff.form.address")}
                    defaultValue={listing.address ?? ""}
                  />
                  <FieldInput
                    name="requested"
                    label={t("staff.form.requested")}
                    helpKey="staff.listing.requested"
                    placeholder={t("staff.form.requested")}
                    defaultValue={listing.requested ?? intake?.target ?? ""}
                  />
                  <FieldInput
                    name="intake_date"
                    label={t("staff.form.date")}
                    helpKey="staff.listing.intake_date"
                    type="date"
                    placeholder={t("staff.form.date")}
                    defaultValue={listing.intake_date ?? intake?.intake_date ?? ""}
                  />
                  <FieldSelect
                    name="agent_user_id"
                    label={t("staff.form.agent")}
                    helpKey="staff.listing.agent_user_id"
                    defaultValue={listing.agent_user_id ?? intake?.agent_user_id ?? ""}
                  >
                    <option value="">{t("staff.form.agent")}</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name ?? agent.id}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    name="agent_name"
                    label={t("staff.form.agentFallback")}
                    helpKey="staff.listing.agent_name"
                    placeholder={t("staff.form.agentFallback")}
                    defaultValue={listing.agent_name ?? intake?.agent_name ?? ""}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold">{t("staff.section.details")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldInput
                    name="beds"
                    label={t("staff.form.beds")}
                    helpKey="staff.listing.beds"
                    type="number"
                    placeholder={t("staff.form.beds")}
                    defaultValue={listing.beds ?? 0}
                  />
                  <FieldInput
                    name="baths"
                    label={t("staff.form.baths")}
                    helpKey="staff.listing.baths"
                    type="number"
                    placeholder={t("staff.form.baths")}
                    defaultValue={listing.baths ?? 0}
                  />
                  <FieldInput
                    name="size_m2"
                    label={t("staff.form.size")}
                    helpKey="staff.listing.size_m2"
                    type="number"
                    placeholder={t("staff.form.size")}
                    defaultValue={listing.size_m2 ?? ""}
                  />
                  <FieldInput
                    name="floor"
                    label={t("staff.form.floor")}
                    helpKey="staff.listing.floor"
                    placeholder={t("staff.form.floor")}
                    defaultValue={listing.floor ?? intake?.floor ?? ""}
                  />
                  <FieldInput
                    name="finishing"
                    label={t("staff.form.finishing")}
                    helpKey="staff.listing.finishing"
                    placeholder={t("staff.form.finishing")}
                    defaultValue={listing.finishing ?? intake?.finishing ?? ""}
                  />
                  <FieldInput
                    name="meters"
                    label={t("staff.form.meters")}
                    helpKey="staff.listing.meters"
                    placeholder={t("staff.form.meters")}
                    defaultValue={listing.meters ?? intake?.meters ?? ""}
                  />
                  <FieldInput
                    name="reception"
                    label={t("staff.form.reception")}
                    helpKey="staff.listing.reception"
                    placeholder={t("staff.form.reception")}
                    defaultValue={listing.reception ?? intake?.reception ?? ""}
                  />
                  <FieldInput
                    name="view"
                    label={t("staff.form.view")}
                    helpKey="staff.listing.view"
                    placeholder={t("staff.form.view")}
                    defaultValue={listing.view ?? intake?.view ?? ""}
                  />
                  <FieldInput
                    name="building"
                    label={t("staff.form.building")}
                    helpKey="staff.listing.building"
                    placeholder={t("staff.form.building")}
                    defaultValue={listing.building ?? intake?.building ?? ""}
                  />
                  <FieldInput
                    name="commission"
                    label={t("staff.form.commission")}
                    helpKey="staff.listing.commission"
                    placeholder={t("staff.form.commission")}
                    defaultValue={listing.commission ?? intake?.commission ?? ""}
                  />
                  <FieldInput
                    name="ad_channel"
                    label={t("staff.form.adChannel")}
                    helpKey="staff.listing.ad_channel"
                    placeholder={t("staff.form.adChannel")}
                    defaultValue={listing.ad_channel ?? intake?.ad_channel ?? ""}
                  />
                  <div className="flex flex-wrap items-center gap-4">
                    <FieldCheckbox
                      name="elevator"
                      label={t("staff.form.elevator")}
                      helpKey="staff.listing.elevator"
                      value="1"
                      defaultChecked={Boolean(listing.elevator ?? intake?.elevator)}
                    />
                    <FieldCheckbox
                      name="kitchen"
                      label={t("staff.form.kitchen")}
                      helpKey="staff.listing.kitchen"
                      value="1"
                      defaultChecked={Boolean(listing.kitchen ?? intake?.kitchen)}
                    />
                  </div>
                </div>
              </section>

              {canViewOwner ? (
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("staff.section.owner")}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldInput
                      name="owner_name"
                      label={t("staff.form.ownerName")}
                      helpKey="staff.listing.owner_name"
                      placeholder={t("staff.form.ownerName")}
                      defaultValue={intake?.owner_name ?? ""}
                    />
                    <FieldInput
                      name="owner_phone"
                      label={t("staff.form.ownerPhone")}
                      helpKey="staff.listing.owner_phone"
                      placeholder={t("staff.form.ownerPhone")}
                      defaultValue={intake?.owner_phone ?? ""}
                    />
                    <FieldTextarea
                      name="owner_notes"
                      label={t("staff.form.ownerNotes")}
                      helpKey="staff.listing.owner_notes"
                      placeholder={t("staff.form.ownerNotes")}
                      defaultValue={intake?.owner_notes ?? ""}
                    />
                    <FieldInput
                      name="last_owner_contact_at"
                      label={t("staff.form.lastOwnerContactAt")}
                      helpKey="staff.listing.last_owner_contact_at"
                      type="datetime-local"
                      defaultValue={lastContactValue}
                    />
                    <FieldInput
                      name="next_owner_followup_at"
                      label={t("staff.form.nextOwnerFollowupAt")}
                      helpKey="staff.listing.next_owner_followup_at"
                      type="datetime-local"
                      defaultValue={nextFollowupValue}
                    />
                    <FieldTextarea
                      name="last_owner_contact_note"
                      label={t("staff.form.lastOwnerContactNote")}
                      helpKey="staff.listing.last_owner_contact_note"
                      placeholder={t("staff.form.lastOwnerContactNote")}
                      defaultValue={intake?.last_owner_contact_note ?? ""}
                    />
                  </div>
                </section>
              ) : null}

              <section className="space-y-4">
                <h3 className="text-lg font-semibold">{t("staff.section.notes")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldTextarea
                    name="description"
                    label={t("staff.form.description")}
                    helpKey="staff.listing.description"
                    placeholder={t("staff.form.description")}
                    defaultValue={listing.description ?? ""}
                  />
                  <FieldTextarea
                    name="notes"
                    label={t("staff.form.notes")}
                    helpKey="staff.listing.notes"
                    placeholder={t("staff.form.notes")}
                    defaultValue={intake?.notes ?? ""}
                  />
                  <FieldInput
                    name="title_ar"
                    label={t("submission.field.title_ar")}
                    helpKey="staff.listing.title_ar"
                    placeholder={t("submission.field.title_ar")}
                    defaultValue={listing.title_ar ?? ""}
                  />
                  <FieldInput
                    name="title_en"
                    label={t("submission.field.title_en")}
                    helpKey="staff.listing.title_en"
                    placeholder={t("submission.field.title_en")}
                    defaultValue={listing.title_en ?? ""}
                  />
                  <FieldTextarea
                    name="description_ar"
                    label={t("submission.field.desc_ar")}
                    helpKey="staff.listing.description_ar"
                    placeholder={t("submission.field.desc_ar")}
                    defaultValue={listing.description_ar ?? ""}
                  />
                  <FieldTextarea
                    name="description_en"
                    label={t("submission.field.desc_en")}
                    helpKey="staff.listing.description_en"
                    placeholder={t("submission.field.desc_en")}
                    defaultValue={listing.description_en ?? ""}
                  />
                </div>
              </section>

              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  {t("staff.form.save")}
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="space-y-3">
              <h3 className="text-lg font-semibold">{t("staff.preview.title")}</h3>
              <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[var(--surface)]">
                {previewImage ? (
                  <img src={previewImage} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    {t("listing.card.noImage")}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">{listing.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {listing.city}
                  {listing.area ? ` - ${listing.area}` : ""}
                </p>
                <p className="text-lg font-semibold text-[var(--accent)]">
                  {formatPrice(listing.price, listing.currency, locale)}
                </p>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">{t("developer.edit.images")}</h3>
              <ImageUploader
                listingId={listing.id}
                existingCount={imageCount}
                helpKey="staff.listing.images"
                labels={{
                  title: t("developer.edit.images"),
                  hint: t("developer.edit.images.subtitle"),
                  uploading: t("upload.uploading"),
                  error: t("upload.error"),
                  pathLabel: t("upload.path"),
                }}
              />
            </Card>
          </div>
        </div>

        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">{t("staff.share.title")}</h3>
          <ShareLinks
            labels={{
              publicLabel: t("staff.share.public"),
              internalLabel: t("staff.share.internal"),
              printLabel: t("staff.share.print"),
              copyLabel: t("staff.share.copy"),
              publicHint: t("staff.share.publicHint"),
              internalHint: t("staff.share.internalHint"),
            }}
            paths={{
              publicPath: `/share/${listing.id}`,
              internalPath: canViewOwner ? `/staff/units/${listing.id}/internal` : null,
              printPath: `/staff/units/${listing.id}/print`,
            }}
          />
        </Card>

        <Card className="space-y-4">
          <AttachmentsManager
            listingId={listing.id}
            attachments={
              canViewOwner
                ? attachments
                : attachments.filter(
                    (item) => item.category !== "contract" && item.category !== "owner_docs"
                  )
            }
            categories={ATTACHMENT_CATEGORY_OPTIONS.filter((item) =>
              canViewOwner ? true : item.value !== "contract" && item.value !== "owner_docs"
            ).map((item) => ({
              value: item.value,
              label: t(item.labelKey),
            }))}
            fileTypes={ATTACHMENT_TYPE_OPTIONS.map((item) => ({
              value: item.value,
              label: t(item.labelKey),
            }))}
            labels={{
              title: t("staff.attachments.title"),
              subtitle: t("staff.attachments.subtitle"),
              upload: t("staff.attachments.upload"),
              drag: t("staff.attachments.drag"),
              category: t("staff.attachments.category"),
              titleLabel: t("staff.attachments.titleLabel"),
              noteLabel: t("staff.attachments.noteLabel"),
              primary: t("staff.attachments.primary"),
              published: t("staff.attachments.published"),
              copy: t("staff.attachments.copy"),
              delete: t("staff.attachments.delete"),
              empty: t("staff.attachments.empty"),
              fileType: t("staff.attachments.fileType"),
              sizeLimit: t("staff.attachments.sizeLimit"),
            }}
            actions={{
              upload: uploadAttachmentAction,
              remove: deleteAttachmentAction,
              update: updateAttachmentMetaAction,
              reorder: reorderAttachmentsAction,
              signedUrl: getAttachmentSignedUrlAction,
            }}
          />
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
