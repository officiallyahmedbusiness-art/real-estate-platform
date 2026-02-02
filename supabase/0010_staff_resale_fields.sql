-- supabase/0010_staff_resale_fields.sql
-- Add missing staff resale fields for public listings + private intake contact log.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'unit_status') then
    create type public.unit_status as enum ('available', 'sold', 'rented', 'on_hold');
  end if;
end $$;

alter table public.listings
  add column if not exists agent_name text,
  add column if not exists floor text,
  add column if not exists elevator boolean,
  add column if not exists finishing text,
  add column if not exists meters text,
  add column if not exists reception integer,
  add column if not exists kitchen boolean,
  add column if not exists view text,
  add column if not exists building text,
  add column if not exists has_images boolean not null default false,
  add column if not exists commission text,
  add column if not exists intake_date date,
  add column if not exists target text,
  add column if not exists ad_channel text,
  add column if not exists requested text,
  add column if not exists unit_status public.unit_status not null default 'available',
  add column if not exists building_entrance_images text[];

alter table public.resale_intake
  add column if not exists owner_notes text,
  add column if not exists last_owner_contact_at timestamptz,
  add column if not exists last_owner_contact_note text;

create index if not exists listings_unit_status_idx on public.listings(unit_status);
