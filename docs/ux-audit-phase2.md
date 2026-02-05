# UX Audit — Phase 2

## Summary
- Added URL-driven filters and parsing utilities for listings with SSR-safe query sync.
- Introduced premium listing cards, grid, and filter drawer for mobile-first UX.
- Rebuilt property detail page with gallery, facts, amenities, lead form success state, and mobile sticky CTA.
- Added SEO helpers (metadata + JSON-LD) and sitemap/robots routes.

## Performance smoke checklist
Targets (mobile):
- LCP < 2.5s on 4G / mid-tier device
- CLS < 0.1
- TBT < 200ms

How to check:
1) Lighthouse mobile run on `/`, `/listings`, and `/listing/:id`.
2) Verify images have stable aspect ratios (no layout shift).
3) Ensure mobile CTA bar does not overlap content (scroll to lead form).
4) Test slow 3G throttling to confirm CSS/JS load order.

## Manual QA (Phase 2)
- Filters:
  - Share a URL with filters; refresh and confirm form values persist.
  - Apply/reset from mobile bottom sheet.
- Listings:
  - Cards render correctly on 320px width, no horizontal scroll.
  - Check WhatsApp/Call/Share actions.
- Property detail:
  - Gallery works (mobile swipe + dots, desktop thumbs).
  - Sticky mobile CTA works and respects safe area.
  - Lead form validates and shows success/error state.
- SEO:
  - OpenGraph tags present on `/listing/:id`.
  - JSON-LD present in page source.
  - `/sitemap.xml` and `/robots.txt` return successfully.
