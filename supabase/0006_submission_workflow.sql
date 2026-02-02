-- supabase/0006_submission_workflow.sql
-- Submission workflow + projects + media + HRTAJ staff role
-- Run after 0005

-- =========================
-- Roles / staff helpers
-- =========================
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user','developer','partner','admin','ops'));

create or replace function public.is_hrtaj_staff()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','ops')
  );
$$;

-- =========================
-- Submission status enum
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type public.submission_status as enum (
      'draft',
      'submitted',
      'under_review',
      'needs_changes',
      'approved',
      'published',
      'archived'
    );
  end if;
end $$;

-- =========================
-- Projects (new developments)
-- =========================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references public.developers(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_code text,
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  city text,
  area text,
  address text,
  amenities jsonb not null default '[]'::jsonb,
  submission_status public.submission_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  hr_owner_user_id uuid references auth.users(id) on delete set null,
  developer_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'projects_set_updated_at'
  ) then
    create trigger projects_set_updated_at
    before update on public.projects
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- =========================
-- Listings: submission workflow + localization fields
-- =========================
alter table public.listings add column if not exists submission_status public.submission_status not null default 'draft';
alter table public.listings add column if not exists submitted_at timestamptz;
alter table public.listings add column if not exists reviewed_at timestamptz;
alter table public.listings add column if not exists approved_at timestamptz;
alter table public.listings add column if not exists published_at timestamptz;
alter table public.listings add column if not exists archived_at timestamptz;
alter table public.listings add column if not exists hr_owner_user_id uuid references auth.users(id) on delete set null;
alter table public.listings add column if not exists listing_code text;
alter table public.listings add column if not exists unit_code text;
alter table public.listings add column if not exists project_id uuid references public.projects(id) on delete set null;
alter table public.listings add column if not exists title_ar text;
alter table public.listings add column if not exists title_en text;
alter table public.listings add column if not exists description_ar text;
alter table public.listings add column if not exists description_en text;
alter table public.listings add column if not exists developer_payload jsonb not null default '{}'::jsonb;

-- Prevent publish without workflow publish (new rows enforced; existing rows not validated).
alter table public.listings
  add constraint listings_publish_requires_submission
  check (status <> 'published' or submission_status = 'published')
  not valid;

-- =========================
-- Submission media (brochures / floorplans / images)
-- =========================
create table if not exists public.submission_media (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references public.developers(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  media_type text not null check (media_type in ('brochure','floorplan','image','other')),
  url text,
  path text,
  submission_status public.submission_status not null default 'draft',
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (listing_id is not null or project_id is not null)
);

-- =========================
-- Submission notes (review + feedback)
-- =========================
create table if not exists public.submission_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('listing','project','media')),
  entity_id uuid not null,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text,
  visibility text not null default 'developer' check (visibility in ('internal','developer')),
  note text not null,
  created_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================
create index if not exists listings_submission_status_idx on public.listings(submission_status);
create index if not exists listings_project_idx on public.listings(project_id);
create index if not exists projects_submission_status_idx on public.projects(submission_status);
create index if not exists submission_media_listing_idx on public.submission_media(listing_id);
create index if not exists submission_media_project_idx on public.submission_media(project_id);
create index if not exists submission_notes_entity_idx on public.submission_notes(entity_type, entity_id);

-- =========================
-- RLS enable
-- =========================
alter table public.projects enable row level security;
alter table public.submission_media enable row level security;
alter table public.submission_notes enable row level security;

-- =========================
-- Policy updates (staff-aware + workflow)
-- =========================

-- Profiles
drop policy if exists "Profiles read by owner or admin" on public.profiles;
create policy "Profiles read by owner or staff"
on public.profiles for select
using (auth.uid() = id or public.is_hrtaj_staff());

-- Developers
drop policy if exists "Developers read by admin or member" on public.developers;
create policy "Developers read by staff or member"
on public.developers for select
using (
  public.is_hrtaj_staff()
  or exists (
    select 1 from public.developer_members dm
    where dm.developer_id = id
      and dm.user_id = auth.uid()
  )
);

-- Developer members
drop policy if exists "Developer members read by self or admin" on public.developer_members;
create policy "Developer members read by self or staff"
on public.developer_members for select
using (public.is_hrtaj_staff() or user_id = auth.uid());

-- Listings
drop policy if exists "Listings read public or owner" on public.listings;
create policy "Listings read public or owner"
on public.listings for select
using (
  status = 'published'
  or owner_user_id = auth.uid()
  or public.is_hrtaj_staff()
  or (developer_id is not null and public.is_developer_member(developer_id))
);

drop policy if exists "Listings insert by owner or admin" on public.listings;
create policy "Listings insert by owner or staff"
on public.listings for insert
with check (
  (
    public.is_hrtaj_staff()
    or owner_user_id = auth.uid()
    or (
      developer_id is not null
      and public.is_developer_member(developer_id)
      and owner_user_id = auth.uid()
    )
  )
  and (status <> 'published' or public.is_hrtaj_staff())
  and (submission_status in ('draft','submitted') or public.is_hrtaj_staff())
);

drop policy if exists "Listings update by owner or admin" on public.listings;
create policy "Listings update by owner or staff"
on public.listings for update
using (
  public.is_hrtaj_staff()
  or (
    owner_user_id = auth.uid()
    and submission_status in ('draft','needs_changes')
  )
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','needs_changes')
  )
)
with check (
  public.is_hrtaj_staff()
  or (
    (owner_user_id = auth.uid() or (developer_id is not null and public.is_developer_member(developer_id)))
    and submission_status in ('draft','submitted','needs_changes')
    and status <> 'published'
  )
);

drop policy if exists "Listings delete by owner or admin" on public.listings;
create policy "Listings delete by owner or staff"
on public.listings for delete
using (
  public.is_hrtaj_staff()
  or (
    owner_user_id = auth.uid()
    and submission_status in ('draft','needs_changes')
  )
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','needs_changes')
  )
);

-- Listing images
drop policy if exists "Listing images read" on public.listing_images;
create policy "Listing images read"
on public.listing_images for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.status = 'published'
        or l.owner_user_id = auth.uid()
        or public.is_hrtaj_staff()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

drop policy if exists "Listing images insert" on public.listing_images;
create policy "Listing images insert"
on public.listing_images for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_hrtaj_staff()
        or (
          (l.owner_user_id = auth.uid()
           or (l.developer_id is not null and public.is_developer_member(l.developer_id)))
          and l.submission_status in ('draft','needs_changes')
        )
      )
  )
);

drop policy if exists "Listing images update" on public.listing_images;
create policy "Listing images update"
on public.listing_images for update
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_hrtaj_staff()
        or (
          (l.owner_user_id = auth.uid()
           or (l.developer_id is not null and public.is_developer_member(l.developer_id)))
          and l.submission_status in ('draft','needs_changes')
        )
      )
  )
)
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_hrtaj_staff()
        or (
          (l.owner_user_id = auth.uid()
           or (l.developer_id is not null and public.is_developer_member(l.developer_id)))
          and l.submission_status in ('draft','needs_changes')
        )
      )
  )
);

drop policy if exists "Listing images delete" on public.listing_images;
create policy "Listing images delete"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_images.listing_id
      and (
        public.is_hrtaj_staff()
        or (
          (l.owner_user_id = auth.uid()
           or (l.developer_id is not null and public.is_developer_member(l.developer_id)))
          and l.submission_status in ('draft','needs_changes')
        )
      )
  )
);

-- Leads
drop policy if exists "Leads read by admin or listing owner" on public.leads;
create policy "Leads read by staff or listing owner"
on public.leads for select
using (
  public.is_hrtaj_staff()
  or exists (
    select 1 from public.listings l
    where l.id = leads.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
  or user_id = auth.uid()
);

drop policy if exists "Leads update by admin or listing owner" on public.leads;
create policy "Leads update by staff or listing owner"
on public.leads for update
using (
  public.is_hrtaj_staff()
  or assigned_to = auth.uid()
  or exists (
    select 1 from public.listings l
    where l.id = leads.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
)
with check (
  public.is_hrtaj_staff()
  or assigned_to = auth.uid()
  or exists (
    select 1 from public.listings l
    where l.id = leads.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
);

-- Activity log (staff read)
drop policy if exists "Activity log read by admin" on public.activity_log;
create policy "Activity log read by staff"
on public.activity_log for select
using (public.is_hrtaj_staff());

-- Projects
create policy "Projects read public or owner"
on public.projects for select
using (
  submission_status = 'published'
  or owner_user_id = auth.uid()
  or public.is_hrtaj_staff()
  or (developer_id is not null and public.is_developer_member(developer_id))
);

create policy "Projects insert by owner or staff"
on public.projects for insert
with check (
  (
    public.is_hrtaj_staff()
    or owner_user_id = auth.uid()
    or (developer_id is not null and public.is_developer_member(developer_id))
  )
  and (submission_status in ('draft','submitted') or public.is_hrtaj_staff())
);

create policy "Projects update by owner or staff"
on public.projects for update
using (
  public.is_hrtaj_staff()
  or (
    owner_user_id = auth.uid()
    and submission_status in ('draft','needs_changes')
  )
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','needs_changes')
  )
)
with check (
  public.is_hrtaj_staff()
  or (
    (owner_user_id = auth.uid()
     or (developer_id is not null and public.is_developer_member(developer_id)))
    and submission_status in ('draft','submitted','needs_changes')
  )
);

create policy "Projects delete by owner or staff"
on public.projects for delete
using (
  public.is_hrtaj_staff()
  or (
    owner_user_id = auth.uid()
    and submission_status in ('draft','needs_changes')
  )
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','needs_changes')
  )
);

-- Submission media
create policy "Submission media read"
on public.submission_media for select
using (
  public.is_hrtaj_staff()
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
  )
);

create policy "Submission media insert"
on public.submission_media for insert
with check (
  public.is_hrtaj_staff()
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','submitted')
  )
);

create policy "Submission media update"
on public.submission_media for update
using (
  public.is_hrtaj_staff()
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','needs_changes')
  )
)
with check (
  public.is_hrtaj_staff()
  or (
    developer_id is not null
    and public.is_developer_member(developer_id)
    and submission_status in ('draft','submitted','needs_changes')
  )
);

-- Submission notes
create policy "Submission notes read"
on public.submission_notes for select
using (
  public.is_hrtaj_staff()
  or (
    visibility = 'developer'
    and (
      exists (
        select 1 from public.listings l
        where submission_notes.entity_type = 'listing'
          and l.id = submission_notes.entity_id
          and (
            l.owner_user_id = auth.uid()
            or (l.developer_id is not null and public.is_developer_member(l.developer_id))
          )
      )
      or exists (
        select 1 from public.projects p
        where submission_notes.entity_type = 'project'
          and p.id = submission_notes.entity_id
          and (
            p.owner_user_id = auth.uid()
            or (p.developer_id is not null and public.is_developer_member(p.developer_id))
          )
      )
      or exists (
        select 1 from public.submission_media m
        where submission_notes.entity_type = 'media'
          and m.id = submission_notes.entity_id
          and (m.developer_id is not null and public.is_developer_member(m.developer_id))
      )
    )
  )
);

create policy "Submission notes insert"
on public.submission_notes for insert
with check (
  public.is_hrtaj_staff()
  or (
    visibility = 'developer'
    and author_user_id = auth.uid()
    and (
      exists (
        select 1 from public.listings l
        where submission_notes.entity_type = 'listing'
          and l.id = submission_notes.entity_id
          and (
            l.owner_user_id = auth.uid()
            or (l.developer_id is not null and public.is_developer_member(l.developer_id))
          )
      )
      or exists (
        select 1 from public.projects p
        where submission_notes.entity_type = 'project'
          and p.id = submission_notes.entity_id
          and (
            p.owner_user_id = auth.uid()
            or (p.developer_id is not null and public.is_developer_member(p.developer_id))
          )
      )
      or exists (
        select 1 from public.submission_media m
        where submission_notes.entity_type = 'media'
          and m.id = submission_notes.entity_id
          and (m.developer_id is not null and public.is_developer_member(m.developer_id))
      )
    )
  )
);
