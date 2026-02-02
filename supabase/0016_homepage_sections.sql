-- Homepage sections: hero media, proof metrics, featured projects

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'hero' check (placement in ('hero')),
  media_type text not null check (media_type in ('video','image')),
  url text not null,
  poster_url text null,
  title text null,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_media_placement_published_idx
  on public.site_media (placement, is_published, sort_order);

create table if not exists public.site_metrics (
  id uuid primary key default gen_random_uuid(),
  label_ar text not null,
  label_en text not null,
  value text not null,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_metrics_published_idx
  on public.site_metrics (is_published, sort_order);

create table if not exists public.featured_projects (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_en text not null,
  location_ar text not null,
  location_en text not null,
  starting_price numeric null,
  currency text not null default 'EGP',
  image_url text null,
  cta_url text null,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists featured_projects_published_idx
  on public.featured_projects (is_published, sort_order);

drop trigger if exists set_site_media_updated_at on public.site_media;
create trigger set_site_media_updated_at
before update on public.site_media
for each row execute function public.set_updated_at();

drop trigger if exists set_site_metrics_updated_at on public.site_metrics;
create trigger set_site_metrics_updated_at
before update on public.site_metrics
for each row execute function public.set_updated_at();

drop trigger if exists set_featured_projects_updated_at on public.featured_projects;
create trigger set_featured_projects_updated_at
before update on public.featured_projects
for each row execute function public.set_updated_at();

alter table public.site_media enable row level security;
alter table public.site_metrics enable row level security;
alter table public.featured_projects enable row level security;

drop policy if exists "public_read_site_media" on public.site_media;
create policy "public_read_site_media"
on public.site_media
for select
using (is_published = true);

drop policy if exists "admin_manage_site_media" on public.site_media;
create policy "admin_manage_site_media"
on public.site_media
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_metrics" on public.site_metrics;
create policy "public_read_site_metrics"
on public.site_metrics
for select
using (is_published = true);

drop policy if exists "admin_manage_site_metrics" on public.site_metrics;
create policy "admin_manage_site_metrics"
on public.site_metrics
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_featured_projects" on public.featured_projects;
create policy "public_read_featured_projects"
on public.featured_projects
for select
using (is_published = true);

drop policy if exists "admin_manage_featured_projects" on public.featured_projects;
create policy "admin_manage_featured_projects"
on public.featured_projects
for all
using (public.is_admin())
with check (public.is_admin());
