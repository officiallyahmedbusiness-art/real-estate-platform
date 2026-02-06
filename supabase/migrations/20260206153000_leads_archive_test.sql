-- Lead status extensions + soft delete + assigned updates

-- Extend lead_status enum for archive/test flows
alter type public.lead_status add value if not exists 'closed';
alter type public.lead_status add value if not exists 'archived';
alter type public.lead_status add value if not exists 'test';

-- Soft delete markers
alter table public.leads add column if not exists deleted_at timestamptz;
alter table public.leads add column if not exists deleted_by uuid references auth.users(id) on delete set null;

-- Allow assigned staff to update their own leads (non-PII changes only)
drop policy if exists "Leads update by assigned user" on public.leads;
create policy "Leads update by assigned user"
on public.leads for update
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());
