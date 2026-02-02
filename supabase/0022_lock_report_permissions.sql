-- Lock down report_* views so they are NOT directly readable by authenticated users.
-- Recommended approach: read reports ONLY via your server/API (/api/hrtaj-reports)
-- using service_role or server-side Supabase client.

begin;

-- Revoke everything from all common roles
revoke all on public.report_units_per_day from public, anon, authenticated;
revoke all on public.report_leads_per_day from public, anon, authenticated;
revoke all on public.report_leads_per_listing from public, anon, authenticated;
revoke all on public.report_top_developers from public, anon, authenticated;

-- Optional: also revoke from "public" (Postgres PUBLIC role) explicitly
revoke all on public.report_units_per_day from public;
revoke all on public.report_leads_per_day from public;
revoke all on public.report_leads_per_listing from public;
revoke all on public.report_top_developers from public;

-- Allow service_role to read reports (server-side only).
-- If your project doesn't recognize service_role here, remove these 4 GRANT lines and rely on service role being owner.
grant select on public.report_units_per_day to service_role;
grant select on public.report_leads_per_day to service_role;
grant select on public.report_leads_per_listing to service_role;
grant select on public.report_top_developers to service_role;

commit;

-- Notes:
-- 1) This intentionally removes SELECT for authenticated users, even if views have public.is_admin() WHERE clauses.
--    That prevents accidental leaks if view predicates are changed later.
-- 2) Your /api/hrtaj-reports route (protected by requireRole(owner/admin)) should query these views server-side.
