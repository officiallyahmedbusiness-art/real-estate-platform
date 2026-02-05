# RBAC + PII Approval Workflow

Date: 2026-02-05

## Roles
- Owner: full control; approves PII changes and deletions; manages users/roles; owner profile is immutable to non-owners.
- Admin: operational control; can manage users except owner; cannot hard-delete PII; PII edits require approval.

## Database (Supabase)
- New table: `public.pii_change_requests`.
  - `action`: `update_pii` | `soft_delete` | `hard_delete_request`
  - `status`: `pending` | `approved` | `rejected`
- RLS:
  - Insert: `public.is_admin()`
  - Select: owner or requester
  - Update: owner only
- Triggers:
  - `block_lead_pii_updates` and `block_customer_pii_updates` reject PII changes unless owner.
  - `prevent_owner_profile_mutation` rejects updates/deletes to owner profile by non-owners and blocks non-owner role escalation to owner.

## Owner immutability + Admin user management
- Profiles RLS:
  - Admin/owner can read all profiles; users can read their own.
  - Admin can update non-owner profiles; cannot touch owner rows or set role=owner.
  - Owner can update any profile; delete non-owner profiles.
- Admin audit log:
  - `public.admin_audit_log` stores admin/user management actions (no PII beyond email).

## Approval RPCs
- `public.approve_pii_change(request_id uuid)` (owner-only, SECURITY DEFINER)
- `public.reject_pii_change(request_id uuid, reason text)` (owner-only)

## Application Flow
- Admin submits a PII change request when editing customer PII or requesting delete.
- Owner reviews pending requests at `/admin/approvals` and approves/rejects.
- Hard delete is executed only when owner approves.

## API / Server Actions
- `POST /api/pii-requests` for admin requests (server-only).
- `POST /api/owner/invite-admin` for owner-only admin invitation/promotion.
- `POST /api/admin/users/invite` for admin/owner invites (non-owner roles only).
- `POST /api/admin/users/update-role` to update role with owner immutability guard.
- `POST /api/admin/users/disable` to disable/enable users (owner immune).

## Seed Script
- `node scripts/seed_admin_user.mjs` (uses service role key) to invite/promote:
  - `Foxm575@gmail.com` / `01020614022`

## Invite acceptance flow (admin)
1. Owner or admin triggers invite (admin invite is non-owner roles only).
2. Supabase sends an email invite to the user.
3. User clicks the invite link, sets password, and completes onboarding.
4. User signs in at `https://hrtaj.com/auth` and is routed by role.

