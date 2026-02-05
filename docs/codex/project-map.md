# Project Map (auto-generated)

Date: 2026-02-05

## Stack
- Framework: Next.js 16.1.4 (App Router).
- Runtime: React 19, Node 20.
- Styling: Tailwind v4 via `@import "tailwindcss"` + custom CSS in `src/app/globals.css` (design tokens + components classes). No Tailwind config file present.
- Fonts: `next/font/google` in `src/app/layout.tsx` (Arabic: Cairo + Noto Sans Arabic; Latin: Geist).
- i18n: Custom dictionary in `src/lib/i18n.ts` with JSON overlays `src/i18n/ar.json` and `src/i18n/en.json`, helpers in `src/lib/i18n.server.ts` + `src/lib/i18n.client.ts`. Locale choice via cookie / query and middleware header.
- Routing: App Router in `src/app/*` (public, admin, owner, staff, developer, crm). Middleware at `middleware.ts`.
- Data layer: Supabase (SSR helpers in `src/lib/supabaseServer.ts`, admin client in `src/lib/supabaseAdmin.ts`, browser client in `src/lib/supabaseClient.ts`).

## Key Entrypoints
- Root layout: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`
- Middleware: `middleware.ts` (locale + auth gating)
- Brand constants: `src/lib/brand.ts`
- SEO helpers: `src/lib/seo/*`
- Error boundary: `src/app/error.tsx` + `src/components/ErrorBoundary.tsx`

## Auth/RBAC
- Supabase auth; role helpers used in server actions (`src/lib/owner.ts`, `src/lib/profile.ts`).
- Existing migrations in `supabase/migrations/*` for owner governance + lead masking + PII approvals.
- API routes under `src/app/api/*` for owner-only actions and exports.

## Data Domains
- Listings / Ads / Projects: `src/app/listings`, `src/app/listing/[id]`, `src/app/developer/*`.
- CRM: `src/app/crm/*` (leads, customers, activities, sources, visits).
- Admin: `src/app/admin/*` (homepage, ads, careers, partners, reports, flags, approvals).
- Owner: `src/app/owner/*` (settings, users, audit).

## UI System
- Components under `src/components/*` and `src/components/ui/*`.
- Field help system: `src/components/FieldHelp.tsx` + registry `src/lib/fieldHelp.ts`.
- Listings: `src/components/listings/*`.

## Known Non-Features
- No service worker/PWA detected.
- No Tailwind config file; design tokens are in `globals.css`.

## Data Fetching Conventions
- Server components use Supabase server client or `fetch`.
- Client components use `supabaseClient` and local stores (favorites, compare, saved searches).

## Testing
- Playwright config: `playwright.config.ts`.
- E2E: `tests/*` including `tests/site-audit.spec.ts`.

