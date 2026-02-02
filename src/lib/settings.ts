import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type SiteSettings = {
  facebook_url: string;
  linkedin_url: string;
  tiktok_url: string;
  public_email: string;
  whatsapp_number: string;
  whatsapp_link: string;
};

const defaults: SiteSettings = {
  facebook_url: "https://www.facebook.com/share/1C1fQLJD2W/",
  linkedin_url: "https://www.linkedin.com/in/hrtaj-real-estate-519564307",
  tiktok_url: "https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD",
  public_email: "hrtajrealestate@gmail.com",
  whatsapp_number: "+201020614022",
  whatsapp_link: "https://wa.me/201020614022",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = { ...defaults };
  (data ?? []).forEach((row) => {
    if (row.key in settings) {
      settings[row.key as keyof SiteSettings] =
        row.value ?? settings[row.key as keyof SiteSettings];
    }
  });
  const normalizedEmail = (settings.public_email ?? "").trim().toLowerCase();
  if (normalizedEmail && normalizedEmail.includes("hrtaj4realestate")) {
    settings.public_email = "hrtajrealestate@gmail.com";
  }
  return settings;
}
