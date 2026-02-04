import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section, Badge } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/constants";
import { getPublicImageUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validators";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteImageAction, deleteListingAction, updateListingAction } from "../../actions";
import { createT, getSubmissionStatusLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { pickLocalizedText } from "@/lib/localize";

export default async function DeveloperListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { role } = await requireRole(["owner", "developer", "admin"], `/developer/listings/${id}`);
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";

  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, title_ar, title_en, price, currency, city, area, address, beds, baths, size_m2, description, description_ar, description_en, amenities, status, submission_status, purpose, type, listing_code, unit_code, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);
  const canEdit = isAdmin || ["draft", "needs_changes"].includes(listing.submission_status ?? "");
  const displayTitle = pickLocalizedText(
    locale,
    listing.title_ar,
    listing.title_en,
    listing.title
  );
  const submissionLabel = t(
    getSubmissionStatusLabelKey(listing.submission_status ?? "draft")
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("developer.edit.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{displayTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/developer">
              <Button size="sm" variant="ghost">
                {t("developer.edit.back")}
              </Button>
            </Link>
            <Badge>{submissionLabel}</Badge>
            {listing.status === "published" ? <Badge>{t("status.published")}</Badge> : null}
          </div>
        </div>

        <Section title={t("developer.edit.subtitle")} subtitle={t("developer.edit.subtitle")}>
          {!canEdit ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("submission.locked")}</p>
            </Card>
          ) : null}
          <Card>
            <form action={updateListingAction} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="listing_id" value={listing.id} />
              <FieldInput
                name="title"
                label={t("developer.form.title")}
                helpKey="developer.listing.title"
                defaultValue={listing.title}
                required
                disabled={!canEdit}
              />
              <FieldInput
                name="title_ar"
                label={t("submission.field.title_ar")}
                helpKey="developer.listing.title_ar"
                defaultValue={listing.title_ar ?? ""}
                placeholder={t("submission.field.title_ar")}
                disabled={!canEdit}
              />
              <FieldInput
                name="title_en"
                label={t("submission.field.title_en")}
                helpKey="developer.listing.title_en"
                defaultValue={listing.title_en ?? ""}
                placeholder={t("submission.field.title_en")}
                disabled={!canEdit}
              />
              <FieldSelect
                name="type"
                label={t("filters.type")}
                helpKey="developer.listing.type"
                defaultValue={listing.type}
              >
                {PROPERTY_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(item.labelKey)}
                  </option>
                ))}
              </FieldSelect>
              <input type="hidden" name="purpose" value="new-development" />
              <FieldInput
                label={t("filters.purpose")}
                helpKey="developer.listing.purpose"
                value={t(getPurposeLabelKey("new-development"))}
                readOnly
                data-no-help
              />
              <FieldInput
                name="price"
                label={t("developer.form.price")}
                helpKey="developer.listing.price"
                defaultValue={String(listing.price)}
                required
                disabled={!canEdit}
              />
              <FieldInput
                name="currency"
                label={t("developer.form.currency")}
                helpKey="developer.listing.currency"
                defaultValue={listing.currency}
                disabled={!canEdit}
              />
              <FieldInput
                name="city"
                label={t("filters.city")}
                helpKey="developer.listing.city"
                defaultValue={listing.city}
                required
                disabled={!canEdit}
              />
              <FieldInput
                name="area"
                label={t("filters.area")}
                helpKey="developer.listing.area"
                defaultValue={listing.area ?? ""}
                disabled={!canEdit}
              />
              <FieldInput
                name="address"
                label={t("developer.form.address")}
                helpKey="developer.listing.address"
                defaultValue={listing.address ?? ""}
                disabled={!canEdit}
              />
              <FieldInput
                name="beds"
                label={t("filters.beds")}
                helpKey="developer.listing.beds"
                defaultValue={String(listing.beds)}
                disabled={!canEdit}
              />
              <FieldInput
                name="baths"
                label={t("filters.baths")}
                helpKey="developer.listing.baths"
                defaultValue={String(listing.baths)}
                disabled={!canEdit}
              />
              <FieldInput
                name="size_m2"
                label={t("developer.form.size")}
                helpKey="developer.listing.size_m2"
                defaultValue={listing.size_m2 ? String(listing.size_m2) : ""}
                disabled={!canEdit}
              />
              <FieldInput
                name="amenities"
                label={t("developer.form.amenities")}
                helpKey="developer.listing.amenities"
                defaultValue={(listing.amenities as string[] | null | undefined)?.join(", ") ?? ""}
                disabled={!canEdit}
              />
              <FieldInput
                name="listing_code"
                label={t("submission.field.listing_code")}
                helpKey="developer.listing.listing_code"
                defaultValue={listing.listing_code ?? ""}
                placeholder={t("submission.field.listing_code")}
                disabled={!isAdmin}
              />
              <FieldInput
                name="unit_code"
                label={t("submission.field.unit_code")}
                helpKey="developer.listing.unit_code"
                defaultValue={listing.unit_code ?? ""}
                placeholder={t("submission.field.unit_code")}
                disabled={!isAdmin}
              />
              <FieldSelect
                name="status"
                label={t("submission.field.status")}
                helpKey="developer.listing.status"
                defaultValue={listing.status}
              >
                <option value="draft">{t("status.draft")}</option>
                {isAdmin ? <option value="published">{t("status.published")}</option> : null}
                <option value="archived">{t("status.archived")}</option>
              </FieldSelect>
              <div className="md:col-span-3">
                <FieldTextarea
                  name="description"
                  label={t("developer.form.description")}
                  helpKey="developer.listing.description"
                  defaultValue={listing.description ?? ""}
                  disabled={!canEdit}
                />
              </div>
              <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                <FieldTextarea
                  name="description_ar"
                  label={t("submission.field.desc_ar")}
                  helpKey="developer.listing.description_ar"
                  defaultValue={listing.description_ar ?? ""}
                  placeholder={t("submission.field.desc_ar")}
                  disabled={!canEdit}
                />
                <FieldTextarea
                  name="description_en"
                  label={t("submission.field.desc_en")}
                  helpKey="developer.listing.description_en"
                  defaultValue={listing.description_en ?? ""}
                  placeholder={t("submission.field.desc_en")}
                  disabled={!canEdit}
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3">
                <Button type="submit" disabled={!canEdit}>
                  {t("developer.edit.save")}
                </Button>
                <Button type="submit" variant="danger" formAction={deleteListingAction}>
                  {t("developer.edit.delete")}
                </Button>
              </div>
            </form>
          </Card>
        </Section>

        <Section title={t("developer.edit.images")} subtitle={t("developer.edit.images.subtitle")}>
          <Card className="space-y-4">
            <ImageUploader
              listingId={listing.id}
              existingCount={images.length}
              labels={{
                title: t("developer.edit.images"),
                hint: t("developer.edit.images.subtitle"),
                uploading: t("upload.uploading"),
                error: t("upload.error"),
                pathLabel: t("upload.path"),
              }}
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {images.map((img) => {
                const url = getPublicImageUrl(img.path);
                if (!url) return null;
                return (
                  <div key={img.path} className="space-y-2">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                      <img src={url} alt={t("general.imageAlt")} className="h-full w-full object-cover" />
                    </div>
                    <form action={deleteImageAction}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="path" value={img.path} />
                      <Button type="submit" size="sm" variant="ghost" className="w-full">
                        {t("developer.edit.deleteImage")}
                      </Button>
                    </form>
                  </div>
                );
              })}
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

