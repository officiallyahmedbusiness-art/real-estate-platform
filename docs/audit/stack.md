# Stack Snapshot

Date: 2026-02-05

## Framework & Runtime
- Next.js 16.1.4, App Router (`src/app`).
- React 19, Node 20.

## Styling
- Tailwind v4 via `@import "tailwindcss"` in `src/app/globals.css`.
- Custom design tokens + component classes in `globals.css`.
- No Tailwind config file present.

## Fonts
- `next/font/google`: Cairo + Noto Sans Arabic for Arabic, Geist for Latin (`src/app/layout.tsx`).

## i18n
- Custom dictionary in `src/lib/i18n.ts` + overlays in `src/i18n/ar.json` + `src/i18n/en.json`.
- Locale middleware in `middleware.ts`; server helpers in `src/lib/i18n.server.ts`.

## Auth / RBAC
- Supabase Auth + DB RLS.
- Server clients: `src/lib/supabaseServer.ts`, admin client `src/lib/supabaseAdmin.ts`, browser client `src/lib/supabaseClient.ts`.
- Role helpers in SQL: `public.is_owner()`, `public.is_admin()`, `public.is_crm_user()`.
- PII approvals: `public.pii_change_requests` with owner-only approval RPCs.

## Routes / Modules
- Public: `/`, `/listings`, `/listing/[id]`, `/about`, `/careers`, `/partners`.
- CRM: `/crm/*`.
- Admin: `/admin/*` (including `/admin/approvals`).
- Owner: `/owner/*`.
- Developer / Staff portals under `/developer/*` and `/staff/*`.

## PWA / SW
- No service worker or PWA integration detected.

