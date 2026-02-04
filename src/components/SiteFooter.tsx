import { Logo } from "@/components/Logo";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getSiteSettings } from "@/lib/settings";

export async function SiteFooter({ showFloating = false }: { showFloating?: boolean } = {}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const settings = await getSiteSettings();
  const whatsappLink = settings.whatsapp_link || null;
  const instagramLink = settings.instagram_url || null;
  const linkedinLink = settings.linkedin_url || null;
  const tiktokLink = settings.tiktok_url || null;
  const contactEmail = settings.public_email || t("footer.email");
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-[var(--border)] bg-[var(--surface)] ${
        showFloating ? "pb-[calc(5rem+var(--safe-bottom))] sm:pb-[calc(6rem+var(--safe-bottom))]" : ""
      }`}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 text-xs text-[var(--muted)] sm:gap-8 sm:px-6 sm:py-10 sm:text-sm lg:px-8 md:grid-cols-[1.4fr,1fr,1fr]">
        <div className="space-y-3">
          <Logo name={t("brand.name")} className="text-[var(--text)]" imageClassName="h-8 sm:h-10 md:h-12" />
          <p className="max-w-md">{t("brand.tagline")}</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("footer.links")}
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/about" className="hover:text-[var(--text)]">{t("nav.about")}</a>
            <a href="/listings" className="hover:text-[var(--text)]">{t("nav.listings")}</a>
            <a href="/careers" className="hover:text-[var(--text)]">{t("nav.careers")}</a>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("footer.contact")}
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {settings.facebook_url ? (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.facebook")}
              </a>
            ) : null}
            {instagramLink ? (
              <a href={instagramLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.instagram")}
              </a>
            ) : null}
            {linkedinLink ? (
              <a href={linkedinLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.linkedin")}
              </a>
            ) : null}
            {tiktokLink ? (
              <a href={tiktokLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.tiktok")}
              </a>
            ) : null}
            {whatsappLink ? (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.whatsapp")}
              </a>
            ) : null}
            <a href={`mailto:${contactEmail}`} className="text-[var(--text)] hover:text-[var(--accent)]">
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-[var(--muted)] sm:px-6 sm:text-xs lg:px-8">
          <p>
            (c) {year} {t("brand.name")} - {t("brand.domain")}
          </p>
          <p>{t("footer.rights")}</p>
        </div>
      </div>
      {showFloating && whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="floating-whatsapp fixed z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-semibold text-white shadow-[var(--shadow-strong)] transition hover:-translate-y-1"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-white"
          >
            <path d="M20.5 3.5A11 11 0 0 0 2.8 16.6L2 22l5.6-1.7A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.3 1 1-3.2-.2-.3A9 9 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.7-.8-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 7.7 7.7 0 0 1-1.4-1.8c-.1-.2 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.3 3c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.8.6.7.2 1.3.2 1.7.1.5-.1 1.7-.7 1.9-1.4s.2-1.3.1-1.4c0-.1-.2-.2-.5-.3Z"/>
          </svg>
          {t("footer.whatsapp")}
        </a>
      ) : null}
    </footer>
  );
}

