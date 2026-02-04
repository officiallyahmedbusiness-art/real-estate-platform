-- Owner governance for customer + request (leads) tables.
-- Applies stricter RLS: owner full control, CRM staff read-only, public insert for lead intake.

-- 1) Ensure active flag and helper functions (owner/admin/crm).
alter table public.profiles
  add column if not exists is_active boolean not null default true;

update public.profiles
set is_active = true
where is_active is null;

create or replace function public.is_owner()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
      and p.is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','admin')
      and p.is_active = true
  );
$$;

create or replace function public.is_crm_user()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','admin','ops','staff','agent')
      and p.is_active = true
  );
$$;

-- 2) Customers: owner-only update/delete. CRM staff can read. Public/CRM can insert (lead intake).
alter table public.customers enable row level security;

drop policy if exists "Customers read by crm staff" on public.customers;
drop policy if exists "Customers insert by crm staff" on public.customers;
drop policy if exists "Customers update by crm staff" on public.customers;
drop policy if exists "Customers update by owner" on public.customers;
drop policy if exists "Customers delete by admin" on public.customers;
drop policy if exists "Customers delete by owner" on public.customers;

create policy "Customers select by crm staff"
on public.customers for select
using (public.is_crm_user());

create policy "Customers insert by public or crm"
on public.customers for insert
with check (
  public.is_crm_user()
  or auth.role() in ('anon','authenticated')
);

create policy "Customers update by owner"
on public.customers for update
using (public.is_owner())
with check (public.is_owner());

create policy "Customers delete by owner"
on public.customers for delete
using (public.is_owner());

-- 3) Leads (requests): owner-only update/delete. CRM staff can read. Public can insert.
alter table public.leads enable row level security;

drop policy if exists "Leads insert by anyone" on public.leads;
drop policy if exists "Leads read by admin or listing owner" on public.leads;
drop policy if exists "Leads read by lead owner" on public.leads;
drop policy if exists "Leads read by assigned user" on public.leads;
drop policy if exists "Leads update by admin or listing owner" on public.leads;
drop policy if exists "Leads update by staff or listing owner" on public.leads;
drop policy if exists "Leads update by owner" on public.leads;
drop policy if exists "Leads delete by owner" on public.leads;

create policy "Leads insert by anyone"
on public.leads for insert
with check (user_id is null or user_id = auth.uid());

create policy "Leads select by crm staff"
on public.leads for select
using (public.is_crm_user());

create policy "Leads update by owner"
on public.leads for update
using (public.is_owner())
with check (public.is_owner());

create policy "Leads delete by owner"
on public.leads for delete
using (public.is_owner());

-- 4) Lead notes: CRM staff can read/insert; owner-only update/delete.
alter table public.lead_notes enable row level security;

drop policy if exists "Lead notes read" on public.lead_notes;
drop policy if exists "Lead notes insert" on public.lead_notes;
drop policy if exists "Lead notes insert by owner" on public.lead_notes;

create policy "Lead notes select by crm staff"
on public.lead_notes for select
using (public.is_crm_user());

create policy "Lead notes insert by crm staff"
on public.lead_notes for insert
with check (public.is_crm_user() and author_user_id = auth.uid());

create policy "Lead notes update by owner"
on public.lead_notes for update
using (public.is_owner())
with check (public.is_owner());

create policy "Lead notes delete by owner"
on public.lead_notes for delete
using (public.is_owner());

-- 5) Lead assignments: owner-only manage, CRM staff can read.
alter table public.lead_assignments enable row level security;

drop policy if exists "Lead assignments manage by admin" on public.lead_assignments;
drop policy if exists "Lead assignments manage by owner" on public.lead_assignments;

create policy "Lead assignments select by crm staff"
on public.lead_assignments for select
using (public.is_crm_user());

create policy "Lead assignments insert by owner"
on public.lead_assignments for insert
with check (public.is_owner());

create policy "Lead assignments update by owner"
on public.lead_assignments for update
using (public.is_owner())
with check (public.is_owner());

create policy "Lead assignments delete by owner"
on public.lead_assignments for delete
using (public.is_owner());

-- 6) Lead activities: CRM staff can read/insert; owner-only update/delete.
alter table public.lead_activities enable row level security;

drop policy if exists "Lead activities read by crm staff" on public.lead_activities;
drop policy if exists "Lead activities insert by crm staff" on public.lead_activities;
drop policy if exists "Lead activities update by crm staff" on public.lead_activities;
drop policy if exists "Lead activities update by owner" on public.lead_activities;

create policy "Lead activities select by crm staff"
on public.lead_activities for select
using (public.is_crm_user());

create policy "Lead activities insert by crm staff"
on public.lead_activities for insert
with check (public.is_crm_user() and created_by = auth.uid());

create policy "Lead activities update by owner"
on public.lead_activities for update
using (public.is_owner())
with check (public.is_owner());

create policy "Lead activities delete by owner"
on public.lead_activities for delete
using (public.is_owner());
