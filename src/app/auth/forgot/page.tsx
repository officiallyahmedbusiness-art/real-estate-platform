import Link from "next/link";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { Button, Card, Input } from "@/components/ui";
import { requestResetAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: { sent?: string; next?: string };
}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const sent = searchParams?.sent === "1";
  const nextPath = searchParams?.next ?? "/dashboard";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("auth.reset.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("auth.reset.subtitle")}</p>
          </div>

          <form action={requestResetAction} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted)]">{t("auth.reset.email")}</label>
              <Input name="email" placeholder={t("auth.email.placeholder")} autoComplete="email" required />
            </div>
            <Button type="submit" className="w-full">
              {t("auth.reset.send")}
            </Button>
          </form>

          {sent ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
              {t("auth.reset.sent")}
            </div>
          ) : null}

          <footer className="flex items-center justify-between text-xs text-[var(--muted)]">
            <Link href="/auth" className="hover:text-[var(--text)]">
              {t("auth.reset.back")}
            </Link>
          </footer>
        </Card>
      </div>
    </main>
  );
}
