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
