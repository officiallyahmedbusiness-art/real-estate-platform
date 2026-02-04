import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Section } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { updateProfileAction } from "./actions";
import { createT, getLeadStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

const roleLabels: Record<string, string> = {
  owner: "role.owner",
  developer: "role.developer",
  admin: "role.admin",
  ops: "role.ops",
  staff: "role.staff",
  agent: "role.agent",
};

export default async function AccountPage() {
  const { user, profile } = await requireAuth("/account");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: favoritesData } = await supabase
    .from("favorites")
    .select(
      "listing_id, listings(id, title, price, currency, city, area, purpose, type, listing_images(path, sort))"
    )
    .eq("user_id", user.id);
  const favorites = favoritesData ?? [];

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, name, phone, email, message, created_at, listing_id, status, listings(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const leads = leadsData ?? [];

  const roleLabelKey = roleLabels[profile?.role ?? "staff"] ?? "role.staff";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("account.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("account.subtitle")}</p>
          </div>
          <Badge>{t(roleLabelKey)}</Badge>
        </div>

        <Card>
          <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
            <FieldInput
              name="full_name"
              label={t("account.profile.name")}
              helpKey="account.profile.full_name"
              defaultValue={profile?.full_name ?? ""}
              required
              wrapperClassName="md:col-span-2"
            />
            <FieldInput
              name="phone"
              label={t("account.profile.phone")}
              helpKey="account.profile.phone"
              defaultValue={profile?.phone ?? ""}
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">{t("account.profile.save")}</Button>
            </div>
          </form>
        </Card>

        <Section title={t("account.favorites.title")} subtitle={t("account.favorites.subtitle")}>
          {favorites.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">
                {t("account.favorites.empty")}{" "}
                <Link href="/listings" className="underline">
                  {t("nav.listings")}
                </Link>
                .
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {favorites.map((fav) => {
                const listing = Array.isArray(fav.listings) ? fav.listings[0] : fav.listings;
                if (!listing) return null;
                const cover =
                  listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
                const coverUrl = getPublicImageUrl(cover);
                return (
                  <Card key={listing.id} className="flex gap-4">
                    <div className="h-24 w-28 overflow-hidden rounded-xl bg-[var(--surface)]">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                          {t("general.noImage")}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Link href={`/listing/${listing.id}`}>
                        <h3 className="text-base font-semibold hover:text-[var(--accent)]">
                          {listing.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[var(--muted)]">
                        {listing.city}
                        {listing.area ? ` - ${listing.area}` : ""}
                      </p>
                      <p className="text-sm font-semibold text-[var(--accent)]">
                        {formatPrice(listing.price, listing.currency, locale)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("account.leads.title")} subtitle={t("account.leads.subtitle")}>
          {leads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("account.leads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => {
                const listing = Array.isArray(lead.listings) ? lead.listings[0] : lead.listings;
                return (
                  <Card key={lead.id} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-[var(--muted)]">
                        {t("account.leads.listing", { title: listing?.title ?? lead.listing_id })}
                      </p>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>
                    <p className="text-base font-semibold">{lead.name}</p>
                    <p className="text-xs text-[var(--muted)]">{lead.email ?? "-"}</p>
                    <p className="text-xs text-[var(--muted)]">{lead.phone ?? "-"}</p>
                    {lead.message ? (
                      <p className="text-sm text-[var(--muted)]">{lead.message}</p>
                    ) : null}
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



