-- Update public contact defaults

insert into public.site_settings (key, value)
values
  ('public_email', 'hrtajrealestate@gmail.com'),
  ('linkedin_url', 'https://www.linkedin.com/in/hrtaj-real-estate-519564307'),
  ('tiktok_url', 'https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD')
on conflict (key) do update set value = excluded.value;
