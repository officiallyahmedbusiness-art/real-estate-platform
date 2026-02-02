-- supabase/0023_fix_role_helpers_final.sql
-- Normalize roles to final HRTAJ set and re-assert role helpers/policies.

-- Normalize legacy roles from older migrations.
update public.profiles set role = 'admin'     where role in ('super_admin');
update public.profiles set role = 'developer' where role in ('partner');
update public.profiles set role = 'agent'     where role in ('user');

-- Fallback to staff for any unexpected roles.
update public.profiles
set role = 'staff'
where role is null
   or role not in ('owner','admin','ops','staff','agent','developer');

-- Enforce final role constraint.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner','admin','ops','staff','agent','developer'));
alter table public.profiles alter column role set default 'staff';

-- Final role helpers.
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

create or replace function public.has_owner_access()
returns boolean
language plpgsql
stable
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() or public.is_admin() then
    return true;
  end if;

  if to_regclass('public.staff_profiles') is null then
    return false;
  end if;

  return exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.can_view_owner = true
  );
end;
$$;

-- Ensure profiles can read their own profile.
alter table public.profiles enable row level security;
drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own"
on public.profiles for select
using (auth.uid() = id);
