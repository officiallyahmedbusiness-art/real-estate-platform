-- Entity tracking: created_by / updated_by / updated_at

create or replace function public.set_actor_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if TG_OP = 'INSERT' then
    if new.created_by is null then
      new.created_by := auth.uid();
    end if;
    if new.updated_by is null then
      new.updated_by := auth.uid();
    end if;
    if new.updated_at is null then
      new.updated_at := now();
    end if;
  elsif TG_OP = 'UPDATE' then
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- Listings (properties/units)
alter table public.listings add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.listings add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.listings add column if not exists updated_at timestamptz not null default now();
drop trigger if exists listings_set_actor_fields on public.listings;
create trigger listings_set_actor_fields
before insert or update on public.listings
for each row execute function public.set_actor_fields();

-- Leads
alter table public.leads add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.leads add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.leads add column if not exists updated_at timestamptz not null default now();
drop trigger if exists leads_set_actor_fields on public.leads;
create trigger leads_set_actor_fields
before insert or update on public.leads
for each row execute function public.set_actor_fields();

-- Projects
alter table public.projects add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.projects add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.projects add column if not exists updated_at timestamptz not null default now();
drop trigger if exists projects_set_actor_fields on public.projects;
create trigger projects_set_actor_fields
before insert or update on public.projects
for each row execute function public.set_actor_fields();

-- Submission media
alter table public.submission_media add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.submission_media add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.submission_media add column if not exists updated_at timestamptz not null default now();
drop trigger if exists submission_media_set_actor_fields on public.submission_media;
create trigger submission_media_set_actor_fields
before insert or update on public.submission_media
for each row execute function public.set_actor_fields();

-- Submission notes
alter table public.submission_notes add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.submission_notes add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.submission_notes add column if not exists updated_at timestamptz not null default now();
drop trigger if exists submission_notes_set_actor_fields on public.submission_notes;
create trigger submission_notes_set_actor_fields
before insert or update on public.submission_notes
for each row execute function public.set_actor_fields();

-- Resale intake
alter table public.resale_intake add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.resale_intake add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.resale_intake add column if not exists updated_at timestamptz not null default now();
drop trigger if exists resale_intake_set_actor_fields on public.resale_intake;
create trigger resale_intake_set_actor_fields
before insert or update on public.resale_intake
for each row execute function public.set_actor_fields();

-- Unit attachments
alter table public.unit_attachments add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.unit_attachments add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.unit_attachments add column if not exists updated_at timestamptz not null default now();
drop trigger if exists unit_attachments_set_actor_fields on public.unit_attachments;
create trigger unit_attachments_set_actor_fields
before insert or update on public.unit_attachments
for each row execute function public.set_actor_fields();

-- Site homepage content tables
alter table public.site_media add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.site_media add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.site_media add column if not exists updated_at timestamptz not null default now();
drop trigger if exists site_media_set_actor_fields on public.site_media;
create trigger site_media_set_actor_fields
before insert or update on public.site_media
for each row execute function public.set_actor_fields();

alter table public.site_metrics add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.site_metrics add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.site_metrics add column if not exists updated_at timestamptz not null default now();
drop trigger if exists site_metrics_set_actor_fields on public.site_metrics;
create trigger site_metrics_set_actor_fields
before insert or update on public.site_metrics
for each row execute function public.set_actor_fields();

alter table public.featured_projects add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.featured_projects add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.featured_projects add column if not exists updated_at timestamptz not null default now();
drop trigger if exists featured_projects_set_actor_fields on public.featured_projects;
create trigger featured_projects_set_actor_fields
before insert or update on public.featured_projects
for each row execute function public.set_actor_fields();

-- Marketing partners
alter table public.marketing_partners add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.marketing_partners add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.marketing_partners add column if not exists updated_at timestamptz not null default now();
drop trigger if exists marketing_partners_set_actor_fields on public.marketing_partners;
create trigger marketing_partners_set_actor_fields
before insert or update on public.marketing_partners
for each row execute function public.set_actor_fields();

-- CRM customers & activities
alter table public.customers add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.customers add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.customers add column if not exists updated_at timestamptz not null default now();
drop trigger if exists customers_set_actor_fields on public.customers;
create trigger customers_set_actor_fields
before insert or update on public.customers
for each row execute function public.set_actor_fields();

alter table public.customer_activities add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.customer_activities add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.customer_activities add column if not exists updated_at timestamptz not null default now();
drop trigger if exists customer_activities_set_actor_fields on public.customer_activities;
create trigger customer_activities_set_actor_fields
before insert or update on public.customer_activities
for each row execute function public.set_actor_fields();

-- Visits scheduling
alter table public.field_visits add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.field_visits add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.field_visits add column if not exists updated_at timestamptz not null default now();
drop trigger if exists field_visits_set_actor_fields on public.field_visits;
create trigger field_visits_set_actor_fields
before insert or update on public.field_visits
for each row execute function public.set_actor_fields();

-- Careers applications
alter table public.career_applications add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.career_applications add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.career_applications add column if not exists updated_at timestamptz not null default now();
drop trigger if exists career_applications_set_actor_fields on public.career_applications;
create trigger career_applications_set_actor_fields
before insert or update on public.career_applications
for each row execute function public.set_actor_fields();
