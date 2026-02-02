import Link from "next/link";
import { Badge } from "@/components/ui";
import { createT, type Locale } from "@/lib/i18n";

export type PartnerItem = {
  id: string;
  name_ar: string;
  name_en: string;
  logo_url: string | null;
  sort_order: number;
};

export function PartnerMarquee({
  locale,
  partners,
  href = "/listings?purpose=new-development",
}: {
  locale: Locale;
  partners: PartnerItem[];
  href?: string;
}) {
  const t = createT(locale);
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];

  return (
    <div className="partner-strip">
      <div className="partner-track">
        {loop.map((partner, index) => (
          <div key={`${partner.id}-${index}`} className="partner-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] overflow-hidden">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={locale === "ar" ? partner.name_ar : partner.name_en}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (locale === "ar" ? partner.name_ar : partner.name_en).slice(0, 2)
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {locale === "ar" ? partner.name_ar : partner.name_en}
                </p>
                <p className="text-xs text-[var(--muted)]">{t("brand.domain")}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{t("home.partners.tag.launch")}</Badge>
              <Badge>{t("home.partners.tag.locations")}</Badge>
            </div>
            <Link href={href} className="mt-4 inline-flex text-xs font-semibold text-[var(--accent)]">
              {t("home.partners.cta")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
