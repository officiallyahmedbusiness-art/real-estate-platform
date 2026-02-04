import { requireOwnerAccess } from "@/lib/owner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { updateSiteSettingsAction } from "../actions";

const defaultSettings = {
  facebook_url: "https://www.facebook.com/share/1C1fQLJD2W/",
  instagram_url: "https://www.instagram.com/hrtaj.co",
  linkedin_url: "https://www.linkedin.com/in/hrtaj-real-estate-519564307",
  tiktok_url: "https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD",
  public_email: "hrtajrealestate@gmail.com",
  whatsapp_number: "+201020614022",
  whatsapp_link: "https://wa.me/201020614022",
};

export default async function OwnerSettingsPage() {
  await requireOwnerAccess("/owner/settings");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = { ...defaultSettings };
  (data ?? []).forEach((row) => {
    if (row.key in settings) {
      settings[row.key as keyof typeof settings] = row.value ?? settings[row.key as keyof typeof settings];
    }
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold">{t("owner.settings.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("owner.settings.subtitle")}</p>
        </div>
        <Card>
          <form action={updateSiteSettingsAction} className="grid gap-4 md:grid-cols-2">
            <FieldInput
              name="facebook_url"
              label={t("owner.settings.facebook")}
              helpKey="owner.settings.facebook"
              defaultValue={settings.facebook_url}
              wrapperClassName="md:col-span-2"
            />
            <FieldInput
              name="instagram_url"
              label={t("owner.settings.instagram")}
              helpKey="owner.settings.instagram"
              defaultValue={settings.instagram_url}
              wrapperClassName="md:col-span-2"
            />
            <FieldInput
              name="public_email"
              label={t("owner.settings.email")}
              helpKey="owner.settings.email"
              defaultValue={settings.public_email}
            />
            <FieldInput
              name="linkedin_url"
              label={t("owner.settings.linkedin")}
              helpKey="owner.settings.linkedin"
              defaultValue={settings.linkedin_url}
            />
            <FieldInput
              name="tiktok_url"
              label={t("owner.settings.tiktok")}
              helpKey="owner.settings.tiktok"
              defaultValue={settings.tiktok_url}
            />
            <FieldInput
              name="whatsapp_number"
              label={t("owner.settings.whatsappNumber")}
              helpKey="owner.settings.whatsappNumber"
              defaultValue={settings.whatsapp_number}
            />
            <FieldInput
              name="whatsapp_link"
              label={t("owner.settings.whatsappLink")}
              helpKey="owner.settings.whatsappLink"
              defaultValue={settings.whatsapp_link}
              wrapperClassName="md:col-span-2"
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">{t("owner.settings.save")}</Button>
            </div>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
