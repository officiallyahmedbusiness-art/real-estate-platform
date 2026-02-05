-- Enable admin access for site settings and remove legacy defaults.

alter table public.site_settings enable row level security;

-- Drop old policies if present

drop policy if exists "Site settings read by all" on public.site_settings;
drop policy if exists "Site settings write by owner" on public.site_settings;
drop policy if exists "Site settings read by admin" on public.site_settings;
drop policy if exists "Site settings write by admin" on public.site_settings;

-- Admin + owner can read/write settings

create policy "Site settings read by admin"
  on public.site_settings for select
  using (public.is_admin());

create policy "Site settings write by admin"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Remove legacy default values (only when they match known placeholders)

delete from public.site_settings
where key = 'facebook_url' and value = 'https://www.facebook.com/share/1C1fQLJD2W/';

delete from public.site_settings
where key = 'instagram_url' and value = 'https://www.instagram.com/hrtaj.co';

delete from public.site_settings
where key = 'linkedin_url' and value = 'https://www.linkedin.com/in/hrtaj-real-estate-519564307';

delete from public.site_settings
where key = 'tiktok_url' and value = 'https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD';

delete from public.site_settings
where key = 'public_email' and value in ('hrtaj4realestate@gmail.com','hrtajrealestate@gmail.com');

delete from public.site_settings
where key = 'whatsapp_number' and value = '+201020614022';

delete from public.site_settings
where key = 'whatsapp_link' and value = 'https://wa.me/201020614022';
