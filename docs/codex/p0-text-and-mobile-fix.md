# P0 Fix Report — Arabic corruption + Mobile overflow

## Root causes found
- Arabic "????" came from literal placeholder strings in `src/i18n/ar.json` for the home hero/search/callback/request keys.
- Raw i18n keys (e.g., `home.*`) could appear when missing/invalid translations fell back to key strings; production fallback now avoids showing keys or corrupted placeholders.
- Mobile overflow risk was masked by `overflow-x:hidden` on `body` and the home root wrapper; these were removed and verified with Playwright overflow checks.

## Fixes applied (by file)
- `src/i18n/ar.json`: replaced all `???` placeholders with real Arabic labels for home hero/search/callback/request.
- `src/lib/i18n.ts`: production fallback now avoids rendering raw keys or corrupted values; dev still shows keys for missing translations.
- `src/app/globals.css`: removed global `overflow-x:hidden` from body.
- `src/app/page.tsx`: removed `overflow-x-hidden` on home root wrapper.
- `tests/site-audit.spec.ts`: fail build on `???` or `home.` in rendered text.
- `tests/text-corruption.spec.ts`: new route checks for `???` and `home.`.
- `tests/mobile.spec.ts`: added 320px viewport overflow check.
- `supabase/0026_remove_seeded_site_settings.sql`: removes seeded settings keys to keep defaults NULL.
- `src/lib/seo/schema.ts`: omit address in JSON-LD when empty.

## Playwright run output (latest)
```
Running 21 tests using 6 workers
  -   1 [chromium] › tests\rbac-approvals.spec.ts:30:7 › RBAC tests require env credentials › admin cannot update PII; owner can
  -   2 [chromium] › tests\rbac-users.spec.ts:30:7 › RBAC owner immutability › admin cannot touch owner; admin can update non-owner roles
  -   6 [chromium] › tests\phase4.spec.ts:26:5 › gallery works on mobile and watermark is visible
  ok  7 [chromium] › tests\phase3.spec.ts:57:5 › guest favorites persist across reload (2.6s)
  ok  4 [chromium] › tests\filters.spec.ts:5:5 › filters are driven by URL query params (3.0s)
  ok 10 [chromium] › tests\phase3.spec.ts:73:5 › compare bar appears after selecting two listings (1.0s)
  ok  9 [chromium] › tests\phase4.spec.ts:34:5 › no horizontal overflow at 320px (7.7s)
  ok 12 [chromium] › tests\phase3.spec.ts:97:5 › saved search creates and replays query string (6.5s)
  ok  8 [chromium] › tests\settings.spec.ts:16:5 › public pages do not show fake trust strings (10.1s)
  -  15 [chromium] › tests\settings.spec.ts:27:7 › settings-driven company info › renders company info when provided
  -  14 [chromium] › tests\phase3.spec.ts:113:5 › whatsapp click fires analytics without PII
  -  16 [chromium] › tests\whatsapp-copy.spec.ts:26:5 › copy WhatsApp message shows toast
  ok 18 [chromium] › tests\whatsapp-message.spec.ts:6:5 › whatsapp template replaces variables (15ms)
  ok 19 [chromium] › tests\whatsapp-message.spec.ts:21:5 › whatsapp fallback message when template empty (7ms)
  ok 20 [chromium] › tests\whatsapp-message.spec.ts:30:5 › whatsapp message encoding keeps newlines (2ms)
  ok  5 [chromium] › tests\brand.spec.ts:5:5 › brand stays هارتچ after hydration and navigation (13.0s)
  ok 13 [chromium] › tests\text-corruption.spec.ts:7:9 › No corrupted Arabic or raw i18n keys › route / has no ????? or home.* keys (4.8s)
  ok  3 [chromium] › tests\mobile.spec.ts:8:5 › mobile viewports have no horizontal overflow and menu fits (13.7s)
  ok 21 [chromium] › tests\text-corruption.spec.ts:7:9 › No corrupted Arabic or raw i18n keys › route /listings has no ????? or home.* keys (2.1s)
  ok 17 [chromium] › tests\phase3.spec.ts:159:5 › locale switch changes dir without hydration errors (6.2s)
  ok 11 [chromium] › tests\site-audit.spec.ts:40:7 › Site audit crawl › crawl all routes and capture issues (20.9s)

  6 skipped
  15 passed (28.3s)
```

## Live curl verification (after deploy)
(Will be updated after production deploy)

```
curl.exe -sL https://hrtaj.com/ | findstr /I "??? home."

curl.exe -sL https://hrtaj.com/listings | findstr /I "??? home."
```

## Commands to re-run
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- `vercel deploy --prod`
- curl checks above
