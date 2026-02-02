-- supabase/0007_python_import_support.sql
-- Support Python ETL imports + SLA fields for leads
-- Run after 0006

-- =========================
-- Inventory source (resale vs project)
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'inventory_source') then
    create type public.inventory_source as enum ('resale', 'project');
  end if;
end $$;

alter table public.listings
  add column if not exists inventory_source public.inventory_source not null default 'resale';

create index if not exists listings_inventory_source_idx on public.listings(inventory_source);
create index if not exists listings_unit_code_idx on public.listings(unit_code);

-- =========================
-- Resale intake (private staff-only fields)
-- =========================
create table if not exists public.resale_intake (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  agent_name text,
  owner_name text,
  owner_phone text,
  unit_code text,
  floor text,
  size_m2 numeric,
  elevator boolean,
  finishing text,
  meters text,
  bedrooms integer,
  reception integer,
  bathrooms integer,
  kitchen boolean,
  view text,
  building text,
  has_images boolean,
  entrance text,
  commission text,
  intake_date date,
  target text,
  ad_channel text,
  address text,
  area text,
  city text,
  price numeric,
  currency text,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'resale_intake_set_updated_at'
  ) then
    create trigger resale_intake_set_updated_at
    before update on public.resale_intake
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.resale_intake enable row level security;

drop policy if exists "Resale intake read by staff" on public.resale_intake;
create policy "Resale intake read by staff"
on public.resale_intake for select
using (public.is_hrtaj_staff());

drop policy if exists "Resale intake manage by staff" on public.resale_intake;
create policy "Resale intake manage by staff"
on public.resale_intake for all
using (public.is_hrtaj_staff())
with check (public.is_hrtaj_staff());

create index if not exists resale_intake_owner_phone_idx on public.resale_intake(owner_phone);
create index if not exists resale_intake_address_idx on public.resale_intake(address);
create index if not exists resale_intake_price_idx on public.resale_intake(price);

-- =========================
-- Leads SLA fields
-- =========================
alter table public.leads add column if not exists updated_at timestamptz not null default now();
alter table public.leads add column if not exists first_response_at timestamptz;
alter table public.leads add column if not exists last_contact_at timestamptz;
alter table public.leads add column if not exists next_followup_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'leads_set_updated_at'
  ) then
    create trigger leads_set_updated_at
    before update on public.leads
    for each row execute function public.set_updated_at();
  end if;
end $$;

create index if not exists leads_updated_at_idx on public.leads(updated_at);
create index if not exists leads_next_followup_idx on public.leads(next_followup_at);
