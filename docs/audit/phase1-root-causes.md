# Phase 1 Root Causes (Brand / Encoding / CSS)

Date: 2026-02-05

## Brand flip: "هارتچ" -> "هارتج"
**Root cause**
- A client-only glyph fallback component replaced the Arabic brand letter (چ) after hydration when the glyph check failed, producing "هارتج" on the client.
- The brand string existed in multiple sources, so SSR and CSR could diverge.

**Fix**
- Centralized brand strings in `src/lib/brand.ts` and referenced them everywhere.
- Removed the client glyph fallback and ensured the Arabic-capable font stack is loaded via `next/font` in `src/app/layout.tsx`.
- Added automated checks to fail if the wrong spelling appears (Playwright audit + brand check script).

## "????" / mojibake in Arabic strings
**Root cause**
- Missing UTF-8 hardening and inconsistent rendering paths can surface as replacement characters in some environments when fonts are missing or meta charset is not explicit.

**Fix**
- Added `<meta charSet="utf-8" />` in the root layout.
- Ensured Arabic-capable fonts (Cairo + Noto Sans Arabic) with fallback stack.
- Added Playwright guard to fail if "??" or replacement characters appear.

## CSS "sometimes not applied" on mobile
**Root cause**
- Unstable mobile layout due to missing viewport meta and safe-area handling.
- Global styles not guaranteed on every route before fixes.

**Fix**
- `viewport` export in `src/app/layout.tsx` and safe-area tokens in `globals.css`.
- Verified global CSS import in root layout.
- Added audit test that flags missing CSS (overflow / broken layout) on mobile.

