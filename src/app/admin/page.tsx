import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Input, Select, Section } from "@/components/ui";
import {
  addDeveloperMemberAction,
  createDeveloperAction,
  updateListingStatusAction,
  updateUserRoleAction,
} from "./actions";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminPage() {
  await requireRole("admin", "/admin");
  const supabase = await createSupabaseServerClient();

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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main dir="rtl" className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">لوحة الإدارة</h1>
            <p className="text-sm text-white/60">
              متابعة الأداء، إدارة المطورين والمستخدمين.
            </p>
          </div>
          <Badge>admin</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-white/60">وحدات اليوم</p>
            <p className="text-2xl font-semibold">{unitsToday}</p>
          </Card>
          <Card>
            <p className="text-sm text-white/60">وحدات آخر 7 أيام</p>
            <p className="text-2xl font-semibold">{unitsWeek}</p>
          </Card>
          <Card>
            <p className="text-sm text-white/60">طلبات اليوم</p>
            <p className="text-2xl font-semibold">{leadsToday}</p>
          </Card>
          <Card>
            <p className="text-sm text-white/60">طلبات آخر 7 أيام</p>
            <p className="text-2xl font-semibold">{leadsWeek}</p>
          </Card>
        </div>

        <Section title="أفضل المطورين" subtitle="حسب عدد الوحدات">
          <div className="grid gap-4 md:grid-cols-3">
            {topDevelopers.map((dev) => (
              <Card key={dev.developer_id}>
                <p className="text-lg font-semibold">{dev.name}</p>
                <p className="text-sm text-white/60">الوحدات: {dev.units}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="إعلانات قيد المراجعة" subtitle="اعتماد أو أرشفة الإعلانات">
          {pendingListings.length === 0 ? (
            <Card>
              <p className="text-sm text-white/60">لا توجد إعلانات معلقة حاليًا.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingListings.map((listing) => (
                <Card key={listing.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{listing.title}</p>
                    <p className="text-sm text-white/60">{listing.city}</p>
                  </div>
                  <form action={updateListingStatusAction} className="flex items-center gap-3">
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <Select name="status" defaultValue="draft" className="min-w-[140px]">
                      <option value="draft">مسودة</option>
                      <option value="published">نشر</option>
                      <option value="archived">أرشفة</option>
                    </Select>
                    <Button size="sm" variant="secondary" type="submit">
                      تحديث الحالة
                    </Button>
                  </form>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="إدارة المطورين" subtitle="إضافة شركة وربط المستخدمين">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold">إضافة مطور</h3>
              <form action={createDeveloperAction} className="mt-3 space-y-3">
                <Input name="name" placeholder="اسم الشركة / المطور" required />
                <Button type="submit">إضافة</Button>
              </form>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">ربط مستخدم بمطور</h3>
              <form action={addDeveloperMemberAction} className="mt-3 space-y-3">
                <Select name="developer_id" defaultValue="">
                  <option value="">اختر المطور</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </Select>
                <Input name="user_id" placeholder="User ID (UUID)" required />
                <Input name="role" placeholder="Role داخل الشركة (اختياري)" />
                <Button type="submit">ربط المستخدم</Button>
              </form>
            </Card>
          </div>
        </Section>

        <Section title="إدارة المستخدمين" subtitle="تغيير الأدوار">
          <Card className="space-y-4">
            {profiles.map((profile) => (
              <form
                key={profile.id}
                action={updateUserRoleAction}
                className="flex flex-col gap-3 border-b border-white/10 pb-4 last:border-none"
              >
                <input type="hidden" name="user_id" value={profile.id} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {profile.full_name ?? "بدون اسم"}
                    </p>
                    <p className="text-xs text-white/50">{profile.id}</p>
                    <p className="text-xs text-white/50">{profile.phone ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select name="role" defaultValue={profile.role}>
                      <option value="user">user</option>
                      <option value="developer">developer</option>
                      <option value="partner">partner</option>
                      <option value="admin">admin</option>
                    </Select>
                    <Button size="sm" variant="secondary" type="submit">
                      تحديث الدور
                    </Button>
                  </div>
                </div>
              </form>
            ))}
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
