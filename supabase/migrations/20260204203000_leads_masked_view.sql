-- Masked leads view + tightened select policies for non-owner access.

-- Ensure lead_status includes negotiation (idempotent).
alter type public.lead_status add value if not exists 'negotiation';

-- Restrict base leads select to owner + lead owner only.
alter table public.leads enable row level security;

drop policy if exists "Leads select by crm staff" on public.leads;
drop policy if exists "Leads select by owner" on public.leads;
drop policy if exists "Leads select by lead owner" on public.leads;
drop policy if exists "Leads read by assigned user" on public.leads;
drop policy if exists "Leads read by admin or listing owner" on public.leads;

create policy "Leads select by owner"
on public.leads for select
using (public.is_owner());

create policy "Leads select by lead owner"
on public.leads for select
using (user_id = auth.uid());

-- Masked view for CRM + developer visibility (security definer to bypass base RLS).
drop view if exists public.leads_masked;

create or replace function public.get_leads_masked()
returns table (
  id uuid,
  listing_id uuid,
  customer_id uuid,
  user_id uuid,
  name text,
  phone text,
  phone_e164 text,
  phone_normalized text,
  email text,
  message text,
  status text,
  lead_source text,
  assigned_to uuid,
  created_at timestamptz,
  intent text,
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  lost_reason text,
  lost_reason_note text,
  next_action_at timestamptz,
  listing_title text,
  listing_city text,
  listing_area text
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  select
    ld.id,
    ld.listing_id,
    ld.customer_id,
    ld.user_id,
    ld.name,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone,
    case
      when ld.phone_e164 is not null then concat('***', right(ld.phone_e164, 3))
      when ld.phone is not null then concat('***', right(ld.phone, 3))
      else null
    end as phone_e164,
    null::text as phone_normalized,
    case
      when ld.email is not null then regexp_replace(ld.email, '(^.).*(@.*$)', '\\1***\\2')
      else null
    end as email,
    case
      when ld.message is not null then left(ld.message, 20)
      when ld.notes is not null then left(ld.notes, 20)
      else null
    end as message,
    ld.status,
    ld.lead_source,
    ld.assigned_to,
    ld.created_at,
    ld.intent,
    ld.preferred_area,
    ld.budget_min,
    ld.budget_max,
    ld.lost_reason,
    ld.lost_reason_note,
    ld.next_action_at,
    l.title as listing_title,
    l.city as listing_city,
    l.area as listing_area
  from public.leads ld
  left join public.listings l on l.id = ld.listing_id
  where public.is_crm_user()
     or (l.developer_id is not null and public.is_developer_member(l.developer_id))
     or l.owner_user_id = auth.uid();
$$;

create or replace view public.leads_masked
as
select * from public.get_leads_masked();

grant execute on function public.get_leads_masked() to authenticated;
grant select on public.leads_masked to authenticated;
