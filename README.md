This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
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

## Environment variables

- Create `.env.local` in the project root (same folder as `package.json`).
- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- After editing `.env.local`, delete the `.next` folder and restart `npm run dev` so client bundles pick up the values.
- Verify env presence at runtime via `http://localhost:3000/api/env-check` (returns only booleans; does not expose secrets).

## Supabase setup

1) Run the schema and RLS policies:
   - `supabase/0001_real_estate_schema.sql`
2) If you already ran an earlier schema, apply the patch:
   - `supabase/0002_partner_role_and_leads_policy.sql`
3) Storage:
   - The SQL creates the `property-images` bucket and policies.
   - Verify bucket exists in Supabase Storage and that policies are enabled.

## Roles & profile bootstrap

- On first login, `/api/profile-bootstrap` ensures a `profiles` row exists.
- Partners/developers submit listings as draft; admins approve/publish in `/admin`.
- To set roles manually (admin-only):
```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
update public.profiles set role = 'partner' where id = '<user-uuid>';
```
- Admin UI also allows role changes at `/admin`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.