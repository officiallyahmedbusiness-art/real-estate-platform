# PWA / Cache Notes

Status: No service worker or PWA integration detected in this repo.

Actions taken:
- No new PWA layer added (per requirement).
- CSS/JS are served via Next.js default asset pipeline.
- Build output uses hashed static assets to prevent stale CSS/JS.

If a PWA is added in the future:
- Use network-first for HTML and stale-while-revalidate for static assets.
- Version cache on deploy and prompt refresh when SW updates.
- Never serve stale CSS indefinitely.
