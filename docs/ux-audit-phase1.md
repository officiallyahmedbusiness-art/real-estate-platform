# UX Audit Phase 1 (Brand + Mobile Reliability)

## Root causes (confirmed)
1) Arabic brand drift after hydration
- Cause: a client-side fallback component (BrandGlyphFallback) ran after hydration and replaced the brand string with a fallback that removed the Persian letter ("چ" -> "ج") when the glyph was detected as unsupported.
- This caused a SSR/CSR mismatch and post-hydration DOM mutation.
- Fix: removed the client-side glyph replacement, added a single source of truth in `src/lib/brand.ts`, and enforced fonts that include U+0686.

2) Mobile CSS reliability + layout issues
- Cause: mobile rendering instability was amplified by a mix of background-attachment: fixed on body, tight spacing/typography at small widths, and mobile menu overlays not clamping to viewport/safe-area.
- Fix: mobile-safe background attachment, safe-area variables, responsive typography/spacing, menu panel viewport clamping, and consistent form sizing.

## Changes applied (high level)
- Brand strings centralized in `src/lib/brand.ts` and injected via i18n templates (no client override).
- Fonts updated to ensure Arabic + Persian glyph coverage (Cairo + Noto Sans Arabic + fallback stack).
- Mobile layout fixes for callback card and mobile menu panel.
- Added automated brand + mobile smoke tests (Playwright).

## Automated checks
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`

## Manual QA checklist
Brand + hydration
- [ ] Hard refresh on homepage (Arabic): brand renders as "هارتچ" and stays correct after hydration.
- [ ] Navigate to /about then back to / (client-side): brand remains "هارتچ".
- [ ] Inspect title/metadata on / and /about (Arabic): brand is "هارتچ".

Mobile layout (iOS Safari + Android Chrome)
- [ ] 320 / 360 / 390 / 412 widths: no horizontal scroll.
- [ ] Header menu opens without overflow; menu panel fits within viewport.
- [ ] "اطلب مكالمة الآن" card spacing/inputs aligned, CTA visible.
- [ ] Floating WhatsApp button does not overlap important CTAs or inputs.

CSS reliability
- [ ] Hard refresh over slow 3G: styles consistently applied.
- [ ] No flashes of unstyled content after navigation.

## Files touched (summary)
- Brand/i18n: `src/lib/brand.ts`, `src/lib/i18n.ts`, `scripts/check-brand-ar.mjs`
- UI + mobile: `src/app/page.tsx`, `src/app/globals.css`, `src/components/SiteHeader.tsx`
- Content: `src/app/about/page.tsx`, `src/app/staff/units/[id]/print/page.tsx`
- Tests: `playwright.config.ts`, `tests/brand.spec.ts`, `tests/mobile.spec.ts`
