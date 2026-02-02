-- supabase/0013_customers_crm_activities.sql
-- Customers, CRM activities, lead sources, and owner follow-up fields.
-- Run after 0012

-- =========================
-- CRM access helper
-- =========================
create or replace function public.is_crm_user()
returns boolean
language sql
stable
set search_path = public, auth, extensions
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','ops','agent','super_admin')
  );
$$;

-- =========================
-- Customers (dedup by phone)
-- =========================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone_raw text,
  phone_e164 text,
  email text,
  lead_source text,
  intent text,
  preferred_areas text[],
  budget_min numeric,
  budget_max numeric,
  requirements jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'customers_set_updated_at'
  ) then
    create trigger customers_set_updated_at
    before update on public.customers
    for each row execute function public.set_updated_at();
  end if;
end $$;

create unique index if not exists customers_phone_e164_uidx
  on public.customers(phone_e164)
  where phone_e164 is not null;

create index if not exists customers_created_at_idx on public.customers(created_at);

alter table public.customers enable row level security;

drop policy if exists "Customers read by crm staff" on public.customers;
create policy "Customers read by crm staff"
on public.customers for select
using (public.is_crm_user());

drop policy if exists "Customers insert by crm staff" on public.customers;
create policy "Customers insert by crm staff"
on public.customers for insert
with check (public.is_crm_user());

drop policy if exists "Customers update by crm staff" on public.customers;
create policy "Customers update by crm staff"
on public.customers for update
using (public.is_crm_user())
with check (public.is_crm_user());

drop policy if exists "Customers delete by admin" on public.customers;
create policy "Customers delete by admin"
on public.customers for delete
using (public.is_admin());

-- =========================
-- Leads: link to customers + loss reason checks
-- =========================
alter table public.leads add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.leads add column if not exists phone_e164 text;
alter table public.leads add column if not exists lost_reason_note text;

update public.leads
set lost_reason = null
where lost_reason is not null
  and lost_reason not in ('budget','location','payment','timing','other');

alter table public.leads drop constraint if exists leads_lost_reason_check;
alter table public.leads add constraint leads_lost_reason_check
  check (lost_reason is null or lost_reason in ('budget','location','payment','timing','other'));

alter table public.leads drop constraint if exists leads_lost_reason_note_check;
alter table public.leads add constraint leads_lost_reason_note_check
  check (
    lost_reason is null
    or lost_reason <> 'other'
    or (lost_reason_note is not null and length(trim(lost_reason_note)) > 1)
  );

create index if not exists leads_phone_e164_idx on public.leads(phone_e164);
create index if not exists leads_customer_idx on public.leads(customer_id);

-- Allow CRM staff to read leads in CRM (assigned user still allowed via existing policy).
drop policy if exists "Leads read by crm staff" on public.leads;
create policy "Leads read by crm staff"
on public.leads for select
using (public.is_crm_user());

-- =========================
-- Lead sources dictionary
-- =========================
create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.lead_sources enable row level security;

drop policy if exists "Lead sources read by crm staff" on public.lead_sources;
create policy "Lead sources read by crm staff"
on public.lead_sources for select
using (public.is_crm_user());

drop policy if exists "Lead sources manage by admin" on public.lead_sources;
create policy "Lead sources manage by admin"
on public.lead_sources for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- CRM activities (calls/meetings/notes)
-- =========================
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  activity_type text not null
    check (activity_type in ('call_attempted','call_answered','meeting','note','follow_up','whatsapp','email')),
  outcome text,
  notes text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx on public.lead_activities(lead_id);
create index if not exists lead_activities_customer_idx on public.lead_activities(customer_id);
create index if not exists lead_activities_occurred_idx on public.lead_activities(occurred_at);

alter table public.lead_activities enable row level security;

drop policy if exists "Lead activities read by crm staff" on public.lead_activities;
create policy "Lead activities read by crm staff"
on public.lead_activities for select
using (public.is_crm_user());

drop policy if exists "Lead activities insert by crm staff" on public.lead_activities;
create policy "Lead activities insert by crm staff"
on public.lead_activities for insert
with check (public.is_crm_user());

drop policy if exists "Lead activities update by crm staff" on public.lead_activities;
create policy "Lead activities update by crm staff"
on public.lead_activities for update
using (public.is_crm_user())
with check (public.is_crm_user());

-- =========================
-- Owner follow-up scheduling on intake
-- =========================
alter table public.resale_intake add column if not exists next_owner_followup_at timestamptz;

-- =========================
-- Tighten attachment visibility for owner documents
-- =========================
drop policy if exists "Unit attachments read by staff or owner or published" on public.unit_attachments;
create policy "Unit attachments read by staff or owner or published"
on public.unit_attachments for select
using (
  (
    public.is_hrtaj_staff()
    and (
      category not in ('contract','owner_docs')
      or public.has_owner_access()
    )
  )
  or exists (
    select 1 from public.listings l
    where l.id = unit_attachments.listing_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
      )
      and (
        unit_attachments.category not in ('contract','owner_docs')
        or public.has_owner_access()
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
