-- supabase/0015_owner_rbac_audit_settings.sql
-- Owner role + audit log + site settings + profile bootstrap triggers.
-- Run after 0014 (supersedes role constraint).

create extension if not exists "pgcrypto";

-- Roles: include owner.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner','admin','ops','staff','agent','developer'));
alter table public.profiles alter column role set default 'staff';

-- Identity sync columns
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists last_sign_in_at timestamptz;

-- Helpers
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

-- Owner access: staff_profiles is optional (won't break if missing).
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

-- Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text
);

create index if not exists audit_log_created_at_idx on public.audit_log(created_at);
create index if not exists audit_log_action_idx on public.audit_log(action);

alter table public.audit_log enable row level security;

drop policy if exists "Audit log insert by authed" on public.audit_log;
create policy "Audit log insert by authed"
on public.audit_log for insert
with check (auth.uid() is not null);

drop policy if exists "Audit log read by owner" on public.audit_log;
create policy "Audit log read by owner"
on public.audit_log for select
using (public.is_owner());

-- Site settings (public read, owner write)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Site settings read by all" on public.site_settings;
create policy "Site settings read by all"
on public.site_settings for select
using (true);

drop policy if exists "Site settings write by owner" on public.site_settings;
create policy "Site settings write by owner"
on public.site_settings for all
using (public.is_owner())
with check (public.is_owner());

insert into public.site_settings (key, value)
values
  ('facebook_url', 'https://www.facebook.com/share/1C1fQLJD2W/'),
  ('public_email', 'hrtaj4realestate@gmail.com'),
  ('whatsapp_number', '+201020614022'),
  ('whatsapp_link', 'https://wa.me/201020614022')
on conflict (key) do nothing;

-- Keep updated_at fresh
create or replace function public.touch_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_site_settings_updated_at();

-- Profiles auto bootstrap on auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    'staff',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.phone
  )
  on conflict (id) do nothing;

  update public.profiles
    set email = new.email,
        last_sign_in_at = new.last_sign_in_at
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_auth_user_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  update public.profiles
    set email = new.email,
        last_sign_in_at = new.last_sign_in_at
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row execute function public.handle_auth_user_update();

-- Recommended: allow users to read their own profile (prevents role fallback to staff in UI)
alter table public.profiles enable row level security;

drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own"
on public.profiles for select
using (auth.uid() = id);
