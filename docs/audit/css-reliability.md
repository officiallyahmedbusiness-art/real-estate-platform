# CSS Reliability Notes

Date: 2026-02-05

## Symptoms
- Mobile sometimes rendered without expected styling or layout shifts after refresh.

## Findings
- No service worker/PWA caching detected in repo.
- Primary causes were viewport meta absence and mobile safe-area spacing not accounted for.
- Global CSS load order must be stable (root layout import required for App Router).

## Fixes Applied
- Root layout exports `viewport` with `width=device-width, initial-scale=1, viewport-fit=cover`.
- Global styles imported in `src/app/layout.tsx`.
- Safe-area tokens and consistent layout tokens added to `src/app/globals.css`.

## Verification
- Playwright audit checks for horizontal overflow and missing layout on 390px width.
- Manual: Hard refresh on iOS Safari + Android Chrome; no unstyled flashes observed.

