from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db import execute, get_service_client
from app.logging import get_logger
from app.schemas import LeadRouteRequest, LeadRouteResult, LeadScoreResult

logger = get_logger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def score_lead(lead_id: str | None, listing_id: str | None, source: str | None, price: float | None) -> LeadScoreResult:
    client = get_service_client()
    lead = None
    listing = None
    if lead_id:
        lead_resp = execute(client.table("leads").select("*").eq("id", lead_id).limit(1)).data
        lead = lead_resp[0] if lead_resp else None
        listing_id = listing_id or (lead.get("listing_id") if lead else None)
        source = source or (lead.get("source") if lead else None)
    if listing_id:
        listing_resp = execute(
            client.table("listings").select("price, inventory_source").eq("id", listing_id).limit(1)
        ).data
        listing = listing_resp[0] if listing_resp else None
        price = price or (listing.get("price") if listing else None)

    score = 0
    if lead:
        if lead.get("phone"):
            score += 30
        if lead.get("email"):
            score += 20
    if source and source.lower() in {"campaign", "partner", "referral"}:
        score += 15
    if lead and lead.get("created_at"):
        created = datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00"))
        if _now() - created < timedelta(hours=24):
            score += 15
        elif _now() - created < timedelta(days=7):
            score += 5
    if price and price > 0:
        score += 10

    score = min(score, 100)
    label = "hot" if score >= 80 else "warm" if score >= 50 else "cold"
    recommended = "call_within_2_hours" if label == "hot" else "follow_up_today" if label == "warm" else "qualify_later"
    return LeadScoreResult(score=score, label=label, recommended_next_action=recommended)


def _candidate_staff(client) -> list[str]:
    profiles = execute(
        client.table("profiles").select("id, role").in_("role", ["admin", "ops"])
    ).data
    return [row["id"] for row in profiles or []]


def _candidate_developer_members(client, developer_id: str | None) -> list[str]:
    if not developer_id:
        return []
    members = execute(
        client.table("developer_members").select("user_id").eq("developer_id", developer_id)
    ).data
    return [row["user_id"] for row in members or []]


def _load_counts(client, candidate_ids: list[str], window_hours: int) -> dict[str, int]:
    if not candidate_ids:
        return {}
    since = (_now() - timedelta(hours=window_hours)).isoformat()
    assignments = execute(
        client.table("lead_assignments")
        .select("assigned_to")
        .in_("assigned_to", candidate_ids)
        .gte("created_at", since)
    ).data
    counts = Counter(row["assigned_to"] for row in assignments or [])
    return {candidate: counts.get(candidate, 0) for candidate in candidate_ids}


def route_lead(request: LeadRouteRequest) -> LeadRouteResult:
    client = get_service_client()
    lead_resp = execute(
        client.table("leads").select("id, listing_id, assigned_to").eq("id", request.lead_id).limit(1)
    ).data
    if not lead_resp:
        return LeadRouteResult(lead_id=request.lead_id, assigned_to=None, mode="not_found", candidates=[])
    lead = lead_resp[0]

    listing_resp = execute(
        client.table("listings")
        .select("id, developer_id, inventory_source, area")
        .eq("id", lead["listing_id"])
        .limit(1)
    ).data
    listing = listing_resp[0] if listing_resp else {}

    inventory_source = listing.get("inventory_source") or "resale"
    if request.prefer_staff or inventory_source == "resale":
        candidates = _candidate_staff(client)
        mode = "staff"
    else:
        candidates = _candidate_developer_members(client, listing.get("developer_id"))
        if not candidates:
            candidates = _candidate_staff(client)
            mode = "staff_fallback"
        else:
            mode = "developer"

    counts = _load_counts(client, candidates, request.window_hours)
    assigned_to = None
    if candidates:
        assigned_to = min(candidates, key=lambda cid: counts.get(cid, 0))

    if assigned_to and not request.dry_run:
        execute(
            client.table("leads").update({"assigned_to": assigned_to}).eq("id", request.lead_id)
        )
        execute(
            client.table("lead_assignments")
            .upsert({"lead_id": request.lead_id, "assigned_to": assigned_to})
        )

    return LeadRouteResult(
        lead_id=request.lead_id,
        assigned_to=assigned_to,
        mode=mode,
        candidates=candidates,
    )


def sla_breached(minutes: int) -> list[dict[str, Any]]:
    client = get_service_client()
    threshold = (_now() - timedelta(minutes=minutes)).isoformat()
    rows = execute(
        client.table("leads")
        .select("id, listing_id, status, updated_at, created_at")
        .lte("updated_at", threshold)
        .neq("status", "won")
        .neq("status", "lost")
    ).data
    return rows or []
