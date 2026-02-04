This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# If you see a .next/dev/lock error on Windows:
npm run dev:clean
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Dev server lock (Windows)

If you see "Unable to acquire lock at .next/dev/lock", use:

```bash
npm run dev:clean
```

`dev:clean` attempts to stop any running `next dev` processes, removes `.next/dev/lock` (and the `.next` folder), then restarts dev. If the lock persists, close any running Node/Next terminals or run:

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'next dev' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

## Environment variables

- Create `.env.local` in the project root (same folder as `package.json`).
- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional (server-only):
  - `HRTAJ_API_URL` (FastAPI base URL, e.g. `http://localhost:8000`)
  - `HRTAJ_ADMIN_API_KEY` (admin report access key)
  - `HRTAJ_IMPORT_API_KEY` (import access key)
  - `HRTAJ_LEADS_API_KEY` (FastAPI leads endpoints key)
- Optional (public):
  - `NEXT_PUBLIC_WHATSAPP_NUMBER` (WhatsApp contact number, digits only)
  - `NEXT_PUBLIC_ABOUT_VIDEO_ID` (YouTube video id for /about)
- Optional (server-only):
  - `OWNER_SECRET` (required to unlock the hidden owner panel at `/owner`)
  - `SUPABASE_SERVICE_ROLE_KEY` (required for server-side user invites)
- After editing `.env.local`, delete the `.next` folder and restart `npm run dev` so client bundles pick up the values.

## Supabase setup

1) Run the schema and RLS policies:
   - `supabase/0001_real_estate_schema.sql`
2) If you already ran an earlier schema, apply the patch:
   - `supabase/0002_partner_role_and_leads_policy.sql`
3) CRM enhancements:
   - `supabase/0003_crm_leads.sql`
4) Security hardening (search_path + security invoker views):
   - `supabase/0004_security_hardening.sql`
5) Security lint fixes (admin-only reporting + search_path hardening):
   - `supabase/0005_security_lint_fixes.sql`
6) Submission workflow + projects (developer portal):
   - `supabase/0006_submission_workflow.sql`
7) Python import support + SLA fields:
   - `supabase/0007_python_import_support.sql`
8) Unit attachments (staff media library):
   - `supabase/0008_unit_attachments.sql`
9) Public lead requests:
   - `supabase/0009_public_lead_requests.sql`
10) Staff resale fields:
   - `supabase/0010_staff_resale_fields.sql`
11) Super admin analytics scaffolding:
   - `supabase/0011_super_admin_analytics.sql`
12) Ops/CRM/visits/careers:
   - `supabase/0012_ops_crm_visits_careers.sql`
13) Storage:
   - The SQL creates the `property-images` bucket and policies.
   - Verify bucket exists in Supabase Storage and that policies are enabled.
   - Create a `property-attachments` bucket for unit attachments (private by default).
   - Create a `property-docs` bucket for private owner/contract documents.
   - Create a `career-uploads` bucket for CV uploads (private by default).
   - Add Storage policies for the buckets above to allow staff signed URL access.
14) Owner/Contact settings defaults:
   - `supabase/0020_update_contact_settings.sql`
15) Report permissions hardening:
   - `supabase/0021_fix_report_permissions.sql`
16) User management safeguards:
   - `supabase/0026_manage_users_rbac.sql`

## Supabase security settings

- Enable leaked password protection:
  - Supabase Dashboard -> Authentication -> Settings -> Password Protection -> Enable "Leaked password protection".

## Roles & profile bootstrap (current)

- On first login, `/api/profile-bootstrap` ensures a `profiles` row exists.
- Current roles (Supabase `profiles.role`):
  - `owner` | `admin` | `ops` | `staff` | `agent` | `developer`
- Developers submit projects as draft; admins approve/publish in `/admin`.
- To set roles manually:
```sql
update public.profiles set role = 'owner' where id = '<user-uuid>';
update public.profiles set role = 'admin' where id = '<user-uuid>';
update public.profiles set role = 'ops' where id = '<user-uuid>';
update public.profiles set role = 'staff' where id = '<user-uuid>';
update public.profiles set role = 'agent' where id = '<user-uuid>';
update public.profiles set role = 'developer' where id = '<user-uuid>';
```
- Owner-only pages are under `/owner/*` and require `OWNER_SECRET`.
- Owner/Admin can invite users (admin or staff) from:
  - `/owner/users` (owner or admin)
  - `/admin` (User management section)
- Admins cannot promote users to owner or edit the owner account.

## Data model notes

- See `docs/DATA_MODEL.md` for a concise ERD-style overview of core tables and CRM fields.

## HRTAJ API (FastAPI service)

The FastAPI service lives under `services/hrtaj_api` and powers:
- staff and developer CSV/Excel imports,
- lead scoring + routing,
- admin reporting (server-only, no security definer views required).

### Local run

```bash
cd services/hrtaj_api
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

### Docker (optional)

```bash
docker compose up --build hrtaj_api
```

### Required env vars (.env in services/hrtaj_api)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HRTAJ_ADMIN_API_KEY` (required in production)
- `HRTAJ_IMPORT_API_KEY` (required in production)
- `HRTAJ_LEADS_API_KEY` (required in production for /v1/leads/*)
- `HRTAJ_STAFF_OWNER_USER_ID` (staff user id for resale imports)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
