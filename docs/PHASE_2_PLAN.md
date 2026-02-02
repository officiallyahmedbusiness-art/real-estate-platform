# Phase 2 Plan

<!--
1) Design system + theme tokens
   - Introduce CSS variables for bg/surface/text/border/accent and three themes.
   - Update shared UI components to consume tokens and unify spacing/typography.
   - Add ThemeScript + ThemeSwitcher (localStorage persistence).

2) UX refresh across public pages
   - Home: premium hero, feature stats, category chips, featured listings grid.
   - Listings: filter panel, result summary, refined cards, empty states.
   - Listing detail: gallery, agent card, amenities, lead form with status.

3) Role layers & navigation
   - Role-aware header (guest/admin/ops/staff/agent/developer) + protected routes remain.
   - Improve /dashboard to be non-debug, action oriented.

4) CRM leads system
   - New SQL migration for lead status, notes, assignments.
   - Add server actions for status updates, notes, assignments.
   - UI: /account "My Leads", /developer leads table, /admin global leads.

5) Security hardening
   - SQL migration to set function search_path and make views security invoker.
   - README instructions for leaked password protection toggle.

6) Cleanup + verification
   - Remove debug/test routes; run build; verify role redirects and theme switching.
-->
