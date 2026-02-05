import AuthClient from "@/app/auth/AuthClient";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function TeamLoginPage() {
  const locale = await getServerLocale();
  const t = createT(locale);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">{t("team.login.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("team.login.subtitle")}</p>
        </div>
        <AuthClient
          defaultNext="/team"
          noticeTitle={t("team.notice.title")}
          noticeDescription={t("team.notice.subtitle")}
          errorNote={t("team.login.errorNote")}
          embedded
        />
      </main>
      <SiteFooter />
    </div>
  );
}
