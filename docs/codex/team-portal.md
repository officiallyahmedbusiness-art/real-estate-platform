# Team/Partner Portal

## Overview
- Internal partition at `/team` for فريق العمل والشركاء.
- Public entry link: `تسجيل دخول فريق العمل 🔒` -> `/team/login`.
- Login is invite-only using Supabase Auth (no public signup).

## Roles Matrix
- Owner: full access (users, partners, CRM, units).
- Admin: operational access (users, partners, CRM, units) but cannot modify Owner.
- Ops/Staff/Agent: CRM access + read-only partner submissions view.
- Developer (Partner): access to partner submissions only (developer portal).

## Invite Flow
- Owner/Admin opens `/team/users`.
- Invite via `/api/admin/users/invite` using Supabase Admin API.
- Roles supported: `admin`, `staff`, `ops`, `agent`, `developer`.
- Invite email is sent; user signs in via `/team/login`.

## Partner Submissions
- Partner developers submit projects/units through the internal system.
- `/team/units` redirects developers to `/developer` (existing partner portal).
- Submissions stored in `projects` and `listings` with `submission_status`.

## Staff/Admin Review
- `/team/units` routes staff/ops/agent to `/staff` and owner/admin to `/admin` for review flows.
- `/team/crm` (CRM roles): CRM intake and follow-ups.

## Owner Cleanup Tool
- `/team/tools/cleanup` (Owner only): removes seeded placeholders from `site_settings`.
- Shows before/after NULL presence by key without exposing values.

## Public Supply
- `/supply` remains public but developer CTA routes to `/team/login`.
- `/supply/developer` now explains invite-only access and links to `/team/login`.
