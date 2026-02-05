# SEO Notes

## Structured data
- `LocalBusiness` + `RealEstateAgent` schema injected in root layout.
- Listing pages include `Offer` schema and `BreadcrumbList`.
- Home page includes `FAQPage` schema.

## Metadata
- Listing metadata built via `src/lib/seo/meta.ts` with canonical + OG/Twitter.
- Base URL resolved from `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_APP_URL` or Vercel URL.

## Hreflang
- Language detection is cookie-based; `?lang=ar|en` sets locale and redirects.
- For SEO: recommend linking to `/?lang=ar` and `/?lang=en` in future headers if needed.
