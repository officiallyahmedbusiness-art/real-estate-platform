# Team Portal — CRM Integration Report

## Existing CRM Entities Found
- `public.leads` (+ `lead_notes`, `lead_assignments`, `lead_activities`)
- `public.customers` (+ masked views)
- `public.listings` + `public.projects` submission workflow
- `public.developers` + `public.developer_members`
- CRM UI routes under `/crm` and admin review under `/admin`

## Reused vs Newly Created
- Reused:
  - `developers` / `developer_members` for partner org + membership
  - `projects` + `listings` submission workflow for partner supply
  - `/developer` partner portal for creating projects/units
  - `/crm` for CRM intake
  - `/admin` review flows and submission status actions
- Newly created (UI only):
  - `/team/*` routes as a thin internal partition wrapper
  - `/team/tools/cleanup` owner-only settings cleanup
- New tables/columns: **None**

## Relationship Diagram (Text)
- Partner org (`developers`) ↔ members (`developer_members`) ↔ user profiles (`profiles`)
- Partner submissions → `projects` + `listings` (submission_status workflow)
- CRM intake → `leads` / `customers` (existing)

## Migrations (Additive)
- None added in this change set.

## Risks & Mitigations
- Risk: duplicating CRM storage for partner supply  
  - Mitigation: reused `projects`/`listings` and existing review workflow.
- Risk: exposing internal routes  
  - Mitigation: `/team/*` uses server-side auth gate redirecting to `/team/login`.
