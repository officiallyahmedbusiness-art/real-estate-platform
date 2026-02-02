-- supabase/0008_unit_attachments.sql
-- Unit attachments for resale units (staff-managed)
-- Run after 0007

create table if not exists public.unit_attachments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  file_path text not null,
  file_url text,
  file_type text not null check (file_type in ('image','pdf','video','doc','other')),
  category text not null default 'unit_photos' check (
    category in ('unit_photos','building_entry','view','plan','contract','owner_docs','other')
  ),
  title text,
  note text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  is_published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists unit_attachments_listing_idx on public.unit_attachments(listing_id);
create index if not exists unit_attachments_listing_published_idx
  on public.unit_attachments(listing_id, is_published);
create index if not exists unit_attachments_listing_sort_idx
  on public.unit_attachments(listing_id, sort_order);
create unique index if not exists unit_attachments_primary_idx
  on public.unit_attachments(listing_id)
  where is_primary;

alter table public.unit_attachments enable row level security;

drop policy if exists "Unit attachments read by staff or owner or published" on public.unit_attachments;
create policy "Unit attachments read by staff or owner or published"
on public.unit_attachments for select
using (
  public.is_hrtaj_staff()
  or exists (
    select 1 from public.listings l
    where l.id = unit_attachments.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
  )
  or (
    is_published = true
    and exists (
      select 1 from public.listings l
      where l.id = unit_attachments.listing_id
        and l.status = 'published'
    )
  )
);

drop policy if exists "Unit attachments insert by staff or owner" on public.unit_attachments;
create policy "Unit attachments insert by staff or owner"
on public.unit_attachments for insert
with check (
  created_by = auth.uid()
  and (
    public.is_hrtaj_staff()
    or exists (
      select 1 from public.listings l
      where l.id = unit_attachments.listing_id
        and (
          (l.owner_user_id = auth.uid()
           or (l.developer_id is not null and public.is_developer_member(l.developer_id)))
          and l.submission_status in ('draft','needs_changes')
        )
    )
  )
);

drop policy if exists "Unit attachments update by staff or owner" on public.unit_attachments;
create policy "Unit attachments update by staff or owner"
on public.unit_attachments for update
using (
  public.is_hrtaj_staff()
  or created_by = auth.uid()
)
with check (
  public.is_hrtaj_staff()
  or created_by = auth.uid()
);

drop policy if exists "Unit attachments delete by staff or owner" on public.unit_attachments;
create policy "Unit attachments delete by staff or owner"
on public.unit_attachments for delete
using (
  public.is_hrtaj_staff()
  or created_by = auth.uid()
);

-- Storage bucket (optional - run in dashboard if policies fail due to ownership)
-- insert into storage.buckets (id, name, public)
-- values ('property-attachments', 'property-attachments', false)
-- on conflict (id) do nothing;
--
-- Example policy (private bucket with staff access):
-- create policy "Staff can manage attachments"
-- on storage.objects for all
-- using (
--   bucket_id = 'property-attachments'
--   and public.is_hrtaj_staff()
-- )
-- with check (
--   bucket_id = 'property-attachments'
--   and public.is_hrtaj_staff()
-- );
