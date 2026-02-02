-- Developer advertising workflow (campaigns + assets)

create table if not exists public.advertiser_accounts (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references public.developers(id) on delete cascade,
  name text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (developer_id)
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertiser_accounts(id) on delete cascade,
  developer_id uuid not null references public.developers(id) on delete cascade,
  title_ar text,
  title_en text,
  body_ar text,
  body_en text,
  cta_label_ar text,
  cta_label_en text,
  cta_url text,
  status text not null default 'draft'
    check (status in ('draft','submitted','needs_changes','approved','published','archived')),
  start_date date,
  end_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  developer_id uuid not null references public.developers(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  url text not null,
  poster_url text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists ad_campaigns_developer_idx on public.ad_campaigns(developer_id);
create index if not exists ad_campaigns_status_idx on public.ad_campaigns(status);
create index if not exists ad_assets_campaign_idx on public.ad_assets(campaign_id);
create index if not exists ad_assets_developer_idx on public.ad_assets(developer_id);

alter table public.advertiser_accounts enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_assets enable row level security;

drop policy if exists "advertiser_accounts_read" on public.advertiser_accounts;
create policy "advertiser_accounts_read"
on public.advertiser_accounts for select
using (public.is_admin() or public.is_developer_member(developer_id));

drop policy if exists "advertiser_accounts_write" on public.advertiser_accounts;
create policy "advertiser_accounts_write"
on public.advertiser_accounts for all
using (public.is_admin() or public.is_developer_member(developer_id))
with check (public.is_admin() or public.is_developer_member(developer_id));

drop policy if exists "ad_campaigns_public_read" on public.ad_campaigns;
create policy "ad_campaigns_public_read"
on public.ad_campaigns for select
using (status = 'published');

drop policy if exists "ad_campaigns_internal_read" on public.ad_campaigns;
create policy "ad_campaigns_internal_read"
on public.ad_campaigns for select
using (public.is_admin() or public.is_developer_member(developer_id));

drop policy if exists "ad_campaigns_insert" on public.ad_campaigns;
create policy "ad_campaigns_insert"
on public.ad_campaigns for insert
with check (public.is_admin() or public.is_developer_member(developer_id));

drop policy if exists "ad_campaigns_update" on public.ad_campaigns;
create policy "ad_campaigns_update"
on public.ad_campaigns for update
using (
  public.is_admin()
  or (public.is_developer_member(developer_id) and status in ('draft','submitted','needs_changes'))
)
with check (
  public.is_admin()
  or (public.is_developer_member(developer_id) and status in ('draft','submitted','needs_changes'))
);

drop policy if exists "ad_campaigns_delete" on public.ad_campaigns;
create policy "ad_campaigns_delete"
on public.ad_campaigns for delete
using (
  public.is_admin()
  or (public.is_developer_member(developer_id) and status in ('draft','submitted','needs_changes'))
);

drop policy if exists "ad_assets_public_read" on public.ad_assets;
create policy "ad_assets_public_read"
on public.ad_assets for select
using (
  exists (
    select 1 from public.ad_campaigns c
    where c.id = ad_assets.campaign_id
      and c.status = 'published'
  )
);

drop policy if exists "ad_assets_internal_read" on public.ad_assets;
create policy "ad_assets_internal_read"
on public.ad_assets for select
using (public.is_admin() or public.is_developer_member(developer_id));

drop policy if exists "ad_assets_write" on public.ad_assets;
create policy "ad_assets_write"
on public.ad_assets for all
using (
  public.is_admin()
  or (
    public.is_developer_member(developer_id)
    and exists (
      select 1 from public.ad_campaigns c
      where c.id = ad_assets.campaign_id
        and c.status in ('draft','submitted','needs_changes')
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_developer_member(developer_id)
    and exists (
      select 1 from public.ad_campaigns c
      where c.id = ad_assets.campaign_id
        and c.status in ('draft','submitted','needs_changes')
    )
  )
);

drop trigger if exists advertiser_accounts_set_actor_fields on public.advertiser_accounts;
create trigger advertiser_accounts_set_actor_fields
before insert or update on public.advertiser_accounts
for each row execute function public.set_actor_fields();

drop trigger if exists ad_campaigns_set_actor_fields on public.ad_campaigns;
create trigger ad_campaigns_set_actor_fields
before insert or update on public.ad_campaigns
for each row execute function public.set_actor_fields();

drop trigger if exists ad_assets_set_actor_fields on public.ad_assets;
create trigger ad_assets_set_actor_fields
before insert or update on public.ad_assets
for each row execute function public.set_actor_fields();
