-- supabase/0009_public_lead_requests.sql
-- Allow generic web requests without a specific listing and capture intent/preferences.

alter table public.leads
  alter column listing_id drop not null;

alter table public.leads add column if not exists intent text;
alter table public.leads add column if not exists preferred_area text;
alter table public.leads add column if not exists budget_min numeric;
alter table public.leads add column if not exists budget_max numeric;
alter table public.leads add column if not exists preferred_contact_time text;
alter table public.leads add column if not exists notes text;

create index if not exists leads_intent_idx on public.leads(intent);
create index if not exists leads_preferred_area_idx on public.leads(preferred_area);
