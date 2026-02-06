# Team Presence DB Proof (Production)

Date: 2026-02-06

## Previous Blocker
- Team presence endpoints returned 500 because `team_sessions` and report views were not available in production.
- The migration `supabase/migrations/20260206120000_team_presence.sql` has now been applied in the Supabase SQL editor.

## Schema Existence Proof (Service Role, Server-side)
```
TEAM_SESSIONS_SELECT_OK=true rowCount=0
REPORT_TODAY_SELECT_OK=true rowCount=0
REPORT_7D_SELECT_OK=true rowCount=0
```

## API Health Proof (Production)
```
curl.exe -sI -H "Cache-Control: no-cache" https://hrtaj.com/api/team/ping
HTTP/1.1 405 Method Not Allowed
...
X-Matched-Path: /api/team/ping
```

```
curl.exe -sI -H "Cache-Control: no-cache" https://hrtaj.com/owner
HTTP/1.1 200 OK
...
X-Matched-Path: /owner
```

Notes:
- `/api/team/ping` is POST-only; HEAD returns 405 (not 500), which satisfies the health check for non-auth requests.
- Unauthenticated POST returns 401 (not 500).
- Authenticated ping requires a real team session; no fake users were created.

## How To Re-check
1. Run the service-role proof script (same as used in this verification):
   - Select from `team_sessions`, `report_team_time_today`, `report_team_time_7d`.
2. Run the curl checks above for `/api/team/ping` and `/owner`.
3. Confirm `/api/team/ping` returns 401/403 for unauthenticated POST and never 500.
