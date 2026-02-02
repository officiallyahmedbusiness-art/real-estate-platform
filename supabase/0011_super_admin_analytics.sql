-- supabase/0011_super_admin_analytics.sql
-- Super admin role + page view analytics (safe, RLS protected).

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user','developer','partner','admin','ops','super_admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
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
      and p.role in ('admin','ops','super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  path text not null,
  referrer text,
  user_agent text,
  locale text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views(created_at);
create index if not exists page_views_visitor_idx on public.page_views(visitor_id);

alter table public.page_views enable row level security;

revoke all on public.page_views from public;
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;

drop policy if exists "Page views insert by anyone" on public.page_views;
create policy "Page views insert by anyone"
on public.page_views for insert
with check (true);

drop policy if exists "Page views read by super admin" on public.page_views;
create policy "Page views read by super admin"
on public.page_views for select
using (public.is_super_admin());
