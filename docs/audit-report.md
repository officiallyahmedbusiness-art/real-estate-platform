# Site Audit Report (Phase 5)

## Summary
- Run: Playwright `tests/site-audit.spec.ts` (desktop + mobile).
- Artifacts: `artifacts/audit-report.json` and `artifacts/screenshots/`.
- Scope: routes from `sitemap.xml` + core static routes fallback.

## Top issues found
- Latest run: 0 failing routes (5 routes audited).
- No console errors, no network failures, no horizontal overflow.

## Encoding / "????" root cause
- No source-level "????" or replacement characters (`�`) found in repository strings.
- Risks addressed:
  - Missing explicit charset declaration in HTML head.
  - Font fallback gaps for Arabic glyphs (especially "چ").
- Fixes applied:
  - Added `<meta charSet="utf-8" />` in root layout head.
  - Ensured Arabic-capable font stack is loaded in layout.
  - Playwright guard fails if "??" or `�` appears in rendered text.

## CSS/JS loading issues
- Audit checks for network failures (>=400) and missing CSS/JS chunks.
- No failures reported in the latest run.

## Hydration / mismatch fixes
- Removed client glyph fallback that changed the brand string post-hydration.
- Made logo SSR-only (static SVG) to avoid runtime probing.
- Aligned theme/help-mode toggles to avoid client/server state drift.

## Manual QA checklist
- iOS Safari + Android Chrome:
  - No horizontal scroll at 320px.
  - Brand stays **"هارتچ"** on refresh and client navigation.
  - Sticky CTAs do not cover content or inputs.
  - Fonts render Arabic glyphs (including "چ") correctly.
- Desktop Chrome:
  - All routes load without console errors.
  - OpenGraph tags and canonical URLs present on listing pages.

