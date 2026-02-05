# Supply Funnel Spec

**User Journeys**
- Buyer: lands on home hero, uses "????? ?????" primary CTA or quick search; optional "??? ??????" routes to `/callback` for contact preferences.
- Developer (B2B): visits `/supply` ? chooses "??? ???? ?????" ? submits `/supply/developer` intake with inventory summary, contact preferences, optional attachments.
- Owner/Broker (B2C): visits `/supply` ? chooses "??? ????/????" ? submits `/supply/owner` intake with unit details, contact preferences, optional photos/media links.

**CTA Placement Rationale**
- Hero remains buyer-first: primary CTA stays on search/discover, secondary CTA is "??? ??????".
- Supply entry is moved below hero/search in a dedicated section to avoid confusing buyer intent.
- Small nav/footer link "????? ?????" provides a consistent secondary access point without competing with the primary CTA.
- No supply CTA routes directly to WhatsApp; WhatsApp is only offered after submission when selected and available.

**Data Schema + RLS Matrix**
- `public.supply_developer_requests`
  - Key fields: `company_name`, `contact_person_name`, `phone`, `contact_method`, `preferred_time`, `projects_summary`, `inventory_type`, `attachments`, `status`, `internal_notes`, `created_at`
- `public.supply_owner_requests`
  - Key fields: `owner_type`, `full_name`, `phone`, `contact_method`, `preferred_time`, `property_type`, `purpose`, `area`, `photos`, `status`, `internal_notes`, `created_at`
- Storage: private bucket `supply-uploads` stores attachments/photos metadata as `jsonb` in the request rows.

| Table | Insert (Public) | Select (Admin/Owner) | Update (Admin/Owner) | Delete |
| --- | --- | --- | --- | --- |
| supply_developer_requests | ? (anon/auth) | ? via `public.is_admin()` | ? via `public.is_admin()` | ? |
| supply_owner_requests | ? (anon/auth) | ? via `public.is_admin()` | ? via `public.is_admin()` | ? |
| storage.objects (supply-uploads) | ? insert | ? select (admin) | ? update (admin) | ? delete (admin) |

**How To Verify**
- Automated: `npm run lint`, `npm run build`, `npm run test:e2e`.
- Playwright checks cover:
  - Supply CTA routes to `/supply` (not WhatsApp).
  - `/supply` shows both developer + owner options.
  - Developer/owner forms submit and show success state.
  - No horizontal overflow at 390/320 widths on supply/callback pages.
  - No corrupted "????" or raw `home.*` keys in rendered HTML.
- Manual smoke: visit `/supply`, `/supply/developer`, `/supply/owner`, `/callback` and confirm the CTA hierarchy.
