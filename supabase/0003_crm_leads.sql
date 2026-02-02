-- supabase/0003_crm_leads.sql
-- CRM enhancements for leads: status, assignments, notes, and RLS
-- Run after 0001 and 0002

-- Lead status enum (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum (
      'new',
      'contacted',
      'viewing_scheduled',
      'won',
      'lost'
    );
  end if;
end $$;

-- Leads: status + assignment + tags
alter table public.leads add column if not exists status public.lead_status not null default 'new';
alter table public.leads add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.leads add column if not exists tags text[] not null default '{}'::text[];

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists leads_created_at_idx on public.leads(created_at);

-- Lead notes (internal CRM notes)
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_idx on public.lead_notes(lead_id);
create index if not exists lead_notes_author_idx on public.lead_notes(author_user_id);

-- Optional assignments history (single row per lead)
create table if not exists public.lead_assignments (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lead_assignments_assigned_to_idx on public.lead_assignments(assigned_to);

-- RLS
alter table public.lead_notes enable row level security;
alter table public.lead_assignments enable row level security;

-- Leads: allow assigned user to read/update
drop policy if exists "Leads read by assigned user" on public.leads;
create policy "Leads read by assigned user"
on public.leads for select
using (assigned_to = auth.uid());

drop policy if exists "Leads update by admin or listing owner" on public.leads;
create policy "Leads update by admin or listing owner"
on public.leads for update
using (
  public.is_admin()
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
  public.is_admin()
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

-- Lead notes: admin + listing owners + developer members + assigned user
drop policy if exists "Lead notes read" on public.lead_notes;
create policy "Lead notes read"
on public.lead_notes for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.leads ld
    join public.listings l on l.id = ld.listing_id
    where ld.id = lead_notes.lead_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
        or ld.assigned_to = auth.uid()
      )
  )
);

drop policy if exists "Lead notes insert" on public.lead_notes;
create policy "Lead notes insert"
on public.lead_notes for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.leads ld
    join public.listings l on l.id = ld.listing_id
    where ld.id = lead_notes.lead_id
      and (
        l.owner_user_id = auth.uid()
        or (l.developer_id is not null and public.is_developer_member(l.developer_id))
        or ld.assigned_to = auth.uid()
      )
  )
  and author_user_id = auth.uid()
);

-- Lead assignments: admin only (optional)
drop policy if exists "Lead assignments manage by admin" on public.lead_assignments;
create policy "Lead assignments manage by admin"
on public.lead_assignments for all
using (public.is_admin())
with check (public.is_admin());
