import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input } from "@/components/ui";
import { unlockOwnerAction } from "./actions";

export default async function OwnerUnlockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const params = await searchParams;
  const hasError = params.error === "1";
  const nextPath = typeof params.next === "string" ? params.next : "/owner/users";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl space-y-6 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("owner.unlock.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("owner.unlock.subtitle")}</p>
        </div>
        <Card className="space-y-4">
          <form action={unlockOwnerAction} className="space-y-3">
            <input type="hidden" name="next" value={nextPath} />
            <Input name="owner_token" type="password" placeholder={t("owner.unlock.input")} />
            {hasError ? (
              <p className="text-xs text-[var(--danger)]">{t("owner.unlock.error")}</p>
            ) : null}
            <Button type="submit" size="sm">
              {t("owner.unlock.action")}
            </Button>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
