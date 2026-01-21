-- Add partner role to profiles check + allow users to read their own leads

do $$
declare
  constraint_name text;
begin
  select conname
    into constraint_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%role in%';

  if constraint_name is not null then
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end if;

  begin
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user','developer','partner','admin'));
  exception
    when duplicate_object then
      null;
  end;
end $$;

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

drop policy if exists "Listings insert by owner or admin" on public.listings;
drop policy if exists "Listings update by owner or admin" on public.listings;

create policy "Listings insert by owner or admin"
on public.listings for insert
with check (
  (public.is_admin() or owner_user_id = auth.uid()
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
  (public.is_admin()
    or owner_user_id = auth.uid()
    or (developer_id is not null and public.is_developer_member(developer_id))
  )
  and (status <> 'published' or public.is_admin())
);
