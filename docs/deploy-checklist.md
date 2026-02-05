# Deploy Checklist

## Build & Tests
1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:e2e`
5. Optional: `npm run seed:admin` (owner admin seed)

## Required env vars
- `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_APP_URL`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OWNER_SECRET` (owner unlock)

## Supabase Auth URL config
- Site URL: `https://hrtaj.com`
- Redirect URLs: `https://hrtaj.com/*` and `https://hrtaj.com/auth/callback` (if using callback route)

## Smoke checks
- Home page renders and brand shows "هارتچ".
- `/listings` filters load and URL reflects filters.
- `/listing/:id` shows gallery and sticky CTA.
- `/health` returns `{ status: "ok" }`.

## Rollback
- Vercel: redeploy previous successful deployment.
- Database migrations: revert using last stable migration snapshot.

