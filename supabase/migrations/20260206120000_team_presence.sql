-- Team presence + work hours tracking

create table if not exists public.team_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz null,
  user_agent text null,
  ip_hash text null
);

create index if not exists team_sessions_user_id_idx on public.team_sessions (user_id);
create index if not exists team_sessions_last_seen_idx on public.team_sessions (last_seen_at);

alter table public.team_sessions enable row level security;

drop policy if exists "Team sessions select" on public.team_sessions;
drop policy if exists "Team sessions insert" on public.team_sessions;
drop policy if exists "Team sessions update" on public.team_sessions;

create policy "Team sessions select"
on public.team_sessions for select
using (public.is_crm_user() or auth.uid() = user_id);

create policy "Team sessions insert"
on public.team_sessions for insert
with check (auth.uid() = user_id);

create policy "Team sessions update"
on public.team_sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace view public.report_team_time_today as
with bounds as (
  select
    date_trunc('day', now()) as day_start,
    date_trunc('day', now()) + interval '1 day' as day_end
)
select
  ts.user_id,
  round(
    sum(
      case
        when least(coalesce(ts.ended_at, ts.last_seen_at), b.day_end) >
             greatest(ts.started_at, b.day_start)
        then extract(
          epoch from (
            least(coalesce(ts.ended_at, ts.last_seen_at), b.day_end)
            - greatest(ts.started_at, b.day_start)
          )
        )
        else 0
      end
    ) / 60.0
  ) as minutes
from public.team_sessions ts
cross join bounds b
group by ts.user_id;

create or replace view public.report_team_time_7d as
with bounds as (
  select
    date_trunc('day', now()) - interval '6 days' as day_start,
    date_trunc('day', now()) + interval '1 day' as day_end
)
select
  ts.user_id,
  round(
    sum(
      case
        when least(coalesce(ts.ended_at, ts.last_seen_at), b.day_end) >
             greatest(ts.started_at, b.day_start)
        then extract(
          epoch from (
            least(coalesce(ts.ended_at, ts.last_seen_at), b.day_end)
            - greatest(ts.started_at, b.day_start)
          )
        )
        else 0
      end
    ) / 60.0
  ) as minutes
from public.team_sessions ts
cross join bounds b
group by ts.user_id;

alter view public.report_team_time_today set (security_invoker = true);
alter view public.report_team_time_7d set (security_invoker = true);

