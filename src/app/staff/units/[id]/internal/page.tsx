import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function StaffInternalSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  await requireRole(["owner", "admin", "ops", "staff", "agent"], `/staff/units/${id}/internal`);

  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: ownerAccess } = await supabase.rpc("has_owner_access");
  if (!ownerAccess) notFound();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, purpose, type, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: intake } = await supabase
    .from("resale_intake")
    .select(
      "owner_name, owner_phone, owner_notes, last_owner_contact_at, last_owner_contact_note, next_owner_followup_at"
    )
    .eq("listing_id", id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
              <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
              <Badge>
                {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
              </Badge>
            </div>
          </div>
          <p className="text-2xl font-semibold text-[var(--accent)]">
            {formatPrice(listing.price, listing.currency, locale)}
          </p>
        </div>

        <Card className="space-y-4 hrtaj-card">
          <h2 className="text-lg font-semibold">{t("staff.section.owner")}</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-xs text-[var(--muted)]">{t("staff.form.ownerName")}</p>
              <p className="font-semibold">{intake?.owner_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">{t("staff.form.ownerPhone")}</p>
              <p className="font-semibold">{intake?.owner_phone ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">{t("staff.form.lastOwnerContactAt")}</p>
              <p className="font-semibold">{intake?.last_owner_contact_at ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">{t("staff.form.nextOwnerFollowupAt")}</p>
              <p className="font-semibold">{intake?.next_owner_followup_at ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">{t("staff.form.lastOwnerContactNote")}</p>
              <p className="font-semibold">{intake?.last_owner_contact_note ?? "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-[var(--muted)]">{t("staff.form.ownerNotes")}</p>
              <p className="font-semibold">{intake?.owner_notes ?? "-"}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 hrtaj-card">
          <h2 className="text-lg font-semibold">{t("detail.description.title")}</h2>
          <p className="text-sm text-[var(--muted)]">
            {listing.description || t("detail.description.empty")}
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href={`/staff/units/${listing.id}`}>
            <Button variant="secondary">{t("staff.actions.back")}</Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
