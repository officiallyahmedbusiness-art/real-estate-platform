-- Supply request intake tables + storage bucket policies.

create table if not exists public.supply_developer_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person_name text not null,
  role_title text null,
  phone text not null,
  email text null,
  contact_method text not null,
  preferred_time text not null,
  preferred_day text null,
  preferred_contact_notes text null,
  contact_reason text null,
  city text null,
  projects_summary text not null,
  inventory_type text not null,
  unit_count_estimate int null,
  brochure_url text null,
  attachments jsonb null,
  cooperation_terms_interest text null,
  status text not null default 'new',
  internal_notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.supply_owner_requests (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  full_name text not null,
  phone text not null,
  email text null,
  contact_method text not null,
  preferred_time text not null,
  preferred_day text null,
  contact_reason text null,
  property_type text not null,
  purpose text not null,
  area text not null,
  address_notes text null,
  size_m2 int null,
  rooms int null,
  baths int null,
  price_expectation numeric null,
  ready_to_show boolean null,
  photos jsonb null,
  media_link text null,
  notes text null,
  status text not null default 'new',
  internal_notes text null,
  created_at timestamptz not null default now()
);

alter table public.supply_developer_requests
  add constraint if not exists supply_developer_contact_method_check
    check (contact_method in ('whatsapp', 'call', 'email')),
  add constraint if not exists supply_developer_preferred_time_check
    check (preferred_time in ('morning', 'afternoon', 'evening', 'any')),
  add constraint if not exists supply_developer_inventory_type_check
    check (inventory_type in ('مشروع كامل', 'وحدات متفرقة', 'مرحلة')),
  add constraint if not exists supply_developer_status_check
    check (status in ('new', 'in_review', 'contacted', 'approved', 'rejected'));

alter table public.supply_owner_requests
  add constraint if not exists supply_owner_contact_method_check
    check (contact_method in ('whatsapp', 'call', 'email')),
  add constraint if not exists supply_owner_preferred_time_check
    check (preferred_time in ('morning', 'afternoon', 'evening', 'any')),
  add constraint if not exists supply_owner_type_check
    check (owner_type in ('مالك', 'وسيط', 'مفوّض')),
  add constraint if not exists supply_owner_purpose_check
    check (purpose in ('بيع', 'إيجار')),
  add constraint if not exists supply_owner_status_check
    check (status in ('new', 'in_review', 'contacted', 'approved', 'rejected'));

create index if not exists supply_developer_status_idx
  on public.supply_developer_requests(status);
create index if not exists supply_developer_created_idx
  on public.supply_developer_requests(created_at);
create index if not exists supply_owner_status_idx
  on public.supply_owner_requests(status);
create index if not exists supply_owner_created_idx
  on public.supply_owner_requests(created_at);

alter table public.supply_developer_requests enable row level security;
alter table public.supply_owner_requests enable row level security;

drop policy if exists "Supply developer insert by anyone" on public.supply_developer_requests;
create policy "Supply developer insert by anyone"
on public.supply_developer_requests for insert
with check (true);

drop policy if exists "Supply developer select by admin" on public.supply_developer_requests;
create policy "Supply developer select by admin"
on public.supply_developer_requests for select
using (public.is_admin());

drop policy if exists "Supply developer update by admin" on public.supply_developer_requests;
create policy "Supply developer update by admin"
on public.supply_developer_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Supply owner insert by anyone" on public.supply_owner_requests;
create policy "Supply owner insert by anyone"
on public.supply_owner_requests for insert
with check (true);

drop policy if exists "Supply owner select by admin" on public.supply_owner_requests;
create policy "Supply owner select by admin"
on public.supply_owner_requests for select
using (public.is_admin());

drop policy if exists "Supply owner update by admin" on public.supply_owner_requests;
create policy "Supply owner update by admin"
on public.supply_owner_requests for update
using (public.is_admin())
with check (public.is_admin());

-- Storage bucket for supply uploads (private bucket + admin access).
insert into storage.buckets (id, name, public)
values ('supply-uploads', 'supply-uploads', false)
on conflict (id) do nothing;

drop policy if exists "Supply uploads insert by anyone" on storage.objects;
create policy "Supply uploads insert by anyone"
on storage.objects for insert
with check (bucket_id = 'supply-uploads');

drop policy if exists "Supply uploads select by admin" on storage.objects;
create policy "Supply uploads select by admin"
on storage.objects for select
using (bucket_id = 'supply-uploads' and public.is_admin());

drop policy if exists "Supply uploads update by admin" on storage.objects;
create policy "Supply uploads update by admin"
on storage.objects for update
using (bucket_id = 'supply-uploads' and public.is_admin())
with check (bucket_id = 'supply-uploads' and public.is_admin());

drop policy if exists "Supply uploads delete by admin" on storage.objects;
create policy "Supply uploads delete by admin"
on storage.objects for delete
using (bucket_id = 'supply-uploads' and public.is_admin());
