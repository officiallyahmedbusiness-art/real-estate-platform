-- Restrict report_* views to admin/owner only.
-- NOTE: views already include public.is_admin() predicate; this hardens grants.

revoke all on public.report_units_per_day from public, anon, authenticated;
revoke all on public.report_leads_per_day from public, anon, authenticated;
revoke all on public.report_leads_per_listing from public, anon, authenticated;
revoke all on public.report_top_developers from public, anon, authenticated;

-- Allow authenticated users to select ONLY if they pass public.is_admin() predicate.
-- (Admin/owner are authenticated; non-admin get zero rows due to view WHERE.)
grant select on public.report_units_per_day to authenticated;
grant select on public.report_leads_per_day to authenticated;
grant select on public.report_leads_per_listing to authenticated;
grant select on public.report_top_developers to authenticated;
