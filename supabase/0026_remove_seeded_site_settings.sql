-- Remove any seeded/placeholder site settings to keep defaults NULL.
delete from public.site_settings
where key in (
  'facebook_url',
  'public_email',
  'whatsapp_number',
  'whatsapp_link',
  'linkedin_url',
  'tiktok_url'
);
