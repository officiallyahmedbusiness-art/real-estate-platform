-- supabase/0014_role_model_lock.sql
-- Enforce HRTAJ role model lock (owner | admin | ops | staff | agent | developer).
-- Safe to run even if some rows already have owner.

-- Normalize legacy roles (and any older experiments).
update public.profiles set role = 'admin'     where role in ('super_admin');
update public.profiles set role = 'developer' where role in ('partner');
update public.profiles set role = 'agent'     where role in ('user');

-- Fallback: any unexpected role becomes staff (prevents check-constraint failure).
update public.profiles
set role = 'staff'
where role is null
   or role not in ('owner','admin','ops','staff','agent','developer');

-- Enforce role constraint.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner','admin','ops','staff','agent','developer'));

alter table public.profiles alter column role set default 'staff';

-- Role helpers (owner is treated as admin/staff where appropriate).
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
  );
$$;

create or replace function public.is_hrtaj_staff()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner','admin','ops','staff','agent')
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
  );
$$;

-- cleanup legacy helper
drop function if exists public.is_super_admin();

-- Page views: admin only (owner included via is_admin()).
drop policy if exists "Page views read by super admin" on public.page_views;
drop policy if exists "Page views read by admin" on public.page_views;

create policy "Page views read by admin"
on public.page_views for select
using (public.is_admin());
