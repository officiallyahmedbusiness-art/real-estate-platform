import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { submitCareerApplicationAction } from "./actions";

const OPENINGS = [
  { id: "sales", labelKey: "careers.roles.sales" },
  { id: "crm", labelKey: "careers.roles.crm" },
  { id: "ops", labelKey: "careers.roles.ops" },
  { id: "content", labelKey: "careers.roles.content" },
];

export default async function CareersPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const perks = [
    t("careers.perks.item1"),
    t("careers.perks.item2"),
    t("careers.perks.item3"),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-6 py-10">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("careers.kicker")}
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">{t("careers.title")}</h1>
          <p className="max-w-2xl text-sm text-[var(--muted)] md:text-base">{t("careers.subtitle")}</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.9fr]">
          <Card className="space-y-4 hrtaj-card">
            <h2 className="text-xl font-semibold">{t("careers.openings.title")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPENINGS.map((role) => (
                <Card key={role.id} className="space-y-2">
                  <p className="text-sm font-semibold">{t(role.labelKey)}</p>
                  <p className="text-xs text-[var(--muted)]">{t("careers.openings.location")}</p>
                </Card>
              ))}
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--text)]">{t("careers.perks.title")}</p>
              <ul className="mt-2 list-disc space-y-1 ps-5">
                {perks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="space-y-4 hrtaj-card">
            <h2 className="text-xl font-semibold">{t("careers.apply.title")}</h2>
            <form action={submitCareerApplicationAction} className="space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <Input name="name" placeholder={t("careers.apply.name")} required />
              <Input name="email" placeholder={t("careers.apply.email")} type="email" />
              <Input name="phone" placeholder={t("careers.apply.phone")} />
              <Select name="role_title" defaultValue="">
                <option value="">{t("careers.apply.role")}</option>
                {OPENINGS.map((role) => (
                  <option key={role.id} value={t(role.labelKey)}>
                    {t(role.labelKey)}
                  </option>
                ))}
              </Select>
              <Textarea name="message" placeholder={t("careers.apply.message")} />
              <div className="space-y-2 text-xs text-[var(--muted)]">
                <label className="block text-sm text-[var(--text)]">{t("careers.apply.cv")}</label>
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx"
                  className="w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t("careers.apply.submit")}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <SiteFooter showFloating />
    </div>
  );
}
