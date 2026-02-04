# UI/UX Audit & Fixes

## Stack Snapshot
- Framework: Next.js 16.1.4 (App Router)
- Styling: Tailwind v4 via `src/app/globals.css` + UI primitives in `src/components/ui.tsx`
- Fonts: `next/font/google` (Geist, Cairo, Noto Sans Arabic)
- i18n: `src/lib/i18n.ts` dictionary + `createT`
- Brand source: `src/lib/brand.ts` (Arabic/Latin constants)
- SSR: Server components + Supabase server client

## Findings (Pre-fix)
- Brand Arabic spelling inconsistent post-hydration (client replacement/fallback path).
- Mobile spacing/typography not tuned; some sections feel “desktop shrunk”.
- Floating WhatsApp CTA can overlap inputs/CTAs on small screens.
- CSS reliability risk: background-attachment on mobile + post-hydration DOM text replacement.

## Fix Summary
- Brand source of truth set to `BRAND_AR_NAME` with explicit `\u0686` and removed DOM replacement fallback.
- Added sticky header compact mode on scroll + safe-area handling for notch devices.
- Introduced global mobile typography scaling, safe-area variables, and input sizing.
- Floating WhatsApp button now respects safe-area and hides on input focus (mobile).
- Added listings skeleton loading state.

## CSS Reliability Notes
- Global CSS is imported exactly once in `src/app/layout.tsx`.
- No service worker / PWA caching detected.
- Removed client-side brand replacement to avoid hydration-side DOM mutation.
