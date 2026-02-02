-- supabase/0004_security_hardening.sql
-- Security advisor hardening: search_path + security invoker views

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_developer_member(dev_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.developer_members dm
    where dm.developer_id = dev_id
      and dm.user_id = auth.uid()
  );
$$;

create or replace view public.report_units_per_day
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  count(*) as units
from public.listings
group by 1
order by 1 desc;

create or replace view public.report_leads_per_day
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  count(*) as leads
from public.leads
group by 1
order by 1 desc;

create or replace view public.report_leads_per_listing
with (security_invoker = true)
as
select
  l.id as listing_id,
  l.title,
  count(ld.id) as leads
from public.listings l
left join public.leads ld on ld.listing_id = l.id
group by l.id, l.title
order by leads desc;

create or replace view public.report_top_developers
with (security_invoker = true)
as
select
  d.id as developer_id,
  d.name,
  count(l.id) as units
from public.developers d
left join public.listings l on l.developer_id = d.id
group by d.id, d.name
order by units desc;
