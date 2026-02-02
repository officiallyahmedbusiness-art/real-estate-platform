-- 0002 minimal + safe
-- Ensures:
-- 1) lead owner can read their own leads
-- 2) (re)apply non-admin publish restriction via listing insert/update policies

-- (A) Leads: lead owner can read own leads (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'leads'
      and policyname = 'Leads read by lead owner'
  ) then
    execute 'create policy "Leads read by lead owner" on public.leads for select using (user_id = auth.uid())';
  end if;
end $$;

-- (B) Listings policies: enforce publish restriction
drop policy if exists "Listings insert by owner or admin" on public.listings;
drop policy if exists "Listings update by owner or admin" on public.listings;

create policy "Listings insert by owner or admin"
on public.listings for insert
with check (
  (
    public.is_admin()
    or owner_user_id = auth.uid()
    or (
      developer_id is not null
      and public.is_developer_member(developer_id)
      and owner_user_id = auth.uid()
    )
  )
  and (status <> 'published' or public.is_admin())
);

create policy "Listings update by owner or admin"
on public.listings for update
using (
  public.is_admin()
  or owner_user_id = auth.uid()
  or (developer_id is not null and public.is_developer_member(developer_id))
)
with check (
  (
    public.is_admin()
    or owner_user_id = auth.uid()
    or (developer_id is not null and public.is_developer_member(developer_id))
  )
  and (status <> 'published' or public.is_admin())
);
