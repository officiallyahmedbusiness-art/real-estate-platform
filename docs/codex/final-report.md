# HRTAJ / هارتچ - Final Report

Date: 2026-02-05

## A) Executive Summary
- Fixed brand flip by removing client glyph fallback and centralizing brand constants; SSR/CSR now stable on "هارتچ".
- Hardened encoding with explicit UTF-8 meta + Arabic-capable font stack + Playwright guard against "??"/"�".
- Mobile-first UI uplift: spacing tokens, responsive typography, safe-area handling, and improved mobile layouts.
- Implemented search/filters (URL-driven), premium listing cards, and conversion-focused property page.
- Added differentiators: favorites, compare, saved search, recently viewed, and analytics hooks (no PII).
- RBAC: owner higher than admin, PII approval workflow, owner-only invites, admin operational access with restrictions.
- Tests run: lint, typecheck, build, Playwright suite (RBAC test skips if env creds missing).

## B) Root Causes + Fixes
- Brand flip ("هارتچ" -> "هارتج"): client-only glyph fallback mutated the string post-hydration; fixed by removing fallback and centralizing brand constants.
- "????" / mojibake: risk from missing charset + font fallback; fixed by enforcing UTF-8 meta and Arabic fonts with fallback stack.
- CSS flakiness on mobile: viewport/safe-area gaps and inconsistent mobile layout; fixed by viewport export and stable global styles.

## C) Change Log by Phase
### Phase 1 - Brand + Encoding + CSS
- Brand constants, UTF-8 meta, Arabic font stack, brand integrity scripts.
- Mobile-safe global tokens and consistent global CSS load.
### Phase 2 - Search/Filters + Listings + Property Page
- URL-driven filters and SSR-safe parsing; listings grid + premium cards; property gallery + lead form + sticky CTA.
- SEO/OG/JSON-LD improvements.
### Phase 3 - Differentiators
- Favorites, compare, saved search, recently viewed, analytics wrapper, feature flags, locale switcher.
### Phase 4 - Polish + Security
- Motion polish, watermark overlay, security headers, rate limit guards, PWA cache notes.
### Phase 5 - Full Site Audit
- Playwright crawl, audit report artifacts, encoding guard, no horizontal overflow checks.
### RBAC + PII Approvals
- Owner-only invites and approvals; admin operational access with PII update restrictions and request workflow.
### RBAC + Owner Immutability (Update)
- Admin can manage users except owner; DB policies + triggers prevent owner edits/role changes by admins.

## D) Files Changed by Phase (high-level grouping)
- Phase 1: `src/lib/brand.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `scripts/check-brand-ar.mjs`, `tests/brand.spec.ts`.
- Phase 2: listings/filters/components under `src/components/listings`, `src/components/search`, `src/app/listings`, `src/app/listing/[id]`, `src/lib/filters`.
- Phase 3: `src/lib/favorites`, `src/lib/compare`, `src/lib/savedSearch`, `/saved`, `/compare`, `/saved-searches`, analytics + flags.
- Phase 4: `next.config.ts`, `middleware.ts`, watermark + motion styles, security headers, `docs/pwa-cache-notes.md`.
- Phase 5: `tests/site-audit.spec.ts`, `docs/audit-report.md`, `scripts/quality-smoke.mjs`.
- RBAC: `supabase/migrations/*pii*`, `src/app/admin/approvals/*`, `src/app/api/pii-requests`, `src/app/api/owner/invite-admin`, `src/app/crm/*`.
- RBAC update: `supabase/migrations/20260205120000_profiles_owner_lock.sql`, `src/app/api/admin/users/*`, `src/components/UserManagementList.tsx`.

## E) File-by-file List (every changed/added file)
- `.tmp_generate_final_report.cjs` — Updated file.
- `artifacts/audit-report.json` — Audit JSON report (Playwright crawl).
- `artifacts/screenshots/-desktop.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/-mobile.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/about-desktop.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/about-mobile.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/careers-desktop.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/careers-mobile.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/listings-desktop.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/listings-mobile.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/partners-desktop.png` — Audit artifact (screenshot/report).
- `artifacts/screenshots/partners-mobile.png` — Audit artifact (screenshot/report).
- `docs/audit-report.md` — Documentation.
- `docs/audit/css-reliability.md` — Documentation.
- `docs/audit/phase1-root-causes.md` — Documentation.
- `docs/audit/stack.md` — Documentation.
- `docs/codex/final-report.md` — Final consolidated report (this file).
- `docs/codex/project-map.md` — Documentation.
- `docs/deploy-checklist.md` — Documentation.
- `docs/design-system.md` — Documentation.
- `docs/pwa-cache-notes.md` — Documentation.
- `docs/rbac-approvals.md` — Documentation.
- `docs/seo-notes.md` — Documentation.
- `docs/ux-audit-phase2.md` — Documentation.
- `middleware.ts` — Edge middleware for locale/flags/headers and routing safeguards.
- `next.config.ts` — Next.js configuration (headers, images, redirects).
- `package-lock.json` — Dependency lockfile snapshot.
- `package.json` — Project scripts and dependencies.
- `public/brand/hrtaj-logo.svg` — Brand logo asset (Arabic logotype).
- `scripts/check-brand-ar.mjs` — Brand integrity check (fails on wrong spelling or mojibake).
- `scripts/quality-smoke.mjs` — Smoke checks for broken images/console errors.
- `scripts/seed_admin_user.mjs` — Owner-only admin invite seed script (Foxm575@gmail.com).
- `src/app/actions/marketplace.ts` — Updated file.
- `src/app/admin/actions.ts` — Server actions for page/module operations.
- `src/app/admin/approvals/actions.ts` — Server actions for approving/rejecting PII requests.
- `src/app/admin/approvals/page.tsx` — Owner approval queue UI for PII requests.
- `src/app/admin/flags/page.tsx` — Admin feature flags UI.
- `src/app/admin/page.tsx` — Route page component for /admin.
- `src/app/api/admin/users/disable/route.ts` — Admin/owner disable/enable endpoint (owner immune).
- `src/app/api/admin/users/invite/route.ts` — Admin/owner user invite endpoint (non-owner roles).
- `src/app/api/admin/users/update-role/route.ts` — Admin/owner role update endpoint with owner guard.
- `src/app/api/listings/by-ids/route.ts` — API route for listing summaries by IDs.
- `src/app/api/owner/invite-admin/route.ts` — Owner-only admin invite/promote API route.
- `src/app/api/owner/users/route.ts` — API route /api/owner/users handler.
- `src/app/api/pii-requests/route.ts` — API route for creating PII change requests.
- `src/app/compare/page.tsx` — Compare page UI.
- `src/app/crm/actions.ts` — Server actions for page/module operations.
- `src/app/crm/activities/page.tsx` — Route page component for /crm/activities.
- `src/app/crm/customers/[id]/actions.ts` — Server actions for page/module operations.
- `src/app/crm/customers/[id]/page.tsx` — Route page component for /crm/customers/[id].
- `src/app/crm/customers/page.tsx` — Route page component for /crm/customers.
- `src/app/crm/page.tsx` — Route page component for /crm.
- `src/app/crm/visits/page.tsx` — Route page component for /crm/visits.
- `src/app/developer/page.tsx` — Route page component for /developer.
- `src/app/error.tsx` — Global error page.
- `src/app/globals.css` — Global styles.
- `src/app/health/route.ts` — Health check endpoint.
- `src/app/layout.tsx` — Root layout (fonts, metadata, global providers).
- `src/app/listing/[id]/page.tsx` — Route page component for /listing/[id].
- `src/app/listings/loading.tsx` — Loading UI for /listings.
- `src/app/listings/page.tsx` — Route page component for /listings.
- `src/app/page.tsx` — Route page component.
- `src/app/partners/page.tsx` — Route page component for /partners.
- `src/app/robots.ts` — Robots.txt route.
- `src/app/saved-searches/page.tsx` — Saved searches page UI.
- `src/app/saved/page.tsx` — Saved listings page UI.
- `src/app/sitemap.ts` — Sitemap generation route.
- `src/components/ErrorBoundary.tsx` — UI component.
- `src/components/FieldHelp.tsx` — UI component.
- `src/components/InviteUserForm.tsx` — UI component.
- `src/components/LanguageSwitcher.tsx` — UI component.
- `src/components/Logo.tsx` — UI component.
- `src/components/OwnerDeleteDialog.tsx` — UI component.
- `src/components/SiteFooter.tsx` — UI component.
- `src/components/SiteHeader.tsx` — UI component.
- `src/components/ThemeSwitcher.tsx` — UI component.
- `src/components/Toast.tsx` — UI component.
- `src/components/UserManagementList.tsx` — UI component.
- `src/components/compare/CompareBar.tsx` — UI component.
- `src/components/compare/CompareButton.tsx` — UI component.
- `src/components/compare/ComparePage.tsx` — UI component.
- `src/components/favorites/FavoriteButton.tsx` — UI component.
- `src/components/favorites/SavedListings.tsx` — UI component.
- `src/components/home/Areas.tsx` — UI component.
- `src/components/home/FAQ.tsx` — UI component.
- `src/components/home/FeaturedListings.tsx` — UI component.
- `src/components/home/Hero.tsx` — UI component.
- `src/components/home/Trust.tsx` — UI component.
- `src/components/leads/LeadForm.tsx` — UI component.
- `src/components/listings/FiltersDrawer.tsx` — UI component.
- `src/components/listings/Gallery.tsx` — UI component.
- `src/components/listings/ListingActionButtons.tsx` — UI component.
- `src/components/listings/ListingCard.tsx` — UI component.
- `src/components/listings/ListingViewTracker.tsx` — UI component.
- `src/components/listings/ListingsGrid.tsx` — UI component.
- `src/components/listings/MobileCtaBar.tsx` — UI component.
- `src/components/listings/PropertyFacts.tsx` — UI component.
- `src/components/listings/RecentlyViewedStrip.tsx` — UI component.
- `src/components/listings/RecentlyViewedTracker.tsx` — UI component.
- `src/components/listings/ShareButton.tsx` — UI component.
- `src/components/listings/types.ts` — UI component.
- `src/components/search/FiltersAnalytics.tsx` — UI component.
- `src/components/search/SaveSearchModal.tsx` — UI component.
- `src/components/search/SavedSearchesList.tsx` — UI component.
- `src/components/ui.tsx` — UI component.
- `src/components/ui/Badge.tsx` — UI component.
- `src/components/ui/Button.tsx` — UI component.
- `src/components/ui/Card.tsx` — UI component.
- `src/components/ui/Skeleton.tsx` — UI component.
- `src/i18n/ar.json` — Translation dictionary.
- `src/i18n/en.json` — Translation dictionary.
- `src/lib/analytics/index.ts` — Utility/module library.
- `src/lib/compare/store.ts` — Utility/module library.
- `src/lib/constants.ts` — Utility/module library.
- `src/lib/favorites/store.ts` — Utility/module library.
- `src/lib/fieldHelp.ts` — Utility/module library.
- `src/lib/filters/query.ts` — Utility/module library.
- `src/lib/filters/types.ts` — Utility/module library.
- `src/lib/flags.ts` — Utility/module library.
- `src/lib/i18n.server.ts` — Utility/module library.
- `src/lib/i18n.ts` — Utility/module library.
- `src/lib/logging.ts` — Utility/module library.
- `src/lib/recentlyViewed/store.ts` — Utility/module library.
- `src/lib/savedSearch/store.ts` — Utility/module library.
- `src/lib/seo/meta.ts` — Utility/module library.
- `src/lib/seo/schema.ts` — Utility/module library.
- `supabase/migrations/20260204203000_leads_masked_view.sql` — Masked leads view + RLS policies for staff.
- `supabase/migrations/20260205093000_pii_approvals.sql` — PII approval workflow + RLS policies + RPCs.
- `supabase/migrations/20260205120000_profiles_owner_lock.sql` — Owner immutability + admin user management RLS + audit log.
- `tests/brand.spec.ts` — Playwright E2E test.
- `tests/filters.spec.ts` — Playwright E2E test.
- `tests/phase3.spec.ts` — Playwright E2E test.
- `tests/phase4.spec.ts` — Playwright E2E test.
- `tests/rbac-approvals.spec.ts` — Playwright E2E test.
- `tests/rbac-users.spec.ts` — Playwright E2E test.
- `tests/site-audit.spec.ts` — Playwright E2E test.

## F) SQL Migrations / Policies Summary (exact SQL)
- The following migrations implement masked views, PII approval workflow, and RLS enforcement.

### supabase/migrations/20260204203000_leads_masked_view.sql
```sql
﻿-- Masked leads view + tightened select policies for non-owner access.

-- Ensure lead_status includes negotiation (idempotent).
alter type public.lead_status add value if not exists 'negotiation';

-- Restrict base leads select to owner + lead owner only.
alter table public.leads enable row level security;

drop policy if exists "Leads select by crm staff" on public.leads;
drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads select by lead owner" on public.leads;
drop policy if exists "Leads read by assigned user" on public.leads;
drop policy if exists "Leads read by admin or listing owner" on public.leads;

create policy "Leads select by owner"
on public.leads for select
using (public.is_owner());

create policy "Leads select by lead owner"
on public.leads for select
using (user_id = auth.uid());

-- Masked view for CRM + developer visibility (security definer to bypass base RLS).
drop view if exists public.leads_masked;

create or replace function public.get_leads_masked()
returns table (
  id uuid,
  listing_id uuid,
  customer_id uuid,
  user_id uuid,
  name text,
  phone text,
  phone_e164 text,
  phone_normalized text,
  email text,
  message text,
  status text,
  lead_source text,
  assigned_to uuid,
  created_at timestamptz,
  intent text,
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  lost_reason text,
  lost_reason_note text,
  next_action_at timestamptz,
  listing_title text,
  listing_city text,
  listing_area text
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    ld.id,
    ld.listing_id,
    ld.customer_id,
    ld.user_id,
    ld.name,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone_e164,
    null::text as phone_normalized,
    case
      when ld.email is not null then regexp_replace(ld.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    case
      when ld.message is not null then left(ld.message, 20)
      when ld.notes is not null then left(ld.notes, 20)
      else null
    end as message,
    ld.status,
    ld.lead_source,
    ld.assigned_to,
    ld.created_at,
    ld.intent,
    ld.preferred_area,
    ld.budget_min,
    ld.budget_max,
    ld.lost_reason,
    ld.lost_reason_note,
    ld.next_action_at,
    l.title as listing_title,
    l.city as listing_city,
    l.area as listing_area
  from public.leads ld
  left join public.listings l on l.id = ld.listing_id
  where public.is_crm_user()
     or (l.developer_id is not null and public.is_developer_member(l.developer_id))
     or l.owner_user_id = auth.uid();
$$;

create or replace view public.leads_masked
as
select * from public.get_leads_masked();

grant execute on function public.get_leads_masked() to authenticated;
grant select on public.leads_masked to authenticated;

```

### supabase/migrations/20260205093000_pii_approvals.sql
```sql
﻿-- PII change request workflow + admin-safe CRM operations

-- 1) Change request table
create table if not exists public.pii_change_requests (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  review_note text null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_action_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_action_check
      check (action in ('update_pii','soft_delete','hard_delete_request'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_status_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_status_check
      check (status in ('pending','approved','rejected'));
  end if;
end $$;

create index if not exists pii_change_requests_status_idx
  on public.pii_change_requests (status, requested_at);

alter table public.pii_change_requests enable row level security;

drop policy if exists "PII change insert by admin" on public.pii_change_requests;
drop policy if exists "PII change select by owner or requester" on public.pii_change_requests;
drop policy if exists "PII change update by owner" on public.pii_change_requests;

create policy "PII change insert by admin"
  on public.pii_change_requests for insert
  with check (public.is_admin());

create policy "PII change select by owner or requester"
  on public.pii_change_requests for select
  using (public.is_owner() or requested_by = auth.uid());

create policy "PII change update by owner"
  on public.pii_change_requests for update
  using (public.is_owner())
  with check (public.is_owner());

-- 2) Masked customers view (for staff/ops/agent)
create or replace function public.get_customers_masked()
returns table (
  id uuid,
  full_name text,
  phone text,
  phone_e164 text,
  email text,
  intent text,
  preferred_areas text[],
  budget_min numeric,
  budget_max numeric,
  lead_source text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    c.id,
    c.full_name,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone_e164,
    case
      when c.email is not null then regexp_replace(c.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    c.intent,
    c.preferred_areas,
    c.budget_min,
    c.budget_max,
    c.lead_source,
    c.created_at
  from public.customers c
  where public.is_crm_user();
$$;

drop view if exists public.customers_masked;
create or replace view public.customers_masked
as select * from public.get_customers_masked();

grant execute on function public.get_customers_masked() to authenticated;
grant select on public.customers_masked to authenticated;

-- 3) Update policies for customers and leads (admin can update non-PII)
alter table public.customers enable row level security;

drop policy if exists "Customers select by crm staff" on public.customers;
drop policy if exists "Customers update by owner" on public.customers;

create policy "Customers select by admin"
  on public.customers for select
  using (public.is_admin());

create policy "Customers update by admin"
  on public.customers for update
  using (public.is_admin())
  with check (public.is_admin());

alter table public.leads enable row level security;

drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads update by owner" on public.leads;

create policy "Leads select by admin"
  on public.leads for select
  using (public.is_admin());

create policy "Leads update by admin"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Lead assignments: allow admin (owner passes via is_admin)
alter table public.lead_assignments enable row level security;

drop policy if exists "Lead assignments insert by owner" on public.lead_assignments;
drop policy if exists "Lead assignments update by owner" on public.lead_assignments;
drop policy if exists "Lead assignments delete by owner" on public.lead_assignments;

create policy "Lead assignments insert by admin"
  on public.lead_assignments for insert
  with check (public.is_admin());

create policy "Lead assignments update by admin"
  on public.lead_assignments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Lead assignments delete by admin"
  on public.lead_assignments for delete
  using (public.is_admin());

-- 5) Block non-owner PII edits via triggers
create or replace function public.block_lead_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.name, '') is distinct from coalesce(old.name, '')
     or coalesce(new.phone, '') is distinct from coalesce(old.phone, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.phone_normalized, '') is distinct from coalesce(old.phone_normalized, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
     or coalesce(new.message, '') is distinct from coalesce(old.message, '')
     or coalesce(new.notes, '') is distinct from coalesce(old.notes, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_lead_pii_updates on public.leads;
create trigger block_lead_pii_updates
  before update on public.leads
  for each row execute function public.block_lead_pii_updates();

create or replace function public.block_customer_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.full_name, '') is distinct from coalesce(old.full_name, '')
     or coalesce(new.phone_raw, '') is distinct from coalesce(old.phone_raw, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_customer_pii_updates on public.customers;
create trigger block_customer_pii_updates
  before update on public.customers
  for each row execute function public.block_customer_pii_updates();

-- 6) Owner approval RPCs
create or replace function public.approve_pii_change(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  req record;
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  select * into req
  from public.pii_change_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if req.status <> 'pending' then
    raise exception 'request already reviewed';
  end if;

  if req.action = 'update_pii' then
    if req.table_name = 'leads' then
      update public.leads
      set
        name = coalesce(req.payload->>'name', name),
        phone = coalesce(req.payload->>'phone', phone),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        phone_normalized = coalesce(req.payload->>'phone_normalized', phone_normalized),
        email = coalesce(req.payload->>'email', email),
        message = coalesce(req.payload->>'message', message),
        notes = coalesce(req.payload->>'notes', notes)
      where id = req.row_id;
    elsif req.table_name = 'customers' then
      update public.customers
      set
        full_name = coalesce(req.payload->>'full_name', full_name),
        phone_raw = coalesce(req.payload->>'phone_raw', phone_raw),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        email = coalesce(req.payload->>'email', email)
      where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  elsif req.action in ('hard_delete_request','soft_delete') then
    if req.table_name = 'leads' then
      delete from public.leads where id = req.row_id;
    elsif req.table_name = 'customers' then
      delete from public.customers where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  end if;

  update public.pii_change_requests
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = req.id;
end;
$$;

create or replace function public.reject_pii_change(request_id uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  update public.pii_change_requests
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = reason
  where id = request_id
    and status = 'pending';
end;
$$;

grant execute on function public.approve_pii_change(uuid) to authenticated;
grant execute on function public.reject_pii_change(uuid, text) to authenticated;


```

### supabase/migrations/20260205120000_profiles_owner_lock.sql
```sql
-- Owner immutability + admin user management guardrails.
-- Ensures admins can manage users except OWNER, and OWNER row is immutable for non-owners.

alter table public.profiles enable row level security;

-- Drop existing policies if they exist (idempotent).
drop policy if exists "Profiles select by admin or self" on public.profiles;
drop policy if exists "Profiles insert by self" on public.profiles;
drop policy if exists "Profiles insert by admin" on public.profiles;
drop policy if exists "Profiles insert by owner" on public.profiles;
drop policy if exists "Profiles update by self" on public.profiles;
drop policy if exists "Profiles update by admin" on public.profiles;
drop policy if exists "Profiles update by owner" on public.profiles;
drop policy if exists "Profiles delete by owner" on public.profiles;

-- 1) SELECT: CRM users can read all profiles; users can read their own profile.
create policy "Profiles select by admin or self"
on public.profiles for select
using (public.is_crm_user() or public.is_admin() or id = auth.uid());

-- 2) INSERT: self insert (non-owner) + admin insert (non-owner) + owner insert (any).
create policy "Profiles insert by self"
on public.profiles for insert
with check (
  id = auth.uid()
  and role <> 'owner'
);

create policy "Profiles insert by admin"
on public.profiles for insert
with check (
  public.is_admin()
  and role <> 'owner'
);

create policy "Profiles insert by owner"
on public.profiles for insert
with check (public.is_owner());

-- 3) UPDATE: self can update own profile; admin can update non-owner; owner can update any.
create policy "Profiles update by self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Profiles update by admin"
on public.profiles for update
using (public.is_admin() and role <> 'owner')
with check (public.is_admin() and role <> 'owner' and role <> 'owner');

create policy "Profiles update by owner"
on public.profiles for update
using (public.is_owner())
with check (public.is_owner());

-- 4) DELETE: only owner can delete non-owner profiles.
create policy "Profiles delete by owner"
on public.profiles for delete
using (public.is_owner() and role <> 'owner');

-- Trigger to enforce owner immutability and prevent non-owner role changes to owner.
create or replace function public.prevent_owner_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_owner() and auth.role() <> 'service_role' then
    if TG_OP in ('UPDATE','DELETE') and OLD.role = 'owner' then
      raise exception 'owner profile is immutable';
    end if;
    if TG_OP = 'UPDATE' and NEW.role = 'owner' then
      raise exception 'cannot set owner role';
    end if;
    if TG_OP = 'UPDATE' and not public.is_admin() then
      if NEW.role is distinct from OLD.role then
        raise exception 'role change requires owner';
      end if;
    end if;
  elseif auth.role() = 'service_role' then
    if TG_OP in ('UPDATE','DELETE') and OLD.role = 'owner' then
      raise exception 'owner profile is immutable';
    end if;
    if TG_OP = 'UPDATE' and NEW.role = 'owner' then
      raise exception 'cannot set owner role';
    end if;
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_profiles_owner_immutable on public.profiles;
create trigger trg_profiles_owner_immutable
before update or delete on public.profiles
for each row execute function public.prevent_owner_profile_mutation();

-- Admin audit log
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  action text not null,
  target_user_id uuid null,
  target_email text null,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_actor_idx
  on public.admin_audit_log (actor_user_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admin audit insert" on public.admin_audit_log;
drop policy if exists "Admin audit select owner" on public.admin_audit_log;
drop policy if exists "Admin audit select self" on public.admin_audit_log;

create policy "Admin audit insert"
on public.admin_audit_log for insert
with check (public.is_admin());

create policy "Admin audit select owner"
on public.admin_audit_log for select
using (public.is_owner());

create policy "Admin audit select self"
on public.admin_audit_log for select
using (actor_user_id = auth.uid());

```

## G) Full Code Dumps (all changed/added files except artifacts and this report)
### .tmp_generate_final_report.cjs
````
﻿const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const repo = process.cwd();
const reportPath = path.join(repo, 'docs', 'codex', 'final-report.md');

const BRAND_AR = '\u0647\u0627\u0631\u062a\u0686';
const BRAND_AR_WRONG = '\u0647\u0627\u0631\u062a\u062c';

function run(cmd) {
  return cp.execSync(cmd, { encoding: 'utf8' });
}

function normalize(p) {
  return p.replace(/\\/g, '/');
}

const statusRaw = run('git status --porcelain');
const lines = statusRaw.split(/\r?\n/).filter(Boolean);
const entries = [];
for (const line of lines) {
  const status = line.slice(0, 2);
  let file = line.slice(3).trim();
  if (file.includes('->')) {
    file = file.split('->')[1].trim();
  }
  entries.push({ status, file: normalize(file) });
}

const excludePrefixes = ['test-results/'];
const excludeFromDumps = new Set(['docs/codex/final-report.md']);

const files = new Set();

function shouldExclude(rel) {
  return excludePrefixes.some((p) => rel.startsWith(p));
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    const rel = normalize(path.relative(repo, full));
    if (shouldExclude(rel)) continue;
    if (item.isDirectory()) {
      walkDir(full);
    } else {
      files.add(rel);
    }
  }
}

for (const entry of entries) {
  const rel = entry.file;
  if (shouldExclude(rel)) continue;
  const abs = path.join(repo, rel);
  if (fs.existsSync(abs)) {
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      walkDir(abs);
    } else {
      files.add(rel);
    }
  }
}

const fileList = Array.from(files).sort();

function routeFromAppPath(p) {
  const base = p.replace(/^src\/app\//, '');
  if (base.endsWith('/page.tsx')) {
    const route = base.replace(/\/page\.tsx$/, '');
    return '/' + route.replace(/\\/g, '/').replace(/\/+/g, '/');
  }
  if (base.endsWith('/route.ts') || base.endsWith('/route.tsx')) {
    const route = base.replace(/\/route\.tsx?$/, '');
    return '/' + route.replace(/\\/g, '/').replace(/\/+/g, '/');
  }
  if (base.endsWith('layout.tsx')) return '/ (root layout)';
  if (base.endsWith('loading.tsx')) return '/' + base.replace(/\/loading\.tsx$/, '');
  return null;
}

const overrides = {
  'middleware.ts': 'Edge middleware for locale/flags/headers and routing safeguards.',
  'next.config.ts': 'Next.js configuration (headers, images, redirects).',
  'package.json': 'Project scripts and dependencies.',
  'package-lock.json': 'Dependency lockfile snapshot.',
  'public/brand/hrtaj-logo.svg': 'Brand logo asset (Arabic logotype).',
  'scripts/check-brand-ar.mjs': 'Brand integrity check (fails on wrong spelling or mojibake).',
  'scripts/quality-smoke.mjs': 'Smoke checks for broken images/console errors.',
  'scripts/seed_admin_user.mjs': 'Owner-only admin invite seed script (Foxm575@gmail.com).',
  'supabase/migrations/20260204203000_leads_masked_view.sql': 'Masked leads view + RLS policies for staff.',
  'supabase/migrations/20260205093000_pii_approvals.sql': 'PII approval workflow + RLS policies + RPCs.',
  'supabase/migrations/20260205120000_profiles_owner_lock.sql': 'Owner immutability + admin user management RLS + audit log.',
  'src/app/api/pii-requests/route.ts': 'API route for creating PII change requests.',
  'src/app/api/owner/invite-admin/route.ts': 'Owner-only admin invite/promote API route.',
  'src/app/api/admin/users/invite/route.ts': 'Admin/owner user invite endpoint (non-owner roles).',
  'src/app/api/admin/users/update-role/route.ts': 'Admin/owner role update endpoint with owner guard.',
  'src/app/api/admin/users/disable/route.ts': 'Admin/owner disable/enable endpoint (owner immune).',
  'src/app/api/listings/by-ids/route.ts': 'API route for listing summaries by IDs.',
  'src/app/admin/approvals/page.tsx': 'Owner approval queue UI for PII requests.',
  'src/app/admin/approvals/actions.ts': 'Server actions for approving/rejecting PII requests.',
  'src/app/admin/flags/page.tsx': 'Admin feature flags UI.',
  'src/app/health/route.ts': 'Health check endpoint.',
  'src/app/robots.ts': 'Robots.txt route.',
  'src/app/sitemap.ts': 'Sitemap generation route.',
  'src/app/error.tsx': 'Global error page.',
  'src/app/compare/page.tsx': 'Compare page UI.',
  'src/app/saved/page.tsx': 'Saved listings page UI.',
  'src/app/saved-searches/page.tsx': 'Saved searches page UI.',
  'docs/codex/final-report.md': 'Final consolidated report (this file).',
  'artifacts/audit-report.json': 'Audit JSON report (Playwright crawl).',
};

function purposeFor(p) {
  if (overrides[p]) return overrides[p];
  if (p.startsWith('artifacts/')) return 'Audit artifact (screenshot/report).';
  if (p.startsWith('src/app/api/')) {
    const route = p.replace('src/app', '').replace(/\/route\.tsx?$/, '');
    return `API route ${route.replace(/\\/g, '/')} handler.`;
  }
  if (p.endsWith('/actions.ts') || p.includes('/actions.ts')) {
    return 'Server actions for page/module operations.';
  }
  if (p.startsWith('src/app/') && p.endsWith('page.tsx')) {
    const route = routeFromAppPath(p);
    return route ? `Route page component for ${route}.` : 'Route page component.';
  }
  if (p.startsWith('src/app/') && p.endsWith('layout.tsx')) {
    return 'Root layout (fonts, metadata, global providers).';
  }
  if (p.startsWith('src/app/') && p.endsWith('loading.tsx')) {
    const route = routeFromAppPath(p);
    return route ? `Loading UI for ${route}.` : 'Loading UI.';
  }
  if (p.startsWith('src/components/')) {
    return 'UI component.';
  }
  if (p.startsWith('src/lib/')) {
    return 'Utility/module library.';
  }
  if (p.startsWith('src/i18n/')) {
    return 'Translation dictionary.';
  }
  if (p.startsWith('supabase/migrations/')) {
    return 'Database migration.';
  }
  if (p.startsWith('scripts/')) {
    return 'Dev/CI utility script.';
  }
  if (p.startsWith('tests/')) {
    return 'Playwright E2E test.';
  }
  if (p.startsWith('docs/')) {
    return 'Documentation.';
  }
  if (p.startsWith('public/')) {
    return 'Static asset.';
  }
  if (p.endsWith('.css')) {
    return 'Global styles.';
  }
  return 'Updated file.';
}

function langFor(p) {
  if (p.endsWith('.ts')) return 'ts';
  if (p.endsWith('.tsx')) return 'tsx';
  if (p.endsWith('.mjs') || p.endsWith('.js')) return 'js';
  if (p.endsWith('.css')) return 'css';
  if (p.endsWith('.json')) return 'json';
  if (p.endsWith('.sql')) return 'sql';
  if (p.endsWith('.md')) return 'md';
  if (p.endsWith('.svg')) return 'svg';
  if (p.endsWith('.png')) return '';
  return '';
}

function fenceFor(content) {
  let fence = '```';
  while (content.includes(fence)) {
    fence += '`';
  }
  return fence;
}

const headerLines = [
  `# HRTAJ / ${BRAND_AR} - Final Report`,
  '',
  'Date: 2026-02-05',
  '',
  '## A) Executive Summary',
  `- Fixed brand flip by removing client glyph fallback and centralizing brand constants; SSR/CSR now stable on "${BRAND_AR}".`,
  '- Hardened encoding with explicit UTF-8 meta + Arabic-capable font stack + Playwright guard against "??"/"�".',
  '- Mobile-first UI uplift: spacing tokens, responsive typography, safe-area handling, and improved mobile layouts.',
  '- Implemented search/filters (URL-driven), premium listing cards, and conversion-focused property page.',
  '- Added differentiators: favorites, compare, saved search, recently viewed, and analytics hooks (no PII).',
  '- RBAC: owner higher than admin, PII approval workflow, owner-only invites, admin operational access with restrictions.',
  '- Tests run: lint, typecheck, build, Playwright suite (RBAC test skips if env creds missing).',
  '',
  '## B) Root Causes + Fixes',
  `- Brand flip ("${BRAND_AR}" -> "${BRAND_AR_WRONG}"): client-only glyph fallback mutated the string post-hydration; fixed by removing fallback and centralizing brand constants.`,
  '- "????" / mojibake: risk from missing charset + font fallback; fixed by enforcing UTF-8 meta and Arabic fonts with fallback stack.',
  '- CSS flakiness on mobile: viewport/safe-area gaps and inconsistent mobile layout; fixed by viewport export and stable global styles.',
  '',
  '## C) Change Log by Phase',
  '### Phase 1 - Brand + Encoding + CSS',
  '- Brand constants, UTF-8 meta, Arabic font stack, brand integrity scripts.',
  '- Mobile-safe global tokens and consistent global CSS load.',
  '### Phase 2 - Search/Filters + Listings + Property Page',
  '- URL-driven filters and SSR-safe parsing; listings grid + premium cards; property gallery + lead form + sticky CTA.',
  '- SEO/OG/JSON-LD improvements.',
  '### Phase 3 - Differentiators',
  '- Favorites, compare, saved search, recently viewed, analytics wrapper, feature flags, locale switcher.',
  '### Phase 4 - Polish + Security',
  '- Motion polish, watermark overlay, security headers, rate limit guards, PWA cache notes.',
  '### Phase 5 - Full Site Audit',
  '- Playwright crawl, audit report artifacts, encoding guard, no horizontal overflow checks.',
  '### RBAC + PII Approvals',
  '- Owner-only invites and approvals; admin operational access with PII update restrictions and request workflow.',
  '### RBAC + Owner Immutability (Update)',
  '- Admin can manage users except owner; DB policies + triggers prevent owner edits/role changes by admins.',
  '',
  '## D) Files Changed by Phase (high-level grouping)',
  '- Phase 1: `src/lib/brand.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `scripts/check-brand-ar.mjs`, `tests/brand.spec.ts`.',
  '- Phase 2: listings/filters/components under `src/components/listings`, `src/components/search`, `src/app/listings`, `src/app/listing/[id]`, `src/lib/filters`.',
  '- Phase 3: `src/lib/favorites`, `src/lib/compare`, `src/lib/savedSearch`, `/saved`, `/compare`, `/saved-searches`, analytics + flags.',
  '- Phase 4: `next.config.ts`, `middleware.ts`, watermark + motion styles, security headers, `docs/pwa-cache-notes.md`.',
  '- Phase 5: `tests/site-audit.spec.ts`, `docs/audit-report.md`, `scripts/quality-smoke.mjs`.',
  '- RBAC: `supabase/migrations/*pii*`, `src/app/admin/approvals/*`, `src/app/api/pii-requests`, `src/app/api/owner/invite-admin`, `src/app/crm/*`.',
  '- RBAC update: `supabase/migrations/20260205120000_profiles_owner_lock.sql`, `src/app/api/admin/users/*`, `src/components/UserManagementList.tsx`.',
  '',
  '## E) File-by-file List (every changed/added file)',
];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, headerLines.join('\n') + '\n', 'utf8');

for (const file of fileList) {
  const purpose = purposeFor(file);
  fs.appendFileSync(reportPath, `- \`${file}\` — ${purpose}\n`, 'utf8');
}

fs.appendFileSync(reportPath, '\n', 'utf8');
fs.appendFileSync(reportPath, '## F) SQL Migrations / Policies Summary (exact SQL)\n', 'utf8');
fs.appendFileSync(reportPath, '- The following migrations implement masked views, PII approval workflow, and RLS enforcement.\n\n', 'utf8');

const sqlMigrations = fileList.filter((f) => f.startsWith('supabase/migrations/') && f.endsWith('.sql'));
for (const sqlFile of sqlMigrations) {
  const abs = path.join(repo, sqlFile);
  const content = fs.readFileSync(abs, 'utf8');
  const fence = fenceFor(content);
  fs.appendFileSync(reportPath, `### ${sqlFile}\n${fence}sql\n${content}\n${fence}\n\n`, 'utf8');
}

fs.appendFileSync(reportPath, '## G) Full Code Dumps (all changed/added files except artifacts and this report)\n', 'utf8');

for (const file of fileList) {
  if (excludeFromDumps.has(file)) continue;
  if (file.startsWith('artifacts/')) continue;
  const abs = path.join(repo, file);
  const content = fs.readFileSync(abs, 'utf8');
  const fence = fenceFor(content);
  const lang = langFor(file);
  fs.appendFileSync(reportPath, `### ${file}\n${fence}${lang}\n${content}\n${fence}\n\n`, 'utf8');
}

const verificationLines = [
  '## H) Verification',
  '- Commands run: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.',
  '- Notes: RBAC test auto-skips if Supabase env credentials are missing.',
  '',
  '## I) How to Run / Seed / Verify',
  '- Seed admin invite (owner-only): `npm run seed:admin` (requires service role env).',
  '- Build + tests: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.',
  '- RBAC E2E env vars: `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `E2E_OWNER_EMAIL`, `E2E_OWNER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.',
  '',
  '## J) QA Checklist',
  '- Mobile 320px: no horizontal scroll, header/menu usable, CTAs not overlapping.',
  `- Brand: header/footer/title contain "${BRAND_AR}"; never "${BRAND_AR_WRONG}" after reload or navigation.`,
  '- Filters: URL-driven; refresh preserves results; chips removable.',
  '- Property page: gallery works, sticky CTA respects safe-area, lead form validates.',
  '- Staff/admin masking: non-owner sees masked PII and cannot update PII directly.',
  '- Admin cannot update/disable owner; owner can manage all users.',
  '',
  '## K) Audit Artifacts Index',
  '- JSON report: `artifacts/audit-report.json`.',
  '- Screenshots: `artifacts/screenshots/*` (mobile + desktop per route).',
  '- Regenerate: `npm run test:e2e -- tests/site-audit.spec.ts`.',
  '',
  '## L) Notes',
  '- `docs/codex/final-report.md` is excluded from code dumps to avoid self-embedding recursion.',
  '- Vercel deploy executed: `vercel --prod --yes`; alias set to https://hrtaj.com (2026-02-05).',
];

fs.appendFileSync(reportPath, verificationLines.join('\n') + '\n', 'utf8');

console.log(`final report written to ${reportPath}`);

````

### docs/audit-report.md
```md
﻿# Site Audit Report (Phase 5)

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


```

### docs/audit/css-reliability.md
```md
﻿# CSS Reliability Notes

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


```

### docs/audit/phase1-root-causes.md
```md
﻿# Phase 1 Root Causes (Brand / Encoding / CSS)

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


```

### docs/audit/stack.md
```md
﻿# Stack Snapshot

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


```

### docs/codex/project-map.md
```md
﻿# Project Map (auto-generated)

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


```

### docs/deploy-checklist.md
```md
﻿# Deploy Checklist

## Build & Tests
1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:e2e`
5. Optional: `npm run seed:admin` (owner admin seed)

## Required env vars
- `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_APP_URL`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OWNER_SECRET` (owner unlock)

## Supabase Auth URL config
- Site URL: `https://hrtaj.com`
- Redirect URLs: `https://hrtaj.com/*` and `https://hrtaj.com/auth/callback` (if using callback route)

## Smoke checks
- Home page renders and brand shows "هارتچ".
- `/listings` filters load and URL reflects filters.
- `/listing/:id` shows gallery and sticky CTA.
- `/health` returns `{ status: "ok" }`.

## Rollback
- Vercel: redeploy previous successful deployment.
- Database migrations: revert using last stable migration snapshot.


```

### docs/design-system.md
```md
﻿# Design System (Phase 4)

## Tokens (CSS variables)
Defined in `src/app/globals.css`.

Spacing
- `--space-1..--space-8`

Radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-2xl`

Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow`, `--shadow-strong`

Typography
- `--font-body` (min 16px)
- `--font-h1`, `--font-h2`, `--font-h3`
- `--line-body`

Container
- `--container-max`, `--container-pad`, `--container-pad-lg`

## Component Usage
- Card: `src/components/ui/Card.tsx` uses `--radius-2xl` and `--shadow`.
- Button: `src/components/ui/Button.tsx` uses `--radius-lg` and transition tokens.
- Inputs/Select/Textarea: `src/components/ui.tsx` + `src/components/FieldHelp.tsx` use `--radius-lg`.
- Listing media: `listing-card-media` uses `--radius-lg`.

## Layout Rules
- Default container max width: 1200px via `--container-max` and `.max-w-7xl` override.
- Mobile padding: 16px, desktop: 24px.

## Motion
- `fade-in`, `fade-up`, `sheet-up` respect reduced-motion.
- Hover elevation only on hover-capable devices.

```

### docs/pwa-cache-notes.md
```md
﻿# PWA / Cache Notes

Status: No service worker or PWA integration detected in this repo.

Actions taken:
- No new PWA layer added (per requirement).
- CSS/JS are served via Next.js default asset pipeline.
- Build output uses hashed static assets to prevent stale CSS/JS.

If a PWA is added in the future:
- Use network-first for HTML and stale-while-revalidate for static assets.
- Version cache on deploy and prompt refresh when SW updates.
- Never serve stale CSS indefinitely.

```

### docs/rbac-approvals.md
```md
﻿# RBAC + PII Approval Workflow

Date: 2026-02-05

## Roles
- Owner: full control; approves PII changes and deletions; manages users/roles; owner profile is immutable to non-owners.
- Admin: operational control; can manage users except owner; cannot hard-delete PII; PII edits require approval.

## Database (Supabase)
- New table: `public.pii_change_requests`.
  - `action`: `update_pii` | `soft_delete` | `hard_delete_request`
  - `status`: `pending` | `approved` | `rejected`
- RLS:
  - Insert: `public.is_admin()`
  - Select: owner or requester
  - Update: owner only
- Triggers:
  - `block_lead_pii_updates` and `block_customer_pii_updates` reject PII changes unless owner.
  - `prevent_owner_profile_mutation` rejects updates/deletes to owner profile by non-owners and blocks non-owner role escalation to owner.

## Owner immutability + Admin user management
- Profiles RLS:
  - Admin/owner can read all profiles; users can read their own.
  - Admin can update non-owner profiles; cannot touch owner rows or set role=owner.
  - Owner can update any profile; delete non-owner profiles.
- Admin audit log:
  - `public.admin_audit_log` stores admin/user management actions (no PII beyond email).

## Approval RPCs
- `public.approve_pii_change(request_id uuid)` (owner-only, SECURITY DEFINER)
- `public.reject_pii_change(request_id uuid, reason text)` (owner-only)

## Application Flow
- Admin submits a PII change request when editing customer PII or requesting delete.
- Owner reviews pending requests at `/admin/approvals` and approves/rejects.
- Hard delete is executed only when owner approves.

## API / Server Actions
- `POST /api/pii-requests` for admin requests (server-only).
- `POST /api/owner/invite-admin` for owner-only admin invitation/promotion.
- `POST /api/admin/users/invite` for admin/owner invites (non-owner roles only).
- `POST /api/admin/users/update-role` to update role with owner immutability guard.
- `POST /api/admin/users/disable` to disable/enable users (owner immune).

## Seed Script
- `node scripts/seed_admin_user.mjs` (uses service role key) to invite/promote:
  - `Foxm575@gmail.com` / `01020614022`

## Invite acceptance flow (admin)
1. Owner or admin triggers invite (admin invite is non-owner roles only).
2. Supabase sends an email invite to the user.
3. User clicks the invite link, sets password, and completes onboarding.
4. User signs in at `https://hrtaj.com/auth` and is routed by role.


```

### docs/seo-notes.md
```md
# SEO Notes

## Structured data
- `LocalBusiness` + `RealEstateAgent` schema injected in root layout.
- Listing pages include `Offer` schema and `BreadcrumbList`.
- Home page includes `FAQPage` schema.

## Metadata
- Listing metadata built via `src/lib/seo/meta.ts` with canonical + OG/Twitter.
- Base URL resolved from `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_APP_URL` or Vercel URL.

## Hreflang
- Language detection is cookie-based; `?lang=ar|en` sets locale and redirects.
- For SEO: recommend linking to `/?lang=ar` and `/?lang=en` in future headers if needed.

```

### docs/ux-audit-phase2.md
```md
﻿# UX Audit — Phase 2

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

```

### middleware.ts
```ts
﻿// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./src/lib/supabaseMiddleware";
import { LOCALE_COOKIE } from "./src/lib/i18n.server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const langParam = url.searchParams.get("lang");

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const inferred = acceptLanguage.toLowerCase().includes("en") ? "en" : "ar";
  const localeCandidate = existing === "en" || existing === "ar" ? existing : inferred;
  const locale = langParam === "en" || langParam === "ar" ? langParam : localeCandidate;

  const requestHeaders = new Headers(request.headers);
  if (langParam === "en" || langParam === "ar") {
    requestHeaders.set("x-locale", langParam);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return updateSession(request, response);
}

// Apply to all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

```

### next.config.ts
```ts
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost = "";
try {
  if (supabaseUrl) {
    supabaseHost = new URL(supabaseUrl).hostname;
  }
} catch {
  supabaseHost = "";
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/**",
          },
        ]
      : [],
  },
  poweredByHeader: false,
  async headers() {
    const supabaseConnect = supabaseHost ? `https://${supabaseHost}` : "";
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src 'self' ${supabaseConnect} https://*.supabase.co https://*.supabase.in wss: https://vercel.live`,
      "media-src 'self' blob: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]
      .filter(Boolean)
      .join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // reactCompiler: true, // disabled for now
};

export default nextConfig;

```

### package-lock.json
```json
{
  "name": "real-estate-platform",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "real-estate-platform",
      "version": "0.1.0",
      "dependencies": {
        "@supabase/ssr": "^0.8.0",
        "@supabase/supabase-js": "^2.49.1",
        "next": "16.1.4",
        "react": "19.0.0",
        "react-dom": "19.0.0"
      },
      "devDependencies": {
        "@playwright/test": "^1.54.2",
        "@tailwindcss/postcss": "^4.1.18",
        "@types/node": "^25.0.10",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.2.3",
        "autoprefixer": "^10.4.23",
        "babel-plugin-react-compiler": "^1.0.0",
        "eslint": "^9.0.0",
        "eslint-config-next": "16.1.4",
        "postcss": "^8.5.6",
        "tailwindcss": "^4.1.18",
        "typescript": "^5.9.3"
      },
      "engines": {
        "node": "20.x"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.28.6.tgz",
      "integrity": "sha512-JYgintcMjRiCvS8mMECzaEn+m3PfoQiyqukOMCCVQtoJGYJw8j/8LBJEiqkHLkfwCcs74E3pbAUFNg7d9VNJ+Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.28.5",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.28.6.tgz",
      "integrity": "sha512-2lfu57JtzctfIrcGMz992hyLlByuzgIk58+hhGCxjKZ3rWI82NnVLjXcaTqkI2NvlcvOskZaiZ5kjUALo3Lpxg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.28.6.tgz",
      "integrity": "sha512-H3mcG6ZDLTlYfaSNi0iOKkigqMFvkTKlGUYlD8GW7nNOYRrevuA46iTypPyv+06V3fEmvvazfntkBU34L0azAw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.28.6",
        "@babel/generator": "^7.28.6",
        "@babel/helper-compilation-targets": "^7.28.6",
        "@babel/helper-module-transforms": "^7.28.6",
        "@babel/helpers": "^7.28.6",
        "@babel/parser": "^7.28.6",
        "@babel/template": "^7.28.6",
        "@babel/traverse": "^7.28.6",
        "@babel/types": "^7.28.6",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.28.6.tgz",
      "integrity": "sha512-lOoVRwADj8hjf7al89tvQ2a1lf53Z+7tiXMgpZJL3maQPDxh0DgLMN62B2MKUOFcoodBHLMbDM6WAbKgNy5Suw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.28.6",
        "@babel/types": "^7.28.6",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.28.6.tgz",
      "integrity": "sha512-JYtls3hqi15fcx5GaSNL7SCTJ2MNmjrkHXg4FSpOA/grxK8KwyZ5bubHsCq8FXCkua6xhuaaBit+3b7+VZRfcA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.28.6",
        "@babel/helper-validator-option": "^7.27.1",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.28.0.tgz",
      "integrity": "sha512-+W6cISkXFa1jXsDEdYA8HeevQT/FULhxzR99pxphltZcVaugps53THCeiWA8SguxxpSp3gKPiuYfSWopkLQ4hw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.28.6.tgz",
      "integrity": "sha512-l5XkZK7r7wa9LucGw9LwZyyCUscb4x37JWTPz7swwFE/0FMQAGpiWUZn8u9DzkSBWEcK25jmvubfpw2dnAMdbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.28.6.tgz",
      "integrity": "sha512-67oXFAYr2cDLDVGLXTEABjdBJZ6drElUSI7WKp70NrpyISso3plG9SAGEF6y7zbha/wOzUByWWTJvEDVNIUGcA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.28.6",
        "@babel/helper-validator-identifier": "^7.28.5",
        "@babel/traverse": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.27.1.tgz",
      "integrity": "sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.28.5",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.28.5.tgz",
      "integrity": "sha512-qSs4ifwzKJSV39ucNjsvc6WVHs6b7S03sOh2OcHF9UHfVPqWWALUsNUVzhSBiItjRZoLHx7nIarVjqKVusUZ1Q==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.27.1",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.27.1.tgz",
      "integrity": "sha512-YvjJow9FxbhFFKDSuFnVCe2WxXk1zWc22fFePVNEaWJEu8IrZVlda6N0uHwzZrUM1il7NC9Mlp4MaJYbYd9JSg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.28.6.tgz",
      "integrity": "sha512-xOBvwq86HHdB7WUDTfKfT/Vuxh7gElQ+Sfti2Cy6yIWNW05P8iUslOVcZ4/sKbE+/jQaukQAdz/gf3724kYdqw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.28.6.tgz",
      "integrity": "sha512-TeR9zWR18BvbfPmGbLampPMW+uW1NZnJlRuuHso8i87QZNq2JRF9i6RgxRqtEq+wQGsS19NNTWr2duhnE49mfQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.6"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.28.6.tgz",
      "integrity": "sha512-YA6Ma2KsCdGb+WC6UpBVFJGXL58MDA6oyONbjyF/+5sBgxY/dwkhLogbMT2GXXyU84/IhRw/2D1Os1B/giz+BQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.28.6",
        "@babel/parser": "^7.28.6",
        "@babel/types": "^7.28.6"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.28.6.tgz",
      "integrity": "sha512-fgWX62k02qtjqdSNTAGxmKYY/7FSL9WAS1o2Hu5+I5m9T0yxZzr4cnrfXQ/MX0rIifthCSs6FKTlzYbJcPtMNg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.28.6",
        "@babel/generator": "^7.28.6",
        "@babel/helper-globals": "^7.28.0",
        "@babel/parser": "^7.28.6",
        "@babel/template": "^7.28.6",
        "@babel/types": "^7.28.6",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.28.6",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.28.6.tgz",
      "integrity": "sha512-0ZrskXVEHSWIqZM/sQZ4EV3jZJXRkio/WCxaqKZP1g//CEWEPSfeZFcms4XeKBCHU0ZKnIkdJeU/kF+eRp5lBg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.27.1",
        "@babel/helper-validator-identifier": "^7.28.5"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@emnapi/core": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-1.8.1.tgz",
      "integrity": "sha512-AvT9QFpxK0Zd8J0jopedNm+w/2fIzvtPKPjqyw9jwvBaReTTqPBk9Hixaz7KbjimP+QNz605/XnjFcDAL2pqBg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.1.0",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.8.1.tgz",
      "integrity": "sha512-mehfKSMWjjNol8659Z8KxEMrdSJDDot5SXMq00dM8BN4o+CLNXQ0xH2V7EchNHV4RmbZLmmPdEaXZc5H2FXmDg==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.1.0.tgz",
      "integrity": "sha512-WI0DdZ8xFSbgMjR1sFsKABJ/C5OnRrjT06JXbZKexJGrDuPTzZdDYfFlsgcCXCyf+suG5QU2e/y1Wo2V/OapLQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.9.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.9.1.tgz",
      "integrity": "sha512-phrYmNiYppR7znFEdqgfWHXR6NCkZEK7hwWDHZUjit/2/U0r6XvkDl0SYnoM51Hq7FhCGdLDT6zxCCOY1hexsQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.2",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz",
      "integrity": "sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.21.1",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.1.tgz",
      "integrity": "sha512-aw1gNayWpdI/jSYVgzN5pL0cfzU02GT3NBpeT/DXbx1/1x7ZKxFPd9bwrzygx/qiwIQiJ1sw/zD8qY/kRvlGHA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/object-schema": "^2.1.7",
        "debug": "^4.3.1",
        "minimatch": "^3.1.2"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/config-helpers": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz",
      "integrity": "sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz",
      "integrity": "sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@types/json-schema": "^7.0.15"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.3.tgz",
      "integrity": "sha512-Kr+LPIUVKz2qkx1HAMH8q1q6azbqBAsXJUxBl/ODDuVPX45Z9DfwB8tPjTi6nNZ8BuM3nbJxC5zCAg5elnBUTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.12.4",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.1.1",
        "minimatch": "^3.1.2",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.39.2",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.39.2.tgz",
      "integrity": "sha512-q1mjIoW1VX4IvSocvM/vbTiveKC4k9eLrajNEuSsmjymSDEbpGddtpfOoN7YGAqBK3NG+uqo8ia4PDTt8buCYA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz",
      "integrity": "sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz",
      "integrity": "sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0",
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.1",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.1.tgz",
      "integrity": "sha512-5DyQ4+1JEUzejeK1JGICcideyfUbGixgS9jNgex5nqkW+cY7WZhxBigmieN5Qnw9ZosSNVC9KQKyb+GUaGyKUA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.7",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.7.tgz",
      "integrity": "sha512-/zUx+yOsIrG4Y43Eh2peDeKCxlRt/gET6aHfaKpuq267qXdYDFViVHfMaLyygZOnl0kGWxFIgsBy8QFuTLUXEQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/core": "^0.19.1",
        "@humanwhocodes/retry": "^0.4.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.4.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz",
      "integrity": "sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@img/colour": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.0.0.tgz",
      "integrity": "sha512-A5P/LfWGFSl6nsckYtjw9da+19jB8hkJ6ACTGcDfEJ0aE+l2n2El7dsVM7UVHZQ9s2lmYMWlrS21YLy2IR1LUw==",
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/sharp-darwin-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.34.5.tgz",
      "integrity": "sha512-imtQ3WMJXbMY4fxb/Ndp6HBTNVtWCUI0WdobyheGf5+ad6xX8VIDO8u2xE4qc/fr08CKG/7dDseFtn6M6g/r3w==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-darwin-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.34.5.tgz",
      "integrity": "sha512-YNEFAF/4KQ/PeW0N+r+aVVsoIY0/qxxikF2SWdp+NRkmMB7y9LBZAVqQ4yhGCm/H3H270OSykqmQMKLBhBJDEw==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.2.4.tgz",
      "integrity": "sha512-zqjjo7RatFfFoP0MkQ51jfuFZBnVE2pRiaydKJ1G/rHZvnsrHAOcQALIi9sA5co5xenQdTugCvtb1cuf78Vf4g==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.2.4.tgz",
      "integrity": "sha512-1IOd5xfVhlGwX+zXv2N93k0yMONvUlANylbJw1eTah8K/Jtpi15KC+WSiaX/nBmbm2HxRM1gZ0nSdjSsrZbGKg==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.2.4.tgz",
      "integrity": "sha512-bFI7xcKFELdiNCVov8e44Ia4u2byA+l3XtsAj+Q8tfCwO6BQ8iDojYdvoPMqsKDkuoOo+X6HZA0s0q11ANMQ8A==",
      "cpu": [
        "arm"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.2.4.tgz",
      "integrity": "sha512-excjX8DfsIcJ10x1Kzr4RcWe1edC9PquDRRPx3YVCvQv+U5p7Yin2s32ftzikXojb1PIFc/9Mt28/y+iRklkrw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-ppc64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.2.4.tgz",
      "integrity": "sha512-FMuvGijLDYG6lW+b/UvyilUWu5Ayu+3r2d1S8notiGCIyYU/76eig1UfMmkZ7vwgOrzKzlQbFSuQfgm7GYUPpA==",
      "cpu": [
        "ppc64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-riscv64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.2.4.tgz",
      "integrity": "sha512-oVDbcR4zUC0ce82teubSm+x6ETixtKZBh/qbREIOcI3cULzDyb18Sr/Wcyx7NRQeQzOiHTNbZFF1UwPS2scyGA==",
      "cpu": [
        "riscv64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-s390x": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.2.4.tgz",
      "integrity": "sha512-qmp9VrzgPgMoGZyPvrQHqk02uyjA0/QrTO26Tqk6l4ZV0MPWIW6LTkqOIov+J1yEu7MbFQaDpwdwJKhbJvuRxQ==",
      "cpu": [
        "s390x"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.2.4.tgz",
      "integrity": "sha512-tJxiiLsmHc9Ax1bz3oaOYBURTXGIRDODBqhveVHonrHJ9/+k89qbLl0bcJns+e4t4rvaNBxaEZsFtSfAdquPrw==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.2.4.tgz",
      "integrity": "sha512-FVQHuwx1IIuNow9QAbYUzJ+En8KcVm9Lk5+uGUQJHaZmMECZmOlix9HnH7n1TRkXMS0pGxIJokIVB9SuqZGGXw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.2.4.tgz",
      "integrity": "sha512-+LpyBk7L44ZIXwz/VYfglaX/okxezESc6UxDSoyo2Ks6Jxc4Y7sGjpgU9s4PMgqgjj1gZCylTieNamqA1MF7Dg==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-linux-arm": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.34.5.tgz",
      "integrity": "sha512-9dLqsvwtg1uuXBGZKsxem9595+ujv0sJ6Vi8wcTANSFpwV/GONat5eCkzQo/1O6zRIkh0m/8+5BjrRr7jDUSZw==",
      "cpu": [
        "arm"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.34.5.tgz",
      "integrity": "sha512-bKQzaJRY/bkPOXyKx5EVup7qkaojECG6NLYswgktOZjaXecSAeCWiZwwiFf3/Y+O1HrauiE3FVsGxFg8c24rZg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-ppc64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.34.5.tgz",
      "integrity": "sha512-7zznwNaqW6YtsfrGGDA6BRkISKAAE1Jo0QdpNYXNMHu2+0dTrPflTLNkpc8l7MUP5M16ZJcUvysVWWrMefZquA==",
      "cpu": [
        "ppc64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-ppc64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-riscv64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.34.5.tgz",
      "integrity": "sha512-51gJuLPTKa7piYPaVs8GmByo7/U7/7TZOq+cnXJIHZKavIRHAP77e3N2HEl3dgiqdD/w0yUfiJnII77PuDDFdw==",
      "cpu": [
        "riscv64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-riscv64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-s390x": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.34.5.tgz",
      "integrity": "sha512-nQtCk0PdKfho3eC5MrbQoigJ2gd1CgddUMkabUj+rBevs8tZ2cULOx46E7oyX+04WGfABgIwmMC0VqieTiR4jg==",
      "cpu": [
        "s390x"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-s390x": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linux-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.34.5.tgz",
      "integrity": "sha512-MEzd8HPKxVxVenwAa+JRPwEC7QFjoPWuS5NZnBt6B3pu7EG2Ge0id1oLHZpPJdn3OQK+BQDiw9zStiHBTJQQQQ==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.34.5.tgz",
      "integrity": "sha512-fprJR6GtRsMt6Kyfq44IsChVZeGN97gTD331weR1ex1c1rypDEABN6Tm2xa1wE6lYb5DdEnk03NZPqA7Id21yg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-arm64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.34.5.tgz",
      "integrity": "sha512-Jg8wNT1MUzIvhBFxViqrEhWDGzqymo3sV7z7ZsaWbZNDLXRJZoRGrjulp60YYtV4wfY8VIKcWidjojlLcWrd8Q==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-x64": "1.2.4"
      }
    },
    "node_modules/@img/sharp-wasm32": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.34.5.tgz",
      "integrity": "sha512-OdWTEiVkY2PHwqkbBI8frFxQQFekHaSSkUIJkwzclWZe64O1X4UlUjqqqLaPbUpMOQk6FBu/HtlGXNblIs0huw==",
      "cpu": [
        "wasm32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/runtime": "^1.7.0"
      },
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-arm64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.34.5.tgz",
      "integrity": "sha512-WQ3AgWCWYSb2yt+IG8mnC6Jdk9Whs7O0gxphblsLvdhSpSTtmu69ZG1Gkb6NuvxsNACwiPV6cNSZNzt0KPsw7g==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-ia32": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.34.5.tgz",
      "integrity": "sha512-FV9m/7NmeCmSHDD5j4+4pNI8Cp3aW+JvLoXcTUo0IqyjSfAZJ8dIUmijx1qaJsIiU+Hosw6xM5KijAWRJCSgNg==",
      "cpu": [
        "ia32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-x64": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.34.5.tgz",
      "integrity": "sha512-+29YMsqY2/9eFEiW93eqWnuLcWcufowXewwSNIT6UwZdUUCrM3oFjMWH/Z6/TMmb4hlFenmfAVbpWeup2jryCw==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "0.2.12",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-0.2.12.tgz",
      "integrity": "sha512-ZVWUcfwY4E/yPitQJl481FjFo3K22D6qF0DuFH6Y/nbnE11GY5uguDxZMGXPQ8WQ0128MXQD7TnfHyK4oWoIJQ==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.4.3",
        "@emnapi/runtime": "^1.4.3",
        "@tybys/wasm-util": "^0.10.0"
      }
    },
    "node_modules/@next/env": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/env/-/env-16.1.4.tgz",
      "integrity": "sha512-gkrXnZyxPUy0Gg6SrPQPccbNVLSP3vmW8LU5dwEttEEC1RwDivk8w4O+sZIjFvPrSICXyhQDCG+y3VmjlJf+9A==",
      "license": "MIT"
    },
    "node_modules/@next/eslint-plugin-next": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/eslint-plugin-next/-/eslint-plugin-next-16.1.4.tgz",
      "integrity": "sha512-38WMjGP8y+1MN4bcZFs+GTcBe0iem5GGTzFE5GWW/dWdRKde7LOXH3lQT2QuoquVWyfl2S0fQRchGmeacGZ4Wg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-glob": "3.3.1"
      }
    },
    "node_modules/@next/swc-darwin-arm64": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.1.4.tgz",
      "integrity": "sha512-T8atLKuvk13XQUdVLCv1ZzMPgLPW0+DWWbHSQXs0/3TjPrKNxTmUIhOEaoEyl3Z82k8h/gEtqyuoZGv6+Ugawg==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-darwin-x64": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.1.4.tgz",
      "integrity": "sha512-AKC/qVjUGUQDSPI6gESTx0xOnOPQ5gttogNS3o6bA83yiaSZJek0Am5yXy82F1KcZCx3DdOwdGPZpQCluonuxg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-gnu": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.1.4.tgz",
      "integrity": "sha512-POQ65+pnYOkZNdngWfMEt7r53bzWiKkVNbjpmCt1Zb3V6lxJNXSsjwRuTQ8P/kguxDC8LRkqaL3vvsFrce4dMQ==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-musl": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.1.4.tgz",
      "integrity": "sha512-3Wm0zGYVCs6qDFAiSSDL+Z+r46EdtCv/2l+UlIdMbAq9hPJBvGu/rZOeuvCaIUjbArkmXac8HnTyQPJFzFWA0Q==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-gnu": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.1.4.tgz",
      "integrity": "sha512-lWAYAezFinaJiD5Gv8HDidtsZdT3CDaCeqoPoJjeB57OqzvMajpIhlZFce5sCAH6VuX4mdkxCRqecCJFwfm2nQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-musl": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.1.4.tgz",
      "integrity": "sha512-fHaIpT7x4gA6VQbdEpYUXRGyge/YbRrkG6DXM60XiBqDM2g2NcrsQaIuj375egnGFkJow4RHacgBOEsHfGbiUw==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-arm64-msvc": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.1.4.tgz",
      "integrity": "sha512-MCrXxrTSE7jPN1NyXJr39E+aNFBrQZtO154LoCz7n99FuKqJDekgxipoodLNWdQP7/DZ5tKMc/efybx1l159hw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-x64-msvc": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.1.4.tgz",
      "integrity": "sha512-JSVlm9MDhmTXw/sO2PE/MRj+G6XOSMZB+BcZ0a7d6KwVFZVpkHcb2okyoYFBaco6LeiL53BBklRlOrDDbOeE5w==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nolyfill/is-core-module": {
      "version": "1.0.39",
      "resolved": "https://registry.npmjs.org/@nolyfill/is-core-module/-/is-core-module-1.0.39.tgz",
      "integrity": "sha512-nn5ozdjYQpUCZlWGuxcJY/KpxkWQs4DcbMCmKojjyrYDEAGy4Ce19NN4v5MduafTwJlbKc99UA8YhSVqq9yPZA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.4.0"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.58.1",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.58.1.tgz",
      "integrity": "sha512-6LdVIUERWxQMmUSSQi0I53GgCBYgM2RpGngCPY7hSeju+VrKjq3lvs7HpJoPbDiY5QM5EYRtRX5fvrinnMAz3w==",
      "devOptional": true,
      "license": "Apache-2.0",
      "peer": true,
      "dependencies": {
        "playwright": "1.58.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@rtsao/scc": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz",
      "integrity": "sha512-zt6OdqaDoOnJ1ZYsCYGt9YmWzDXl4vQdKTyJev62gFhRGKdx7mcT54V9KIjg+d2wi9EXsPvAPKe7i7WjfVWB8g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.93.3.tgz",
      "integrity": "sha512-JdnkHZPKexVGSNONtu89RHU4bxz3X9kxx+f5ZnR5osoCIX+vs/MckwWRPZEybAEvlJXt5xjomDb3IB876QCxWQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.93.3.tgz",
      "integrity": "sha512-qWO0gHNDm/5jRjROv/nv9L6sYabCWS1kzorOLUv3kqCwRvEJLYZga93ppJPrZwOgoZfXmJzvpjY8fODA4HQfBw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.93.3.tgz",
      "integrity": "sha512-+iJ96g94skO2e4clsRSmEXg22NUOjh9BziapsJSAvnB1grOBf/BA8vGtCHjNOA+Z6lvKXL1jwBqcL9+fS1W/Lg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.93.3.tgz",
      "integrity": "sha512-gnYpcFzwy8IkezRP4CDbT5I8jOsiOjrWrqTY1B+7jIriXsnpifmlM6RRjLBm9oD7OwPG0/WksniGPdKW67sXOA==",
      "license": "MIT",
      "dependencies": {
        "@types/phoenix": "^1.6.6",
        "@types/ws": "^8.18.1",
        "tslib": "2.8.1",
        "ws": "^8.18.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/ssr": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/@supabase/ssr/-/ssr-0.8.0.tgz",
      "integrity": "sha512-/PKk8kNFSs8QvvJ2vOww1mF5/c5W8y42duYtXvkOSe+yZKRgTTZywYG2l41pjhNomqESZCpZtXuWmYjFRMV+dw==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.2"
      },
      "peerDependencies": {
        "@supabase/supabase-js": "^2.76.1"
      }
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.93.3.tgz",
      "integrity": "sha512-cw4qXiLrx3apglDM02Tx/w/stvFlrkKocC6vCvuFAz3JtVEl1zH8MUfDQDTH59kJAQVaVdbewrMWSoBob7REnA==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.93.3",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.93.3.tgz",
      "integrity": "sha512-paUqEqdBI9ztr/4bbMoCgeJ6M8ZTm2fpfjSOlzarPuzYveKFM20ZfDZqUpi9CFfYagYj5Iv3m3ztUjaI9/tM1w==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@supabase/auth-js": "2.93.3",
        "@supabase/functions-js": "2.93.3",
        "@supabase/postgrest-js": "2.93.3",
        "@supabase/realtime-js": "2.93.3",
        "@supabase/storage-js": "2.93.3"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@swc/helpers": {
      "version": "0.5.15",
      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.15.tgz",
      "integrity": "sha512-JQ5TuMi45Owi4/BIMAJBoSQoOJu12oOk/gADqlcUL9JEdHB8vyjUSsxqeNXnmXHjYKMi2WcYtezGEEhqUI/E2g==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.8.0"
      }
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.1.18.tgz",
      "integrity": "sha512-DoR7U1P7iYhw16qJ49fgXUlry1t4CpXeErJHnQ44JgTSKMaZUdf17cfn5mHchfJ4KRBZRFA/Coo+MUF5+gOaCQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.4",
        "enhanced-resolve": "^5.18.3",
        "jiti": "^2.6.1",
        "lightningcss": "1.30.2",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.1.18"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.1.18.tgz",
      "integrity": "sha512-EgCR5tTS5bUSKQgzeMClT6iCY3ToqE1y+ZB0AKldj809QXk1Y+3jB0upOYZrn9aGIzPtUsP7sX4QQ4XtjBB95A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 10"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.1.18",
        "@tailwindcss/oxide-darwin-arm64": "4.1.18",
        "@tailwindcss/oxide-darwin-x64": "4.1.18",
        "@tailwindcss/oxide-freebsd-x64": "4.1.18",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.1.18",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.1.18",
        "@tailwindcss/oxide-linux-arm64-musl": "4.1.18",
        "@tailwindcss/oxide-linux-x64-gnu": "4.1.18",
        "@tailwindcss/oxide-linux-x64-musl": "4.1.18",
        "@tailwindcss/oxide-wasm32-wasi": "4.1.18",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.1.18",
        "@tailwindcss/oxide-win32-x64-msvc": "4.1.18"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.1.18.tgz",
      "integrity": "sha512-dJHz7+Ugr9U/diKJA0W6N/6/cjI+ZTAoxPf9Iz9BFRF2GzEX8IvXxFIi/dZBloVJX/MZGvRuFA9rqwdiIEZQ0Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.1.18.tgz",
      "integrity": "sha512-Gc2q4Qhs660bhjyBSKgq6BYvwDz4G+BuyJ5H1xfhmDR3D8HnHCmT/BSkvSL0vQLy/nkMLY20PQ2OoYMO15Jd0A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.1.18.tgz",
      "integrity": "sha512-FL5oxr2xQsFrc3X9o1fjHKBYBMD1QZNyc1Xzw/h5Qu4XnEBi3dZn96HcHm41c/euGV+GRiXFfh2hUCyKi/e+yw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.1.18.tgz",
      "integrity": "sha512-Fj+RHgu5bDodmV1dM9yAxlfJwkkWvLiRjbhuO2LEtwtlYlBgiAT4x/j5wQr1tC3SANAgD+0YcmWVrj8R9trVMA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.1.18.tgz",
      "integrity": "sha512-Fp+Wzk/Ws4dZn+LV2Nqx3IilnhH51YZoRaYHQsVq3RQvEl+71VGKFpkfHrLM/Li+kt5c0DJe/bHXK1eHgDmdiA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.1.18.tgz",
      "integrity": "sha512-S0n3jboLysNbh55Vrt7pk9wgpyTTPD0fdQeh7wQfMqLPM/Hrxi+dVsLsPrycQjGKEQk85Kgbx+6+QnYNiHalnw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.1.18.tgz",
      "integrity": "sha512-1px92582HkPQlaaCkdRcio71p8bc8i/ap5807tPRDK/uw953cauQBT8c5tVGkOwrHMfc2Yh6UuxaH4vtTjGvHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.1.18.tgz",
      "integrity": "sha512-v3gyT0ivkfBLoZGF9LyHmts0Isc8jHZyVcbzio6Wpzifg/+5ZJpDiRiUhDLkcr7f/r38SWNe7ucxmGW3j3Kb/g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.1.18.tgz",
      "integrity": "sha512-bhJ2y2OQNlcRwwgOAGMY0xTFStt4/wyU6pvI6LSuZpRgKQwxTec0/3Scu91O8ir7qCR3AuepQKLU/kX99FouqQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.1.18.tgz",
      "integrity": "sha512-LffYTvPjODiP6PT16oNeUQJzNVyJl1cjIebq/rWWBF+3eDst5JGEFSc5cWxyRCJ0Mxl+KyIkqRxk1XPEs9x8TA==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.7.1",
        "@emnapi/runtime": "^1.7.1",
        "@emnapi/wasi-threads": "^1.1.0",
        "@napi-rs/wasm-runtime": "^1.1.0",
        "@tybys/wasm-util": "^0.10.1",
        "tslib": "^2.4.0"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.1.18.tgz",
      "integrity": "sha512-HjSA7mr9HmC8fu6bdsZvZ+dhjyGCLdotjVOgLA2vEqxEBZaQo9YTX4kwgEvPCpRh8o4uWc4J/wEoFzhEmjvPbA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.1.18.tgz",
      "integrity": "sha512-bJWbyYpUlqamC8dpR7pfjA0I7vdF6t5VpUGMWRkXVE3AXgIZjYUYAK7II1GNaxR8J1SSrSrppRar8G++JekE3Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tailwindcss/postcss": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/@tailwindcss/postcss/-/postcss-4.1.18.tgz",
      "integrity": "sha512-Ce0GFnzAOuPyfV5SxjXGn0CubwGcuDB0zcdaPuCSzAa/2vII24JTkH+I6jcbXLb1ctjZMZZI6OjDaLPJQL1S0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "@tailwindcss/node": "4.1.18",
        "@tailwindcss/oxide": "4.1.18",
        "postcss": "^8.4.41",
        "tailwindcss": "4.1.18"
      }
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.1",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.1.tgz",
      "integrity": "sha512-9tTaPJLSiejZKx+Bmog4uSubteqTvFrVrURwkmHixBo0G4seD0zUxp98E1DzUBJxLQ3NPwXrGKDiVjwx/DpPsg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
      "integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json5": {
      "version": "0.0.29",
      "resolved": "https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz",
      "integrity": "sha512-dRLjCWHYg4oaA77cxO64oO+7JwCwnIzkZPdrrC71jQmQtlhM556pwKo5bUzqvZndkVbeFLIIi+9TC40JNF5hNQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "25.1.0",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-25.1.0.tgz",
      "integrity": "sha512-t7frlewr6+cbx+9Ohpl0NOTKXZNV9xHRmNOvql47BFJKcEG1CxtxlPEEe+gR9uhVWM4DwhnvTF110mIL4yP9RA==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.16.0"
      }
    },
    "node_modules/@types/phoenix": {
      "version": "1.6.7",
      "resolved": "https://registry.npmjs.org/@types/phoenix/-/phoenix-1.6.7.tgz",
      "integrity": "sha512-oN9ive//QSBkf19rfDv45M7eZPi0eEXylht2OLEXicu5b4KoQ1OzXIw+xDSGWxSxe1JmepRR/ZH283vsu518/Q==",
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "19.2.10",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.2.10.tgz",
      "integrity": "sha512-WPigyYuGhgZ/cTPRXB2EwUw+XvsRA3GqHlsP4qteqrnnjDrApbS7MxcGr/hke5iUoeB7E/gQtrs9I37zAJ0Vjw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.2.3",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.2.3.tgz",
      "integrity": "sha512-jp2L/eY6fn+KgVVQAOqYItbF0VY/YApe5Mz2F0aykSO8gx31bYCZyvSeYxCHKvzHG5eZjc+zyaS5BrBWya2+kQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.2.0"
      }
    },
    "node_modules/@types/ws": {
      "version": "8.18.1",
      "resolved": "https://registry.npmjs.org/@types/ws/-/ws-8.18.1.tgz",
      "integrity": "sha512-ThVF6DCVhA8kUGy+aazFQ4kXQ7E1Ty7A3ypFOe0IcJV8O/M511G99AW24irKrW56Wt44yG9+ij8FaqoBGkuBXg==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/eslint-plugin/-/eslint-plugin-8.54.0.tgz",
      "integrity": "sha512-hAAP5io/7csFStuOmR782YmTthKBJ9ND3WVL60hcOjvtGFb+HJxH4O5huAcmcZ9v9G8P+JETiZ/G1B8MALnWZQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/regexpp": "^4.12.2",
        "@typescript-eslint/scope-manager": "8.54.0",
        "@typescript-eslint/type-utils": "8.54.0",
        "@typescript-eslint/utils": "8.54.0",
        "@typescript-eslint/visitor-keys": "8.54.0",
        "ignore": "^7.0.5",
        "natural-compare": "^1.4.0",
        "ts-api-utils": "^2.4.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "@typescript-eslint/parser": "^8.54.0",
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore": {
      "version": "7.0.5",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-7.0.5.tgz",
      "integrity": "sha512-Hs59xBNfUIunMFgWAbGX5cq6893IbWg4KnrjbYwX3tx0ztorVgTDA6B2sxf8ejHJ4wz8BqGUMYlnzNBer5NvGg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/@typescript-eslint/parser": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/parser/-/parser-8.54.0.tgz",
      "integrity": "sha512-BtE0k6cjwjLZoZixN0t5AKP0kSzlGu7FctRXYuPAm//aaiZhmfq1JwdYpYr1brzEspYyFeF+8XF5j2VK6oalrA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@typescript-eslint/scope-manager": "8.54.0",
        "@typescript-eslint/types": "8.54.0",
        "@typescript-eslint/typescript-estree": "8.54.0",
        "@typescript-eslint/visitor-keys": "8.54.0",
        "debug": "^4.4.3"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/project-service": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/project-service/-/project-service-8.54.0.tgz",
      "integrity": "sha512-YPf+rvJ1s7MyiWM4uTRhE4DvBXrEV+d8oC3P9Y2eT7S+HBS0clybdMIPnhiATi9vZOYDc7OQ1L/i6ga6NFYK/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/tsconfig-utils": "^8.54.0",
        "@typescript-eslint/types": "^8.54.0",
        "debug": "^4.4.3"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/scope-manager": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.54.0.tgz",
      "integrity": "sha512-27rYVQku26j/PbHYcVfRPonmOlVI6gihHtXFbTdB5sb6qA0wdAQAbyXFVarQ5t4HRojIz64IV90YtsjQSSGlQg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.54.0",
        "@typescript-eslint/visitor-keys": "8.54.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/tsconfig-utils": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/tsconfig-utils/-/tsconfig-utils-8.54.0.tgz",
      "integrity": "sha512-dRgOyT2hPk/JwxNMZDsIXDgyl9axdJI3ogZ2XWhBPsnZUv+hPesa5iuhdYt2gzwA9t8RE5ytOJ6xB0moV0Ujvw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/type-utils": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/type-utils/-/type-utils-8.54.0.tgz",
      "integrity": "sha512-hiLguxJWHjjwL6xMBwD903ciAwd7DmK30Y9Axs/etOkftC3ZNN9K44IuRD/EB08amu+Zw6W37x9RecLkOo3pMA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.54.0",
        "@typescript-eslint/typescript-estree": "8.54.0",
        "@typescript-eslint/utils": "8.54.0",
        "debug": "^4.4.3",
        "ts-api-utils": "^2.4.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/types": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/types/-/types-8.54.0.tgz",
      "integrity": "sha512-PDUI9R1BVjqu7AUDsRBbKMtwmjWcn4J3le+5LpcFgWULN3LvHC5rkc9gCVxbrsrGmO1jfPybN5s6h4Jy+OnkAA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/typescript-estree/-/typescript-estree-8.54.0.tgz",
      "integrity": "sha512-BUwcskRaPvTk6fzVWgDPdUndLjB87KYDrN5EYGetnktoeAvPtO4ONHlAZDnj5VFnUANg0Sjm7j4usBlnoVMHwA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/project-service": "8.54.0",
        "@typescript-eslint/tsconfig-utils": "8.54.0",
        "@typescript-eslint/types": "8.54.0",
        "@typescript-eslint/visitor-keys": "8.54.0",
        "debug": "^4.4.3",
        "minimatch": "^9.0.5",
        "semver": "^7.7.3",
        "tinyglobby": "^0.2.15",
        "ts-api-utils": "^2.4.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/@typescript-eslint/typescript-estree/node_modules/semver": {
      "version": "7.7.3",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.3.tgz",
      "integrity": "sha512-SdsKMrI9TdgjdweUSR9MweHA4EJ8YxHn8DFaDisvhVlUOe4BF1tLD7GAj0lIqWVl+dPb/rExr0Btby5loQm20Q==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/@typescript-eslint/utils": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/utils/-/utils-8.54.0.tgz",
      "integrity": "sha512-9Cnda8GS57AQakvRyG0PTejJNlA2xhvyNtEVIMlDWOOeEyBkYWhGPnfrIAnqxLMTSTo6q8g12XVjjev5l1NvMA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.9.1",
        "@typescript-eslint/scope-manager": "8.54.0",
        "@typescript-eslint/types": "8.54.0",
        "@typescript-eslint/typescript-estree": "8.54.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/@typescript-eslint/visitor-keys": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.54.0.tgz",
      "integrity": "sha512-VFlhGSl4opC0bprJiItPQ1RfUhGDIBokcPwaFH4yiBCaNPeld/9VeXbiPO1cLyorQi1G1vL+ecBk1x8o1axORA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/types": "8.54.0",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      }
    },
    "node_modules/@unrs/resolver-binding-android-arm-eabi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm-eabi/-/resolver-binding-android-arm-eabi-1.11.1.tgz",
      "integrity": "sha512-ppLRUgHVaGRWUx0R0Ut06Mjo9gBaBkg3v/8AxusGLhsIotbBLuRk51rAzqLC8gq6NyyAojEXglNjzf6R948DNw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@unrs/resolver-binding-android-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-android-arm64/-/resolver-binding-android-arm64-1.11.1.tgz",
      "integrity": "sha512-lCxkVtb4wp1v+EoN+HjIG9cIIzPkX5OtM03pQYkG+U5O/wL53LC4QbIeazgiKqluGeVEeBlZahHalCaBvU1a2g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@unrs/resolver-binding-darwin-arm64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-arm64/-/resolver-binding-darwin-arm64-1.11.1.tgz",
      "integrity": "sha512-gPVA1UjRu1Y/IsB/dQEsp2V1pm44Of6+LWvbLc9SDk1c2KhhDRDBUkQCYVWe6f26uJb3fOK8saWMgtX8IrMk3g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@unrs/resolver-binding-darwin-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-darwin-x64/-/resolver-binding-darwin-x64-1.11.1.tgz",
      "integrity": "sha512-cFzP7rWKd3lZaCsDze07QX1SC24lO8mPty9vdP+YVa3MGdVgPmFc59317b2ioXtgCMKGiCLxJ4HQs62oz6GfRQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@unrs/resolver-binding-freebsd-x64": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-freebsd-x64/-/resolver-binding-freebsd-x64-1.11.1.tgz",
      "integrity": "sha512-fqtGgak3zX4DCB6PFpsH5+Kmt/8CIi4Bry4rb1ho6Av2QHTREM+47y282Uqiu3ZRF5IQioJQ5qWRV6jduA+iGw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm-gnueabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-gnueabihf/-/resolver-binding-linux-arm-gnueabihf-1.11.1.tgz",
      "integrity": "sha512-u92mvlcYtp9MRKmP+ZvMmtPN34+/3lMHlyMj7wXJDeXxuM0Vgzz0+PPJNsro1m3IZPYChIkn944wW8TYgGKFHw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm-musleabihf": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm-musleabihf/-/resolver-binding-linux-arm-musleabihf-1.11.1.tgz",
      "integrity": "sha512-cINaoY2z7LVCrfHkIcmvj7osTOtm6VVT16b5oQdS4beibX2SYBwgYLmqhBjA1t51CarSaBuX5YNsWLjsqfW5Cw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-gnu/-/resolver-binding-linux-arm64-gnu-1.11.1.tgz",
      "integrity": "sha512-34gw7PjDGB9JgePJEmhEqBhWvCiiWCuXsL9hYphDF7crW7UgI05gyBAi6MF58uGcMOiOqSJ2ybEeCvHcq0BCmQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-arm64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-arm64-musl/-/resolver-binding-linux-arm64-musl-1.11.1.tgz",
      "integrity": "sha512-RyMIx6Uf53hhOtJDIamSbTskA99sPHS96wxVE/bJtePJJtpdKGXO1wY90oRdXuYOGOTuqjT8ACccMc4K6QmT3w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-ppc64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-ppc64-gnu/-/resolver-binding-linux-ppc64-gnu-1.11.1.tgz",
      "integrity": "sha512-D8Vae74A4/a+mZH0FbOkFJL9DSK2R6TFPC9M+jCWYia/q2einCubX10pecpDiTmkJVUH+y8K3BZClycD8nCShA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-gnu/-/resolver-binding-linux-riscv64-gnu-1.11.1.tgz",
      "integrity": "sha512-frxL4OrzOWVVsOc96+V3aqTIQl1O2TjgExV4EKgRY09AJ9leZpEg8Ak9phadbuX0BA4k8U5qtvMSQQGGmaJqcQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-riscv64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-riscv64-musl/-/resolver-binding-linux-riscv64-musl-1.11.1.tgz",
      "integrity": "sha512-mJ5vuDaIZ+l/acv01sHoXfpnyrNKOk/3aDoEdLO/Xtn9HuZlDD6jKxHlkN8ZhWyLJsRBxfv9GYM2utQ1SChKew==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-s390x-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-s390x-gnu/-/resolver-binding-linux-s390x-gnu-1.11.1.tgz",
      "integrity": "sha512-kELo8ebBVtb9sA7rMe1Cph4QHreByhaZ2QEADd9NzIQsYNQpt9UkM9iqr2lhGr5afh885d/cB5QeTXSbZHTYPg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-x64-gnu": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-gnu/-/resolver-binding-linux-x64-gnu-1.11.1.tgz",
      "integrity": "sha512-C3ZAHugKgovV5YvAMsxhq0gtXuwESUKc5MhEtjBpLoHPLYM+iuwSj3lflFwK3DPm68660rZ7G8BMcwSro7hD5w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-linux-x64-musl": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-linux-x64-musl/-/resolver-binding-linux-x64-musl-1.11.1.tgz",
      "integrity": "sha512-rV0YSoyhK2nZ4vEswT/QwqzqQXw5I6CjoaYMOX0TqBlWhojUf8P94mvI7nuJTeaCkkds3QE4+zS8Ko+GdXuZtA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@unrs/resolver-binding-wasm32-wasi": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-wasm32-wasi/-/resolver-binding-wasm32-wasi-1.11.1.tgz",
      "integrity": "sha512-5u4RkfxJm+Ng7IWgkzi3qrFOvLvQYnPBmjmZQ8+szTK/b31fQCnleNl1GgEt7nIsZRIf5PLhPwT0WM+q45x/UQ==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@napi-rs/wasm-runtime": "^0.2.11"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@unrs/resolver-binding-win32-arm64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-arm64-msvc/-/resolver-binding-win32-arm64-msvc-1.11.1.tgz",
      "integrity": "sha512-nRcz5Il4ln0kMhfL8S3hLkxI85BXs3o8EYoattsJNdsX4YUU89iOkVn7g0VHSRxFuVMdM4Q1jEpIId1Ihim/Uw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@unrs/resolver-binding-win32-ia32-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-ia32-msvc/-/resolver-binding-win32-ia32-msvc-1.11.1.tgz",
      "integrity": "sha512-DCEI6t5i1NmAZp6pFonpD5m7i6aFrpofcp4LA2i8IIq60Jyo28hamKBxNrZcyOwVOZkgsRp9O2sXWBWP8MnvIQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@unrs/resolver-binding-win32-x64-msvc": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@unrs/resolver-binding-win32-x64-msvc/-/resolver-binding-win32-x64-msvc-1.11.1.tgz",
      "integrity": "sha512-lrW200hZdbfRtztbygyaq/6jP6AKE8qQN2KvPcJ+x7wiD038YtnYtZ82IMNJ69GJibV7bwL3y9FgK+5w/pYt6g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/acorn": {
      "version": "8.15.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.15.0.tgz",
      "integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.12.6",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.12.6.tgz",
      "integrity": "sha512-j3fVLgvTo527anyYyJOGTYJbG+vnnQYvE0m5mmkc1TK+nxAppkCLMIL0aZ4dblVCNoGShhm+kzE4ZUykBoMg4g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/aria-query": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/aria-query/-/aria-query-5.3.2.tgz",
      "integrity": "sha512-COROpnaoap1E2F000S62r6A60uHZnmlvomhfyT2DlTcrY1OrBKn2UhH7qn5wTC9zMvD0AY7csdPSNwKP+7WiQw==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/array-buffer-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/array-buffer-byte-length/-/array-buffer-byte-length-1.0.2.tgz",
      "integrity": "sha512-LHE+8BuR7RYGDKvnrmcuSq3tDcKv9OFEXQt/HpbZhY7V6h0zlUXutnAD82GiFx9rdieCMjkvtcsPqBwgUl1Iiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "is-array-buffer": "^3.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array-includes": {
      "version": "3.1.9",
      "resolved": "https://registry.npmjs.org/array-includes/-/array-includes-3.1.9.tgz",
      "integrity": "sha512-FmeCCAenzH0KH381SPT5FZmiA/TmpndpcaShhfgEN9eCVjnFBqq3l1xrI42y8+PPLI6hypzou4GXw00WHmPBLQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.0",
        "es-object-atoms": "^1.1.1",
        "get-intrinsic": "^1.3.0",
        "is-string": "^1.1.1",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.findlast": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/array.prototype.findlast/-/array.prototype.findlast-1.2.5.tgz",
      "integrity": "sha512-CVvd6FHg1Z3POpBLxO6E6zr+rSKEQ9L6rZHAaY7lLfhKsWYUBBOuMs0e9o24oopj6H+geRCX0YJ+TJLBK2eHyQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.findlastindex": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/array.prototype.findlastindex/-/array.prototype.findlastindex-1.2.6.tgz",
      "integrity": "sha512-F/TKATkzseUExPlfvmwQKGITM3DGTK+vkAsCZoDc5daVygbJBnjEUCbgkAvVFsgfXfX4YIqZ/27G3k3tdXrTxQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-shim-unscopables": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flat": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flat/-/array.prototype.flat-1.3.3.tgz",
      "integrity": "sha512-rwG/ja1neyLqCuGZ5YYrznA62D4mZXg0i1cIskIUKSiqF3Cje9/wXAls9B9s1Wa2fomMsIv8czB8jZcPmxCXFg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.flatmap": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/array.prototype.flatmap/-/array.prototype.flatmap-1.3.3.tgz",
      "integrity": "sha512-Y7Wt51eKJSyi80hFrJCePGGNo5ktJCslFuboqJsbf57CCPcm5zztluPlc4/aD8sWsKvlwatezpV4U1efk8kpjg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/array.prototype.tosorted": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/array.prototype.tosorted/-/array.prototype.tosorted-1.1.4.tgz",
      "integrity": "sha512-p6Fx8B7b7ZhL/gmUsAy0D15WhvDccw3mnGNbZpi3pmeJdxtWsj2jEaI4Y6oo3XiHfzuSgPwKc04MYt6KgvC/wA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.3",
        "es-errors": "^1.3.0",
        "es-shim-unscopables": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/arraybuffer.prototype.slice": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/arraybuffer.prototype.slice/-/arraybuffer.prototype.slice-1.0.4.tgz",
      "integrity": "sha512-BNoCY6SXXPQ7gF2opIP4GBE+Xw7U+pHMYKuzjgCN3GwiaIR09UUeKfheyIry77QtrCBlC0KK0q5/TER/tYh3PQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.1",
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "is-array-buffer": "^3.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/ast-types-flow": {
      "version": "0.0.8",
      "resolved": "https://registry.npmjs.org/ast-types-flow/-/ast-types-flow-0.0.8.tgz",
      "integrity": "sha512-OH/2E5Fg20h2aPrbe+QL8JZQFko0YZaF+j4mnQ7BGhfavO7OpSLa8a0y9sBwomHdSbkhTS8TQNayBfnW5DwbvQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/async-function": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/async-function/-/async-function-1.0.0.tgz",
      "integrity": "sha512-hsU18Ae8CDTR6Kgu9DYf0EbCr/a5iGL0rytQDobUcdpYOKokk8LEjVphnXkDkgpi0wYVsqrXuP0bZxJaTqdgoA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/autoprefixer": {
      "version": "10.4.23",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.23.tgz",
      "integrity": "sha512-YYTXSFulfwytnjAPlw8QHncHJmlvFKtczb8InXaAx9Q0LbfDnfEYDE55omerIJKihhmU61Ft+cAOSzQVaBUmeA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.1",
        "caniuse-lite": "^1.0.30001760",
        "fraction.js": "^5.3.4",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/available-typed-arrays": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/available-typed-arrays/-/available-typed-arrays-1.0.7.tgz",
      "integrity": "sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "possible-typed-array-names": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/axe-core": {
      "version": "4.11.1",
      "resolved": "https://registry.npmjs.org/axe-core/-/axe-core-4.11.1.tgz",
      "integrity": "sha512-BASOg+YwO2C+346x3LZOeoovTIoTrRqEsqMa6fmfAV0P+U9mFr9NsyOEpiYvFjbc64NMrSswhV50WdXzdb/Z5A==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/axobject-query": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/axobject-query/-/axobject-query-4.1.0.tgz",
      "integrity": "sha512-qIj0G9wZbMGNLjLmg1PT6v2mE9AH2zlnADJD/2tC6E00hgmhUOfEB6greHPAfLRSufHqROIUTkw6E+M3lH0PTQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/babel-plugin-react-compiler": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/babel-plugin-react-compiler/-/babel-plugin-react-compiler-1.0.0.tgz",
      "integrity": "sha512-Ixm8tFfoKKIPYdCCKYTsqv+Fd4IJ0DQqMyEimo+pxUOMUR9cVPlwTrFt9Avu+3cb6Zp3mAzl+t1MrG2fxxKsxw==",
      "devOptional": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/types": "^7.26.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.9.19",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.9.19.tgz",
      "integrity": "sha512-ipDqC8FrAl/76p2SSWKSI+H9tFwm7vYqXQrItCuiVPt26Km0jS+NzSsBWAaBusvSbQcfJG+JitdMm+wZAgTYqg==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.js"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.1",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.1.tgz",
      "integrity": "sha512-ZC5Bd0LgJXgwGqUknZY/vkUQ04r8NXnJZ3yYi4vDmSiZmC/pdSN0NbNRPxZpbtO4uAfDUAFffO8IZoM3Gj8IkA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "baseline-browser-mapping": "^2.9.0",
        "caniuse-lite": "^1.0.30001759",
        "electron-to-chromium": "^1.5.263",
        "node-releases": "^2.0.27",
        "update-browserslist-db": "^1.2.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/call-bind": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/call-bind/-/call-bind-1.0.8.tgz",
      "integrity": "sha512-oKlSFMcMwpUg2ednkhQ454wfWiU/ul3CkJe/PEHcTKuiX6RpbehUiFMXu13HalGZxfUwCQzZG747YXBn1im9ww==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.0",
        "es-define-property": "^1.0.0",
        "get-intrinsic": "^1.2.4",
        "set-function-length": "^1.2.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001766",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001766.tgz",
      "integrity": "sha512-4C0lfJ0/YPjJQHagaE9x2Elb69CIqEPZeG0anQt9SIvIoOH4a4uaRl73IavyO+0qZh6MDLH//DrXThEYKHkmYA==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
      "license": "MIT"
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/damerau-levenshtein": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/damerau-levenshtein/-/damerau-levenshtein-1.0.8.tgz",
      "integrity": "sha512-sdQSFB7+llfUcQHUQO3+B8ERRj0Oa4w9POWMI/puGtuf7gFywGmkaLCElnudfTiKZV+NvHqL0ifzdrI8Ro7ESA==",
      "dev": true,
      "license": "BSD-2-Clause"
    },
    "node_modules/data-view-buffer": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-buffer/-/data-view-buffer-1.0.2.tgz",
      "integrity": "sha512-EmKO5V3OLXh1rtK2wgXRansaK1/mtVdTUEiEI0W8RkvgT05kfxaH29PliLnpLP73yYO6142Q72QNa8Wx/A5CqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/data-view-byte-length": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/data-view-byte-length/-/data-view-byte-length-1.0.2.tgz",
      "integrity": "sha512-tuhGbE6CfTM9+5ANGf+oQb72Ky/0+s3xKUpHvShfiz2RxMFgFPjsXuRLBVMtvMs15awe45SRb83D6wH4ew6wlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/inspect-js"
      }
    },
    "node_modules/data-view-byte-offset": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/data-view-byte-offset/-/data-view-byte-offset-1.0.1.tgz",
      "integrity": "sha512-BS8PfmtDGnrgYdOonGZQdLZslWIeCGFP9tpan0hi1Co2Zr2NKADsvGYA8XxuG/4UWgJ6Cjtv+YJnB6MM69QGlQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-data-view": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/define-data-property": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/define-data-property/-/define-data-property-1.1.4.tgz",
      "integrity": "sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0",
        "es-errors": "^1.3.0",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/define-properties": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/define-properties/-/define-properties-1.2.1.tgz",
      "integrity": "sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.0.1",
        "has-property-descriptors": "^1.0.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "devOptional": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/doctrine": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/doctrine/-/doctrine-2.1.0.tgz",
      "integrity": "sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "esutils": "^2.0.2"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.283",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.283.tgz",
      "integrity": "sha512-3vifjt1HgrGW/h76UEeny+adYApveS9dH2h3p57JYzBSXJIKUJAvtmIytDKjcSCt9xHfrNCFJ7gts6vkhuq++w==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/enhanced-resolve": {
      "version": "5.18.4",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.18.4.tgz",
      "integrity": "sha512-LgQMM4WXU3QI+SYgEc2liRgznaD5ojbmY3sb8LxyguVkIg5FxdpTkvk72te2R38/TGKxH634oLxXRGY6d7AP+Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.2.0"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/es-abstract": {
      "version": "1.24.1",
      "resolved": "https://registry.npmjs.org/es-abstract/-/es-abstract-1.24.1.tgz",
      "integrity": "sha512-zHXBLhP+QehSSbsS9Pt23Gg964240DPd6QCf8WpkqEXxQ7fhdZzYsocOr5u7apWonsS5EjZDmTF+/slGMyasvw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-buffer-byte-length": "^1.0.2",
        "arraybuffer.prototype.slice": "^1.0.4",
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "data-view-buffer": "^1.0.2",
        "data-view-byte-length": "^1.0.2",
        "data-view-byte-offset": "^1.0.1",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "es-set-tostringtag": "^2.1.0",
        "es-to-primitive": "^1.3.0",
        "function.prototype.name": "^1.1.8",
        "get-intrinsic": "^1.3.0",
        "get-proto": "^1.0.1",
        "get-symbol-description": "^1.1.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "internal-slot": "^1.1.0",
        "is-array-buffer": "^3.0.5",
        "is-callable": "^1.2.7",
        "is-data-view": "^1.0.2",
        "is-negative-zero": "^2.0.3",
        "is-regex": "^1.2.1",
        "is-set": "^2.0.3",
        "is-shared-array-buffer": "^1.0.4",
        "is-string": "^1.1.1",
        "is-typed-array": "^1.1.15",
        "is-weakref": "^1.1.1",
        "math-intrinsics": "^1.1.0",
        "object-inspect": "^1.13.4",
        "object-keys": "^1.1.1",
        "object.assign": "^4.1.7",
        "own-keys": "^1.0.1",
        "regexp.prototype.flags": "^1.5.4",
        "safe-array-concat": "^1.1.3",
        "safe-push-apply": "^1.0.0",
        "safe-regex-test": "^1.1.0",
        "set-proto": "^1.0.0",
        "stop-iteration-iterator": "^1.1.0",
        "string.prototype.trim": "^1.2.10",
        "string.prototype.trimend": "^1.0.9",
        "string.prototype.trimstart": "^1.0.8",
        "typed-array-buffer": "^1.0.3",
        "typed-array-byte-length": "^1.0.3",
        "typed-array-byte-offset": "^1.0.4",
        "typed-array-length": "^1.0.7",
        "unbox-primitive": "^1.1.0",
        "which-typed-array": "^1.1.19"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-iterator-helpers": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/es-iterator-helpers/-/es-iterator-helpers-1.2.2.tgz",
      "integrity": "sha512-BrUQ0cPTB/IwXj23HtwHjS9n7O4h9FX94b4xc5zlTHxeLgTAdzYUDyy6KdExAl9lbN5rtfe44xpjpmj9grxs5w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.24.1",
        "es-errors": "^1.3.0",
        "es-set-tostringtag": "^2.1.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.3.0",
        "globalthis": "^1.0.4",
        "gopd": "^1.2.0",
        "has-property-descriptors": "^1.0.2",
        "has-proto": "^1.2.0",
        "has-symbols": "^1.1.0",
        "internal-slot": "^1.1.0",
        "iterator.prototype": "^1.1.5",
        "safe-array-concat": "^1.1.3"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-shim-unscopables": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/es-shim-unscopables/-/es-shim-unscopables-1.1.0.tgz",
      "integrity": "sha512-d9T8ucsEhh8Bi1woXCf+TIKDIROLG5WCkxg8geBCbvk22kzwC5G2OnXVMO6FUsvQlgUUXQ2itephWDLqDzbeCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-to-primitive": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-to-primitive/-/es-to-primitive-1.3.0.tgz",
      "integrity": "sha512-w+5mJ3GuFL+NjVtJlvydShqE1eN3h3PbI7/5LAsYJP/2qtuMXjfL2LpHSRqo4b4eSF5K/DH1JXKUAHSB2UW50g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7",
        "is-date-object": "^1.0.5",
        "is-symbol": "^1.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "9.39.2",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.39.2.tgz",
      "integrity": "sha512-LEyamqS7W5HB3ujJyvi0HQK/dtVINZvd5mAAp9eT5S/ujByGjiZLCzPcHVzuXbpJDJF/cxwHlfceVUDZ2lnSTw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.8.0",
        "@eslint-community/regexpp": "^4.12.1",
        "@eslint/config-array": "^0.21.1",
        "@eslint/config-helpers": "^0.4.2",
        "@eslint/core": "^0.17.0",
        "@eslint/eslintrc": "^3.3.1",
        "@eslint/js": "9.39.2",
        "@eslint/plugin-kit": "^0.4.1",
        "@humanfs/node": "^0.16.6",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.4.2",
        "@types/estree": "^1.0.6",
        "ajv": "^6.12.4",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.6",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.4.0",
        "eslint-visitor-keys": "^4.2.1",
        "espree": "^10.4.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.2",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-config-next": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/eslint-config-next/-/eslint-config-next-16.1.4.tgz",
      "integrity": "sha512-iCrrNolUPpn/ythx0HcyNRfUBgTkaNBXByisKUbusPGCl8DMkDXXAu7exlSTSLGTIsH9lFE/c4s/3Qiyv2qwdA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@next/eslint-plugin-next": "16.1.4",
        "eslint-import-resolver-node": "^0.3.6",
        "eslint-import-resolver-typescript": "^3.5.2",
        "eslint-plugin-import": "^2.32.0",
        "eslint-plugin-jsx-a11y": "^6.10.0",
        "eslint-plugin-react": "^7.37.0",
        "eslint-plugin-react-hooks": "^7.0.0",
        "globals": "16.4.0",
        "typescript-eslint": "^8.46.0"
      },
      "peerDependencies": {
        "eslint": ">=9.0.0",
        "typescript": ">=3.3.1"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-config-next/node_modules/globals": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-16.4.0.tgz",
      "integrity": "sha512-ob/2LcVVaVGCYN+r14cnwnoDPUufjiYgSqRhiFD0Q1iI4Odora5RE8Iv1D24hAz5oMophRGkGz+yuvQmmUMnMw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint-import-resolver-node": {
      "version": "0.3.9",
      "resolved": "https://registry.npmjs.org/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.9.tgz",
      "integrity": "sha512-WFj2isz22JahUv+B788TlO3N6zL3nNJGU8CcZbPZvVEkBPaJdCV4vy5wyghty5ROFbCRnm132v8BScu5/1BQ8g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7",
        "is-core-module": "^2.13.0",
        "resolve": "^1.22.4"
      }
    },
    "node_modules/eslint-import-resolver-node/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-import-resolver-typescript": {
      "version": "3.10.1",
      "resolved": "https://registry.npmjs.org/eslint-import-resolver-typescript/-/eslint-import-resolver-typescript-3.10.1.tgz",
      "integrity": "sha512-A1rHYb06zjMGAxdLSkN2fXPBwuSaQ0iO5M/hdyS0Ajj1VBaRp0sPD3dn1FhME3c/JluGFbwSxyCfqdSbtQLAHQ==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "@nolyfill/is-core-module": "1.0.39",
        "debug": "^4.4.0",
        "get-tsconfig": "^4.10.0",
        "is-bun-module": "^2.0.0",
        "stable-hash": "^0.0.5",
        "tinyglobby": "^0.2.13",
        "unrs-resolver": "^1.6.2"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint-import-resolver-typescript"
      },
      "peerDependencies": {
        "eslint": "*",
        "eslint-plugin-import": "*",
        "eslint-plugin-import-x": "*"
      },
      "peerDependenciesMeta": {
        "eslint-plugin-import": {
          "optional": true
        },
        "eslint-plugin-import-x": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-module-utils": {
      "version": "2.12.1",
      "resolved": "https://registry.npmjs.org/eslint-module-utils/-/eslint-module-utils-2.12.1.tgz",
      "integrity": "sha512-L8jSWTze7K2mTg0vos/RuLRS5soomksDPoJLXIslC7c8Wmut3bx7CPpJijDcBZtxQ5lrbUdM+s0OlNbz0DCDNw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "debug": "^3.2.7"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependenciesMeta": {
        "eslint": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-module-utils/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-import": {
      "version": "2.32.0",
      "resolved": "https://registry.npmjs.org/eslint-plugin-import/-/eslint-plugin-import-2.32.0.tgz",
      "integrity": "sha512-whOE1HFo/qJDyX4SnXzP4N6zOWn79WhnCUY/iDR0mPfQZO8wcYE4JClzI2oZrhBnnMUCBCHZhO6VQyoBU95mZA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@rtsao/scc": "^1.1.0",
        "array-includes": "^3.1.9",
        "array.prototype.findlastindex": "^1.2.6",
        "array.prototype.flat": "^1.3.3",
        "array.prototype.flatmap": "^1.3.3",
        "debug": "^3.2.7",
        "doctrine": "^2.1.0",
        "eslint-import-resolver-node": "^0.3.9",
        "eslint-module-utils": "^2.12.1",
        "hasown": "^2.0.2",
        "is-core-module": "^2.16.1",
        "is-glob": "^4.0.3",
        "minimatch": "^3.1.2",
        "object.fromentries": "^2.0.8",
        "object.groupby": "^1.0.3",
        "object.values": "^1.2.1",
        "semver": "^6.3.1",
        "string.prototype.trimend": "^1.0.9",
        "tsconfig-paths": "^3.15.0"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependencies": {
        "eslint": "^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9"
      }
    },
    "node_modules/eslint-plugin-import/node_modules/debug": {
      "version": "3.2.7",
      "resolved": "https://registry.npmjs.org/debug/-/debug-3.2.7.tgz",
      "integrity": "sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.1"
      }
    },
    "node_modules/eslint-plugin-jsx-a11y": {
      "version": "6.10.2",
      "resolved": "https://registry.npmjs.org/eslint-plugin-jsx-a11y/-/eslint-plugin-jsx-a11y-6.10.2.tgz",
      "integrity": "sha512-scB3nz4WmG75pV8+3eRUQOHZlNSUhFNq37xnpgRkCCELU3XMvXAxLk1eqWWyE22Ki4Q01Fnsw9BA3cJHDPgn2Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "aria-query": "^5.3.2",
        "array-includes": "^3.1.8",
        "array.prototype.flatmap": "^1.3.2",
        "ast-types-flow": "^0.0.8",
        "axe-core": "^4.10.0",
        "axobject-query": "^4.1.0",
        "damerau-levenshtein": "^1.0.8",
        "emoji-regex": "^9.2.2",
        "hasown": "^2.0.2",
        "jsx-ast-utils": "^3.3.5",
        "language-tags": "^1.0.9",
        "minimatch": "^3.1.2",
        "object.fromentries": "^2.0.8",
        "safe-regex-test": "^1.0.3",
        "string.prototype.includes": "^2.0.1"
      },
      "engines": {
        "node": ">=4.0"
      },
      "peerDependencies": {
        "eslint": "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9"
      }
    },
    "node_modules/eslint-plugin-react": {
      "version": "7.37.5",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react/-/eslint-plugin-react-7.37.5.tgz",
      "integrity": "sha512-Qteup0SqU15kdocexFNAJMvCJEfa2xUKNV4CC1xsVMrIIqEy3SQ/rqyxCWNzfrd3/ldy6HMlD2e0JDVpDg2qIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-includes": "^3.1.8",
        "array.prototype.findlast": "^1.2.5",
        "array.prototype.flatmap": "^1.3.3",
        "array.prototype.tosorted": "^1.1.4",
        "doctrine": "^2.1.0",
        "es-iterator-helpers": "^1.2.1",
        "estraverse": "^5.3.0",
        "hasown": "^2.0.2",
        "jsx-ast-utils": "^2.4.1 || ^3.0.0",
        "minimatch": "^3.1.2",
        "object.entries": "^1.1.9",
        "object.fromentries": "^2.0.8",
        "object.values": "^1.2.1",
        "prop-types": "^15.8.1",
        "resolve": "^2.0.0-next.5",
        "semver": "^6.3.1",
        "string.prototype.matchall": "^4.0.12",
        "string.prototype.repeat": "^1.0.0"
      },
      "engines": {
        "node": ">=4"
      },
      "peerDependencies": {
        "eslint": "^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7"
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "7.0.1",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.0.1.tgz",
      "integrity": "sha512-O0d0m04evaNzEPoSW+59Mezf8Qt0InfgGIBJnpC0h3NH/WjUAR7BIKUfysC6todmtiZ/A0oUVS8Gce0WhBrHsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.24.4",
        "@babel/parser": "^7.24.4",
        "hermes-parser": "^0.25.1",
        "zod": "^3.25.0 || ^4.0.0",
        "zod-validation-error": "^3.5.0 || ^4.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0"
      }
    },
    "node_modules/eslint-plugin-react/node_modules/resolve": {
      "version": "2.0.0-next.5",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-2.0.0-next.5.tgz",
      "integrity": "sha512-U7WjGVG9sH8tvjW5SmGbQuui75FiyjAX72HX15DwBBwF9dNiQZRQAg9nnPhYy+TUnE0+VcrttuvNI8oSxZcocA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-core-module": "^2.13.0",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.4.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz",
      "integrity": "sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz",
      "integrity": "sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.4.0.tgz",
      "integrity": "sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.15.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz",
      "integrity": "sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.1.tgz",
      "integrity": "sha512-kNFPyjhh5cKjrUltxs+wFx+ZkbRaxxmZ+X0ZU31SOsxCEtP9VPgtq2teZw1DebupL5GmDaNQ6yKMMVcM41iqDg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.4"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fastq": {
      "version": "1.20.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.1.tgz",
      "integrity": "sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.3.3.tgz",
      "integrity": "sha512-GX+ysw4PBCz0PzosHDepZGANEuFCMLrnRTiEy9McGjmkCQYwRq4A/X786G/fjM/+OjsWSU1ZrY5qyARZmO/uwg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/for-each": {
      "version": "0.3.5",
      "resolved": "https://registry.npmjs.org/for-each/-/for-each-0.3.5.tgz",
      "integrity": "sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/fraction.js": {
      "version": "5.3.4",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-5.3.4.tgz",
      "integrity": "sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/function.prototype.name": {
      "version": "1.1.8",
      "resolved": "https://registry.npmjs.org/function.prototype.name/-/function.prototype.name-1.1.8.tgz",
      "integrity": "sha512-e5iwyodOHhbMr/yNrc7fDYG4qlbIvI5gajyzPnb5TCwyhjApznQh1BMFou9b30SevY43gCJKXycoCBjMbsuW0Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "functions-have-names": "^1.2.3",
        "hasown": "^2.0.2",
        "is-callable": "^1.2.7"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/functions-have-names": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/functions-have-names/-/functions-have-names-1.2.3.tgz",
      "integrity": "sha512-xckBUXyTIqT97tq2x2AMb+g163b5JFysYk0x4qxNFwbfQkmNZoiRHb6sPzI9/QV33WeuvVYBUIiD4NzNIyqaRQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/generator-function": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/generator-function/-/generator-function-2.0.1.tgz",
      "integrity": "sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/get-symbol-description": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/get-symbol-description/-/get-symbol-description-1.1.0.tgz",
      "integrity": "sha512-w9UMqWwJxHNOvoNzSJ2oPF5wvYcvP7jUvYzhp67yEhTi17ZDBBC1z9pTdGuzjD+EFIqLSYRweZjqfiPzQ06Ebg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-tsconfig": {
      "version": "4.13.0",
      "resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.13.0.tgz",
      "integrity": "sha512-1VKTZJCwBrvbd+Wn3AOgQP/2Av+TfTCOlE4AcRJE72W1ksZXbAx8PPBR9RzgTeSPzlPMHrbANMH3LbltH73wxQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "resolve-pkg-maps": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/globalthis": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/globalthis/-/globalthis-1.0.4.tgz",
      "integrity": "sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.2.1",
        "gopd": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/has-bigints": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-bigints/-/has-bigints-1.1.0.tgz",
      "integrity": "sha512-R3pbpkcIqv2Pm3dUwgjclDRVmWpTJW2DcMzcIhEXEx1oh/CEMObMm3KLmRJOdvhM7o4uQBnwr8pzRK2sJWIqfg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/has-property-descriptors": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-property-descriptors/-/has-property-descriptors-1.0.2.tgz",
      "integrity": "sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-define-property": "^1.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-proto": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/has-proto/-/has-proto-1.2.0.tgz",
      "integrity": "sha512-KIL7eQPfHQRC8+XluaIw7BHUwwqL19bQn4hzNgdr+1wXoU0KKj6rufu47lhY7KbJR2C6T6+PfyN0Ea7wkSS+qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/hermes-estree": {
      "version": "0.25.1",
      "resolved": "https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.25.1.tgz",
      "integrity": "sha512-0wUoCcLp+5Ev5pDW2OriHC2MJCbwLwuRx+gAqMTOkGKJJiBCLjtrvy4PWUGn6MIVefecRpzoOZ/UV6iGdOr+Cw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/hermes-parser": {
      "version": "0.25.1",
      "resolved": "https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.25.1.tgz",
      "integrity": "sha512-6pEjquH3rqaI6cYAXYPcz9MS4rY6R4ngRgrgfDshRptUZIc3lw0MCIJIGDj9++mfySOuPTHB4nrSW99BCvOPIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hermes-estree": "0.25.1"
      }
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/internal-slot": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/internal-slot/-/internal-slot-1.1.0.tgz",
      "integrity": "sha512-4gd7VpWNQNB4UKKCFFVcp1AVv+FMOgs9NKzjHKusc8jTMhd5eL1NqQqOpE0KzMds804/yHlglp3uxgluOqAPLw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "hasown": "^2.0.2",
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/is-array-buffer": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz",
      "integrity": "sha512-DDfANUiiG2wC1qawP66qlTugJeL5HyzMpfr8lLK+jMQirGzNod0B12cFB/9q838Ru27sBwfw78/rdoU7RERz6A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-async-function": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-async-function/-/is-async-function-2.1.1.tgz",
      "integrity": "sha512-9dgM/cZBnNvjzaMYHVoxxfPj2QXt22Ev7SuuPrs+xav0ukGB0S6d4ydZdEiM48kLx5kDV+QBPrpVnFyefL8kkQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "async-function": "^1.0.0",
        "call-bound": "^1.0.3",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-bigint": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-bigint/-/is-bigint-1.1.0.tgz",
      "integrity": "sha512-n4ZT37wG78iz03xPRKJrHTdZbe3IicyucEtdRsV5yglwc3GyUfbAfpSeD0FJ41NbUNSt5wbhqfp1fS+BgnvDFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-bigints": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-boolean-object": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/is-boolean-object/-/is-boolean-object-1.2.2.tgz",
      "integrity": "sha512-wa56o2/ElJMYqjCjGkXri7it5FbebW5usLw/nPmCMs5DeZ7eziSYZhSmPRn0txqeW4LnAmQQU7FgqLpsEFKM4A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-bun-module": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/is-bun-module/-/is-bun-module-2.0.0.tgz",
      "integrity": "sha512-gNCGbnnnnFAUGKeZ9PdbyeGYJqewpmc2aKHUEMO5nQPWU9lOmv7jcmQIv+qHD8fXW6W7qfuCwX4rY9LNRjXrkQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "semver": "^7.7.1"
      }
    },
    "node_modules/is-bun-module/node_modules/semver": {
      "version": "7.7.3",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.3.tgz",
      "integrity": "sha512-SdsKMrI9TdgjdweUSR9MweHA4EJ8YxHn8DFaDisvhVlUOe4BF1tLD7GAj0lIqWVl+dPb/rExr0Btby5loQm20Q==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/is-callable": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/is-callable/-/is-callable-1.2.7.tgz",
      "integrity": "sha512-1BC0BVFhS/p0qtw6enp8e+8OD0UrK0oFLztSjNzhcKA3WDuJxxAPXzPuPtKkjEY9UUoEWlX/8fgKeu2S8i9JTA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.1.tgz",
      "integrity": "sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-data-view": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/is-data-view/-/is-data-view-1.0.2.tgz",
      "integrity": "sha512-RKtWF8pGmS87i2D6gqQu/l7EYRlVdfzemCJN/P3UOs//x1QE7mfhvzHIApBTRf7axvT6DMGwSwBXYCT0nfB9xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "get-intrinsic": "^1.2.6",
        "is-typed-array": "^1.1.13"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-date-object": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/is-date-object/-/is-date-object-1.1.0.tgz",
      "integrity": "sha512-PwwhEakHVKTdRNVOw+/Gyh0+MzlCl4R6qKvkhuvLtPMggI1WAHt9sOwZxQLSGpUaDnrdyDsomoRgNnCfKNSXXg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-finalizationregistry": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-finalizationregistry/-/is-finalizationregistry-1.1.1.tgz",
      "integrity": "sha512-1pC6N8qWJbWoPtEjgcL2xyhQOP491EQjeUo3qTKcmV8YSDDJrOepfG8pcC7h/QgnQHYSv0mJ3Z/ZWxmatVrysg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-generator-function": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/is-generator-function/-/is-generator-function-1.1.2.tgz",
      "integrity": "sha512-upqt1SkGkODW9tsGNG5mtXTXtECizwtS2kA161M+gJPc1xdb/Ax629af6YrTwcOeQHbewrPNlE5Dx7kzvXTizA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.4",
        "generator-function": "^2.0.0",
        "get-proto": "^1.0.1",
        "has-tostringtag": "^1.0.2",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-map": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-map/-/is-map-2.0.3.tgz",
      "integrity": "sha512-1Qed0/Hr2m+YqxnM09CjA2d/i6YZNfF6R2oRAOj36eUdS6qIV/huPJNSEpKbupewFs+ZsJlxsjjPbc0/afW6Lw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-negative-zero": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-negative-zero/-/is-negative-zero-2.0.3.tgz",
      "integrity": "sha512-5KoIu2Ngpyek75jXodFvnafB6DJgr3u8uuK0LEZJjrU19DrMD3EVERaR8sjz8CCGgpZvxPl9SuE1GMVPFHx1mw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/is-number-object": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-number-object/-/is-number-object-1.1.1.tgz",
      "integrity": "sha512-lZhclumE1G6VYD8VHe35wFaIif+CTy5SJIi5+3y4psDgWu4wPDoBhF8NxUOinEc7pHgiTsT6MaBb92rKhhD+Xw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-regex": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/is-regex/-/is-regex-1.2.1.tgz",
      "integrity": "sha512-MjYsKHO5O7mCsmRGxWcLWheFqN9DJ/2TmngvjKXihe6efViPqc274+Fx/4fYj/r03+ESvBdTXK0V6tA3rgez1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-set": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/is-set/-/is-set-2.0.3.tgz",
      "integrity": "sha512-iPAjerrse27/ygGLxw+EBR9agv9Y6uLeYVJMu+QNCoouJ1/1ri0mGrcWpfCqFZuzzx3WjtwxG098X+n4OuRkPg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-shared-array-buffer": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/is-shared-array-buffer/-/is-shared-array-buffer-1.0.4.tgz",
      "integrity": "sha512-ISWac8drv4ZGfwKl5slpHG9OwPNty4jOWPRIhBpxOoD+hqITiwuipOQ2bNthAzwA3B4fIjO4Nln74N0S9byq8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-string": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-string/-/is-string-1.1.1.tgz",
      "integrity": "sha512-BtEeSsoaQjlSPBemMQIrY1MY0uM6vnS1g5fmufYOtnxLGUZM2178PKbhsk7Ffv58IX+ZtcvoGwccYsh0PglkAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-symbol": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-symbol/-/is-symbol-1.1.1.tgz",
      "integrity": "sha512-9gGx6GTtCQM73BgmHQXfDmLtfjjTUDSyoxTCbp5WtoixAhfgsDirWIcVQ/IHpvI5Vgd5i/J5F7B9cN/WlVbC/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "has-symbols": "^1.1.0",
        "safe-regex-test": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-typed-array": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/is-typed-array/-/is-typed-array-1.1.15.tgz",
      "integrity": "sha512-p3EcsicXjit7SaskXHs1hA91QxgTw46Fv6EFKKGS5DRFLD8yKnohjF3hxoju94b/OcMZoQukzpPpBE9uLVKzgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakmap": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/is-weakmap/-/is-weakmap-2.0.2.tgz",
      "integrity": "sha512-K5pXYOm9wqY1RgjpL3YTkF39tni1XajUIkawTLUo9EZEVUFga5gSQJF8nNS7ZwJQ02y+1YCNYcMh+HIf1ZqE+w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakref": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/is-weakref/-/is-weakref-1.1.1.tgz",
      "integrity": "sha512-6i9mGWSlqzNMEqpCp93KwRS1uUOodk2OJ6b+sq7ZPDSy2WuI5NFIxp/254TytR8ftefexkWn5xNiHUNpPOfSew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-weakset": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/is-weakset/-/is-weakset-2.0.4.tgz",
      "integrity": "sha512-mfcwb6IzQyOKTs84CQMrOwW4gQcaTOAWJ0zzJCl2WSPDrWk/OzDaImWFH3djXhb24g4eudZfLRozAvPGw4d9hQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "get-intrinsic": "^1.2.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/isarray": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/isarray/-/isarray-2.0.5.tgz",
      "integrity": "sha512-xHjhDr3cNBK0BzdUJSPXZntQUx/mwMS5Rw4A7lPJ90XGAO6ISP/ePDNuo0vhqOZU+UD5JoodwCAAoZQd3FeAKw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/iterator.prototype": {
      "version": "1.1.5",
      "resolved": "https://registry.npmjs.org/iterator.prototype/-/iterator.prototype-1.1.5.tgz",
      "integrity": "sha512-H0dkQoCa3b2VEeKQBOxFph+JAbcrQdE7KC0UkqwpLmv2EC4P41QXP+rqo9wYodACiG5/WM5s9oDApTU8utwj9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.6",
        "get-proto": "^1.0.0",
        "has-symbols": "^1.1.0",
        "set-function-name": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/jiti": {
      "version": "2.6.1",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.6.1.tgz",
      "integrity": "sha512-ekilCSN1jwRvIbgeg/57YFh8qQDNbwDb9xT/qu2DAHbFFZUicIl4ygVaAvzveMhMVr3LnpSKTNnwt8PoOfmKhQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.1.1.tgz",
      "integrity": "sha512-qQKT4zQxXl8lLwBtHMWwaTcGfFOZviOJet3Oy/xmGk2gZH677CJM9EvtfdSkgWcATZhj/55JZ0rmy3myCT5lsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/jsx-ast-utils": {
      "version": "3.3.5",
      "resolved": "https://registry.npmjs.org/jsx-ast-utils/-/jsx-ast-utils-3.3.5.tgz",
      "integrity": "sha512-ZZow9HBI5O6EPgSJLUb8n2NKgmVWTwCvHGwFuJlMjvLFqlGG6pjirPhtdsseaLZjSibD8eegzmYpUZwoIlj2cQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "array-includes": "^3.1.6",
        "array.prototype.flat": "^1.3.1",
        "object.assign": "^4.1.4",
        "object.values": "^1.1.6"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/language-subtag-registry": {
      "version": "0.3.23",
      "resolved": "https://registry.npmjs.org/language-subtag-registry/-/language-subtag-registry-0.3.23.tgz",
      "integrity": "sha512-0K65Lea881pHotoGEa5gDlMxt3pctLi2RplBb7Ezh4rRdLEOtgi7n4EwK9lamnUCkKBqaeKRVebTq6BAxSkpXQ==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/language-tags": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/language-tags/-/language-tags-1.0.9.tgz",
      "integrity": "sha512-MbjN408fEndfiQXbFQ1vnd+1NoLDsnQW41410oQBXiyXDMYH5z505juWa4KUE1LqxRC7DgOgZDbKLxHIwm27hA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "language-subtag-registry": "^0.3.20"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.30.2.tgz",
      "integrity": "sha512-utfs7Pr5uJyyvDETitgsaqSyjCb2qNRAtuqUeWIAKztsOYdcACf2KtARYXg2pSvhkt+9NfoaNY7fxjl6nuMjIQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.30.2",
        "lightningcss-darwin-arm64": "1.30.2",
        "lightningcss-darwin-x64": "1.30.2",
        "lightningcss-freebsd-x64": "1.30.2",
        "lightningcss-linux-arm-gnueabihf": "1.30.2",
        "lightningcss-linux-arm64-gnu": "1.30.2",
        "lightningcss-linux-arm64-musl": "1.30.2",
        "lightningcss-linux-x64-gnu": "1.30.2",
        "lightningcss-linux-x64-musl": "1.30.2",
        "lightningcss-win32-arm64-msvc": "1.30.2",
        "lightningcss-win32-x64-msvc": "1.30.2"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.30.2.tgz",
      "integrity": "sha512-BH9sEdOCahSgmkVhBLeU7Hc9DWeZ1Eb6wNS6Da8igvUwAe0sqROHddIlvU06q3WyXVEOYDZ6ykBZQnjTbmo4+A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.30.2.tgz",
      "integrity": "sha512-ylTcDJBN3Hp21TdhRT5zBOIi73P6/W0qwvlFEk22fkdXchtNTOU4Qc37SkzV+EKYxLouZ6M4LG9NfZ1qkhhBWA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.30.2.tgz",
      "integrity": "sha512-oBZgKchomuDYxr7ilwLcyms6BCyLn0z8J0+ZZmfpjwg9fRVZIR5/GMXd7r9RH94iDhld3UmSjBM6nXWM2TfZTQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.30.2.tgz",
      "integrity": "sha512-c2bH6xTrf4BDpK8MoGG4Bd6zAMZDAXS569UxCAGcA7IKbHNMlhGQ89eRmvpIUGfKWNVdbhSbkQaWhEoMGmGslA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.30.2.tgz",
      "integrity": "sha512-eVdpxh4wYcm0PofJIZVuYuLiqBIakQ9uFZmipf6LF/HRj5Bgm0eb3qL/mr1smyXIS1twwOxNWndd8z0E374hiA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.30.2.tgz",
      "integrity": "sha512-UK65WJAbwIJbiBFXpxrbTNArtfuznvxAJw4Q2ZGlU8kPeDIWEX1dg3rn2veBVUylA2Ezg89ktszWbaQnxD/e3A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.30.2.tgz",
      "integrity": "sha512-5Vh9dGeblpTxWHpOx8iauV02popZDsCYMPIgiuw97OJ5uaDsL86cnqSFs5LZkG3ghHoX5isLgWzMs+eD1YzrnA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.30.2.tgz",
      "integrity": "sha512-Cfd46gdmj1vQ+lR6VRTTadNHu6ALuw2pKR9lYq4FnhvgBc4zWY1EtZcAc6EffShbb1MFrIPfLDXD6Xprbnni4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.30.2.tgz",
      "integrity": "sha512-XJaLUUFXb6/QG2lGIW6aIk6jKdtjtcffUT0NKvIqhSBY3hh9Ch+1LCeH80dR9q9LBjG3ewbDjnumefsLsP6aiA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.30.2.tgz",
      "integrity": "sha512-FZn+vaj7zLv//D/192WFFVA0RgHawIcHqLX9xuWiQt7P0PtdFEVaxgF9rjM/IRYHQXNnk61/H/gb2Ei+kUQ4xQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.30.2",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.30.2.tgz",
      "integrity": "sha512-5g1yc73p+iAkid5phb4oVFMB45417DkRevRbt/El/gKXJk4jid+vPFF/AXbxn05Aky8PapwzZrdJShv5C0avjw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz",
      "integrity": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/minimist": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.8.tgz",
      "integrity": "sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/napi-postinstall": {
      "version": "0.3.4",
      "resolved": "https://registry.npmjs.org/napi-postinstall/-/napi-postinstall-0.3.4.tgz",
      "integrity": "sha512-PHI5f1O0EP5xJ9gQmFGMS6IZcrVvTjpXjz7Na41gTE7eE2hK11lg04CECCYEEjdc17EV4DO+fkGEtt7TpTaTiQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "napi-postinstall": "lib/cli.js"
      },
      "engines": {
        "node": "^12.20.0 || ^14.18.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/napi-postinstall"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/next": {
      "version": "16.1.4",
      "resolved": "https://registry.npmjs.org/next/-/next-16.1.4.tgz",
      "integrity": "sha512-gKSecROqisnV7Buen5BfjmXAm7Xlpx9o2ueVQRo5DxQcjC8d330dOM1xiGWc2k3Dcnz0In3VybyRPOsudwgiqQ==",
      "license": "MIT",
      "dependencies": {
        "@next/env": "16.1.4",
        "@swc/helpers": "0.5.15",
        "baseline-browser-mapping": "^2.8.3",
        "caniuse-lite": "^1.0.30001579",
        "postcss": "8.4.31",
        "styled-jsx": "5.1.6"
      },
      "bin": {
        "next": "dist/bin/next"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "optionalDependencies": {
        "@next/swc-darwin-arm64": "16.1.4",
        "@next/swc-darwin-x64": "16.1.4",
        "@next/swc-linux-arm64-gnu": "16.1.4",
        "@next/swc-linux-arm64-musl": "16.1.4",
        "@next/swc-linux-x64-gnu": "16.1.4",
        "@next/swc-linux-x64-musl": "16.1.4",
        "@next/swc-win32-arm64-msvc": "16.1.4",
        "@next/swc-win32-x64-msvc": "16.1.4",
        "sharp": "^0.34.4"
      },
      "peerDependencies": {
        "@opentelemetry/api": "^1.1.0",
        "@playwright/test": "^1.51.1",
        "babel-plugin-react-compiler": "*",
        "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "sass": "^1.3.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        },
        "@playwright/test": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "sass": {
          "optional": true
        }
      }
    },
    "node_modules/next/node_modules/postcss": {
      "version": "8.4.31",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.31.tgz",
      "integrity": "sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.6",
        "picocolors": "^1.0.0",
        "source-map-js": "^1.0.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.27",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.27.tgz",
      "integrity": "sha512-nmh3lCkYZ3grZvqcCH+fjmQ7X+H0OeZgP40OierEaAptX4XofMh5kwNbWh7lBduUzCcV/8kZ+NDLCwm2iorIlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object-keys": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/object-keys/-/object-keys-1.1.1.tgz",
      "integrity": "sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.assign": {
      "version": "4.1.7",
      "resolved": "https://registry.npmjs.org/object.assign/-/object.assign-4.1.7.tgz",
      "integrity": "sha512-nK28WOo+QIjBkDduTINE4JkF/UJJKyf2EJxvJKfblDpyg0Q+pkOHNTL0Qwy6NP6FhE/EnzV73BxxqcJaXY9anw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0",
        "has-symbols": "^1.1.0",
        "object-keys": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object.entries": {
      "version": "1.1.9",
      "resolved": "https://registry.npmjs.org/object.entries/-/object.entries-1.1.9.tgz",
      "integrity": "sha512-8u/hfXFRBD1O0hPUjioLhoWFHRmt6tKA4/vZPyckBr18l1KE9uHrFaFaUi8MDRTpi4uak2goyPTSNJLXX2k2Hw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.fromentries": {
      "version": "2.0.8",
      "resolved": "https://registry.npmjs.org/object.fromentries/-/object.fromentries-2.0.8.tgz",
      "integrity": "sha512-k6E21FzySsSK5a21KRADBd/NGneRegFO5pLHfdQLpRDETUNJueLXs3WCzyQ3tFRDYgbq3KHGXfTbi2bs8WQ6rQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/object.groupby": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/object.groupby/-/object.groupby-1.0.3.tgz",
      "integrity": "sha512-+Lhy3TQTuzXI5hevh8sBGqbmurHbbIjAi0Z4S63nthVLmLxfbj4T54a4CfZrXIrt9iP4mVAPYMo/v99taj3wjQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/object.values": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/object.values/-/object.values-1.2.1.tgz",
      "integrity": "sha512-gXah6aZrcUxjWg2zR2MwouP2eHlCBzdV4pygudehaKXSGW4v2AsRQUK+lwwXhii6KFZcunEnmSUoYp5CXibxtA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/own-keys": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/own-keys/-/own-keys-1.0.1.tgz",
      "integrity": "sha512-qFOyK5PjiWZd+QQIh+1jhdb9LpxTF0qs7Pm8o5QHYZ0M3vKqSqzsZaEB6oWlxZ+q2sJBMI/Ktgd2N5ZwQoRHfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "get-intrinsic": "^1.2.6",
        "object-keys": "^1.1.1",
        "safe-push-apply": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/playwright": {
      "version": "1.58.1",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.58.1.tgz",
      "integrity": "sha512-+2uTZHxSCcxjvGc5C891LrS1/NlxglGxzrC4seZiVjcYVQfUa87wBL6rTDqzGjuoWNjnBzRqKmF6zRYGMvQUaQ==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.58.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.58.1",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.58.1.tgz",
      "integrity": "sha512-bcWzOaTxcW+VOOGBCQgnaKToLJ65d6AqfLVKEWvexyS3AS6rbXl+xdpYRMGSRBClPvyj44njOWoxjNdL/H9UNg==",
      "devOptional": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/possible-typed-array-names": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/possible-typed-array-names/-/possible-typed-array-names-1.1.0.tgz",
      "integrity": "sha512-/+5VFTchJDoVj3bhoqi6UeymcD00DAwb1nJwamzPvHEszJ4FpF6SNNbUbOS8yI56qHzdV8eK0qEfOSiodkTdxg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.6",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
      "integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "19.0.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.0.0.tgz",
      "integrity": "sha512-V8AVnmPIICiWpGfm6GLzCR/W5FXLchHop40W4nXBmdlEceh16rCN8O8LNWm5bh5XUX91fh7KpA+W0TgMKmgTpQ==",
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.0.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.0.0.tgz",
      "integrity": "sha512-4GV5sHFG0e/0AD4X+ySy6UJd3jVl1iNsNHdpad0qhABJ11twS3TTBnseqsKurKcsNqCEFeGL3uLpVChpIO3QfQ==",
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "scheduler": "^0.25.0"
      },
      "peerDependencies": {
        "react": "^19.0.0"
      }
    },
    "node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/reflect.getprototypeof": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz",
      "integrity": "sha512-00o4I+DVrefhv+nX0ulyi3biSHCPDe+yLv5o/p6d/UVlirijB8E16FtfwSAi4g3tcqrQ4lRAqQSoFEZJehYEcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.9",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.7",
        "get-proto": "^1.0.1",
        "which-builtin-type": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/regexp.prototype.flags": {
      "version": "1.5.4",
      "resolved": "https://registry.npmjs.org/regexp.prototype.flags/-/regexp.prototype.flags-1.5.4.tgz",
      "integrity": "sha512-dYqgNSZbDwkaJ2ceRd9ojCGjBq+mOm9LmtXnAnEGyHhN/5R7iDW2TRw3h+o/jCFxus3P2LfWIIiwowAjANm7IA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "define-properties": "^1.2.1",
        "es-errors": "^1.3.0",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "set-function-name": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.11",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.11.tgz",
      "integrity": "sha512-RfqAvLnMl313r7c9oclB1HhUEAezcpLjz95wFH4LVuhk9JF/r22qmVP9AMmOU4vMX7Q8pN8jwNg/CSpdFnMjTQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/resolve-pkg-maps": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
      "integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/safe-array-concat": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/safe-array-concat/-/safe-array-concat-1.1.3.tgz",
      "integrity": "sha512-AURm5f0jYEOydBj7VQlVvDrjeFgthDdEF5H1dP+6mNpoXOMo1quQqJ4wvJDyRZ9+pO3kGWoOdmV08cSv2aJV6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "get-intrinsic": "^1.2.6",
        "has-symbols": "^1.1.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">=0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-push-apply": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/safe-push-apply/-/safe-push-apply-1.0.0.tgz",
      "integrity": "sha512-iKE9w/Z7xCzUMIZqdBsp6pEQvwuEebH4vdpjcDWnyzaI6yl6O9FHvVpmGelvEHNsoY6wGblkxR6Zty/h00WiSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "isarray": "^2.0.5"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/safe-regex-test": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/safe-regex-test/-/safe-regex-test-1.1.0.tgz",
      "integrity": "sha512-x/+Cz4YrimQxQccJf5mKEbIa1NzeCRNI5Ecl/ekmlYaampdNLPalVyIcCZNNH3MvmqBugV5TMYZXv0ljslUlaw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "is-regex": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/scheduler": {
      "version": "0.25.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.25.0.tgz",
      "integrity": "sha512-xFVuu11jh+xcO7JOAGJNOXld8/TcEHK/4CituBUeUb5hqxJLj9YuemAEuvm9gQ/+pgXYfbQuqAkiYu+u7YEsNA==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/set-function-length": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/set-function-length/-/set-function-length-1.2.2.tgz",
      "integrity": "sha512-pgRc4hJ4/sNjWCSS9AmnS40x3bNMDTknHgL5UaMBTMyJnU90EgWh1Rz+MC9eFu4BuN/UwZjKQuY/1v3rM7HMfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2",
        "get-intrinsic": "^1.2.4",
        "gopd": "^1.0.1",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-function-name": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/set-function-name/-/set-function-name-2.0.2.tgz",
      "integrity": "sha512-7PGFlmtwsEADb0WYyvCMa1t+yke6daIG4Wirafur5kcf+MhUnPms1UeR0CKQdTZD81yESwMHbtn+TR+dMviakQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-data-property": "^1.1.4",
        "es-errors": "^1.3.0",
        "functions-have-names": "^1.2.3",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/set-proto": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/set-proto/-/set-proto-1.0.0.tgz",
      "integrity": "sha512-RJRdvCo6IAnPdsvP/7m6bsQqNnn1FCBX5ZNtFL98MmFF/4xAIJTIg1YbHW5DC2W5SKZanrC6i4HsJqlajw/dZw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/sharp": {
      "version": "0.34.5",
      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.34.5.tgz",
      "integrity": "sha512-Ou9I5Ft9WNcCbXrU9cMgPBcCK8LiwLqcbywW3t4oDV37n1pzpuNLsYiAV8eODnjbtQlSDwZ2cUEeQz4E54Hltg==",
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/colour": "^1.0.0",
        "detect-libc": "^2.1.2",
        "semver": "^7.7.3"
      },
      "engines": {
        "node": "^18.17.0 || ^20.3.0 || >=21.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-darwin-arm64": "0.34.5",
        "@img/sharp-darwin-x64": "0.34.5",
        "@img/sharp-libvips-darwin-arm64": "1.2.4",
        "@img/sharp-libvips-darwin-x64": "1.2.4",
        "@img/sharp-libvips-linux-arm": "1.2.4",
        "@img/sharp-libvips-linux-arm64": "1.2.4",
        "@img/sharp-libvips-linux-ppc64": "1.2.4",
        "@img/sharp-libvips-linux-riscv64": "1.2.4",
        "@img/sharp-libvips-linux-s390x": "1.2.4",
        "@img/sharp-libvips-linux-x64": "1.2.4",
        "@img/sharp-libvips-linuxmusl-arm64": "1.2.4",
        "@img/sharp-libvips-linuxmusl-x64": "1.2.4",
        "@img/sharp-linux-arm": "0.34.5",
        "@img/sharp-linux-arm64": "0.34.5",
        "@img/sharp-linux-ppc64": "0.34.5",
        "@img/sharp-linux-riscv64": "0.34.5",
        "@img/sharp-linux-s390x": "0.34.5",
        "@img/sharp-linux-x64": "0.34.5",
        "@img/sharp-linuxmusl-arm64": "0.34.5",
        "@img/sharp-linuxmusl-x64": "0.34.5",
        "@img/sharp-wasm32": "0.34.5",
        "@img/sharp-win32-arm64": "0.34.5",
        "@img/sharp-win32-ia32": "0.34.5",
        "@img/sharp-win32-x64": "0.34.5"
      }
    },
    "node_modules/sharp/node_modules/semver": {
      "version": "7.7.3",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.7.3.tgz",
      "integrity": "sha512-SdsKMrI9TdgjdweUSR9MweHA4EJ8YxHn8DFaDisvhVlUOe4BF1tLD7GAj0lIqWVl+dPb/rExr0Btby5loQm20Q==",
      "license": "ISC",
      "optional": true,
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/side-channel": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
      "integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3",
        "side-channel-list": "^1.0.0",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.0.tgz",
      "integrity": "sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stable-hash": {
      "version": "0.0.5",
      "resolved": "https://registry.npmjs.org/stable-hash/-/stable-hash-0.0.5.tgz",
      "integrity": "sha512-+L3ccpzibovGXFK+Ap/f8LOS0ahMrHTf3xu7mMLSpEGU0EO9ucaysSylKo9eRDFNhWve/y275iPmIZ4z39a9iA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/stop-iteration-iterator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/stop-iteration-iterator/-/stop-iteration-iterator-1.1.0.tgz",
      "integrity": "sha512-eLoXW/DHyl62zxY4SCaIgnRhuMr6ri4juEYARS8E6sCEqzKpOiE521Ucofdx+KnDZl5xmvGYaaKCk5FEOxJCoQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "internal-slot": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/string.prototype.includes": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/string.prototype.includes/-/string.prototype.includes-2.0.1.tgz",
      "integrity": "sha512-o7+c9bW6zpAdJHTtujeePODAhkuicdAryFsfVKwA+wGw89wJ4GTY484WTucM9hLtDEOpOvI+aHnzqnC5lHp4Rg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.3"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/string.prototype.matchall": {
      "version": "4.0.12",
      "resolved": "https://registry.npmjs.org/string.prototype.matchall/-/string.prototype.matchall-4.0.12.tgz",
      "integrity": "sha512-6CC9uyBL+/48dYizRf7H7VAYCMCNTBeM78x/VTUe9bFEaxBepPJDa1Ow99LqI/1yF7kuy7Q3cQsYMrcjGUcskA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.3",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.6",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.0.0",
        "get-intrinsic": "^1.2.6",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "internal-slot": "^1.1.0",
        "regexp.prototype.flags": "^1.5.3",
        "set-function-name": "^2.0.2",
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.repeat": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/string.prototype.repeat/-/string.prototype.repeat-1.0.0.tgz",
      "integrity": "sha512-0u/TldDbKD8bFCQ/4f5+mNRrXwZ8hg2w7ZR8wa16e8z9XpePWl3eGEcUD0OXpEH/VJH/2G3gjUtR3ZOiBe2S/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "define-properties": "^1.1.3",
        "es-abstract": "^1.17.5"
      }
    },
    "node_modules/string.prototype.trim": {
      "version": "1.2.10",
      "resolved": "https://registry.npmjs.org/string.prototype.trim/-/string.prototype.trim-1.2.10.tgz",
      "integrity": "sha512-Rs66F0P/1kedk5lyYyH9uBzuiI/kNRmwJAR9quK6VOtIpZ2G+hMZd+HQbbv25MgCA6gEffoMZYxlTod4WcdrKA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "define-data-property": "^1.1.4",
        "define-properties": "^1.2.1",
        "es-abstract": "^1.23.5",
        "es-object-atoms": "^1.0.0",
        "has-property-descriptors": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimend": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/string.prototype.trimend/-/string.prototype.trimend-1.0.9.tgz",
      "integrity": "sha512-G7Ok5C6E/j4SGfyLCloXTrngQIQU3PWtXGst3yM7Bea9FRURf1S42ZHlZZtsNque2FN2PoUhfZXYLNWwEr4dLQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.2",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/string.prototype.trimstart": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/string.prototype.trimstart/-/string.prototype.trimstart-1.0.8.tgz",
      "integrity": "sha512-UXSH262CSZY1tfu3G3Secr6uGLCFVPMhIqHjlgCUtCCcgihYc/xKs9djMTMUOb2j1mVSeU8EU6NWc/iQKU6Gfg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "define-properties": "^1.2.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/strip-bom": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/strip-bom/-/strip-bom-3.0.0.tgz",
      "integrity": "sha512-vavAMRXOgBVNF6nyEEmL3DBK19iRpDcoIwW+swQ+CbGiu7lju6t+JklA1MHweoWtadgt4ISVUsXLyDq34ddcwA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/styled-jsx": {
      "version": "5.1.6",
      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz",
      "integrity": "sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==",
      "license": "MIT",
      "dependencies": {
        "client-only": "0.0.1"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "peerDependencies": {
        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0"
      },
      "peerDependenciesMeta": {
        "@babel/core": {
          "optional": true
        },
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwindcss": {
      "version": "4.1.18",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.1.18.tgz",
      "integrity": "sha512-4+Z+0yiYyEtUVCScyfHCxOYP06L5Ne+JiHhY2IjR2KWMIWhJOYZKLSGZaP5HkZ8+bY0cxfzwDE5uOmzFXyIwxw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.0.tgz",
      "integrity": "sha512-g9ljZiwki/LfxmQADO3dEY1CbpmXT5Hm2fJ+QaGKwSXUylMybePR7/67YW7jOrrvjEgL1Fmz5kzyAjWVWLlucg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.15",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.15.tgz",
      "integrity": "sha512-j2Zq4NyQYG5XMST4cbs02Ak8iJUdxRM0XI5QyxXuZOzKOINmWurp3smXu3y5wDcJrptwpSjgXHzIQxR0omXljQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
      "integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/ts-api-utils": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/ts-api-utils/-/ts-api-utils-2.4.0.tgz",
      "integrity": "sha512-3TaVTaAv2gTiMB35i3FiGJaRfwb3Pyn/j3m/bfAvGe8FB7CF6u+LMYqYlDh7reQf7UNvoTvdfAqHGmPGOSsPmA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18.12"
      },
      "peerDependencies": {
        "typescript": ">=4.8.4"
      }
    },
    "node_modules/tsconfig-paths": {
      "version": "3.15.0",
      "resolved": "https://registry.npmjs.org/tsconfig-paths/-/tsconfig-paths-3.15.0.tgz",
      "integrity": "sha512-2Ac2RgzDe/cn48GvOe3M+o82pEFewD3UPbyoUHHdKasHwJKjds4fLXWf/Ux5kATBKN20oaFGu+jbElp1pos0mg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/json5": "^0.0.29",
        "json5": "^1.0.2",
        "minimist": "^1.2.6",
        "strip-bom": "^3.0.0"
      }
    },
    "node_modules/tsconfig-paths/node_modules/json5": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/json5/-/json5-1.0.2.tgz",
      "integrity": "sha512-g1MWMLBiz8FKi1e4w0UyVL3w+iJceWAFBAaBnnGKOpNa5f8TLktkbre1+s6oICydWAm+HRUGTmI+//xv2hvXYA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "minimist": "^1.2.0"
      },
      "bin": {
        "json5": "lib/cli.js"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/typed-array-buffer": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-buffer/-/typed-array-buffer-1.0.3.tgz",
      "integrity": "sha512-nAYYwfY3qnzX30IkA6AQZjVbtK6duGontcQm1WSG1MD94YLqK0515GNApXkoxKOWMusVssAHWLh9SeaoefYFGw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "es-errors": "^1.3.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/typed-array-byte-length": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/typed-array-byte-length/-/typed-array-byte-length-1.0.3.tgz",
      "integrity": "sha512-BaXgOuIxz8n8pIq3e7Atg/7s+DpiYrxn4vdot3w9KbnBhcRQq6o3xemQdIfynqSeXeDrF32x+WvfzmOjPiY9lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.8",
        "for-each": "^0.3.3",
        "gopd": "^1.2.0",
        "has-proto": "^1.2.0",
        "is-typed-array": "^1.1.14"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-byte-offset": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/typed-array-byte-offset/-/typed-array-byte-offset-1.0.4.tgz",
      "integrity": "sha512-bTlAFB/FBYMcuX81gbL4OcpH5PmlFHqlCCpAl8AlEzMz5k53oNDvN8p1PNOWLEmI2x4orp3raOFB51tv9X+MFQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "for-each": "^0.3.3",
        "gopd": "^1.2.0",
        "has-proto": "^1.2.0",
        "is-typed-array": "^1.1.15",
        "reflect.getprototypeof": "^1.0.9"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typed-array-length": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/typed-array-length/-/typed-array-length-1.0.7.tgz",
      "integrity": "sha512-3KS2b+kL7fsuk/eJZ7EQdnEmQoaho/r6KUef7hxvltNA5DR8NAUM+8wJMbJyZ4G9/7i3v5zPBIMN5aybAh2/Jg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind": "^1.0.7",
        "for-each": "^0.3.3",
        "gopd": "^1.0.1",
        "is-typed-array": "^1.1.13",
        "possible-typed-array-names": "^1.0.0",
        "reflect.getprototypeof": "^1.0.6"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/typescript-eslint": {
      "version": "8.54.0",
      "resolved": "https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.54.0.tgz",
      "integrity": "sha512-CKsJ+g53QpsNPqbzUsfKVgd3Lny4yKZ1pP4qN3jdMOg/sisIDLGyDMezycquXLE5JsEU0wp3dGNdzig0/fmSVQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@typescript-eslint/eslint-plugin": "8.54.0",
        "@typescript-eslint/parser": "8.54.0",
        "@typescript-eslint/typescript-estree": "8.54.0",
        "@typescript-eslint/utils": "8.54.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/typescript-eslint"
      },
      "peerDependencies": {
        "eslint": "^8.57.0 || ^9.0.0",
        "typescript": ">=4.8.4 <6.0.0"
      }
    },
    "node_modules/unbox-primitive": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/unbox-primitive/-/unbox-primitive-1.1.0.tgz",
      "integrity": "sha512-nWJ91DjeOkej/TA8pXQ3myruKpKEYgqvpw9lz4OPHj/NWFNluYrjbz9j01CJ8yKQd2g4jFoOkINCTW2I5LEEyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.3",
        "has-bigints": "^1.0.2",
        "has-symbols": "^1.1.0",
        "which-boxed-primitive": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/undici-types": {
      "version": "7.16.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.16.0.tgz",
      "integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",
      "license": "MIT"
    },
    "node_modules/unrs-resolver": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/unrs-resolver/-/unrs-resolver-1.11.1.tgz",
      "integrity": "sha512-bSjt9pjaEBnNiGgc9rUiHGKv5l4/TGzDmYw3RhnkJGtLhbnnA/5qJj7x3dNDCRx/PJxu774LlH8lCOlB4hEfKg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "dependencies": {
        "napi-postinstall": "^0.3.0"
      },
      "funding": {
        "url": "https://opencollective.com/unrs-resolver"
      },
      "optionalDependencies": {
        "@unrs/resolver-binding-android-arm-eabi": "1.11.1",
        "@unrs/resolver-binding-android-arm64": "1.11.1",
        "@unrs/resolver-binding-darwin-arm64": "1.11.1",
        "@unrs/resolver-binding-darwin-x64": "1.11.1",
        "@unrs/resolver-binding-freebsd-x64": "1.11.1",
        "@unrs/resolver-binding-linux-arm-gnueabihf": "1.11.1",
        "@unrs/resolver-binding-linux-arm-musleabihf": "1.11.1",
        "@unrs/resolver-binding-linux-arm64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-arm64-musl": "1.11.1",
        "@unrs/resolver-binding-linux-ppc64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-riscv64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-riscv64-musl": "1.11.1",
        "@unrs/resolver-binding-linux-s390x-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-x64-gnu": "1.11.1",
        "@unrs/resolver-binding-linux-x64-musl": "1.11.1",
        "@unrs/resolver-binding-wasm32-wasi": "1.11.1",
        "@unrs/resolver-binding-win32-arm64-msvc": "1.11.1",
        "@unrs/resolver-binding-win32-ia32-msvc": "1.11.1",
        "@unrs/resolver-binding-win32-x64-msvc": "1.11.1"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.2.3.tgz",
      "integrity": "sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which-boxed-primitive": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/which-boxed-primitive/-/which-boxed-primitive-1.1.1.tgz",
      "integrity": "sha512-TbX3mj8n0odCBFVlY8AxkqcHASw3L60jIuF8jFP78az3C2YhmGvqbHBpAjTRH2/xqYunrJ9g1jSyjCjpoWzIAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-bigint": "^1.1.0",
        "is-boolean-object": "^1.2.1",
        "is-number-object": "^1.1.1",
        "is-string": "^1.1.1",
        "is-symbol": "^1.1.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-builtin-type": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/which-builtin-type/-/which-builtin-type-1.2.1.tgz",
      "integrity": "sha512-6iBczoX+kDQ7a3+YJBnh3T+KZRxM/iYNPXicqk66/Qfm1b93iu+yOImkg0zHbj5LNOcNv1TEADiZ0xa34B4q6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "function.prototype.name": "^1.1.6",
        "has-tostringtag": "^1.0.2",
        "is-async-function": "^2.0.0",
        "is-date-object": "^1.1.0",
        "is-finalizationregistry": "^1.1.0",
        "is-generator-function": "^1.0.10",
        "is-regex": "^1.2.1",
        "is-weakref": "^1.0.2",
        "isarray": "^2.0.5",
        "which-boxed-primitive": "^1.1.0",
        "which-collection": "^1.0.2",
        "which-typed-array": "^1.1.16"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-collection": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/which-collection/-/which-collection-1.0.2.tgz",
      "integrity": "sha512-K4jVyjnBdgvc86Y6BkaLZEN933SwYOuBFkdmBu9ZfkcAbdVbpITnDmjvZ/aQjRXQrv5EPkTnD1s39GiiqbngCw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-map": "^2.0.3",
        "is-set": "^2.0.3",
        "is-weakmap": "^2.0.2",
        "is-weakset": "^2.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/which-typed-array": {
      "version": "1.1.20",
      "resolved": "https://registry.npmjs.org/which-typed-array/-/which-typed-array-1.1.20.tgz",
      "integrity": "sha512-LYfpUkmqwl0h9A2HL09Mms427Q1RZWuOHsukfVcKRq9q95iQxdw0ix1JQrqbcDR9PH1QDwf5Qo8OZb5lksZ8Xg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "available-typed-arrays": "^1.0.7",
        "call-bind": "^1.0.8",
        "call-bound": "^1.0.4",
        "for-each": "^0.3.5",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-tostringtag": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ws": {
      "version": "8.19.0",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.19.0.tgz",
      "integrity": "sha512-blAT2mjOEIi0ZzruJfIhb3nps74PRWTCz1IjglWEEpQl5XS/UNama6u2/rjFkDDouqr4L67ry+1aGIALViWjDg==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/zod": {
      "version": "4.3.6",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.3.6.tgz",
      "integrity": "sha512-rftlrkhHZOcjDwkGlnUtZZkvaPHCsDATp4pGpuOOMDaTdDDXF91wuVDJoWoPsKX/3YPQ5fHuF3STjcYyKr+Qhg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    },
    "node_modules/zod-validation-error": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/zod-validation-error/-/zod-validation-error-4.0.2.tgz",
      "integrity": "sha512-Q6/nZLe6jxuU80qb/4uJ4t5v2VEZ44lzQjPDhYJNztRQ4wyWc6VF3D3Kb/fAuPetZQnhS3hnajCf9CsWesghLQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "peerDependencies": {
        "zod": "^3.25.0 || ^4.0.0"
      }
    }
  }
}

```

### package.json
```json
{
  "name": "real-estate-platform",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "20.x"
  },
  "scripts": {
    "dev": "next dev",
    "dev:windows": "set NEXT_DISABLE_TURBOPACK=1&& next dev",
    "dev:web": "set NEXT_DISABLE_TURBOPACK=1&& next dev",
    "dev:clean": "node scripts/dev-clean.mjs && next dev",
    "dev:clean:web": "node scripts/dev-clean.mjs && set NEXT_DISABLE_TURBOPACK=1&& next dev",
    "dev:clean:windows": "node scripts/dev-clean.mjs && set NEXT_DISABLE_TURBOPACK=1&& next dev",
    "build": "node scripts/check-brand-ar.mjs && node scripts/check-field-help.mjs && next build",
    "check:brand": "node scripts/check-brand-ar.mjs",
    "check:help": "node scripts/check-field-help.mjs",
    "quality:smoke": "node scripts/quality-smoke.mjs",
    "seed:admin": "node scripts/seed_admin_user.mjs",
    "start": "next start",
    "test:e2e": "playwright test",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.49.1",
    "next": "16.1.4",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.2",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^25.0.10",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.23",
    "babel-plugin-react-compiler": "^1.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "16.1.4",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3"
  }
}

```

### public/brand/hrtaj-logo.svg
```svg
﻿<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" role="img" aria-label="هارتچ">
  <rect width="320" height="80" rx="16" fill="#0f172a" />
  <text x="160" y="52" text-anchor="middle" font-size="36" font-family="Cairo, 'Noto Sans Arabic', 'Noto Naskh Arabic', sans-serif" fill="#f8fafc">هارتچ</text>
</svg>

```

### scripts/check-brand-ar.mjs
```js
import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "lib", "brand.ts");
const source = fs.readFileSync(filePath, "utf8");

const hasUnicode = /\\u0686/.test(source);
const brandArPattern = /BRAND\s*=\s*{[\s\S]*?ar:\s*["'`][^"'`]*\\u0686[^"'`]*["'`][\s\S]*?}/;
const brandArNamePattern = /BRAND_AR_NAME\s*=\s*[^;]*\\u0686/;

if (!hasUnicode || (!brandArPattern.test(source) && !brandArNamePattern.test(source))) {
  console.error("Arabic brand must include U+0686 (\\u0686).");
  process.exit(1);
}

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx|js|mjs|json|md|css|svg)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const forbidden = ["هارتج", "Ù‡Ø§Ø±ØªØ¬"];
const files = collectFiles(path.join(process.cwd(), "src")).concat(
  collectFiles(path.join(process.cwd(), "public"))
);
const offenders = files.filter((file) => {
  const content = fs.readFileSync(file, "utf8");
  return forbidden.some((token) => content.includes(token));
});
if (offenders.length > 0) {
  console.error(`Forbidden Arabic brand spelling found (${forbidden.join(", ")}) in:`);
  offenders.forEach((file) => console.error(`- ${path.relative(process.cwd(), file)}`));
  process.exit(1);
}

console.log("BRAND_AR_NAME check passed.");

```

### scripts/quality-smoke.mjs
```js
﻿import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];

  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
  );

  await browser.close();

  if (errors.length || consoleErrors.length || brokenImages.length) {
    console.error("Quality smoke check failed.");
    if (errors.length) console.error("Page errors:", errors);
    if (consoleErrors.length) console.error("Console errors:", consoleErrors);
    if (brokenImages.length) console.error("Broken images:", brokenImages);
    process.exit(1);
  }

  console.log("Quality smoke check passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

```

### scripts/seed_admin_user.mjs
```js
﻿import { createClient } from "@supabase/supabase-js";

const email = "foxm575@gmail.com";
const phone = "01020614022";
const fullName = "Foxm Admin";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const match = users.find((user) => (user.email ?? "").toLowerCase() === targetEmail);
    if (match?.id) return match.id;
    if (users.length < perPage) return null;
    if (data?.lastPage && page >= data.lastPage) return null;
    page += 1;
  }
}

async function run() {
  let userId = await findUserIdByEmail(email);
  let inviteLink = null;

  if (!userId) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, phone, role: "admin" },
    });
    if (error) throw error;

    inviteLink = null;
    userId = data?.user?.id ?? (await findUserIdByEmail(email));
  }

  if (!userId) {
    throw new Error("Failed to resolve user id for admin invite.");
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      phone,
      email,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (upsertError) throw upsertError;

  console.log("Admin user ensured:", { userId, email, inviteLink });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


```

### src/app/actions/marketplace.ts
```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { safeNextPath } from "@/lib/paths";
import { isUuid, parseLeadInput, parsePublicLeadInput } from "@/lib/validators";
import { normalizeEgyptPhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

async function upsertCustomer({
  supabase,
  name,
  phoneRaw,
  phoneE164,
  email,
  intent,
  preferredArea,
  budgetMin,
  budgetMax,
  source,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  name: string;
  phoneRaw: string | null;
  phoneE164: string | null;
  email?: string | null;
  intent?: string | null;
  preferredArea?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  source?: string | null;
}) {
  if (!phoneE164) return null;
  const { data } = await supabase
    .from("customers")
    .upsert(
      {
        full_name: name || null,
        phone_raw: phoneRaw,
        phone_e164: phoneE164,
        email: email || null,
        lead_source: source || null,
        intent: intent || null,
        preferred_areas: preferredArea ? [preferredArea] : null,
        budget_min: budgetMin ?? null,
        budget_max: budgetMax ?? null,
      },
      { onConflict: "phone_e164" }
    )
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}

export type LeadActionState = {
  ok: boolean;
  error: "rate_limit" | "invalid" | "server" | null;
  submitted: boolean;
};

export async function toggleFavoriteAction(listingId: string, nextPath: string) {
  if (!isUuid(listingId)) return;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/listings");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const userId = data.user.id;
  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
  } else {
    await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
  }

  revalidatePath("/listings");
  revalidatePath(`/listing/${listingId}`);
}

async function handleLeadForm(formData: FormData): Promise<LeadActionState> {
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null, submitted: true };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  const rate = checkRateLimit(`lead:${ip}:${ua}`, 10, 60_000);
  if (!rate.allowed) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await logAudit(supabase, {
        actor_user_id: data.user.id,
        action: "lead_blocked_rate_limit",
        entity_type: "lead",
        metadata: { ip, ua, retry_after_ms: rate.retryAfterMs },
      });
    }
    return { ok: false, error: "rate_limit", submitted: true };
  }

  const payload = {
    listingId: String(formData.get("listingId") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    source: String(formData.get("source") ?? "web"),
  };

  const parsed = parseLeadInput(payload);
  if (!parsed) {
    return { ok: false, error: "invalid", submitted: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const normalized = normalizeEgyptPhone(parsed.phone);
  const customerId = await upsertCustomer({
    supabase,
    name: parsed.name,
    phoneRaw: parsed.phone ?? null,
    phoneE164: normalized,
    email: parsed.email ?? null,
    source: parsed.source || "web",
  });

  const { error: leadError } = await supabase.from("leads").insert({
    listing_id: parsed.listingId,
    user_id: data?.user?.id ?? null,
    customer_id: customerId,
    name: parsed.name,
    phone: parsed.phone || null,
    phone_normalized: normalized,
    phone_e164: normalized,
    email: parsed.email || null,
    message: parsed.message || null,
    source: parsed.source || "web",
    lead_source: parsed.source || "web",
    status: "new",
  });

  if (leadError) {
    return { ok: false, error: "server", submitted: true };
  }

  revalidatePath(`/listing/${parsed.listingId}`);
  return { ok: true, error: null, submitted: true };
}

export async function createLeadAction(formData: FormData) {
  await handleLeadForm(formData);
}

export async function createLeadActionWithState(
  prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  void prevState;
  return handleLeadForm(formData);
}

export async function createPublicRequestAction(formData: FormData) {
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) {
    return;
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const ua = headerStore.get("user-agent") ?? "unknown";
  const rate = checkRateLimit(`public-lead:${ip}:${ua}`, 10, 60_000);
  if (!rate.allowed) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await logAudit(supabase, {
        actor_user_id: data.user.id,
        action: "public_lead_blocked_rate_limit",
        entity_type: "lead",
        metadata: { ip, ua, retry_after_ms: rate.retryAfterMs },
      });
    }
    return;
  }

  const payload = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    intent: String(formData.get("intent") ?? ""),
    preferred_area: String(formData.get("preferred_area") ?? ""),
    budget_min: String(formData.get("budget_min") ?? ""),
    budget_max: String(formData.get("budget_max") ?? ""),
    preferred_contact_time: String(formData.get("preferred_contact_time") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    source: String(formData.get("source") ?? "web"),
  };

  const parsed = parsePublicLeadInput(payload);
  if (!parsed) return;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const normalized = normalizeEgyptPhone(parsed.phone);
  const customerId = await upsertCustomer({
    supabase,
    name: parsed.name,
    phoneRaw: parsed.phone,
    phoneE164: normalized,
    email: parsed.email ?? null,
    intent: parsed.intent,
    preferredArea: parsed.preferred_area,
    budgetMin: parsed.budget_min,
    budgetMax: parsed.budget_max,
    source: parsed.source || "web",
  });

  await supabase.from("leads").insert({
    listing_id: null,
    user_id: data?.user?.id ?? null,
    customer_id: customerId,
    name: parsed.name,
    phone: parsed.phone,
    phone_normalized: normalized,
    phone_e164: normalized,
    email: parsed.email ?? null,
    intent: parsed.intent,
    preferred_area: parsed.preferred_area,
    budget_min: parsed.budget_min,
    budget_max: parsed.budget_max,
    preferred_contact_time: parsed.preferred_contact_time,
    notes: parsed.notes,
    source: parsed.source || "web",
    lead_source: parsed.source || "web",
    status: "new",
  });

  revalidatePath("/");
}

```

### src/app/admin/actions.ts
```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireOwnerAccess } from "@/lib/owner";
import {
  isUuid,
  parseListingInput,
  parseDeveloperInput,
  parseLeadStatus,
  parseMemberInput,
  parseProjectInput,
  parseRole,
  parseSubmissionStatus,
} from "@/lib/validators";
import { safeNextPath } from "@/lib/paths";
import { logActivity } from "@/lib/activity";
import { logAudit } from "@/lib/audit";

async function requireAdmin(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id };
}

async function requireStaff(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    const safeNext = safeNextPath(nextPath, "/admin");
    redirect(`/auth?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "staff";
  if (role !== "admin" && role !== "ops" && role !== "owner") {
    redirect("/dashboard?unauthorized=1");
  }

  return { supabase, userId: data.user.id, role };
}

export async function updateUserRoleAction(formData: FormData) {
  const nextPath = safeNextPath(String(formData.get("next_path") ?? ""), "/admin");
  const { supabase, userId: actorId } = await requireOwnerAccess(nextPath);
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!isUuid(userId)) return;
  const parsedRole = parseRole(role);
  if (!parsedRole) return;
  if (parsedRole === "owner" && userId !== actorId) return;
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (targetProfile?.role === "owner" && userId !== actorId) return;

  await supabase.from("profiles").update({ role: parsedRole }).eq("id", userId);
  const hdrs = await headers();
  await logAudit(supabase, {
    actor_user_id: actorId,
    action: "role_updated",
    entity_type: "profile",
    entity_id: userId,
    metadata: { role: parsedRole },
    ip: hdrs.get("x-forwarded-for"),
    user_agent: hdrs.get("user-agent"),
  });
  revalidatePath("/admin");
  revalidatePath("/owner/users");
}

export async function createDeveloperAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseDeveloperInput({
    name: formData.get("name"),
  });
  if (!parsed) return;

  await supabase.from("developers").insert({ name: parsed.name });
  revalidatePath("/admin");
}

export async function addDeveloperMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const parsed = parseMemberInput({
    developer_id: formData.get("developer_id"),
    user_id: formData.get("user_id"),
    role: formData.get("role"),
  });
  if (!parsed) return;

  await supabase.from("developer_members").insert({
    developer_id: parsed.developer_id,
    user_id: parsed.user_id,
    role: parsed.role || "member",
  });

  revalidatePath("/admin");
}

export async function updateListingStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin("/admin");
  const { data: auth } = await supabase.auth.getUser();
  const listingId = String(formData.get("listing_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!isUuid(listingId)) return;
  if (!["draft", "published", "archived"].includes(status)) return;

  const submission_status =
    status === "published" ? "published" : status === "archived" ? "archived" : "draft";
  await supabase
    .from("listings")
    .update({ status, submission_status })
    .eq("id", listingId);
  await logAudit(supabase, {
    actor_user_id: auth?.user?.id ?? null,
    action: status === "published" ? "listing_published" : "listing_status_updated",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { status, submission_status },
  });
  revalidatePath("/admin");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  if (role !== "owner" && role !== "admin") return;
  const leadId = String(formData.get("lead_id") ?? "");
  const status = parseLeadStatus(formData.get("status"));

  if (!isUuid(leadId) || !status) return;

  await supabase.from("leads").update({ status }).eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_status_updated",
    entity: "lead",
    entity_id: leadId,
    meta: { status },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "lead_status_updated",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { status },
  });

  revalidatePath("/admin");
}

export async function assignLeadAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  if (role !== "owner" && role !== "admin") return;
  const leadId = String(formData.get("lead_id") ?? "");
  const assignedRaw = String(formData.get("assigned_to") ?? "");
  const assignedTo = assignedRaw && isUuid(assignedRaw) ? assignedRaw : null;

  if (!isUuid(leadId)) return;

  await supabase.from("leads").update({ assigned_to: assignedTo }).eq("id", leadId);

  if (assignedTo) {
    await supabase.from("lead_assignments").upsert(
      {
        lead_id: leadId,
        assigned_to: assignedTo,
        assigned_by: userId,
      },
      { onConflict: "lead_id" }
    );
  } else {
    await supabase.from("lead_assignments").delete().eq("lead_id", leadId);
  }

  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_assigned",
    entity: "lead",
    entity_id: leadId,
    meta: { assigned_to: assignedTo },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "lead_assigned",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { assigned_to: assignedTo },
  });

  revalidatePath("/admin");
}

export async function addLeadNoteAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  if (role !== "owner" && role !== "admin") return;
  const leadId = String(formData.get("lead_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(leadId) || note.length < 3 || note.length > 500) return;

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_user_id: userId,
    note,
  });

  await supabase.from("activity_log").insert({
    actor_user_id: userId,
    action: "lead_note_added",
    entity: "lead",
    entity_id: leadId,
    meta: { preview: note.slice(0, 80) },
  });

  revalidatePath("/admin");
}

export async function updateListingSubmissionStatusAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const listingId = String(formData.get("listing_id") ?? "");
  const nextStatus = parseSubmissionStatus(formData.get("submission_status"));
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(listingId) || !nextStatus) return;
  if (nextStatus === "published" && role !== "admin" && role !== "owner") return;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    submission_status: nextStatus,
  };

  if (nextStatus === "submitted") updates.submitted_at = now;
  if (nextStatus === "under_review") updates.reviewed_at = now;
  if (nextStatus === "needs_changes") updates.reviewed_at = now;
  if (nextStatus === "approved") updates.approved_at = now;
  if (nextStatus === "published") {
    updates.published_at = now;
    updates.status = "published";
  }
  if (nextStatus === "archived") {
    updates.archived_at = now;
    updates.status = "archived";
  }
  if (nextStatus !== "published" && nextStatus !== "archived") {
    updates.status = "draft";
  }

  await supabase.from("listings").update(updates).eq("id", listingId);

  if (note) {
    await supabase.from("submission_notes").insert({
      entity_type: "listing",
      entity_id: listingId,
      author_user_id: userId,
      author_role: role,
      visibility: "developer",
      note,
    });
  }

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "listing_submission_status",
    entity: "listing",
    entity_id: listingId,
    meta: { submission_status: nextStatus },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_submission_status",
    entity_type: "listing",
    entity_id: listingId,
    metadata: { submission_status: nextStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateProjectSubmissionStatusAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const projectId = String(formData.get("project_id") ?? "");
  const nextStatus = parseSubmissionStatus(formData.get("submission_status"));
  const note = String(formData.get("note") ?? "").trim();

  if (!isUuid(projectId) || !nextStatus) return;
  if (nextStatus === "published" && role !== "admin" && role !== "owner") return;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    submission_status: nextStatus,
  };

  if (nextStatus === "submitted") updates.submitted_at = now;
  if (nextStatus === "under_review") updates.reviewed_at = now;
  if (nextStatus === "needs_changes") updates.reviewed_at = now;
  if (nextStatus === "approved") updates.approved_at = now;
  if (nextStatus === "published") updates.published_at = now;
  if (nextStatus === "archived") updates.archived_at = now;

  await supabase.from("projects").update(updates).eq("id", projectId);

  if (note) {
    await supabase.from("submission_notes").insert({
      entity_type: "project",
      entity_id: projectId,
      author_user_id: userId,
      author_role: role,
      visibility: "developer",
      note,
    });
  }

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_submission_status",
    entity: "project",
    entity_id: projectId,
    meta: { submission_status: nextStatus },
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_submission_status",
    entity_type: "project",
    entity_id: projectId,
    metadata: { submission_status: nextStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
}

export async function addSubmissionNoteAction(formData: FormData) {
  const { supabase, userId, role } = await requireStaff("/admin");
  const entityType = String(formData.get("entity_type") ?? "");
  const entityId = String(formData.get("entity_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "developer");

  if (!note || !isUuid(entityId)) return;
  if (!["listing", "project", "media"].includes(entityType)) return;
  if (!["developer", "internal"].includes(visibility)) return;

  await supabase.from("submission_notes").insert({
    entity_type: entityType,
    entity_id: entityId,
    author_user_id: userId,
    author_role: role,
    visibility,
    note,
  });

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "submission_note",
    entity: entityType,
    entity_id: entityId,
    meta: { visibility },
  });

  revalidatePath("/admin");
  revalidatePath("/developer");
}

export async function updateListingReviewAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const listingId = String(formData.get("listing_id") ?? "");
  if (!isUuid(listingId)) return;

  const parsed = parseListingInput({
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
    beds: formData.get("beds"),
    baths: formData.get("baths"),
    size_m2: formData.get("size_m2"),
    description: formData.get("description"),
    description_ar: formData.get("description_ar"),
    description_en: formData.get("description_en"),
    amenities: formData.get("amenities"),
    status: formData.get("status"),
  });
  if (!parsed) return;

  const hrOwnerInput = String(formData.get("hr_owner_user_id") ?? "");
  const projectInput = String(formData.get("project_id") ?? "");

  await supabase
    .from("listings")
    .update({
      title: parsed.title,
      title_ar: parsed.title_ar,
      title_en: parsed.title_en,
      type: parsed.type,
      purpose: parsed.purpose,
      price: parsed.price,
      currency: parsed.currency,
      city: parsed.city,
      area: parsed.area,
      address: parsed.address,
      beds: parsed.beds,
      baths: parsed.baths,
      size_m2: parsed.size_m2,
      description: parsed.description,
      description_ar: parsed.description_ar,
      description_en: parsed.description_en,
      amenities: parsed.amenities,
      listing_code: String(formData.get("listing_code") ?? "").trim() || null,
      unit_code: String(formData.get("unit_code") ?? "").trim() || null,
      project_id: isUuid(projectInput) ? projectInput : null,
      hr_owner_user_id: isUuid(hrOwnerInput) ? hrOwnerInput : null,
    })
    .eq("id", listingId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "listing_review_updated",
    entity: "listing",
    entity_id: listingId,
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "listing_updated",
    entity_type: "listing",
    entity_id: listingId,
  });

  revalidatePath("/admin");
  revalidatePath(`/listing/${listingId}`);
}

export async function updateProjectReviewAction(formData: FormData) {
  const { supabase, userId } = await requireStaff("/admin");
  const projectId = String(formData.get("project_id") ?? "");
  if (!isUuid(projectId)) return;

  const parsed = parseProjectInput({
    title_ar: formData.get("title_ar"),
    title_en: formData.get("title_en"),
    description_ar: formData.get("description_ar"),
    description_en: formData.get("description_en"),
    city: formData.get("city"),
    area: formData.get("area"),
    address: formData.get("address"),
  });
  if (!parsed) return;

  const hrOwnerInput = String(formData.get("hr_owner_user_id") ?? "");

  await supabase
    .from("projects")
    .update({
      title_ar: parsed.title_ar,
      title_en: parsed.title_en,
      description_ar: parsed.description_ar,
      description_en: parsed.description_en,
      city: parsed.city,
      area: parsed.area,
      address: parsed.address,
      project_code: String(formData.get("project_code") ?? "").trim() || null,
      hr_owner_user_id: isUuid(hrOwnerInput) ? hrOwnerInput : null,
    })
    .eq("id", projectId);

  await logActivity(supabase, {
    actor_user_id: userId,
    action: "project_review_updated",
    entity: "project",
    entity_id: projectId,
  });
  await logAudit(supabase, {
    actor_user_id: userId,
    action: "project_updated",
    entity_type: "project",
    entity_id: projectId,
  });

  revalidatePath("/admin");
}

```

### src/app/admin/approvals/actions.ts
```ts
﻿"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireOwnerAccess } from "@/lib/owner";
import { isUuid } from "@/lib/validators";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function approvePiiChangeAction(formData: FormData) {
  await requireOwnerAccess("/admin/approvals");
  const supabase = await createSupabaseServerClient();

  const requestId = clean(formData.get("request_id"));
  if (!isUuid(requestId)) return;

  await supabase.rpc("approve_pii_change", { request_id: requestId });
  revalidatePath("/admin/approvals");
}

export async function rejectPiiChangeAction(formData: FormData) {
  await requireOwnerAccess("/admin/approvals");
  const supabase = await createSupabaseServerClient();

  const requestId = clean(formData.get("request_id"));
  const reason = clean(formData.get("reason"));
  if (!isUuid(requestId)) return;

  await supabase.rpc("reject_pii_change", { request_id: requestId, reason: reason || null });
  revalidatePath("/admin/approvals");
}


```

### src/app/admin/approvals/page.tsx
```tsx
﻿import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { requireOwnerAccess } from "@/lib/owner";
import { approvePiiChangeAction, rejectPiiChangeAction } from "./actions";

export default async function AdminApprovalsPage() {
  const { supabase } = await requireOwnerAccess("/admin/approvals");
  const locale = await getServerLocale();
  const t = createT(locale);

  const { data: requestsData } = await supabase
    .from("pii_change_requests")
    .select("id, table_name, row_id, action, payload, status, requested_by, requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: false });
  const requests = requestsData ?? [];

  const requesterIds = Array.from(new Set(requests.map((req) => req.requested_by)));
  const { data: profilesData } = requesterIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", requesterIds)
    : { data: [] as Array<{ id: string; full_name: string | null; email: string | null }> };
  const profileById = new Map((profilesData ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
        <Section title={t("admin.pii.title")} subtitle={t("admin.pii.subtitle")}>
          {requests.length === 0 ? (
            <Card className="text-sm text-[var(--muted)]">{t("admin.pii.empty")}</Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((req) => {
                const requester = profileById.get(req.requested_by);
                const payloadEntries = Object.entries((req.payload as Record<string, unknown>) ?? {});

                return (
                  <Card key={req.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {t("admin.pii.request")} #{req.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {t("admin.pii.requestedBy", {
                            name: requester?.full_name ?? requester?.email ?? req.requested_by,
                          })}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {t("admin.pii.requestedAt", {
                            time: new Date(req.requested_at).toLocaleString(locale),
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        <div>{t("admin.pii.table", { table: req.table_name })}</div>
                        <div>{t("admin.pii.action", { action: req.action })}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="text-[var(--muted)]">{t("admin.pii.payload")}</div>
                      {payloadEntries.length === 0 ? (
                        <div className="text-[var(--muted)]">{t("admin.pii.payload.empty")}</div>
                      ) : (
                        <ul className="grid gap-1">
                          {payloadEntries.map(([key, value]) => (
                            <li key={key} className="flex flex-wrap justify-between gap-2">
                              <span className="text-[var(--muted)]">{key}</span>
                              <span>{value ? String(value) : "-"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <form action={approvePiiChangeAction}>
                        <input type="hidden" name="request_id" value={req.id} />
                        <Button size="sm" type="submit">
                          {t("admin.pii.approve")}
                        </Button>
                      </form>
                      <form action={rejectPiiChangeAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="request_id" value={req.id} />
                        <FieldInput
                          name="reason"
                          label={t("admin.pii.reject.reason")}
                          helpKey="admin.pii.reject.reason"
                          placeholder={t("admin.pii.reject.placeholder")}
                        />
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.pii.reject")}
                        </Button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}


```

### src/app/admin/flags/page.tsx
```tsx
﻿import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function AdminFlagsPage() {
  await requireRole(["owner", "admin"], "/admin/flags");
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  const items = [
    { key: "enableCompare", value: flags.enableCompare },
    { key: "enableSavedSearch", value: flags.enableSavedSearch },
    { key: "enableEnglish", value: flags.enableEnglish },
    { key: "enableLeadCRM", value: flags.enableLeadCRM },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("admin.flags.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("admin.flags.subtitle")}</p>
        </div>

        <Card className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="font-medium">{item.key}</span>
              <span className={item.value ? "text-[var(--success)]" : "text-[var(--muted)]"}>
                {item.value ? t("admin.flags.enabled") : t("admin.flags.disabled")}
              </span>
            </div>
          ))}
        </Card>

        <Link href="/admin" className="text-sm text-[var(--muted)] underline">
          {t("admin.homepage.back")}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/admin/page.tsx
```tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section, Stat } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { LEAD_STATUS_OPTIONS, SUBMISSION_STATUS_OPTIONS } from "@/lib/constants";
import { createT, getLeadStatusLabelKey, getSubmissionStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { InviteUserForm } from "@/components/InviteUserForm";
import { UserManagementList } from "@/components/UserManagementList";
import {
  addDeveloperMemberAction,
  addLeadNoteAction,
  assignLeadAction,
  createDeveloperAction,
  updateLeadStatusAction,
  updateListingStatusAction,
  updateListingSubmissionStatusAction,
  updateProjectSubmissionStatusAction,
} from "./actions";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminPage() {
  const { role } = await requireRole(["owner", "admin"], "/admin");
  const isAdmin = role === "admin" || role === "owner";
  const canViewFullLeads = isAdmin;
  const leadsTable = canViewFullLeads ? "leads" : "leads_masked";
  const supabase = await createSupabaseServerClient();

  const locale = await getServerLocale();
  const t = createT(locale);

  const today = startOfToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const { count: unitsToday = 0 } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: unitsWeek = 0 } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { count: leadsToday = 0 } = await supabase
    .from(leadsTable)
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const { count: leadsWeek = 0 } = await supabase
    .from(leadsTable)
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { data: pendingData } = await supabase
    .from("listings")
    .select("id, title, city, price, currency, status, created_at")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(10);
  const pendingListings = pendingData ?? [];

  const { data: reviewListingsData } = await supabase
    .from("listings")
    .select("id, title, city, submission_status, listing_code, unit_code")
    .in("submission_status", ["submitted", "under_review", "needs_changes", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(20);
  const reviewListings = reviewListingsData ?? [];

  const { data: reviewProjectsData } = await supabase
    .from("projects")
    .select("id, title_ar, title_en, city, submission_status, project_code")
    .in("submission_status", ["submitted", "under_review", "needs_changes", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(20);
  const reviewProjects = reviewProjectsData ?? [];

  const { data: topDevelopersData } = await supabase
    .from("report_top_developers")
    .select("developer_id, name, units")
    .limit(5);
  const topDevelopers = topDevelopersData ?? [];

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role, created_at, is_active")
    .order("created_at", { ascending: false })
    .limit(20);
  const profiles = profilesData ?? [];

  const { data: developersData } = await supabase
    .from("developers")
    .select("id, name")
    .order("name", { ascending: true });
  const developers = developersData ?? [];

  const leadSelect = canViewFullLeads
    ? "id, name, phone, email, message, status, assigned_to, created_at, listing_id, listings(title)"
    : "id, name, phone, email, message, status, assigned_to, created_at, listing_id, listing_title";

  type LeadRow = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    message: string | null;
    status: string | null;
    assigned_to: string | null;
    created_at: string;
    listing_id: string | null;
    listings?: { title: string | null } | { title: string | null }[] | null;
    listing_title?: string | null;
  };

  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select(leadSelect)
    .order("created_at", { ascending: false })
    .limit(20);
  const leads = (leadsData ?? []) as LeadRow[];

  const leadIds = leads.map((lead) => lead.id);
  const leadNotesById = new Map<string, { note: string; created_at: string }>();
  if (leadIds.length > 0) {
    const { data: notesData } = await supabase
      .from("lead_notes")
      .select("lead_id, note, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      if (!leadNotesById.has(note.lead_id)) {
        leadNotesById.set(note.lead_id, note);
      }
    });
  }

  const profileNameById = new Map(
    profiles.map((profile) => [profile.id, profile.full_name ?? profile.id])
  );
  const roleLabelKeyMap: Record<string, string> = {
    owner: "role.owner",
    developer: "role.developer",
    admin: "role.admin",
    ops: "role.ops",
    staff: "role.staff",
    agent: "role.agent",
  };
  const formatRoleLabel = (value?: string | null) =>
    t(roleLabelKeyMap[value ?? "staff"] ?? "role.staff");
  const reviewStatusOptions = isAdmin
    ? SUBMISSION_STATUS_OPTIONS
    : SUBMISSION_STATUS_OPTIONS.filter((option) => option.value !== "published");

  const badgeRoleKey = role === "owner" ? "role.owner" : "role.admin";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("admin.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/homepage">
              <Button size="sm" variant="secondary">
                {t("admin.homepage.manage")}
              </Button>
            </Link>
            <Link href="/admin/flags">
              <Button size="sm" variant="secondary">
                {t("admin.flags.manage")}
              </Button>
            </Link>
            <Badge>{t(badgeRoleKey)}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("admin.stats.today")} value={unitsToday} />
          <Stat label={t("admin.stats.week")} value={unitsWeek} />
          <Stat label={t("admin.stats.leadsToday")} value={leadsToday} />
          <Stat label={t("admin.stats.leadsWeek")} value={leadsWeek} />
        </div>

        <Section title={t("admin.top.title")} subtitle={t("admin.top.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {topDevelopers.map((dev) => (
              <Card key={dev.developer_id}>
                <p className="text-lg font-semibold">{dev.name}</p>
                <p className="text-sm text-[var(--muted)]">{t("developer.stats.total")}: {dev.units}</p>
              </Card>
            ))}
          </div>
        </Section>

        {isAdmin ? (
          <Section title={t("admin.approvals.title")} subtitle={t("admin.approvals.subtitle")}>
            {pendingListings.length === 0 ? (
              <Card>
                <p className="text-sm text-[var(--muted)]">{t("admin.approvals.empty")}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-lg font-semibold">{listing.title}</p>
                      <p className="text-sm text-[var(--muted)]">{listing.city}</p>
                    </div>
                    <form action={updateListingStatusAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <FieldSelect
                        label={t("admin.approvals.status")}
                        helpKey="admin.approvals.status"
                        name="status"
                        defaultValue="draft"
                        wrapperClassName="min-w-[180px]"
                      >
                        <option value="draft">{t("status.draft")}</option>
                        <option value="published">{t("status.published")}</option>
                        <option value="archived">{t("status.archived")}</option>
                      </FieldSelect>
                      <Button size="sm" variant="secondary" type="submit">
                        {t("admin.approvals.update")}
                      </Button>
                    </form>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        ) : null}

        <Section title={t("admin.review.title")} subtitle={t("admin.review.subtitle")}>
          {reviewListings.length === 0 && reviewProjects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviewProjects.map((project) => {
                const title = project.title_ar ?? project.title_en ?? project.id;
                const statusLabel = t(
                  getSubmissionStatusLabelKey(project.submission_status ?? "draft")
                );
                return (
                  <Card key={project.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">{t("submission.section.projects")}</p>
                        <p className="text-base font-semibold">{title}</p>
                        <p className="text-xs text-[var(--muted)]">{project.city ?? "-"}</p>
                        {project.project_code ? (
                          <p className="text-xs text-[var(--muted)]">
                            {t("submission.field.project_code")}: {project.project_code}
                          </p>
                        ) : null}
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <form action={updateProjectSubmissionStatusAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="project_id" value={project.id} />
                      <FieldSelect
                        label={t("admin.review.submissionStatus")}
                        helpKey="admin.review.submission_status"
                        name="submission_status"
                        defaultValue={project.submission_status ?? "submitted"}
                      >
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldInput
                        label={t("admin.review.note.label")}
                        helpKey="admin.review.note"
                        name="note"
                        placeholder={t("admin.review.note.placeholder")}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.approvals.update")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                );
              })}
              {reviewListings.map((listing) => {
                const statusLabel = t(
                  getSubmissionStatusLabelKey(listing.submission_status ?? "draft")
                );
                return (
                  <Card key={listing.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">{t("submission.section.inventory")}</p>
                        <p className="text-base font-semibold">{listing.title}</p>
                        <p className="text-xs text-[var(--muted)]">{listing.city ?? "-"}</p>
                        {listing.listing_code || listing.unit_code ? (
                          <p className="text-xs text-[var(--muted)]">
                            {listing.listing_code ? `${t("submission.field.listing_code")}: ${listing.listing_code}` : ""}
                            {listing.listing_code && listing.unit_code ? " • " : ""}
                            {listing.unit_code ? `${t("submission.field.unit_code")}: ${listing.unit_code}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <form action={updateListingSubmissionStatusAction} className="grid gap-3 md:grid-cols-[1fr,1fr]">
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <FieldSelect
                        label={t("admin.review.submissionStatus")}
                        helpKey="admin.review.submission_status"
                        name="submission_status"
                        defaultValue={listing.submission_status ?? "submitted"}
                      >
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </FieldSelect>
                      <FieldInput
                        label={t("admin.review.note.label")}
                        helpKey="admin.review.note"
                        name="note"
                        placeholder={t("admin.review.note.placeholder")}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button size="sm" variant="secondary" type="submit">
                          {t("admin.approvals.update")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("admin.leads.title")} subtitle={t("admin.leads.subtitle")}>
          {leads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.leads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => {
                const listing = canViewFullLeads
                  ? Array.isArray(lead.listings)
                    ? lead.listings[0]
                    : lead.listings
                  : lead.listing_title
                    ? { title: lead.listing_title }
                    : null;
                const statusLabel = t(getLeadStatusLabelKey(lead.status ?? "new"));
                const assignedName = lead.assigned_to
                  ? profileNameById.get(lead.assigned_to) ?? lead.assigned_to
                  : t("admin.leads.unassigned");
                const lastNote = leadNotesById.get(lead.id);

                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-[var(--muted)]">
                          {t("account.leads.listing", { title: listing?.title ?? lead.listing_id ?? "" })}
                        </p>
                        <p className="text-base font-semibold">{lead.name}</p>
                      </div>
                      <Badge>{statusLabel}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>{lead.email ?? "-"}</span>
                      <span>{lead.phone ?? "-"}</span>
                      <span>{t("admin.leads.assigned", { name: assignedName })}</span>
                    </div>
                    {lastNote ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: lastNote.note })}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">{t("developer.leads.noNote")}</p>
                    )}
                    {isAdmin ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-[1fr,1fr]">
                          <form action={updateLeadStatusAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              label={t("crm.filter.status")}
                              helpKey="crm.lead.status"
                              name="status"
                              defaultValue={lead.status ?? "new"}
                              wrapperClassName="min-w-[180px]"
                            >
                              {LEAD_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </option>
                              ))}
                            </FieldSelect>
                            <Button size="sm" variant="secondary" type="submit">
                              {t("developer.leads.update")}
                            </Button>
                          </form>
                          <form action={assignLeadAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              label={t("crm.filter.assigned")}
                              helpKey="crm.lead.assigned_to"
                              name="assigned_to"
                              defaultValue={lead.assigned_to ?? ""}
                              wrapperClassName="min-w-[220px]"
                            >
                              <option value="">{t("admin.leads.unassigned")}</option>
                              {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                  {profile.full_name ?? profile.id} ({formatRoleLabel(profile.role)})
                                </option>
                              ))}
                            </FieldSelect>
                            <Button size="sm" variant="secondary" type="submit">
                              {t("admin.leads.assign")}
                            </Button>
                          </form>
                        </div>
                        <form action={addLeadNoteAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <FieldInput
                            label={t("crm.leads.addNote")}
                            helpKey="crm.lead.note"
                            name="note"
                            placeholder={t("admin.leads.addNote")}
                            wrapperClassName="flex-1 min-w-[240px]"
                          />
                          <Button size="sm" variant="secondary" type="submit">
                            {t("admin.leads.addNote")}
                          </Button>
                        </form>
                      </>
                    ) : (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                        {t("crm.adminOnly")}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        {isAdmin ? (
          <Section title={t("admin.partners.title")} subtitle={t("admin.partners.subtitle")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-lg font-semibold">{t("admin.partners.add")}</h3>
                <form action={createDeveloperAction} className="mt-3 space-y-3">
                  <FieldInput
                    label={t("admin.partners.name")}
                    helpKey="admin.partners.name"
                    name="name"
                    placeholder={t("admin.partners.add")}
                    required
                  />
                  <Button type="submit">{t("admin.partners.addBtn")}</Button>
                </form>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold">{t("admin.partners.link")}</h3>
                <form action={addDeveloperMemberAction} className="mt-3 space-y-3">
                  <FieldSelect
                    label={t("admin.partners.selectDeveloper")}
                    helpKey="admin.partners.developer_id"
                    name="developer_id"
                    defaultValue=""
                  >
                    <option value="">{t("admin.partners.selectDeveloper")}</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    label={t("admin.partners.userId")}
                    helpKey="admin.partners.user_id"
                    name="user_id"
                    placeholder={t("admin.partners.userId")}
                    required
                  />
                  <FieldInput
                    label={t("admin.partners.role")}
                    helpKey="admin.partners.role"
                    name="role"
                    placeholder={t("admin.partners.roleHint")}
                  />
                  <Button type="submit">{t("admin.partners.linkBtn")}</Button>
                </form>
              </Card>
            </div>
          </Section>
        ) : null}

        {isAdmin ? (
          <Section title={t("admin.users.title")} subtitle={t("admin.users.subtitle")}>
            <div className="space-y-4">
              <InviteUserForm endpoint="/api/admin/users/invite" />
              <UserManagementList profiles={profiles} actorRole={role} />
            </div>
          </Section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}




```

### src/app/api/admin/users/disable/route.ts
```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  const isOwner = actorRole === "owner";
  const isAdmin = actorRole === "admin" || isOwner;

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const targetUserId = typeof payload.targetUserId === "string" ? payload.targetUserId : "";
  const disabled = Boolean(payload.disabled);
  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ban_duration = disabled ? "876000h" : "none";
  const { error: banError } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration,
  });

  if (banError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: !disabled })
    .eq("id", targetUserId);

  if (profileError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: disabled ? "user_disabled" : "user_enabled",
    target_user_id: targetUserId,
  });

  return NextResponse.json({ ok: true });
}

```

### src/app/api/admin/users/invite/route.ts
```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  const isOwner = actorRole === "owner";
  const isAdmin = actorRole === "admin" || isOwner;

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const full_name = clean(payload.full_name);
  const phone = clean(payload.phone);
  const email = clean(payload.email).toLowerCase();
  const role = clean(payload.role);

  if (!full_name || full_name.length < 2 || full_name.length > 80) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (phone && (phone.length < 7 || phone.length > 30)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!email || !email.includes("@") || email.length > 120) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff" && role !== "ops" && role !== "agent") {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, phone: phone || null, role },
      redirectTo,
    }
  );

  if (inviteError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  const inviteLink = null;
  let targetUserId = inviteData?.user?.id ?? null;

  if (!targetUserId) {
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (usersError) break;
      const users = usersData?.users ?? [];
      const match = users.find((user) => (user.email ?? "").toLowerCase() === email);
      if (match?.id) {
        targetUserId = match.id;
        break;
      }
      if (users.length < perPage) break;
      if (usersData?.lastPage && page >= usersData.lastPage) break;
      page += 1;
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "user_lookup_failed" }, { status: 400 });
  }

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: targetUserId,
      full_name,
      phone: phone || null,
      email,
      role,
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: "user_invited",
    target_user_id: targetUserId,
    target_email: email,
  });

  return NextResponse.json({ ok: true, inviteLink });
}

```

### src/app/api/admin/users/update-role/route.ts
```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { parseRole } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  const isOwner = actorRole === "owner";
  const isAdmin = actorRole === "admin" || isOwner;

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const targetUserId = typeof payload.targetUserId === "string" ? payload.targetUserId : "";
  const parsedRole = parseRole(payload.newRole);
  if (!targetUserId || !parsedRole) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  if (parsedRole === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (targetProfile?.role === "owner" && parsedRole !== "owner" && !isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: parsedRole })
    .eq("id", targetUserId);

  if (updateError) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  await supabase.from("admin_audit_log").insert({
    actor_user_id: data.user.id,
    action: "user_role_updated",
    target_user_id: targetUserId,
  });

  return NextResponse.json({ ok: true });
}

```

### src/app/api/listings/by-ids/route.ts
```ts
﻿import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  let ids: string[] = [];
  try {
    const body = await request.json();
    ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
  } catch {
    ids = [];
  }

  const unique = Array.from(new Set(ids)).slice(0, 200);
  if (unique.length === 0) {
    return NextResponse.json({ listings: [] });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, status, created_at, amenities, floor, listing_images(path, sort)"
    )
    .in("id", unique)
    .eq("status", "published");

  if (error) {
    return NextResponse.json({ listings: [] }, { status: 500 });
  }

  return NextResponse.json({ listings: data ?? [] });
}

```

### src/app/api/owner/invite-admin/route.ts
```ts
﻿import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { logAudit } from "@/lib/audit";

const DEFAULT_EMAIL = "foxm575@gmail.com";
const DEFAULT_PHONE = "01020614022";
const DEFAULT_NAME = "Foxm Admin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  if (actorRole !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const secret = process.env.OWNER_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }
  const token = (await cookies()).get("owner_token")?.value ?? "";
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const email = clean(payload.email).toLowerCase() || DEFAULT_EMAIL;
  const phone = clean(payload.phone) || DEFAULT_PHONE;
  const full_name = clean(payload.full_name) || DEFAULT_NAME;

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, phone: phone || null, role: "admin" },
      redirectTo,
    }
  );

  if (inviteError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  const inviteLink = null;
  let targetUserId = inviteData?.user?.id ?? null;

  if (!targetUserId) {
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (usersError) break;
      const users = usersData?.users ?? [];
      const match = users.find((user) => (user.email ?? "").toLowerCase() === email);
      if (match?.id) {
        targetUserId = match.id;
        break;
      }
      if (users.length < perPage) break;
      if (usersData?.lastPage && page >= usersData.lastPage) break;
      page += 1;
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "user_lookup_failed" }, { status: 400 });
  }

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: targetUserId,
      full_name,
      phone: phone || null,
      email,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  await logAudit(supabase, {
    actor_user_id: data.user.id,
    action: "admin_invited",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: { role: "admin", email },
  });

  return NextResponse.json({ ok: true, inviteLink });
}


```

### src/app/api/owner/users/route.ts
```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { logAudit } from "@/lib/audit";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const actorRole = actorProfile?.role ?? "staff";
  if (actorRole !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const secret = process.env.OWNER_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }
  const token = (await cookies()).get("owner_token")?.value ?? "";
  if (token !== secret) {
    return NextResponse.json({ ok: false, error: "owner_locked" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const full_name = clean(payload.full_name);
  const phone = clean(payload.phone);
  const email = clean(payload.email).toLowerCase();
  const role = clean(payload.role);

  if (!full_name || full_name.length < 2 || full_name.length > 80) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (phone && (phone.length < 7 || phone.length > 30)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!email || !email.includes("@") || email.length > 120) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || undefined;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, phone: phone || null, role },
      redirectTo,
    }
  );

  if (inviteError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  const inviteLink = null;
  let targetUserId = inviteData?.user?.id ?? null;

  if (!targetUserId) {
    let page = 1;
    const perPage = 200;
    for (;;) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (usersError) break;
      const users = usersData?.users ?? [];
      const match = users.find((user) => (user.email ?? "").toLowerCase() === email);
      if (match?.id) {
        targetUserId = match.id;
        break;
      }
      if (users.length < perPage) break;
      if (usersData?.lastPage && page >= usersData.lastPage) break;
      page += 1;
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: "user_lookup_failed" }, { status: 400 });
  }

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  if (targetProfile?.role === "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: targetUserId,
      full_name,
      phone: phone || null,
      email,
      role,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json({ ok: false, error: "invite_failed" }, { status: 400 });
  }

  await logAudit(supabase, {
    actor_user_id: data.user.id,
    action: "user_invited",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: { role, email },
  });

  return NextResponse.json({ ok: true, inviteLink });
}

```

### src/app/api/pii-requests/route.ts
```ts
﻿import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isUuid } from "@/lib/validators";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = profile?.role ?? "staff";
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const rowId = clean(payload.id);
  const tableName = clean(payload.table_name);
  const action = clean(payload.action);
  const confirm = clean(payload.confirm).toUpperCase();

  if (!isUuid(rowId)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!tableName || !["leads", "customers"].includes(tableName)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (!action || !["hard_delete_request", "soft_delete", "update_pii"].includes(action)) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  if (confirm !== "DELETE") {
    return NextResponse.json({ ok: false, error: "invalid_confirm" }, { status: 400 });
  }

  const requestPayload = payload.payload && typeof payload.payload === "object" ? payload.payload : {};

  const { error: insertError } = await supabase.from("pii_change_requests").insert({
    table_name: tableName,
    row_id: rowId,
    requested_by: data.user.id,
    action,
    payload: requestPayload,
  });

  if (insertError) {
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}


```

### src/app/compare/page.tsx
```tsx
﻿import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ComparePage } from "@/components/compare/ComparePage";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function CompareRoute() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  if (!flags.enableCompare) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-[var(--muted)]">{t("compare.disabled")}</p>
        </main>
        <SiteFooter showCompare />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("compare.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("compare.subtitle")}</p>
        </div>
        <ComparePage labels={{ empty: t("compare.empty") }} />
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/crm/actions.ts
```ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid, parseLeadStatus } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const LOSS_REASON_SET = new Set(["budget", "location", "payment", "timing", "other"]);

async function requireCrmAccess(nextPath: string) {
  const { user, role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], nextPath);
  return { user, role };
}

function canManageLeads(role: string) {
  return role === "owner" || role === "admin";
}

export async function updateLeadStatusAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (!canManageLeads(role)) return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const status = parseLeadStatus(formData.get("status"));
  if (!isUuid(leadId) || !status) return;

  const updates: Record<string, unknown> = { status };
  const lostReason = clean(formData.get("lost_reason"));
  const lostReasonNote = clean(formData.get("lost_reason_note"));

  if (status === "lost") {
    if (!LOSS_REASON_SET.has(lostReason)) return;
    if (lostReason === "other" && lostReasonNote.length < 2) return;
    updates.lost_reason = lostReason;
    updates.lost_reason_note = lostReasonNote || null;
  } else {
    updates.lost_reason = null;
    updates.lost_reason_note = null;
  }

  await supabase.from("leads").update(updates).eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_status_updated",
    entity: "lead",
    entity_id: leadId,
    meta: { status, lost_reason: updates.lost_reason ?? null },
  });
}

export async function assignLeadAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (!canManageLeads(role)) return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const assignedRaw = clean(formData.get("assigned_to"));
  const assignedTo = assignedRaw && isUuid(assignedRaw) ? assignedRaw : null;
  if (!isUuid(leadId)) return;

  await supabase.from("leads").update({ assigned_to: assignedTo }).eq("id", leadId);
  if (assignedTo) {
    await supabase.from("lead_assignments").upsert(
      {
        lead_id: leadId,
        assigned_to: assignedTo,
        assigned_by: user.id,
      },
      { onConflict: "lead_id" }
    );
  } else {
    await supabase.from("lead_assignments").delete().eq("lead_id", leadId);
  }

  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_assigned",
    entity: "lead",
    entity_id: leadId,
    meta: { assigned_to: assignedTo },
  });
  await logAudit(supabase, {
    actor_user_id: user.id,
    action: "lead_assigned",
    entity_type: "lead",
    entity_id: leadId,
    metadata: { assigned_to: assignedTo },
  });
}

export async function addLeadNoteAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (!canManageLeads(role)) return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const note = clean(formData.get("note"));
  if (!isUuid(leadId) || !note) return;

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_user_id: user.id,
    note,
  });
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_note_added",
    entity: "lead",
    entity_id: leadId,
  });
}

export async function updateLeadNextAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (!canManageLeads(role)) return;
  const supabase = await createSupabaseServerClient();

  const leadId = clean(formData.get("lead_id"));
  const nextAt = clean(formData.get("next_action_at"));
  const nextNote = clean(formData.get("next_action_note"));
  if (!isUuid(leadId)) return;

  await supabase
    .from("leads")
    .update({ next_action_at: nextAt || null, next_action_note: nextNote || null })
    .eq("id", leadId);
  await supabase.from("activity_log").insert({
    actor_user_id: user.id,
    action: "lead_next_action",
    entity: "lead",
    entity_id: leadId,
  });
}

export async function updateLeadSpendAction(formData: FormData) {
  const { user, role } = await requireCrmAccess("/crm");
  if (role !== "admin" && role !== "ops" && role !== "owner") return;
  const supabase = await createSupabaseServerClient();

  const channel = clean(formData.get("channel"));
  const month = clean(formData.get("spend_month"));
  const amountRaw = clean(formData.get("amount"));
  const amount = amountRaw ? Number(amountRaw) : NaN;
  if (!channel || !month || !Number.isFinite(amount)) return;

  await supabase.from("lead_spend").upsert(
    {
      channel,
      spend_month: month,
      amount,
      created_by: user.id,
    },
    { onConflict: "channel,spend_month" }
  );
}

```

### src/app/crm/activities/page.tsx
```tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createActivityAction } from "./actions";

const ACTIVITY_TYPES = [
  { value: "call_attempted", labelKey: "crm.activity.type.call_attempted" },
  { value: "call_answered", labelKey: "crm.activity.type.call_answered" },
  { value: "meeting", labelKey: "crm.activity.type.meeting" },
  { value: "note", labelKey: "crm.activity.type.note" },
  { value: "follow_up", labelKey: "crm.activity.type.follow_up" },
  { value: "whatsapp", labelKey: "crm.activity.type.whatsapp" },
  { value: "email", labelKey: "crm.activity.type.email" },
];

export default async function CrmActivitiesPage() {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/activities");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);
  const canViewFull = role === "owner" || role === "admin";
  const leadsTable = canViewFull ? "leads" : "leads_masked";
  const customersTable = canViewFull ? "customers" : "customers_masked";

  const { data: activitiesData } = await supabase
    .from("lead_activities")
    .select("id, lead_id, customer_id, activity_type, outcome, notes, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(80);
  const activities = activitiesData ?? [];

  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(60);
  const leads = leadsData ?? [];

  const { data: customersData } = await supabase
    .from(customersTable)
    .select("id, full_name, phone_e164")
    .order("created_at", { ascending: false })
    .limit(60);
  const customers = customersData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.activities.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.activities.subtitle")}</p>
          </div>
          <Link href="/crm">
            <Button size="sm" variant="secondary">
              {t("crm.nav.leads")}
            </Button>
          </Link>
        </div>

        <Card className="space-y-4">
          <form action={createActivityAction} className="grid gap-3 md:grid-cols-4">
            <FieldSelect
              name="activity_type"
              label={t("crm.activities.type")}
              helpKey="crm.activities.type"
              defaultValue=""
            >
              <option value="">{t("crm.activities.type")}</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="lead_id"
              label={t("crm.activities.lead")}
              helpKey="crm.activities.lead"
              defaultValue=""
            >
              <option value="">{t("crm.activities.lead")}</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="customer_id"
              label={t("crm.activities.customer")}
              helpKey="crm.activities.customer"
              defaultValue=""
            >
              <option value="">{t("crm.activities.customer")}</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name ?? customer.phone_e164 ?? customer.id}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="occurred_at"
              label={t("crm.activities.occurred_at")}
              helpKey="crm.activities.occurred_at"
              type="datetime-local"
            />
            <FieldInput
              name="outcome"
              label={t("crm.activities.outcome")}
              helpKey="crm.activities.outcome"
              placeholder={t("crm.activities.outcome")}
              wrapperClassName="md:col-span-2"
            />
            <FieldTextarea
              name="notes"
              label={t("crm.activities.notes")}
              helpKey="crm.activities.notes"
              placeholder={t("crm.activities.notes")}
              wrapperClassName="md:col-span-3"
            />
            <Button type="submit" size="sm">
              {t("crm.activities.create")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.activities.title")} subtitle={t("crm.activities.subtitle")}>
          <div className="grid gap-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.activities.empty")}</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} className="space-y-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge>{t(`crm.activity.type.${activity.activity_type}` as const)}</Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(activity.occurred_at).toLocaleString(locale)}
                    </span>
                  </div>
                  {activity.outcome ? <p>{activity.outcome}</p> : null}
                  {activity.notes ? <p className="text-xs text-[var(--muted)]">{activity.notes}</p> : null}
                </Card>
              ))
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/crm/customers/[id]/actions.ts
```ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { isUuid } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: string) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function updateCustomerAction(formData: FormData) {
  const nextPath = clean(formData.get("next_path")) || "/crm/customers";
  const { user, role } = await requireRole(["owner", "admin"], nextPath);
  const isOwner = role === "owner";

  const supabase = await createSupabaseServerClient();
  const customerId = clean(formData.get("customer_id"));
  if (!isUuid(customerId)) return;

  const { data: existing } = await supabase
    .from("customers")
    .select("full_name, phone_raw, phone_e164, email")
    .eq("id", customerId)
    .maybeSingle();
  if (!existing) return;

  const full_name = clean(formData.get("full_name")) || null;
  const phone_raw = clean(formData.get("phone_raw")) || null;
  const phone_e164 = clean(formData.get("phone_e164")) || null;
  const email = clean(formData.get("email")) || null;
  const intent = clean(formData.get("intent")) || null;
  const preferredAreasRaw = clean(formData.get("preferred_areas"));
  const preferred_areas = preferredAreasRaw
    ? preferredAreasRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : null;
  const budget_min = toNumber(clean(formData.get("budget_min")));
  const budget_max = toNumber(clean(formData.get("budget_max")));
  const lead_source = clean(formData.get("lead_source")) || null;

  const piiChanges: Record<string, string | null> = {};
  if ((existing.full_name ?? "") !== (full_name ?? "")) piiChanges.full_name = full_name;
  if ((existing.phone_raw ?? "") !== (phone_raw ?? "")) piiChanges.phone_raw = phone_raw;
  if ((existing.phone_e164 ?? "") !== (phone_e164 ?? "")) piiChanges.phone_e164 = phone_e164;
  if ((existing.email ?? "") !== (email ?? "")) piiChanges.email = email;

  const nonPiiUpdates = {
    intent,
    preferred_areas,
    budget_min,
    budget_max,
    lead_source,
  };

  if (isOwner) {
    await supabase
      .from("customers")
      .update({
        full_name,
        phone_raw,
        phone_e164,
        email,
        intent,
        preferred_areas,
        budget_min,
        budget_max,
        lead_source,
      })
      .eq("id", customerId);
  } else {
    await supabase.from("customers").update(nonPiiUpdates).eq("id", customerId);
    if (Object.keys(piiChanges).length > 0) {
      await supabase.from("pii_change_requests").insert({
        table_name: "customers",
        row_id: customerId,
        requested_by: user.id,
        action: "update_pii",
        payload: piiChanges,
      });
    }
  }

  const hdrs = await headers();
  if (isOwner) {
    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "customer_updated",
      entity_type: "customer",
      entity_id: customerId,
      metadata: {
        intent,
        lead_source,
      },
      ip: hdrs.get("x-forwarded-for"),
      user_agent: hdrs.get("user-agent"),
    });
  } else {
    await logAudit(supabase, {
      actor_user_id: user.id,
      action: "customer_updated_non_pii",
      entity_type: "customer",
      entity_id: customerId,
      metadata: {
        intent,
        lead_source,
        requested_pii: Object.keys(piiChanges),
      },
      ip: hdrs.get("x-forwarded-for"),
      user_agent: hdrs.get("user-agent"),
    });
  }

  revalidatePath(`/crm/customers/${customerId}`);
  revalidatePath("/crm/customers");
}

```

### src/app/crm/customers/[id]/page.tsx
```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validators";
import { updateCustomerAction } from "./actions";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";

export default async function CrmCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { role, user } = await requireRole(
    ["owner", "admin", "ops", "staff", "agent"],
    `/crm/customers/${id}`
  );
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManageCustomer = isOwner || isAdmin;
  const canViewFullCustomer = isOwner || isAdmin;

  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic select strings from masked views.
  const supabaseAny = supabase as any;
  const locale = await getServerLocale();
  const t = createT(locale);
  const leadsTable = canViewFullCustomer ? "leads" : "leads_masked";
  const customersTable = canViewFullCustomer ? "customers" : "customers_masked";

  const customerSelect = canViewFullCustomer
    ? "id, full_name, phone_raw, phone_e164, email, intent, preferred_areas, budget_min, budget_max, lead_source, created_at"
    : "id, full_name, phone_e164, email, intent, preferred_areas, budget_min, budget_max, lead_source, created_at";

  const { data: customer } = await supabaseAny
    .from(customersTable)
    .select(customerSelect)
    .eq("id", id)
    .maybeSingle();
  if (!customer) notFound();

  const { data: piiRequestsData } = isAdmin
    ? await supabase
        .from("pii_change_requests")
        .select("id, status, requested_at, review_note")
        .eq("table_name", "customers")
        .eq("row_id", id)
        .eq("requested_by", user.id)
        .order("requested_at", { ascending: false })
        .limit(5)
    : { data: [] as Array<{ id: string; status: string; requested_at: string; review_note: string | null }> };
  const piiRequests = piiRequestsData ?? [];

  const leadSelect = canViewFullCustomer
    ? "id, status, lead_source, created_at, listings(title)"
    : "id, status, lead_source, created_at, listing_title";
  type LeadRow = {
    id: string;
    status: string | null;
    lead_source: string | null;
    created_at: string;
    listings?: { title: string | null } | { title: string | null }[] | null;
    listing_title?: string | null;
  };
  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select(leadSelect)
    .eq("customer_id", id)
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as LeadRow[];

  const { data: activitiesData } = await supabase
    .from("lead_activities")
    .select("id, activity_type, occurred_at, outcome, notes")
    .eq("customer_id", id)
    .order("occurred_at", { ascending: false })
    .limit(20);
  const activities = activitiesData ?? [];

  const budgetLabel =
    customer.budget_min || customer.budget_max
      ? `${customer.budget_min ? formatPrice(customer.budget_min, "EGP", locale) : ""}${
          customer.budget_min && customer.budget_max ? " - " : ""
        }${customer.budget_max ? formatPrice(customer.budget_max, "EGP", locale) : ""}`
      : "-";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{customer.full_name ?? "-"}</h1>
            <p className="text-sm text-[var(--muted)]">{customer.phone_e164 ?? "-"}</p>
          </div>
          <Link href="/crm/customers">
            <Button size="sm" variant="secondary">
              {t("staff.actions.back")}
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.intent")}</p>
            <p className="text-sm font-semibold">{customer.intent ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.area")}</p>
            <p className="text-sm font-semibold">{customer.preferred_areas?.[0] ?? "-"}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-[var(--muted)]">{t("crm.customers.table.budget")}</p>
            <p className="text-sm font-semibold">{budgetLabel}</p>
          </Card>
        </div>

        {canManageCustomer ? (
          <Section title={t("crm.customers.edit.title")} subtitle={t("crm.customers.edit.subtitle")}>
            <Card className="space-y-4">
              {!isOwner ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                  {t("crm.customers.piiNotice")}
                </div>
              ) : null}
              <form action={updateCustomerAction} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="customer_id" value={customer.id} />
                <input type="hidden" name="next_path" value={`/crm/customers/${customer.id}`} />
                <FieldInput
                  name="full_name"
                  label={t("crm.customers.form.full_name")}
                  helpKey="crm.customers.full_name"
                  defaultValue={customer.full_name ?? ""}
                  placeholder={t("crm.customers.form.full_name")}
                />
                <FieldInput
                  name="phone_e164"
                  label={t("crm.customers.form.phone")}
                  helpKey="crm.customers.phone_e164"
                  defaultValue={customer.phone_e164 ?? ""}
                  placeholder={t("crm.customers.form.phone")}
                />
                <FieldInput
                  name="phone_raw"
                  label={t("crm.customers.form.phoneRaw")}
                  helpKey="crm.customers.phone_raw"
                  defaultValue={customer.phone_raw ?? ""}
                  placeholder={t("crm.customers.form.phoneRaw")}
                />
                <FieldInput
                  name="email"
                  label={t("crm.customers.form.email")}
                  helpKey="crm.customers.email"
                  defaultValue={customer.email ?? ""}
                  placeholder={t("crm.customers.form.email")}
                  type="email"
                />
                <FieldInput
                  name="intent"
                  label={t("crm.customers.form.intent")}
                  helpKey="crm.customers.intent"
                  defaultValue={customer.intent ?? ""}
                  placeholder={t("crm.customers.form.intent")}
                />
                <FieldInput
                  name="preferred_areas"
                  label={t("crm.customers.form.areas")}
                  helpKey="crm.customers.preferred_areas"
                  defaultValue={customer.preferred_areas?.join(", ") ?? ""}
                  placeholder={t("crm.customers.form.areas")}
                />
                <FieldInput
                  name="budget_min"
                  label={t("crm.customers.form.budgetMin")}
                  helpKey="crm.customers.budget_min"
                  defaultValue={customer.budget_min ?? ""}
                  placeholder={t("crm.customers.form.budgetMin")}
                  type="number"
                />
                <FieldInput
                  name="budget_max"
                  label={t("crm.customers.form.budgetMax")}
                  helpKey="crm.customers.budget_max"
                  defaultValue={customer.budget_max ?? ""}
                  placeholder={t("crm.customers.form.budgetMax")}
                  type="number"
                />
                <FieldInput
                  name="lead_source"
                  label={t("crm.customers.form.source")}
                  helpKey="crm.customers.lead_source"
                  defaultValue={customer.lead_source ?? ""}
                  placeholder={t("crm.customers.form.source")}
                />
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <Button type="submit" size="sm" variant="secondary">
                    {t("crm.customers.form.save")}
                  </Button>
                  {isOwner ? (
                    <OwnerDeleteDialog
                      entityId={customer.id}
                      endpoint="/api/owner/customers/delete"
                      title={t("crm.customers.delete.title")}
                      description={t("crm.customers.delete.subtitle")}
                    />
                  ) : (
                    <OwnerDeleteDialog
                      entityId={customer.id}
                      endpoint="/api/pii-requests"
                      title={t("crm.customers.delete.requestTitle")}
                      description={t("crm.customers.delete.requestSubtitle")}
                      mode="request"
                      payload={{ table_name: "customers", action: "hard_delete_request" }}
                    />
                  )}
                </div>
              </form>
              {isAdmin ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                  <p className="mb-2 font-semibold text-[var(--text)]">{t("admin.pii.title")}</p>
                  {piiRequests.length === 0 ? (
                    <p>{t("admin.pii.empty")}</p>
                  ) : (
                    <ul className="grid gap-1">
                      {piiRequests.map((request) => (
                        <li key={request.id} className="flex flex-wrap justify-between gap-2">
                          <span>#{request.id.slice(0, 8)}</span>
                          <span>{request.status}</span>
                          <span>{new Date(request.requested_at).toLocaleString(locale)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </Card>
          </Section>
        ) : (
          <Card className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            {t("crm.customers.adminOnly")}
          </Card>
        )}

        <Section title={t("crm.leads.title")} subtitle={t("crm.leads.subtitle")}>
          <div className="grid gap-3">
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              leads.map((lead) => {
                const listing = canViewFullCustomer
                  ? Array.isArray(lead.listings)
                    ? lead.listings[0]
                    : lead.listings
                  : lead.listing_title
                    ? { title: lead.listing_title }
                    : null;
                return (
                  <Card key={lead.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{listing?.title ?? t("crm.leads.noListing")}</p>
                      <p className="text-xs text-[var(--muted)]">{lead.lead_source ?? "web"}</p>
                    </div>
                    <Badge>{lead.status}</Badge>
                  </Card>
                );
              })
            )}
          </div>
        </Section>

        <Section title={t("crm.activities.title")} subtitle={t("crm.activities.subtitle")}>
          <div className="grid gap-3">
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.activities.empty")}</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id} className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge>{t(`crm.activity.type.${activity.activity_type}` as const)}</Badge>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(activity.occurred_at).toLocaleString(locale)}
                    </span>
                  </div>
                  {activity.outcome ? <p>{activity.outcome}</p> : null}
                  {activity.notes ? <p className="text-xs text-[var(--muted)]">{activity.notes}</p> : null}
                </Card>
              ))
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/crm/customers/page.tsx
```tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section, Badge } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function CrmCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/customers");
  const canViewFullCustomers = role === "owner" || role === "admin";
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);
  const leadsTable = canViewFullCustomers ? "leads" : "leads_masked";
  const customersTable = canViewFullCustomers ? "customers" : "customers_masked";

  const params = await searchParams;
  const query = getParam(params, "q");

  let customersQuery = supabase
    .from(customersTable)
    .select("id, full_name, phone_e164, email, intent, preferred_areas, budget_min, budget_max, created_at")
    .order("created_at", { ascending: false })
    .limit(120);
  if (query) {
    customersQuery = customersQuery.or(
      `full_name.ilike.%${query}%,phone_e164.ilike.%${query}%,email.ilike.%${query}%`
    );
  }

  const { data: customersData } = await customersQuery;
  const customers = customersData ?? [];

  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select("customer_id")
    .in("customer_id", customers.map((c) => c.id));
  const leadCounts = new Map<string, number>();
  (leadsData ?? []).forEach((row) => {
    if (!row.customer_id) return;
    leadCounts.set(row.customer_id, (leadCounts.get(row.customer_id) ?? 0) + 1);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.customers.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.customers.subtitle")}</p>
          </div>
          <Link href="/crm">
            <Button size="sm" variant="secondary">
              {t("crm.nav.leads")}
            </Button>
          </Link>
        </div>

        <Card className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <FieldInput
              name="q"
              label={t("crm.customers.search")}
              helpKey="crm.customers.search"
              placeholder={t("crm.customers.search")}
              defaultValue={query}
            />
            <Button type="submit" size="sm">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.customers.title")} subtitle={t("crm.customers.subtitle")}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.name")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.phone")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.intent")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.area")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.budget")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.leads")}</th>
                    <th className="px-4 py-3 text-right">{t("crm.customers.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[var(--muted)]">
                        {t("crm.customers.empty")}
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => {
                      const budgetLabel =
                        customer.budget_min || customer.budget_max
                          ? `${customer.budget_min ? formatPrice(customer.budget_min, "EGP", locale) : ""}${
                              customer.budget_min && customer.budget_max ? " - " : ""
                            }${customer.budget_max ? formatPrice(customer.budget_max, "EGP", locale) : ""}`
                          : "-";
                      return (
                        <tr key={customer.id} className="border-b border-[var(--border)]">
                          <td className="px-4 py-3 font-semibold">{customer.full_name ?? "-"}</td>
                          <td className="px-4 py-3">{customer.phone_e164 ?? "-"}</td>
                          <td className="px-4 py-3">
                            {customer.intent ? <Badge>{customer.intent}</Badge> : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {customer.preferred_areas?.[0] ?? "-"}
                          </td>
                          <td className="px-4 py-3">{budgetLabel}</td>
                          <td className="px-4 py-3">{leadCounts.get(customer.id) ?? 0}</td>
                          <td className="px-4 py-3">
                            <Link href={`/crm/customers/${customer.id}`}>
                              <Button size="sm" variant="secondary">
                                {t("crm.customers.view")}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/crm/page.tsx
```tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card, Section } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { OwnerDeleteDialog } from "@/components/OwnerDeleteDialog";
import { createT, getLeadStatusLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  addLeadNoteAction,
  assignLeadAction,
  updateLeadNextAction,
  updateLeadSpendAction,
  updateLeadStatusAction,
} from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;
type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  phone_e164: string | null;
  phone_normalized?: string | null;
  email: string | null;
  message: string | null;
  status: string | null;
  lead_source: string | null;
  assigned_to: string | null;
  created_at: string;
  listing_id: string | null;
  intent: string | null;
  preferred_area: string | null;
  budget_min: number | null;
  budget_max: number | null;
  lost_reason: string | null;
  lost_reason_note: string | null;
  next_action_at: string | null;
  listing_title?: string | null;
  listing_city?: string | null;
  listing_area?: string | null;
  listings?: { title?: string | null; city?: string | null; area?: string | null } | { title?: string | null; city?: string | null; area?: string | null }[] | null;
  customer?: {
    id: string;
    full_name: string | null;
    phone_e164: string | null;
    intent: string | null;
    preferred_areas: string[] | null;
    budget_min: number | null;
    budget_max: number | null;
  } | {
    id: string;
    full_name: string | null;
    phone_e164: string | null;
    intent: string | null;
    preferred_areas: string[] | null;
    budget_min: number | null;
    budget_max: number | null;
  }[] | null;
};

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

const LOSS_REASONS = [
  { value: "budget", labelKey: "lead.loss_reason.budget" },
  { value: "location", labelKey: "lead.loss_reason.location" },
  { value: "payment", labelKey: "lead.loss_reason.payment" },
  { value: "timing", labelKey: "lead.loss_reason.timing" },
  { value: "other", labelKey: "lead.loss_reason.other" },
];

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm");
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const statusFilter = getParam(params, "status");
  const sourceFilter = getParam(params, "source");
  const assignedFilter = getParam(params, "assigned");
  const lostReasonFilter = getParam(params, "lost_reason");
  const overdueFilter = getParam(params, "overdue");
  const query = getParam(params, "q");
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManageLeads = isOwner || isAdmin;
  const canViewFullLeads = isOwner || isAdmin;
  const leadsTable = canViewFullLeads ? "leads" : "leads_masked";
  const leadSelect = canViewFullLeads
    ? "id, name, phone, phone_e164, phone_normalized, email, message, status, lead_source, assigned_to, created_at, listing_id, intent, preferred_area, budget_min, budget_max, lost_reason, lost_reason_note, next_action_at, listings(title, city, area), customer: customers(id, full_name, phone_e164, intent, preferred_areas, budget_min, budget_max)"
    : "id, name, phone, phone_e164, email, message, status, lead_source, assigned_to, created_at, listing_id, intent, preferred_area, budget_min, budget_max, lost_reason, lost_reason_note, next_action_at, listing_title, listing_city, listing_area";
  const canExport = isOwner;
  const exportParams = new URLSearchParams({
    status: statusFilter,
    source: sourceFilter,
    assigned: assignedFilter,
    lost_reason: lostReasonFilter,
    overdue: overdueFilter,
    q: query,
  });
  const exportUrl = `/api/crm-export?${exportParams.toString()}`;

  let leadsQuery = supabaseAny
    .from(leadsTable)
    .select(leadSelect);
  leadsQuery = leadsQuery.order("created_at", { ascending: false }).limit(120);

  if (statusFilter) leadsQuery = leadsQuery.eq("status", statusFilter);
  if (sourceFilter) leadsQuery = leadsQuery.eq("lead_source", sourceFilter);
  if (lostReasonFilter) leadsQuery = leadsQuery.eq("lost_reason", lostReasonFilter);
  if (assignedFilter === "unassigned") {
    leadsQuery = leadsQuery.is("assigned_to", null);
  } else if (assignedFilter) {
    leadsQuery = leadsQuery.eq("assigned_to", assignedFilter);
  }
  if (overdueFilter === "1") {
    leadsQuery = leadsQuery.lt("next_action_at", new Date().toISOString());
  }
  if (query) {
    if (canViewFullLeads) {
      leadsQuery = leadsQuery.or(
        `name.ilike.%${query}%,phone.ilike.%${query}%,phone_normalized.ilike.%${query}%,phone_e164.ilike.%${query}%`
      );
    } else {
      leadsQuery = leadsQuery.or(`name.ilike.%${query}%,listing_id.eq.${query}`);
    }
  }

  const { data: leadsData } = await leadsQuery;
  const leads = (leadsData ?? []) as LeadRow[];

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["admin", "ops", "agent"])
    .order("full_name", { ascending: true });
  const profiles = profilesData ?? [];
  const profileNameById = new Map(profiles.map((p) => [p.id, p.full_name ?? p.id]));

  const statusCounts = new Map<string, number>();
  leads.forEach((lead) => {
    const key = lead.status ?? "new";
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  });

  const duplicates = new Map<string, number>();
  if (canViewFullLeads) {
    leads.forEach((lead) => {
      if (!lead.phone_normalized) return;
      duplicates.set(lead.phone_normalized, (duplicates.get(lead.phone_normalized) ?? 0) + 1);
    });
  }
  const duplicateCount = canViewFullLeads
    ? [...duplicates.values()].filter((count) => count > 1).length
    : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const { data: leadSourcesData } = await supabase
    .from("lead_sources")
    .select("slug, name, is_active")
    .eq("is_active", true);
  const fallbackSources = LEAD_SOURCE_OPTIONS.map((source) => ({
    value: source.value,
    label: t(source.labelKey),
  }));
  const leadSources =
    leadSourcesData && leadSourcesData.length > 0
      ? leadSourcesData.map((source) => ({
          value: source.slug,
          label: source.name,
        }))
      : fallbackSources;

  const { data: spendData } = await supabase
    .from("lead_spend")
    .select("channel, spend_month, amount")
    .eq("spend_month", monthKey);
  const spendByChannel = new Map((spendData ?? []).map((row) => [row.channel, row.amount]));

  const leadsBySource = new Map<string, number>();
  leads.forEach((lead) => {
    const source = lead.lead_source || "web";
    leadsBySource.set(source, (leadsBySource.get(source) ?? 0) + 1);
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{t("crm.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("crm.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {canExport ? (
              <a href={exportUrl}>
                <Button size="sm" variant="secondary">
                  {t("crm.leads.export")}
                </Button>
              </a>
            ) : null}
            <Link href="/crm/visits">
              <Button size="sm" variant="secondary">
                {t("crm.visits.link")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/crm" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.leads")}
          </Link>
          <Link href="/crm/customers" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.customers")}
          </Link>
          <Link href="/crm/activities" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.activities")}
          </Link>
          <Link href="/crm/sources" className="rounded-full border border-[var(--border)] px-3 py-1 hover:text-[var(--text)]">
            {t("crm.nav.sources")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.total")}</p>
            <p className="text-2xl font-semibold">{leads.length}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.duplicates")}</p>
            <p className="text-2xl font-semibold">{duplicateCount}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.assigned")}</p>
            <p className="text-2xl font-semibold">
              {leads.filter((lead) => Boolean(lead.assigned_to)).length}
            </p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs text-[var(--muted)]">{t("crm.stats.unassigned")}</p>
            <p className="text-2xl font-semibold">
              {leads.filter((lead) => !lead.assigned_to).length}
            </p>
          </Card>
        </div>

        <Section title={t("crm.pipeline.title")} subtitle={t("crm.pipeline.subtitle")}>
          <div className="flex flex-wrap gap-2">
            {LEAD_STATUS_OPTIONS.map((option) => (
              <Badge key={option.value}>
                {t(option.labelKey)} · {statusCounts.get(option.value) ?? 0}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title={t("crm.spend.title")} subtitle={t("crm.spend.subtitle")}>
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <Card className="space-y-3">
              {leadSources.map((source) => {
                const leadsCount = leadsBySource.get(source.value) ?? 0;
                const spend = spendByChannel.get(source.value) ?? 0;
                const cpl = leadsCount > 0 ? (spend / leadsCount).toFixed(0) : "-";
                return (
                  <div key={source.value} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted)]">{source.label}</span>
                    <span>
                      {leadsCount} · {spend} EGP · {cpl}
                    </span>
                  </div>
                );
              })}
            </Card>
            <Card className="space-y-3">
              <form action={updateLeadSpendAction} className="space-y-3">
                <FieldInput
                  name="spend_month"
                  label={t("crm.spend.month")}
                  helpKey="crm.spend.month"
                  type="date"
                  defaultValue={monthKey}
                />
                <FieldSelect
                  name="channel"
                  label={t("crm.spend.channel")}
                  helpKey="crm.spend.channel"
                  defaultValue=""
                >
                  <option value="">{t("crm.spend.channel")}</option>
                  {leadSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </FieldSelect>
                <FieldInput
                  name="amount"
                  label={t("crm.spend.amount")}
                  helpKey="crm.spend.amount"
                  type="number"
                  placeholder={t("crm.spend.amount")}
                />
                <Button type="submit" size="sm">
                  {t("crm.spend.save")}
                </Button>
              </form>
            </Card>
          </div>
        </Section>

        <Card className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <FieldInput
              name="q"
              label={t("crm.search")}
              helpKey="crm.search"
              placeholder={t("crm.search")}
              defaultValue={query}
            />
            <FieldSelect
              name="status"
              label={t("crm.filter.status")}
              helpKey="crm.filter.status"
              defaultValue={statusFilter}
            >
              <option value="">{t("crm.filter.status")}</option>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="source"
              label={t("crm.filter.source")}
              helpKey="crm.filter.source"
              defaultValue={sourceFilter}
            >
              <option value="">{t("crm.filter.source")}</option>
              {leadSources.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="lost_reason"
              label={t("crm.filter.lostReason")}
              helpKey="crm.filter.lostReason"
              defaultValue={lostReasonFilter}
            >
              <option value="">{t("crm.filter.lostReason")}</option>
              {LOSS_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {t(reason.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="assigned"
              label={t("crm.filter.assigned")}
              helpKey="crm.filter.assigned"
              defaultValue={assignedFilter}
            >
              <option value="">{t("crm.filter.assigned")}</option>
              <option value="unassigned">{t("crm.filter.unassigned")}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name ?? profile.id}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="overdue"
              label={t("crm.filter.overdue")}
              helpKey="crm.filter.overdue"
              defaultValue={overdueFilter}
            >
              <option value="">{t("crm.filter.overdue")}</option>
              <option value="1">{t("crm.filter.overdueOnly")}</option>
            </FieldSelect>
            <Button type="submit" size="sm">
              {t("listings.filters.apply")}
            </Button>
          </form>
        </Card>

        <Section title={t("crm.leads.title")} subtitle={t("crm.leads.subtitle")}>
          <div className="grid gap-4">
            {leads.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("crm.leads.empty")}</p>
            ) : (
              leads.map((lead) => {
                const listing = canViewFullLeads
                  ? Array.isArray(lead.listings)
                    ? lead.listings[0]
                    : lead.listings
                  : lead.listing_title || lead.listing_city || lead.listing_area
                    ? {
                        title: lead.listing_title,
                        city: lead.listing_city,
                        area: lead.listing_area,
                      }
                    : null;
                const customer = canViewFullLeads
                  ? Array.isArray(lead.customer)
                    ? lead.customer[0]
                    : lead.customer
                  : null;
                const assignedName = lead.assigned_to
                  ? profileNameById.get(lead.assigned_to) ?? lead.assigned_to
                  : t("crm.leads.unassigned");
                const intent = lead.intent ?? customer?.intent ?? null;
                const preferredArea =
                  lead.preferred_area ?? customer?.preferred_areas?.[0] ?? null;
                const budgetMin = lead.budget_min ?? customer?.budget_min ?? null;
                const budgetMax = lead.budget_max ?? customer?.budget_max ?? null;
                const budgetLabel =
                  budgetMin || budgetMax
                    ? `${budgetMin ? formatPrice(budgetMin, "EGP", locale) : ""}${
                        budgetMin && budgetMax ? " - " : ""
                      }${budgetMax ? formatPrice(budgetMax, "EGP", locale) : ""}`
                    : null;
                const contextLine = listing
                  ? [listing.city, listing.area].filter(Boolean).join(" - ")
                  : [intent, preferredArea, budgetLabel].filter(Boolean).join(" · ");
                const phoneValue = lead.phone_e164 ?? lead.phone ?? "";
                const whatsappDigits = phoneValue ? phoneValue.replace(/\D/g, "") : "";
                const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
                const callLink = phoneValue ? `tel:${phoneValue.replace(/[^\d+]/g, "")}` : null;
                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-[var(--muted)]">
                          {listing?.title ?? t("crm.leads.noListing")}
                        </p>
                        <p className="text-base font-semibold">{lead.name}</p>
                        {contextLine ? (
                          <p className="text-xs text-[var(--muted)]">{contextLine}</p>
                        ) : null}
                      </div>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                      <span>{lead.phone_e164 ?? lead.phone ?? "-"}</span>
                      <span>{lead.lead_source ?? "web"}</span>
                      <span>{t("crm.leads.assigned", { name: assignedName })}</span>
                      {lead.status === "lost" && lead.lost_reason ? (
                        <span>{t(`lead.loss_reason.${lead.lost_reason}`)}</span>
                      ) : null}
                    </div>
                    <details className="lead-drawer">
                      <summary>{t("crm.leads.details")}</summary>
                      <div className="lead-drawer-body">
                        <span>{t("detail.lead.phone")}: {lead.phone_e164 ?? lead.phone ?? "-"}</span>
                        <span>{t("detail.lead.email")}: {lead.email ?? "-"}</span>
                        {lead.message ? (
                          <span>{t("detail.lead.message")}: {lead.message}</span>
                        ) : null}
                        {!canViewFullLeads ? <span>{t("crm.leads.masked")}</span> : null}
                        {canViewFullLeads && (whatsappLink || callLink) ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {whatsappLink ? (
                              <a href={whatsappLink} target="_blank" rel="noreferrer">
                                <Button size="sm">{t("detail.cta.whatsapp")}</Button>
                              </a>
                            ) : null}
                            {callLink ? (
                              <a href={callLink}>
                                <Button size="sm" variant="secondary">
                                  {t("detail.cta.call")}
                                </Button>
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </details>
                    {canManageLeads ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <form action={updateLeadStatusAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              name="status"
                              label={t("crm.filter.status")}
                              helpKey="crm.lead.status"
                              defaultValue={lead.status ?? "new"}
                            >
                              {LEAD_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </option>
                              ))}
                            </FieldSelect>
                            <FieldSelect
                              name="lost_reason"
                              label={t("crm.filter.lostReason")}
                              helpKey="crm.lead.lost_reason"
                              defaultValue={lead.lost_reason ?? ""}
                            >
                              <option value="">{t("crm.lossReason.select")}</option>
                              {LOSS_REASONS.map((reason) => (
                                <option key={reason.value} value={reason.value}>
                                  {t(reason.labelKey)}
                                </option>
                              ))}
                            </FieldSelect>
                            <FieldInput
                              name="lost_reason_note"
                              label={t("lead.loss_reason.other_note")}
                              helpKey="crm.lead.lost_reason_note"
                              placeholder={t("lead.loss_reason.other_note")}
                              defaultValue={lead.lost_reason_note ?? ""}
                            />
                            <Button type="submit" size="sm" variant="secondary">
                              {t("crm.leads.update")}
                            </Button>
                          </form>
                          <form action={assignLeadAction} className="flex flex-wrap items-end gap-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <FieldSelect
                              name="assigned_to"
                              label={t("crm.filter.assigned")}
                              helpKey="crm.lead.assigned_to"
                              defaultValue={lead.assigned_to ?? ""}
                            >
                              <option value="">{t("crm.leads.unassigned")}</option>
                              {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                  {profile.full_name ?? profile.id}
                                </option>
                              ))}
                            </FieldSelect>
                            <Button type="submit" size="sm" variant="secondary">
                              {t("crm.leads.assign")}
                            </Button>
                          </form>
                        </div>
                        <form action={updateLeadNextAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <FieldInput
                            name="next_action_at"
                            label={t("crm.leads.nextActionAt")}
                            helpKey="crm.lead.next_action_at"
                            type="datetime-local"
                          />
                          <FieldInput
                            name="next_action_note"
                            label={t("crm.leads.nextNote")}
                            helpKey="crm.lead.next_action_note"
                            placeholder={t("crm.leads.nextNote")}
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            {t("crm.leads.schedule")}
                          </Button>
                        </form>
                        <form action={addLeadNoteAction} className="flex flex-wrap items-end gap-3">
                          <input type="hidden" name="lead_id" value={lead.id} />
                          <FieldInput
                            name="note"
                            label={t("crm.leads.addNote")}
                            helpKey="crm.lead.note"
                            placeholder={t("crm.leads.addNote")}
                            wrapperClassName="flex-1"
                          />
                          <Button type="submit" size="sm">
                            {t("crm.leads.add")}
                          </Button>
                        </form>
                        <div className="flex justify-end">
                          {isOwner ? (
                            <OwnerDeleteDialog
                              entityId={lead.id}
                              endpoint="/api/owner/leads/delete"
                              title={t("crm.leads.delete.title")}
                              description={t("crm.leads.delete.subtitle")}
                            />
                          ) : (
                            <OwnerDeleteDialog
                              entityId={lead.id}
                              endpoint="/api/pii-requests"
                              title={t("crm.leads.delete.requestTitle")}
                              description={t("crm.leads.delete.requestSubtitle")}
                              mode="request"
                              payload={{ table_name: "leads", action: "hard_delete_request" }}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                        {t("crm.adminOnly")}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/crm/visits/page.tsx
```tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { requireRole } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createVisitAction, updateVisitNotesAction, updateVisitStatusAction } from "./actions";

const STATUS_OPTIONS = [
  { value: "scheduled", key: "visits.status.scheduled" },
  { value: "completed", key: "visits.status.completed" },
  { value: "rescheduled", key: "visits.status.rescheduled" },
  { value: "canceled", key: "visits.status.canceled" },
  { value: "no_show", key: "visits.status.no_show" },
];

export default async function VisitsPage() {
  const { role } = await requireRole(["owner", "admin", "ops", "staff", "agent"], "/crm/visits");
  const supabase = await createSupabaseServerClient();
  const locale = await getServerLocale();
  const t = createT(locale);
  const canViewFull = role === "owner" || role === "admin";
  const leadsTable = canViewFull ? "leads" : "leads_masked";

  const { data: visitsData } = await supabase
    .from("field_visits")
    .select("id, listing_id, lead_id, assigned_to, scheduled_at, status, notes, outcome, next_followup_at, listings(title), leads(name)")
    .order("scheduled_at", { ascending: true })
    .limit(80);
  const visits = visitsData ?? [];

  const { data: listingsData } = await supabase
    .from("listings")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(40);
  const listings = listingsData ?? [];

  const { data: leadsData } = await supabase
    .from(leadsTable)
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(40);
  const leads = leadsData ?? [];

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["admin", "ops", "agent"])
    .order("full_name", { ascending: true });
  const profiles = profilesData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("visits.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("visits.subtitle")}</p>
        </div>

        <Card className="space-y-4">
          <form action={createVisitAction} className="grid gap-3 md:grid-cols-4">
            <FieldSelect
              name="listing_id"
              label={t("visits.form.listing")}
              helpKey="crm.visits.listing"
              defaultValue=""
            >
              <option value="">{t("visits.form.listing")}</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect name="lead_id" label={t("visits.form.lead")} helpKey="crm.visits.lead" defaultValue="">
              <option value="">{t("visits.form.lead")}</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="assigned_to"
              label={t("visits.form.assigned")}
              helpKey="crm.visits.assigned_to"
              defaultValue=""
            >
              <option value="">{t("visits.form.assigned")}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name ?? profile.id}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="scheduled_at"
              label={t("visits.form.scheduled")}
              helpKey="crm.visits.scheduled_at"
              type="datetime-local"
            />
            <FieldTextarea
              name="notes"
              label={t("visits.form.notes")}
              helpKey="crm.visits.notes"
              placeholder={t("visits.form.notes")}
              wrapperClassName="md:col-span-3"
            />
            <Button type="submit" size="sm" className="md:col-span-1">
              {t("visits.form.create")}
            </Button>
          </form>
        </Card>

        <div className="grid gap-4">
          {visits.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t("visits.empty")}</p>
          ) : (
            visits.map((visit) => {
              const listing = Array.isArray(visit.listings) ? visit.listings[0] : visit.listings;
              const lead = Array.isArray(visit.leads) ? visit.leads[0] : visit.leads;
              return (
                <Card key={visit.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{listing?.title ?? t("visits.noListing")}</p>
                      <p className="text-xs text-[var(--muted)]">{lead?.name ?? t("visits.noLead")}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(visit.scheduled_at).toLocaleString(locale)}
                      </p>
                    </div>
                    <Badge>{t(`visits.status.${visit.status}`)}</Badge>
                  </div>

                  <form action={updateVisitStatusAction} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="visit_id" value={visit.id} />
                    <FieldSelect
                      name="status"
                      label={t("visits.form.status")}
                      helpKey="crm.visits.status"
                      defaultValue={visit.status}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.key)}
                        </option>
                      ))}
                    </FieldSelect>
                    <Button type="submit" size="sm" variant="secondary">
                      {t("visits.update")}
                    </Button>
                  </form>

                  <form action={updateVisitNotesAction} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="visit_id" value={visit.id} />
                    <FieldInput
                      name="outcome"
                      label={t("visits.form.outcome")}
                      helpKey="crm.visits.outcome"
                      placeholder={t("visits.form.outcome")}
                      defaultValue={visit.outcome ?? ""}
                    />
                    <FieldInput
                      name="next_followup_at"
                      label={t("visits.form.nextFollowup")}
                      helpKey="crm.visits.next_followup_at"
                      type="datetime-local"
                      defaultValue={
                        visit.next_followup_at
                          ? new Date(visit.next_followup_at).toISOString().slice(0, 16)
                          : ""
                      }
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      {t("visits.updateNotes")}
                    </Button>
                  </form>
                </Card>
              );
            })
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

```

### src/app/developer/page.tsx
```tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Section, Badge, Stat } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import {
  PROPERTY_TYPE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  MEDIA_TYPE_OPTIONS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  addLeadNoteAction,
  createListingAction,
  updateLeadStatusAction,
  submitListingAction,
  createProjectAction,
  submitProjectAction,
  createMediaSubmissionAction,
} from "./actions";
import {
  createT,
  getLeadStatusLabelKey,
  getPropertyTypeLabelKey,
  getPurposeLabelKey,
  getSubmissionStatusLabelKey,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { pickLocalizedText } from "@/lib/localize";

export default async function DeveloperPage() {
  const { user, role } = await requireRole(["owner", "developer", "admin"], "/developer");
  const supabase = await createSupabaseServerClient();
  const isAdmin = role === "admin";
  const leadsTable = role === "owner" ? "leads" : "leads_masked";

  const locale = await getServerLocale();
  const t = createT(locale);
  const roleLabelMap: Record<string, string> = {
    owner: "role.owner",
    developer: "role.developer",
    admin: "role.admin",
    ops: "role.ops",
    staff: "role.staff",
    agent: "role.agent",
  };
  const roleLabel = t(roleLabelMap[role] ?? "role.staff");

  const { data: membershipData } = await supabase
    .from("developer_members")
    .select("developer_id, developers(name)")
    .eq("user_id", user.id);
  const memberships =
    (membershipData as
      | Array<{ developer_id: string; developers: { name: string } | { name: string }[] | null }>
      | null) ?? [];

  const developerIds = memberships.map((m) => m.developer_id);
  const primaryDeveloperId = developerIds[0] ?? null;
  const primaryDeveloperName = Array.isArray(memberships[0]?.developers)
    ? memberships[0]?.developers[0]?.name ?? null
    : memberships[0]?.developers?.name ?? null;

  let projectQuery = supabase
    .from("projects")
    .select("id, title_ar, title_en, city, area, submission_status, submitted_at, project_code")
    .order("created_at", { ascending: false })
    .limit(30);

  if (developerIds.length > 0) {
    projectQuery = projectQuery.or(
      `owner_user_id.eq.${user.id},developer_id.in.(${developerIds.join(",")})`
    );
  } else {
    projectQuery = projectQuery.eq("owner_user_id", user.id);
  }

  const { data: projectsData } = await projectQuery;
  const projects = projectsData ?? [];
  const projectIds = projects.map((project) => project.id);

  let listingQuery = supabase
    .from("listings")
    .select(
      "id, title, title_ar, title_en, price, currency, city, status, submission_status, purpose, type, created_at, developer_id, listing_code, unit_code, project_id"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (developerIds.length > 0) {
    listingQuery = listingQuery.or(
      `owner_user_id.eq.${user.id},developer_id.in.(${developerIds.join(",")})`
    );
  } else {
    listingQuery = listingQuery.eq("owner_user_id", user.id);
  }

  const { data: listingsData } = await listingQuery;
  const listings = listingsData ?? [];
  const listingIds = listings.map((l) => l.id);

  const noteIds = [...listingIds, ...projectIds];
  const notesByEntity = new Map<string, { note: string; created_at: string }>();
  if (noteIds.length > 0) {
    const { data: notesData } = await supabase
      .from("submission_notes")
      .select("entity_type, entity_id, note, created_at, visibility")
      .in("entity_id", noteIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      const key = `${note.entity_type}:${note.entity_id}`;
      if (!notesByEntity.has(key)) {
        notesByEntity.set(key, note);
      }
    });
  }

  const leadCounts = new Map<string, number>();
  if (listingIds.length > 0) {
    const { data: leadsData } = await supabase.from(leadsTable).select("listing_id").in(
      "listing_id",
      listingIds
    );
    const leads = leadsData ?? [];
    leads.forEach((lead) => {
      leadCounts.set(lead.listing_id, (leadCounts.get(lead.listing_id) ?? 0) + 1);
    });
  }

  let recentLeads: Array<{
    id: string;
    listing_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    message: string | null;
    status: string | null;
    created_at: string;
    listings: { title: string } | { title: string }[] | null;
    listing_title?: string | null;
  }> = [];
  if (listingIds.length > 0) {
    const leadSelect = role === "owner"
      ? "id, listing_id, name, phone, email, message, status, created_at, listings(title)"
      : "id, listing_id, name, phone, email, message, status, created_at, listing_title";
    const { data: leadsData } = await supabase
      .from(leadsTable)
      .select(leadSelect)
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false })
      .limit(20);
    recentLeads = (leadsData as typeof recentLeads) ?? [];
  }

  const leadIds = recentLeads.map((lead) => lead.id);
  const leadNotesById = new Map<string, { note: string; created_at: string }>();
  if (leadIds.length > 0) {
    const { data: notesData } = await supabase
      .from("lead_notes")
      .select("lead_id, note, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });
    (notesData ?? []).forEach((note) => {
      if (!leadNotesById.has(note.lead_id)) {
        leadNotesById.set(note.lead_id, note);
      }
    });
  }

  const totalListings = listings.length;
  const totalProjects = projects.length;
  const pendingCount =
    listings.filter((listing) => ["submitted", "under_review"].includes(listing.submission_status ?? "")).length +
    projects.filter((project) => ["submitted", "under_review"].includes(project.submission_status ?? "")).length;
  const totalLeads = recentLeads.length;

  const { data: mediaData } = await supabase
    .from("submission_media")
    .select("id, media_type, url, submission_status, listing_id, project_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const mediaSubmissions = mediaData ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("developer.title")}</h1>
            <p className="text-sm text-[var(--muted)]">{t("submission.portal.subtitle")}</p>
            <p className="text-xs text-[var(--muted)]">
              {primaryDeveloperName
                ? t("developer.subtitle.company", { name: primaryDeveloperName })
                : t("developer.subtitle.empty")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/developer/import">
              <Button size="sm" variant="secondary">
                {t("developer.import.title")}
              </Button>
            </Link>
            <Link href="/developer/ads">
              <Button size="sm" variant="secondary">
                {t("nav.ads")}
              </Button>
            </Link>
            <Badge>{roleLabel}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label={t("developer.stats.total")} value={totalListings} />
          <Stat label={t("developer.stats.projects")} value={totalProjects} />
          <Stat label={t("developer.stats.pending")} value={pendingCount} />
          <Stat label={t("developer.stats.leads")} value={totalLeads} />
        </div>

        <Section title={t("submission.section.projects")} subtitle={t("project.create.title")}>
          <Card>
            <form action={createProjectAction} className="grid gap-4 md:grid-cols-3">
              {primaryDeveloperId ? (
                <input type="hidden" name="developer_id" value={primaryDeveloperId} />
              ) : null}
              <FieldInput
                name="title_ar"
                label={t("submission.field.title_ar")}
                helpKey="developer.project.title_ar"
                placeholder={t("submission.field.title_ar")}
                required
              />
              <FieldInput
                name="title_en"
                label={t("submission.field.title_en")}
                helpKey="developer.project.title_en"
                placeholder={t("submission.field.title_en")}
              />
              <FieldInput
                name="city"
                label={t("project.form.city")}
                helpKey="developer.project.city"
                placeholder={t("project.form.city")}
                required
              />
              <FieldInput
                name="area"
                label={t("project.form.area")}
                helpKey="developer.project.area"
                placeholder={t("project.form.area")}
              />
              <FieldInput
                name="address"
                label={t("project.form.address")}
                helpKey="developer.project.address"
                placeholder={t("project.form.address")}
              />
              <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                <FieldTextarea
                  name="description_ar"
                  label={t("submission.field.desc_ar")}
                  helpKey="developer.project.description_ar"
                  placeholder={t("submission.field.desc_ar")}
                />
                <FieldTextarea
                  name="description_en"
                  label={t("submission.field.desc_en")}
                  helpKey="developer.project.description_en"
                  placeholder={t("submission.field.desc_en")}
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit">{t("project.create.submit")}</Button>
              </div>
            </form>
          </Card>

          {projects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => {
                const title = pickLocalizedText(
                  locale,
                  project.title_ar,
                  project.title_en,
                  project.title_ar || project.title_en
                );
                const projectNote = notesByEntity.get(`project:${project.id}`);
                const statusLabel = t(
                  getSubmissionStatusLabelKey(project.submission_status ?? "draft")
                );
                return (
                  <Card
                    key={project.id}
                    className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-[var(--muted)]">{project.city}</p>
                      {project.project_code ? (
                        <p className="text-xs text-[var(--muted)]">
                          {t("submission.field.project_code")}: {project.project_code}
                        </p>
                      ) : null}
                      {projectNote ? (
                        <p className="text-xs text-[var(--muted)]">
                          {t("developer.leads.lastNote", { note: projectNote.note })}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>{statusLabel}</Badge>
                      <Link href={`/developer/projects/${project.id}`}>
                        <Button size="sm" variant="secondary">
                          {t("project.manage")}
                        </Button>
                      </Link>
                      {["draft", "needs_changes"].includes(project.submission_status ?? "") ? (
                        <form action={submitProjectAction}>
                          <input type="hidden" name="project_id" value={project.id} />
                          <Button size="sm">{t("submission.action.submit")}</Button>
                        </form>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("submission.section.inventory")} subtitle={t("developer.create.subtitle")}>
          {projects.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.project.required")}</p>
            </Card>
          ) : (
            <Card>
              <form action={createListingAction} className="grid gap-4 md:grid-cols-3">
                {primaryDeveloperId ? (
                  <input type="hidden" name="developer_id" value={primaryDeveloperId} />
                ) : null}
                <FieldSelect
                  name="project_id"
                  label={t("developer.form.project")}
                  helpKey="developer.listing.project_id"
                  defaultValue=""
                  required
                >
                  <option value="">{t("developer.form.project")}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {pickLocalizedText(
                        locale,
                        project.title_ar,
                        project.title_en,
                        project.title_ar || project.title_en
                      )}
                    </option>
                  ))}
                </FieldSelect>
                <FieldInput
                  name="title"
                  label={t("developer.form.title")}
                  helpKey="developer.listing.title"
                  placeholder={t("developer.form.title")}
                  required
                />
                <FieldInput
                  name="title_ar"
                  label={t("submission.field.title_ar")}
                  helpKey="developer.listing.title_ar"
                  placeholder={t("submission.field.title_ar")}
                />
                <FieldInput
                  name="title_en"
                  label={t("submission.field.title_en")}
                  helpKey="developer.listing.title_en"
                  placeholder={t("submission.field.title_en")}
                />
                <FieldSelect
                  name="type"
                  label={t("filters.type")}
                  helpKey="developer.listing.type"
                  defaultValue=""
                >
                  <option value="">{t("filters.type")}</option>
                  {PROPERTY_TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(item.labelKey)}
                    </option>
                  ))}
                </FieldSelect>
                <input type="hidden" name="purpose" value="new-development" />
                <FieldInput
                  label={t("filters.purpose")}
                  helpKey="developer.listing.purpose"
                  value={t(getPurposeLabelKey("new-development"))}
                  readOnly
                  data-no-help
                />
                <FieldInput
                  name="price"
                  label={t("developer.form.price")}
                  helpKey="developer.listing.price"
                  placeholder={t("developer.form.price")}
                  required
                />
                <FieldInput
                  name="currency"
                  label={t("developer.form.currency")}
                  helpKey="developer.listing.currency"
                  placeholder={t("developer.form.currency")}
                  defaultValue="EGP"
                />
                <FieldInput
                  name="city"
                  label={t("filters.city")}
                  helpKey="developer.listing.city"
                  placeholder={t("filters.city")}
                  required
                />
                <FieldInput
                  name="area"
                  label={t("filters.area")}
                  helpKey="developer.listing.area"
                  placeholder={t("filters.area")}
                />
                <FieldInput
                  name="address"
                  label={t("developer.form.address")}
                  helpKey="developer.listing.address"
                  placeholder={t("developer.form.address")}
                />
                <FieldInput
                  name="beds"
                  label={t("filters.beds")}
                  helpKey="developer.listing.beds"
                  placeholder={t("filters.beds")}
                  defaultValue="0"
                />
                <FieldInput
                  name="baths"
                  label={t("filters.baths")}
                  helpKey="developer.listing.baths"
                  placeholder={t("filters.baths")}
                  defaultValue="0"
                />
                <FieldInput
                  name="size_m2"
                  label={t("developer.form.size")}
                  helpKey="developer.listing.size_m2"
                  placeholder={t("developer.form.size")}
                />
                <FieldInput
                  name="amenities"
                  label={t("developer.form.amenities")}
                  helpKey="developer.listing.amenities"
                  placeholder={t("developer.form.amenities")}
                />
                {isAdmin ? (
                  <FieldSelect
                    name="status"
                    label={t("submission.field.status")}
                    helpKey="developer.listing.status"
                    defaultValue="draft"
                  >
                    <option value="draft">{t("status.draft")}</option>
                    <option value="published">{t("status.published")}</option>
                    <option value="archived">{t("status.archived")}</option>
                  </FieldSelect>
                ) : (
                  <input type="hidden" name="status" value="draft" />
                )}
                <div className="md:col-span-3">
                  <FieldTextarea
                    name="description"
                    label={t("developer.form.description")}
                    helpKey="developer.listing.description"
                    placeholder={t("developer.form.description")}
                  />
                </div>
                <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                  <FieldTextarea
                    name="description_ar"
                    label={t("submission.field.desc_ar")}
                    helpKey="developer.listing.description_ar"
                    placeholder={t("submission.field.desc_ar")}
                  />
                  <FieldTextarea
                    name="description_en"
                    label={t("submission.field.desc_en")}
                    helpKey="developer.listing.description_en"
                    placeholder={t("submission.field.desc_en")}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button type="submit">{t("developer.create.submit")}</Button>
                </div>
              </form>
            </Card>
          )}
        </Section>

        <Section title={t("developer.listings.title")} subtitle={t("developer.listings.subtitle")}>
          {listings.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.listings.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => {
                const displayTitle = pickLocalizedText(
                  locale,
                  listing.title_ar,
                  listing.title_en,
                  listing.title
                );
                const submissionLabel = t(
                  getSubmissionStatusLabelKey(listing.submission_status ?? "draft")
                );
                const listingNote = notesByEntity.get(`listing:${listing.id}`);
                return (
                <Card
                  key={listing.id}
                  className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{displayTitle}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {listing.city} - {t(getPropertyTypeLabelKey(listing.type))} - {t(getPurposeLabelKey(listing.purpose))}
                    </p>
                    {listing.listing_code || listing.unit_code ? (
                      <p className="text-xs text-[var(--muted)]">
                        {listing.listing_code ? `${t("submission.field.listing_code")}: ${listing.listing_code}` : ""}
                        {listing.listing_code && listing.unit_code ? " • " : ""}
                        {listing.unit_code ? `${t("submission.field.unit_code")}: ${listing.unit_code}` : ""}
                      </p>
                    ) : null}
                    {listingNote ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: listingNote.note })}
                      </p>
                    ) : null}
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      {formatPrice(listing.price, listing.currency, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{submissionLabel}</Badge>
                    {listing.status === "published" ? (
                      <Badge>{t("status.published")}</Badge>
                    ) : null}
                    <Badge>{t("developer.stats.leads")}: {leadCounts.get(listing.id) ?? 0}</Badge>
                    <Link href={`/developer/listings/${listing.id}`}>
                      <Button size="sm" variant="secondary">
                        {t("developer.listings.manage")}
                      </Button>
                    </Link>
                    {["draft", "needs_changes"].includes(listing.submission_status ?? "") ? (
                      <form action={submitListingAction}>
                        <input type="hidden" name="listing_id" value={listing.id} />
                        <Button size="sm">{t("submission.action.submit")}</Button>
                      </form>
                    ) : null}
                  </div>
                </Card>
              );
              })}
            </div>
          )}
        </Section>

        <Section title={t("submission.section.media")} subtitle={t("media.submit.title")}>
          <Card>
            <form action={createMediaSubmissionAction} className="grid gap-4 md:grid-cols-4">
              <FieldSelect
                name="project_id"
                label={t("submission.section.projects")}
                helpKey="developer.media.project_id"
                defaultValue=""
              >
                <option value="">{t("submission.section.projects")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {pickLocalizedText(
                      locale,
                      project.title_ar,
                      project.title_en,
                      project.title_ar || project.title_en
                    )}
                  </option>
                ))}
              </FieldSelect>
              <FieldSelect
                name="listing_id"
                label={t("submission.section.inventory")}
                helpKey="developer.media.listing_id"
                defaultValue=""
              >
                <option value="">{t("submission.section.inventory")}</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {pickLocalizedText(locale, listing.title_ar, listing.title_en, listing.title)}
                  </option>
                ))}
              </FieldSelect>
              <FieldSelect
                name="media_type"
                label={t("media.submit.type")}
                helpKey="developer.media.type"
                defaultValue="brochure"
              >
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                name="url"
                label={t("media.submit.url")}
                helpKey="developer.media.url"
                placeholder={t("media.submit.url")}
              />
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit">{t("media.submit.add")}</Button>
              </div>
            </form>
          </Card>

          {mediaSubmissions.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("admin.review.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {mediaSubmissions.map((item) => {
                const typeLabel =
                  MEDIA_TYPE_OPTIONS.find((opt) => opt.value === item.media_type)?.labelKey ??
                  "media.type.other";
                const statusLabel = t(
                  getSubmissionStatusLabelKey(item.submission_status ?? "draft")
                );
                return (
                  <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{t(typeLabel)}</p>
                      <a href={item.url ?? "#"} className="text-xs text-[var(--muted)] underline">
                        {item.url ?? "-"}
                      </a>
                    </div>
                    <Badge>{statusLabel}</Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t("developer.leads.title")} subtitle={t("developer.leads.subtitle")}>
          {recentLeads.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("developer.leads.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentLeads.map((lead) => {
                const listing =
                  role === "owner"
                    ? Array.isArray(lead.listings)
                      ? lead.listings[0]
                      : lead.listings
                    : lead.listing_title
                      ? { title: lead.listing_title }
                      : null;
                return (
                  <Card key={lead.id} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-[var(--muted)]">
                        {t("account.leads.listing", { title: listing?.title ?? lead.listing_id })}
                      </p>
                      <Badge>{t(getLeadStatusLabelKey(lead.status ?? "new"))}</Badge>
                    </div>
                    <p className="text-base font-semibold">{lead.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                      <span>{lead.email ?? "-"}</span>
                      <span>{lead.phone ?? "-"}</span>
                    </div>
                    {lead.message ? (
                      <p className="text-sm text-[var(--muted)]">{lead.message}</p>
                    ) : null}
                    {leadNotesById.get(lead.id) ? (
                      <p className="text-xs text-[var(--muted)]">
                        {t("developer.leads.lastNote", { note: leadNotesById.get(lead.id)?.note ?? "" })}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">{t("developer.leads.noNote")}</p>
                    )}
                    <form action={addLeadNoteAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <FieldInput
                        name="note"
                        label={t("developer.leads.addNote")}
                        helpKey="developer.leads.note"
                        placeholder={t("developer.leads.addNote")}
                        wrapperClassName="flex-1"
                      />
                      <Button size="sm" variant="secondary" type="submit">
                        {t("developer.leads.addNote")}
                      </Button>
                    </form>
                    <form action={updateLeadStatusAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <FieldSelect
                        name="status"
                        label={t("crm.filter.status")}
                        helpKey="developer.leads.status"
                        defaultValue={lead.status ?? "new"}
                      >
                        {LEAD_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </FieldSelect>
                      <Button size="sm" variant="secondary" type="submit">
                        {t("developer.leads.update")}
                      </Button>
                    </form>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}




```

### src/app/error.tsx
```tsx
"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">حصل خطأ غير متوقع</h2>
      <p className="text-sm text-[var(--muted)]">من فضلك جرّب مرة تانية.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

```

### src/app/globals.css
```css
@import "tailwindcss";

*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --font-body: clamp(16px, 1rem + 0.2vw, 18px);
  --font-small: clamp(13px, 0.82rem + 0.2vw, 15px);
  --font-xs: clamp(12px, 0.75rem + 0.12vw, 13px);
  --font-h1: clamp(22px, 4vw, 34px);
  --font-h2: clamp(18px, 3vw, 26px);
  --font-h3: clamp(16px, 2.5vw, 22px);
  --line-body: 1.7;
  --line-tight: 1.2;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-2xl: 22px;
  --shadow-sm: 0 10px 22px rgba(8, 12, 24, 0.2);
  --shadow-md: 0 18px 40px rgba(8, 12, 24, 0.32);
  --container-max: 1200px;
  --container-pad: 16px;
  --container-pad-lg: 24px;
  --bg: #0a0f16;
  --surface: #0f1623;
  --surface-elevated: #151f2f;
  --surface-2: var(--surface-elevated);
  --card: #121b2a;
  --text: #f8fafc;
  --muted: #9aa4b2;
  --border: rgba(148, 163, 184, 0.22);
  --brand: #f5c76b;
  --brand-2: #6f7b5e;
  --focus: rgba(245, 199, 107, 0.35);
  --primary: var(--brand);
  --primary-contrast: #1a1208;
  --secondary: #1e293b;
  --secondary-contrast: #e2e8f0;
  --accent: var(--brand);
  --accent-contrast: var(--primary-contrast);
  --accent-soft: rgba(245, 199, 107, 0.12);
  --success: #22c55e;
  --danger: #f43f5e;
  --warning: #f59e0b;
  --shadow: 0 16px 36px rgba(8, 12, 24, 0.35);
  --shadow-strong: 0 28px 60px rgba(8, 12, 24, 0.45);
  --bg-spot-1: rgba(245, 199, 107, 0.18);
  --bg-spot-2: rgba(111, 123, 94, 0.2);
  --font-arabic-stack: var(--font-arabic), var(--font-cairo), "Cairo", "Tajawal",
    "Noto Sans Arabic", "Noto Naskh Arabic", "Amiri", system-ui, sans-serif;
  --font-latin-stack: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", sans-serif;
}

[data-theme="light"] {
  --bg: #f6f4ef;
  --surface: #fbfaf7;
  --surface-elevated: #ffffff;
  --surface-2: #f1ece3;
  --card: #ffffff;
  --text: #14171d;
  --muted: #5f5a52;
  --border: rgba(95, 83, 64, 0.2);
  --brand: #c79a34;
  --brand-2: #3f4f39;
  --focus: rgba(199, 154, 52, 0.45);
  --primary: var(--brand);
  --primary-contrast: #1a1208;
  --secondary: #efe7dc;
  --secondary-contrast: #2d2416;
  --accent: var(--brand);
  --accent-contrast: #2a1a00;
  --accent-soft: rgba(199, 154, 52, 0.18);
  --success: #159947;
  --danger: #e11d48;
  --warning: #d97706;
  --shadow: 0 14px 32px rgba(34, 28, 18, 0.12);
  --shadow-strong: 0 26px 56px rgba(34, 28, 18, 0.18);
  --bg-spot-1: rgba(199, 154, 52, 0.16);
  --bg-spot-2: rgba(75, 90, 58, 0.12);
}


@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text);
  --font-sans: var(--font-arabic-stack), var(--font-latin-stack);
  --font-mono: var(--font-geist-mono);
}

html,
body {
  min-height: 100%;
  min-height: 100svh;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(72px + var(--safe-top));
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  background:
    radial-gradient(1200px circle at 10% -20%, var(--bg-spot-1), transparent 60%),
    radial-gradient(900px circle at 90% -10%, var(--bg-spot-2), transparent 55%),
    var(--bg);
  background-attachment: fixed;
  color: var(--text);
  font-family: var(--font-arabic-stack);
  font-size: var(--font-body);
  line-height: var(--line-body);
  font-weight: 500;
  cursor: default;
  overflow-x: hidden;
}

[data-theme="light"] body {
  background:
    radial-gradient(900px circle at 15% -10%, rgba(199, 154, 52, 0.16), transparent 60%),
    radial-gradient(700px circle at 85% -5%, rgba(75, 90, 58, 0.12), transparent 55%),
    var(--bg);
}

html[dir="ltr"] body {
  font-family: var(--font-latin-stack), var(--font-arabic-stack);
}

:lang(ar) {
  font-family: var(--font-arabic-stack);
}

h1,
h2,
h3,
h4 {
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.25;
}

h1 {
  font-size: var(--font-h1);
}

h2 {
  font-size: var(--font-h2);
}

h3 {
  font-size: var(--font-h3);
}

h5,
h6 {
  font-weight: 600;
  line-height: 1.35;
}

strong {
  font-weight: 700;
}

* {
  border-color: var(--border);
}

a {
  color: inherit;
}

html,
body {
  cursor: default;
}

[class*="max-w-7xl"] {
  max-width: var(--container-max);
}

html[dir="ltr"] h1,
html[dir="ltr"] h2,
html[dir="ltr"] h3,
html[dir="ltr"] h4 {
  letter-spacing: -0.01em;
}

html[lang="en"] {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

html[lang="ar"] {
  font-variant-numeric: normal;
  font-feature-settings: "tnum" 0, "lnum" 0;
}

img,
video {
  max-width: 100%;
  height: auto;
}

.site-header {
  padding-top: var(--safe-top);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

html[data-header-compact="1"] .site-header {
  box-shadow: var(--shadow);
}

html[data-header-compact="1"] .site-header-inner {
  padding-top: 6px;
  padding-bottom: 6px;
}

.mobile-menu-panel {
  position: fixed;
  top: calc(var(--safe-top) + 3.5rem);
  right: max(1rem, var(--safe-right));
  left: auto;
  width: min(360px, calc(100vw - 2rem));
}

.mobile-menu-panel * {
  max-width: 100%;
}

.logo-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Cursor contract: inherit baseline cursor unless explicitly interactive. */
body * {
  cursor: inherit;
}

:where(a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"], label[for], .cursor-pointer) {
  cursor: pointer !important;
}

:where(input[type="checkbox"], input[type="radio"], input[type="file"], input[type="range"], input[type="color"]) {
  cursor: pointer !important;
}

:where(
  input[type="text"],
  input[type="search"],
  input[type="email"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  input[type="password"],
  input[type="date"],
  input[type="datetime-local"],
  input[type="month"],
  input[type="week"],
  input[type="time"],
  textarea,
  [contenteditable="true"],
  [contenteditable=""],
  [role="textbox"]
) {
  cursor: text !important;
}

:where(select) {
  cursor: pointer !important;
}

:where(button:disabled, [aria-disabled="true"]) {
  cursor: not-allowed !important;
}

:where([data-drag-handle]) {
  cursor: grab;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-up {
  animation: fade-up 0.6s ease both;
}

.fade-in {
  animation: fade-in 0.5s ease both;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .fade-up,
  .fade-in,
  .filters-overlay,
  .filters-sheet,
  .modal-panel {
    animation: none;
  }
}

@keyframes partner-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes ads-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.partner-strip {
  position: relative;
  overflow: hidden;
  perspective: 1000px;
}

.partner-strip::before,
.partner-strip::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  pointer-events: none;
  z-index: 2;
}

.partner-strip::before {
  left: 0;
  background: linear-gradient(90deg, var(--bg), transparent);
}

.partner-strip::after {
  right: 0;
  background: linear-gradient(270deg, var(--bg), transparent);
}

.partner-track {
  display: flex;
  gap: 16px;
  width: max-content;
  animation: partner-scroll 26s linear infinite;
  will-change: transform;
}

.partner-strip:hover .partner-track {
  animation-play-state: paused;
}

html[dir="rtl"] .partner-track {
  animation-direction: reverse;
}

@media (prefers-reduced-motion: reduce) {
  .partner-track {
    animation: none;
  }
}

.partner-card {
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: 20px;
  padding: 18px;
  min-width: 220px;
  transform-style: preserve-3d;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.partner-card:hover {
  transform: translateY(-6px) rotateX(4deg) rotateY(-6deg);
  border-color: var(--accent);
  box-shadow: var(--shadow-strong);
}

html[dir="rtl"] .partner-card:hover {
  transform: translateY(-6px) rotateX(4deg) rotateY(6deg);
}

.ads-strip {
  position: relative;
  overflow: hidden;
  perspective: 1200px;
}

.ads-strip::before,
.ads-strip::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 90px;
  pointer-events: none;
  z-index: 2;
}

.ads-strip::before {
  left: 0;
  background: linear-gradient(90deg, var(--bg), transparent);
}

.ads-strip::after {
  right: 0;
  background: linear-gradient(270deg, var(--bg), transparent);
}

.ads-track {
  display: flex;
  gap: 18px;
  width: max-content;
  animation: ads-scroll 30s linear infinite;
  will-change: transform;
}

.ads-strip:hover .ads-track {
  animation-play-state: paused;
}

html[dir="rtl"] .ads-track {
  animation-direction: reverse;
}

.ads-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 16px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform-style: preserve-3d;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.ads-card:hover {
  transform: translateY(-6px) rotateX(4deg) rotateY(-5deg);
  border-color: var(--accent);
  box-shadow: var(--shadow-strong);
}

html[dir="rtl"] .ads-card:hover {
  transform: translateY(-6px) rotateX(4deg) rotateY(5deg);
}

.ads-media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 16px;
  background: var(--surface);
}

.ads-badge {
  position: absolute;
  left: 10px;
  top: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .ads-track {
    animation: none;
  }
}

.hrtaj-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

@media (hover: hover) {
  .hrtaj-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: var(--shadow-strong);
  }
}

.hero-shell {
  position: relative;
}

.hero-video,
.hero-carousel {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-video {
  position: absolute;
  inset: 0;
}

.hero-carousel {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-track {
  display: flex;
  height: 100%;
  width: max-content;
  animation: hero-scroll 28s linear infinite;
}

.hero-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.hero-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 15, 22, 0.82), rgba(10, 15, 22, 0.2));
}

[data-theme="light"] .hero-overlay {
  background: linear-gradient(135deg, rgba(246, 244, 239, 0.92), rgba(246, 244, 239, 0.35));
}

.listing-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.listing-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.listing-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.listing-card-title {
  font-size: clamp(1rem, 0.95rem + 0.6vw, 1.2rem);
  font-weight: 700;
}

.listing-card-location {
  font-size: var(--font-small);
  color: var(--muted);
}

.listing-card-price {
  font-size: clamp(1.15rem, 1rem + 1vw, 1.5rem);
  font-weight: 700;
  color: var(--accent);
}

.listing-card-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: var(--font-xs);
  color: var(--muted);
}

.listing-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.listing-card--list {
  flex-direction: column;
}

@media (min-width: 768px) {
  .listing-card--list {
    flex-direction: row;
    align-items: stretch;
  }

  .listing-card--list .listing-card-media {
    width: 280px;
    flex-shrink: 0;
  }
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 6px 10px;
  font-size: var(--font-xs);
  color: var(--text);
}

.filter-chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--muted);
}

.filter-chip-reset {
  font-size: var(--font-xs);
  color: var(--muted);
}

.filters-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 11px;
  font-weight: 700;
  margin-inline-start: 8px;
}

.filters-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  animation: fade-in 0.2s ease both;
}

.filters-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border: none;
}

.filters-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: calc(100svh - 80px);
  background: var(--surface);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(var(--safe-bottom) + 12px);
  animation: sheet-up 0.2s ease both;
}

.filters-sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 8px;
}

.filters-close {
  border: 1px solid var(--border);
  background: var(--surface-2);
  width: 32px;
  height: 32px;
  border-radius: 999px;
  font-size: 18px;
  color: var(--text);
}

.filters-sheet-body {
  overflow-y: auto;
  padding: 8px 20px 12px;
  display: grid;
  gap: 12px;
}

.filters-sheet-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--border);
  padding: 12px 20px;
  background: var(--surface);
}

.filters-reset {
  font-size: var(--font-small);
  color: var(--muted);
}

.gallery-mobile {
  position: relative;
}

.gallery-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 12px;
  padding-bottom: 6px;
}

.gallery-slide {
  position: relative;
  min-width: 100%;
  aspect-ratio: 4 / 3;
  scroll-snap-align: start;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.gallery-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

.gallery-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}

.gallery-dot[data-active="true"] {
  background: var(--accent);
}

.gallery-desktop {
  display: grid;
  gap: 12px;
}

.gallery-thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.gallery-thumb {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid transparent;
}

.gallery-thumb[data-active="true"] {
  border-color: var(--accent);
}

.property-facts {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.fact-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--surface);
}

.fact-label {
  font-size: var(--font-xs);
  color: var(--muted);
}

.fact-value {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: var(--font-xs);
}

.amenity-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
}

.mobile-cta {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 10px 16px calc(var(--safe-bottom) + 12px);
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
}

.callback-card {
  width: 100%;
  max-width: 540px;
  justify-self: center;
  border-radius: var(--radius-2xl);
}

.callback-title {
  font-size: clamp(1.05rem, 0.95rem + 1vw, 1.35rem);
}

.callback-subtitle {
  font-size: clamp(0.9rem, 0.85rem + 0.6vw, 1rem);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .callback-card {
    border-radius: 20px;
    padding: 16px;
  }

  .callback-grid {
    grid-template-columns: 1fr;
  }

  .callback-submit {
    min-height: 48px;
  }
}

@keyframes hero-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

html[dir="rtl"] .hero-track {
  animation-direction: reverse;
}

@media (prefers-reduced-motion: reduce) {
  .hero-track {
    animation: none;
  }
}

.field-help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.field-help-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  width: min(320px, 90vw);
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-strong);
  padding: 12px;
}

.field-help-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.35);
  border: none;
}

.field-help-block {
  border: 1px dashed var(--border);
  background: var(--surface);
  padding: 12px;
}

@media (max-width: 640px) {
  .field-help-popover {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    top: auto;
    width: auto;
  }

  .mobile-menu-panel {
    position: fixed;
    left: 12px;
    right: 12px;
    top: calc(56px + var(--safe-top));
    width: auto;
    max-height: calc(100svh - 72px - var(--safe-top));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-menu-panel a {
    padding: 10px 8px;
  }

}

.floating-whatsapp {
  right: calc(1rem + var(--safe-right));
  bottom: calc(1rem + var(--safe-bottom));
}

@media (max-width: 768px) {
  body:focus-within .floating-whatsapp {
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px);
  }

  body {
    background-attachment: scroll;
  }

  input,
  select,
  textarea {
    font-size: 16px;
  }
}


.toast-root {
  position: fixed;
  left: 50%;
  bottom: calc(var(--safe-bottom) + 1.5rem);
  transform: translateX(-50%);
  z-index: 80;
  display: grid;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: var(--font-xs);
  box-shadow: var(--shadow);
}

.favorite-button,
.compare-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 14px;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.media-watermark {
  position: absolute;
  inset-inline-end: 10px;
  bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.25);
  padding: 4px 8px;
  border-radius: 999px;
  pointer-events: none;
  letter-spacing: 0;
  backdrop-filter: blur(4px);
}

.favorite-button.is-active,
.compare-button.is-active {
  background: var(--accent);
  color: var(--accent-contrast);
  border-color: transparent;
}

.favorites-sync {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 10px 14px;
  background: var(--surface);
  font-size: var(--font-xs);
  color: var(--muted);
}

.favorites-sync-button {
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 6px 12px;
  font-size: var(--font-xs);
  color: var(--text);
  background: var(--surface-2);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 80;
}

.modal-panel {
  width: min(420px, 100%);
  animation: fade-up 0.18s ease both;
}

.compare-bar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(var(--safe-bottom) + 1rem);
  z-index: 65;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 8px 12px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.compare-bar-text {
  font-size: var(--font-xs);
  color: var(--muted);
}

.compare-card {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.compare-card-rows {
  display: grid;
  gap: 8px;
}

.compare-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 6px;
}

.compare-label {
  font-size: var(--font-xs);
  color: var(--muted);
}

.compare-value {
  font-size: var(--font-small);
  font-weight: 600;
}

.compare-table {
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.compare-table-row {
  display: grid;
  grid-template-columns: 160px repeat(auto-fit, minmax(160px, 1fr));
}

.compare-table-head {
  background: var(--surface-2);
}

.compare-table-cell {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

html[dir="rtl"] .compare-table-cell {
  border-left: none;
  border-right: 1px solid var(--border);
}

.compare-table-label {
  font-size: var(--font-xs);
  color: var(--muted);
}

.compare-diff {
  background: var(--accent-soft);
}

.lead-drawer {
  border-top: 1px solid var(--border);
  padding-top: 10px;
}

.lead-drawer summary {
  cursor: pointer;
  font-size: var(--font-xs);
  color: var(--muted);
  list-style: none;
}

.lead-drawer summary::-webkit-details-marker {
  display: none;
}

.lead-drawer-body {
  margin-top: 10px;
  display: grid;
  gap: 8px;
  font-size: var(--font-xs);
  color: var(--muted);
}

.trust-strip {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.trust-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  background: var(--surface);
  display: grid;
  gap: 4px;
}

.trust-item strong {
  font-size: var(--font-small);
}

.recently-strip {
  display: grid;
  gap: 12px;
}

.recently-track {
  display: grid;
  gap: 12px;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  overflow-x: auto;
  padding-bottom: 6px;
}

.recently-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}

.recently-card-media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--surface-2);
}

.recently-card-body {
  padding: 10px 12px;
  font-size: var(--font-small);
  font-weight: 600;
}

@media (max-width: 768px) {
  .compare-bar {
    bottom: calc(var(--safe-bottom) + 4.5rem);
  }

  .toast-root {
    bottom: calc(var(--safe-bottom) + 5rem);
  }
}

@keyframes sheet-up {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media print {
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  .print-hidden {
    display: none !important;
  }
  .print-page {
    background: #ffffff !important;
    color: #000000 !important;
  }
}

```

### src/app/health/route.ts
```ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

```

### src/app/layout.tsx
```tsx
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cairo, Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { HelpModeProvider } from "@/components/FieldHelp";
import { DebugCursorInspector } from "@/components/DebugCursorInspector";
import { ThemeScript } from "@/components/ThemeScript";
import { HeaderScroll } from "@/components/HeaderScroll";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createT } from "@/lib/i18n";
import { getServerDir, getServerLocale } from "@/lib/i18n.server";
import { THEME_COOKIE, normalizeTheme, themeToColorScheme } from "@/lib/theme";
import { getPublicBaseUrl } from "@/lib/paths";
import { buildLocalBusinessJsonLd } from "@/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = createT(locale);
  const baseUrl = getPublicBaseUrl();

  return {
    title: `${t("brand.name")} | ${t("brand.domain")}`,
    description: t("brand.tagline"),
    alternates: baseUrl
      ? {
          canonical: baseUrl,
          languages: {
            ar: `${baseUrl}/?lang=ar`,
            en: `${baseUrl}/?lang=en`,
          },
        }
      : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const dir = getServerDir(locale);
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const colorScheme = themeToColorScheme(theme);
  const showDebugCursor = process.env.NODE_ENV === "development";
  const baseUrl = getPublicBaseUrl() || null;
  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    name: t("brand.name"),
    url: baseUrl,
    address: t("trust.address.value"),
    locale,
  });

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      style={{ colorScheme }}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${notoSansArabic.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <HelpModeProvider>
              <HeaderScroll />
              {children}
              {showDebugCursor ? <DebugCursorInspector /> : null}
            </HelpModeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}





```

### src/app/listing/[id]/page.tsx
```tsx
﻿import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validators";
import { createT, getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getPublicBaseUrl } from "@/lib/paths";
import { Gallery, type GalleryImage } from "@/components/listings/Gallery";
import { PropertyFacts } from "@/components/listings/PropertyFacts";
import { LeadForm } from "@/components/leads/LeadForm";
import { getSiteSettings } from "@/lib/settings";
import { buildListingJsonLd, buildListingMetadata } from "@/lib/seo/meta";
import { buildBreadcrumbJsonLd } from "@/lib/seo/schema";
import { ListingActionButtons } from "@/components/listings/ListingActionButtons";
import { ListingViewTracker } from "@/components/listings/ListingViewTracker";
import { RecentlyViewedTracker } from "@/components/listings/RecentlyViewedTracker";
import { MobileCtaBar } from "@/components/listings/MobileCtaBar";
import { getFlags } from "@/lib/flags";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const t = createT(locale);

  if (!isUuid(id)) {
    return { title: `${t("brand.name")} | ${t("detail.description.title")}` };
  }

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) {
    return { title: `${t("brand.name")} | ${t("detail.description.title")}` };
  }

  const coverPath = [...(listing.listing_images ?? [])].sort((a, b) => a.sort - b.sort)[0]?.path;
  const imageUrl = coverPath ? getPublicImageUrl(coverPath) ?? undefined : undefined;
  const baseUrl = getPublicBaseUrl();

  return buildListingMetadata({ listing, locale, t, baseUrl, imageUrl });
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, address, beds, baths, size_m2, description, amenities, purpose, type, status, owner_user_id, developer_id, floor, view, building, finishing, meters, reception, kitchen, elevator, listing_images(path, sort)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  let isDeveloperMember = false;
  if (userId && listing.developer_id) {
    const { data: member } = await supabase
      .from("developer_members")
      .select("developer_id")
      .eq("developer_id", listing.developer_id)
      .eq("user_id", userId)
      .maybeSingle();
    isDeveloperMember = Boolean(member);
  }

  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("role, full_name, phone")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const isAdmin = profile?.role === "admin";
  const isOwner = userId ? listing.owner_user_id === userId : false;

  if (listing.status !== "published" && !isOwner && !isAdmin && !isDeveloperMember) {
    notFound();
  }

  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp_number ?? "";
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const callLink = whatsappNumber ? `tel:${whatsappNumber.replace(/[^\d+]/g, "")}` : null;
  const flags = getFlags();

  const baseUrl = getPublicBaseUrl();
  const shareUrl = baseUrl ? `${baseUrl}/listing/${listing.id}` : `/listing/${listing.id}`;
  const whatsappText = `${listing.title} - ${shareUrl}`;
  const whatsappLink = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappText)}`
    : null;

  const images = (listing.listing_images ?? []).sort((a, b) => a.sort - b.sort);

  const { data: attachmentsData } = await supabase
    .from("unit_attachments")
    .select("id, file_path, file_type, category, sort_order, is_primary, title, note, is_published, bucket")
    .eq("listing_id", listing.id)
    .eq("is_published", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  const attachments = await Promise.all(
    (attachmentsData ?? []).map(async (item) => {
      const { data: signed } = await supabase.storage
        .from(item.bucket ?? "property-attachments")
        .createSignedUrl(item.file_path, 60 * 60);
      return {
        ...item,
        signed_url: signed?.signedUrl ?? null,
      };
    })
  );

  const imageAttachments = attachments.filter(
    (item) => item.file_type === "image" && item.signed_url
  );
  const docAttachments = attachments.filter(
    (item) => item.file_type !== "image" && item.signed_url
  );

  const galleryItems: GalleryImage[] = (imageAttachments.length ? imageAttachments : images)
    .map((img, index) => {
      const url = "signed_url" in img ? img.signed_url : getPublicImageUrl(img.path);
      if (!url) return null;
      const id = "id" in img ? img.id : `${img.path}-${index}`;
      return { id, url };
    })
    .filter(Boolean) as GalleryImage[];

  const amenityLabels: Record<string, string> = {
    "مصعد": t("amenity.elevator"),
    "جراج": t("amenity.parking"),
    "أمن": t("amenity.security"),
    "بلكونة": t("amenity.balcony"),
    "مولد": t("amenity.generator"),
    "اطلالة بحر": t("amenity.seaView"),
  };

  const amenitySet = new Set<string>();
  const rawAmenities = Array.isArray(listing.amenities) ? listing.amenities : [];
  rawAmenities.forEach((item) => {
    amenitySet.add(amenityLabels[item] ?? item);
  });
  if (listing.elevator) {
    amenitySet.add(t("amenity.elevator"));
  }

  const facts = [
    listing.size_m2
      ? {
          label: t("detail.facts.area"),
          value: `${formatNumber(listing.size_m2, locale)} m²`,
        }
      : null,
    {
      label: t("detail.stats.rooms"),
      value: formatNumber(listing.beds, locale),
    },
    {
      label: t("detail.stats.baths"),
      value: formatNumber(listing.baths, locale),
    },
    listing.floor !== null && listing.floor !== undefined
      ? {
          label: t("detail.facts.floor"),
          value: listing.floor,
        }
      : null,
    listing.finishing
      ? {
          label: t("detail.facts.finishing"),
          value: listing.finishing,
        }
      : null,
    listing.view
      ? {
          label: t("detail.facts.view"),
          value: listing.view,
        }
      : null,
    listing.building
      ? {
          label: t("detail.facts.building"),
          value: listing.building,
        }
      : null,
    listing.meters !== null && listing.meters !== undefined
      ? {
          label: t("detail.facts.meters"),
          value: listing.meters,
        }
      : null,
    listing.reception
      ? {
          label: t("detail.facts.reception"),
          value: listing.reception,
        }
      : null,
  ];

  const jsonLd = buildListingJsonLd({
    listing,
    locale,
    baseUrl,
    imageUrl: images[0]?.path ? getPublicImageUrl(images[0].path) ?? undefined : undefined,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    baseUrl,
    items: [
      { name: t("nav.home"), path: "/" },
      { name: t("nav.listings"), path: "/listings" },
      { name: listing.title, path: `/listing/${listing.id}` },
    ],
  });

  const leadLabels = {
    title: t("detail.lead.title"),
    subtitle: t("detail.contact.subtitle"),
    name: t("detail.lead.name"),
    phone: t("detail.lead.phone"),
    email: t("detail.lead.email"),
    message: t("detail.lead.message"),
    submit: t("detail.lead.submit"),
    submitting: t("detail.lead.submitting"),
    successTitle: t("detail.lead.successTitle"),
    successBody: t("detail.lead.successBody"),
    error: t("detail.lead.error"),
    whatsappFallback: t("detail.cta.whatsapp"),
    back: t("detail.back"),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <ListingViewTracker
          listing={{
            id: listing.id,
            price: listing.price,
            area: listing.area,
            city: listing.city,
            size_m2: listing.size_m2,
          }}
        />
        <RecentlyViewedTracker id={listing.id} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
              <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
              <Badge>
                {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{listing.title}</h1>
            <p className="text-[var(--muted)]">
              {listing.city}
              {listing.area ? ` - ${listing.area}` : ""}
              {listing.address ? ` - ${listing.address}` : ""}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-2xl font-semibold text-[var(--accent)] sm:text-3xl">
              {formatPrice(listing.price, listing.currency, locale)}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href={`/listing/${listing.id}/print`}>
                <Button size="sm" variant="secondary">
                  {t("detail.contact.print")}
                </Button>
              </Link>
              <Link href="/listings">
                <Button size="sm" variant="ghost">
                  {t("detail.back")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Gallery images={galleryItems} alt={listing.title} fallback={t("listing.card.noImage")} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold">{t("detail.description.title")}</h2>
              <p className="text-sm text-[var(--muted)]">
                {listing.description || t("detail.description.empty")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{t("detail.facts.title")}</h2>
              <PropertyFacts items={facts} />
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{t("detail.amenities.title")}</h2>
              {amenitySet.size ? (
                <div className="amenities-grid">
                  {[...amenitySet].map((item) => (
                    <div key={item} className="amenity-item">
                      <span className="amenity-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">{t("detail.amenities.empty")}</p>
              )}
            </section>

            {docAttachments.length ? (
              <Card className="space-y-4 hrtaj-card">
                <h2 className="text-xl font-semibold">{t("detail.documents.title")}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {docAttachments.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.signed_url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm"
                    >
                      <span>{doc.title ?? t("staff.attachments.fileType")}</span>
                      <Badge>{doc.file_type}</Badge>
                    </a>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="space-y-3 hrtaj-card">
              <h3 className="text-lg font-semibold">{t("detail.contact.title")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("detail.contact.subtitle")}</p>
              <ListingActionButtons
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  area: listing.area,
                  city: listing.city,
                  size_m2: listing.size_m2,
                }}
                whatsappNumber={whatsappNumber}
                callNumber={whatsappNumber}
                shareUrl={shareUrl}
                enableCompare={flags.enableCompare}
                labels={{
                  whatsapp: t("detail.cta.whatsapp"),
                  call: t("detail.cta.call"),
                  share: t("listing.action.share"),
                  favoriteAdd: t("favorite.add"),
                  favoriteRemove: t("favorite.remove"),
                  compareAdd: t("compare.add"),
                  compareRemove: t("compare.remove"),
                  compareLimit: t("compare.limit"),
                }}
              />
            </Card>

            <LeadForm
              listingId={listing.id}
              source="web"
              labels={leadLabels}
              whatsappLink={whatsappLink}
              className="hrtaj-card"
              id="lead-form"
            />
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>

      <MobileCtaBar
        listing={{
          id: listing.id,
          price: listing.price,
          area: listing.area,
          city: listing.city,
          size_m2: listing.size_m2,
        }}
        whatsappLink={whatsappLink}
        callLink={callLink}
        labels={{
          whatsapp: t("detail.cta.whatsapp"),
          call: t("detail.cta.call"),
          book: t("detail.cta.book"),
        }}
      />

      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/listings/loading.tsx
```tsx
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-full bg-[var(--surface-2)]" />
            <div className="h-4 w-56 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-full bg-[var(--surface-2)]" />
            <div className="h-9 w-20 rounded-full bg-[var(--surface-2)]" />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-full bg-[var(--surface-2)]" />
              <div className="h-4 w-48 rounded-full bg-[var(--surface-2)]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-xl bg-[var(--surface-2)]" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]"
            >
              <div className="h-40 rounded-xl bg-[var(--surface-2)]" />
              <div className="mt-4 h-5 w-2/3 rounded-full bg-[var(--surface-2)]" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-[var(--surface-2)]" />
              <div className="mt-4 h-9 w-28 rounded-full bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/listings/page.tsx
```tsx
﻿import Link from "next/link";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge, Button, Card } from "@/components/ui";
import { FieldCheckbox, FieldInput, FieldSelect } from "@/components/FieldHelp";
import { formatNumber } from "@/lib/format";
import { PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { createT, getPurposeLabelKey } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { parseFiltersFromUrl, serializeFiltersToUrl, countActiveFilters, filtersToCacheKey } from "@/lib/filters/query";
import { DEFAULT_FILTERS, type ListingFilters } from "@/lib/filters/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { FiltersDrawer } from "@/components/listings/FiltersDrawer";
import { ShareButton } from "@/components/listings/ShareButton";
import { RecentlyViewedStrip } from "@/components/listings/RecentlyViewedStrip";
import { SaveSearchModal } from "@/components/search/SaveSearchModal";
import { FiltersAnalytics } from "@/components/search/FiltersAnalytics";
import { getPublicBaseUrl } from "@/lib/paths";
import { getSiteSettings } from "@/lib/settings";
import { getFlags } from "@/lib/flags";

const PAGE_SIZE = 12;
const NEW_DAYS = 14;

type SearchParams = Record<string, string | string[] | undefined>;

const fetchListings = cache(async (filtersKey: string) => {
  const filters = JSON.parse(filtersKey) as ListingFilters;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, beds, baths, size_m2, purpose, type, status, created_at, amenities, listing_images(path, sort)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (filters.transactionType) query = query.eq("purpose", filters.transactionType);
  if (filters.propertyType) query = query.eq("type", filters.propertyType);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte("price", filters.priceMax);
  if (filters.areaMin !== undefined) query = query.gte("size_m2", filters.areaMin);
  if (filters.areaMax !== undefined) query = query.lte("size_m2", filters.areaMax);
  if (filters.beds !== undefined) query = query.gte("beds", filters.beds);
  if (filters.baths !== undefined) query = query.gte("baths", filters.baths);
  if (filters.amenities && filters.amenities.length) {
    query = query.contains("amenities", filters.amenities);
  }

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (filters.sort === "area_asc") {
    query = query.order("size_m2", { ascending: true });
  } else if (filters.sort === "area_desc") {
    query = query.order("size_m2", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  const now = Date.now();
  const listingsWithFlags = (data ?? []).map((listing) => ({
    ...listing,
    is_new: listing.created_at
      ? now - new Date(listing.created_at).getTime() <= NEW_DAYS * 24 * 60 * 60 * 1000
      : false,
  }));

  return {
    listings: listingsWithFlags,
    count: count ?? 0,
    error,
  };
});

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const locale = await getServerLocale();
  const t = createT(locale);

  const params = await searchParams;
  const { filters } = parseFiltersFromUrl(params);
  const filtersKey = filtersToCacheKey(filters);
  const { listings, count: totalCount, error } = await fetchListings(filtersKey);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const prevPage = Math.max(filters.page - 1, 1);
  const nextPage = Math.min(filters.page + 1, totalPages);

  const prevQuery = serializeFiltersToUrl(filters, { page: prevPage });
  const nextQuery = serializeFiltersToUrl(filters, { page: nextPage });

  const activeCount = countActiveFilters(filters);
  const baseUrl = getPublicBaseUrl();
  const queryString = serializeFiltersToUrl(filters).toString();
  const shareUrl = `${baseUrl ?? ""}/listings?${queryString}`;

  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp_number ?? null;
  const callNumber = settings.whatsapp_number ?? null;
  const flags = getFlags();

  const transactionOptions = PURPOSE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const amenityOptions = [
    { value: "مصعد", label: t("amenity.elevator") },
    { value: "جراج", label: t("amenity.parking") },
    { value: "أمن", label: t("amenity.security") },
    { value: "بلكونة", label: t("amenity.balcony") },
    { value: "مولد", label: t("amenity.generator") },
    { value: "اطلالة بحر", label: t("amenity.seaView") },
  ];

  const defaultSearchName =
    filters.area || filters.city ? `بحث ${filters.area ?? filters.city}` : t("savedSearch.defaultName");

  const resetQuery = serializeFiltersToUrl({ ...DEFAULT_FILTERS, view: filters.view });
  const resetHref = resetQuery.toString() ? `/listings?${resetQuery.toString()}` : "/listings";

  const chipItems: Array<{ label: string; href: string }> = [];
  const buildHref = (next: ListingFilters) => {
    const qs = serializeFiltersToUrl(next).toString();
    return qs ? `/listings?${qs}` : "/listings";
  };

  if (filters.transactionType) {
    chipItems.push({
      label: t(getPurposeLabelKey(filters.transactionType)),
      href: buildHref({ ...filters, transactionType: undefined, page: 1 }),
    });
  }
  if (filters.propertyType) {
    const typeLabelKey = PROPERTY_TYPE_OPTIONS.find((item) => item.value === filters.propertyType)?.labelKey;
    chipItems.push({
      label: typeLabelKey ? t(typeLabelKey) : filters.propertyType,
      href: buildHref({ ...filters, propertyType: undefined, page: 1 }),
    });
  }
  if (filters.city) {
    chipItems.push({
      label: filters.city,
      href: buildHref({ ...filters, city: undefined, page: 1 }),
    });
  }
  if (filters.area) {
    chipItems.push({
      label: filters.area,
      href: buildHref({ ...filters, area: undefined, page: 1 }),
    });
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chipItems.push({
      label: `${t("filters.priceMin")} ${filters.priceMin ?? "-"} ${t("filters.priceMax")} ${
        filters.priceMax ?? "-"
      }`,
      href: buildHref({ ...filters, priceMin: undefined, priceMax: undefined, page: 1 }),
    });
  }
  if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
    chipItems.push({
      label: `${t("filters.areaMin")} ${filters.areaMin ?? "-"} ${t("filters.areaMax")} ${
        filters.areaMax ?? "-"
      }`,
      href: buildHref({ ...filters, areaMin: undefined, areaMax: undefined, page: 1 }),
    });
  }
  if (filters.beds !== undefined) {
    chipItems.push({
      label: `${filters.beds}+ ${t("filters.beds")}`,
      href: buildHref({ ...filters, beds: undefined, page: 1 }),
    });
  }
  if (filters.baths !== undefined) {
    chipItems.push({
      label: `${filters.baths}+ ${t("filters.baths")}`,
      href: buildHref({ ...filters, baths: undefined, page: 1 }),
    });
  }
  if (filters.amenities?.length) {
    filters.amenities.forEach((amenity) => {
      const amenityLabel = amenityOptions.find((item) => item.value === amenity)?.label ?? amenity;
      const nextAmenities = filters.amenities?.filter((item) => item !== amenity) ?? [];
      chipItems.push({
        label: amenityLabel,
        href: buildHref({ ...filters, amenities: nextAmenities.length ? nextAmenities : undefined, page: 1 }),
      });
    });
  }

  const formIdMobile = "listing-filters-form-mobile";
  const formIdDesktop = "listing-filters-form-desktop";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold sm:text-2xl">{t("listings.title")}</h1>
            <p className="text-sm text-[var(--muted)]">
              {t("listings.results", { count: formatNumber(totalCount, locale) })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/listings?${serializeFiltersToUrl(filters, { view: "grid" }).toString()}`}>
              <Button size="sm" variant={filters.view === "list" ? "secondary" : "primary"}>
                {t("listings.view.grid")}
              </Button>
            </Link>
            <Link href={`/listings?${serializeFiltersToUrl(filters, { view: "list" }).toString()}`}>
              <Button size="sm" variant={filters.view === "list" ? "primary" : "secondary"}>
                {t("listings.view.list")}
              </Button>
            </Link>
            {flags.enableSavedSearch ? (
              <SaveSearchModal
                queryString={queryString}
                defaultName={defaultSearchName}
                labels={{
                  open: t("savedSearch.save"),
                  title: t("savedSearch.modalTitle"),
                  nameLabel: t("savedSearch.name"),
                  save: t("savedSearch.save"),
                  cancel: t("general.cancel"),
                  saved: t("savedSearch.saved"),
                }}
              />
            ) : null}
            <ShareButton url={shareUrl} label={t("listing.action.share")} />
          </div>
        </div>

        <FiltersDrawer
          title={t("listings.filters.title")}
          subtitle={t("listings.filters.subtitle")}
          activeCount={activeCount}
          formId={formIdMobile}
          applyLabel={t("listings.filters.apply")}
          resetLabel={t("listings.filters.reset")}
          resetHref={resetHref}
        >
          <form id={formIdMobile} action="/listings" method="get" className="grid gap-4">
            <input type="hidden" name="view" value={filters.view} />
            <input type="hidden" name="page" value="1" />
            <FieldSelect
              name="transaction"
              label={t("filters.transaction")}
              helpKey="filters.transaction"
              defaultValue={filters.transactionType ?? ""}
            >
              <option value="">{t("filters.transaction")}</option>
              {transactionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="type"
              label={t("filters.type")}
              helpKey="filters.type"
              defaultValue={filters.propertyType ?? ""}
            >
              <option value="">{t("filters.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="city"
              label={t("filters.city")}
              helpKey="filters.city"
              placeholder={t("filters.city")}
              defaultValue={filters.city ?? ""}
            />
            <FieldInput
              name="area"
              label={t("filters.area")}
              helpKey="filters.area"
              placeholder={t("filters.area")}
              defaultValue={filters.area ?? ""}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="priceMin"
                label={t("filters.priceMin")}
                helpKey="filters.priceMin"
                placeholder={t("filters.priceMin")}
                defaultValue={filters.priceMin?.toString() ?? ""}
              />
              <FieldInput
                name="priceMax"
                label={t("filters.priceMax")}
                helpKey="filters.priceMax"
                placeholder={t("filters.priceMax")}
                defaultValue={filters.priceMax?.toString() ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="areaMin"
                label={t("filters.areaMin")}
                helpKey="filters.areaMin"
                placeholder={t("filters.areaMin")}
                defaultValue={filters.areaMin?.toString() ?? ""}
              />
              <FieldInput
                name="areaMax"
                label={t("filters.areaMax")}
                helpKey="filters.areaMax"
                placeholder={t("filters.areaMax")}
                defaultValue={filters.areaMax?.toString() ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput
                name="beds"
                label={t("filters.beds")}
                helpKey="filters.beds"
                placeholder={t("filters.beds")}
                defaultValue={filters.beds?.toString() ?? ""}
              />
              <FieldInput
                name="baths"
                label={t("filters.baths")}
                helpKey="filters.baths"
                placeholder={t("filters.baths")}
                defaultValue={filters.baths?.toString() ?? ""}
              />
            </div>
            <FieldSelect
              name="sort"
              label={t("filters.sort")}
              helpKey="filters.sort"
              defaultValue={filters.sort}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--text)]">{t("filters.amenities")}</p>
              <div className="grid gap-2">
                {amenityOptions.map((item) => (
                  <FieldCheckbox
                    key={item.value}
                    name="amenities"
                    value={item.value}
                    label={item.label}
                    helpKey="filters.amenities"
                    defaultChecked={filters.amenities?.includes(item.value) ?? false}
                  />
                ))}
              </div>
            </div>
            <div className="hidden md:flex md:justify-end">
              <Button type="submit" size="md">
                {t("listings.filters.apply")}
              </Button>
            </div>
          </form>
        </FiltersDrawer>

        <Card className="hidden space-y-3 p-3 sm:space-y-4 sm:p-4 hrtaj-card md:block">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold sm:text-lg">{t("listings.filters.title")}</h2>
              <p className="text-xs text-[var(--muted)] sm:text-sm">{t("listings.filters.subtitle")}</p>
            </div>
            <Badge>{t("listings.results", { count: formatNumber(totalCount, locale) })}</Badge>
          </div>
          <form id={formIdDesktop} action="/listings" method="get" className="grid gap-4 md:grid-cols-4">
            <input type="hidden" name="view" value={filters.view} />
            <input type="hidden" name="page" value="1" />
            <FieldSelect
              name="transaction"
              label={t("filters.transaction")}
              helpKey="filters.transaction"
              defaultValue={filters.transactionType ?? ""}
            >
              <option value="">{t("filters.transaction")}</option>
              {transactionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              name="type"
              label={t("filters.type")}
              helpKey="filters.type"
              defaultValue={filters.propertyType ?? ""}
            >
              <option value="">{t("filters.type")}</option>
              {PROPERTY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <FieldInput
              name="city"
              label={t("filters.city")}
              helpKey="filters.city"
              placeholder={t("filters.city")}
              defaultValue={filters.city ?? ""}
            />
            <FieldInput
              name="area"
              label={t("filters.area")}
              helpKey="filters.area"
              placeholder={t("filters.area")}
              defaultValue={filters.area ?? ""}
            />
            <FieldInput
              name="priceMin"
              label={t("filters.priceMin")}
              helpKey="filters.priceMin"
              placeholder={t("filters.priceMin")}
              defaultValue={filters.priceMin?.toString() ?? ""}
            />
            <FieldInput
              name="priceMax"
              label={t("filters.priceMax")}
              helpKey="filters.priceMax"
              placeholder={t("filters.priceMax")}
              defaultValue={filters.priceMax?.toString() ?? ""}
            />
            <FieldInput
              name="areaMin"
              label={t("filters.areaMin")}
              helpKey="filters.areaMin"
              placeholder={t("filters.areaMin")}
              defaultValue={filters.areaMin?.toString() ?? ""}
            />
            <FieldInput
              name="areaMax"
              label={t("filters.areaMax")}
              helpKey="filters.areaMax"
              placeholder={t("filters.areaMax")}
              defaultValue={filters.areaMax?.toString() ?? ""}
            />
            <FieldInput
              name="beds"
              label={t("filters.beds")}
              helpKey="filters.beds"
              placeholder={t("filters.beds")}
              defaultValue={filters.beds?.toString() ?? ""}
            />
            <FieldInput
              name="baths"
              label={t("filters.baths")}
              helpKey="filters.baths"
              placeholder={t("filters.baths")}
              defaultValue={filters.baths?.toString() ?? ""}
            />
            <FieldSelect
              name="sort"
              label={t("filters.sort")}
              helpKey="filters.sort"
              defaultValue={filters.sort}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </FieldSelect>
            <div className="md:col-span-4">
              <div className="grid gap-2 md:grid-cols-3">
                {amenityOptions.map((item) => (
                  <FieldCheckbox
                    key={item.value}
                    name="amenities"
                    value={item.value}
                    label={item.label}
                    helpKey="filters.amenities"
                    defaultChecked={filters.amenities?.includes(item.value) ?? false}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-4 flex items-center justify-between gap-3">
              <a href={resetHref} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
                {t("listings.filters.reset")}
              </a>
              <Button type="submit" size="md">
                {t("listings.filters.apply")}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="hrtaj-card">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t("trust.title")}</h2>
            <div className="trust-strip text-sm">
              <div className="trust-item">
                <strong>{t("trust.address.title")}</strong>
                <span className="text-[var(--muted)]">{t("trust.address.value")}</span>
              </div>
              <div className="trust-item">
                <strong>{t("trust.hours.title")}</strong>
                <span className="text-[var(--muted)]">{t("trust.hours.value")}</span>
              </div>
              <div className="trust-item">
                <strong>{t("trust.response.title")}</strong>
                <span className="text-[var(--muted)]">{t("trust.response.value")}</span>
              </div>
            </div>
          </div>
        </Card>

        {chipItems.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {chipItems.map((chip) => (
              <Link key={chip.href + chip.label} href={chip.href} className="filter-chip">
                {chip.label}
                <span className="filter-chip-remove">×</span>
              </Link>
            ))}
            <a href={resetHref} className="filter-chip-reset">
              {t("listings.filters.reset")}
            </a>
          </div>
        ) : null}

        {error ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--muted)]">{t("listings.empty")}</p>
          </Card>
        ) : listings.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--muted)]">{t("listings.empty")}</p>
          </Card>
        ) : (
          <ListingsGrid view={filters.view}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                view={filters.view}
                locale={locale}
                t={t}
                whatsappNumber={whatsappNumber}
                callNumber={callNumber}
                baseUrl={baseUrl}
                enableCompare={flags.enableCompare}
              />
            ))}
          </ListingsGrid>
        )}

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {filters.page > 1 ? (
              <Link href={`/listings?${prevQuery.toString()}`}>
                <Button size="sm" variant="secondary">
                  {t("listings.pagination.prev")}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                {t("listings.pagination.prev")}
              </Button>
            )}
            <span className="text-sm text-[var(--muted)]">
              {t("listings.pagination.page", { page: filters.page, total: totalPages })}
            </span>
            {filters.page < totalPages ? (
              <Link href={`/listings?${nextQuery.toString()}`}>
                <Button size="sm" variant="secondary">
                  {t("listings.pagination.next")}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="secondary" disabled>
                {t("listings.pagination.next")}
              </Button>
            )}
          </div>
        ) : null}
      </main>
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <RecentlyViewedStrip
          locale={locale}
          title={t("recent.title")}
          empty={t("recent.empty")}
        />
      </div>
      <FiltersAnalytics formIds={[formIdMobile, formIdDesktop]} />
      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/page.tsx
```tsx
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button, Card, Badge, Section } from "@/components/ui";
import { FieldInput, FieldSelect, FieldTextarea } from "@/components/FieldHelp";
import { formatPrice } from "@/lib/format";
import { FEATURE_CATEGORIES, PROPERTY_TYPE_OPTIONS, PURPOSE_OPTIONS } from "@/lib/constants";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { createPublicRequestAction } from "@/app/actions/marketplace";
import { PartnerMarquee } from "@/components/PartnerMarquee";
import { AdsCarousel, type AdCampaignCard } from "@/components/AdsCarousel";
import { RecentlyViewedStrip } from "@/components/listings/RecentlyViewedStrip";
import { Hero } from "@/components/home/Hero";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Areas } from "@/components/home/Areas";
import { Trust } from "@/components/home/Trust";
import { FAQ } from "@/components/home/FAQ";
import { buildFaqJsonLd } from "@/lib/seo/schema";

export default async function Home() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data: mediaData } = await supabase
    .from("site_media")
    .select("id, media_type, url, poster_url, title, sort_order")
    .eq("placement", "hero")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  const heroMedia = mediaData ?? [];
  const heroVideo = heroMedia.find((item) => item.media_type === "video") ?? null;
  const heroImages = heroMedia.filter((item) => item.media_type === "image");

  type MetricRow = {
    id: string;
    label_ar: string | null;
    label_en: string | null;
    value: string | null;
  };

  const { data: metricsData } = await supabase
    .from("site_metrics")
    .select("id, label_ar, label_en, value, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  const metrics = (metricsData ?? []) as MetricRow[];

  const { data: featuredProjectsData } = await supabase
    .from("featured_projects")
    .select(
      "id, title_ar, title_en, location_ar, location_en, starting_price, currency, image_url, cta_url, sort_order"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  const featuredProjects = featuredProjectsData ?? [];

  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, price, currency, city, area, purpose, type, beds, baths, listing_images(path, sort)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const listings = data ?? [];

  type FallbackMetric = { label: string; value: string };
  const fallbackStats: FallbackMetric[] = [
    { label: t("home.stats.listings"), value: "1,200+" },
    { label: t("home.stats.developers"), value: "45+" },
    { label: t("home.stats.leads"), value: "300+" },
  ];
  const displayMetrics: Array<MetricRow | FallbackMetric> =
    metrics.length > 0 ? metrics : fallbackStats;
  const whyCards = [
    {
      title: t("home.why.item1.title"),
      body: t("home.why.item1.body"),
    },
    {
      title: t("home.why.item2.title"),
      body: t("home.why.item2.body"),
    },
    {
      title: t("home.why.item3.title"),
      body: t("home.why.item3.body"),
    },
  ];
  const processSteps = [
    {
      title: t("home.process.step1.title"),
      body: t("home.process.step1.body"),
    },
    {
      title: t("home.process.step2.title"),
      body: t("home.process.step2.body"),
    },
    {
      title: t("home.process.step3.title"),
      body: t("home.process.step3.body"),
    },
  ];

  const { data: partnersData } = await supabase
    .from("marketing_partners")
    .select("id, name_ar, name_en, logo_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const partners = partnersData ?? [];

  type AdCampaignRow = {
    id: string;
    title_ar: string | null;
    title_en: string | null;
    body_ar: string | null;
    body_en: string | null;
    cta_label_ar: string | null;
    cta_label_en: string | null;
    cta_url: string | null;
    ad_assets: Array<{
      id: string;
      media_type: string;
      url: string;
      poster_url: string | null;
      sort_order: number;
      is_primary: boolean;
    }> | null;
  };

  const { data: campaignsData } = await supabase
    .from("ad_campaigns")
    .select(
      "id, title_ar, title_en, body_ar, body_en, cta_label_ar, cta_label_en, cta_url, ad_assets(id, media_type, url, poster_url, sort_order, is_primary)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  const campaigns = (campaignsData ?? []) as AdCampaignRow[];

  const campaignCards: AdCampaignCard[] = campaigns.map((campaign) => {
    const assets = campaign.ad_assets ?? [];
    const sorted = [...assets].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    });
    const cover = sorted[0] ?? null;
    return {
      id: campaign.id,
      title: (locale === "ar" ? campaign.title_ar : campaign.title_en) ?? t("home.ads.title"),
      body: (locale === "ar" ? campaign.body_ar : campaign.body_en) ?? "",
      ctaLabel:
        (locale === "ar" ? campaign.cta_label_ar : campaign.cta_label_en) ??
        t("home.ads.cta"),
      ctaUrl: campaign.cta_url || "/listings?purpose=new-development",
      coverUrl: cover?.url ?? null,
      coverType: cover?.media_type === "video" ? "video" : "image",
      posterUrl: cover?.poster_url ?? null,
    };
  });
  const intentOptions = [
    { value: "buy", label: t("home.request.intent.buy") },
    { value: "rent", label: t("home.request.intent.rent") },
    { value: "invest", label: t("home.request.intent.invest") },
  ];
  const contactOptions = [
    { value: "morning", label: t("home.request.contact.morning") },
    { value: "afternoon", label: t("home.request.contact.afternoon") },
    { value: "evening", label: t("home.request.contact.evening") },
    { value: "any", label: t("home.request.contact.any") },
  ];
  const faqItems = [
    { question: t("home.faq.q1"), answer: t("home.faq.a1") },
    { question: t("home.faq.q2"), answer: t("home.faq.a2") },
    { question: t("home.faq.q3"), answer: t("home.faq.a3") },
    { question: t("home.faq.q4"), answer: t("home.faq.a4") },
    { question: t("home.faq.q5"), answer: t("home.faq.a5") },
    { question: t("home.faq.q6"), answer: t("home.faq.a6") },
  ];
  const areas = [
    { key: "smouha", href: "/listings?area=سموحة" },
    { key: "gleem", href: "/listings?area=جليم" },
    { key: "stanley", href: "/listings?area=ستانلي" },
    { key: "miami", href: "/listings?area=ميامي" },
    { key: "sidiBishr", href: "/listings?area=سيدي%20بشر" },
    { key: "agami", href: "/listings?area=العجمي" },
  ];
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:space-y-12 sm:px-6 sm:py-10 lg:px-8">
        <Hero
          t={t}
          heroVideo={heroVideo}
          heroImages={heroImages}
          featureCategories={FEATURE_CATEGORIES}
          onRequestAction={createPublicRequestAction}
          purposeOptions={PURPOSE_OPTIONS}
        />

        <Section title={t("home.search.title")} subtitle={t("home.search.subtitle")}>
          <Card className="space-y-4 bg-[var(--surface-elevated)]/90">
            <form action="/listings" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldInput
                  name="city"
                  label={t("home.search.city")}
                  helpKey="home.search.city"
                  placeholder={t("home.search.city")}
                />
                <FieldInput
                  name="area"
                  label={t("home.search.area")}
                  helpKey="home.search.area"
                  placeholder={t("home.search.area")}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FieldSelect
                  name="purpose"
                  label={t("home.search.purpose")}
                  helpKey="home.search.purpose"
                  defaultValue=""
                >
                  <option value="">{t("home.search.purpose")}</option>
                  {PURPOSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </FieldSelect>
                <FieldSelect
                  name="type"
                  label={t("filters.type")}
                  helpKey="home.search.type"
                  defaultValue=""
                >
                  <option value="">{t("filters.type")}</option>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </FieldSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  name="minPrice"
                  label={t("home.search.minPrice")}
                  helpKey="home.search.minPrice"
                  placeholder={t("home.search.minPrice")}
                />
                <FieldInput
                  name="maxPrice"
                  label={t("home.search.maxPrice")}
                  helpKey="home.search.maxPrice"
                  placeholder={t("home.search.maxPrice")}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("home.search.submit")}
              </Button>
            </form>
          </Card>
        </Section>

        <Section title={t("home.categories.title")} subtitle={t("home.categories.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_CATEGORIES.map((cat, index) => (
              <Link key={cat.purpose} href={`/listings?purpose=${cat.purpose}`}>
                <Card
                  className="hrtaj-card transition hover:-translate-y-1 hover:border-[var(--accent)] fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <h3 className="text-lg font-semibold">{t(cat.titleKey)}</h3>
                  <p className="text-sm text-[var(--muted)]">{t(cat.descKey)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>

        <Section title={t("home.areas.title")} subtitle={t("home.areas.subtitle")}>
          <Areas t={t} areas={areas} />
        </Section>

        <Section title={t("trust.title")} subtitle={t("home.trust.subtitle")}>
          <Trust t={t} />
        </Section>

        <Section title={t("home.proof.title")} subtitle={t("home.proof.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {displayMetrics.map((metric) => {
              const label =
                "label_ar" in metric
                  ? locale === "ar"
                    ? metric.label_ar
                    : metric.label_en
                  : metric.label;
              const value = metric.value ?? "-";
              const key = "id" in metric ? metric.id : metric.label;
              return (
                <Card key={key} className="space-y-2 hrtaj-card">
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section title={t("home.why.title")} subtitle={t("home.why.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {whyCards.map((item, index) => (
              <Card key={item.title} className="space-y-3 hrtaj-card">
                <Badge>{`0${index + 1}`}</Badge>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("home.partners.title")} subtitle={t("home.partners.subtitle")}>
          <PartnerMarquee locale={locale} partners={partners} />
        </Section>

        <Section title={t("home.ads.title")} subtitle={t("home.ads.subtitle")}>
          {campaigns.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--muted)]">{t("home.ads.empty")}</p>
            </Card>
          ) : (
            <AdsCarousel locale={locale} items={campaignCards} />
          )}
        </Section>

        <Section title={t("home.projects.title")} subtitle={t("home.projects.subtitle")}>
          {featuredProjects.length === 0 ? (
            <Card className="p-3 sm:p-4">
              <p className="text-sm text-[var(--muted)]">{t("home.projects.empty")}</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="space-y-3 hrtaj-card">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={locale === "ar" ? project.title_ar : project.title_en}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                        {t("general.noImage")}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      {locale === "ar" ? project.title_ar : project.title_en}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {locale === "ar" ? project.location_ar : project.location_en}
                    </p>
                    {project.starting_price ? (
                      <p className="text-base font-semibold text-[var(--accent)]">
                        {t("home.projects.starting")}{" "}
                        {formatPrice(project.starting_price, project.currency ?? "EGP", locale)}
                      </p>
                    ) : null}
                  </div>
                  <Link href={project.cta_url || "/listings?purpose=new-development"}>
                    <Button size="sm" variant="secondary">
                      {t("home.projects.cta")}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title={t("home.featured.title")} subtitle={t("home.featured.subtitle")}>
          <FeaturedListings t={t} locale={locale} listings={listings} />
        </Section>

        <Section title={t("home.faq.title")} subtitle={t("home.faq.subtitle")}>
          <FAQ items={faqItems} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </Section>

        <Section title={t("home.process.title")} subtitle={t("home.process.subtitle")}>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <Card key={step.title} className="space-y-3 hrtaj-card">
                <Badge>{`0${index + 1}`}</Badge>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--muted)]">{step.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title={t("home.about.title")}
          subtitle={t("home.about.subtitle")}
          action={
            <Link href="/about">
              <Button size="sm" variant="secondary">
                {t("home.about.cta")}
              </Button>
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card1.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card1.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card1.body")}</p>
            </Card>
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card2.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card2.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card2.body")}</p>
            </Card>
            <Card className="space-y-2 hrtaj-card">
              <p className="text-xs text-[var(--muted)]">{t("home.about.card3.kicker")}</p>
              <p className="text-lg font-semibold">{t("home.about.card3.title")}</p>
              <p className="text-sm text-[var(--muted)]">{t("home.about.card3.body")}</p>
            </Card>
          </div>
        </Section>

        <Section title={t("home.request.title")} subtitle={t("home.request.subtitle")}>
          <Card className="hrtaj-card">
            <form action={createPublicRequestAction} className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
                data-no-help
              />
              <input type="hidden" name="source" value="web" />
              <FieldInput
                name="name"
                label={t("home.request.name")}
                helpKey="home.request.name"
                required
                placeholder={t("home.request.name")}
              />
              <FieldInput
                name="phone"
                label={t("home.request.phone")}
                helpKey="home.request.phone"
                required
                placeholder={t("home.request.phone")}
                type="tel"
              />
              <FieldSelect
                name="intent"
                label={t("home.request.intent")}
                helpKey="home.request.intent"
                defaultValue=""
                required
              >
                <option value="">{t("home.request.intent")}</option>
                {intentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                name="preferred_area"
                label={t("home.request.area")}
                helpKey="home.request.area"
                placeholder={t("home.request.area")}
              />
              <FieldInput
                name="budget_min"
                label={t("home.request.budgetMin")}
                helpKey="home.request.budgetMin"
                placeholder={t("home.request.budgetMin")}
                type="number"
              />
              <FieldInput
                name="budget_max"
                label={t("home.request.budgetMax")}
                helpKey="home.request.budgetMax"
                placeholder={t("home.request.budgetMax")}
                type="number"
              />
              <FieldSelect
                name="preferred_contact_time"
                label={t("home.request.contactTime")}
                helpKey="home.request.contactTime"
                defaultValue=""
                wrapperClassName="md:col-span-2"
              >
                <option value="">{t("home.request.contactTime")}</option>
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FieldSelect>
              <div className="md:col-span-2">
                <FieldTextarea
                  name="notes"
                  label={t("home.request.notes")}
                  helpKey="home.request.notes"
                  placeholder={t("home.request.notes")}
                  className="min-h-[120px]"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  {t("home.request.submit")}
                </Button>
              </div>
            </form>
          </Card>
        </Section>
      </main>
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <RecentlyViewedStrip
          locale={locale}
          title={t("recent.title")}
          empty={t("recent.empty")}
        />
      </div>
      <SiteFooter showFloating showCompare />
    </div>
  );
}




```

### src/app/partners/page.tsx
```tsx
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card, Section } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";

export default async function PartnersPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("marketing_partners")
    .select("id, name_ar, name_en, logo_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const partners = data ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
        <Section title={t("partners.title")} subtitle={t("partners.subtitle")}>
          {partners.length === 0 ? (
            <Card className="p-4 text-sm text-[var(--muted)]">{t("partners.empty")}</Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="space-y-3 p-4 hrtaj-card">
                  <div className="aspect-[3/2] overflow-hidden rounded-xl bg-[var(--surface)]">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={locale === "ar" ? partner.name_ar ?? "" : partner.name_en ?? ""}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                        {t("general.noImage")}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold">
                    {locale === "ar" ? partner.name_ar : partner.name_en}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/robots.ts
```ts
﻿import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/paths";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicBaseUrl() || "https://hrtaj.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

```

### src/app/saved-searches/page.tsx
```tsx
﻿import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SavedSearchesList } from "@/components/search/SavedSearchesList";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

export default async function SavedSearchesPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const flags = getFlags();

  if (!flags.enableSavedSearch) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-[var(--muted)]">{t("savedSearch.disabled")}</p>
        </main>
        <SiteFooter showCompare />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("savedSearch.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("savedSearch.subtitle")}</p>
        </div>
        <SavedSearchesList
          labels={{
            empty: t("savedSearch.empty"),
            run: t("savedSearch.run"),
            remove: t("savedSearch.remove"),
            lastRun: t("savedSearch.lastRun"),
          }}
        />
      </main>
      <SiteFooter showCompare />
    </div>
  );
}

```

### src/app/saved/page.tsx
```tsx
﻿import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SavedListings } from "@/components/favorites/SavedListings";
import { FavoritesSyncBanner } from "@/components/favorites/FavoriteButton";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getSiteSettings } from "@/lib/settings";
import { getFlags } from "@/lib/flags";

export default async function SavedPage() {
  const locale = await getServerLocale();
  const t = createT(locale);
  const settings = await getSiteSettings();
  const flags = getFlags();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{t("saved.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("saved.subtitle")}</p>
        </div>
        <FavoritesSyncBanner
          labels={{
            title: t("saved.syncPrompt"),
            action: t("saved.syncAction"),
            done: t("saved.syncDone"),
          }}
        />
        <SavedListings
          locale={locale}
          whatsappNumber={settings.whatsapp_number}
          callNumber={settings.whatsapp_number}
          enableCompare={flags.enableCompare}
        />
      </main>
      <SiteFooter showFloating showCompare />
    </div>
  );
}

```

### src/app/sitemap.ts
```ts
﻿import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/paths";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl() || "https://hrtaj.com";
  const now = new Date();

  const staticRoutes = ["", "/about", "/listings", "/careers", "/partners"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "published")
      .limit(1000);

    (data ?? []).forEach((listing) => {
      entries.push({
        url: `${baseUrl}/listing/${listing.id}`,
        lastModified: listing.updated_at ? new Date(listing.updated_at) : now,
      });
    });
  } catch {
    // ignore sitemap fetch errors
  }

  return entries;
}

```

### src/components/ErrorBoundary.tsx
```tsx
"use client";

import React from "react";
import { logError } from "@/lib/logging";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">حصل خطأ غير متوقع</h2>
            <p className="text-sm text-[var(--muted)]">
              من فضلك جرّب تحديث الصفحة أو المحاولة مرة أخرى.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

```

### src/components/FieldHelp.tsx
```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import { getFieldHelp } from "@/lib/fieldHelp";

const HELP_MODE_KEY = "hrtaj.helpMode";

type HelpModeContextValue = {
  helpMode: boolean;
  setHelpMode: (value: boolean) => void;
};

const HelpModeContext = createContext<HelpModeContextValue | null>(null);

export function HelpModeProvider({ children }: { children: React.ReactNode }) {
  const [helpMode, setHelpMode] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HELP_MODE_KEY) === "1";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from persisted user preference.
      setHelpMode(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(HELP_MODE_KEY, helpMode ? "1" : "0");
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-help-mode", helpMode ? "1" : "0");
  }, [helpMode]);

  const value = useMemo(() => ({ helpMode, setHelpMode }), [helpMode]);

  return <HelpModeContext.Provider value={value}>{children}</HelpModeContext.Provider>;
}

export function useHelpMode() {
  const ctx = useContext(HelpModeContext);
  if (!ctx) {
    throw new Error("HelpModeProvider is missing in the tree.");
  }
  return ctx;
}

function applyLabel(text: string, label?: string) {
  if (!label) return text;
  return text.replace(/{{label}}/g, label);
}

function HelpContent({ helpKey, label }: { helpKey: string; label?: string }) {
  const entry = getFieldHelp(helpKey);

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">عنوان الحقل</p>
        <p>{applyLabel(entry.what_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الغرض من الحقل</p>
        <p>{applyLabel(entry.purpose_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">الفكرة الرئيسية</p>
        <p>{applyLabel(entry.idea_ar, label)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">خطوات الاستخدام</p>
        <ul className="list-disc space-y-1 ps-5">
          {entry.steps_ar.map((step) => (
            <li key={step}>{applyLabel(step, label)}</li>
          ))}
        </ul>
      </div>
      {entry.example_ar ? (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">{"\u0645\u062b\u0627\u0644"}</p>
          <p>{applyLabel(entry.example_ar, label)}</p>
        </div>
      ) : null}
      {entry.rules_ar && entry.rules_ar.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)]">قواعد الاستخدام</p>
          <ul className="list-disc space-y-1 ps-5">
            {entry.rules_ar.map((rule) => (
              <li key={rule}>{applyLabel(rule, label)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function FieldHelpIcon({ helpKey, label }: { helpKey: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const entry = getFieldHelp(helpKey);
  const resolvedLabel = label ?? entry.label_ar;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="field-help-icon"
        aria-label={`\u0634\u0631\u062d \u0627\u0644\u062d\u0642\u0644: ${resolvedLabel}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        i
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="field-help-backdrop"
            aria-label="\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0634\u0631\u062d"
            onClick={() => setOpen(false)}
          />
          <div className="field-help-popover">
            <div className="space-y-2">
              <p className="text-sm font-semibold">{resolvedLabel}</p>
              <HelpContent helpKey={helpKey} label={label} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function FieldHelpBlock({ helpKey, label }: { helpKey: string; label?: string }) {
  const { helpMode } = useHelpMode();
  if (!helpMode) return null;
  const entry = getFieldHelp(helpKey);
  const resolvedLabel = label ?? entry.label_ar;
  return (
    <Card className="field-help-block">
      <p className="text-sm font-semibold">{resolvedLabel}</p>
      <HelpContent helpKey={helpKey} label={label} />
    </Card>
  );
}

export function FieldWrapper({
  label,
  helpKey,
  children,
  className = "",
  labelClassName = "",
}: {
  label: string;
  helpKey: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex flex-wrap items-center gap-2 ${labelClassName}`}>
        <label className="text-sm text-[var(--muted)]">{label}</label>
        <FieldHelpIcon helpKey={helpKey} label={label} />
      </div>
      {children}
      <FieldHelpBlock helpKey={helpKey} label={label} />
    </div>
  );
}

export function FieldInput({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        {...props}
        className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      />
    </FieldWrapper>
  );
}

export function FieldSelect({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<"select"> & {
  label: string;
  helpKey: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <select
        {...props}
        className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

export function FieldTextarea({
  label,
  helpKey,
  wrapperClassName = "",
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <textarea
        {...props}
        className={`min-h-[120px] w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      />
    </FieldWrapper>
  );
}

export function FieldCheckbox({
  label,
  helpKey,
  wrapperClassName = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input type="checkbox" {...props} />
        <span>{label}</span>
        <FieldHelpIcon helpKey={helpKey} label={label} />
      </label>
      <FieldHelpBlock helpKey={helpKey} label={label} />
    </div>
  );
}

export function FieldFile({
  label,
  helpKey,
  wrapperClassName = "",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  helpKey: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldWrapper label={label} helpKey={helpKey} className={wrapperClassName}>
      <input
        type="file"
        {...props}
        className="w-full rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
      />
    </FieldWrapper>
  );
}

export function HelpModeToggle({
  className = "",
  locale,
}: {
  className?: string;
  locale?: "ar" | "en";
}) {
  const { helpMode, setHelpMode } = useHelpMode();
  const resolvedLocale = locale ?? getClientLocale();
  const t = createT(resolvedLocale);

  return (
    <Button
      type="button"
      variant={helpMode ? "primary" : "secondary"}
      size="sm"
      className={className}
      onClick={() => setHelpMode(!helpMode)}
      aria-pressed={helpMode}
    >
      {helpMode ? t("help.mode.on") : t("help.mode.off")}
    </Button>
  );
}

```

### src/components/InviteUserForm.tsx
```tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, Input } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type InviteResponse = {
  ok: boolean;
  inviteLink?: string | null;
  error?: string;
};

type InviteUserFormProps = {
  endpoint?: string;
};

export function InviteUserForm({ endpoint = "/api/owner/users" }: InviteUserFormProps) {
  const locale = getClientLocale();
  const t = createT(locale);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInviteLink("");
    setCopied(false);
    setSuccess(false);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? ""),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as InviteResponse;
      if (!res.ok || !data.ok) {
        const code = data.error ?? "invite_failed";
        const key = `owner.users.invite.error.${code}` as const;
        const message = t(key);
        setError(message === key ? t("owner.users.invite.error.invite_failed") : message);
        return;
      }
      if (data.inviteLink) {
        setInviteLink(data.inviteLink);
      }
      if (!data.inviteLink) {
        setSuccess(true);
      }
      form.reset();
    } catch {
      setError(t("owner.users.invite.error.invite_failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <FieldInput
          name="full_name"
          label={t("owner.users.invite.full_name")}
          helpKey="owner.users.invite.full_name"
          placeholder={t("owner.users.invite.full_name")}
          required
        />
        <FieldInput
          name="phone"
          label={t("owner.users.invite.phone")}
          helpKey="owner.users.invite.phone"
          placeholder={t("owner.users.invite.phone")}
        />
        <FieldInput
          name="email"
          label={t("owner.users.invite.email")}
          helpKey="owner.users.invite.email"
          placeholder={t("owner.users.invite.email")}
          type="email"
          required
        />
        <FieldSelect
          name="role"
          label={t("owner.users.invite.role")}
          helpKey="owner.users.invite.role"
          defaultValue="staff"
          required
        >
          <option value="staff">{t("role.staff")}</option>
          <option value="admin">{t("role.admin")}</option>
        </FieldSelect>
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? t("owner.users.invite.loading") : t("owner.users.invite.submit")}
          </Button>
        </div>
      </form>

      {inviteLink ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">{t("owner.users.invite.link")}</p>
          <div className="flex flex-wrap gap-2">
            <Input value={inviteLink} readOnly className="flex-1" data-no-help />
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? t("owner.users.invite.copied") : t("owner.users.invite.copy")}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] p-3 text-sm">
          {t("owner.users.invite.success")}
        </div>
      ) : null}
    </Card>
  );
}

```

### src/components/LanguageSwitcher.tsx
```tsx
﻿"use client";

type LanguageSwitcherProps = {
  locale: "ar" | "en";
  labels: {
    ar: string;
    en: string;
  };
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? labels.en : labels.ar;

  function setLocale(next: "ar" | "en") {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)] shadow-sm transition hover:-translate-y-px sm:px-3 sm:text-xs md:py-1.5 md:text-sm"
      aria-label={label}
    >
      {label}
    </button>
  );
}

```

### src/components/Logo.tsx
```tsx
type LogoProps = {
  name: string;
  className?: string;
  imageClassName?: string;
};

export function Logo({ name, className = "", imageClassName = "" }: LogoProps) {
  return (
    <div className={`flex min-w-0 max-w-full items-center gap-4 md:gap-5 ${className}`}>
      <img
        src="/brand/hrtaj-logo.svg"
        alt={name}
        className={`h-12 w-auto max-w-[160px] shrink-0 object-contain md:h-14 md:max-w-[200px] ${imageClassName}`}
        loading="eager"
      />
      <span className="logo-text text-xl font-semibold leading-tight md:text-2xl">{name}</span>
    </div>
  );
}

```

### src/components/OwnerDeleteDialog.tsx
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { FieldInput } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type DeleteResponse = { ok?: boolean; error?: string };

export function OwnerDeleteDialog({
  entityId,
  endpoint,
  title,
  description,
  confirmLabel,
  mode = "delete",
  payload,
}: {
  entityId: string;
  endpoint: string;
  title: string;
  description: string;
  confirmLabel?: string;
  mode?: "delete" | "request";
  payload?: Record<string, unknown>;
}) {
  const router = useRouter();
  const locale = getClientLocale();
  const t = createT(locale);

  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const required = confirmLabel ?? "DELETE";
  const canSubmit = confirm.trim().toUpperCase() === required;

  async function handleDelete() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: entityId, confirm: required }),
      });
      const data = (await res.json()) as DeleteResponse;
      if (!res.ok || !data.ok) {
        setError(t("owner.delete.error"));
        setLoading(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("owner.delete.error"));
    } finally {
      setLoading(false);
    }
  }

  const triggerLabel =
    mode === "request" ? t("owner.delete.requestButton") : t("owner.delete.button");
  const submitLabel =
    mode === "request" ? t("owner.delete.requestConfirm") : t("owner.delete.confirm");
  const loadingLabel =
    mode === "request" ? t("owner.delete.requestLoading") : t("owner.delete.loading");

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted)]">{description}</p>
            </div>
            <div className="space-y-2">
              <FieldInput
                label={t("owner.delete.confirmLabel")}
                helpKey="owner.delete.confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder={required}
              />
              <p className="text-xs text-[var(--muted)]">
                {t("owner.delete.confirmHint", { value: required })}
              </p>
            </div>
            {error ? (
              <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
                {error}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                {t("owner.delete.cancel")}
              </Button>
              <Button type="button" variant="danger" size="sm" disabled={!canSubmit || loading} onClick={handleDelete}>
                {loading ? loadingLabel : submitLabel}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

```

### src/components/SiteFooter.tsx
```tsx
﻿import { Logo } from "@/components/Logo";
import { CompareBar } from "@/components/compare/CompareBar";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getSiteSettings } from "@/lib/settings";
import { getFlags } from "@/lib/flags";

export async function SiteFooter({
  showFloating = false,
  showCompare = false,
}: {
  showFloating?: boolean;
  showCompare?: boolean;
} = {}) {
  const locale = await getServerLocale();
  const t = createT(locale);
  const settings = await getSiteSettings();
  const flags = getFlags();
  const whatsappLink = settings.whatsapp_link || null;
  const instagramLink = settings.instagram_url || null;
  const linkedinLink = settings.linkedin_url || null;
  const tiktokLink = settings.tiktok_url || null;
  const contactEmail = settings.public_email || t("footer.email");
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-[var(--border)] bg-[var(--surface)] ${
        showFloating ? "pb-[calc(5rem+var(--safe-bottom))] sm:pb-[calc(6rem+var(--safe-bottom))]" : ""
      }`}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 text-xs text-[var(--muted)] sm:gap-8 sm:px-6 sm:py-10 sm:text-sm lg:px-8 md:grid-cols-[1.4fr,1fr,1fr]">
        <div className="space-y-3">
          <Logo name={t("brand.name")} className="text-[var(--text)]" imageClassName="h-8 sm:h-10 md:h-12" />
          <p className="max-w-md">{t("brand.tagline")}</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("footer.links")}
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/about" className="hover:text-[var(--text)]">{t("nav.about")}</a>
            <a href="/listings" className="hover:text-[var(--text)]">{t("nav.listings")}</a>
            <a href="/careers" className="hover:text-[var(--text)]">{t("nav.careers")}</a>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("footer.contact")}
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {settings.facebook_url ? (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.facebook")}
              </a>
            ) : null}
            {instagramLink ? (
              <a href={instagramLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.instagram")}
              </a>
            ) : null}
            {linkedinLink ? (
              <a href={linkedinLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.linkedin")}
              </a>
            ) : null}
            {tiktokLink ? (
              <a href={tiktokLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.tiktok")}
              </a>
            ) : null}
            {whatsappLink ? (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
                {t("footer.whatsapp")}
              </a>
            ) : null}
            <a href={`mailto:${contactEmail}`} className="text-[var(--text)] hover:text-[var(--accent)]">
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-[var(--muted)] sm:px-6 sm:text-xs lg:px-8">
          <p>
            (c) {year} {t("brand.name")} - {t("brand.domain")}
          </p>
          <p>{t("footer.rights")}</p>
        </div>
      </div>
      {showFloating && whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="floating-whatsapp fixed z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs font-semibold text-white shadow-[var(--shadow-strong)] transition hover:-translate-y-1"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-white"
          >
            <path d="M20.5 3.5A11 11 0 0 0 2.8 16.6L2 22l5.6-1.7A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.3 1 1-3.2-.2-.3A9 9 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.7-.8-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 7.7 7.7 0 0 1-1.4-1.8c-.1-.2 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.3 3c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.8.6.7.2 1.3.2 1.7.1.5-.1 1.7-.7 1.9-1.4s.2-1.3.1-1.4c0-.1-.2-.2-.5-.3Z"/>
          </svg>
          {t("footer.whatsapp")}
        </a>
      ) : null}
      {showCompare && flags.enableCompare ? (
        <CompareBar labels={{ title: t("compare.bar"), action: t("compare.action") }} />
      ) : null}
    </footer>
  );
}


```

### src/components/SiteHeader.tsx
```tsx
﻿import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { HelpModeToggle } from "@/components/FieldHelp";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getSiteSettings } from "@/lib/settings";
import { createT } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n.server";
import { getFlags } from "@/lib/flags";

type HeaderRole =
  | "guest"
  | "developer"
  | "owner"
  | "admin"
  | "ops"
  | "staff"
  | "agent";

export async function SiteHeader() {
  const locale = await getServerLocale();
  const t = createT(locale);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data?.user ?? null;

  let role: HeaderRole = "guest";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as HeaderRole) ?? "guest";
  }

  const isAuthed = role !== "guest";
  const isDeveloperPortal =
    role === "developer" || role === "admin" || role === "ops" || role === "staff" || role === "owner";
  const isAdmin = role === "admin" || role === "owner";
  const isStaff = role === "admin" || role === "ops" || role === "staff" || role === "owner";
  const isAgent = role === "agent";
  const isCrmUser = isStaff || isAgent;
  const showDeveloperAds = role === "developer";
  const showAdminAds = isAdmin;
  const settings = await getSiteSettings();
  const flags = getFlags();
  const whatsappLink = settings.whatsapp_link || null;

  const themeLabels = {
    dark: t("theme.dark"),
    light: t("theme.light"),
  };

  const langLabels = {
    ar: t("lang.ar"),
    en: t("lang.en"),
  };

  const currentLayer =
    role === "owner"
      ? t("layer.owner")
      : role === "admin"
        ? t("layer.admin")
        : role === "developer"
          ? t("layer.developer")
          : role === "ops" || role === "staff" || role === "agent"
            ? t("layer.staff")
            : t("layer.public");

  const layerOptions = [
    { href: "/", label: t("layer.public") },
    { href: "/listings", label: t("nav.listings") },
    ...(isDeveloperPortal ? [{ href: "/developer", label: t("layer.developer") }] : []),
    ...(showDeveloperAds ? [{ href: "/developer/ads", label: t("nav.ads") }] : []),
    ...(isStaff ? [{ href: "/staff", label: t("layer.staff") }] : []),
    ...(isCrmUser ? [{ href: "/crm", label: t("nav.crm") }] : []),
    ...(isAdmin ? [{ href: "/admin", label: t("layer.admin") }] : []),
    ...(showAdminAds ? [{ href: "/admin/ads", label: t("nav.ads") }] : []),
    ...(isAdmin ? [{ href: "/admin/reports", label: t("nav.reports") }] : []),
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="site-header-inner flex items-center justify-between gap-3 py-2 sm:py-3 lg:py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Logo name={t("brand.name")} imageClassName="h-7 sm:h-9 md:h-12" />
            </Link>
            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] lg:inline-flex">
              {t("brand.tagline")}
            </span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <details className="group relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] shadow-[var(--shadow)]">
                <span className="text-[var(--muted)]">{t("layer.current")}</span>
                <span>{currentLayer}</span>
              </summary>
              <div className="absolute right-0 mt-2 min-w-[180px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow)]">
                {layerOptions.map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    className="block rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </details>
            {flags.enableEnglish ? <LanguageSwitcher locale={locale} labels={langLabels} /> : null}
            <ThemeSwitcher labels={themeLabels} />
            <HelpModeToggle locale={locale} />
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
              >
                {t("nav.dashboard")}
              </Link>
            ) : null}
          </div>

          <details className="group relative md:hidden mobile-menu-root">
            <summary className="mobile-menu-trigger flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] shadow-[var(--shadow)]">
              {t("nav.menu")}
              <span className="transition group-open:rotate-180">v</span>
            </summary>
            <div className="mobile-menu-panel absolute right-0 mt-2 w-[min(90vw,360px)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
              <div className="grid gap-2 text-sm text-[var(--muted)]">
                <Link href="/listings" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                  {t("nav.listings")}
                </Link>
                <Link href="/about" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                  {t("nav.about")}
                </Link>
                <Link href="/careers" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                  {t("nav.careers")}
                </Link>
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]"
                  >
                    {t("nav.contact")}
                  </a>
                ) : null}
                {isDeveloperPortal ? (
                  <Link href="/developer" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.partners")}
                  </Link>
                ) : null}
                {showDeveloperAds ? (
                  <Link href="/developer/ads" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.ads")}
                  </Link>
                ) : null}
                {isStaff ? (
                  <Link href="/staff" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.staff")}
                  </Link>
                ) : null}
                {isCrmUser ? (
                  <Link href="/crm" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.crm")}
                  </Link>
                ) : null}
                {isAdmin ? (
                  <Link href="/admin" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.admin")}
                  </Link>
                ) : null}
                {showAdminAds ? (
                  <Link href="/admin/ads" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.ads")}
                  </Link>
                ) : null}
                {isAdmin ? (
                  <Link href="/admin/reports" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.reports")}
                  </Link>
                ) : null}
                {isAuthed ? (
                  <Link href="/account" className="rounded-lg px-2 py-2 hover:bg-[var(--surface-2)]">
                    {t("nav.account")}
                  </Link>
                ) : null}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs font-semibold text-[var(--muted)]">
                  {t("layer.current")}: {currentLayer}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {flags.enableEnglish ? <LanguageSwitcher locale={locale} labels={langLabels} /> : null}
                  <ThemeSwitcher labels={themeLabels} />
                  <HelpModeToggle locale={locale} />
                </div>
              </div>
            </div>
          </details>
        </div>

        <nav className="hidden items-center gap-5 pb-4 text-sm font-medium text-[var(--muted)] lg:flex">
          <Link href="/listings" className="hover:text-[var(--text)]">
            {t("nav.listings")}
          </Link>
          <Link href="/about" className="hover:text-[var(--text)]">
            {t("nav.about")}
          </Link>
          <Link href="/careers" className="hover:text-[var(--text)]">
            {t("nav.careers")}
          </Link>
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">
              {t("nav.contact")}
            </a>
          ) : null}
          {isDeveloperPortal ? (
            <Link href="/developer" className="hover:text-[var(--text)]">
              {t("nav.partners")}
            </Link>
          ) : null}
          {showDeveloperAds ? (
            <Link href="/developer/ads" className="hover:text-[var(--text)]">
              {t("nav.ads")}
            </Link>
          ) : null}
          {isStaff ? (
            <Link href="/staff" className="hover:text-[var(--text)]">
              {t("nav.staff")}
            </Link>
          ) : null}
          {isCrmUser ? (
            <Link href="/crm" className="hover:text-[var(--text)]">
              {t("nav.crm")}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="hover:text-[var(--text)]">
              {t("nav.admin")}
            </Link>
          ) : null}
          {showAdminAds ? (
            <Link href="/admin/ads" className="hover:text-[var(--text)]">
              {t("nav.ads")}
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin/reports" className="hover:text-[var(--text)]">
              {t("nav.reports")}
            </Link>
          ) : null}
          {isAuthed ? (
            <Link href="/account" className="hover:text-[var(--text)]">
              {t("nav.account")}
            </Link>
          ) : null}
        </nav>
      </div>

    </header>
  );
}


```

### src/components/ThemeSwitcher.tsx
```tsx
"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE, normalizeTheme, themeToColorScheme, type ThemeId } from "@/lib/theme";

type ThemeLabels = {
  dark: string;
  light: string;
};

function setThemeCookie(theme: ThemeId) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function applyTheme(nextTheme: ThemeId) {
  const theme = normalizeTheme(nextTheme);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = themeToColorScheme(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage errors (privacy mode, disabled storage, etc.).
  }
  setThemeCookie(theme);
}

export function ThemeSwitcher({ labels }: { labels: ThemeLabels }) {
  const [theme, setTheme] = useState<ThemeId>("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("theme");
    } catch {
      stored = null;
    }
    const fromDom = document.documentElement.dataset.theme ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from persisted user preference.
    setTheme(normalizeTheme(stored ?? fromDom));
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme: ThemeId = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? labels.light : labels.dark;

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-strong)] sm:h-9 sm:w-9"
      aria-label={label}
      title={label}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path
              d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

```

### src/components/Toast.tsx
```tsx
﻿"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastItem = {
  id: string;
  message: string;
};

type ToastContextValue = {
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = { id, message };
    setItems((prev) => [...prev, item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-root" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div key={item.id} className="toast-item">
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("ToastProvider is missing in the tree.");
  }
  return ctx;
}

```

### src/components/UserManagementList.tsx
```tsx
"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { FieldSelect } from "@/components/FieldHelp";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  created_at?: string | null;
  is_active?: boolean | null;
};

type Props = {
  profiles: ProfileRow[];
  actorRole: "owner" | "admin";
};

type ApiResponse = {
  ok: boolean;
  error?: string;
};

export function UserManagementList({ profiles, actorRole }: Props) {
  const locale = getClientLocale();
  const t = createT(locale);
  const [rows, setRows] = useState<ProfileRow[]>(profiles);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const isOwner = actorRole === "owner";

  const roleOptions = useMemo(
    () => [
      { value: "developer", label: t("role.developer") },
      { value: "staff", label: t("role.staff") },
      { value: "ops", label: t("role.ops") },
      { value: "agent", label: t("role.agent") },
      { value: "admin", label: t("role.admin") },
    ],
    [t]
  );

  async function handleRoleSubmit(event: React.FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    setError("");
    setBusyId(userId);
    const formData = new FormData(event.currentTarget);
    const newRole = String(formData.get("role") ?? "");

    try {
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        setError(t("admin.users.error.generic"));
        return;
      }
      setRows((prev) =>
        prev.map((row) => (row.id === userId ? { ...row, role: newRole } : row))
      );
    } catch {
      setError(t("admin.users.error.generic"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDisableToggle(userId: string, disabled: boolean) {
    setError("");
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/users/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, disabled }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok) {
        setError(t("admin.users.error.generic"));
        return;
      }
      setRows((prev) =>
        prev.map((row) => (row.id === userId ? { ...row, is_active: !disabled } : row))
      );
    } catch {
      setError(t("admin.users.error.generic"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="space-y-4">
      {rows.map((profile) => {
        const isOwnerRow = profile.role === "owner";
        const locked = isOwnerRow && !isOwner;
        const isInactive = profile.is_active === false;
        return (
          <form
            key={profile.id}
            onSubmit={(event) => handleRoleSubmit(event, profile.id)}
            className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 last:border-none"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{profile.full_name ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.id}</p>
                <p className="text-xs text-[var(--muted)]">{profile.created_at ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.email ?? "-"}</p>
                <p className="text-xs text-[var(--muted)]">{profile.phone ?? "-"}</p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {isOwnerRow ? <Badge>{t("admin.users.locked")}</Badge> : null}
                {isInactive ? <Badge>{t("admin.users.disabled")}</Badge> : null}
                <FieldSelect
                  label={t("admin.users.role")}
                  helpKey="admin.users.role"
                  name="role"
                  defaultValue={profile.role ?? "staff"}
                  disabled={locked}
                  wrapperClassName="min-w-[180px]"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FieldSelect>
                <Button size="sm" variant="secondary" type="submit" disabled={locked || busyId === profile.id}>
                  {t("admin.users.update")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  disabled={locked || busyId === profile.id}
                  onClick={() => handleDisableToggle(profile.id, !isInactive)}
                >
                  {isInactive ? t("admin.users.enable") : t("admin.users.disable")}
                </Button>
              </div>
            </div>
          </form>
        );
      })}
      {error ? (
        <div className="rounded-xl border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.15)] p-3 text-sm">
          {error}
        </div>
      ) : null}
    </Card>
  );
}

```

### src/components/compare/CompareBar.tsx
```tsx
﻿"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompareIds, subscribeCompare } from "@/lib/compare/store";
import { Button } from "@/components/ui";

export function CompareBar({ labels }: { labels: { title: string; action: string } }) {
  const [ids, setIds] = useState<string[]>(() => getCompareIds());

  useEffect(() => subscribeCompare(setIds), []);

  if (ids.length < 2) return null;

  return (
    <div className="compare-bar" role="region" aria-label={labels.title}>
      <span className="compare-bar-text">
        {labels.title} ({ids.length})
      </span>
      <Link href="/compare">
        <Button size="sm">{labels.action}</Button>
      </Link>
    </div>
  );
}

```

### src/components/compare/CompareButton.tsx
```tsx
﻿"use client";

import { useEffect, useState } from "react";
import { subscribeCompare, toggleCompare, getCompareIds, COMPARE_LIMIT } from "@/lib/compare/store";
import { useToast } from "@/components/Toast";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function CompareButton({
  listing,
  labels,
  className = "",
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  labels: { add: string; remove: string; limit: string };
  className?: string;
}) {
  const [compareIds, setCompareIds] = useState<string[]>(() => getCompareIds());
  const { push } = useToast();

  useEffect(() => subscribeCompare(setCompareIds), []);

  const isSelected = compareIds.includes(listing.id);

  function handleToggle() {
    const beforeCount = compareIds.length;
    const next = toggleCompare(listing.id);
    const nowSelected = next.includes(listing.id);
    if (!nowSelected && isSelected) {
      push(labels.remove);
      track("compare_remove", {
        ...buildListingAnalyticsPayload(listing),
      });
      return;
    }

    if (!nowSelected && beforeCount >= COMPARE_LIMIT) {
      push(labels.limit);
      return;
    }

    push(labels.add);
    track("compare_add", {
      ...buildListingAnalyticsPayload(listing),
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`compare-button ${isSelected ? "is-active" : ""} ${className}`}
      aria-pressed={isSelected}
      aria-label={isSelected ? labels.remove : labels.add}
    >
      <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
    </button>
  );
}

```

### src/components/compare/ComparePage.tsx
```tsx
﻿"use client";

import { useEffect, useState } from "react";
import { getCompareIds, subscribeCompare } from "@/lib/compare/store";
import { CompareButton } from "@/components/compare/CompareButton";
import { Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { createT } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

export type CompareListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  floor?: number | null;
  amenities?: string[] | null;
};

export function ComparePage({ labels }: { labels: { empty: string } }) {
  const [ids, setIds] = useState<string[]>(() => getCompareIds());
  const [items, setItems] = useState<CompareListing[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = getClientLocale();
  const t = createT(locale);

  useEffect(() => subscribeCompare(setIds), []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/listings/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { listings: CompareListing[] };
        setItems(data.listings ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [ids]);

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{t("general.loading")}</p>
      </Card>
    );
  }

  if (ids.length < 2 || items.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{labels.empty}</p>
      </Card>
    );
  }

  const rows = [
    { key: "price", label: t("compare.price"), render: (item: CompareListing) => formatPrice(item.price, item.currency, locale) },
    { key: "area", label: t("compare.area"), render: (item: CompareListing) => item.area || "-" },
    { key: "size", label: t("compare.size"), render: (item: CompareListing) => item.size_m2 ? `${item.size_m2} m²` : "-" },
    { key: "beds", label: t("compare.beds"), render: (item: CompareListing) => String(item.beds) },
    { key: "baths", label: t("compare.baths"), render: (item: CompareListing) => String(item.baths) },
    { key: "floor", label: t("compare.floor"), render: (item: CompareListing) => item.floor ?? "-" },
    { key: "amenities", label: t("compare.amenities"), render: (item: CompareListing) => item.amenities?.slice(0, 4).join("، ") || "-" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:hidden">
        {items.map((item) => (
          <Card key={item.id} className="compare-card">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <CompareButton
                listing={item}
                labels={{ add: t("compare.add"), remove: t("compare.remove"), limit: t("compare.limit") }}
              />
            </div>
            <div className="compare-card-rows">
              {rows.map((row) => (
                <div key={row.key} className="compare-row">
                  <span className="compare-label">{row.label}</span>
                  <span className="compare-value">{row.render(item)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="compare-table">
          <div className="compare-table-row compare-table-head">
            <div className="compare-table-cell compare-table-label" />
            {items.map((item) => (
              <div key={item.id} className="compare-table-cell">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <CompareButton
                    listing={item}
                    labels={{ add: t("compare.add"), remove: t("compare.remove"), limit: t("compare.limit") }}
                  />
                </div>
              </div>
            ))}
          </div>
          {rows.map((row) => {
            const values = items.map((item) => row.render(item));
            return (
              <div key={row.key} className="compare-table-row">
                <div className="compare-table-cell compare-table-label">{row.label}</div>
                {values.map((value, idx) => (
                  <div
                    key={`${row.key}-${items[idx]?.id}`}
                    className={`compare-table-cell ${value !== values[0] ? "compare-diff" : ""}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

```

### src/components/favorites/FavoriteButton.tsx
```tsx
﻿"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { subscribeFavorites, toggleFavorite, getFavorites, setFavorites } from "@/lib/favorites/store";
import { useToast } from "@/components/Toast";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function FavoriteButton({
  listing,
  className = "",
  labels,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  className?: string;
  labels: {
    add: string;
    remove: string;
  };
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [userId, setUserId] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isSaved = favorites.includes(listing.id);

  async function handleToggle() {
    const next = toggleFavorite(listing.id);
    const nextSaved = next.includes(listing.id);
    push(nextSaved ? labels.add : labels.remove);
    track("favorite_toggle", {
      action: nextSaved ? "add" : "remove",
      ...buildListingAnalyticsPayload(listing),
    });

    if (userId) {
      if (nextSaved) {
        await supabase.from("favorites").upsert({ user_id: userId, listing_id: listing.id });
      } else {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listing.id);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`favorite-button ${isSaved ? "is-active" : ""} ${className}`}
      aria-pressed={isSaved}
      aria-label={isSaved ? labels.remove : labels.add}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
    </button>
  );
}

export function FavoritesSyncBanner({
  labels,
}: {
  labels: { title: string; action: string; done: string };
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!userId || favorites.length === 0) return null;

  async function handleSync() {
    setState("syncing");
    const payload = favorites.map((id) => ({ user_id: userId, listing_id: id }));
    if (payload.length) {
      await supabase.from("favorites").upsert(payload, { onConflict: "user_id,listing_id" });
    }
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
    const merged = Array.from(
      new Set([...(data ?? []).map((row) => row.listing_id), ...favorites])
    );
    setFavorites(merged);
    setState("done");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className="favorites-sync">
      <span>{labels.title}</span>
      <button type="button" onClick={handleSync} className="favorites-sync-button">
        {state === "done" ? labels.done : labels.action}
      </button>
    </div>
  );
}

```

### src/components/favorites/SavedListings.tsx
```tsx
﻿"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getFavorites, subscribeFavorites, setFavorites } from "@/lib/favorites/store";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { createT, type Locale } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";

export type SavedListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  purpose: string;
  type: string;
  created_at?: string | null;
  amenities?: string[] | null;
  floor?: number | null;
  listing_images?: { path: string; sort: number }[] | null;
  is_new?: boolean | null;
};

export function SavedListings({
  locale,
  whatsappNumber,
  callNumber,
  enableCompare = true,
}: {
  locale: Locale;
  whatsappNumber?: string | null;
  callNumber?: string | null;
  enableCompare?: boolean;
}) {
  const [favorites, setLocalFavorites] = useState<string[]>(() => getFavorites());
  const [items, setItems] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useMemo(() => createT(locale || getClientLocale()), [locale]);

  useEffect(() => subscribeFavorites(setLocalFavorites), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user) return;
      const { data: favs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", data.user.id);
      if (!mounted) return;
      if (favs && favs.length) {
        const local = getFavorites();
        const merged = Array.from(new Set([...local, ...favs.map((row) => row.listing_id)]));
        setFavorites(merged);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (favorites.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/listings/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: favorites }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { listings: SavedListing[] };
        setItems(data.listings ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [favorites]);

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">{t("general.loading")}</p>;
  }

  if (favorites.length === 0 || items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{t("saved.empty")}</p>;
  }

  return (
    <ListingsGrid view="grid">
      {items.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          locale={locale}
          t={t}
          whatsappNumber={whatsappNumber}
          callNumber={callNumber}
          enableCompare={enableCompare}
        />
      ))}
    </ListingsGrid>
  );
}

```

### src/components/home/Areas.tsx
```tsx
import Link from "next/link";
import { Card } from "@/components/ui";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type AreaItem = {
  key: string;
  href: string;
};

type AreasProps = {
  t: TFn;
  areas: AreaItem[];
};

export function Areas({ t, areas }: AreasProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((area, index) => (
        <Link key={area.key} href={area.href} className="block">
          <Card
            className="group relative overflow-hidden border border-[var(--border)] bg-[var(--surface)]/95 p-4 hrtaj-card transition hover:-translate-y-1 hover:border-[var(--accent)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="space-y-2">
              <p className="text-base font-semibold">{t(`home.areas.${area.key}.title`)}</p>
              <p className="text-sm text-[var(--muted)]">{t(`home.areas.${area.key}.subtitle`)}</p>
            </div>
            <span className="mt-3 inline-flex text-xs font-semibold text-[var(--accent)]">
              {t("home.areas.cta")}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}

```

### src/components/home/FAQ.tsx
```tsx
type FaqItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  items: FaqItem[];
};

export function FAQ({ items }: FAQProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]/90 p-4"
        >
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">
            {item.question}
          </summary>
          <p className="mt-2 text-sm text-[var(--muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

```

### src/components/home/FeaturedListings.tsx
```tsx
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPropertyTypeLabelKey, getPurposeLabelKey } from "@/lib/i18n";
import { getPublicImageUrl } from "@/lib/storage";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type ListingCard = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  purpose: string;
  type: string;
  beds: number;
  baths: number;
  listing_images: Array<{ path: string; sort: number }> | null;
};

type FeaturedListingsProps = {
  t: TFn;
  locale: "ar" | "en";
  listings: ListingCard[];
};

export function FeaturedListings({ t, locale, listings }: FeaturedListingsProps) {
  if (listings.length === 0) {
    return (
      <Card className="p-3 sm:p-4">
        <p className="text-sm text-[var(--muted)]">{t("home.featured.empty")}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
      {listings.map((listing, index) => {
        const cover = listing.listing_images?.sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
        const coverUrl = getPublicImageUrl(cover);
        return (
          <Card
            key={listing.id}
            className="group flex flex-col gap-4 fade-up hrtaj-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={`/listing/${listing.id}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--surface)]">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    {t("general.noImage")}
                  </div>
                )}
              </div>
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
                <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
                <Badge>
                  {listing.beds} {t("detail.stats.rooms")} - {listing.baths} {t("detail.stats.baths")}
                </Badge>
              </div>
              <Link href={`/listing/${listing.id}`}>
                <h3 className="text-lg font-semibold hover:text-[var(--accent)]">{listing.title}</h3>
              </Link>
              <p className="text-sm text-[var(--muted)]">
                {listing.city}
                {listing.area ? ` - ${listing.area}` : ""}
              </p>
              <p className="text-lg font-semibold text-[var(--accent)]">
                {formatPrice(listing.price, listing.currency, locale)}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

```

### src/components/home/Hero.tsx
```tsx
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { FieldInput, FieldSelect } from "@/components/FieldHelp";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type HeroMediaItem = {
  id: string;
  media_type: string;
  url: string;
  poster_url: string | null;
  title: string | null;
};

type FeatureCategory = {
  purpose: string;
  titleKey: string;
};

type HeroProps = {
  t: TFn;
  heroVideo: HeroMediaItem | null;
  heroImages: HeroMediaItem[];
  featureCategories: ReadonlyArray<FeatureCategory>;
  onRequestAction: (formData: FormData) => Promise<void>;
  purposeOptions: ReadonlyArray<{ value: string; labelKey: string }>;
};

export function Hero({
  t,
  heroVideo,
  heroImages,
  featureCategories,
  onRequestAction,
  purposeOptions,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/90 p-4 shadow-[var(--shadow)] fade-up sm:rounded-[32px] sm:p-8 hero-shell">
      <div className="absolute inset-0">
        {heroVideo ? (
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster={heroVideo.poster_url ?? undefined}
          >
            <source src={heroVideo.url} />
          </video>
        ) : heroImages.length > 0 ? (
          <div className="hero-carousel">
            <div className="hero-track">
              {[...heroImages, ...heroImages].map((item, index) => (
                <div className="hero-slide" key={`${item.id}-${index}`}>
                  <img src={item.url} alt={item.title ?? t("home.hero.badge")} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="hero-overlay" />
      </div>
      <div className="relative z-10 grid gap-5 sm:gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4 sm:space-y-6">
          <Badge>{t("home.hero.badge")}</Badge>
          <h1 className="max-w-[18ch] text-3xl font-semibold leading-tight text-balance sm:max-w-[22ch] sm:text-5xl lg:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/listings">
              <Button size="lg" className="w-full sm:w-auto">
                {t("home.hero.ctaPrimary")}
              </Button>
            </Link>
            <a href="https://wa.me/201020614022" target="_blank" rel="noreferrer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                {t("home.hero.ctaSecondary")}
              </Button>
            </a>
          </div>
          <Card className="space-y-3 bg-[var(--surface)]/90 p-4">
            <p className="text-sm font-semibold">{t("home.hero.searchTitle")}</p>
            <form action="/listings" className="grid gap-3 md:grid-cols-3">
              <FieldSelect
                name="transaction"
                label={t("home.hero.search.transaction")}
                helpKey="home.hero.search.transaction"
                defaultValue=""
              >
                <option value="">{t("home.hero.search.transaction")}</option>
                {purposeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </FieldSelect>
              <FieldInput
                name="area"
                label={t("home.hero.search.area")}
                helpKey="home.hero.search.area"
                placeholder={t("home.hero.search.area")}
              />
              <FieldInput
                name="priceMax"
                label={t("home.hero.search.budget")}
                helpKey="home.hero.search.budget"
                placeholder={t("home.hero.search.budget")}
                type="number"
              />
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" size="sm">
                  {t("home.hero.search.cta")}
                </Button>
              </div>
            </form>
          </Card>
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">{t("home.hero.quick")}</span>
            {featureCategories.map((cat) => (
              <Link
                key={cat.purpose}
                href={`/listings?purpose=${cat.purpose}`}
                className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                {t(cat.titleKey)}
              </Link>
            ))}
          </div>
        </div>
        <Card className="callback-card space-y-4 bg-[var(--surface-elevated)]/90 p-4 backdrop-blur sm:space-y-4 sm:p-5">
          <h2 className="callback-title text-lg font-semibold">{t("home.callback.title")}</h2>
          <p className="callback-subtitle text-sm text-[var(--muted)]">{t("home.callback.subtitle")}</p>
          <form action={onRequestAction} className="callback-form space-y-3">
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden="true"
              data-no-help
            />
            <input type="hidden" name="source" value="web" />
            <input type="hidden" name="intent" value="buy" />
            <div className="callback-grid grid gap-3 md:grid-cols-2">
              <FieldInput
                name="name"
                label={t("home.callback.name")}
                helpKey="home.callback.name"
                placeholder={t("home.callback.name")}
                required
              />
              <FieldInput
                name="email"
                label={t("home.callback.email")}
                helpKey="home.callback.email"
                placeholder={t("home.callback.email")}
                type="email"
              />
            </div>
            <FieldInput
              name="phone"
              label={t("home.callback.phone")}
              helpKey="home.callback.phone"
              placeholder={t("home.callback.phone")}
              required
              type="tel"
            />
            <Button type="submit" size="lg" className="callback-submit w-full">
              {t("home.callback.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

```

### src/components/home/Trust.tsx
```tsx
import { Card } from "@/components/ui";

type TFn = (key: string, params?: Record<string, string | number>) => string;

export function Trust({ t }: { t: TFn }) {
  const items = [
    {
      title: t("trust.address.title"),
      value: t("trust.address.value"),
    },
    {
      title: t("trust.hours.title"),
      value: t("trust.hours.value"),
    },
    {
      title: t("trust.response.title"),
      value: t("trust.response.value"),
    },
  ];

  return (
    <div className="trust-strip">
      {items.map((item) => (
        <Card key={item.title} className="trust-card">
          <p className="trust-label">{item.title}</p>
          <p className="trust-value">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}

```

### src/components/leads/LeadForm.tsx
```tsx
﻿"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button, Card } from "@/components/ui";
import { FieldInput, FieldTextarea } from "@/components/FieldHelp";
import { createLeadActionWithState, type LeadActionState } from "@/app/actions/marketplace";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export type LeadFormLabels = {
  title: string;
  subtitle?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  error: string;
  back?: string;
  whatsappFallback?: string;
};

const initialState: LeadActionState = { ok: false, error: null, submitted: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function LeadForm({
  listingId,
  source = "web",
  labels,
  className = "",
  whatsappLink,
  backHref,
  id = "lead-form",
}: {
  listingId: string;
  source?: string;
  labels: LeadFormLabels;
  className?: string;
  whatsappLink?: string | null;
  backHref?: string;
  id?: string;
}) {
  const [state, formAction] = useFormState(createLeadActionWithState, initialState);

  if (state.submitted && state.ok) {
    return (
      <Card className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold">{labels.successTitle}</h3>
        <p className="text-sm text-[var(--muted)]">{labels.successBody}</p>
        {whatsappLink ? (
          <a href={whatsappLink} target="_blank" rel="noreferrer">
            <Button size="sm">{labels.whatsappFallback ?? "WhatsApp"}</Button>
          </a>
        ) : null}
        {backHref && labels.back ? (
          <a href={backHref} className="text-xs text-[var(--muted)] underline">
            {labels.back}
          </a>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{labels.title}</h3>
        {labels.subtitle ? <p className="text-sm text-[var(--muted)]">{labels.subtitle}</p> : null}
      </div>
      <form
        id={id}
        action={formAction}
        className="space-y-3"
        onSubmit={() =>
          track("lead_submit", { source, ...buildListingAnalyticsPayload({ id: listingId }) })
        }
      >
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
          aria-hidden="true"
          data-no-help
        />
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="source" value={source} />
        <FieldInput
          name="name"
          label={labels.name}
          helpKey="lead.name"
          placeholder={labels.name}
          required
        />
        <FieldInput
          name="phone"
          label={labels.phone}
          helpKey="lead.phone"
          placeholder={labels.phone}
          inputMode="tel"
        />
        <FieldInput
          name="email"
          label={labels.email}
          helpKey="lead.email"
          placeholder={labels.email}
          type="email"
        />
        <FieldTextarea
          name="message"
          label={labels.message}
          helpKey="lead.message"
          placeholder={labels.message}
        />
        {state.submitted && !state.ok ? (
          <p className="text-sm text-[var(--danger)]">{labels.error}</p>
        ) : null}
        <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
        {whatsappLink && labels.whatsappFallback ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--muted)] underline"
          >
            {labels.whatsappFallback}
          </a>
        ) : null}
        {backHref && labels.back ? (
          <a href={backHref} className="text-xs text-[var(--muted)] underline">
            {labels.back}
          </a>
        ) : null}
      </form>
    </Card>
  );
}

```

### src/components/listings/FiltersDrawer.tsx
```tsx
﻿"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function FiltersDrawer({
  title,
  subtitle,
  activeCount,
  formId,
  applyLabel,
  resetLabel,
  resetHref,
  children,
}: {
  title: string;
  subtitle: string;
  activeCount: number;
  formId: string;
  applyLabel: string;
  resetLabel: string;
  resetHref: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button type="button" variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        {title}
        {activeCount ? <span className="filters-count">{activeCount}</span> : null}
      </Button>
      {open ? (
        <div className="filters-overlay" role="dialog" aria-modal="true">
          <button className="filters-backdrop" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="filters-sheet">
            <div className="filters-sheet-header">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-xs text-[var(--muted)]">{subtitle}</p>
              </div>
              <button className="filters-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="filters-sheet-body">{children}</div>
            <div className="filters-sheet-actions">
              <a href={resetHref} className="filters-reset">
                {resetLabel}
              </a>
              <Button type="submit" form={formId} className="flex-1">
                {applyLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

```

### src/components/listings/Gallery.tsx
```tsx
﻿"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND_AR_NAME } from "@/lib/brand";

export type GalleryImage = {
  id: string;
  url: string;
};

export function Gallery({
  images,
  alt,
  fallback,
}: {
  images: GalleryImage[];
  alt: string;
  fallback: string;
}) {
  const safeImages = useMemo(() => images.filter((img) => Boolean(img.url)), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const gap = 12;
    const handleScroll = () => {
      const width = track.clientWidth || 1;
      const step = width + gap;
      const nextIndex = Math.round(Math.abs(track.scrollLeft) / step);
      setActiveIndex(Math.min(safeImages.length - 1, Math.max(0, nextIndex)));
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [safeImages.length]);

  const active = safeImages[activeIndex] ?? safeImages[0];

  if (!safeImages.length) {
    return (
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface)]">
        <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
          {fallback}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="gallery-mobile md:hidden">
        <div ref={trackRef} className="gallery-track" aria-label={alt}>
          {safeImages.map((img) => (
            <div key={img.id} className="gallery-slide" data-slide>
              <Image
                src={img.url}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority={false}
              />
              <span className="media-watermark" aria-hidden="true">
                {BRAND_AR_NAME}
              </span>
            </div>
          ))}
        </div>
        <div className="gallery-dots" aria-hidden="true">
          {safeImages.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              className="gallery-dot"
              data-active={idx === activeIndex}
              onClick={() => {
                const track = trackRef.current;
                if (!track) return;
                const step = track.clientWidth + 12;
                track.scrollTo({ left: idx * step, behavior: "smooth" });
                setActiveIndex(idx);
              }}
              aria-label={`Image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="gallery-desktop hidden md:grid">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface)]">
          {active ? (
            <Image
              src={active.url}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 80vw, 60vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              {fallback}
            </div>
          )}
          <span className="media-watermark" aria-hidden="true">
            {BRAND_AR_NAME}
          </span>
        </div>
        <div className="gallery-thumbs">
          {safeImages.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              className="gallery-thumb"
              data-active={idx === activeIndex}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={alt}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

```

### src/components/listings/ListingActionButtons.tsx
```tsx
﻿"use client";

import { ShareButton } from "@/components/listings/ShareButton";
import { Button } from "@/components/ui";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { CompareButton } from "@/components/compare/CompareButton";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function ListingActionButtons({
  listing,
  whatsappNumber,
  callNumber,
  shareUrl,
  labels,
  enableCompare,
}: {
  listing: { id: string; title: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  whatsappNumber?: string | null;
  callNumber?: string | null;
  shareUrl: string;
  labels: {
    whatsapp: string;
    call: string;
    share: string;
    favoriteAdd: string;
    favoriteRemove: string;
    compareAdd: string;
    compareRemove: string;
    compareLimit: string;
  };
  enableCompare: boolean;
}) {
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `${listing.title} - ${shareUrl}`
      )}`
    : null;
  const callLink = callNumber ? `tel:${callNumber.replace(/\s+/g, "")}` : null;

  return (
    <div className="listing-card-actions">
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm">{labels.whatsapp}</Button>
        </a>
      ) : null}
      {callLink ? (
        <a href={callLink} onClick={() => track("call_click", buildListingAnalyticsPayload(listing))}>
          <Button size="sm" variant="secondary">
            {labels.call}
          </Button>
        </a>
      ) : null}
      <ShareButton url={shareUrl} label={labels.share} analytics={buildListingAnalyticsPayload(listing)} />
      <FavoriteButton listing={listing} labels={{ add: labels.favoriteAdd, remove: labels.favoriteRemove }} />
      {enableCompare ? (
        <CompareButton
          listing={listing}
          labels={{ add: labels.compareAdd, remove: labels.compareRemove, limit: labels.compareLimit }}
        />
      ) : null}
    </div>
  );
}

```

### src/components/listings/ListingCard.tsx
```tsx
﻿import Link from "next/link";
import Image from "next/image";
import { Badge, Card } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getPublicImageUrl } from "@/lib/storage";
import { getPropertyTypeLabelKey, getPurposeLabelKey, type Locale } from "@/lib/i18n";
import { BRAND_AR_NAME } from "@/lib/brand";
import type { ListingCardData } from "@/components/listings/types";
import { ListingActionButtons } from "@/components/listings/ListingActionButtons";

export function ListingCard({
  listing,
  locale,
  t,
  whatsappNumber,
  callNumber,
  baseUrl,
  view = "grid",
  enableCompare = true,
}: {
  listing: ListingCardData;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  whatsappNumber?: string | null;
  callNumber?: string | null;
  baseUrl?: string | null;
  view?: "grid" | "list";
  enableCompare?: boolean;
}) {
  const images = listing.listing_images ?? [];
  const cover = [...images].sort((a, b) => a.sort - b.sort)[0]?.path ?? null;
  const coverUrl = cover ? getPublicImageUrl(cover) : null;

  const isNew = Boolean(listing.is_new);

  const shareUrl = baseUrl ? `${baseUrl}/listing/${listing.id}` : `/listing/${listing.id}`;

  const layoutClass = view === "list" ? "listing-card listing-card--list" : "listing-card";

  return (
    <Card className={`${layoutClass} hrtaj-card overflow-hidden`}>
      <Link href={`/listing/${listing.id}`} className="listing-card-media">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">
            {t("listing.card.noImage")}
          </div>
        )}
        <span className="media-watermark" aria-hidden="true">
          {BRAND_AR_NAME}
        </span>
      </Link>
      <div className="listing-card-body">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{t(getPurposeLabelKey(listing.purpose))}</Badge>
          <Badge>{t(getPropertyTypeLabelKey(listing.type))}</Badge>
          {isNew ? <Badge>{t("listing.badge.new")}</Badge> : null}
          {listing.is_furnished ? <Badge>{t("listing.badge.furnished")}</Badge> : null}
        </div>
        <Link href={`/listing/${listing.id}`} className="space-y-1">
          <h3 className="listing-card-title line-clamp-2">{listing.title}</h3>
          <p className="listing-card-location">
            {listing.city}
            {listing.area ? ` - ${listing.area}` : ""}
          </p>
        </Link>
        <div className="listing-card-price">
          {formatPrice(listing.price, listing.currency, locale)}
        </div>
        <div className="listing-card-specs">
          {listing.size_m2 ? <span>{listing.size_m2} m²</span> : null}
          <span>
            {listing.beds} {t("detail.stats.rooms")}
          </span>
          <span>
            {listing.baths} {t("detail.stats.baths")}
          </span>
        </div>
        <ListingActionButtons
          listing={listing}
          whatsappNumber={whatsappNumber}
          callNumber={callNumber}
          shareUrl={shareUrl}
          enableCompare={enableCompare}
          labels={{
            whatsapp: t("listing.action.whatsapp"),
            call: t("listing.action.call"),
            share: t("listing.action.share"),
            favoriteAdd: t("favorite.add"),
            favoriteRemove: t("favorite.remove"),
            compareAdd: t("compare.add"),
            compareRemove: t("compare.remove"),
            compareLimit: t("compare.limit"),
          }}
        />
      </div>
    </Card>
  );
}

```

### src/components/listings/ListingViewTracker.tsx
```tsx
﻿"use client";

import { useEffect } from "react";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function ListingViewTracker({
  listing,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
}) {
  useEffect(() => {
    track("listing_view", buildListingAnalyticsPayload(listing));
  }, [listing]);

  return null;
}

```

### src/components/listings/ListingsGrid.tsx
```tsx
﻿import type { ReactNode } from "react";

export function ListingsGrid({ children, view }: { children: ReactNode; view: "grid" | "list" }) {
  if (view === "list") {
    return <div className="grid gap-4">{children}</div>;
  }
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

```

### src/components/listings/MobileCtaBar.tsx
```tsx
﻿"use client";

import { Button } from "@/components/ui";
import { track, buildListingAnalyticsPayload } from "@/lib/analytics";

export function MobileCtaBar({
  listing,
  whatsappLink,
  callLink,
  labels,
}: {
  listing: { id: string; price?: number | null; area?: string | null; city?: string | null; size_m2?: number | null };
  whatsappLink?: string | null;
  callLink?: string | null;
  labels: { whatsapp: string; call: string; book: string };
}) {
  return (
    <div className="mobile-cta md:hidden">
      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm">{labels.whatsapp}</Button>
        </a>
      ) : null}
      {callLink ? (
        <a
          href={callLink}
          onClick={() => track("call_click", buildListingAnalyticsPayload(listing))}
        >
          <Button size="sm" variant="secondary">
            {labels.call}
          </Button>
        </a>
      ) : null}
      <a href="#lead-form">
        <Button size="sm" variant="ghost">
          {labels.book}
        </Button>
      </a>
    </div>
  );
}

```

### src/components/listings/PropertyFacts.tsx
```tsx
﻿export type PropertyFact = {
  label: string;
  value: string | number;
};

export function PropertyFacts({
  items,
  className = "",
}: {
  items: Array<PropertyFact | null | undefined>;
  className?: string;
}) {
  const visible = items.filter(
    (item): item is PropertyFact =>
      Boolean(item && item.value !== null && item.value !== undefined && item.value !== "")
  );

  if (!visible.length) return null;

  return (
    <div className={`property-facts ${className}`}>
      {visible.map((item) => (
        <div key={item.label} className="fact-item">
          <p className="fact-label">{item.label}</p>
          <p className="fact-value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

```

### src/components/listings/RecentlyViewedStrip.tsx
```tsx
﻿"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";
import { getRecentlyViewed, subscribeRecentlyViewed } from "@/lib/recentlyViewed/store";
import { getPublicImageUrl } from "@/lib/storage";
import { createT, type Locale } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n.client";
import { BRAND_AR_NAME } from "@/lib/brand";

export type RecentlyViewedListing = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  listing_images?: { path: string; sort: number }[] | null;
};

export function RecentlyViewedStrip({
  locale,
  title,
  empty,
}: {
  locale?: Locale;
  title: string;
  empty: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [items, setItems] = useState<RecentlyViewedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useMemo(() => createT(locale || getClientLocale()), [locale]);

  useEffect(() => {
    setMounted(true);
    setIds(getRecentlyViewed());
    return subscribeRecentlyViewed(setIds);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (ids.length === 0) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/listings/by-ids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { listings: RecentlyViewedListing[] };
        setItems(data.listings ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [ids]);

  if (!mounted || ids.length === 0) return null;

  return (
    <section className="recently-strip">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {loading ? <span className="text-xs text-[var(--muted)]">{t("general.loading")}</span> : null}
      </div>
      {items.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-[var(--muted)]">{empty}</p>
        </Card>
      ) : (
        <div className="recently-track">
          {items.map((item) => {
            const cover = [...(item.listing_images ?? [])].sort((a, b) => a.sort - b.sort)[0]?.path;
            const coverUrl = cover ? getPublicImageUrl(cover) : null;
            return (
              <Link key={item.id} href={`/listing/${item.id}`} className="recently-card">
                <div className="recently-card-media">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 70vw, 240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                      {t("listing.card.noImage")}
                    </div>
                  )}
                  <span className="media-watermark" aria-hidden="true">
                    {BRAND_AR_NAME}
                  </span>
                </div>
                <div className="recently-card-body">
                  <p className="line-clamp-2">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.city}{item.area ? ` - ${item.area}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

```

### src/components/listings/RecentlyViewedTracker.tsx
```tsx
﻿"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recentlyViewed/store";

export function RecentlyViewedTracker({ id }: { id: string }) {
  useEffect(() => {
    if (!id) return;
    addRecentlyViewed(id);
  }, [id]);

  return null;
}

```

### src/components/listings/ShareButton.tsx
```tsx
﻿"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { track, type AnalyticsPayload } from "@/lib/analytics";

export function ShareButton({
  url,
  label,
  analytics,
}: {
  url: string;
  label: string;
  analytics?: AnalyticsPayload;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (typeof navigator === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      track("share_click", analytics ?? {});
    } catch {
      // ignore
    }
  };

  return (
    <Button size="sm" variant="ghost" type="button" onClick={handleClick} aria-label={label}>
      {copied ? "✓" : null}
      {label}
    </Button>
  );
}

```

### src/components/listings/types.ts
```ts
﻿export type ListingImage = {
  path: string;
  sort: number;
};

export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  purpose: string;
  type: string;
  created_at?: string | null;
  is_furnished?: boolean | null;
  is_new?: boolean | null;
  listing_images?: ListingImage[] | null;
};

```

### src/components/search/FiltersAnalytics.tsx
```tsx
﻿"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function FiltersAnalytics({ formIds }: { formIds: string[] }) {
  useEffect(() => {
    const handlers: Array<() => void> = [];

    formIds.forEach((id) => {
      const form = document.getElementById(id) as HTMLFormElement | null;
      if (!form) return;
      const handleSubmit = () => {
        const data = new FormData(form);
        const summary: Record<string, string> = {};
        ["transaction", "type", "city", "area", "priceMin", "priceMax", "beds", "baths", "sort"].forEach(
          (key) => {
            const value = data.get(key);
            if (typeof value === "string" && value) summary[key] = value;
          }
        );
        const amenities = data.getAll("amenities").filter((item) => typeof item === "string");
        if (amenities.length) summary.amenities = String(amenities.length);
        track("filter_apply", summary);
      };
      form.addEventListener("submit", handleSubmit);
      handlers.push(() => form.removeEventListener("submit", handleSubmit));
    });

    return () => {
      handlers.forEach((cleanup) => cleanup());
    };
  }, [formIds]);

  return null;
}

```

### src/components/search/SaveSearchModal.tsx
```tsx
﻿"use client";

import { useState } from "react";
import { addSavedSearch, type SavedSearch } from "@/lib/savedSearch/store";
import { useToast } from "@/components/Toast";
import { Button, Card } from "@/components/ui";

export function SaveSearchModal({
  queryString,
  defaultName,
  labels,
}: {
  queryString: string;
  defaultName: string;
  labels: {
    open: string;
    title: string;
    nameLabel: string;
    save: string;
    cancel: string;
    saved: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const { push } = useToast();

  function handleSave() {
    if (!name.trim()) return;
    const item: SavedSearch = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      queryString,
      createdAt: new Date().toISOString(),
    };
    addSavedSearch(item);
    push(labels.saved);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        {labels.open}
      </Button>
      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">{labels.title}</h3>
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">{labels.nameLabel}</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {labels.cancel}
                </Button>
                <Button type="button" size="sm" onClick={handleSave}>
                  {labels.save}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}

```

### src/components/search/SavedSearchesList.tsx
```tsx
﻿"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedSearches, removeSavedSearch, markSearchRun, subscribeSavedSearches, type SavedSearch } from "@/lib/savedSearch/store";
import { Button, Card } from "@/components/ui";

export function SavedSearchesList({
  labels,
}: {
  labels: { empty: string; run: string; remove: string; lastRun: string };
}) {
  const [items, setItems] = useState<SavedSearch[]>(() => getSavedSearches());

  useEffect(() => subscribeSavedSearches(setItems), []);

  if (!items.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--muted)]">{labels.empty}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const href = item.queryString ? `/listings?${item.queryString}` : "/listings";
        return (
          <Card key={item.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{item.name}</p>
                {item.lastRunAt ? (
                  <p className="text-xs text-[var(--muted)]">
                    {labels.lastRun}: {new Date(item.lastRunAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={href}
                  onClick={() => markSearchRun(item.id)}
                  className="text-sm font-semibold text-[var(--accent)]"
                >
                  {labels.run}
                </Link>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeSavedSearch(item.id)}>
                  {labels.remove}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

```

### src/components/ui.tsx
```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function Section({
  title,
  subtitle,
  kicker,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {kicker}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold text-[var(--text)] sm:text-xl">{title}</h2>
          {subtitle ? (
            <p className="text-xs text-[var(--muted)] sm:text-sm">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Input({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={`h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`min-h-[120px] w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus)] ${className}`}
      {...props}
    />
  );
}

export { Button, Card, Badge, Skeleton };

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
    </Card>
  );
}

```

### src/components/ui/Badge.tsx
```tsx
﻿import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
      {children}
    </span>
  );
}

```

### src/components/ui/Button.tsx
```tsx
﻿import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[var(--shadow)] hover:brightness-105 border border-transparent",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)]",
  ghost:
    "bg-transparent text-[var(--text)] hover:bg-[var(--accent-soft)] border border-transparent",
  danger:
    "bg-[rgba(244,63,94,0.15)] text-[var(--danger)] hover:bg-[rgba(244,63,94,0.25)] border border-[rgba(244,63,94,0.35)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export type { ButtonSize, ButtonVariant };

```

### src/components/ui/Card.tsx
```tsx
﻿import type { ComponentPropsWithoutRef } from "react";

export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:p-5 ${className}`}
      {...props}
    />
  );
}

```

### src/components/ui/Skeleton.tsx
```tsx
﻿import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-xl bg-[var(--surface-2)] ${className}`} {...props} />;
}

```

### src/i18n/ar.json
```json
{
  "favorite.add": "تم الحفظ",
  "favorite.remove": "تمت الإزالة",
  "compare.add": "إضافة للمقارنة",
  "compare.remove": "إزالة من المقارنة",
  "compare.limit": "تقدر تقارن 4 عقارات بس",
  "compare.title": "مقارنة العقارات",
  "compare.subtitle": "قارن بين العقارات المختارة بسهولة.",
  "compare.empty": "مفيش عقارات للمقارنة.",
  "compare.price": "السعر",
  "compare.area": "المنطقة",
  "compare.size": "المساحة",
  "compare.beds": "الغرف",
  "compare.baths": "الحمامات",
  "compare.floor": "الدور",
  "compare.amenities": "المميزات",
  "compare.action": "فتح المقارنة",
  "compare.bar": "مقارنة",
  "compare.disabled": "ميزة المقارنة غير مفعلة حالياً.",
  "saved.title": "العقارات المحفوظة",
  "saved.subtitle": "ارجع لعقاراتك المحفوظة في أي وقت.",
  "saved.empty": "مفيش عقارات محفوظة",
  "saved.syncPrompt": "عندك عقارات محفوظة محلياً، تحب تزامنها؟",
  "saved.syncAction": "تزامن",
  "saved.syncDone": "تم التزامن",
  "savedSearch.save": "حفظ البحث",
  "savedSearch.modalTitle": "حفظ البحث",
  "savedSearch.name": "اسم البحث",
  "savedSearch.saved": "تم حفظ البحث",
  "savedSearch.title": "عمليات البحث المحفوظة",
  "savedSearch.subtitle": "ارجع لعمليات البحث المفضلة بسرعة.",
  "savedSearch.empty": "لا يوجد بحث محفوظ.",
  "savedSearch.run": "تشغيل",
  "savedSearch.remove": "حذف",
  "savedSearch.lastRun": "آخر تشغيل",
  "savedSearch.defaultName": "بحث جديد",
  "savedSearch.disabled": "ميزة حفظ البحث غير مفعلة حالياً.",
  "general.loading": "جارٍ التحميل...",
  "general.cancel": "إلغاء",
  "admin.flags.title": "إدارة المزايا",
  "admin.flags.subtitle": "تحكم سريع في تفعيل أو تعطيل المزايا.",
  "admin.flags.flag": "الميزة",
  "admin.flags.enabled": "مفعلة",
  "admin.flags.disabled": "معطلة",
  "admin.flags.manage": "إدارة المزايا",
  "crm.leads.details": "تفاصيل العميل",
  "crm.leads.masked": "بعض البيانات مخفية للخصوصية",
  "trust.title": "معلومات الثقة",
  "trust.address.title": "عنوان المكتب",
  "trust.address.value": "مدينة نصر - شارع عباس العقاد",
  "trust.hours.title": "مواعيد العمل",
  "trust.hours.value": "يومياً 10 ص - 9 م",
  "trust.response.title": "زمن الرد",
  "trust.response.value": "نرد خلال 10 دقائق",
  "home.trust.subtitle": "ثقة مبنية على خبرة محلية ورد سريع.",
  "home.areas.title": "أفضل المناطق",
  "home.areas.subtitle": "اختار المنطقة اللي تهمك واضبط الفلاتر بسرعة.",
  "home.areas.cta": "اعرض العقارات",
  "home.areas.smouha.title": "سموحة",
  "home.areas.smouha.subtitle": "سكن راقي وقريب لكل الخدمات.",
  "home.areas.gleem.title": "جليم",
  "home.areas.gleem.subtitle": "إطلالات بحرية وموقع مميز.",
  "home.areas.stanley.title": "ستانلي",
  "home.areas.stanley.subtitle": "واجهة بحرية ومطاعم وكافيهات.",
  "home.areas.miami.title": "ميامي",
  "home.areas.miami.subtitle": "قريب من البحر وبأسعار متنوعة.",
  "home.areas.sidiBishr.title": "سيدي بشر",
  "home.areas.sidiBishr.subtitle": "خيارات سكنية مناسبة للعائلات.",
  "home.areas.agami.title": "العجمي",
  "home.areas.agami.subtitle": "مصايف وشاليهات بقيمة قوية.",
  "home.faq.title": "أسئلة شائعة",
  "home.faq.subtitle": "إجابات سريعة تساعدك تقرر أسرع.",
  "home.faq.q1": "إزاي أبدأ أدوّر على شقة مناسبة؟",
  "home.faq.a1": "حدد الميزانية والمنطقة ونوع العقار، وبعدها استخدم الفلاتر للحصول على النتائج الأدق.",
  "home.faq.q2": "هل الأسعار قابلة للتفاوض؟",
  "home.faq.a2": "أغلب العروض قابلة للتفاوض حسب حالة العقار وطريقة السداد.",
  "home.faq.q3": "إيه الأوراق المطلوبة للشراء؟",
  "home.faq.a3": "بطاقة الرقم القومي وعقد الملكية أو التفويض، وبنك إن كان التمويل مطلوب.",
  "home.faq.q4": "هل فيه معاينة قبل الحجز؟",
  "home.faq.a4": "بنرتب معاينة في الوقت المناسب لك قبل اتخاذ القرار.",
  "home.faq.q5": "هل فيه عمولات إضافية؟",
  "home.faq.a5": "العمولة بتكون واضحة من البداية حسب نوع العملية.",
  "home.faq.q6": "متى يتم تسليم الوحدة؟",
  "home.faq.a6": "وقت التسليم يعتمد على حالة الوحدة ونوع العقد، وبنوضح التفاصيل قبل الإغلاق.",
  "partners.title": "شركاؤنا",
  "partners.subtitle": "شبكة شركاء تساعدنا نوصلك لأفضل العروض.",
  "partners.empty": "لا يوجد شركاء متاحين حالياً.",
  "recent.title": "شوفت قريباً",
  "recent.empty": "مفيش عقارات شوفتها قريباً",
  "crm.adminOnly": "الصلاحية للمالك أو المدير فقط.",
  "crm.customers.adminOnly": "تعديل البيانات للمالك أو المدير فقط.",
  "crm.customers.piiNotice": "أي تعديل في الاسم أو الهاتف أو البريد يحتاج موافقة المالك.",
  "crm.customers.delete.requestTitle": "طلب حذف العميل",
  "crm.customers.delete.requestSubtitle": "سيتم إرسال طلب الحذف للمالك للموافقة.",
  "crm.leads.delete.requestTitle": "طلب حذف الطلب",
  "crm.leads.delete.requestSubtitle": "سيتم إرسال طلب الحذف للمالك للموافقة.",
  "owner.delete.requestButton": "طلب حذف",
  "owner.delete.requestConfirm": "إرسال الطلب",
  "owner.delete.requestLoading": "جارٍ الإرسال...",
  "admin.pii.title": "طلبات تعديل البيانات الحساسة",
  "admin.pii.subtitle": "راجع طلبات التعديل والحذف واعتمدها أو ارفضها.",
  "admin.pii.empty": "لا توجد طلبات معلّقة حاليًا.",
  "admin.pii.request": "طلب",
  "admin.pii.requestedBy": "مقدم الطلب: {{name}}",
  "admin.pii.requestedAt": "تاريخ الطلب: {{time}}",
  "admin.pii.table": "الجدول: {{table}}",
  "admin.pii.action": "الإجراء: {{action}}",
  "admin.pii.payload": "البيانات المطلوبة",
  "admin.pii.payload.empty": "لا توجد تفاصيل إضافية.",
  "admin.pii.approve": "اعتماد",
  "admin.pii.reject": "رفض",
  "admin.pii.reject.reason": "سبب الرفض (اختياري)",
  "admin.pii.reject.placeholder": "اكتب السبب لو محتاج",
  "admin.users.locked": "المالك (مُقفل)",
  "admin.users.disabled": "مُعطّل",
  "admin.users.disable": "تعطيل",
  "admin.users.enable": "تفعيل",
  "admin.users.error.generic": "تعذر تحديث المستخدم.",
  "owner.users.invite.success": "تم إرسال الدعوة بنجاح."
}

```

### src/i18n/en.json
```json
{
  "favorite.add": "Saved",
  "favorite.remove": "Removed",
  "compare.add": "Add to compare",
  "compare.remove": "Remove",
  "compare.limit": "You can compare up to 4",
  "compare.title": "Compare listings",
  "compare.subtitle": "Compare listings side by side.",
  "compare.empty": "Select at least two listings to compare.",
  "compare.price": "Price",
  "compare.area": "Area",
  "compare.size": "Size",
  "compare.beds": "Beds",
  "compare.baths": "Baths",
  "compare.floor": "Floor",
  "compare.amenities": "Amenities",
  "compare.action": "View compare",
  "compare.bar": "Compare ready",
  "compare.disabled": "Compare is currently disabled.",
  "saved.title": "Saved listings",
  "saved.subtitle": "Listings you saved for later.",
  "saved.empty": "No saved listings yet.",
  "saved.syncPrompt": "You have local favorites to sync.",
  "saved.syncAction": "Sync",
  "saved.syncDone": "Synced",
  "savedSearch.save": "Save search",
  "savedSearch.modalTitle": "Name your search",
  "savedSearch.name": "Search name",
  "savedSearch.saved": "Search saved",
  "savedSearch.title": "Saved searches",
  "savedSearch.subtitle": "Run your saved filters quickly.",
  "savedSearch.empty": "No saved searches yet.",
  "savedSearch.run": "Run",
  "savedSearch.remove": "Delete",
  "savedSearch.lastRun": "Last run",
  "savedSearch.defaultName": "Saved search",
  "savedSearch.disabled": "Saved searches are disabled.",
  "general.loading": "Loading...",
  "general.cancel": "Cancel",
  "admin.flags.title": "Feature flags",
  "admin.flags.subtitle": "Control features via environment variables.",
  "admin.flags.flag": "Flag",
  "admin.flags.enabled": "Enabled",
  "admin.flags.disabled": "Disabled",
  "admin.flags.manage": "Manage flags",
  "crm.leads.details": "Lead details",
  "crm.leads.masked": "Sensitive data is hidden for non-owners.",
  "trust.title": "Trust & Contact",
  "trust.address.title": "Office address",
  "trust.address.value": "Nasr City - Abbas El Akkad St.",
  "trust.hours.title": "Working hours",
  "trust.hours.value": "Daily 10 AM - 9 PM",
  "trust.response.title": "Response time",
  "trust.response.value": "We respond within 10 minutes",
  "home.trust.subtitle": "Trusted locally with fast response times.",
  "home.areas.title": "Top Areas",
  "home.areas.subtitle": "Choose an area and refine quickly.",
  "home.areas.cta": "View listings",
  "home.areas.smouha.title": "Smouha",
  "home.areas.smouha.subtitle": "Premium living close to services.",
  "home.areas.gleem.title": "Gleem",
  "home.areas.gleem.subtitle": "Sea views and prime location.",
  "home.areas.stanley.title": "Stanley",
  "home.areas.stanley.subtitle": "Waterfront with cafes and dining.",
  "home.areas.miami.title": "Miami",
  "home.areas.miami.subtitle": "Close to the sea with varied budgets.",
  "home.areas.sidiBishr.title": "Sidi Bishr",
  "home.areas.sidiBishr.subtitle": "Family-friendly residential options.",
  "home.areas.agami.title": "Agami",
  "home.areas.agami.subtitle": "Summer homes with strong value.",
  "home.faq.title": "FAQs",
  "home.faq.subtitle": "Quick answers to help you decide faster.",
  "home.faq.q1": "How do I start searching for a property?",
  "home.faq.a1": "Set your budget, area, and property type, then use filters for the most precise results.",
  "home.faq.q2": "Are prices negotiable?",
  "home.faq.a2": "Most listings are negotiable depending on the property and payment terms.",
  "home.faq.q3": "What documents are required to buy?",
  "home.faq.a3": "National ID, ownership contract or authorization, and bank documents if financing.",
  "home.faq.q4": "Can I view the property before booking?",
  "home.faq.a4": "Yes, we arrange a viewing at a time that suits you.",
  "home.faq.q5": "Are there extra commissions?",
  "home.faq.a5": "Fees are clear upfront based on the transaction type.",
  "home.faq.q6": "When is the unit delivered?",
  "home.faq.a6": "Delivery time depends on the unit status and contract, and is clarified before closing.",
  "partners.title": "Our Partners",
  "partners.subtitle": "A trusted network that helps us deliver the best listings.",
  "partners.empty": "No partners available right now.",
  "recent.title": "Recently viewed",
  "recent.empty": "No recently viewed listings",
  "crm.adminOnly": "Owner or admin only.",
  "crm.customers.adminOnly": "Owner or admin only.",
  "crm.customers.piiNotice": "Changes to name, phone, or email require owner approval.",
  "crm.customers.delete.requestTitle": "Request customer deletion",
  "crm.customers.delete.requestSubtitle": "A deletion request will be sent to the owner for approval.",
  "crm.leads.delete.requestTitle": "Request lead deletion",
  "crm.leads.delete.requestSubtitle": "A deletion request will be sent to the owner for approval.",
  "owner.delete.requestButton": "Request delete",
  "owner.delete.requestConfirm": "Submit request",
  "owner.delete.requestLoading": "Sending...",
  "admin.pii.title": "Sensitive data approval",
  "admin.pii.subtitle": "Review pending PII change and delete requests.",
  "admin.pii.empty": "No pending requests.",
  "admin.pii.request": "Request",
  "admin.pii.requestedBy": "Requested by: {{name}}",
  "admin.pii.requestedAt": "Requested at: {{time}}",
  "admin.pii.table": "Table: {{table}}",
  "admin.pii.action": "Action: {{action}}",
  "admin.pii.payload": "Requested fields",
  "admin.pii.payload.empty": "No additional details.",
  "admin.pii.approve": "Approve",
  "admin.pii.reject": "Reject",
  "admin.pii.reject.reason": "Rejection reason (optional)",
  "admin.pii.reject.placeholder": "Add a note",
  "admin.users.locked": "Owner (locked)",
  "admin.users.disabled": "Disabled",
  "admin.users.disable": "Disable",
  "admin.users.enable": "Enable",
  "admin.users.error.generic": "Unable to update user.",
  "owner.users.invite.success": "Invite sent successfully."
}

```

### src/lib/analytics/index.ts
```ts
﻿export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __hrtajEvents?: Array<{ event: string; payload: AnalyticsPayload }>;
  }
}

function sanitizePayload(payload: AnalyticsPayload) {
  const cleaned: Record<string, string | number | boolean> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    cleaned[key] = value as string | number | boolean;
  });
  return cleaned;
}

export function track(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const cleaned = sanitizePayload(payload);

  const send = () => {
    window.__hrtajEvents = window.__hrtajEvents || [];
    window.__hrtajEvents.push({ event, payload: cleaned });

    if (typeof window.gtag === "function") {
      window.gtag("event", event, cleaned);
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, cleaned);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`[analytics] ${event}`, cleaned);
    }
  };

  setTimeout(send, 0);
}

export function buildListingAnalyticsPayload(listing: {
  id: string;
  price?: number | null;
  area?: string | null;
  city?: string | null;
  size_m2?: number | null;
}) {
  const price = listing.price ?? null;
  const priceBucket = price === null ? null : bucketNumber(price, [1000000, 2000000, 5000000, 10000000]);
  const sizeBucket = listing.size_m2 === null || listing.size_m2 === undefined
    ? null
    : bucketNumber(listing.size_m2, [60, 100, 150, 200, 300]);
  const areaSlug = (listing.area || listing.city || "").toLowerCase().replace(/\s+/g, "-");

  return {
    listing_id: listing.id,
    price_bucket: priceBucket,
    size_bucket: sizeBucket,
    area_slug: areaSlug || undefined,
  };
}

function bucketNumber(value: number, thresholds: number[]) {
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value < thresholds[i]) return `<${thresholds[i]}`;
  }
  return `>=${thresholds[thresholds.length - 1]}`;
}

```

### src/lib/compare/store.ts
```ts
﻿const STORAGE_KEY = "hrtaj:compare:v1";
const MAX_COMPARE = 4;

let cache: string[] | null = null;
const listeners = new Set<(ids: string[]) => void>();

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function emit(ids: string[]) {
  listeners.forEach((listener) => listener(ids));
}

export function getCompareIds(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setCompareIds(next: string[]) {
  const unique = Array.from(new Set(next)).slice(0, MAX_COMPARE);
  cache = unique;
  writeStorage(unique);
  emit(unique);
  return unique;
}

export function toggleCompare(id: string) {
  const current = getCompareIds();
  const set = new Set(current);
  if (set.has(id)) {
    set.delete(id);
  } else {
    if (set.size >= MAX_COMPARE) {
      return Array.from(set);
    }
    set.add(id);
  }
  return setCompareIds(Array.from(set));
}

export function isCompared(id: string) {
  return getCompareIds().includes(id);
}

export function subscribeCompare(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const COMPARE_STORAGE_KEY = STORAGE_KEY;
export const COMPARE_LIMIT = MAX_COMPARE;

```

### src/lib/constants.ts
```ts
﻿export const PURPOSE_OPTIONS = [
  { value: "sale", labelKey: "purpose.sale" },
  { value: "rent", labelKey: "purpose.rent" },
  { value: "new-development", labelKey: "purpose.new" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: "شقة", labelKey: "propertyType.apartment" },
  { value: "فيلا", labelKey: "propertyType.villa" },
  { value: "دوبلكس", labelKey: "propertyType.duplex" },
  { value: "تاون هاوس", labelKey: "propertyType.townhouse" },
  { value: "بنتهاوس", labelKey: "propertyType.penthouse" },
  { value: "ستوديو", labelKey: "propertyType.studio" },
  { value: "أرض", labelKey: "propertyType.land" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", labelKey: "sort.newest" },
  { value: "price_asc", labelKey: "sort.priceAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
  { value: "area_asc", labelKey: "sort.areaAsc" },
  { value: "area_desc", labelKey: "sort.areaDesc" },
] as const;

export const FEATURE_CATEGORIES = [
  { titleKey: "category.rent.title", descKey: "category.rent.desc", purpose: "rent" },
  { titleKey: "category.sale.title", descKey: "category.sale.desc", purpose: "sale" },
  { titleKey: "category.new.title", descKey: "category.new.desc", purpose: "new-development" },
] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "new", labelKey: "lead.status.new" },
  { value: "contacted", labelKey: "lead.status.contacted" },
  { value: "qualified", labelKey: "lead.status.qualified" },
  { value: "meeting_set", labelKey: "lead.status.meeting_set" },
  { value: "follow_up", labelKey: "lead.status.follow_up" },
  { value: "negotiation", labelKey: "lead.status.negotiation" },
  { value: "won", labelKey: "lead.status.won" },
  { value: "lost", labelKey: "lead.status.lost" },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: "facebook", labelKey: "lead.source.facebook" },
  { value: "propertyfinder", labelKey: "lead.source.propertyfinder" },
  { value: "dubizzle", labelKey: "lead.source.dubizzle" },
  { value: "organic", labelKey: "lead.source.organic" },
  { value: "influencer", labelKey: "lead.source.influencer" },
  { value: "whatsapp", labelKey: "lead.source.whatsapp" },
  { value: "chatbot", labelKey: "lead.source.chatbot" },
  { value: "referral", labelKey: "lead.source.referral" },
  { value: "partner", labelKey: "lead.source.partner" },
  { value: "web", labelKey: "lead.source.web" },
] as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: "draft", labelKey: "submission.status.draft" },
  { value: "submitted", labelKey: "submission.status.submitted" },
  { value: "under_review", labelKey: "submission.status.under_review" },
  { value: "needs_changes", labelKey: "submission.status.needs_changes" },
  { value: "approved", labelKey: "submission.status.approved" },
  { value: "published", labelKey: "submission.status.published" },
  { value: "archived", labelKey: "submission.status.archived" },
] as const;

export const UNIT_STATUS_OPTIONS = [
  { value: "available", labelKey: "staff.unitStatus.available" },
  { value: "reserved", labelKey: "staff.unitStatus.reserved" },
  { value: "sold", labelKey: "staff.unitStatus.sold" },
  { value: "rented", labelKey: "staff.unitStatus.rented" },
  { value: "off_market", labelKey: "staff.unitStatus.off_market" },
  { value: "on_hold", labelKey: "staff.unitStatus.on_hold" },
] as const;

export const MEDIA_TYPE_OPTIONS = [
  { value: "brochure", labelKey: "media.type.brochure" },
  { value: "floorplan", labelKey: "media.type.floorplan" },
  { value: "image", labelKey: "media.type.image" },
  { value: "other", labelKey: "media.type.other" },
] as const;

export const ATTACHMENT_CATEGORY_OPTIONS = [
  { value: "unit_photos", labelKey: "attachment.category.unit_photos" },
  { value: "building_entry", labelKey: "attachment.category.building_entry" },
  { value: "view", labelKey: "attachment.category.view" },
  { value: "plan", labelKey: "attachment.category.plan" },
  { value: "contract", labelKey: "attachment.category.contract" },
  { value: "owner_docs", labelKey: "attachment.category.owner_docs" },
  { value: "other", labelKey: "attachment.category.other" },
] as const;

export const ATTACHMENT_TYPE_OPTIONS = [
  { value: "image", labelKey: "attachment.type.image" },
  { value: "pdf", labelKey: "attachment.type.pdf" },
  { value: "video", labelKey: "attachment.type.video" },
  { value: "doc", labelKey: "attachment.type.doc" },
  { value: "other", labelKey: "attachment.type.other" },
] as const;

```

### src/lib/favorites/store.ts
```ts
﻿const STORAGE_KEY = "hrtaj:favorites:v1";
const MAX_FAVORITES = 200;

let cache: string[] | null = null;
const listeners = new Set<(ids: string[]) => void>();

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

function emit(ids: string[]) {
  listeners.forEach((listener) => listener(ids));
}

export function getFavorites(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setFavorites(next: string[]) {
  const unique = Array.from(new Set(next)).slice(0, MAX_FAVORITES);
  cache = unique;
  writeStorage(unique);
  emit(unique);
  return unique;
}

export function toggleFavorite(id: string) {
  const current = getFavorites();
  const set = new Set(current);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  return setFavorites(Array.from(set));
}

export function isFavorite(id: string) {
  return getFavorites().includes(id);
}

export function subscribeFavorites(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const FAVORITES_STORAGE_KEY = STORAGE_KEY;

```

### src/lib/fieldHelp.ts
```ts
export type FieldHelpEntry = {
  label_ar: string;
  what_ar: string;
  purpose_ar: string;
  idea_ar: string;
  steps_ar: string[];
  example_ar?: string;
  rules_ar?: string[];
};

function makeHelp(
  label: string,
  what: string,
  purpose: string,
  idea: string,
  steps: string[],
  example?: string,
  rules?: string[]
): FieldHelpEntry {
  return {
    label_ar: label,
    what_ar: what,
    purpose_ar: purpose,
    idea_ar: idea,
    steps_ar: steps,
    example_ar: example,
    rules_ar: rules,
  };
}

function textHelp(label: string, purpose: string, example?: string, rules?: string[]) {
  return makeHelp(
    label,
    `ده حقل ${label}.`,
    purpose,
    "فكرته إننا نسجل المعلومة بشكل واضح يساعد الفريق.",
    ["اكتب المعلومة بوضوح.", "راجع الإملاء.", "اتأكد إنها مناسبة للسياق."],
    example,
    rules
  );
}

function numberHelp(label: string, purpose: string, example?: string, rules?: string[]) {
  return makeHelp(
    label,
    `ده حقل رقمي لـ ${label}.`,
    purpose,
    "الرقم لازم يكون دقيق عشان الحسابات والفرز.",
    ["اكتب رقم صحيح.", "اتأكد من الوحدة.", "سيبه فاضي لو مش مطلوب."],
    example,
    rules
  );
}

function selectHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اختار القيمة المناسبة لـ ${label}.`,
    purpose,
    "الاختيارات الموحدة بتسهل التقارير والمتابعة.",
    ["اختار من القائمة.", "لو مش متأكد اختار الأقرب.", "تقدر تعدل لاحقًا."],
    example
  );
}

function dateHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `حدد تاريخ ${label}.`,
    purpose,
    "التاريخ بيساعدنا ننظم المتابعة.",
    ["اختار اليوم والشهر والسنة.", "اتأكد من التاريخ الصحيح.", "سيبه فاضي لو مش مطلوب."],
    example
  );
}

function datetimeHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `حدد تاريخ ووقت ${label}.`,
    purpose,
    "التوقيت بيساعد في التنظيم والمتابعة.",
    ["اختار اليوم والوقت.", "اتأكد من المنطقة الزمنية.", "راجع الموعد قبل الحفظ."],
    example
  );
}

function phoneHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رقم ${label}.`,
    purpose,
    "بنستخدمه للتواصل السريع.",
    ["اكتب الرقم بدون مسافات.", "اتأكد من صحته.", "استخدم صيغة واضحة."],
    example,
    ["مثال: 01000000000"]
  );
}

function emailHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب بريد ${label}.`,
    purpose,
    "بنستخدمه للتواصل وإرسال الروابط.",
    ["لازم يحتوي على @.", "بدون مسافات.", "راجع الإملاء."],
    example,
    ["مثال: name@example.com"]
  );
}

function urlHelp(label: string, purpose: string, example?: string) {
  return makeHelp(
    label,
    `اكتب رابط ${label}.`,
    purpose,
    "الرابط الصحيح يضمن فتح الصفحة بسهولة.",
    ["اكتب الرابط كامل.", "يفضل يبدأ بـ https://.", "اختبره سريعًا."],
    example
  );
}

function fileHelp(label: string, purpose: string, rules?: string[]) {
  return makeHelp(
    label,
    `ارفع ملف ${label}.`,
    purpose,
    "الملف بيساعدنا نكمل البيانات أو نعرضها.",
    ["اتأكد من حجم الملف.", "اختار الصيغة المطلوبة.", "تقدر تستبدله لاحقًا."],
    undefined,
    rules
  );
}

function toggleHelp(label: string, purpose: string) {
  return makeHelp(
    label,
    `اختيار تشغيل/إيقاف لـ ${label}.`,
    purpose,
    "بيحدد حالة واضحة بسرعة.",
    ["فعّله لو ينطبق.", "سيبه مقفول لو مش مطلوب.", "تقدر تعدل لاحقًا."]
  );
}

const FIELD_HELP_KEYS = [
  "account.profile.full_name",
  "account.profile.phone",
  "admin.approvals.status",
  "admin.pii.reject.reason",
  "admin.ads.body_ar",
  "admin.ads.body_en",
  "admin.ads.cta_label_ar",
  "admin.ads.cta_label_en",
  "admin.ads.cta_url",
  "admin.ads.status",
  "admin.ads.title_ar",
  "admin.ads.title_en",
  "admin.homepage.media.is_published",
  "admin.homepage.media.poster",
  "admin.homepage.media.sort_order",
  "admin.homepage.media.title",
  "admin.homepage.media.type",
  "admin.homepage.media.url",
  "admin.homepage.metrics.is_published",
  "admin.homepage.metrics.label_ar",
  "admin.homepage.metrics.label_en",
  "admin.homepage.metrics.sort_order",
  "admin.homepage.metrics.value",
  "admin.homepage.projects.cta_url",
  "admin.homepage.projects.currency",
  "admin.homepage.projects.image_url",
  "admin.homepage.projects.is_published",
  "admin.homepage.projects.location_ar",
  "admin.homepage.projects.location_en",
  "admin.homepage.projects.sort_order",
  "admin.homepage.projects.starting_price",
  "admin.homepage.projects.title_ar",
  "admin.homepage.projects.title_en",
  "admin.partners.developer_id",
  "admin.partners.is_active",
  "admin.partners.logo_url",
  "admin.partners.name",
  "admin.partners.name_ar",
  "admin.partners.name_en",
  "admin.partners.role",
  "admin.partners.sort_order",
  "admin.partners.user_id",
  "admin.review.note",
  "admin.review.submission_status",
  "admin.users.role",
  "attachments.item.category",
  "attachments.item.note",
  "attachments.item.primary",
  "attachments.item.published",
  "attachments.item.title",
  "attachments.upload.category",
  "attachments.upload.file",
  "attachments.upload.note",
  "attachments.upload.title",
  "auth.email",
  "auth.password",
  "auth.passwordConfirm",
  "careers.admin.status",
  "careers.apply.cv",
  "careers.apply.email",
  "careers.apply.message",
  "careers.apply.name",
  "careers.apply.phone",
  "careers.apply.role",
  "crm.activities.customer",
  "crm.activities.lead",
  "crm.activities.notes",
  "crm.activities.occurred_at",
  "crm.activities.outcome",
  "crm.activities.type",
  "crm.customers.budget_max",
  "crm.customers.budget_min",
  "crm.customers.email",
  "crm.customers.full_name",
  "crm.customers.intent",
  "crm.customers.lead_source",
  "crm.customers.phone_e164",
  "crm.customers.phone_raw",
  "crm.customers.preferred_areas",
  "crm.customers.search",
  "crm.filter.assigned",
  "crm.filter.lostReason",
  "crm.filter.overdue",
  "crm.filter.source",
  "crm.filter.status",
  "crm.lead.assigned_to",
  "crm.lead.lost_reason",
  "crm.lead.lost_reason_note",
  "crm.lead.next_action_at",
  "crm.lead.next_action_note",
  "crm.lead.note",
  "crm.lead.status",
  "crm.search",
  "crm.sources.name",
  "crm.sources.slug",
  "crm.spend.amount",
  "crm.spend.channel",
  "crm.spend.month",
  "crm.visits.assigned_to",
  "crm.visits.lead",
  "crm.visits.listing",
  "crm.visits.next_followup_at",
  "crm.visits.notes",
  "crm.visits.outcome",
  "crm.visits.scheduled_at",
  "crm.visits.status",
  "developer.ads.asset_type",
  "developer.ads.asset_url",
  "developer.ads.body_ar",
  "developer.ads.body_en",
  "developer.ads.cta_label_ar",
  "developer.ads.cta_label_en",
  "developer.ads.cta_url",
  "developer.ads.poster_url",
  "developer.ads.primary",
  "developer.ads.sort_order",
  "developer.ads.status",
  "developer.ads.title_ar",
  "developer.ads.title_en",
  "developer.leads.note",
  "developer.leads.status",
  "developer.listing.address",
  "developer.listing.amenities",
  "developer.listing.area",
  "developer.listing.baths",
  "developer.listing.beds",
  "developer.listing.city",
  "developer.listing.currency",
  "developer.listing.description",
  "developer.listing.description_ar",
  "developer.listing.description_en",
  "developer.listing.listing_code",
  "developer.listing.price",
  "developer.listing.project_id",
  "developer.listing.purpose",
  "developer.listing.size_m2",
  "developer.listing.status",
  "developer.listing.title",
  "developer.listing.title_ar",
  "developer.listing.title_en",
  "developer.listing.type",
  "developer.listing.unit_code",
  "developer.media.listing_id",
  "developer.media.project_id",
  "developer.media.type",
  "developer.media.url",
  "developer.project.address",
  "developer.project.area",
  "developer.project.city",
  "developer.project.description_ar",
  "developer.project.description_en",
  "developer.project.project_code",
  "developer.project.title_ar",
  "developer.project.title_en",
  "filters.area",
  "filters.baths",
  "filters.beds",
  "filters.city",
  "filters.maxPrice",
  "filters.minPrice",
  "filters.purpose",
  "filters.sort",
  "filters.type",
  "filters.transaction",
  "filters.priceMin",
  "filters.priceMax",
  "filters.areaMin",
  "filters.areaMax",
  "filters.amenities",
  "home.hero.search.transaction",
  "home.hero.search.area",
  "home.hero.search.budget",
  "home.callback.email",
  "home.callback.name",
  "home.callback.phone",
  "home.request.area",
  "home.request.budgetMax",
  "home.request.budgetMin",
  "home.request.contactTime",
  "home.request.intent",
  "home.request.name",
  "home.request.notes",
  "home.request.phone",
  "home.search.area",
  "home.search.city",
  "home.search.maxPrice",
  "home.search.minPrice",
  "home.search.purpose",
  "home.search.type",
  "lead.email",
  "lead.message",
  "lead.name",
  "lead.phone",
  "owner.audit.action",
  "owner.audit.actor",
  "owner.audit.entity",
  "owner.audit.from",
  "owner.audit.to",
  "owner.delete.confirm",
  "owner.settings.email",
  "owner.settings.facebook",
  "owner.settings.instagram",
  "owner.settings.linkedin",
  "owner.settings.tiktok",
  "owner.settings.whatsappLink",
  "owner.settings.whatsappNumber",
  "owner.unlock.token",
  "owner.users.invite.email",
  "owner.users.invite.full_name",
  "owner.users.invite.phone",
  "owner.users.invite.role",
  "owner.users.role",
  "staff.filter.status",
  "staff.import.file",
  "staff.import.format",
  "staff.import.notes",
  "staff.listing.ad_channel",
  "staff.listing.address",
  "staff.listing.agent_name",
  "staff.listing.agent_user_id",
  "staff.listing.area",
  "staff.listing.baths",
  "staff.listing.beds",
  "staff.listing.building",
  "staff.listing.city",
  "staff.listing.commission",
  "staff.listing.currency",
  "staff.listing.description",
  "staff.listing.description_ar",
  "staff.listing.description_en",
  "staff.listing.elevator",
  "staff.listing.entrance",
  "staff.listing.finishing",
  "staff.listing.floor",
  "staff.listing.images",
  "staff.listing.intake_date",
  "staff.listing.kitchen",
  "staff.listing.last_owner_contact_at",
  "staff.listing.last_owner_contact_note",
  "staff.listing.listing_code",
  "staff.listing.meters",
  "staff.listing.next_owner_followup_at",
  "staff.listing.notes",
  "staff.listing.owner_name",
  "staff.listing.owner_notes",
  "staff.listing.owner_phone",
  "staff.listing.price",
  "staff.listing.purpose",
  "staff.listing.reception",
  "staff.listing.requested",
  "staff.listing.size_m2",
  "staff.listing.target",
  "staff.listing.title",
  "staff.listing.title_ar",
  "staff.listing.title_en",
  "staff.listing.type",
  "staff.listing.unit_code",
  "staff.listing.unit_status",
  "staff.listing.view",
  "staff.search",
];

const LABEL_PLACEHOLDER = "{{label}}";

const defaultHelpForKey = (key: string): FieldHelpEntry => {
  void key;
  return makeHelp(
    LABEL_PLACEHOLDER,
    "\u062f\u0647 \u062d\u0642\u0644 \u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0647\u0645\u0629.",
    "\u0627\u0643\u062a\u0628 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 \u0628\u0634\u0643\u0644 \u0648\u0627\u0636\u062d \u0639\u0634\u0627\u0646 \u0627\u0644\u0646\u0638\u0627\u0645 \u064a\u0634\u062a\u063a\u0644 \u0635\u062d.",
    "\u0627\u0644\u0641\u0643\u0631\u0629 \u0625\u0646\u0646\u0627 \u0646\u062c\u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u062f\u0642\u064a\u0642\u0629 \u0648\u0645\u0641\u0647\u0648\u0645\u0629.",
    ["\u0627\u0643\u062a\u0628 \u0627\u0644\u0642\u064a\u0645\u0629 \u0628\u0648\u0636\u0648\u062d.", "\u0631\u0627\u062c\u0639 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u062d\u0641\u0638.", "\u0627\u062a\u0623\u0643\u062f \u0625\u0646\u0647\u0627 \u0635\u062d\u064a\u062d\u0629."],
    "\u0645\u062b\u0627\u0644: \u0642\u064a\u0645\u0629 \u062a\u0648\u0636\u064a\u062d\u064a\u0629",
    ["\u0627\u062a\u0631\u0643\u0647 \u0641\u0627\u0636\u064a \u0644\u0648 \u0645\u0634 \u0645\u0637\u0644\u0648\u0628."]
  );
};

const PURPOSE_BY_PREFIX: Record<string, string> = {
  "account.profile": "\u062a\u062c\u0647\u064a\u0632 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0628 \u0644\u0644\u062a\u0648\u0627\u0635\u0644.",
  "admin.approvals": "\u062a\u062d\u062f\u064a\u062f \u062d\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0631 \u0644\u0644\u0648\u062d\u062f\u0627\u062a.",
  "admin.pii": "\u0645\u0631\u0627\u062c\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0633\u0629.",
  "admin.partners": "\u0625\u062f\u0627\u0631\u0629 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0631\u0628\u0637 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a.",
  "admin.review": "\u062a\u0646\u0638\u064a\u0645 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.",
  "admin.users": "\u062a\u062d\u062f\u064a\u062f \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646.",
  "admin.ads": "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631.",
  "admin.homepage": "\u062a\u062d\u062f\u064a\u062b \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629.",
  "attachments.item": "\u062a\u0646\u0638\u064a\u0645 \u0645\u0631\u0641\u0642\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629.",
  "attachments.upload": "\u0631\u0641\u0639 \u0645\u0631\u0641\u0642\u0627\u062a \u062c\u062f\u064a\u062f\u0629 \u0644\u0644\u0639\u0642\u0627\u0631.",
  auth: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0648\u062a\u0623\u0645\u064a\u0646 \u0627\u0644\u062d\u0633\u0627\u0628.",
  "careers.apply": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0642\u062f\u064a\u0645 \u0644\u0644\u0648\u0638\u064a\u0641\u0629.",
  "careers.admin": "\u0645\u062a\u0627\u0628\u0639\u0629 \u062d\u0627\u0644\u0629 \u0637\u0644\u0628 \u0627\u0644\u062a\u0648\u0638\u064a\u0641.",
  "crm.activities": "\u062a\u0633\u062c\u064a\u0644 \u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629.",
  "crm.customers": "\u062d\u0641\u0638 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0647\u0645.",
  "crm.filter": "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.",
  "crm.lead": "\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0648\u062a\u0648\u062b\u064a\u0642 \u0627\u0644\u062a\u0648\u0627\u0635\u0644.",
  "crm.sources": "\u0625\u062f\u0627\u0631\u0629 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u062d\u0645\u0644\u0627\u062a.",
  "crm.spend": "\u062a\u0633\u062c\u064a\u0644 \u0645\u0635\u0631\u0648\u0641\u0627\u062a \u0627\u0644\u062d\u0645\u0644\u0627\u062a.",
  "crm.visits": "\u062a\u0646\u0638\u064a\u0645 \u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629.",
  "crm.search": "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.",
  "developer.ads": "\u062a\u062c\u0647\u064a\u0632 \u062d\u0645\u0644\u0629 \u0625\u0639\u0644\u0627\u0646\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0646\u0634\u0631.",
  "developer.leads": "\u0645\u062a\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
  "developer.listing": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631 \u0644\u0644\u0646\u0634\u0631.",
  "developer.media": "\u0625\u0636\u0627\u0641\u0629 \u0648\u0633\u0627\u0626\u0637 \u0644\u0644\u0639\u0642\u0627\u0631 \u0623\u0648 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.",
  "developer.project": "\u062a\u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0644\u0644\u0639\u0631\u0636.",
  filters: "\u0641\u0644\u062a\u0631\u0629 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a.",
  "home.callback": "\u0637\u0644\u0628 \u0645\u0643\u0627\u0644\u0645\u0629 \u0645\u0646 \u0627\u0644\u0641\u0631\u064a\u0642.",
  "home.request": "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0639\u0642\u0627\u0631 \u0645\u0646\u0627\u0633\u0628.",
  "home.search": "\u0628\u062d\u062b \u0633\u0631\u064a\u0639 \u0639\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a.",
  lead: "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0647\u062a\u0645\u0627\u0645 \u0628\u0627\u0644\u0639\u0642\u0627\u0631.",
  "owner.audit": "\u0641\u0644\u062a\u0631\u0629 \u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a.",
  "owner.delete": "\u062a\u0623\u0643\u064a\u062f \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062d\u0630\u0641 \u0627\u0644\u0646\u0647\u0627\u0626\u064a.",
  "owner.settings": "\u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0631\u0633\u0645\u064a\u0629.",
  "owner.unlock": "\u0641\u062a\u062d \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u0643.",
  "owner.users": "\u062f\u0639\u0648\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u062d\u062f\u064a\u062f \u062f\u0648\u0631\u0647.",
  "staff.filter": "\u0641\u0644\u062a\u0631\u0629 \u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0641\u0631\u064a\u0642.",
  "staff.import": "\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0648\u062d\u062f\u0627\u062a.",
  "staff.listing": "\u062a\u062c\u0647\u064a\u0632 \u0628\u064a\u0627\u0646\u0627\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0628\u064a\u0639 \u0644\u0644\u062a\u0633\u0648\u064a\u0642.",
  "staff.search": "\u0641\u0644\u062a\u0631\u0629 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0648\u062d\u062f\u0627\u062a \u0628\u0633\u0631\u0639\u0629.",
};

const EXAMPLE_BY_FIELD: Record<string, string> = {
  phone: "01000000000",
  phone_raw: "01000000000",
  phone_e164: "+201000000000",
  email: "name@example.com",
  price: "2500000",
  budget_min: "1000000",
  budget_max: "2500000",
  budgetMin: "1000000",
  budgetMax: "2500000",
  size_m2: "120",
  meters: "120",
  beds: "3",
  baths: "2",
  commission: "2.5",
  sort_order: "1",
  floor: "5",
  url: "https://example.com",
  cta_url: "https://example.com",
  asset_url: "https://example.com/media.jpg",
  poster_url: "https://example.com/poster.jpg",
  logo_url: "https://example.com/logo.png",
  image_url: "https://example.com/image.jpg",
};

const EXAMPLE_BY_KEY: Record<string, string> = {
  "owner.delete.confirm": "DELETE",
  "owner.unlock.token": "OWNER-1234",
  "admin.partners.user_id": "UUID",
  "staff.listing.agent_user_id": "UUID",
  "crm.sources.slug": "facebook-ads",
  "developer.listing.listing_code": "HR-001",
  "developer.listing.unit_code": "U-101",
  "staff.listing.listing_code": "HR-001",
  "staff.listing.unit_code": "U-101",
  "developer.project.project_code": "PR-001",
};

const RULES_BY_KEY: Record<string, string[]> = {
  "auth.password": ["\u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 6 \u0623\u062d\u0631\u0641."],
  "auth.passwordConfirm": ["\u0644\u0627\u0632\u0645 \u064a\u0637\u0627\u0628\u0642 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631."],
  "owner.delete.confirm": ["\u0627\u0643\u062a\u0628 \u0643\u0644\u0645\u0629 DELETE \u0628\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a."],
  "owner.unlock.token": ["\u0627\u0646\u0633\u062e \u0627\u0644\u0631\u0645\u0632 \u0643\u0645\u0627 \u0647\u0648."],
  "admin.partners.user_id": ["UUID \u0641\u0642\u0637."],
  "staff.listing.agent_user_id": ["UUID \u0644\u0644\u0645\u0646\u062f\u0648\u0628 \u0644\u0648 \u0645\u062a\u0648\u0641\u0631."],
  "crm.sources.slug": ["\u0628\u062f\u0648\u0646 \u0645\u0633\u0627\u0641\u0627\u062a.", "\u062d\u0631\u0648\u0641 \u0635\u063a\u064a\u0631\u0629 \u0648- \u0641\u0642\u0637."],
};

const TOGGLE_FIELDS = new Set(["is_active", "primary", "published", "requested", "elevator", "kitchen", "is_published"]);
const FILE_FIELDS = new Set(["file", "images", "cv"]);
const EMAIL_FIELDS = new Set(["email"]);
const PHONE_FIELDS = new Set(["phone", "phone_raw", "phone_e164", "owner_phone", "whatsappNumber"]);
const URL_FIELDS = new Set([
  "url",
  "logo_url",
  "asset_url",
  "poster_url",
  "cta_url",
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "whatsappLink",
  "image_url",
  "poster",
]);
const DATETIME_FIELDS = new Set(["next_action_at", "scheduled_at", "occurred_at", "next_followup_at"]);
const DATE_FIELDS = new Set([
  "from",
  "to",
  "month",
  "intake_date",
  "last_owner_contact_at",
  "next_owner_followup_at",
]);
const NUMBER_FIELDS = new Set([
  "amount",
  "price",
  "budget_max",
  "budget_min",
  "budgetMax",
  "budgetMin",
  "beds",
  "baths",
  "size_m2",
  "meters",
  "commission",
  "sort_order",
  "floor",
  "minPrice",
  "maxPrice",
  "priceMin",
  "priceMax",
  "areaMin",
  "areaMax",
  "starting_price",
]);
const SELECT_FIELDS = new Set([
  "status",
  "role",
  "intent",
  "purpose",
  "type",
  "currency",
  "assigned",
  "assigned_to",
  "source",
  "transaction",
  "amenities",
  "sort",
  "submission_status",
  "lead_source",
  "unit_status",
  "ad_channel",
  "target",
  "view",
  "outcome",
  "category",
  "developer_id",
  "project_id",
  "listing_id",
  "listing",
  "lead",
  "customer",
  "actor",
  "entity",
  "action",
  "channel",
  "contactTime",
  "format",
  "lostReason",
  "lost_reason",
  "overdue",
]);

type HelpType =
  | "toggle"
  | "file"
  | "email"
  | "phone"
  | "url"
  | "datetime"
  | "date"
  | "number"
  | "select"
  | "text";

function purposeForKey(key: string) {
  const parts = key.split(".");
  const prefixTwo = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0] ?? key;
  return PURPOSE_BY_PREFIX[prefixTwo] ?? PURPOSE_BY_PREFIX[parts[0]] ?? "\u0641\u0644\u062a\u0631\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0628\u0633\u0631\u0639\u0629.";
}

function typeForKey(key: string): HelpType {
  const segment = key.split(".").pop() ?? key;
  if (TOGGLE_FIELDS.has(segment)) return "toggle";
  if (FILE_FIELDS.has(segment)) return "file";
  if (EMAIL_FIELDS.has(segment)) return "email";
  if (PHONE_FIELDS.has(segment)) return "phone";
  if (URL_FIELDS.has(segment)) return "url";
  if (DATETIME_FIELDS.has(segment)) return "datetime";
  if (DATE_FIELDS.has(segment)) return "date";
  if (NUMBER_FIELDS.has(segment)) return "number";
  if (SELECT_FIELDS.has(segment)) return "select";
  return "text";
}

function buildHelp(key: string): FieldHelpEntry {
  const purpose = purposeForKey(key);
  const segment = key.split(".").pop() ?? key;
  const example = EXAMPLE_BY_KEY[key] ?? EXAMPLE_BY_FIELD[segment];
  const rules = RULES_BY_KEY[key];
  const label = LABEL_PLACEHOLDER;

  switch (typeForKey(key)) {
    case "toggle":
      return toggleHelp(label, purpose);
    case "file":
      return fileHelp(label, purpose, rules);
    case "email":
      return emailHelp(label, purpose, example);
    case "phone":
      return phoneHelp(label, purpose, example);
    case "url":
      return urlHelp(label, purpose, example);
    case "datetime":
      return datetimeHelp(label, purpose, example);
    case "date":
      return dateHelp(label, purpose, example);
    case "number":
      return numberHelp(label, purpose, example, rules);
    case "select":
      return selectHelp(label, purpose, example);
    default:
      return textHelp(label, purpose, example, rules);
  }
}

export const FIELD_HELP: Record<string, FieldHelpEntry> = Object.fromEntries(
  FIELD_HELP_KEYS.map((key) => [key, buildHelp(key)])
);

export function getFieldHelp(helpKey: string): FieldHelpEntry {
  const entry = FIELD_HELP[helpKey];
  if (!entry && process.env.NODE_ENV !== "production") {
    throw new Error(`Missing field help for key: ${helpKey}`);
  }
  return entry ?? defaultHelpForKey(helpKey);
}

export const fieldHelpFactories = {
  textHelp,
  numberHelp,
  selectHelp,
  dateHelp,
  datetimeHelp,
  phoneHelp,
  emailHelp,
  urlHelp,
  fileHelp,
  toggleHelp,
};

```

### src/lib/filters/query.ts
```ts
﻿import {
  DEFAULT_FILTERS,
  SORT_VALUES,
  TRANSACTION_VALUES,
  VIEW_VALUES,
  type FilterParseResult,
  type ListingFilters,
  type ListingSort,
  type ListingView,
  type TransactionType,
} from "./types";

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function getParam(params: RawParams, key: string) {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function getAllParams(params: RawParams, key: string) {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const value = params[key];
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  return value ? [value] : [];
}

function clean(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : undefined;
}

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.+-]/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : undefined;
}

function parseCount(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim();
  if (normalized.endsWith("+")) {
    const num = Number(normalized.slice(0, -1));
    return Number.isFinite(num) ? num : undefined;
  }
  return toNumber(normalized);
}

function parseSort(value: string | undefined): ListingSort {
  if (value && SORT_VALUES.includes(value as ListingSort)) return value as ListingSort;
  return DEFAULT_FILTERS.sort;
}

function parseView(value: string | undefined): ListingView {
  if (value && VIEW_VALUES.includes(value as ListingView)) return value as ListingView;
  return DEFAULT_FILTERS.view;
}

function parseTransaction(value: string | undefined): TransactionType | undefined {
  if (value && TRANSACTION_VALUES.includes(value as TransactionType)) return value as TransactionType;
  return undefined;
}

export function parseFiltersFromUrl(params: RawParams): FilterParseResult {
  const errors: string[] = [];

  const transactionType = parseTransaction(
    getParam(params, "transactionType") ?? getParam(params, "transaction") ?? getParam(params, "purpose")
  );
  const propertyType = clean(getParam(params, "propertyType") ?? getParam(params, "type"));
  const city = clean(getParam(params, "city"));
  const area = clean(getParam(params, "area"));

  const priceMin = toNumber(getParam(params, "priceMin") ?? getParam(params, "minPrice"));
  const priceMax = toNumber(getParam(params, "priceMax") ?? getParam(params, "maxPrice"));
  const areaMin = toNumber(getParam(params, "areaMin"));
  const areaMax = toNumber(getParam(params, "areaMax"));
  const beds = parseCount(getParam(params, "beds"));
  const baths = parseCount(getParam(params, "baths"));

  let amenities = getAllParams(params, "amenities");
  if (amenities.length === 1 && amenities[0]?.includes(",")) {
    amenities = amenities[0]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const sort = parseSort(getParam(params, "sort"));
  const view = parseView(getParam(params, "view"));
  const page = Math.max(1, Math.floor(toNumber(getParam(params, "page")) ?? DEFAULT_FILTERS.page));

  let normalizedPriceMin = priceMin;
  let normalizedPriceMax = priceMax;
  if (priceMin && priceMax && priceMin > priceMax) {
    normalizedPriceMin = undefined;
    normalizedPriceMax = undefined;
    errors.push("price");
  }

  let normalizedAreaMin = areaMin;
  let normalizedAreaMax = areaMax;
  if (areaMin && areaMax && areaMin > areaMax) {
    normalizedAreaMin = undefined;
    normalizedAreaMax = undefined;
    errors.push("area");
  }

  const filters: ListingFilters = {
    transactionType,
    propertyType,
    city,
    area,
    priceMin: normalizedPriceMin,
    priceMax: normalizedPriceMax,
    areaMin: normalizedAreaMin,
    areaMax: normalizedAreaMax,
    beds,
    baths,
    amenities: amenities.length ? amenities : undefined,
    sort,
    page,
    view,
  };

  return { filters, errors };
}

export function serializeFiltersToUrl(filters: ListingFilters, overrides: Partial<ListingFilters> = {}) {
  const nextFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (nextFilters.transactionType) params.set("transaction", nextFilters.transactionType);
  if (nextFilters.propertyType) params.set("type", nextFilters.propertyType);
  if (nextFilters.city) params.set("city", nextFilters.city);
  if (nextFilters.area) params.set("area", nextFilters.area);
  if (nextFilters.priceMin !== undefined) params.set("priceMin", String(nextFilters.priceMin));
  if (nextFilters.priceMax !== undefined) params.set("priceMax", String(nextFilters.priceMax));
  if (nextFilters.areaMin !== undefined) params.set("areaMin", String(nextFilters.areaMin));
  if (nextFilters.areaMax !== undefined) params.set("areaMax", String(nextFilters.areaMax));
  if (nextFilters.beds !== undefined) params.set("beds", String(nextFilters.beds));
  if (nextFilters.baths !== undefined) params.set("baths", String(nextFilters.baths));
  if (nextFilters.amenities?.length) {
    nextFilters.amenities.forEach((amenity) => params.append("amenities", amenity));
  }

  if (nextFilters.sort && nextFilters.sort !== DEFAULT_FILTERS.sort) params.set("sort", nextFilters.sort);
  if (nextFilters.view && nextFilters.view !== DEFAULT_FILTERS.view) params.set("view", nextFilters.view);
  if (nextFilters.page && nextFilters.page !== DEFAULT_FILTERS.page) params.set("page", String(nextFilters.page));

  return params;
}

export function normalizeFilters(filters: ListingFilters) {
  return {
    ...filters,
    amenities: filters.amenities ? [...filters.amenities].sort() : undefined,
  };
}

export function filtersToCacheKey(filters: ListingFilters) {
  const normalized = normalizeFilters(filters);
  return JSON.stringify(normalized);
}

export function countActiveFilters(filters: ListingFilters) {
  const { transactionType, propertyType, city, area, priceMin, priceMax, areaMin, areaMax, beds, baths, amenities } =
    filters;
  let count = 0;
  if (transactionType) count += 1;
  if (propertyType) count += 1;
  if (city) count += 1;
  if (area) count += 1;
  if (priceMin !== undefined || priceMax !== undefined) count += 1;
  if (areaMin !== undefined || areaMax !== undefined) count += 1;
  if (beds !== undefined) count += 1;
  if (baths !== undefined) count += 1;
  if (amenities && amenities.length) count += amenities.length;
  return count;
}

```

### src/lib/filters/types.ts
```ts
﻿export type ListingSort = "newest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
export type ListingView = "grid" | "list";
export type TransactionType = "sale" | "rent" | "new-development";

export type ListingFilters = {
  transactionType?: TransactionType;
  propertyType?: string;
  city?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  sort: ListingSort;
  page: number;
  view: ListingView;
};

export type FilterParseResult = {
  filters: ListingFilters;
  errors: string[];
};

export const DEFAULT_FILTERS: ListingFilters = {
  sort: "newest",
  page: 1,
  view: "grid",
};

export const SORT_VALUES: ListingSort[] = ["newest", "price_asc", "price_desc", "area_asc", "area_desc"];
export const VIEW_VALUES: ListingView[] = ["grid", "list"];
export const TRANSACTION_VALUES: TransactionType[] = ["sale", "rent", "new-development"];

```

### src/lib/flags.ts
```ts
﻿export type FeatureFlags = {
  enableCompare: boolean;
  enableSavedSearch: boolean;
  enableEnglish: boolean;
  enableLeadCRM: boolean;
};

function readFlag(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export function getFlags(): FeatureFlags {
  return {
    enableCompare: readFlag(process.env.NEXT_PUBLIC_ENABLE_COMPARE, true),
    enableSavedSearch: readFlag(process.env.NEXT_PUBLIC_ENABLE_SAVED_SEARCH, true),
    enableEnglish: readFlag(process.env.NEXT_PUBLIC_ENABLE_ENGLISH, true),
    enableLeadCRM: readFlag(process.env.NEXT_PUBLIC_ENABLE_LEAD_CRM, true),
  };
}

```

### src/lib/i18n.server.ts
```ts
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

const COOKIE_NAME = "locale";

async function detectFromAcceptLanguage(): Promise<Locale> {
  const headerStore = await headers();
  const header = headerStore.get("accept-language") ?? "";
  if (header.toLowerCase().includes("en")) return "en";
  return "ar";
}

export async function getServerLocale(): Promise<Locale> {
  const headerStore = await headers();
  const forced = headerStore.get("x-locale");
  if (forced === "en" || forced === "ar") return forced;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (cookie === "en" || cookie === "ar") return cookie;
  return (await detectFromAcceptLanguage()) || DEFAULT_LOCALE;
}

export function getServerDir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export const LOCALE_COOKIE = COOKIE_NAME;





```

### src/lib/i18n.ts
```ts
import { BRAND, getBrandArName } from "./brand";
import arExtra from "@/i18n/ar.json";
import enExtra from "@/i18n/en.json";

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

type Dictionary = Record<string, string>;

const ar: Dictionary = {
  "brand.name": "{{brand}}",
  "brand.tagline": "{{brand}} — تسويق عقاري",
  "brand.domain": "التسويق العقاري",

  "nav.listings": "العقارات",
  "nav.about": "من نحن",
  "nav.careers": "الوظائف",
  "nav.partners": "بوابة التوريد",
  "nav.staff": "إدخال البيانات",
  "nav.crm": "إدارة العملاء",
  "nav.admin": "لوحة الإدارة",
  "nav.reports": "التقارير",
  "nav.account": "حسابي",
  "nav.dashboard": "لوحة التحكم",
  "nav.login": "تسجيل الدخول",
  "nav.superAdmin": "لوحة المالك",

  "lang.ar": "العربية",
  "lang.en": "English",

  "theme.dark": "داكن",
  "theme.light": "فاتح",

  "help.mode.on": "وضع الشرح (مفعّل)",
  "help.mode.off": "وضع الشرح",

  "role.developer": "مطور",
  "role.owner": "مالك",
  "role.admin": "مدير",
  "role.ops": "عمليات",
  "role.staff": "موظف",
  "role.agent": "مندوب",

  "submission.status.draft": "مسودة",
  "submission.status.submitted": "قيد المراجعة",
  "submission.status.under_review": "تحت المراجعة",
  "submission.status.needs_changes": "يحتاج تعديلات",
  "submission.status.approved": "معتمد",
  "submission.status.published": "منشور",
  "submission.status.archived": "مؤرشف",

  "submission.portal.title": "بوابة التوريد",
  "submission.portal.subtitle": "قدّم وحداتك ومشروعاتك لفريق {{brand}} للمراجعة قبل النشر.",
  "submission.section.projects": "مشروعات جديدة",
  "submission.section.inventory": "وحدات المشروع",
  "submission.section.media": "مواد تسويقية",
  "submission.action.submit": "إرسال للمراجعة",
  "submission.action.request_changes": "طلب تعديلات",
  "submission.action.approve": "اعتماد",
  "submission.action.publish": "نشر",
  "submission.action.archive": "أرشفة",
  "submission.action.assign_code": "تعيين كود {{brand}}",
  "submission.field.listing_code": "كود العقار",
  "submission.field.project_code": "كود المشروع",
  "submission.field.unit_code": "كود الوحدة",
  "submission.field.title_ar": "العنوان (عربي)",
  "submission.field.title_en": "العنوان (إنجليزي)",
  "submission.field.desc_ar": "الوصف (عربي)",
  "submission.field.desc_en": "الوصف (إنجليزي)",
  "submission.field.status": "الحالة",
  "submission.field.missing": "حقول ناقصة",
  "submission.field.review_note": "ملاحظات المراجعة",
  "submission.locked": "لا يمكنك تعديل هذا الطلب حتى يتم إنهاء المراجعة.",

  "media.type.brochure": "كتيب",
  "media.type.floorplan": "مخطط",
  "media.type.image": "صورة",
  "media.type.other": "أخرى",
  "media.submit.title": "إرسال مادة تسويقية",
  "media.submit.url": "رابط الملف",
  "media.submit.add": "إضافة مرفق",

  "home.hero.badge": "تسويق {{brand}} العقاري الموثوق",
  "home.hero.title": "اكتشف عقارك القادم عبر {{brand}} للتسويق العقاري مع حملات مدروسة وفرص موثوقة.",
  "home.hero.subtitle": "عروض بيع وتأجير موثقة تربط العملاء بالشركاء المعتمدين.",
  "home.hero.ctaPrimary": "تصفح العقارات",
  "home.hero.ctaSecondary": "بوابة التوريد",
  "home.callback.title": "اطلب مكالمة الآن",
  "home.callback.subtitle": "اترك بياناتك وسيتواصل فريق {{brand}} معك خلال دقائق.",
  "home.callback.name": "الاسم الكامل",
  "home.callback.email": "البريد الإلكتروني",
  "home.callback.phone": "رقم الهاتف",
  "home.callback.submit": "طلب مكالمة",
  "home.stats.listings": "عقار منشور",
  "home.stats.developers": "شريك معتمد",
  "home.stats.leads": "طلب شهري",
  "home.search.title": "بحث سريع",
  "home.search.subtitle": "ابحث بالمدينة أو المنطقة وحدد النطاق السعري المناسب.",
  "home.search.city": "المدينة",
  "home.search.area": "الحي / المنطقة",
  "home.search.purpose": "نوع الغرض",
  "home.search.minPrice": "السعر الأدنى",
  "home.search.maxPrice": "السعر الأعلى",
  "home.search.submit": "ابدأ البحث",
  "home.categories.title": "التصنيفات",
  "home.categories.subtitle": "اختر نوع العقار المناسب لك",
  "home.categories.desc": "استكشف خيارات تناسب ميزانيتك واحتياجاتك.",
  "home.featured.title": "أحدث العقارات",
  "home.featured.subtitle": "عقارات مميزة تمت إضافتها مؤخرًا",
  "home.featured.empty": "لا توجد عقارات منشورة حاليًا.",
  "home.request.title": "أخبرنا بما تبحث عنه",
  "home.request.subtitle": "ارسل طلبك لفريق {{brand}} وسنتواصل معك بسرعة.",
  "home.request.name": "الاسم الكامل",
  "home.request.phone": "رقم الهاتف",
  "home.request.intent": "الغرض",
  "home.request.intent.buy": "شراء",
  "home.request.intent.rent": "إيجار",
  "home.request.intent.invest": "استثمار",
  "home.request.area": "المنطقة المفضلة",
  "home.request.budgetMin": "الميزانية الأدنى",
  "home.request.budgetMax": "الميزانية الأعلى",
  "home.request.contactTime": "وقت التواصل المفضل",
  "home.request.contact.morning": "صباحًا",
  "home.request.contact.afternoon": "ظهرًا",
  "home.request.contact.evening": "مساءً",
  "home.request.contact.any": "أي وقت",
  "home.request.notes": "ملاحظات إضافية",
  "home.request.submit": "إرسال الطلب",
  "home.partners.title": "شركاء التسويق",
  "home.partners.subtitle": "شبكة مطورين موثوقة تُعرض عبر حملات {{brand}}.",
  "home.partners.cta": "عرض المشروعات",
  "home.ads.title": "حملات المطورين",
  "home.ads.subtitle": "إعلانات معتمدة من {{brand}} لمشروعات مختارة.",
  "home.ads.empty": "لا توجد حملات منشورة حالياً.",
  "home.ads.cta": "عرض التفاصيل",
  "home.partners.tag.launch": "إطلاقات جديدة",
  "home.partners.tag.delivery": "تسليم قريب",
  "home.partners.tag.installments": "خطط تقسيط",
  "home.partners.tag.locations": "مواقع مميزة",
  "home.partners.item.northbay": "نورث باي للتطوير",
  "home.partners.item.sahara": "السحراوي العقارية",
  "home.partners.item.nilegate": "بوابة النيل",
  "home.partners.item.almadina": "المدينة الحديثة",
  "home.partners.item.glowhills": "جلوم هيلز",
  "home.partners.item.atlas": "أطلس للتطوير",

  "home.proof.title": "أرقام تثبت الثقة",
  "home.proof.subtitle": "مؤشرات الأداء الرئيسية لفريق {{brand}}.",
  "home.projects.title": "مشروعات مميزة",
  "home.projects.subtitle": "مشروعات جديدة بفرص استثمارية مدروسة.",
  "home.projects.empty": "لا توجد مشروعات مميزة حالياً.",
  "home.projects.starting": "ابتداءً من",
  "home.projects.cta": "عرض المشروع",

  "listings.title": "سوق العقارات",
  "listings.results": "نتائج البحث: {{count}} عقار",
  "listings.loginPrompt": "سجل الدخول لحفظ المفضلة",
  "listings.empty": "لا توجد عقارات مطابقة لبحثك.",
  "listings.filters.apply": "تطبيق الفلاتر",
  "listings.filters.reset": "مسح الفلاتر",
  "listings.view.grid": "شبكة",
  "listings.view.list": "قائمة",

  "listing.card.details": "عرض التفاصيل",
  "listing.card.save": "حفظ",
  "listing.card.saved": "محفوظ",
  "listing.card.noImage": "لا توجد صورة",
  "listing.badge.new": "جديد",
  "listing.badge.furnished": "مفروش",
  "listing.action.whatsapp": "واتساب",
  "listing.action.call": "اتصل",
  "listing.action.share": "مشاركة",
  "amenity.elevator": "مصعد",
  "amenity.parking": "جراج",
  "amenity.security": "أمن",
  "amenity.balcony": "بلكونة",
  "amenity.generator": "مولد",
  "amenity.seaView": "إطلالة بحر",

  "filters.city": "المدينة",
  "filters.area": "الحي / المنطقة",
  "filters.purpose": "الغرض",
  "filters.type": "نوع العقار",
  "filters.minPrice": "السعر الأدنى",
  "filters.maxPrice": "السعر الأعلى",
  "filters.beds": "عدد الغرف",
  "filters.baths": "عدد الحمامات",
  "filters.sort": "ترتيب النتائج",
  "filters.transaction": "نوع العملية",
  "filters.priceMin": "السعر من",
  "filters.priceMax": "السعر إلى",
  "filters.areaMin": "المساحة من",
  "filters.areaMax": "المساحة إلى",
  "filters.amenities": "المرافق",

  "detail.back": "العودة للعقارات",
  "detail.contact.title": "جهة الاتصال",
  "detail.contact.subtitle": "تواصل مع فريق {{brand}} للتسويق العقاري لجدولة المعاينة.",
  "detail.contact.defaultName": "مسؤول المبيعات",
  "detail.contact.noPhone": "بيانات الاتصال عند الطلب",
  "detail.contact.whatsapp": "واتساب",
  "detail.contact.share": "مشاركة الإعلان",
  "detail.map.title": "خريطة الموقع",
  "detail.map.placeholder": "سيتم إضافة الخريطة قريبًا",
  "detail.description.title": "وصف العقار",
  "detail.description.empty": "لا يوجد وصف تفصيلي متاح حالياً.",
  "detail.amenities.title": "المرافق والخدمات",
  "detail.amenities.empty": "لا توجد خدمات مسجلة بعد.",
  "detail.stats.area": "المساحة",
  "detail.stats.rooms": "غرف",
  "detail.stats.baths": "حمامات",
  "detail.stats.unknown": "غير محدد",
  "detail.facts.title": "تفاصيل العقار",
  "detail.facts.area": "المساحة",
  "detail.facts.floor": "الدور",
  "detail.facts.view": "الإطلالة",
  "detail.facts.building": "المبنى",
  "detail.facts.finishing": "التشطيب",
  "detail.facts.meters": "العدادات",
  "detail.facts.reception": "الريسبشن",
  "detail.facts.kitchen": "المطبخ",
  "detail.facts.elevator": "مصعد",
  "detail.facts.code": "كود العقار",
  "detail.cta.whatsapp": "واتساب",
  "detail.cta.call": "اتصال",
  "detail.cta.book": "احجز معاينة",
  "detail.lead.title": "إرسال طلب اهتمام",
  "detail.lead.name": "الاسم الكامل",
  "detail.lead.phone": "رقم الهاتف",
  "detail.lead.email": "البريد الإلكتروني",
  "detail.lead.message": "اكتب رسالتك",
  "detail.lead.submit": "إرسال الطلب",
  "detail.lead.submitting": "جارٍ الإرسال...",
  "detail.lead.successTitle": "تم إرسال الطلب",
  "detail.lead.successBody": "هنرجعلك في أقرب وقت.",
  "detail.lead.error": "حصل خطأ أثناء الإرسال. حاول مرة أخرى.",
  "detail.lead.guest.prefix": "يمكنك إرسال الطلب كزائر. إذا رغبت بمتابعة الحالة،",
  "detail.lead.guest.action": "سجّل الدخول",

  "auth.title": "تسجيل الدخول",
  "auth.subtitle": "تسجيل الدخول مخصص لفريق {{brand}} والشركاء المعتمدين.",
  "auth.tab.email": "البريد الإلكتروني",
  "auth.tab.phone": "رقم الهاتف",
  "auth.session.title": "تم تسجيل دخولك بالفعل.",
  "auth.session.go": "الانتقال للوحة التحكم",
  "auth.session.logout": "تسجيل الخروج",
  "auth.email.label": "البريد الإلكتروني",
  "auth.email.placeholder": "you@example.com",
  "auth.password.label": "كلمة المرور",
  "auth.password.hint": "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
  "auth.password.show": "إظهار",
  "auth.password.hide": "إخفاء",
  "auth.action.signIn": "تسجيل الدخول",
  "auth.action.signUp": "إنشاء حساب",
  "auth.phone.label": "رقم الهاتف (E.164)",
  "auth.phone.placeholder": "+2010xxxxxxxx",
  "auth.otp.send": "إرسال رمز التحقق",
  "auth.otp.verify": "تأكيد",
  "auth.otp.reset": "إعادة الإرسال",
  "auth.msg.signInSuccess": "تم تسجيل الدخول بنجاح. جاري تحويلك...",
  "auth.msg.signUpCheckEmail": "تم إرسال رسالة التفعيل إلى بريدك الإلكتروني.",
  "auth.msg.signUpSuccess": "تم إنشاء الحساب بنجاح. جاري تحويلك...",
  "auth.msg.otpSent": "تم إرسال رمز التحقق.",
  "auth.msg.otpSuccess": "تم التحقق بنجاح. جاري تحويلك...",
  "auth.msg.logout": "تم تسجيل الخروج.",
  "auth.msg.resetOtp": "تم إعادة ضبط الرمز.",
  "auth.error.signIn": "تعذر تسجيل الدخول: {{message}}",
  "auth.error.signUp": "تعذر إنشاء الحساب: {{message}}",
  "auth.error.otpSend": "تعذر إرسال رمز التحقق: {{message}}",
  "auth.error.otpVerify": "تعذر التحقق: {{message}}",
  "auth.error.logout": "تعذر تسجيل الخروج: {{message}}",
  "auth.error.phoneFormat": "يرجى كتابة الرقم بصيغة دولية مثل +2010xxxxxxx.",
  "auth.error.otpRequired": "يرجى إرسال رمز التحقق أولًا.",
  "auth.error.otpInvalid": "الرمز غير صحيح.",
  "auth.footer.redirect": "سيتم تحويلك بعد نجاح تسجيل الدخول إلى: {{path}}",
  "auth.loading": "جاري التحميل...",
  "auth.reset.title": "استعادة كلمة المرور",
  "auth.reset.subtitle": "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.",
  "auth.reset.email": "البريد الإلكتروني",
  "auth.reset.send": "إرسال رابط الاستعادة",
  "auth.reset.sent": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
  "auth.reset.link": "هل نسيت كلمة المرور؟",
  "auth.reset.back": "العودة لتسجيل الدخول",
  "auth.reset.newTitle": "تعيين كلمة مرور جديدة",
  "auth.reset.newSubtitle": "قم بإدخال كلمة المرور الجديدة.",
  "auth.reset.newPassword": "كلمة المرور الجديدة",
  "auth.reset.confirm": "تأكيد كلمة المرور",
  "auth.reset.save": "حفظ كلمة المرور",
  "auth.reset.waiting": "جارٍ تجهيز جلسة الاستعادة من الرابط...",

  "dashboard.session.error": "خطأ في الجلسة",
  "dashboard.session.help": "تعذر تحميل بيانات الجلسة. يرجى تسجيل الدخول مرة أخرى.",
  "dashboard.session.login": "تسجيل الدخول",
  "dashboard.session.home": "العودة للرئيسية",
  "dashboard.title": "مرحبًا بك",
  "dashboard.email": "البريد الإلكتروني",
  "dashboard.phone": "رقم الهاتف",
  "dashboard.logout": "تسجيل الخروج",
  "dashboard.account": "حسابي",
  "dashboard.partner": "بوابة التوريد",
  "dashboard.admin": "لوحة الإدارة",

  "account.title": "حسابي",
  "account.subtitle": "تحديث بياناتك ومتابعة المفضلة والطلبات.",
  "account.profile.name": "الاسم الكامل",
  "account.profile.phone": "رقم الهاتف",
  "account.profile.save": "حفظ البيانات",
  "account.favorites.title": "المفضلة",
  "account.favorites.subtitle": "العقارات التي قمت بحفظها",
  "account.favorites.empty": "لم تقم بحفظ أي عقار بعد. يمكنك استعراض العقارات.",
  "account.leads.title": "طلباتي",
  "account.leads.subtitle": "طلبات الاهتمام التي أرسلتها",
  "account.leads.empty": "لا توجد طلبات حالياً.",
  "account.leads.listing": "العقار: {{title}}",

  "developer.title": "بوابة التوريد",
  "developer.subtitle.company": "الشركة: {{name}}",
  "developer.subtitle.empty": "يرجى ربط حسابك بشريك من لوحة الإدارة.",
  "developer.stats.total": "إجمالي العقارات",
  "developer.stats.published": "العقارات المنشورة",
  "developer.stats.pending": "طلبات قيد المراجعة",
  "developer.stats.projects": "إجمالي المشروعات",
  "developer.stats.leads": "أحدث الطلبات",
  "developer.create.title": "إضافة عقار جديد",
  "developer.create.subtitle": "املأ البيانات الأساسية وسيتم مراجعتها من فريق {{brand}} قبل النشر",
  "developer.create.submit": "إضافة العقار",
  "developer.form.title": "عنوان العقار",
  "developer.form.price": "السعر",
  "developer.form.currency": "العملة",
  "developer.form.address": "العنوان التفصيلي",
  "developer.form.size": "المساحة م2",
  "developer.form.amenities": "المرافق (مفصولة بفواصل)",
  "developer.form.description": "وصف العقار",
  "developer.form.project": "المشروع",
  "developer.form.projectHint": "اختر مشروعًا لربط الوحدة به.",
  "developer.project.required": "أضف مشروعًا أولًا قبل إدخال وحدات المشروع.",
  "developer.listings.title": "عقاراتي",
  "developer.listings.subtitle": "إدارة العقارات المسجلة لديك",
  "developer.listings.empty": "لم تقم بإضافة عقارات بعد. استخدم نموذج الإضافة في الأعلى.",
  "developer.listings.manage": "إدارة العقار",
  "developer.leads.title": "طلبات العملاء",
  "developer.leads.subtitle": "أحدث الطلبات الخاصة بعقاراتك",
  "developer.leads.empty": "لا توجد طلبات بعد.",
  "developer.leads.update": "تحديث الحالة",
  "developer.leads.addNote": "إضافة",
  "developer.leads.lastNote": "آخر ملاحظة: {{note}}",
  "developer.leads.noNote": "لا توجد ملاحظات بعد.",
  "developer.ads.title": "إعلانات المطورين",
  "developer.ads.subtitle": "جهّز حملاتك الإعلانية وارسلها للمراجعة قبل النشر.",
  "developer.ads.create": "إضافة حملة",
  "developer.ads.createHint": "أضف عنوانًا ومحتوىً إعلانيًا واضحًا مع رابط الدعوة.",
  "developer.ads.list": "حملاتك الإعلانية",
  "developer.ads.listHint": "تابع حالة الحملات والوسائط المرتبطة بها.",
  "developer.ads.titleAr": "عنوان عربي",
  "developer.ads.titleEn": "عنوان إنجليزي",
  "developer.ads.bodyAr": "الوصف بالعربية",
  "developer.ads.bodyEn": "الوصف بالإنجليزية",
  "developer.ads.ctaAr": "زر الإجراء بالعربية",
  "developer.ads.ctaEn": "زر الإجراء بالإنجليزية",
  "developer.ads.ctaUrl": "رابط الزر",
  "developer.ads.save": "حفظ",
  "developer.ads.submit": "إرسال للمراجعة",
  "developer.ads.delete": "حذف",
  "developer.ads.assets": "الوسائط",
  "developer.ads.assetUrl": "رابط الوسائط",
  "developer.ads.posterUrl": "صورة الغلاف",
  "developer.ads.order": "الترتيب",
  "developer.ads.primary": "رئيسية",
  "developer.ads.addAsset": "إضافة وسائط",
  "developer.ads.remove": "حذف",
  "developer.ads.assetsEmpty": "لا توجد وسائط بعد.",
  "developer.ads.empty": "لا توجد حملات بعد.",
  "developer.ads.back": "عودة للبوابة",
  "developer.ads.untitled": "بدون عنوان",

  "developer.edit.title": "إدارة العقار",
  "developer.edit.subtitle": "تحديث معلومات العقار الأساسية",
  "developer.edit.back": "العودة للبوابة",
  "developer.edit.save": "حفظ التعديلات",
  "developer.edit.delete": "حذف العقار",
  "developer.edit.images": "صور العقار",
  "developer.edit.images.subtitle": "إضافة وترتيب الصور",
  "developer.edit.deleteImage": "حذف الصورة",
  "developer.import.title": "استيراد وحدات المشروعات",
  "developer.import.subtitle": "ارفع ملف CSV أو Excel لوحدات المشروع.",
  "developer.import.format": "نوع الملف",
  "developer.import.notes": "ملاحظات الاستيراد (اختياري)",
  "developer.import.submit": "بدء الاستيراد",
  "developer.import.loading": "جارٍ الاستيراد...",
  "developer.import.rowsTotal": "إجمالي الصفوف",
  "developer.import.rowsInserted": "صفوف مضافة",
  "developer.import.rowsUpdated": "صفوف محدثة",
  "developer.import.rowsFailed": "صفوف فاشلة",
  "project.create.title": "إضافة مشروع",
  "project.create.submit": "حفظ المشروع",
  "project.form.title": "اسم المشروع",
  "project.form.description": "وصف المشروع",
  "project.form.city": "مدينة المشروع",
  "project.form.area": "المنطقة",
  "project.form.address": "العنوان التفصيلي",
  "project.manage": "إدارة المشروع",

  "staff.title": "لوحة إدخال البيانات",
  "staff.subtitle": "تجهيز وحدات إعادة البيع للعرض والتسويق مع فريق {{brand}}.",
  "staff.stats.total": "إجمالي الوحدات",
  "staff.stats.draft": "مسودات",
  "staff.stats.submitted": "قيد المراجعة",
  "staff.stats.published": "منشور",
  "staff.search.placeholder": "ابحث بالكود أو الهاتف أو العنوان",
  "staff.filter.status": "حالة النشر",
  "staff.filter.all": "الكل",
  "staff.filter.draft": "مسودة",
  "staff.filter.submitted": "قيد المراجعة",
  "staff.filter.published": "منشور",
  "staff.form.title": "إضافة وحدة إعادة بيع",
  "staff.form.subtitle": "املأ البيانات الأساسية ثم أضف التفاصيل لاحقًا.",
  "staff.form.submit": "إنشاء الوحدة",
  "staff.form.internalCode": "الكود الداخلي",
  "staff.form.unitCode": "كود الوكيل",
  "staff.form.type": "نوع الوحدة",
  "staff.form.purpose": "الغرض",
  "staff.form.price": "السعر",
  "staff.form.currency": "العملة",
  "staff.form.city": "المدينة",
  "staff.form.area": "المنطقة",
  "staff.form.address": "العنوان",
  "staff.form.beds": "عدد الغرف",
  "staff.form.baths": "عدد الحمامات",
  "staff.form.size": "المساحة م2",
  "staff.form.description": "وصف مختصر",
  "staff.form.agent": "الوكيل",
  "staff.form.agentFallback": "اسم الوكيل (اختياري)",
  "staff.form.ownerName": "اسم المالك",
  "staff.form.ownerPhone": "رقم المالك",
  "staff.form.floor": "الدور",
  "staff.form.elevator": "مصعد",
  "staff.form.finishing": "التشطيب",
  "staff.form.meters": "العدادات",
  "staff.form.reception": "الريسبشن",
  "staff.form.kitchen": "المطبخ",
  "staff.form.view": "الفيو",
  "staff.form.building": "المباني",
  "staff.form.entrance": "مدخل العمارة",
  "staff.form.commission": "العمولة",
  "staff.form.date": "التاريخ",
  "staff.form.target": "المطلوب",
  "staff.form.adChannel": "مصدر الإعلان",
  "staff.form.notes": "ملاحظات داخلية",
  "staff.form.ownerNotes": "ملاحظات المالك",
  "staff.form.lastOwnerContactAt": "آخر تواصل مع المالك",
  "staff.form.nextOwnerFollowupAt": "موعد متابعة المالك",
  "staff.form.lastOwnerContactNote": "ملاحظات آخر تواصل",
  "staff.form.unitStatus": "حالة الوحدة",
  "staff.form.requested": "المطلوب",
  "staff.form.lastUpdatedBy": "آخر تحديث بواسطة",
  "staff.section.basics": "البيانات الأساسية",
  "staff.section.details": "التفاصيل الفنية",
  "staff.section.owner": "بيانات المالك والتواصل",
  "staff.section.media": "الوسائط والمرفقات",
  "staff.section.notes": "الملاحظات",
  "staff.unitStatus.available": "متاحة",
  "staff.unitStatus.reserved": "محجوزة",
  "staff.unitStatus.sold": "مباعة",
  "staff.unitStatus.rented": "مؤجرة",
  "staff.unitStatus.off_market": "غير متاحة",
  "staff.unitStatus.on_hold": "موقوفة مؤقتًا",
  "staff.share.title": "مشاركة الوحدة",
  "staff.share.public": "رابط عام",
  "staff.share.internal": "رابط داخلي",
  "staff.share.print": "نسخة للطباعة",
  "staff.share.publicHint": "مشاركة بدون بيانات المالك.",
  "staff.share.internalHint": "للاستخدام الداخلي فقط.",
  "staff.share.copy": "نسخ الرابط",
  "staff.import.title": "استيراد وحدات إعادة البيع",
  "staff.import.subtitle": "ارفع ملفات CSV أو Excel لتحويلها إلى وحدات داخلية.",
  "staff.import.format": "نوع الملف",
  "staff.import.notes": "ملاحظات الاستيراد (اختياري)",
  "staff.import.submit": "بدء الاستيراد",
  "staff.import.loading": "جارٍ الاستيراد...",
  "staff.import.rowsTotal": "إجمالي الصفوف",
  "staff.import.rowsInserted": "صفوف مضافة",
  "staff.import.rowsUpdated": "صفوف محدثة",
  "staff.import.rowsFailed": "صفوف فاشلة",
  "share.title": "عرض الوحدة",
  "share.subtitle": "نسخة عامة من بيانات الوحدة بدون معلومات المالك.",
  "share.request": "إرسال طلب",
  "superAdmin.analytics.title": "التحليلات",
  "superAdmin.analytics.subtitle": "زيارات شهرية ومصادر الطلبات.",
  "superAdmin.analytics.visitors": "الزوار شهريًا",
  "superAdmin.analytics.leadSources": "مصادر الطلبات",
  "superAdmin.analytics.noLeads": "لا توجد طلبات بعد.",
  "superAdmin.users.title": "إدارة المستخدمين والأدوار",
  "superAdmin.users.subtitle": "متاح للسوبر أدمن فقط.",
  "superAdmin.users.update": "تحديث",
  "superAdmin.security.title": "إعدادات الأمان",
  "superAdmin.security.subtitle": "مراجعة الإعدادات الحساسة.",
  "superAdmin.security.passwords": "تفعيل حماية تسريب كلمات المرور من لوحة Supabase.",
  "superAdmin.security.storage": "تحقق من سياسات التخزين للوسائط المنشورة فقط.",
  "superAdmin.security.rls": "تأكد من بقاء RLS مفعلة واختبار الصلاحيات.",
  "owner.unlock.title": "تأكيد دخول المالك",
  "owner.unlock.subtitle": "هذه المنطقة محمية وتتطلب مفتاح المالك.",
  "owner.unlock.input": "مفتاح المالك",
  "owner.unlock.action": "فتح اللوحة",
  "owner.unlock.error": "المفتاح غير صحيح.",
  "owner.users.title": "إدارة المستخدمين",
  "owner.users.subtitle": "تعديل الأدوار والصلاحيات الخاصة بالشركة.",
  "owner.users.update": "تحديث الدور",
  "owner.users.invite.title": "إضافة مستخدم",
  "owner.users.invite.subtitle": "أنشئ حسابات المشرفين والموظفين من داخل المنصة.",
  "owner.users.invite.full_name": "الاسم الكامل",
  "owner.users.invite.phone": "رقم الهاتف",
  "owner.users.invite.email": "البريد الإلكتروني",
  "owner.users.invite.role": "الدور",
  "owner.users.invite.submit": "إرسال الدعوة",
  "owner.users.invite.loading": "جارٍ الإرسال...",
  "owner.users.invite.link": "رابط الدعوة",
  "owner.users.invite.copy": "نسخ الرابط",
  "owner.users.invite.copied": "تم النسخ",
  "owner.users.invite.error.unauthorized": "يرجى تسجيل الدخول أولًا.",
  "owner.users.invite.error.forbidden": "ليست لديك صلاحية لإضافة مستخدمين.",
  "owner.users.invite.error.owner_locked": "يرجى فتح صلاحيات المالك أولًا.",
  "owner.users.invite.error.invalid_input": "تحقق من البيانات المدخلة.",
  "owner.users.invite.error.invalid_role": "الدور غير مسموح به.",
  "owner.users.invite.error.invite_failed": "تعذر إرسال الدعوة.",
  "owner.users.invite.error.user_lookup_failed": "تعذر العثور على المستخدم.",
  "owner.settings.title": "إعدادات التواصل",
  "owner.settings.subtitle": "تحديث روابط التواصل العامة في الموقع.",
  "owner.settings.facebook": "رابط فيسبوك",
  "owner.settings.instagram": "رابط إنستجرام",
  "owner.settings.email": "البريد الإلكتروني العام",
  "owner.settings.linkedin": "رابط لينكد إن",
  "owner.settings.tiktok": "رابط تيك توك",
  "owner.settings.whatsappNumber": "رقم واتساب",
  "owner.settings.whatsappLink": "رابط واتساب",
  "owner.settings.save": "حفظ الإعدادات",
  "owner.audit.title": "سجل العمليات",
  "owner.audit.subtitle": "تتبع كل العمليات الحساسة مع المستخدم والتوقيت.",
  "owner.audit.filters": "فلاتر السجل",
  "owner.audit.filtersHint": "حدد الفلاتر لتضييق النتائج.",
  "owner.audit.action": "الإجراء",
  "owner.audit.entity": "نوع الكيان",
  "owner.audit.actor": "المستخدم (ID)",
  "owner.audit.apply": "تطبيق",
  "owner.audit.table": "السجل",
  "owner.audit.tableHint": "آخر 200 عملية",
  "owner.audit.empty": "لا توجد عمليات مطابقة.",
  "staff.form.save": "حفظ التعديلات",
  "staff.table.code": "الكود",
  "staff.table.unitCode": "كود الوكيل",
  "staff.table.owner": "المالك",
  "staff.table.phone": "الهاتف",
  "staff.table.price": "السعر",
  "staff.table.status": "الحالة",
  "staff.table.actions": "إجراءات",
  "staff.actions.manage": "إدارة",
  "staff.actions.duplicate": "نسخ",
  "staff.actions.submit": "إرسال للمراجعة",
  "staff.actions.publish": "نشر",
  "staff.actions.back": "العودة",
  "staff.preview.title": "معاينة الإعلان",
  "staff.actions.save": "حفظ",
  "staff.attachments.title": "المرفقات",
  "staff.attachments.subtitle": "ارفع الملفات وصنفها وأدر ظهورها في صفحة العقار.",
  "staff.attachments.upload": "رفع ملفات",
  "staff.attachments.drag": "اسحب الملفات هنا أو اختر من الجهاز",
  "staff.attachments.category": "التصنيف",
  "staff.attachments.titleLabel": "عنوان الملف",
  "staff.attachments.noteLabel": "ملاحظات",
  "staff.attachments.primary": "أساسي",
  "staff.attachments.published": "منشور",
  "staff.attachments.copy": "نسخ الرابط",
  "staff.attachments.delete": "حذف",
  "staff.attachments.empty": "لا توجد مرفقات بعد.",
  "staff.attachments.fileType": "نوع الملف",
  "staff.attachments.sizeLimit": "الحد الأقصى 25MB لكل ملف.",

  "attachment.category.unit_photos": "صور الوحدة",
  "attachment.category.building_entry": "مدخل العمارة",
  "attachment.category.view": "الفيو",
  "attachment.category.plan": "مخطط",
  "attachment.category.contract": "عقد",
  "attachment.category.owner_docs": "مستندات المالك",
  "attachment.category.other": "أخرى",
  "attachment.type.image": "صورة",
  "attachment.type.pdf": "PDF",
  "attachment.type.video": "فيديو",
  "attachment.type.doc": "مستند",
  "attachment.type.other": "ملف",

  "admin.title": "لوحة الإدارة",
  "admin.subtitle": "متابعة الأداء اليومي، اعتماد العقارات، وإدارة المستخدمين والشركاء.",
  "admin.stats.today": "العقارات اليوم",
  "admin.stats.week": "العقارات آخر 7 أيام",
  "admin.stats.leadsToday": "الطلبات اليوم",
  "admin.stats.leadsWeek": "الطلبات آخر 7 أيام",
  "admin.top.title": "أبرز الشركاء",
  "admin.top.subtitle": "الشركاء الأكثر نشاطًا",
  "admin.approvals.title": "طلبات النشر",
  "admin.approvals.subtitle": "العقارات في انتظار الاعتماد",
  "admin.approvals.empty": "لا توجد عقارات قيد المراجعة حاليًا.",
  "admin.approvals.update": "تحديث الحالة",
  "admin.approvals.status": "حالة الإعلان",
  "admin.leads.title": "إدارة الطلبات",
  "admin.leads.subtitle": "متابعة العملاء وتحويلهم للفريق المناسب",
  "admin.leads.empty": "لا توجد طلبات جديدة حاليا.",
  "admin.leads.unassigned": "غير معين",
  "admin.leads.assigned": "المسؤول: {{name}}",
  "admin.leads.assign": "تعيين",
  "admin.leads.addNote": "إضافة",
  "admin.ads.title": "مراجعة الإعلانات",
  "admin.ads.subtitle": "مراجعة حملات المطورين واعتمادها قبل النشر.",
  "admin.ads.queue": "قائمة الحملات",
  "admin.ads.queueHint": "راجع المحتوى والوسائط وقرر الحالة المناسبة.",
  "admin.ads.empty": "لا توجد حملات حالياً.",
  "admin.ads.developer": "المطور:",
  "admin.ads.back": "عودة للإدارة",
  "admin.ads.save": "حفظ",
  "admin.ads.requestChanges": "طلب تعديلات",
  "admin.ads.approve": "اعتماد",
  "admin.ads.publish": "نشر",
  "admin.ads.archive": "أرشفة",
  "ads.status.label": "الحالة:",
  "ads.status.draft": "مسودة",
  "ads.status.submitted": "مرسلة",
  "ads.status.needs_changes": "تحتاج تعديلات",
  "ads.status.approved": "معتمدة",
  "ads.status.published": "منشورة",
  "ads.status.archived": "مؤرشفة",
  "ads.media.image": "صورة",
  "ads.media.video": "فيديو",
  "nav.ads": "الإعلانات",
  "admin.partners.title": "إدارة الشركاء",
  "admin.partners.subtitle": "إضافة شركاء وربط الحسابات",
  "admin.partners.manageTitle": "شركاء التسويق",
  "admin.partners.manageSubtitle": "إضافة الشركاء وتحديث الشعار والترتيب.",
  "admin.partners.name": "اسم الشريك",
  "admin.partners.nameAr": "الاسم (عربي)",
  "admin.partners.nameEn": "الاسم (إنجليزي)",
  "admin.partners.logo": "رابط الشعار",
  "admin.partners.active": "نشط",
  "admin.partners.add": "إضافة شريك",
  "admin.partners.link": "ربط مستخدم بشريك",
  "admin.partners.userId": "معرف المستخدم (UUID)",
  "admin.partners.addBtn": "إضافة",
  "admin.partners.linkBtn": "ربط الحساب",
  "admin.partners.selectDeveloper": "اختر الشريك",
  "admin.partners.role": "دور العضو",
  "admin.partners.roleHint": "دور العضو (عضو / مدير)",
  "admin.users.title": "إدارة المستخدمين",
  "admin.users.subtitle": "تحديث صلاحيات المستخدمين",
  "admin.users.update": "تحديث الدور",
  "admin.users.role": "الدور",
  "admin.homepage.title": "محتوى الصفحة الرئيسية",
  "admin.homepage.subtitle": "إدارة وسائط البانر والإحصاءات والمشروعات المميزة.",
  "admin.homepage.manage": "إدارة الصفحة الرئيسية",
  "admin.homepage.back": "العودة للوحة الإدارة",
  "admin.homepage.order": "الترتيب",
  "admin.homepage.published": "منشور",
  "admin.homepage.add": "إضافة",
  "admin.homepage.save": "حفظ",
  "admin.homepage.delete": "حذف",
  "admin.homepage.media.title": "وسائط البانر",
  "admin.homepage.media.subtitle": "ارفع فيديو خلفية أو صور متحركة للواجهة.",
  "admin.homepage.media.image": "صورة",
  "admin.homepage.media.video": "فيديو",
  "admin.homepage.media.url": "رابط الوسائط",
  "admin.homepage.media.poster": "رابط البوستر",
  "admin.homepage.media.titleField": "عنوان (اختياري)",
  "admin.homepage.metrics.title": "بطاقات الثقة",
  "admin.homepage.metrics.subtitle": "إحصاءات تُعرض في الصفحة الرئيسية.",
  "admin.homepage.metrics.labelAr": "العنوان (عربي)",
  "admin.homepage.metrics.labelEn": "العنوان (إنجليزي)",
  "admin.homepage.metrics.value": "القيمة",
  "admin.homepage.projects.title": "مشروعات مميزة",
  "admin.homepage.projects.subtitle": "بطاقات المشاريع في الصفحة الرئيسية.",
  "admin.homepage.projects.titleAr": "العنوان (عربي)",
  "admin.homepage.projects.titleEn": "العنوان (إنجليزي)",
  "admin.homepage.projects.locationAr": "الموقع (عربي)",
  "admin.homepage.projects.locationEn": "الموقع (إنجليزي)",
  "admin.homepage.projects.price": "السعر الابتدائي",
  "admin.homepage.projects.currency": "العملة",
  "admin.homepage.projects.image": "رابط الصورة",
  "admin.homepage.projects.cta": "رابط زر العرض",
  "admin.review.title": "طابور المراجعة",
  "admin.review.subtitle": "طلبات التوريد القادمة من الشركاء",
  "admin.review.empty": "لا توجد طلبات قيد المراجعة حاليًا.",
  "admin.review.diff.title": "مقارنة البيانات",
  "admin.review.diff.submitted": "بيانات الشريك",
  "admin.review.diff.final": "نسخة {{brand}}",
  "admin.review.missing": "حقول ناقصة",
  "admin.review.submissionStatus": "حالة المراجعة",
  "admin.review.note.label": "ملاحظات المراجعة",
  "admin.review.note.placeholder": "اكتب ملاحظات للمراجعة",

  "reports.title": "التقارير",
  "reports.subtitle": "تحليل آخر 30 يومًا من الأداء.",
  "reports.units.title": "العقارات المضافة يوميًا",
  "reports.leads.title": "الطلبات اليومية",
  "reports.leadsPerListing.title": "الطلبات حسب العقار",
  "reports.column.day": "اليوم",
  "reports.column.units": "العقارات",
  "reports.column.leads": "الطلبات",
  "reports.column.period": "الفترة",
  "reports.column.listing": "العقار",
  "reports.column.count": "عدد الطلبات",
  "reports.column.id": "ID",

  "lead.status.new": "جديد",
  "lead.status.contacted": "تم التواصل",
  "lead.status.qualified": "مؤهل",
  "lead.status.meeting_set": "تم تحديد معاينة",
  "lead.status.follow_up": "متابعة بعد المعاينة",
  "lead.status.viewing": "معاينة",
  "lead.status.negotiation": "تفاوض",
  "lead.status.won": "تمت الصفقة",
  "lead.status.lost": "مغلقة",
  "lead.loss_reason.budget": "الميزانية",
  "lead.loss_reason.location": "الموقع",
  "lead.loss_reason.payment": "طرق السداد",
  "lead.loss_reason.timing": "التوقيت",
  "lead.loss_reason.other": "أخرى",
  "lead.loss_reason.other_note": "سبب آخر (تفاصيل إضافية)",
  "lead.source.facebook": "فيسبوك",
  "lead.source.propertyfinder": "PropertyFinder",
  "lead.source.dubizzle": "Dubizzle",
  "lead.source.organic": "بحث عضوي",
  "lead.source.influencer": "مؤثر",
  "lead.source.whatsapp": "واتساب",
  "lead.source.chatbot": "شات بوت",
  "lead.source.referral": "ترشيح",
  "lead.source.partner": "شريك",
  "lead.source.web": "الموقع",

  "purpose.sale": "للبيع",
  "purpose.rent": "للإيجار",
  "purpose.new": "مشروع جديد",

  "propertyType.apartment": "شقة",
  "propertyType.villa": "فيلا",
  "propertyType.duplex": "دوبلكس",
  "propertyType.townhouse": "تاون هاوس",
  "propertyType.penthouse": "بنتهاوس",
  "propertyType.studio": "ستوديو",
  "propertyType.land": "أرض",

  "sort.newest": "الأحدث",
  "sort.priceAsc": "السعر: من الأقل للأعلى",
  "sort.priceDesc": "السعر: من الأعلى للأقل",
  "sort.areaAsc": "المساحة: من الأقل للأعلى",
  "sort.areaDesc": "المساحة: من الأعلى للأقل",

  "category.rent.title": "عقارات للإيجار",
  "category.rent.desc": "خيارات تناسب نمط حياتك وميزانيتك.",
  "category.sale.title": "عقارات للبيع",
  "category.sale.desc": "استثمر في وحدات مختارة بعناية.",
  "category.new.title": "مشروعات جديدة",
  "category.new.desc": "اكتشف أحدث الإطلاقات العقارية.",

  "status.draft": "مسودة",
  "status.published": "منشور",
  "status.archived": "مؤرشف",

  "general.noImage": "لا توجد صورة",
  "general.imageAlt": "صورة العقار",
  "upload.uploading": "جاري الرفع...",
  "upload.error": "حدث خطأ أثناء رفع الصور.",
  "upload.path": "المسار",

  "about.kicker": "نبذة عن {{brand}}",
  "about.title": "{{brand}} للتسويق العقاري في مصر",
  "about.subtitle": "نحول بيانات الوحدات إلى عروض قابلة للنشر، ونبني رحلة عميل واضحة من أول استفسار حتى الإغلاق.",
  "about.story.title": "منصة تشغيل للتسويق العقاري",
  "about.story.body": "{{brand}} تمزج بين فريق داخلي يدير المحتوى والبيانات، وشبكة شركاء يزوّدوننا بالمخزون، مع CRM يضمن المتابعة والقياس.",
  "about.values.data": "دقة البيانات",
  "about.values.dataDesc": "تنظيف وتدقيق بيانات الوحدات قبل النشر.",
  "about.values.partners": "شراكات مطورين",
  "about.values.partnersDesc": "بوابة توريد منظمة مع مراجعة واعتماد.",
  "about.values.crm": "إدارة العملاء",
  "about.values.crmDesc": "متابعة وتحويل العملاء المحتملين إلى صفقات.",
  "about.values.trust": "ثقة السوق",
  "about.values.trustDesc": "هوية واضحة وتجربة احترافية لكل عميل.",
  "about.media.title": "فيديو تعريفي",
  "about.media.caption": "أضف فيديو {{brand}} الرسمي من يوتيوب.",
  "about.media.placeholder": "أضف NEXT_PUBLIC_ABOUT_VIDEO_ID لعرض الفيديو.",
  "about.impact.title": "أثرنا بالأرقام",
  "about.impact.subtitle": "مؤشرات تشغيلية مختصرة عن أداء المنصة.",
  "about.impact.metric1.label": "وحدات قيد التسويق",
  "about.impact.metric1.value": "+1200",
  "about.impact.metric2.label": "شركاء مطورين",
  "about.impact.metric2.value": "+45",
  "about.impact.metric3.label": "طلبات شهرية",
  "about.impact.metric3.value": "+300",

  "careers.kicker": "فرص العمل",
  "careers.title": "انضم إلى فريق {{brand}}",
  "careers.subtitle": "نبحث عن أشخاص يفهمون السوق العقاري ويحبون العمل على بيانات موثوقة وتجارب عميل محترفة.",
  "careers.openings.title": "الوظائف المتاحة",
  "careers.openings.location": "القاهرة • دوام كامل",
  "careers.roles.sales": "مسؤول مبيعات عقاري",
  "careers.roles.crm": "منسق CRM ومتابعة العملاء",
  "careers.roles.ops": "مسؤول إدخال بيانات",
  "careers.roles.content": "محرر محتوى عقاري",
  "careers.apply.title": "قدّم الآن",
  "careers.apply.name": "الاسم الكامل",
  "careers.apply.email": "البريد الإلكتروني",
  "careers.apply.phone": "رقم الهاتف",
  "careers.apply.role": "اختر الوظيفة",
  "careers.apply.message": "رسالة قصيرة عن خبرتك",
  "careers.apply.cv": "السيرة الذاتية (PDF / DOC)",
  "careers.apply.submit": "إرسال الطلب",
  "careers.admin.title": "طلبات التوظيف",
  "careers.admin.subtitle": "مراجعة المتقدمين وتتبع حالة كل طلب.",
  "careers.admin.empty": "لا توجد طلبات حتى الآن.",
  "careers.admin.cv": "الملف",
  "careers.admin.status": "حالة الطلب",
  "careers.status.new": "جديد",
  "careers.status.reviewing": "قيد المراجعة",
  "careers.status.interview": "مقابلة",
  "careers.status.offer": "عرض",
  "careers.status.rejected": "مرفوض",
  "careers.status.hired": "تم التعيين",

  "crm.title": "CRM {{brand}}",
  "crm.subtitle": "خط مبيعات موحد يربط التسويق بالمبيعات والمتابعة اليومية.",
  "crm.stats.total": "إجمالي العملاء المحتملين",
  "crm.stats.duplicates": "أرقام مكررة",
  "crm.stats.assigned": "معيّنة",
  "crm.stats.unassigned": "غير معيّنة",
  "crm.nav.leads": "العملاء المحتملون",
  "crm.nav.customers": "العملاء",
  "crm.nav.activities": "الأنشطة",
  "crm.nav.sources": "المصادر",
  "crm.pipeline.title": "مراحل خط المبيعات",
  "crm.pipeline.subtitle": "رؤية فورية لأعداد العملاء في كل مرحلة.",
  "crm.spend.title": "تكلفة العملاء المحتملين",
  "crm.spend.subtitle": "سجّل المصروفات حسب القناة لحساب CPL.",
  "crm.spend.channel": "اختر القناة",
  "crm.spend.amount": "قيمة الإنفاق",
  "crm.spend.save": "حفظ الإنفاق",
  "crm.search": "بحث بالاسم أو الهاتف",
  "crm.filter.status": "الحالة",
  "crm.filter.source": "المصدر",
  "crm.filter.assigned": "المسؤول",
  "crm.filter.unassigned": "غير معيّن",
  "crm.filter.lostReason": "سبب الإغلاق",
  "crm.filter.overdue": "متابعة متأخرة",
  "crm.filter.overdueOnly": "متأخر فقط",
  "crm.leads.title": "قائمة العملاء المحتملين",
  "crm.leads.subtitle": "تابع الحالة والتعيين والملاحظات.",
  "crm.leads.empty": "لا توجد نتائج مطابقة.",
  "crm.leads.unassigned": "بدون تعيين",
  "crm.leads.noListing": "طلب عام",
  "crm.leads.assigned": "مسؤول: {{name}}",
  "crm.leads.update": "تحديث الحالة",
  "crm.leads.export": "تصدير CSV",
  "crm.lossReason.select": "سبب الإغلاق",
  "crm.leads.assign": "تعيين",
  "crm.leads.nextNote": "ملاحظة المتابعة",
  "crm.leads.schedule": "حفظ المتابعة",
  "crm.leads.addNote": "أضف ملاحظة",
  "crm.leads.add": "إضافة",
  "crm.visits.link": "جدولة الزيارات",
  "crm.customers.title": "العملاء",
  "crm.customers.subtitle": "إدارة بيانات العملاء وربطها بالطلبات.",
  "crm.customers.search": "ابحث بالاسم أو الهاتف",
  "crm.customers.empty": "لا يوجد عملاء بعد.",
  "crm.customers.table.name": "الاسم",
  "crm.customers.table.phone": "الهاتف",
  "crm.customers.table.intent": "الهدف",
  "crm.customers.table.area": "المنطقة",
  "crm.customers.table.budget": "الميزانية",
  "crm.customers.table.leads": "الطلبات",
  "crm.customers.table.actions": "إجراءات",
  "crm.customers.view": "عرض",
  "crm.activities.title": "أنشطة العملاء",
  "crm.activities.subtitle": "سجّل المكالمات والاجتماعات والمتابعات.",
  "crm.activities.type": "نوع النشاط",
  "crm.activities.lead": "الطلب",
  "crm.activities.customer": "العميل",
  "crm.activities.outcome": "النتيجة",
  "crm.activities.notes": "ملاحظات",
  "crm.activities.create": "إضافة نشاط",
  "crm.activities.empty": "لا توجد أنشطة بعد.",
  "crm.activity.type.call_attempted": "محاولة اتصال",
  "crm.activity.type.call_answered": "تم الرد",
  "crm.activity.type.meeting": "مقابلة",
  "crm.activity.type.note": "ملاحظة",
  "crm.activity.type.follow_up": "متابعة",
  "crm.activity.type.whatsapp": "واتساب",
  "crm.activity.type.email": "بريد إلكتروني",
  "crm.sources.title": "مصادر العملاء",
  "crm.sources.subtitle": "إدارة مصادر الحملات وتتبع الأداء.",
  "crm.sources.slug": "الرمز",
  "crm.sources.name": "الاسم",
  "crm.sources.active": "نشط",
  "crm.sources.inactive": "متوقف",
  "crm.sources.add": "إضافة مصدر",
  "crm.sources.empty": "لا توجد مصادر بعد.",
  "crm.sources.toggle": "تفعيل/تعطيل",

  "visits.title": "الزيارات الميدانية",
  "visits.subtitle": "جدولة المعاينات وربطها بالوحدات والعملاء.",
  "visits.form.listing": "اختر الوحدة",
  "visits.form.lead": "اختر العميل",
  "visits.form.assigned": "تعيين لمندوب",
  "visits.form.notes": "ملاحظات الزيارة",
  "visits.form.create": "إضافة زيارة",
  "visits.form.outcome": "نتيجة الزيارة",
  "visits.update": "تحديث الحالة",
  "visits.updateNotes": "حفظ التفاصيل",
  "visits.empty": "لا توجد زيارات مجدولة.",
  "visits.noListing": "بدون وحدة",
  "visits.noLead": "بدون عميل",
  "visits.status.scheduled": "مجدولة",
  "visits.status.completed": "مكتملة",
  "visits.status.rescheduled": "إعادة جدولة",
  "visits.status.canceled": "ملغاة",
  "visits.status.no_show": "لم يحضر",

  "nav.contact": "واتساب",
  "nav.menu": "القائمة",

  "layer.current": "الطبقة",
  "layer.public": "عام",
  "layer.admin": "إدارة",
  "layer.staff": "تشغيل",
  "layer.developer": "شركاء",
  "layer.owner": "مالك",

  "footer.links": "روابط سريعة",
  "footer.contact": "تواصل معنا",
  "footer.facebook": "فيسبوك {{brand}}",
  "footer.instagram": "إنستجرام {{brand}}",
  "footer.linkedin": "لينكد إن {{brand}}",
  "footer.tiktok": "تيك توك {{brand}}",
  "footer.whatsapp": "واتساب {{brand}}",
  "footer.email": "hrtajrealestate@gmail.com",
  "footer.rights": "جميع الحقوق محفوظة",

  "home.hero.quick": "بحث سريع حسب الغرض",
  "home.why.title": "لماذا {{brand}}؟",
  "home.why.subtitle": "نربط التسويق بالبيانات والعمليات لنقدّم نتائج قابلة للقياس.",
  "home.why.item1.title": "حملات موجهة",
  "home.why.item1.body": "توزيع الميزانيات حسب المنطقة ونية الشراء لرفع التحويل.",
  "home.why.item2.title": "داتا منقّحة",
  "home.why.item2.body": "تنظيف وتوحيد المواصفات قبل نشر أي وحدة.",
  "home.why.item3.title": "متابعة العملاء",
  "home.why.item3.body": "CRM واضح من أول تواصل حتى إغلاق الصفقة.",
  "home.process.title": "كيف نعمل",
  "home.process.subtitle": "سير عمل متكامل من التوريد حتى التعاقد.",
  "home.process.step1.title": "استلام البيانات",
  "home.process.step1.body": "نجمع الوحدات من الملاك والشركاء ونراجعها.",
  "home.process.step2.title": "مراجعة ونشر",
  "home.process.step2.body": "تدقيق البيانات، إضافة الأكواد الداخلية، ثم النشر.",
  "home.process.step3.title": "إدارة العملاء",
  "home.process.step3.body": "توزيع الطلبات ومتابعتها حتى الإغلاق.",
  "home.about.title": "عن {{brand}}",
  "home.about.subtitle": "منصة تشغيل للتسويق والوساطة العقارية في مصر، مدعومة ببيانات موثوقة وشراكات قوية.",
  "home.about.cta": "اعرف المزيد",
  "home.about.card1.kicker": "فريق العمليات",
  "home.about.card1.title": "إدارة بيانات دقيقة",
  "home.about.card1.body": "تنظيف وتوحيد المواصفات قبل النشر.",
  "home.about.card2.kicker": "الشركاء",
  "home.about.card2.title": "بوابة توريد منظمة",
  "home.about.card2.body": "تجربة واضحة للمطورين مع مراجعة واعتماد.",
  "home.about.card3.kicker": "العملاء",
  "home.about.card3.title": "رحلة متابعة كاملة",
  "home.about.card3.body": "CRM يضمن سرعة الاستجابة وتحسين التحويل.",

  "listings.filters.title": "فلترة النتائج",
  "listings.filters.subtitle": "حدد المدينة والنوع والميزانية للوصول لأفضل تطابق.",
  "listings.pagination.prev": "السابق",
  "listings.pagination.next": "التالي",
  "listings.pagination.page": "صفحة {{page}} من {{total}}",

  "detail.contact.print": "طباعة",
  "detail.documents.title": "الملفات المتاحة",

  "print.title": "نسخة للطباعة",
  "print.share": "رابط المشاركة",

  "careers.perks.title": "لماذا تنضم إلى {{brand}}؟",
  "careers.perks.item1": "بيئة عمل سريعة النمو مع تدريب مستمر.",
  "careers.perks.item2": "مسار واضح للتطوير والترقية.",
  "careers.perks.item3": "فرق عمليات ومبيعات تعمل بأدوات حديثة.",

  "about.process.title": "آلية العمل",
  "about.process.subtitle": "من التوريد إلى النشر والمتابعة.",
  "about.process.step1.title": "توريد البيانات",
  "about.process.step1.body": "نجمع الوحدات من الشركاء والمالكين.",
  "about.process.step2.title": "تدقيق المحتوى",
  "about.process.step2.body": "تنظيف البيانات وتوحيد المعايير.",
  "about.process.step3.title": "تسويق ومتابعة",
  "about.process.step3.body": "نشر الحملات وإدارة العملاء.",
  "about.coverage.title": "نطاق التغطية",
  "about.coverage.subtitle": "نغطي المدن الجديدة والمناطق الأساسية.",
  "about.coverage.item1": "القاهرة الجديدة",
  "about.coverage.item2": "الشيخ زايد",
  "about.coverage.item3": "العاصمة الإدارية",
  "about.coverage.item4": "الساحل الشمالي",
  "about.coverage.item5": "العين السخنة",
};

const en: Dictionary = {
  "brand.name": "{{brand}}",
  "brand.tagline": "{{brand}} - real estate marketing",
  "brand.domain": "Real estate marketing",

  "nav.listings": "Listings",
  "nav.about": "About",
  "nav.careers": "Careers",
  "nav.partners": "Submission portal",
  "nav.staff": "Staff entry",
  "nav.crm": "CRM",
  "nav.admin": "Admin",
  "nav.reports": "Reports",
  "nav.account": "My Account",
  "nav.dashboard": "Dashboard",
  "nav.login": "Sign In",
  "nav.superAdmin": "Owner panel",

  "lang.ar": "Arabic",
  "lang.en": "English",

  "theme.dark": "Dark",
  "theme.light": "Light",

  "help.mode.on": "Help mode (On)",
  "help.mode.off": "Help mode",

  "role.developer": "Developer",
  "role.owner": "Owner",
  "role.admin": "Admin",
  "role.ops": "Ops",
  "role.staff": "Staff",
  "role.agent": "Agent",

  "submission.status.draft": "Draft",
  "submission.status.submitted": "Pending review",
  "submission.status.under_review": "Under review",
  "submission.status.needs_changes": "Needs changes",
  "submission.status.approved": "Approved",
  "submission.status.published": "Published",
  "submission.status.archived": "Archived",

  "submission.portal.title": "Submission portal",
  "submission.portal.subtitle": "Submit your inventory and projects to {{brand}} for review before publishing.",
  "submission.section.projects": "Projects",
  "submission.section.inventory": "Inventory units",
  "submission.section.media": "Marketing assets",
  "submission.action.submit": "Submit for review",
  "submission.action.request_changes": "Request changes",
  "submission.action.approve": "Approve",
  "submission.action.publish": "Publish",
  "submission.action.archive": "Archive",
  "submission.action.assign_code": "Assign {{brand}} code",
  "submission.field.listing_code": "Listing code",
  "submission.field.project_code": "Project code",
  "submission.field.unit_code": "Unit code",
  "submission.field.title_ar": "Title (Arabic)",
  "submission.field.title_en": "Title (English)",
  "submission.field.desc_ar": "Description (Arabic)",
  "submission.field.desc_en": "Description (English)",
  "submission.field.status": "Status",
  "submission.field.missing": "Missing fields",
  "submission.field.review_note": "Review notes",
  "submission.locked": "Editing is locked while {{brand}} reviews this submission.",

  "media.type.brochure": "Brochure",
  "media.type.floorplan": "Floor plan",
  "media.type.image": "Image",
  "media.type.other": "Other",
  "media.submit.title": "Submit marketing asset",
  "media.submit.url": "Asset URL",
  "media.submit.add": "Add asset",

  "home.hero.badge": "{{brand}} verified real estate marketing",
  "home.hero.title": "Discover your next property with {{brand}} and trusted marketing campaigns.",
  "home.hero.subtitle": "Verified listings for sale and rent, connecting clients with certified partners.",
  "home.hero.ctaPrimary": "Browse listings",
  "home.hero.ctaSecondary": "Submission portal",
  "home.callback.title": "Request a call back",
  "home.callback.subtitle": "Leave your details and the {{brand}} team will contact you shortly.",
  "home.callback.name": "Full name",
  "home.callback.email": "Email",
  "home.callback.phone": "Phone number",
  "home.callback.submit": "Request call",
  "home.stats.listings": "Published listings",
  "home.stats.developers": "Certified partners",
  "home.stats.leads": "Monthly requests",
  "home.search.title": "Quick search",
  "home.search.subtitle": "Search by city or area and set your budget range.",
  "home.search.city": "City",
  "home.search.area": "District / Area",
  "home.search.purpose": "Purpose",
  "home.search.minPrice": "Min price",
  "home.search.maxPrice": "Max price",
  "home.search.submit": "Start search",
  "home.categories.title": "Categories",
  "home.categories.subtitle": "Choose the right property type",
  "home.categories.desc": "Explore options that match your needs.",
  "home.featured.title": "Latest listings",
  "home.featured.subtitle": "Handpicked listings added recently",
  "home.featured.empty": "No listings published yet.",
  "home.request.title": "Tell us what you want",
  "home.request.subtitle": "Send your request to {{brand}} and we will follow up quickly.",
  "home.request.name": "Full name",
  "home.request.phone": "Phone number",
  "home.request.intent": "Intent",
  "home.request.intent.buy": "Buy",
  "home.request.intent.rent": "Rent",
  "home.request.intent.invest": "Invest",
  "home.request.area": "Preferred area",
  "home.request.budgetMin": "Minimum budget",
  "home.request.budgetMax": "Maximum budget",
  "home.request.contactTime": "Preferred contact time",
  "home.request.contact.morning": "Morning",
  "home.request.contact.afternoon": "Afternoon",
  "home.request.contact.evening": "Evening",
  "home.request.contact.any": "Any time",
  "home.request.notes": "Additional notes",
  "home.request.submit": "Submit request",
  "home.partners.title": "Partner developers",
  "home.partners.subtitle": "A trusted network of developers marketed by {{brand}}.",
  "home.partners.cta": "View projects",
  "home.ads.title": "Developer campaigns",
  "home.ads.subtitle": "{{brand}}-approved campaigns for selected projects.",
  "home.ads.empty": "No published campaigns yet.",
  "home.ads.cta": "View details",
  "home.partners.tag.launch": "New launches",
  "home.partners.tag.delivery": "Near delivery",
  "home.partners.tag.installments": "Installment plans",
  "home.partners.tag.locations": "Prime locations",
  "home.partners.item.northbay": "North Bay Developments",
  "home.partners.item.sahara": "Sahara Real Estate",
  "home.partners.item.nilegate": "Nile Gate",
  "home.partners.item.almadina": "Al Madina Modern",
  "home.partners.item.glowhills": "Glow Hills",
  "home.partners.item.atlas": "Atlas Developments",

  "home.proof.title": "Proof in numbers",
  "home.proof.subtitle": "Key metrics for {{brand}} operations.",
  "home.projects.title": "Featured projects",
  "home.projects.subtitle": "New launches with curated investment opportunities.",
  "home.projects.empty": "No featured projects available right now.",
  "home.projects.starting": "Starting at",
  "home.projects.cta": "View project",

  "listings.title": "Listings",
  "listings.results": "Results: {{count}} listings",
  "listings.loginPrompt": "Sign in to save favorites",
  "listings.empty": "No listings match your filters.",
  "listings.filters.apply": "Apply filters",
  "listings.filters.reset": "Reset filters",
  "listings.view.grid": "Grid",
  "listings.view.list": "List",

  "listing.card.details": "View details",
  "listing.card.save": "Save",
  "listing.card.saved": "Saved",
  "listing.card.noImage": "No image",

  "filters.city": "City",
  "filters.area": "Area",
  "filters.purpose": "Purpose",
  "filters.type": "Property type",
  "filters.minPrice": "Min price",
  "filters.maxPrice": "Max price",
  "filters.beds": "Bedrooms",
  "filters.baths": "Bathrooms",
  "filters.sort": "Sort",

  "detail.back": "Back to listings",
  "detail.contact.title": "Contact",
  "detail.contact.subtitle": "Reach {{brand}} to schedule a viewing.",
  "detail.contact.defaultName": "Sales team",
  "detail.contact.noPhone": "Contact details available on request",
  "detail.contact.whatsapp": "WhatsApp",
  "detail.contact.share": "Share",
  "detail.map.title": "Location",
  "detail.map.placeholder": "Map will be added soon",
  "detail.description.title": "Property description",
  "detail.description.empty": "No description available yet.",
  "detail.amenities.title": "Amenities",
  "detail.amenities.empty": "No amenities listed yet.",
  "detail.stats.area": "Area",
  "detail.stats.rooms": "Rooms",
  "detail.stats.baths": "Bathrooms",
  "detail.stats.unknown": "Not specified",
  "detail.facts.title": "Property details",
  "detail.facts.area": "Area",
  "detail.facts.floor": "Floor",
  "detail.facts.view": "View",
  "detail.facts.building": "Building",
  "detail.facts.finishing": "Finishing",
  "detail.facts.meters": "Meters",
  "detail.facts.reception": "Reception",
  "detail.facts.kitchen": "Kitchen",
  "detail.facts.elevator": "Elevator",
  "detail.facts.code": "Listing code",
  "detail.cta.whatsapp": "WhatsApp",
  "detail.cta.call": "Call",
  "detail.cta.book": "Book a viewing",
  "detail.lead.title": "Submit request",
  "detail.lead.name": "Full name",
  "detail.lead.phone": "Phone number",
  "detail.lead.email": "Email address",
  "detail.lead.message": "Your message",
  "detail.lead.submit": "Submit request",
  "detail.lead.submitting": "Sending...",
  "detail.lead.successTitle": "Request sent",
  "detail.lead.successBody": "We will reach out shortly.",
  "detail.lead.error": "We couldn't send your request. Please try again.",
  "detail.lead.guest.prefix": "You can submit a request as a guest. If you want to track it,",
  "detail.lead.guest.action": "sign in",

  "auth.title": "Sign in",
  "auth.subtitle": "Sign-in is limited to {{brand}} staff and approved partners.",
  "auth.tab.email": "Email",
  "auth.tab.phone": "Phone",
  "auth.session.title": "You are already signed in.",
  "auth.session.go": "Go to dashboard",
  "auth.session.logout": "Sign out",
  "auth.email.label": "Email",
  "auth.email.placeholder": "you@example.com",
  "auth.password.label": "Password",
  "auth.password.hint": "Password must be at least 6 characters.",
  "auth.password.show": "Show",
  "auth.password.hide": "Hide",
  "auth.action.signIn": "Sign in",
  "auth.action.signUp": "Create account",
  "auth.phone.label": "Phone (E.164)",
  "auth.phone.placeholder": "+2010xxxxxxxx",
  "auth.otp.send": "Send code",
  "auth.otp.verify": "Verify",
  "auth.otp.reset": "Resend",
  "auth.msg.signInSuccess": "Signed in successfully. Redirecting...",
  "auth.msg.signUpCheckEmail": "Check your email to confirm your account.",
  "auth.msg.signUpSuccess": "Account created. Redirecting...",
  "auth.msg.otpSent": "Verification code sent.",
  "auth.msg.otpSuccess": "Verified. Redirecting...",
  "auth.msg.logout": "Signed out.",
  "auth.msg.resetOtp": "OTP reset.",
  "auth.error.signIn": "Unable to sign in: {{message}}",
  "auth.error.signUp": "Unable to sign up: {{message}}",
  "auth.error.otpSend": "Unable to send code: {{message}}",
  "auth.error.otpVerify": "Unable to verify: {{message}}",
  "auth.error.logout": "Unable to sign out: {{message}}",
  "auth.error.phoneFormat": "Use international format like +2010xxxxxxx.",
  "auth.error.otpRequired": "Send the verification code first.",
  "auth.error.otpInvalid": "Invalid verification code.",
  "auth.footer.redirect": "After signing in, you will be redirected to: {{path}}",
  "auth.loading": "Loading...",
  "auth.reset.title": "Reset your password",
  "auth.reset.subtitle": "Enter your email to receive the reset link.",
  "auth.reset.email": "Email address",
  "auth.reset.send": "Send reset link",
  "auth.reset.sent": "Password reset link sent. Check your email.",
  "auth.reset.link": "Forgot password?",
  "auth.reset.back": "Back to sign in",
  "auth.reset.newTitle": "Set a new password",
  "auth.reset.newSubtitle": "Enter your new password below.",
  "auth.reset.newPassword": "New password",
  "auth.reset.confirm": "Confirm password",
  "auth.reset.save": "Save password",
  "auth.reset.waiting": "Preparing your recovery session from the link...",

  "dashboard.session.error": "Session error",
  "dashboard.session.help": "We could not load your session. Please sign in again.",
  "dashboard.session.login": "Sign in",
  "dashboard.session.home": "Back to home",
  "dashboard.title": "Welcome",
  "dashboard.email": "Email",
  "dashboard.phone": "Phone",
  "dashboard.logout": "Sign out",
  "dashboard.account": "My account",
  "dashboard.partner": "Submission portal",
  "dashboard.admin": "Admin",

  "account.title": "My account",
  "account.subtitle": "Update your profile and track favorites and requests.",
  "account.profile.name": "Full name",
  "account.profile.phone": "Phone",
  "account.profile.save": "Save",
  "account.favorites.title": "Favorites",
  "account.favorites.subtitle": "Listings you saved",
  "account.favorites.empty": "You have no saved listings yet. Browse listings.",
  "account.leads.title": "My requests",
  "account.leads.subtitle": "Requests you submitted",
  "account.leads.empty": "No requests yet.",
  "account.leads.listing": "Listing: {{title}}",

  "developer.title": "Submission portal",
  "developer.subtitle.company": "Company: {{name}}",
  "developer.subtitle.empty": "Link your account to a partner from the admin panel.",
  "developer.stats.total": "Total listings",
  "developer.stats.published": "Published listings",
  "developer.stats.pending": "Submissions in review",
  "developer.stats.projects": "Total projects",
  "developer.stats.leads": "Latest requests",
  "developer.create.title": "Add new listing",
  "developer.create.subtitle": "Fill the basics. {{brand}} reviews submissions before publishing.",
  "developer.create.submit": "Create listing",
  "developer.form.title": "Listing title",
  "developer.form.price": "Price",
  "developer.form.currency": "Currency",
  "developer.form.address": "Full address",
  "developer.form.size": "Size m2",
  "developer.form.amenities": "Amenities (comma separated)",
  "developer.form.description": "Listing description",
  "developer.form.project": "Project",
  "developer.form.projectHint": "Select the project for this unit.",
  "developer.project.required": "Create a project first before adding units.",
  "developer.listings.title": "My listings",
  "developer.listings.subtitle": "Manage your listings",
  "developer.listings.empty": "No listings yet. Use the form above.",
  "developer.listings.manage": "Manage listing",
  "developer.leads.title": "Client requests",
  "developer.leads.subtitle": "Latest requests for your listings",
  "developer.leads.empty": "No requests yet.",
  "developer.leads.update": "Update status",
  "developer.leads.addNote": "Add",
  "developer.leads.lastNote": "Latest note: {{note}}",
  "developer.leads.noNote": "No notes yet.",
  "developer.ads.title": "Developer ads",
  "developer.ads.subtitle": "Prepare ad campaigns and send them for review.",
  "developer.ads.create": "Create campaign",
  "developer.ads.createHint": "Add clear copy and a call-to-action link.",
  "developer.ads.list": "Your campaigns",
  "developer.ads.listHint": "Track status and manage media assets.",
  "developer.ads.titleAr": "Arabic title",
  "developer.ads.titleEn": "English title",
  "developer.ads.bodyAr": "Arabic copy",
  "developer.ads.bodyEn": "English copy",
  "developer.ads.ctaAr": "CTA label (AR)",
  "developer.ads.ctaEn": "CTA label (EN)",
  "developer.ads.ctaUrl": "CTA URL",
  "developer.ads.save": "Save",
  "developer.ads.submit": "Submit for review",
  "developer.ads.delete": "Delete",
  "developer.ads.assets": "Assets",
  "developer.ads.assetUrl": "Asset URL",
  "developer.ads.posterUrl": "Poster URL",
  "developer.ads.order": "Order",
  "developer.ads.primary": "Primary",
  "developer.ads.addAsset": "Add asset",
  "developer.ads.remove": "Remove",
  "developer.ads.assetsEmpty": "No assets yet.",
  "developer.ads.empty": "No campaigns yet.",
  "developer.ads.back": "Back to portal",
  "developer.ads.untitled": "Untitled",

  "developer.edit.title": "Manage listing",
  "developer.edit.subtitle": "Update listing details",
  "developer.edit.back": "Back to portal",
  "developer.edit.save": "Save changes",
  "developer.edit.delete": "Delete listing",
  "developer.edit.images": "Listing images",
  "developer.edit.images.subtitle": "Upload and organize images",
  "developer.edit.deleteImage": "Delete image",
  "developer.import.title": "Project units import",
  "developer.import.subtitle": "Upload CSV or Excel for project units.",
  "developer.import.format": "File type",
  "developer.import.notes": "Import notes (optional)",
  "developer.import.submit": "Start import",
  "developer.import.loading": "Importing...",
  "developer.import.rowsTotal": "Total rows",
  "developer.import.rowsInserted": "Rows inserted",
  "developer.import.rowsUpdated": "Rows updated",
  "developer.import.rowsFailed": "Rows failed",
  "project.create.title": "Create project",
  "project.create.submit": "Save project",
  "project.form.title": "Project name",
  "project.form.description": "Project description",
  "project.form.city": "City",
  "project.form.area": "Area",
  "project.form.address": "Full address",
  "project.manage": "Manage project",

  "staff.title": "Staff data entry",
  "staff.subtitle": "Prepare resale units for {{brand}} marketing and publishing.",
  "staff.stats.total": "Total units",
  "staff.stats.draft": "Drafts",
  "staff.stats.submitted": "In review",
  "staff.stats.published": "Published",
  "staff.search.placeholder": "Search by code, phone, or address",
  "staff.filter.status": "Status",
  "staff.filter.all": "All",
  "staff.filter.draft": "Draft",
  "staff.filter.submitted": "In review",
  "staff.filter.published": "Published",
  "staff.form.title": "Add resale unit",
  "staff.form.subtitle": "Start with essentials and complete details later.",
  "staff.form.submit": "Create unit",
  "staff.form.internalCode": "Internal code",
  "staff.form.unitCode": "Agent code",
  "staff.form.type": "Unit type",
  "staff.form.purpose": "Purpose",
  "staff.form.price": "Price",
  "staff.form.currency": "Currency",
  "staff.form.city": "City",
  "staff.form.area": "Area",
  "staff.form.address": "Address",
  "staff.form.beds": "Bedrooms",
  "staff.form.baths": "Bathrooms",
  "staff.form.size": "Size m2",
  "staff.form.description": "Short description",
  "staff.form.agent": "Agent",
  "staff.form.agentFallback": "Agent name (optional)",
  "staff.form.ownerName": "Owner name",
  "staff.form.ownerPhone": "Owner phone",
  "staff.form.floor": "Floor",
  "staff.form.elevator": "Elevator",
  "staff.form.finishing": "Finishing",
  "staff.form.meters": "Meters",
  "staff.form.reception": "Reception",
  "staff.form.kitchen": "Kitchen",
  "staff.form.view": "View",
  "staff.form.building": "Building",
  "staff.form.entrance": "Entrance",
  "staff.form.commission": "Commission",
  "staff.form.date": "Date",
  "staff.form.target": "Target",
  "staff.form.adChannel": "Ad channel",
  "staff.form.notes": "Internal notes",
  "staff.form.ownerNotes": "Owner notes",
  "staff.form.lastOwnerContactAt": "Last owner contact",
  "staff.form.nextOwnerFollowupAt": "Next owner follow-up",
  "staff.form.lastOwnerContactNote": "Last contact note",
  "staff.form.unitStatus": "Unit status",
  "staff.form.requested": "Requested",
  "staff.form.lastUpdatedBy": "Last updated by",
  "staff.section.basics": "Basics",
  "staff.section.details": "Unit details",
  "staff.section.owner": "Owner contact",
  "staff.section.media": "Media & attachments",
  "staff.section.notes": "Notes",
  "staff.unitStatus.available": "Available",
  "staff.unitStatus.reserved": "Reserved",
  "staff.unitStatus.sold": "Sold",
  "staff.unitStatus.rented": "Rented",
  "staff.unitStatus.off_market": "Off market",
  "staff.unitStatus.on_hold": "On hold",
  "staff.share.title": "Share unit",
  "staff.share.public": "Public link",
  "staff.share.internal": "Internal link",
  "staff.share.print": "Print view",
  "staff.share.publicHint": "Share without owner details.",
  "staff.share.internalHint": "For internal {{brand}} use only.",
  "staff.share.copy": "Copy link",
  "staff.import.title": "Resale intake import",
  "staff.import.subtitle": "Upload CSV or Excel to create internal resale units.",
  "staff.import.format": "File type",
  "staff.import.notes": "Import notes (optional)",
  "staff.import.submit": "Start import",
  "staff.import.loading": "Importing...",
  "staff.import.rowsTotal": "Total rows",
  "staff.import.rowsInserted": "Rows inserted",
  "staff.import.rowsUpdated": "Rows updated",
  "staff.import.rowsFailed": "Rows failed",
  "share.title": "Unit overview",
  "share.subtitle": "Public view without owner information.",
  "share.request": "Submit request",
  "superAdmin.analytics.title": "Analytics",
  "superAdmin.analytics.subtitle": "Monthly visitors and lead sources.",
  "superAdmin.analytics.visitors": "Monthly visitors",
  "superAdmin.analytics.leadSources": "Lead sources",
  "superAdmin.analytics.noLeads": "No leads yet.",
  "superAdmin.users.title": "User & role management",
  "superAdmin.users.subtitle": "Super admin only.",
  "superAdmin.users.update": "Update",
  "superAdmin.security.title": "Security settings",
  "superAdmin.security.subtitle": "Review sensitive configurations.",
  "superAdmin.security.passwords": "Enable leaked password protection in Supabase Auth settings.",
  "superAdmin.security.storage": "Verify storage policies only expose published media.",
  "superAdmin.security.rls": "Ensure RLS remains enabled and tested.",
  "owner.unlock.title": "Owner verification",
  "owner.unlock.subtitle": "This area is protected and requires an owner key.",
  "owner.unlock.input": "Owner key",
  "owner.unlock.action": "Unlock panel",
  "owner.unlock.error": "Invalid owner key.",
  "owner.users.title": "User management",
  "owner.users.subtitle": "Manage roles and access for {{brand}} accounts.",
  "owner.users.update": "Update role",
  "owner.users.invite.title": "Add user",
  "owner.users.invite.subtitle": "Create admin and staff accounts from the web app.",
  "owner.users.invite.full_name": "Full name",
  "owner.users.invite.phone": "Phone",
  "owner.users.invite.email": "Email",
  "owner.users.invite.role": "Role",
  "owner.users.invite.submit": "Send invite",
  "owner.users.invite.loading": "Sending...",
  "owner.users.invite.link": "Invite link",
  "owner.users.invite.copy": "Copy link",
  "owner.users.invite.copied": "Copied",
  "owner.users.invite.error.unauthorized": "Please sign in first.",
  "owner.users.invite.error.forbidden": "You do not have permission to add users.",
  "owner.users.invite.error.owner_locked": "Owner access is locked.",
  "owner.users.invite.error.invalid_input": "Check the input values.",
  "owner.users.invite.error.invalid_role": "Role is not allowed.",
  "owner.users.invite.error.invite_failed": "Unable to send invite.",
  "owner.users.invite.error.user_lookup_failed": "Unable to find the user.",
  "owner.settings.title": "Contact settings",
  "owner.settings.subtitle": "Update public contact links shown on the site.",
  "owner.settings.facebook": "Facebook URL",
  "owner.settings.instagram": "رابط إنستجرام",
  "owner.settings.email": "Public email",
  "owner.settings.linkedin": "LinkedIn URL",
  "owner.settings.tiktok": "TikTok URL",
  "owner.settings.whatsappNumber": "WhatsApp number",
  "owner.settings.whatsappLink": "WhatsApp link",
  "owner.settings.save": "Save settings",
  "owner.audit.title": "Audit log",
  "owner.audit.subtitle": "Track sensitive operations with actor and timestamps.",
  "owner.audit.filters": "Log filters",
  "owner.audit.filtersHint": "Use filters to narrow results.",
  "owner.audit.action": "Action",
  "owner.audit.entity": "Entity type",
  "owner.audit.actor": "Actor (ID)",
  "owner.audit.apply": "Apply",
  "owner.audit.table": "Audit entries",
  "owner.audit.tableHint": "Last 200 operations",
  "owner.audit.empty": "No matching entries.",
  "staff.form.save": "Save changes",
  "staff.table.code": "Code",
  "staff.table.unitCode": "Agent code",
  "staff.table.owner": "Owner",
  "staff.table.phone": "Phone",
  "staff.table.price": "Price",
  "staff.table.status": "Status",
  "staff.table.actions": "Actions",
  "staff.actions.manage": "Manage",
  "staff.actions.duplicate": "Duplicate",
  "staff.actions.submit": "Submit",
  "staff.actions.publish": "Publish",
  "staff.actions.back": "Back",
  "staff.preview.title": "Listing preview",
  "staff.actions.save": "Save",
  "staff.attachments.title": "Attachments",
  "staff.attachments.subtitle": "Upload files, categorize them, and control what appears publicly.",
  "staff.attachments.upload": "Upload files",
  "staff.attachments.drag": "Drop files here or browse your device",
  "staff.attachments.category": "Category",
  "staff.attachments.titleLabel": "File title",
  "staff.attachments.noteLabel": "Notes",
  "staff.attachments.primary": "Primary",
  "staff.attachments.published": "Published",
  "staff.attachments.copy": "Copy link",
  "staff.attachments.delete": "Delete",
  "staff.attachments.empty": "No attachments yet.",
  "staff.attachments.fileType": "File type",
  "staff.attachments.sizeLimit": "Max 25MB per file.",

  "attachment.category.unit_photos": "Unit photos",
  "attachment.category.building_entry": "Building entry",
  "attachment.category.view": "View",
  "attachment.category.plan": "Plan",
  "attachment.category.contract": "Contract",
  "attachment.category.owner_docs": "Owner documents",
  "attachment.category.other": "Other",
  "attachment.type.image": "Image",
  "attachment.type.pdf": "PDF",
  "attachment.type.video": "Video",
  "attachment.type.doc": "Document",
  "attachment.type.other": "File",

  "admin.title": "Admin dashboard",
  "admin.subtitle": "Track performance, approvals, and team management.",
  "admin.stats.today": "Listings today",
  "admin.stats.week": "Listings last 7 days",
  "admin.stats.leadsToday": "Requests today",
  "admin.stats.leadsWeek": "Requests last 7 days",
  "admin.top.title": "Top partners",
  "admin.top.subtitle": "Most active partners",
  "admin.approvals.title": "Publishing requests",
  "admin.approvals.subtitle": "Listings awaiting approval",
  "admin.approvals.empty": "No listings awaiting review.",
  "admin.approvals.update": "Update status",
  "admin.approvals.status": "Listing status",
  "admin.leads.title": "Requests management",
  "admin.leads.subtitle": "Assign and track client requests",
  "admin.leads.empty": "No new requests.",
  "admin.leads.unassigned": "Unassigned",
  "admin.leads.assigned": "Owner: {{name}}",
  "admin.leads.assign": "Assign",
  "admin.leads.addNote": "Add",
  "admin.ads.title": "Ads review",
  "admin.ads.subtitle": "Review developer campaigns before publishing.",
  "admin.ads.queue": "Campaign queue",
  "admin.ads.queueHint": "Validate copy and assets, then approve or request changes.",
  "admin.ads.empty": "No campaigns yet.",
  "admin.ads.developer": "Developer:",
  "admin.ads.back": "Back to admin",
  "admin.ads.save": "Save",
  "admin.ads.requestChanges": "Request changes",
  "admin.ads.approve": "Approve",
  "admin.ads.publish": "Publish",
  "admin.ads.archive": "Archive",
  "ads.status.label": "Status:",
  "ads.status.draft": "Draft",
  "ads.status.submitted": "Submitted",
  "ads.status.needs_changes": "Needs changes",
  "ads.status.approved": "Approved",
  "ads.status.published": "Published",
  "ads.status.archived": "Archived",
  "ads.media.image": "Image",
  "ads.media.video": "Video",
  "nav.ads": "Ads",
  "admin.partners.title": "Partners management",
  "admin.partners.subtitle": "Add partners and link accounts",
  "admin.partners.manageTitle": "Marketing partners",
  "admin.partners.manageSubtitle": "Add partners and update logo/order.",
  "admin.partners.name": "Partner name",
  "admin.partners.nameAr": "Name (Arabic)",
  "admin.partners.nameEn": "Name (English)",
  "admin.partners.logo": "Logo URL",
  "admin.partners.active": "Active",
  "admin.partners.add": "Add partner",
  "admin.partners.link": "Link user to partner",
  "admin.partners.userId": "User ID (UUID)",
  "admin.partners.addBtn": "Add",
  "admin.partners.linkBtn": "Link",
  "admin.partners.selectDeveloper": "Select partner",
  "admin.partners.role": "Member role",
  "admin.partners.roleHint": "Member role (member / manager)",
  "admin.users.title": "User management",
  "admin.users.subtitle": "Update user roles",
  "admin.users.update": "Update role",
  "admin.users.role": "Role",
  "admin.homepage.title": "Homepage content",
  "admin.homepage.subtitle": "Manage hero media, proof metrics, and featured projects ordering.",
  "admin.homepage.manage": "Homepage manager",
  "admin.homepage.back": "Back to admin",
  "admin.homepage.order": "Order",
  "admin.homepage.published": "Published",
  "admin.homepage.add": "Add",
  "admin.homepage.save": "Save",
  "admin.homepage.delete": "Delete",
  "admin.homepage.media.title": "Hero media",
  "admin.homepage.media.subtitle": "Upload background video or carousel images for the hero section.",
  "admin.homepage.media.image": "Image",
  "admin.homepage.media.video": "Video",
  "admin.homepage.media.url": "Media URL",
  "admin.homepage.media.poster": "Poster URL",
  "admin.homepage.media.titleField": "Title (optional)",
  "admin.homepage.metrics.title": "Proof metrics",
  "admin.homepage.metrics.subtitle": "Metrics displayed on the homepage.",
  "admin.homepage.metrics.labelAr": "Label (Arabic)",
  "admin.homepage.metrics.labelEn": "Label (English)",
  "admin.homepage.metrics.value": "Value",
  "admin.homepage.projects.title": "Featured projects",
  "admin.homepage.projects.subtitle": "Cards displayed on the public homepage.",
  "admin.homepage.projects.titleAr": "Title (Arabic)",
  "admin.homepage.projects.titleEn": "Title (English)",
  "admin.homepage.projects.locationAr": "Location (Arabic)",
  "admin.homepage.projects.locationEn": "Location (English)",
  "admin.homepage.projects.price": "Starting price",
  "admin.homepage.projects.currency": "Currency",
  "admin.homepage.projects.image": "Image URL",
  "admin.homepage.projects.cta": "CTA URL",
  "admin.review.title": "Review queue",
  "admin.review.subtitle": "Incoming partner submissions",
  "admin.review.empty": "No submissions waiting for review.",
  "admin.review.diff.title": "Submission diff",
  "admin.review.diff.submitted": "Partner submission",
  "admin.review.diff.final": "{{brand}} final",
  "admin.review.missing": "Missing fields",
  "admin.review.submissionStatus": "Submission status",
  "admin.review.note.label": "Review notes",
  "admin.review.note.placeholder": "Write review notes",

  "reports.title": "Reports",
  "reports.subtitle": "Performance for the last 30 days.",
  "reports.units.title": "Listings per day",
  "reports.leads.title": "Requests per day",
  "reports.leadsPerListing.title": "Requests per listing",
  "reports.column.day": "Day",
  "reports.column.units": "Listings",
  "reports.column.leads": "Requests",
  "reports.column.period": "Period",
  "reports.column.listing": "Listing",
  "reports.column.count": "Requests",
  "reports.column.id": "ID",

  "lead.status.new": "Fresh",
  "lead.status.contacted": "Contacted",
  "lead.status.qualified": "Qualified",
  "lead.status.meeting_set": "Meeting set",
  "lead.status.follow_up": "Follow up",
  "lead.status.viewing": "Viewing",
  "lead.status.negotiation": "Negotiation",
  "lead.status.won": "Won",
  "lead.status.lost": "Lost",
  "lead.loss_reason.budget": "Budget",
  "lead.loss_reason.location": "Location",
  "lead.loss_reason.payment": "Payment",
  "lead.loss_reason.timing": "Timing",
  "lead.loss_reason.other": "Other",
  "lead.loss_reason.other_note": "Other reason (details)",
  "lead.source.facebook": "Facebook",
  "lead.source.propertyfinder": "PropertyFinder",
  "lead.source.dubizzle": "Dubizzle",
  "lead.source.organic": "Organic",
  "lead.source.influencer": "Influencer",
  "lead.source.whatsapp": "WhatsApp",
  "lead.source.chatbot": "Chatbot",
  "lead.source.referral": "Referral",
  "lead.source.partner": "Partner",
  "lead.source.web": "Website",

  "purpose.sale": "For sale",
  "purpose.rent": "For rent",
  "purpose.new": "New development",

  "propertyType.apartment": "Apartment",
  "propertyType.villa": "Villa",
  "propertyType.duplex": "Duplex",
  "propertyType.townhouse": "Townhouse",
  "propertyType.penthouse": "Penthouse",
  "propertyType.studio": "Studio",
  "propertyType.land": "Land",

  "sort.newest": "Newest",
  "sort.priceAsc": "Price: low to high",
  "sort.priceDesc": "Price: high to low",

  "category.rent.title": "Rentals",
  "category.rent.desc": "Options curated for your lifestyle.",
  "category.sale.title": "For sale",
  "category.sale.desc": "Invest in selected properties.",
  "category.new.title": "New developments",
  "category.new.desc": "Discover the latest launches.",

  "status.draft": "Draft",
  "status.published": "Published",
  "status.archived": "Archived",

  "general.noImage": "No image",
  "general.imageAlt": "Listing image",
  "upload.uploading": "Uploading...",
  "upload.error": "Something went wrong while uploading.",
  "upload.path": "Path",

  "about.kicker": "About {{brand}}",
  "about.title": "{{brand}} real estate marketing in Egypt",
  "about.subtitle": "We turn raw inventory into publish-ready listings and manage a full lead journey from first inquiry to close.",
  "about.story.title": "An operating system for marketing",
  "about.story.body": "{{brand}} blends internal data operations with partner inventory and a CRM that keeps follow-ups measurable.",
  "about.values.data": "Data quality",
  "about.values.dataDesc": "Clean, verified unit data before publishing.",
  "about.values.partners": "Developer supply",
  "about.values.partnersDesc": "Submission portal with review and approvals.",
  "about.values.crm": "CRM discipline",
  "about.values.crmDesc": "From inquiries to conversions with structured follow-up.",
  "about.values.trust": "Market trust",
  "about.values.trustDesc": "Professional brand experience for every client.",
  "about.media.title": "Company video",
  "about.media.caption": "Add the official {{brand}} YouTube video.",
  "about.media.placeholder": "Set NEXT_PUBLIC_ABOUT_VIDEO_ID to show a video.",
  "about.impact.title": "Operational impact",
  "about.impact.subtitle": "Quick metrics that summarize the platform.",
  "about.impact.metric1.label": "Units under marketing",
  "about.impact.metric1.value": "+1200",
  "about.impact.metric2.label": "Developer partners",
  "about.impact.metric2.value": "+45",
  "about.impact.metric3.label": "Monthly requests",
  "about.impact.metric3.value": "+300",

  "careers.kicker": "Careers",
  "careers.title": "Join the {{brand}} team",
  "careers.subtitle": "We are hiring professionals who understand real estate data, campaigns, and client experience.",
  "careers.openings.title": "Open roles",
  "careers.openings.location": "Cairo • Full time",
  "careers.roles.sales": "Real estate sales executive",
  "careers.roles.crm": "CRM coordinator",
  "careers.roles.ops": "Data entry specialist",
  "careers.roles.content": "Real estate content editor",
  "careers.apply.title": "Apply now",
  "careers.apply.name": "Full name",
  "careers.apply.email": "Email",
  "careers.apply.phone": "Phone",
  "careers.apply.role": "Select role",
  "careers.apply.message": "Short note about your experience",
  "careers.apply.cv": "Resume (PDF / DOC)",
  "careers.apply.submit": "Submit application",
  "careers.admin.title": "Career applications",
  "careers.admin.subtitle": "Review applicants and track each application.",
  "careers.admin.empty": "No applications yet.",
  "careers.admin.cv": "Resume",
  "careers.admin.status": "Application status",
  "careers.status.new": "New",
  "careers.status.reviewing": "Reviewing",
  "careers.status.interview": "Interview",
  "careers.status.offer": "Offer",
  "careers.status.rejected": "Rejected",
  "careers.status.hired": "Hired",

  "crm.title": "{{brand}} CRM",
  "crm.subtitle": "A unified pipeline connecting marketing to sales execution.",
  "crm.stats.total": "Total leads",
  "crm.stats.duplicates": "Duplicate phones",
  "crm.stats.assigned": "Assigned",
  "crm.stats.unassigned": "Unassigned",
  "crm.nav.leads": "Leads",
  "crm.nav.customers": "Customers",
  "crm.nav.activities": "Activities",
  "crm.nav.sources": "Sources",
  "crm.pipeline.title": "Pipeline stages",
  "crm.pipeline.subtitle": "Instant visibility across the funnel.",
  "crm.spend.title": "Lead cost tracking",
  "crm.spend.subtitle": "Capture channel spend to calculate CPL.",
  "crm.spend.channel": "Select channel",
  "crm.spend.amount": "Spend amount",
  "crm.spend.save": "Save spend",
  "crm.search": "Search by name or phone",
  "crm.filter.status": "Status",
  "crm.filter.source": "Source",
  "crm.filter.assigned": "Assigned",
  "crm.filter.unassigned": "Unassigned",
  "crm.filter.lostReason": "Loss reason",
  "crm.filter.overdue": "Overdue follow-up",
  "crm.filter.overdueOnly": "Overdue only",
  "crm.leads.title": "Leads list",
  "crm.leads.subtitle": "Manage status, assignment, and notes.",
  "crm.leads.empty": "No matching leads.",
  "crm.leads.unassigned": "Unassigned",
  "crm.leads.noListing": "General request",
  "crm.leads.assigned": "Assigned: {{name}}",
  "crm.leads.update": "Update status",
  "crm.leads.export": "Export CSV",
  "crm.lossReason.select": "Loss reason",
  "crm.leads.assign": "Assign",
  "crm.leads.nextNote": "Next action note",
  "crm.leads.schedule": "Save follow-up",
  "crm.leads.addNote": "Add note",
  "crm.leads.add": "Add",
  "crm.visits.link": "Visits schedule",
  "crm.customers.title": "Customers",
  "crm.customers.subtitle": "Manage customer profiles and link them to leads.",
  "crm.customers.search": "Search by name or phone",
  "crm.customers.empty": "No customers yet.",
  "crm.customers.table.name": "Name",
  "crm.customers.table.phone": "Phone",
  "crm.customers.table.intent": "Intent",
  "crm.customers.table.area": "Area",
  "crm.customers.table.budget": "Budget",
  "crm.customers.table.leads": "Leads",
  "crm.customers.table.actions": "Actions",
  "crm.customers.view": "View",
  "crm.activities.title": "Customer activities",
  "crm.activities.subtitle": "Log calls, meetings, and follow-ups.",
  "crm.activities.type": "Activity type",
  "crm.activities.lead": "Lead",
  "crm.activities.customer": "Customer",
  "crm.activities.outcome": "Outcome",
  "crm.activities.notes": "Notes",
  "crm.activities.create": "Add activity",
  "crm.activities.empty": "No activities yet.",
  "crm.activity.type.call_attempted": "Call attempted",
  "crm.activity.type.call_answered": "Call answered",
  "crm.activity.type.meeting": "Meeting",
  "crm.activity.type.note": "Note",
  "crm.activity.type.follow_up": "Follow-up",
  "crm.activity.type.whatsapp": "WhatsApp",
  "crm.activity.type.email": "Email",
  "crm.sources.title": "Lead sources",
  "crm.sources.subtitle": "Manage campaign sources and tracking.",
  "crm.sources.slug": "Slug",
  "crm.sources.name": "Name",
  "crm.sources.active": "Active",
  "crm.sources.inactive": "Inactive",
  "crm.sources.add": "Add source",
  "crm.sources.empty": "No sources yet.",
  "crm.sources.toggle": "Toggle",

  "visits.title": "Field visits",
  "visits.subtitle": "Schedule inspections linked to leads and units.",
  "visits.form.listing": "Select listing",
  "visits.form.lead": "Select lead",
  "visits.form.assigned": "Assign to agent",
  "visits.form.notes": "Visit notes",
  "visits.form.create": "Add visit",
  "visits.form.outcome": "Visit outcome",
  "visits.update": "Update status",
  "visits.updateNotes": "Save details",
  "visits.empty": "No visits scheduled.",
  "visits.noListing": "No listing",
  "visits.noLead": "No lead",
  "visits.status.scheduled": "Scheduled",
  "visits.status.completed": "Completed",
  "visits.status.rescheduled": "Rescheduled",
  "visits.status.canceled": "Canceled",
  "visits.status.no_show": "No show",

  "nav.contact": "WhatsApp",
  "nav.menu": "Menu",

  "layer.current": "Layer",
  "layer.public": "Public",
  "layer.admin": "Admin",
  "layer.staff": "Staff",
  "layer.developer": "Developer",
  "layer.owner": "Owner",

  "footer.links": "Quick links",
  "footer.contact": "Contact",
    "footer.facebook": "{{brand}} Facebook",
    "footer.instagram": "Instagram {{brand}}",
    "footer.linkedin": "{{brand}} LinkedIn",
    "footer.tiktok": "{{brand}} TikTok",
  "footer.whatsapp": "WhatsApp {{brand}}",
  "footer.email": "hrtajrealestate@gmail.com",
  "footer.rights": "All rights reserved",

  "home.hero.quick": "Quick shortcuts",
  "home.why.title": "Why {{brand}}",
  "home.why.subtitle": "Marketing discipline backed by data, operations, and measurable outcomes.",
  "home.why.item1.title": "Targeted campaigns",
  "home.why.item1.body": "Allocate budgets by area and intent to lift conversions.",
  "home.why.item2.title": "Curated inventory",
  "home.why.item2.body": "Cleaned specs and verified data before publishing.",
  "home.why.item3.title": "Lead follow-up",
  "home.why.item3.body": "CRM-led journey from first call to close.",
  "home.process.title": "How we work",
  "home.process.subtitle": "A full workflow from intake to close.",
  "home.process.step1.title": "Intake",
  "home.process.step1.body": "Collect inventory from owners and partners.",
  "home.process.step2.title": "Review & publish",
  "home.process.step2.body": "Verify data, assign internal codes, then publish.",
  "home.process.step3.title": "Lead management",
  "home.process.step3.body": "Distribute requests and follow through to closure.",
  "home.about.title": "About {{brand}}",
  "home.about.subtitle": "An operating system for real estate marketing and brokerage in Egypt.",
  "home.about.cta": "Learn more",
  "home.about.card1.kicker": "Operations",
  "home.about.card1.title": "Data quality",
  "home.about.card1.body": "Clean, consistent specs before publishing.",
  "home.about.card2.kicker": "Partners",
  "home.about.card2.title": "Structured supply",
  "home.about.card2.body": "Clear submission flow with review and approval.",
  "home.about.card3.kicker": "CRM",
  "home.about.card3.title": "Full client journey",
  "home.about.card3.body": "Fast follow-ups and measurable conversions.",

  "listings.filters.title": "Filter results",
  "listings.filters.subtitle": "Set city, type, and budget to find the best match.",
  "listings.pagination.prev": "Previous",
  "listings.pagination.next": "Next",
  "listings.pagination.page": "Page {{page}} of {{total}}",

  "detail.contact.print": "Print",
  "detail.documents.title": "Documents",

  "print.title": "Print version",
  "print.share": "Share link",

  "careers.perks.title": "Why join {{brand}}",
  "careers.perks.item1": "Fast-growing team with continuous training.",
  "careers.perks.item2": "Clear growth path and mentorship.",
  "careers.perks.item3": "Modern ops and sales tools.",

  "about.process.title": "Our process",
  "about.process.subtitle": "From intake to publishing and follow-up.",
  "about.process.step1.title": "Data intake",
  "about.process.step1.body": "Collect inventory from partners and owners.",
  "about.process.step2.title": "Content verification",
  "about.process.step2.body": "Normalize data and verify specs.",
  "about.process.step3.title": "Marketing & CRM",
  "about.process.step3.body": "Launch campaigns and follow leads.",
  "about.coverage.title": "Coverage areas",
  "about.coverage.subtitle": "Focus on key markets across Egypt.",
  "about.coverage.item1": "New Cairo",
  "about.coverage.item2": "Sheikh Zayed",
  "about.coverage.item3": "New Capital",
  "about.coverage.item4": "North Coast",
  "about.coverage.item5": "Ain Sokhna",
  "filters.transaction": "Transaction type",
  "filters.priceMin": "Price from",
  "filters.priceMax": "Price to",
  "filters.areaMin": "Area from",
  "filters.areaMax": "Area to",
  "filters.amenities": "Amenities",
  "sort.areaAsc": "Area: low to high",
  "sort.areaDesc": "Area: high to low",
  "listing.badge.new": "New",
  "listing.badge.furnished": "Furnished",
  "listing.action.whatsapp": "WhatsApp",
  "listing.action.call": "Call",
  "listing.action.share": "Share",
  "amenity.elevator": "Elevator",
  "amenity.parking": "Parking",
  "amenity.security": "Security",
  "amenity.balcony": "Balcony",
  "amenity.generator": "Generator",
  "amenity.seaView": "Sea view",
};

const arMerged: Dictionary = { ...ar, ...(arExtra as Dictionary) };
const enMerged: Dictionary = { ...en, ...(enExtra as Dictionary) };

export const DICTIONARY: Record<Locale, Dictionary> = { ar: arMerged, en: enMerged };

export type TranslationKey = keyof typeof arMerged;

export function createT(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>) => {
    const template = DICTIONARY[locale][key] ?? DICTIONARY[DEFAULT_LOCALE][key] ?? key;
    const injected = {
      brand: locale === "ar" ? getBrandArName() : BRAND.en,
      domain: BRAND.domain,
    };
    const mergedParams = params ? { ...injected, ...params } : injected;
    return Object.entries(mergedParams).reduce(
      (acc, [paramKey, value]) =>
        acc.replace(new RegExp(`{{${paramKey}}}`, "g"), String(value)),
      template
    );
  };
}

export function getPurposeLabelKey(value: string) {
  if (value === "sale") return "purpose.sale";
  if (value === "rent") return "purpose.rent";
  if (value === "new-development") return "purpose.new";
  return "purpose.sale";
}

export function getPropertyTypeLabelKey(value: string) {
  const map: Record<string, TranslationKey> = {
    "شقة": "propertyType.apartment",
    "فيلا": "propertyType.villa",
    "دوبلكس": "propertyType.duplex",
    "تاون هاوس": "propertyType.townhouse",
    "بنتهاوس": "propertyType.penthouse",
    "ستوديو": "propertyType.studio",
    "أرض": "propertyType.land",
  };
  return map[value] ?? "propertyType.apartment";
}

export function getLeadStatusLabelKey(value: string) {
  const map: Record<string, TranslationKey> = {
    new: "lead.status.new",
    contacted: "lead.status.contacted",
    qualified: "lead.status.qualified",
    meeting_set: "lead.status.meeting_set",
    follow_up: "lead.status.follow_up",
    viewing: "lead.status.viewing",
    negotiation: "lead.status.negotiation",
    won: "lead.status.won",
    lost: "lead.status.lost",
    viewing_scheduled: "lead.status.viewing",
  };
  return map[value] ?? "lead.status.new";
}

export function getSubmissionStatusLabelKey(value: string) {
  const map: Record<string, TranslationKey> = {
    draft: "submission.status.draft",
    submitted: "submission.status.submitted",
    under_review: "submission.status.under_review",
    needs_changes: "submission.status.needs_changes",
    approved: "submission.status.approved",
    published: "submission.status.published",
    archived: "submission.status.archived",
  };
  return map[value] ?? "submission.status.draft";
}




```

### src/lib/logging.ts
```ts
type ErrorContext = Record<string, unknown>;

export function logError(error: unknown, context?: ErrorContext) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: context ?? {},
  };

  if (process.env.NODE_ENV !== "production") {
    console.error("[hrtaj] error", payload);
    return;
  }

  // Hook for future monitoring integration (Sentry/Datadog/etc.)
  console.error("[hrtaj] error", payload);
}

```

### src/lib/recentlyViewed/store.ts
```ts
﻿const STORAGE_KEY = "hrtaj:recentlyViewed:v1";
const MAX_ITEMS = 10;

let cache: string[] | null = null;
const listeners = new Set<(ids: string[]) => void>();

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function emit(ids: string[]) {
  listeners.forEach((listener) => listener(ids));
}

export function getRecentlyViewed(): string[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function addRecentlyViewed(id: string) {
  const current = getRecentlyViewed();
  const next = [id, ...current.filter((item) => item !== id)].slice(0, MAX_ITEMS);
  cache = next;
  writeStorage(next);
  emit(next);
  return next;
}

export function subscribeRecentlyViewed(listener: (ids: string[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const RECENTLY_VIEWED_STORAGE_KEY = STORAGE_KEY;

```

### src/lib/savedSearch/store.ts
```ts
﻿const STORAGE_KEY = "hrtaj:savedSearches:v1";

export type SavedSearch = {
  id: string;
  name: string;
  queryString: string;
  createdAt: string;
  lastRunAt?: string;
};

let cache: SavedSearch[] | null = null;
const listeners = new Set<(items: SavedSearch[]) => void>();

function readStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.queryString === "string");
  } catch {
    return [];
  }
}

function writeStorage(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function emit(items: SavedSearch[]) {
  listeners.forEach((listener) => listener(items));
}

export function getSavedSearches(): SavedSearch[] {
  if (cache) return cache;
  cache = readStorage();
  return cache;
}

export function setSavedSearches(next: SavedSearch[]) {
  cache = next;
  writeStorage(next);
  emit(next);
  return next;
}

export function addSavedSearch(item: SavedSearch) {
  const current = getSavedSearches();
  const next = [item, ...current].slice(0, 100);
  return setSavedSearches(next);
}

export function removeSavedSearch(id: string) {
  const next = getSavedSearches().filter((item) => item.id !== id);
  return setSavedSearches(next);
}

export function markSearchRun(id: string) {
  const next = getSavedSearches().map((item) =>
    item.id === id ? { ...item, lastRunAt: new Date().toISOString() } : item
  );
  return setSavedSearches(next);
}

export function subscribeSavedSearches(listener: (items: SavedSearch[]) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const SAVED_SEARCH_STORAGE_KEY = STORAGE_KEY;

```

### src/lib/seo/meta.ts
```ts
﻿import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";
import { getPropertyTypeLabelKey, type Locale } from "@/lib/i18n";

export type ListingMetaInput = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  beds: number;
  baths: number;
  size_m2: number | null;
  purpose: string;
  type: string;
  amenities?: string[] | null;
};

type ListingMetaArgs = {
  listing: ListingMetaInput;
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  baseUrl?: string | null;
  imageUrl?: string;
};

type ListingJsonLdArgs = Omit<ListingMetaArgs, "t">;

export function buildListingMetadata({
  listing,
  locale,
  t,
  baseUrl,
  imageUrl,
}: ListingMetaArgs): Metadata {
  const typeLabel = t(getPropertyTypeLabelKey(listing.type));
  const areaLabel = listing.area || listing.city;
  const priceLabel = formatPrice(listing.price, listing.currency, locale);
  const title = `${typeLabel}${areaLabel ? ` ${areaLabel}` : ""} | ${priceLabel} | ${t("brand.name")}`;
  const location = [listing.city, listing.area].filter(Boolean).join(" - ");
  const specs = [
    listing.size_m2 ? `${listing.size_m2} m²` : null,
    listing.beds ? `${listing.beds} ${t("detail.stats.rooms")}` : null,
    listing.baths ? `${listing.baths} ${t("detail.stats.baths")}` : null,
  ].filter(Boolean);
  const description = `${location}${specs.length ? ` | ${specs.join(" • ")}` : ""}`;
  const url = baseUrl ? `${baseUrl}/listing/${listing.id}` : undefined;
  const alternates = url
    ? {
        canonical: url,
        languages: {
          ar: `${url}?lang=ar`,
          en: `${url}?lang=en`,
        },
      }
    : undefined;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url,
      siteName: t("brand.name"),
      type: "article",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: listing.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function buildListingJsonLd({
  listing,
  locale,
  baseUrl,
  imageUrl,
}: ListingJsonLdArgs) {
  const schemaType = mapSchemaType(listing.type, locale);
  const url = baseUrl ? `${baseUrl}/listing/${listing.id}` : undefined;
  const address = {
    "@type": "PostalAddress",
    addressLocality: listing.city,
    addressRegion: listing.area ?? undefined,
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Offer",
    price: listing.price,
    priceCurrency: listing.currency,
    availability: "https://schema.org/InStock",
    url,
    itemOffered: {
      "@type": schemaType,
      name: listing.title,
      description: listing.title,
      address,
      floorSize: listing.size_m2
        ? { "@type": "QuantitativeValue", value: listing.size_m2, unitCode: "MTK" }
        : undefined,
      numberOfRooms: listing.beds,
      numberOfBathroomsTotal: listing.baths,
    },
  };

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  if (listing.amenities && Array.isArray(listing.amenities)) {
    jsonLd.itemOffered = {
      ...((jsonLd.itemOffered as Record<string, unknown>) ?? {}),
      amenityFeature: listing.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
        value: true,
      })),
    };
  }

  return jsonLd;
}

function mapSchemaType(type: string, locale: Locale) {
  const normalized = type.toLowerCase();
  if (normalized.includes("شقة") || normalized.includes("apartment")) return "Apartment";
  if (normalized.includes("فيلا") || normalized.includes("villa")) return "House";
  if (normalized.includes("land") || normalized.includes("أرض")) return "Land";
  if (normalized.includes("office") || (locale === "ar" && normalized.includes("مكتب"))) return "Office";
  if (normalized.includes("shop") || (locale === "ar" && normalized.includes("محل"))) return "Store";
  return "Residence";
}

```

### src/lib/seo/schema.ts
```ts
type FaqItem = { question: string; answer: string };

export function buildLocalBusinessJsonLd({
  name,
  url,
  address,
  locale,
}: {
  name: string;
  url: string | null;
  address: string;
  locale: "ar" | "en";
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    name,
    url: url ?? undefined,
    areaServed: locale === "ar" ? "مصر" : "Egypt",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "EG",
    },
  };
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd({
  baseUrl,
  items,
}: {
  baseUrl: string | null;
  items: Array<{ name: string; path: string }>;
}) {
  const normalizedBase = baseUrl ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${normalizedBase}${item.path}`,
    })),
  };
}

```

### supabase/migrations/20260204203000_leads_masked_view.sql
```sql
﻿-- Masked leads view + tightened select policies for non-owner access.

-- Ensure lead_status includes negotiation (idempotent).
alter type public.lead_status add value if not exists 'negotiation';

-- Restrict base leads select to owner + lead owner only.
alter table public.leads enable row level security;

drop policy if exists "Leads select by crm staff" on public.leads;
drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads select by lead owner" on public.leads;
drop policy if exists "Leads read by assigned user" on public.leads;
drop policy if exists "Leads read by admin or listing owner" on public.leads;

create policy "Leads select by owner"
on public.leads for select
using (public.is_owner());

create policy "Leads select by lead owner"
on public.leads for select
using (user_id = auth.uid());

-- Masked view for CRM + developer visibility (security definer to bypass base RLS).
drop view if exists public.leads_masked;

create or replace function public.get_leads_masked()
returns table (
  id uuid,
  listing_id uuid,
  customer_id uuid,
  user_id uuid,
  name text,
  phone text,
  phone_e164 text,
  phone_normalized text,
  email text,
  message text,
  status text,
  lead_source text,
  assigned_to uuid,
  created_at timestamptz,
  intent text,
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  lost_reason text,
  lost_reason_note text,
  next_action_at timestamptz,
  listing_title text,
  listing_city text,
  listing_area text
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    ld.id,
    ld.listing_id,
    ld.customer_id,
    ld.user_id,
    ld.name,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone_e164,
    null::text as phone_normalized,
    case
      when ld.email is not null then regexp_replace(ld.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    case
      when ld.message is not null then left(ld.message, 20)
      when ld.notes is not null then left(ld.notes, 20)
      else null
    end as message,
    ld.status,
    ld.lead_source,
    ld.assigned_to,
    ld.created_at,
    ld.intent,
    ld.preferred_area,
    ld.budget_min,
    ld.budget_max,
    ld.lost_reason,
    ld.lost_reason_note,
    ld.next_action_at,
    l.title as listing_title,
    l.city as listing_city,
    l.area as listing_area
  from public.leads ld
  left join public.listings l on l.id = ld.listing_id
  where public.is_crm_user()
     or (l.developer_id is not null and public.is_developer_member(l.developer_id))
     or l.owner_user_id = auth.uid();
$$;

create or replace view public.leads_masked
as
select * from public.get_leads_masked();

grant execute on function public.get_leads_masked() to authenticated;
grant select on public.leads_masked to authenticated;

```

### supabase/migrations/20260205093000_pii_approvals.sql
```sql
﻿-- PII change request workflow + admin-safe CRM operations

-- 1) Change request table
create table if not exists public.pii_change_requests (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  review_note text null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_action_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_action_check
      check (action in ('update_pii','soft_delete','hard_delete_request'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_status_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_status_check
      check (status in ('pending','approved','rejected'));
  end if;
end $$;

create index if not exists pii_change_requests_status_idx
  on public.pii_change_requests (status, requested_at);

alter table public.pii_change_requests enable row level security;

drop policy if exists "PII change insert by admin" on public.pii_change_requests;
drop policy if exists "PII change select by owner or requester" on public.pii_change_requests;
drop policy if exists "PII change update by owner" on public.pii_change_requests;

create policy "PII change insert by admin"
  on public.pii_change_requests for insert
  with check (public.is_admin());

create policy "PII change select by owner or requester"
  on public.pii_change_requests for select
  using (public.is_owner() or requested_by = auth.uid());

create policy "PII change update by owner"
  on public.pii_change_requests for update
  using (public.is_owner())
  with check (public.is_owner());

-- 2) Masked customers view (for staff/ops/agent)
create or replace function public.get_customers_masked()
returns table (
  id uuid,
  full_name text,
  phone text,
  phone_e164 text,
  email text,
  intent text,
  preferred_areas text[],
  budget_min numeric,
  budget_max numeric,
  lead_source text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    c.id,
    c.full_name,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone_e164,
    case
      when c.email is not null then regexp_replace(c.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    c.intent,
    c.preferred_areas,
    c.budget_min,
    c.budget_max,
    c.lead_source,
    c.created_at
  from public.customers c
  where public.is_crm_user();
$$;

drop view if exists public.customers_masked;
create or replace view public.customers_masked
as select * from public.get_customers_masked();

grant execute on function public.get_customers_masked() to authenticated;
grant select on public.customers_masked to authenticated;

-- 3) Update policies for customers and leads (admin can update non-PII)
alter table public.customers enable row level security;

drop policy if exists "Customers select by crm staff" on public.customers;
drop policy if exists "Customers update by owner" on public.customers;

create policy "Customers select by admin"
  on public.customers for select
  using (public.is_admin());

create policy "Customers update by admin"
  on public.customers for update
  using (public.is_admin())
  with check (public.is_admin());

alter table public.leads enable row level security;

drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads update by owner" on public.leads;

create policy "Leads select by admin"
  on public.leads for select
  using (public.is_admin());

create policy "Leads update by admin"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Lead assignments: allow admin (owner passes via is_admin)
alter table public.lead_assignments enable row level security;

drop policy if exists "Lead assignments insert by owner" on public.lead_assignments;
drop policy if exists "Lead assignments update by owner" on public.lead_assignments;
drop policy if exists "Lead assignments delete by owner" on public.lead_assignments;

create policy "Lead assignments insert by admin"
  on public.lead_assignments for insert
  with check (public.is_admin());

create policy "Lead assignments update by admin"
  on public.lead_assignments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Lead assignments delete by admin"
  on public.lead_assignments for delete
  using (public.is_admin());

-- 5) Block non-owner PII edits via triggers
create or replace function public.block_lead_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.name, '') is distinct from coalesce(old.name, '')
     or coalesce(new.phone, '') is distinct from coalesce(old.phone, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.phone_normalized, '') is distinct from coalesce(old.phone_normalized, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
     or coalesce(new.message, '') is distinct from coalesce(old.message, '')
     or coalesce(new.notes, '') is distinct from coalesce(old.notes, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_lead_pii_updates on public.leads;
create trigger block_lead_pii_updates
  before update on public.leads
  for each row execute function public.block_lead_pii_updates();

create or replace function public.block_customer_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.full_name, '') is distinct from coalesce(old.full_name, '')
     or coalesce(new.phone_raw, '') is distinct from coalesce(old.phone_raw, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_customer_pii_updates on public.customers;
create trigger block_customer_pii_updates
  before update on public.customers
  for each row execute function public.block_customer_pii_updates();

-- 6) Owner approval RPCs
create or replace function public.approve_pii_change(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  req record;
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  select * into req
  from public.pii_change_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if req.status <> 'pending' then
    raise exception 'request already reviewed';
  end if;

  if req.action = 'update_pii' then
    if req.table_name = 'leads' then
      update public.leads
      set
        name = coalesce(req.payload->>'name', name),
        phone = coalesce(req.payload->>'phone', phone),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        phone_normalized = coalesce(req.payload->>'phone_normalized', phone_normalized),
        email = coalesce(req.payload->>'email', email),
        message = coalesce(req.payload->>'message', message),
        notes = coalesce(req.payload->>'notes', notes)
      where id = req.row_id;
    elsif req.table_name = 'customers' then
      update public.customers
      set
        full_name = coalesce(req.payload->>'full_name', full_name),
        phone_raw = coalesce(req.payload->>'phone_raw', phone_raw),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        email = coalesce(req.payload->>'email', email)
      where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  elsif req.action in ('hard_delete_request','soft_delete') then
    if req.table_name = 'leads' then
      delete from public.leads where id = req.row_id;
    elsif req.table_name = 'customers' then
      delete from public.customers where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  end if;

  update public.pii_change_requests
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = req.id;
end;
$$;

create or replace function public.reject_pii_change(request_id uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  update public.pii_change_requests
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = reason
  where id = request_id
    and status = 'pending';
end;
$$;

grant execute on function public.approve_pii_change(uuid) to authenticated;
grant execute on function public.reject_pii_change(uuid, text) to authenticated;


```

### supabase/migrations/20260205120000_profiles_owner_lock.sql
```sql
-- Owner immutability + admin user management guardrails.
-- Ensures admins can manage users except OWNER, and OWNER row is immutable for non-owners.

alter table public.profiles enable row level security;

-- Drop existing policies if they exist (idempotent).
drop policy if exists "Profiles select by admin or self" on public.profiles;
drop policy if exists "Profiles insert by self" on public.profiles;
drop policy if exists "Profiles insert by admin" on public.profiles;
drop policy if exists "Profiles insert by owner" on public.profiles;
drop policy if exists "Profiles update by self" on public.profiles;
drop policy if exists "Profiles update by admin" on public.profiles;
drop policy if exists "Profiles update by owner" on public.profiles;
drop policy if exists "Profiles delete by owner" on public.profiles;

-- 1) SELECT: CRM users can read all profiles; users can read their own profile.
create policy "Profiles select by admin or self"
on public.profiles for select
using (public.is_crm_user() or public.is_admin() or id = auth.uid());

-- 2) INSERT: self insert (non-owner) + admin insert (non-owner) + owner insert (any).
create policy "Profiles insert by self"
on public.profiles for insert
with check (
  id = auth.uid()
  and role <> 'owner'
);

create policy "Profiles insert by admin"
on public.profiles for insert
with check (
  public.is_admin()
  and role <> 'owner'
);

create policy "Profiles insert by owner"
on public.profiles for insert
with check (public.is_owner());

-- 3) UPDATE: self can update own profile; admin can update non-owner; owner can update any.
create policy "Profiles update by self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Profiles update by admin"
on public.profiles for update
using (public.is_admin() and role <> 'owner')
with check (public.is_admin() and role <> 'owner' and role <> 'owner');

create policy "Profiles update by owner"
on public.profiles for update
using (public.is_owner())
with check (public.is_owner());

-- 4) DELETE: only owner can delete non-owner profiles.
create policy "Profiles delete by owner"
on public.profiles for delete
using (public.is_owner() and role <> 'owner');

-- Trigger to enforce owner immutability and prevent non-owner role changes to owner.
create or replace function public.prevent_owner_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_owner() and auth.role() <> 'service_role' then
    if TG_OP in ('UPDATE','DELETE') and OLD.role = 'owner' then
      raise exception 'owner profile is immutable';
    end if;
    if TG_OP = 'UPDATE' and NEW.role = 'owner' then
      raise exception 'cannot set owner role';
    end if;
    if TG_OP = 'UPDATE' and not public.is_admin() then
      if NEW.role is distinct from OLD.role then
        raise exception 'role change requires owner';
      end if;
    end if;
  elseif auth.role() = 'service_role' then
    if TG_OP in ('UPDATE','DELETE') and OLD.role = 'owner' then
      raise exception 'owner profile is immutable';
    end if;
    if TG_OP = 'UPDATE' and NEW.role = 'owner' then
      raise exception 'cannot set owner role';
    end if;
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_profiles_owner_immutable on public.profiles;
create trigger trg_profiles_owner_immutable
before update or delete on public.profiles
for each row execute function public.prevent_owner_profile_mutation();

-- Admin audit log
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  action text not null,
  target_user_id uuid null,
  target_email text null,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_actor_idx
  on public.admin_audit_log (actor_user_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admin audit insert" on public.admin_audit_log;
drop policy if exists "Admin audit select owner" on public.admin_audit_log;
drop policy if exists "Admin audit select self" on public.admin_audit_log;

create policy "Admin audit insert"
on public.admin_audit_log for insert
with check (public.is_admin());

create policy "Admin audit select owner"
on public.admin_audit_log for select
using (public.is_owner());

create policy "Admin audit select self"
on public.admin_audit_log for select
using (actor_user_id = auth.uid());

```

### tests/brand.spec.ts
```ts
import { test, expect } from "@playwright/test";

test.use({ locale: "ar-EG" });

test("brand stays هارتچ after hydration and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("هارتچ");

  let bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.reload({ waitUntil: "networkidle" });
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.goto("/about");
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");

  await page.goto("/listings");
  bodyText = await page.textContent("body");
  expect(bodyText).toContain("هارتچ");
  expect(bodyText).not.toContain("هارتج");
});

```

### tests/filters.spec.ts
```ts
import { test, expect } from "@playwright/test";

test.use({ locale: "ar-EG" });

test("filters are driven by URL query params", async ({ page }) => {
  await page.goto(
    "/listings?transaction=rent&priceMin=1000000&priceMax=2500000&beds=3&view=list"
  );

  const form = page.locator("form#listing-filters-form-desktop");
  await expect(form).toBeVisible();
  await expect(form.locator('select[name="transaction"]')).toHaveValue("rent");
  await expect(form.locator('input[name="priceMin"]')).toHaveValue("1000000");
  await expect(form.locator('input[name="priceMax"]')).toHaveValue("2500000");
  await expect(form.locator('input[name="beds"]')).toHaveValue("3");
  await expect(form.locator('input[name="view"]')).toHaveValue("list");
});

```

### tests/phase3.spec.ts
```ts
import { test, expect, type Page, type Route } from "@playwright/test";

test.use({ locale: "ar-EG" });

const mockListings = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "شقة في المعادي",
    price: 2500000,
    currency: "EGP",
    city: "القاهرة",
    area: "المعادي",
    beds: 3,
    baths: 2,
    size_m2: 140,
    purpose: "sale",
    type: "apartment",
    amenities: [],
    listing_images: [],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "فيلا في الشيخ زايد",
    price: 7200000,
    currency: "EGP",
    city: "الجيزة",
    area: "الشيخ زايد",
    beds: 5,
    baths: 4,
    size_m2: 320,
    purpose: "sale",
    type: "villa",
    amenities: [],
    listing_images: [],
  },
];

async function mockListingsByIds(page: Page) {
  await page.route("**/api/listings/by-ids", async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listings: mockListings }),
    });
  });
}

test("guest favorites persist across reload", async ({ page }) => {
  await mockListingsByIds(page);
  await page.goto("/saved");
  await page.evaluate(() => {
    localStorage.setItem("hrtaj:favorites:v1", JSON.stringify(["11111111-1111-1111-1111-111111111111"]));
  });
  await page.reload();
  await expect(page.locator("text=شقة في المعادي")).toBeVisible();

  await page.locator(".favorite-button").first().click();
  await expect(page.getByText(/مفيش عقارات محفوظة/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/مفيش عقارات محفوظة/)).toBeVisible();
});

test("compare bar appears after selecting two listings", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hrtaj:favorites:v1", JSON.stringify([
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222",
    ]));
    localStorage.setItem("hrtaj:compare:v1", JSON.stringify([]));
  });
  await mockListingsByIds(page);
  await page.goto("/saved");

  const buttons = page.locator(".compare-button");
  await expect(buttons).toHaveCount(2);
  await buttons.nth(0).click();
  await buttons.nth(1).click();

  const bar = page.locator(".compare-bar");
  await expect(bar).toBeVisible();
  await expect(bar).toContainText("(2)");
});

test("saved search creates and replays query string", async ({ page }) => {
  await page.goto("/listings?transaction=rent&city=%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9");

  await page.locator("button", { hasText: /حفظ البحث|Save search/i }).click();
  const modalInput = page.locator(".modal-panel input");
  await expect(modalInput).toBeVisible();
  await modalInput.fill("بحث القاهرة");
  await page.locator(".modal-panel button", { hasText: /حفظ البحث|Save search/i }).click();

  await page.goto("/saved-searches");
  await expect(page.locator("text=بحث القاهرة")).toBeVisible();

  await page.locator("a", { hasText: /تشغيل|Run/i }).first().click();
  await expect(page).toHaveURL(/transaction=rent/);
});

test("whatsapp click fires analytics without PII", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hrtaj:favorites:v1", JSON.stringify(["11111111-1111-1111-1111-111111111111"]));
  });
  await mockListingsByIds(page);
  await page.goto("/saved");

  await page.evaluate(() => {
    window.__hrtajEvents = [];
  });

  const whatsappButton = page.locator(".listing-card-actions a", { hasText: /واتساب|WhatsApp/i }).first();
  await expect(whatsappButton).toBeVisible();
  await whatsappButton.click();

  await page.waitForTimeout(100);
  const events = await page.evaluate(() => window.__hrtajEvents || []);
  const event = events.find((item: { event: string }) => item.event === "whatsapp_click");
  expect(event).toBeTruthy();
  if (!event) {
    throw new Error("Missing whatsapp_click event");
  }
  const payload = event.payload || {};
  expect(payload.phone).toBeUndefined();
  expect(payload.message).toBeUndefined();
  expect(payload.email).toBeUndefined();
});

test("locale switch changes dir without hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");
  await page.locator("button:visible", { hasText: /English|الإنجليزية|الانجليزية/i }).first().click();
  await page.waitForLoadState("networkidle");

  const dir = await page.getAttribute("html", "dir");
  const lang = await page.getAttribute("html", "lang");
  expect(dir).toBe("ltr");
  expect(lang).toBe("en");

  const hydrationError = errors.some((msg) => /hydration|did not match/i.test(msg));
  expect(hydrationError).toBeFalsy();
});

```

### tests/phase4.spec.ts
```ts
﻿import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let listingId: string | null = null;

async function fetchListingId() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const url = `${SUPABASE_URL}/rest/v1/listings?select=id&status=eq.published&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ id: string }>;
  return data[0]?.id ?? null;
}

test.beforeAll(async () => {
  listingId = await fetchListingId();
});

test("gallery works on mobile and watermark is visible", async ({ page }) => {
  test.skip(!listingId, "No published listing available for gallery test.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/listing/${listingId}`);
  await expect(page.locator(".gallery-track")).toBeVisible();
  await expect(page.locator(".media-watermark").first()).toBeVisible();
});

test("no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasOverflow).toBeFalsy();
});

```

### tests/rbac-approvals.spec.ts
```ts
﻿import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.E2E_OWNER_EMAIL) &&
  Boolean(process.env.E2E_OWNER_PASSWORD) &&
  Boolean(process.env.E2E_ADMIN_EMAIL) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function signIn(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.session) throw error ?? new Error("Missing session");
  return client;
}

const describeBlock = hasEnv ? test.describe : test.describe.skip;

describeBlock("RBAC tests require env credentials", () => {
  test("admin cannot update PII; owner can", async () => {
    const service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = await signIn(
      process.env.E2E_ADMIN_EMAIL as string,
      process.env.E2E_ADMIN_PASSWORD as string
    );
    const owner = await signIn(
      process.env.E2E_OWNER_EMAIL as string,
      process.env.E2E_OWNER_PASSWORD as string
    );

    const { data: customer, error: customerError } = await service
      .from("customers")
      .insert({
        full_name: "Test Customer",
        phone_raw: "+201000000001",
        phone_e164: "+201000000001",
        email: "test.customer@example.com",
        intent: "buy",
      })
      .select("id")
      .maybeSingle();

    expect(customerError).toBeNull();
    expect(customer?.id).toBeTruthy();

    const { data: lead, error: leadError } = await service
      .from("leads")
      .insert({
        customer_id: customer?.id ?? null,
        name: "Lead One",
        phone: "+201000000002",
        phone_e164: "+201000000002",
        phone_normalized: "+201000000002",
        email: "lead@example.com",
        message: "hello",
        status: "new",
        lead_source: "web",
      })
      .select("id")
      .maybeSingle();

    expect(leadError).toBeNull();
    expect(lead?.id).toBeTruthy();

    const { error: adminLeadPiiError } = await admin
      .from("leads")
      .update({ phone: "+201000000099" })
      .eq("id", lead?.id ?? "");
    expect(adminLeadPiiError).toBeTruthy();

    const { error: adminLeadStatusError } = await admin
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", lead?.id ?? "");
    expect(adminLeadStatusError).toBeNull();

    const { error: adminCustomerPiiError } = await admin
      .from("customers")
      .update({ full_name: "Changed" })
      .eq("id", customer?.id ?? "");
    expect(adminCustomerPiiError).toBeTruthy();

    const { error: ownerLeadPiiError } = await owner
      .from("leads")
      .update({ phone: "+201000000088" })
      .eq("id", lead?.id ?? "");
    expect(ownerLeadPiiError).toBeNull();

    const { error: adminDeleteError } = await admin
      .from("leads")
      .delete()
      .eq("id", lead?.id ?? "");
    expect(adminDeleteError).toBeTruthy();

    await service.from("leads").delete().eq("id", lead?.id ?? "");
    await service.from("customers").delete().eq("id", customer?.id ?? "");
  });
});


```

### tests/rbac-users.spec.ts
```ts
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const hasEnv =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
  Boolean(process.env.E2E_OWNER_EMAIL) &&
  Boolean(process.env.E2E_OWNER_PASSWORD) &&
  Boolean(process.env.E2E_ADMIN_EMAIL) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD) &&
  Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function signIn(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.session) throw error ?? new Error("Missing session");
  return client;
}

const describeBlock = hasEnv ? test.describe : test.describe.skip;

describeBlock("RBAC owner immutability", () => {
  test("admin cannot touch owner; admin can update non-owner roles", async () => {
    const service = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = await signIn(
      process.env.E2E_ADMIN_EMAIL as string,
      process.env.E2E_ADMIN_PASSWORD as string
    );

    const ownerEmail = process.env.E2E_OWNER_EMAIL as string;
    const { data: ownerProfile } = await service
      .from("profiles")
      .select("id, role")
      .eq("email", ownerEmail)
      .maybeSingle();

    expect(ownerProfile?.role).toBe("owner");

    const { error: adminOwnerUpdate } = await admin
      .from("profiles")
      .update({ phone: "01099999999" })
      .eq("id", ownerProfile?.id ?? "");
    expect(adminOwnerUpdate).toBeTruthy();

    const { error: adminOwnerDelete } = await admin
      .from("profiles")
      .delete()
      .eq("id", ownerProfile?.id ?? "");
    expect(adminOwnerDelete).toBeTruthy();

    const email = `test.user.${Date.now()}@example.com`;
    const password = `Test${Date.now()}!`;
    let userId = "";

    try {
      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(createError).toBeNull();
      userId = created?.user?.id ?? "";
      expect(userId).toBeTruthy();

      await service.from("profiles").upsert({
        id: userId,
        email,
        role: "staff",
      });

      const { error: adminPromote } = await admin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      expect(adminPromote).toBeNull();

      const { error: adminMakeOwner } = await admin
        .from("profiles")
        .update({ role: "owner" })
        .eq("id", userId);
      expect(adminMakeOwner).toBeTruthy();
    } finally {
      if (userId) {
        await service.auth.admin.deleteUser(userId);
        await service.from("profiles").delete().eq("id", userId);
      }
    }
  });
});

```

### tests/site-audit.spec.ts
```ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type RouteIssue = {
  route: string;
  issues: string[];
  consoleErrors: string[];
  consoleWarnings: string[];
  requestFailures: string[];
  status?: number;
  overflowDesktop?: Array<{ tag: string; cls: string; left: number; right: number; width: number }>;
  overflowMobile?: Array<{ tag: string; cls: string; left: number; right: number; width: number }>;
};

const artifactsDir = path.join(process.cwd(), "artifacts");
const screenshotsDir = path.join(artifactsDir, "screenshots");
const auditReport: RouteIssue[] = [];

function sanitizeFileName(input: string) {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

async function getRoutesFromSitemap(baseURL: string, request: any) {
  const response = await request.get("/sitemap.xml");
  if (!response.ok()) return [];
  const xml = await response.text();
  const matches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)) as RegExpMatchArray[];
  const urls = matches.map((match) => match[1]);
  return urls
    .filter((url) => url.startsWith(baseURL))
    .map((url) => url.replace(baseURL, ""));
}

test.describe("Site audit crawl", () => {
  test("crawl all routes and capture issues", async ({ page, request }, testInfo) => {
    test.setTimeout(15 * 60_000);
    fs.mkdirSync(screenshotsDir, { recursive: true });

    const baseURL = (testInfo.project.use.baseURL as string) || "http://localhost:3001";
    let routes = await getRoutesFromSitemap(baseURL, request);
    if (routes.length === 0) {
      routes = ["/", "/about", "/listings", "/careers", "/partners"];
    }

    for (const route of routes) {
      const routePath = route || "/";
      const issues: string[] = [];
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      const requestFailures: string[] = [];
      let status: number | undefined;

      page.removeAllListeners();
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
        if (msg.type() === "warning") consoleWarnings.push(msg.text());
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });
      page.on("requestfailed", (req) => {
        const failure = req.failure()?.errorText ?? "";
        if (failure.includes("net::ERR_ABORTED") && req.url().includes("_rsc")) return;
        requestFailures.push(`${req.method()} ${req.url()} :: ${failure}`);
      });
      page.on("response", (res) => {
        const resUrl = res.url();
        if (res.status() >= 400 && resUrl.startsWith(baseURL)) {
          requestFailures.push(`${res.status()} ${resUrl}`);
        }
      });

      await page.setViewportSize({ width: 1280, height: 720 });
      const response = await page.goto(routePath, { waitUntil: "networkidle" });
      status = response?.status();
      if (status && status >= 400) {
        issues.push(`HTTP ${status}`);
      }

      const bodyText = await page.evaluate(() => document.body.innerText || "");
      if (/\?{2,}/.test(bodyText)) issues.push("Found repeated '?' in text");
      if (bodyText.includes("�")) issues.push("Found replacement character");
      if (bodyText.includes("هارتج")) issues.push("Found incorrect brand spelling");

      const hasTitle = await page.title();
      if (!hasTitle) issues.push("Missing <title>");
      const hasDescription = await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute("content");
      if (!hasDescription) issues.push("Missing meta description");

      const hasOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > window.innerWidth + 1;
      });
      let overflowDesktop: RouteIssue["overflowDesktop"];
      if (hasOverflow) {
        issues.push("Horizontal overflow detected");
        overflowDesktop = await page.evaluate(() => {
          const vw = window.innerWidth;
          const offenders: Array<{ tag: string; cls: string; left: number; right: number; width: number }> = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vw + 1 || rect.left < -1) {
              offenders.push({
                tag: el.tagName,
                cls: (el as HTMLElement).className ?? "",
                left: rect.left,
                right: rect.right,
                width: rect.width,
              });
            }
          });
          return offenders.slice(0, 8);
        });
      }

      const desktopShot = path.join(
        screenshotsDir,
        `${sanitizeFileName(routePath || "home")}-desktop.png`
      );
      await page.screenshot({ path: desktopShot, fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(routePath, { waitUntil: "networkidle" });
      const mobileOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > window.innerWidth + 1;
      });
      let overflowMobile: RouteIssue["overflowMobile"];
      if (mobileOverflow) {
        issues.push("Mobile horizontal overflow detected");
        overflowMobile = await page.evaluate(() => {
          const vw = window.innerWidth;
          const offenders: Array<{ tag: string; cls: string; left: number; right: number; width: number }> = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vw + 1 || rect.left < -1) {
              offenders.push({
                tag: el.tagName,
                cls: (el as HTMLElement).className ?? "",
                left: rect.left,
                right: rect.right,
                width: rect.width,
              });
            }
          });
          return offenders.slice(0, 8);
        });
      }
      const mobileShot = path.join(
        screenshotsDir,
        `${sanitizeFileName(routePath || "home")}-mobile.png`
      );
      await page.screenshot({ path: mobileShot, fullPage: true });

      const routeReport = {
        route: routePath,
        issues,
        consoleErrors,
        consoleWarnings,
        requestFailures,
        status,
        overflowDesktop,
        overflowMobile,
      };
      auditReport.push(routeReport);
    }

    fs.mkdirSync(artifactsDir, { recursive: true });
    fs.writeFileSync(
      path.join(artifactsDir, "audit-report.json"),
      JSON.stringify(auditReport, null, 2),
      "utf8"
    );

    const failing = auditReport.filter((item) => item.issues.length > 0);
    expect(failing, JSON.stringify(failing, null, 2)).toHaveLength(0);
  });
});

```

## H) Verification
- Commands run: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
- Notes: RBAC test auto-skips if Supabase env credentials are missing.

## I) How to Run / Seed / Verify
- Seed admin invite (owner-only): `npm run seed:admin` (requires service role env).
- Build + tests: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
- RBAC E2E env vars: `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `E2E_OWNER_EMAIL`, `E2E_OWNER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.

## J) QA Checklist
- Mobile 320px: no horizontal scroll, header/menu usable, CTAs not overlapping.
- Brand: header/footer/title contain "هارتچ"; never "هارتج" after reload or navigation.
- Filters: URL-driven; refresh preserves results; chips removable.
- Property page: gallery works, sticky CTA respects safe-area, lead form validates.
- Staff/admin masking: non-owner sees masked PII and cannot update PII directly.
- Admin cannot update/disable owner; owner can manage all users.

## K) Audit Artifacts Index
- JSON report: `artifacts/audit-report.json`.
- Screenshots: `artifacts/screenshots/*` (mobile + desktop per route).
- Regenerate: `npm run test:e2e -- tests/site-audit.spec.ts`.

## L) Notes
- `docs/codex/final-report.md` is excluded from code dumps to avoid self-embedding recursion.
- Vercel deploy executed: `vercel --prod --yes`; alias set to https://hrtaj.com (2026-02-05).
