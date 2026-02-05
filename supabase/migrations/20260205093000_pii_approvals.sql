-- PII change request workflow + admin-safe CRM operations

-- 1) Change request table
create table if not exists public.pii_change_requests (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  review_note text null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_action_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_action_check
      check (action in ('update_pii','soft_delete','hard_delete_request'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pii_change_requests_status_check') then
    alter table public.pii_change_requests
      add constraint pii_change_requests_status_check
      check (status in ('pending','approved','rejected'));
  end if;
end $$;

create index if not exists pii_change_requests_status_idx
  on public.pii_change_requests (status, requested_at);

alter table public.pii_change_requests enable row level security;

drop policy if exists "PII change insert by admin" on public.pii_change_requests;
drop policy if exists "PII change select by owner or requester" on public.pii_change_requests;
drop policy if exists "PII change update by owner" on public.pii_change_requests;

create policy "PII change insert by admin"
  on public.pii_change_requests for insert
  with check (public.is_admin());

create policy "PII change select by owner or requester"
  on public.pii_change_requests for select
  using (public.is_owner() or requested_by = auth.uid());

create policy "PII change update by owner"
  on public.pii_change_requests for update
  using (public.is_owner())
  with check (public.is_owner());

-- 2) Masked customers view (for staff/ops/agent)
create or replace function public.get_customers_masked()
returns table (
  id uuid,
  full_name text,
  phone text,
  phone_e164 text,
  email text,
  intent text,
  preferred_areas text[],
  budget_min numeric,
  budget_max numeric,
  lead_source text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    c.id,
    c.full_name,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone,
    case
      when c.phone_e164 is not null then concat('***', right(c.phone_e164, 3))
      when c.phone_raw is not null then concat('***', right(c.phone_raw, 3))
      else null
    end as phone_e164,
    case
      when c.email is not null then regexp_replace(c.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    c.intent,
    c.preferred_areas,
    c.budget_min,
    c.budget_max,
    c.lead_source,
    c.created_at
  from public.customers c
  where public.is_crm_user();
$$;

drop view if exists public.customers_masked;
create or replace view public.customers_masked
as select * from public.get_customers_masked();

grant execute on function public.get_customers_masked() to authenticated;
grant select on public.customers_masked to authenticated;

-- 3) Update policies for customers and leads (admin can update non-PII)
alter table public.customers enable row level security;

drop policy if exists "Customers select by crm staff" on public.customers;
drop policy if exists "Customers update by owner" on public.customers;

create policy "Customers select by admin"
  on public.customers for select
  using (public.is_admin());

create policy "Customers update by admin"
  on public.customers for update
  using (public.is_admin())
  with check (public.is_admin());

alter table public.leads enable row level security;

drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads update by owner" on public.leads;

create policy "Leads select by admin"
  on public.leads for select
  using (public.is_admin());

create policy "Leads update by admin"
  on public.leads for update
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Lead assignments: allow admin (owner passes via is_admin)
alter table public.lead_assignments enable row level security;

drop policy if exists "Lead assignments insert by owner" on public.lead_assignments;
drop policy if exists "Lead assignments update by owner" on public.lead_assignments;
drop policy if exists "Lead assignments delete by owner" on public.lead_assignments;

create policy "Lead assignments insert by admin"
  on public.lead_assignments for insert
  with check (public.is_admin());

create policy "Lead assignments update by admin"
  on public.lead_assignments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Lead assignments delete by admin"
  on public.lead_assignments for delete
  using (public.is_admin());

-- 5) Block non-owner PII edits via triggers
create or replace function public.block_lead_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.name, '') is distinct from coalesce(old.name, '')
     or coalesce(new.phone, '') is distinct from coalesce(old.phone, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.phone_normalized, '') is distinct from coalesce(old.phone_normalized, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
     or coalesce(new.message, '') is distinct from coalesce(old.message, '')
     or coalesce(new.notes, '') is distinct from coalesce(old.notes, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_lead_pii_updates on public.leads;
create trigger block_lead_pii_updates
  before update on public.leads
  for each row execute function public.block_lead_pii_updates();

create or replace function public.block_customer_pii_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if public.is_owner() then
    return new;
  end if;

  if coalesce(new.full_name, '') is distinct from coalesce(old.full_name, '')
     or coalesce(new.phone_raw, '') is distinct from coalesce(old.phone_raw, '')
     or coalesce(new.phone_e164, '') is distinct from coalesce(old.phone_e164, '')
     or coalesce(new.email, '') is distinct from coalesce(old.email, '')
  then
    raise exception 'PII update requires owner approval';
  end if;

  return new;
end;
$$;

drop trigger if exists block_customer_pii_updates on public.customers;
create trigger block_customer_pii_updates
  before update on public.customers
  for each row execute function public.block_customer_pii_updates();

-- 6) Owner approval RPCs
create or replace function public.approve_pii_change(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  req record;
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  select * into req
  from public.pii_change_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if req.status <> 'pending' then
    raise exception 'request already reviewed';
  end if;

  if req.action = 'update_pii' then
    if req.table_name = 'leads' then
      update public.leads
      set
        name = coalesce(req.payload->>'name', name),
        phone = coalesce(req.payload->>'phone', phone),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        phone_normalized = coalesce(req.payload->>'phone_normalized', phone_normalized),
        email = coalesce(req.payload->>'email', email),
        message = coalesce(req.payload->>'message', message),
        notes = coalesce(req.payload->>'notes', notes)
      where id = req.row_id;
    elsif req.table_name = 'customers' then
      update public.customers
      set
        full_name = coalesce(req.payload->>'full_name', full_name),
        phone_raw = coalesce(req.payload->>'phone_raw', phone_raw),
        phone_e164 = coalesce(req.payload->>'phone_e164', phone_e164),
        email = coalesce(req.payload->>'email', email)
      where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  elsif req.action in ('hard_delete_request','soft_delete') then
    if req.table_name = 'leads' then
      delete from public.leads where id = req.row_id;
    elsif req.table_name = 'customers' then
      delete from public.customers where id = req.row_id;
    else
      raise exception 'unsupported table';
    end if;
  end if;

  update public.pii_change_requests
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = req.id;
end;
$$;

create or replace function public.reject_pii_change(request_id uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_owner() then
    raise exception 'not authorized';
  end if;

  update public.pii_change_requests
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = reason
  where id = request_id
    and status = 'pending';
end;
$$;

grant execute on function public.approve_pii_change(uuid) to authenticated;
grant execute on function public.reject_pii_change(uuid, text) to authenticated;

