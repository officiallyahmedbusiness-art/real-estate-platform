-- supabase/0012_ops_crm_visits_careers.sql
-- Ops/agent roles, CRM pipeline extensions, field visits, and careers intake.
-- Run after 0011

-- =========================
-- Roles (add agent)
-- =========================
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user','developer','partner','admin','ops','agent','super_admin'));

-- =========================
-- Staff profiles + contract status
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'staff_contract_status') then
    create type public.staff_contract_status as enum ('pending','active','suspended','expired');
  end if;
end $$;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contract_status public.staff_contract_status not null default 'pending',
  commission_rate numeric,
  commission_notes text,
  can_view_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'staff_profiles_set_updated_at'
  ) then
    create trigger staff_profiles_set_updated_at
    before update on public.staff_profiles
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.staff_profiles enable row level security;

drop policy if exists "Staff profiles read own or staff" on public.staff_profiles;
create policy "Staff profiles read own or staff"
on public.staff_profiles for select
using (
  auth.uid() = user_id
  or public.is_hrtaj_staff()
);

drop policy if exists "Staff profiles manage by admin" on public.staff_profiles;
create policy "Staff profiles manage by admin"
on public.staff_profiles for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.has_owner_access()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select public.is_admin()
    or exists (
      select 1 from public.staff_profiles sp
      where sp.user_id = auth.uid()
        and sp.can_view_owner = true
    );
$$;

-- Tighten resale intake access to contract-approved staff/admin.
drop policy if exists "Resale intake read by staff" on public.resale_intake;
create policy "Resale intake read by owner-access staff"
on public.resale_intake for select
using (public.has_owner_access());

drop policy if exists "Resale intake manage by staff" on public.resale_intake;
create policy "Resale intake manage by owner-access staff"
on public.resale_intake for all
using (public.has_owner_access())
with check (public.has_owner_access());

-- =========================
-- CRM pipeline extensions
-- =========================
alter type public.unit_status add value if not exists 'reserved';
alter type public.unit_status add value if not exists 'off_market';

alter table public.listings add column if not exists agent_user_id uuid references auth.users(id) on delete set null;
alter table public.resale_intake add column if not exists agent_user_id uuid references auth.users(id) on delete set null;

alter type public.lead_status add value if not exists 'qualified';
alter type public.lead_status add value if not exists 'viewing';
alter type public.lead_status add value if not exists 'negotiation';
alter type public.lead_status add value if not exists 'meeting_set';
alter type public.lead_status add value if not exists 'follow_up';

alter table public.leads add column if not exists lead_source text;
alter table public.leads add column if not exists lost_reason text;
alter table public.leads add column if not exists priority text default 'medium'
  check (priority in ('low','medium','high'));
alter table public.leads add column if not exists phone_normalized text;
alter table public.leads add column if not exists next_action_at timestamptz;
alter table public.leads add column if not exists next_action_note text;

create index if not exists leads_phone_normalized_idx on public.leads(phone_normalized);
create index if not exists leads_lead_source_idx on public.leads(lead_source);
create index if not exists leads_priority_idx on public.leads(priority);

-- =========================
-- Unit attachments: separate bucket for private docs
-- =========================
alter table public.unit_attachments
  add column if not exists bucket text not null default 'property-attachments';

create table if not exists public.lead_spend (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  spend_month date not null,
  amount numeric not null,
  currency text not null default 'EGP',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (channel, spend_month)
);

create index if not exists lead_spend_month_idx on public.lead_spend(spend_month);

alter table public.lead_spend enable row level security;

drop policy if exists "Lead spend manage by admin" on public.lead_spend;
create policy "Lead spend manage by admin"
on public.lead_spend for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Field visits / inspections
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visit_status') then
    create type public.visit_status as enum ('scheduled','completed','canceled','rescheduled','no_show');
  end if;
end $$;

create table if not exists public.field_visits (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  scheduled_at timestamptz not null,
  status public.visit_status not null default 'scheduled',
  outcome text,
  notes text,
  next_followup_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'field_visits_set_updated_at'
  ) then
    create trigger field_visits_set_updated_at
    before update on public.field_visits
    for each row execute function public.set_updated_at();
  end if;
end $$;

create index if not exists field_visits_assigned_idx on public.field_visits(assigned_to);
create index if not exists field_visits_scheduled_idx on public.field_visits(scheduled_at);

alter table public.field_visits enable row level security;

drop policy if exists "Field visits read by staff or assignee" on public.field_visits;
create policy "Field visits read by staff or assignee"
on public.field_visits for select
using (
  public.is_hrtaj_staff()
  or assigned_to = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "Field visits manage by staff or assignee" on public.field_visits;
create policy "Field visits manage by staff or assignee"
on public.field_visits for all
using (
  public.is_hrtaj_staff()
  or assigned_to = auth.uid()
  or created_by = auth.uid()
)
with check (
  public.is_hrtaj_staff()
  or assigned_to = auth.uid()
  or created_by = auth.uid()
);

-- =========================
-- Careers applications
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'new','reviewing','interview','offer','rejected','hired'
    );
  end if;
end $$;

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  name text not null,
  email text,
  phone text,
  message text,
  cv_path text,
  cv_filename text,
  status public.application_status not null default 'new',
  locale text,
  created_at timestamptz not null default now()
);

create index if not exists career_applications_created_idx on public.career_applications(created_at);
create index if not exists career_applications_status_idx on public.career_applications(status);

alter table public.career_applications enable row level security;

drop policy if exists "Career applications insert by anyone" on public.career_applications;
create policy "Career applications insert by anyone"
on public.career_applications for insert
with check (true);

drop policy if exists "Career applications read by staff" on public.career_applications;
create policy "Career applications read by staff"
on public.career_applications for select
using (public.is_hrtaj_staff());

drop policy if exists "Career applications update by staff" on public.career_applications;
create policy "Career applications update by staff"
on public.career_applications for update
using (public.is_hrtaj_staff())
with check (public.is_hrtaj_staff());

-- Storage bucket (manual in dashboard if SQL insert blocked)
-- insert into storage.buckets (id, name, public)
-- values ('career-uploads', 'career-uploads', false)
-- on conflict (id) do nothing;
--
-- Example policy to allow public CV uploads (private bucket):
-- create policy "Career uploads insert"
-- on storage.objects for insert
-- with check (bucket_id = 'career-uploads');
--
-- create policy "Career uploads read by staff"
-- on storage.objects for select
-- using (bucket_id = 'career-uploads' and public.is_hrtaj_staff());
