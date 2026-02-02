-- Profile identity consistency and backfill

-- 1) Insert missing profiles for existing auth.users
insert into public.profiles (id, role, full_name, phone, email, last_sign_in_at, staff_code)
select
  u.id,
  'staff'::text,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email),
  u.phone,
  u.email,
  u.last_sign_in_at,
  'E' || substring(md5(gen_random_uuid()::text), 1, 8)
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- 2) Backfill missing profile identity fields from auth.users
update public.profiles p
set
  email = coalesce(p.email, u.email),
  phone = coalesce(p.phone, u.phone),
  full_name = coalesce(
    nullif(p.full_name, ''),
    nullif(u.raw_user_meta_data->>'full_name', ''),
    nullif(u.raw_user_meta_data->>'name', ''),
    u.email
  ),
  last_sign_in_at = coalesce(p.last_sign_in_at, u.last_sign_in_at)
from auth.users u
where u.id = p.id
  and (
    p.email is null
    or p.phone is null
    or p.full_name is null
    or p.full_name = ''
    or p.last_sign_in_at is null
  );

-- 3) Refine auth.users update trigger to keep fields in sync
create or replace function public.handle_auth_user_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  update public.profiles
    set email = new.email,
        phone = coalesce(new.phone, phone),
        full_name = coalesce(
          nullif(new.raw_user_meta_data->>'full_name', ''),
          nullif(new.raw_user_meta_data->>'name', ''),
          full_name
        ),
        last_sign_in_at = new.last_sign_in_at
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row execute function public.handle_auth_user_update();
