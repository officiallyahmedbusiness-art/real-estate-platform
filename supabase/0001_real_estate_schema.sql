-- Real estate platform schema + RLS policies + storage bucket
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

-- Helpers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.is_admin()
returns boolean
language sql
stable
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
as $$
  select exists (
    select 1 from public.developer_members dm
    where dm.developer_id = dev_id
      and dm.user_id = auth.uid()
  );
$$;

-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user','developer','partner','admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.developer_members (
  developer_id uuid not null references public.developers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (developer_id, user_id)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references public.developers(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null,
  purpose text not null check (purpose in ('sale','rent','new-development')),
  price numeric not null,
  currency text not null default 'EGP',
  city text not null,
  area text,
  address text,
  beds integer not null default 0,
  baths integer not null default 0,
  size_m2 numeric,
  description text,
  amenities jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  path text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  email text,
  message text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_city_idx on public.listings(city);
create index if not exists listings_price_idx on public.listings(price);
create index if not exists listings_owner_idx on public.listings(owner_user_id);
create index if not exists leads_listing_idx on public.leads(listing_id);
create index if not exists listing_images_listing_idx on public.listing_images(listing_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.developers enable row level security;
alter table public.developer_members enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.leads enable row level security;
alter table public.activity_log enable row level security;

-- Profiles
create policy "Profiles read by owner or admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Profiles insert by owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Profiles update by owner or admin"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Developers
create policy "Developers read by admin or member"
on public.developers for select
using (
  public.is_admin()
  or exists (
    select 1 from public.developer_members dm
    where dm.developer_id = id
      and dm.user_id = auth.uid()
  )
);

create policy "Developers manage by admin"
on public.developers for insert
with check (public.is_admin());

create policy "Developers update by admin"
on public.developers for update
using (public.is_admin())
with check (public.is_admin());

create policy "Developers delete by admin"
on public.developers for delete
using (public.is_admin());

-- Developer members
create policy "Developer members read by self or admin"
on public.developer_members for select
using (public.is_admin() or user_id = auth.uid());

create policy "Developer members manage by admin"
on public.developer_members for insert
with check (public.is_admin());

create policy "Developer members update by admin"
on public.developer_members for update
using (public.is_admin())
with check (public.is_admin());

create policy "Developer members delete by admin"
on public.developer_members for delete
using (public.is_admin());

-- Listings
create policy "Listings read public or owner"
on public.listings for select
using (
  status = 'published'
  or owner_user_id = auth.uid()
  or public.is_admin()
  or (developer_id is not null and public.is_developer_member(developer_id))
);

create policy "Listings insert by owner or admin"
on public.listings for insert
with check (
  (public.is_admin() or owner_user_id = auth.uid()
    or (
      developer_id is not null
      and public.is_developer_member(developer_id)
      and owner_user_id = auth.uid()
    )
  )
  and (status <> 'published' or public.is_admin())
);

create policy "Listings update by owner or admin"
on public.listings for update
using (
  public.is_admin()
  or owner_user_id = auth.uid()
  or (developer_id is not null and public.is_developer_member(developer_id))
)
with check (
  (public.is_admin()
    or owner_user_id = auth.uid()
    or (developer_id is not null and public.is_developer_member(developer_id))
  )
  and (status <> 'published' or public.is_admin())
);

create policy "Listings delete by owner or admin"
on public.listings for delete
using (
  public.is_admin()
  or owner_user_id = auth.uid()
  or (developer_id is not null and public.is_developer_member(developer_id))
);

-- Listing images
create policy "Listing images read"
on public.listing_images for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.status = 'published'
        or l.owner_user_id = auth.uid()
        or public.is_admin()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Listing images insert"
on public.listing_images for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Listing images update"
on public.listing_images for update
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
)
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Listing images delete"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

-- Favorites
create policy "Favorites read by owner"
on public.favorites for select
using (user_id = auth.uid());

create policy "Favorites insert by owner"
on public.favorites for insert
with check (user_id = auth.uid());

create policy "Favorites delete by owner"
on public.favorites for delete
using (user_id = auth.uid());

-- Leads
create policy "Leads insert by anyone"
on public.leads for insert
with check (user_id is null or user_id = auth.uid());

create policy "Leads read by admin or listing owner"
on public.leads for select
using (
  public.is_admin()
  or exists (
    select 1 from public.listings l
    where l.id = leads.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Leads read by lead owner"
on public.leads for select
using (user_id = auth.uid());

-- Activity log
create policy "Activity log read by admin"
on public.activity_log for select
using (public.is_admin());

create policy "Activity log insert by actor or admin"
on public.activity_log for insert
with check (public.is_admin() or actor_user_id = auth.uid());

-- Storage bucket (public read, restricted write)
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Storage policies: path format listings/<listing_id>/<filename>
create policy "Public read property images"
on storage.objects for select
using (bucket_id = 'property-images');

create policy "Property images insert by listing owner"
on storage.objects for insert
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = 'listings'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[2]
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Property images update by listing owner"
on storage.objects for update
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = 'listings'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[2]
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
)
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = 'listings'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[2]
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

create policy "Property images delete by listing owner"
on storage.objects for delete
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = 'listings'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[2]
      and (
        public.is_admin()
        or l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

-- Reporting views
create or replace view public.report_units_per_day as
select
  date_trunc('day', created_at)::date as day,
  count(*) as units
from public.listings
group by 1
order by 1 desc;

create or replace view public.report_leads_per_day as
select
  date_trunc('day', created_at)::date as day,
  count(*) as leads
from public.leads
group by 1
order by 1 desc;

create or replace view public.report_leads_per_listing as
select
  l.id as listing_id,
  l.title,
  count(ld.id) as leads
from public.listings l
left join public.leads ld on ld.listing_id = l.id
group by l.id, l.title
order by leads desc;

create or replace view public.report_top_developers as
select
  d.id as developer_id,
  d.name,
  count(l.id) as units
from public.developers d
left join public.listings l on l.developer_id = d.id
group by d.id, d.name
order by units desc;
