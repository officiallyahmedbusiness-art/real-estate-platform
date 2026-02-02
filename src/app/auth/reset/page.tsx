import Link from "next/link";
import { Button, Card, Input } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updatePasswordAction } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { ready?: string };
}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const ready = searchParams?.ready === "1";

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
        <Card className="w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("auth.reset.newTitle")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("auth.reset.newSubtitle")}</p>
          </div>

          {!ready ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
              {t("auth.reset.waiting")}
            </div>
          ) : null}

          <form action={updatePasswordAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted)]">{t("auth.reset.newPassword")}</label>
              <Input name="password" type="password" required minLength={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted)]">{t("auth.reset.confirm")}</label>
              <Input name="confirm" type="password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full">
              {t("auth.reset.save")}
            </Button>
          </form>

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
