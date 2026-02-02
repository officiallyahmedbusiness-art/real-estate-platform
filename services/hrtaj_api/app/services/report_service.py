from datetime import datetime, timedelta, timezone
from typing import Any

from app.db import execute, get_service_client


def _now() -> datetime:
    return datetime.now(timezone.utc)


def daily_report(days: int = 7) -> dict[str, Any]:
    client = get_service_client()
    cutoff = (_now() - timedelta(days=days)).date().isoformat()

    units = execute(
        client.table("report_units_per_day").select("*").gte("day", cutoff)
    ).data
    leads = execute(
        client.table("report_leads_per_day").select("*").gte("day", cutoff)
    ).data

    return {
        "units": units or [],
        "leads": leads or [],
    }


def pipeline_report(days: int = 30) -> dict[str, Any]:
    client = get_service_client()
    cutoff = (_now() - timedelta(days=days)).isoformat()
    rows = execute(
        client.table("leads").select("status, created_at").gte("created_at", cutoff)
    ).data
    counts: dict[str, int] = {}
    for row in rows or []:
        status = row.get("status") or "new"
        counts[status] = counts.get(status, 0) + 1
    return {"counts": counts, "window_days": days}
