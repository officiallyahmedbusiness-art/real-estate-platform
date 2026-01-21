import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Section, Badge } from "@/components/ui";
import { PROPERTY_TYPES, PURPOSE_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { createListingAction } from "./actions";

export default async function DeveloperPage() {
  const { user, role } = await requireRole(["developer", "partner", "admin"], "/developer");
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";

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

  let listingQuery = supabase
    .from("listings")
    .select("id, title, price, currency, city, status, purpose, type, created_at, developer_id")
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

  let leadCounts = new Map<string, number>();
  if (listingIds.length > 0) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("listing_id")
      .in("listing_id", listingIds);
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
    created_at: string;
    listings: { title: string } | { title: string }[] | null;
  }> = [];
  if (listingIds.length > 0) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, listing_id, name, phone, email, message, created_at, listings(title)")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false })
      .limit(20);
    recentLeads = (leadsData as typeof recentLeads) ?? [];
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">بوابة المطور</h1>
            <p className="text-sm text-white/60">
              {primaryDeveloperName
                ? `شركة: ${primaryDeveloperName}`
                : "أدر إعلاناتك وطلبات العملاء."}
            </p>
          </div>
          <Badge>{role}</Badge>
        </div>

        <Section title="إضافة إعلان جديد" subtitle="املأ البيانات الأساسية للوحدة">
          <Card>
            <form action={createListingAction} className="grid gap-4 md:grid-cols-3">
              {primaryDeveloperId ? (
                <input type="hidden" name="developer_id" value={primaryDeveloperId} />
              ) : null}
              <Input name="title" placeholder="عنوان الإعلان" required />
              <Select name="type" defaultValue="">
                <option value="">نوع العقار</option>
                {PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select name="purpose" defaultValue="">
                <option value="">الغرض</option>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input name="price" placeholder="السعر" required />
              <Input name="currency" placeholder="العملة" defaultValue="EGP" />
              <Input name="city" placeholder="المدينة" required />
              <Input name="area" placeholder="الحي / المنطقة" />
              <Input name="address" placeholder="العنوان التفصيلي" />
              <Input name="beds" placeholder="غرف النوم" defaultValue="0" />
              <Input name="baths" placeholder="الحمامات" defaultValue="0" />
              <Input name="size_m2" placeholder="المساحة م²" />
              <Input name="amenities" placeholder="المميزات (افصل بفاصلة)" />
              <Select name="status" defaultValue="draft">
                <option value="draft">مسودة</option>
                {isAdmin ? <option value="published">منشور</option> : null}
                <option value="archived">مؤرشف</option>
              </Select>
              <div className="md:col-span-3">
                <textarea
                  name="description"
                  placeholder="وصف الإعلان"
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit">حفظ الإعلان</Button>
              </div>
            </form>
          </Card>
        </Section>

        <Section title="إعلاناتي" subtitle="عرض وإدارة الإعلانات الحالية">
          {listings.length === 0 ? (
            <Card>
              <p className="text-sm text-white/60">
                لا توجد إعلانات بعد. ابدأ بإضافة إعلان جديد.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <p className="text-sm text-white/60">
                      {listing.city} • {listing.type} • {listing.purpose}
                    </p>
                    <p className="text-sm text-amber-200">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>الحالة: {listing.status}</Badge>
                    <Badge>طلبات: {leadCounts.get(listing.id) ?? 0}</Badge>
                    <Link href={`/developer/listings/${listing.id}`}>
                      <Button size="sm" variant="secondary">
                        إدارة الإعلان
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="طلبات العملاء" subtitle="أحدث الطلبات على إعلاناتك">
          {recentLeads.length === 0 ? (
            <Card>
              <p className="text-sm text-white/60">لا توجد طلبات بعد.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentLeads.map((lead) => {
                const listing = Array.isArray(lead.listings)
                  ? lead.listings[0]
                  : lead.listings;
                return (
                  <Card key={lead.id} className="space-y-2">
                    <p className="text-sm text-white/60">
                      الإعلان: {listing?.title ?? lead.listing_id}
                    </p>
                    <p className="text-base font-semibold">{lead.name}</p>
                    <p className="text-xs text-white/50">{lead.email ?? "—"}</p>
                    <p className="text-xs text-white/50">{lead.phone ?? "—"}</p>
                    {lead.message ? (
                      <p className="text-sm text-white/70">{lead.message}</p>
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
