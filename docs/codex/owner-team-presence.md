# Owner Dashboard: Team Presence + Work Hours

## Summary
Adds live presence tracking and work-hours reporting for authenticated team users (owner/admin/ops/staff/agent/developer). Presence pings are sent only from `/team/*` routes, and the owner dashboard reads aggregated data server-side.

## Schema
### `public.team_sessions`
- `id uuid` PK (default `gen_random_uuid()`)
- `user_id uuid` FK -> `auth.users(id)`
- `started_at timestamptz` default `now()`
- `last_seen_at timestamptz` default `now()`
- `ended_at timestamptz` nullable
- `user_agent text` nullable
- `ip_hash text` nullable (SHA-256 of IP)

### Views
- `public.report_team_time_today`  
  Summed minutes for the current day, per user.
- `public.report_team_time_7d`  
  Summed minutes for the last 7 days, per user.

## RLS Summary
`team_sessions`:
- `SELECT`: `public.is_crm_user()` or `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`

Views are created with `security_invoker` so RLS applies from the underlying table.

## Presence Logic
- Client runs only under `/team/*` (skips `/team/login`).
- On mount: `POST /api/team/ping` creates or updates a session row.
- Heartbeat:
  - Visible tab: every 60s
  - Hidden tab: every 180s (enables idle detection)
- On tab close: `POST /api/team/end` with `keepalive` to set `ended_at`.

Status rules:
- **Online**: `now - last_seen_at <= 2 minutes`
- **Idle**: `2-10 minutes`
- **Offline**: `> 10 minutes` or `ended_at` is set

## Work Hours
Owner dashboard uses the views to compute:
- Today minutes (current day)
- Last 7 days minutes

Displayed in `HH:MM` format.

## Owner Key Rotation
1. Generate a new strong `OWNER_SECRET` (32-64 chars).
2. Update Vercel **Production** environment variable `OWNER_SECRET`.
3. Redeploy production.
4. Old owner tokens become invalid immediately.

## Post-Migration Status
- The `team_sessions` table and time-report views are now present in production.
- `/api/team/ping` returns a non-500 status (401/403 without auth; 200 with auth).
- Use the proof checklist in `docs/codex/team-presence-db-proof.md` to re-verify.
