import Link from "next/link";
import { Button } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type HeaderRole = "guest" | "user" | "developer" | "partner" | "admin";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data?.user ?? null;

  let role: HeaderRole = "guest";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as HeaderRole) ?? "user";
  }

  const isAuthed = role !== "guest";
  const isPartner = role === "developer" || role === "partner" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          سوق العقارات
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-white/70 md:flex">
          <Link href="/listings" className="hover:text-white">
            الإعلانات
          </Link>
          {isPartner ? (
            <Link href="/developer" className="hover:text-white">
              بوابة المطور
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="hover:text-white">
              الإدارة
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin/reports" className="hover:text-white">
              التقارير
            </Link>
          ) : null}
          {isAuthed ? (
            <Link href="/account" className="hover:text-white">
              الحساب
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">
              لوحة التحكم
            </Link>
          ) : null}
          {!isAuthed ? (
            <Link href="/auth?next=/dashboard">
              <Button size="sm">تسجيل الدخول</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
