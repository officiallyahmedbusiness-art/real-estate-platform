-- Marketing partners marquee

create table if not exists public.marketing_partners (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  logo_url text null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_partners_active_idx
  on public.marketing_partners (is_active, sort_order);

drop trigger if exists set_marketing_partners_updated_at on public.marketing_partners;
create trigger set_marketing_partners_updated_at
before update on public.marketing_partners
for each row execute function public.set_updated_at();

alter table public.marketing_partners enable row level security;

drop policy if exists "public_read_marketing_partners" on public.marketing_partners;
create policy "public_read_marketing_partners"
on public.marketing_partners
for select
using (is_active = true);

drop policy if exists "admin_manage_marketing_partners" on public.marketing_partners;
create policy "admin_manage_marketing_partners"
on public.marketing_partners
for all
using (public.is_admin())
with check (public.is_admin());
