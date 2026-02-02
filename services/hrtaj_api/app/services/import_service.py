from typing import Any
from datetime import datetime
import random

import pandas as pd

from app.config import settings
from app.db import execute, get_service_client
from app.import_utils import (
    build_row_payload,
    map_headers,
    parse_bool,
    parse_date,
    parse_float,
    parse_int,
    read_table,
)
from app.logging import get_logger
from app.schemas import ImportReport, ImportRowError

logger = get_logger(__name__)


def _normalize_text(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    return text or None


def _build_title(unit_type: str | None, area: str | None) -> str:
    if unit_type and area:
        return f"{unit_type} - {area}"
    return unit_type or area or "HRTAJ Unit"


def _collect_amenities(elevator: bool | None, kitchen: bool | None) -> list[str]:
    amenities: list[str] = []
    if elevator:
        amenities.append("elevator")
    if kitchen:
        amenities.append("kitchen")
    return amenities


def _generate_unit_code(prefix: str = "HR") -> str:
    stamp = datetime.utcnow().strftime("%Y%m%d")
    rand = random.randint(1000, 9999)
    return f"{prefix}-{stamp}-{rand}"


def _ensure_owner_user_id(owner_user_id: str | None) -> str:
    if owner_user_id:
        return owner_user_id
    if settings.staff_owner_user_id:
        return settings.staff_owner_user_id
    raise ValueError("owner_user_id is required (HRTAJ_STAFF_OWNER_USER_ID not set).")


def _find_existing_resale(client, unit_code: str | None, address: str | None, owner_phone: str | None, price: float | None) -> str | None:
    if unit_code:
        found = execute(
            client.table("listings").select("id").eq("unit_code", unit_code).limit(1)
        ).data
        if found:
            return found[0]["id"]
    if address and owner_phone and price is not None:
        found = execute(
            client.table("resale_intake")
            .select("listing_id")
            .eq("owner_phone", owner_phone)
            .eq("address", address)
            .eq("price", price)
            .limit(1)
        ).data
        if found:
            return found[0]["listing_id"]
    return None


def import_resale(
    file_bytes: bytes,
    filename: str,
    owner_user_id: str | None,
    hr_owner_user_id: str | None,
    default_city: str | None,
    default_purpose: str | None,
    dry_run: bool,
) -> ImportReport:
    client = get_service_client()
    df = read_table(file_bytes, filename)
    mapping, _ = map_headers(df.columns)

    required = {"type", "price", "address"}
    missing = required - set(mapping.keys())

    report = ImportReport(
        rows_total=len(df.index),
        rows_inserted=0,
        rows_updated=0,
        rows_failed=0,
        mapping=mapping,
        errors=[],
    )

    if missing:
        report.errors.append(
            ImportRowError(row=0, field="headers", message=f"Missing required headers: {sorted(missing)}")
        )
        report.rows_failed = report.rows_total
        return report

    try:
        resolved_owner_id = _ensure_owner_user_id(owner_user_id)
    except ValueError as exc:
        report.errors.append(ImportRowError(row=0, field="owner_user_id", message=str(exc)))
        report.rows_failed = report.rows_total
        return report

    default_currency = settings.default_currency
    default_purpose = default_purpose or settings.default_purpose

    for idx, row in df.iterrows():
        row_number = idx + 2
        payload = build_row_payload(row, mapping)
        errors: list[ImportRowError] = []

        unit_type = _normalize_text(payload.get("type"))
        price = parse_float(payload.get("price"))
        address = _normalize_text(payload.get("address"))
        area = _normalize_text(payload.get("area"))
        city = _normalize_text(payload.get("city")) or default_city or area
        if not unit_type:
            errors.append(ImportRowError(row=row_number, field="type", message="Missing unit type."))
        if price is None:
            errors.append(ImportRowError(row=row_number, field="price", message="Invalid price."))
        if not address:
            errors.append(ImportRowError(row=row_number, field="address", message="Missing address."))
        if not city:
            errors.append(ImportRowError(row=row_number, field="city", message="Missing city or default_city."))

        if errors:
            report.errors.extend(errors)
            report.rows_failed += 1
            continue

        unit_code = _normalize_text(payload.get("unit_code")) or _generate_unit_code("HR")
        owner_name = _normalize_text(payload.get("owner_name"))
        owner_phone = _normalize_text(payload.get("owner_phone"))
        floor = _normalize_text(payload.get("floor"))
        size_m2 = parse_float(payload.get("size_m2"))
        elevator = parse_bool(payload.get("elevator"))
        finishing = _normalize_text(payload.get("finishing"))
        meters = _normalize_text(payload.get("meters"))
        bedrooms = parse_int(payload.get("bedrooms"))
        reception = parse_int(payload.get("reception"))
        bathrooms = parse_int(payload.get("bathrooms"))
        kitchen = parse_bool(payload.get("kitchen"))
        view = _normalize_text(payload.get("view"))
        building = _normalize_text(payload.get("building"))
        has_images = parse_bool(payload.get("has_images"))
        entrance = _normalize_text(payload.get("entrance"))
        commission = _normalize_text(payload.get("commission"))
        date_value = parse_date(payload.get("date"))
        intake_date = date_value.split("T")[0] if date_value else None
        target = _normalize_text(payload.get("target"))
        ad_channel = _normalize_text(payload.get("ad_channel"))
        notes = _normalize_text(payload.get("notes"))
        currency = _normalize_text(payload.get("currency")) or default_currency

        purpose = _normalize_text(payload.get("purpose")) or default_purpose
        title = _build_title(unit_type, area)
        amenities = _collect_amenities(elevator, kitchen)

        listing_payload = {
            "owner_user_id": resolved_owner_id,
            "developer_id": None,
            "title": title,
            "title_ar": title,
            "title_en": title,
            "type": unit_type,
            "purpose": purpose,
            "price": price,
            "currency": currency,
            "city": city,
            "area": area,
            "address": address,
            "beds": bedrooms or 0,
            "baths": bathrooms or 0,
            "size_m2": size_m2,
            "description": notes,
            "amenities": amenities,
            "status": "draft",
            "submission_status": "submitted",
            "hr_owner_user_id": hr_owner_user_id,
            "unit_code": unit_code,
            "inventory_source": "resale",
        }

        intake_payload = {
            "listing_id": None,
            "agent_name": _normalize_text(payload.get("agent")),
            "owner_name": owner_name,
            "owner_phone": owner_phone,
            "unit_code": unit_code,
            "floor": floor,
            "size_m2": size_m2,
            "elevator": elevator,
            "finishing": finishing,
            "meters": meters,
            "bedrooms": bedrooms,
            "reception": reception,
            "bathrooms": bathrooms,
            "kitchen": kitchen,
            "view": view,
            "building": building,
            "has_images": has_images,
            "entrance": entrance,
            "commission": commission,
            "intake_date": intake_date,
            "target": target,
            "ad_channel": ad_channel,
            "address": address,
            "area": area,
            "city": city,
            "price": price,
            "currency": currency,
            "notes": notes,
            "raw_payload": payload,
            "created_by": hr_owner_user_id or resolved_owner_id,
        }

        if dry_run:
            report.rows_inserted += 1
            continue

        existing_id = _find_existing_resale(client, unit_code, address, owner_phone, price)
        if existing_id:
            execute(client.table("listings").update(listing_payload).eq("id", existing_id))
            intake_payload["listing_id"] = existing_id
            execute(
                client.table("resale_intake").upsert(intake_payload, on_conflict="listing_id")
            )
            report.rows_updated += 1
        else:
            inserted = execute(client.table("listings").insert(listing_payload)).data
            listing_id = inserted[0]["id"]
            intake_payload["listing_id"] = listing_id
            execute(client.table("resale_intake").insert(intake_payload))
            report.rows_inserted += 1

    return report


def _find_project(client, developer_id: str, project_code: str | None, project_title: str | None) -> str | None:
    if project_code:
        found = execute(
            client.table("projects")
            .select("id")
            .eq("developer_id", developer_id)
            .eq("project_code", project_code)
            .limit(1)
        ).data
        if found:
            return found[0]["id"]
    if project_title:
        found = execute(
            client.table("projects")
            .select("id")
            .eq("developer_id", developer_id)
            .eq("title_ar", project_title)
            .limit(1)
        ).data
        if found:
            return found[0]["id"]
    return None


def _find_existing_project_unit(client, unit_code: str | None, project_id: str) -> str | None:
    if unit_code:
        found = execute(
            client.table("listings")
            .select("id")
            .eq("project_id", project_id)
            .eq("unit_code", unit_code)
            .limit(1)
        ).data
        if found:
            return found[0]["id"]
    return None


def import_projects(
    file_bytes: bytes,
    filename: str,
    developer_id: str | None,
    owner_user_id: str | None,
    dry_run: bool,
) -> ImportReport:
    if not developer_id:
        raise ValueError("developer_id is required for project import.")
    if not owner_user_id:
        raise ValueError("owner_user_id is required for project import.")

    client = get_service_client()
    df = read_table(file_bytes, filename)
    mapping, _ = map_headers(df.columns)

    required = {"type", "price"}
    missing = required - set(mapping.keys())

    report = ImportReport(
        rows_total=len(df.index),
        rows_inserted=0,
        rows_updated=0,
        rows_failed=0,
        mapping=mapping,
        errors=[],
    )

    if missing:
        report.errors.append(
            ImportRowError(row=0, field="headers", message=f"Missing required headers: {sorted(missing)}")
        )
        report.rows_failed = report.rows_total
        return report

    project_cache: dict[str, str] = {}

    for idx, row in df.iterrows():
        row_number = idx + 2
        payload = build_row_payload(row, mapping)
        errors: list[ImportRowError] = []

        project_title = _normalize_text(payload.get("project_title"))
        project_code = _normalize_text(payload.get("project_code"))
        unit_type = _normalize_text(payload.get("type"))
        price = parse_float(payload.get("price"))
        if not project_title and not project_code:
            errors.append(
                ImportRowError(row=row_number, field="project_title", message="Missing project title or code.")
            )
        if not unit_type:
            errors.append(ImportRowError(row=row_number, field="type", message="Missing unit type."))
        if price is None:
            errors.append(ImportRowError(row=row_number, field="price", message="Invalid price."))

        if errors:
            report.errors.extend(errors)
            report.rows_failed += 1
            continue

        cache_key = project_code or project_title
        project_id = project_cache.get(cache_key)
        if not project_id:
            project_id = _find_project(client, developer_id, project_code, project_title)
        if not project_id:
            project_payload = {
                "developer_id": developer_id,
                "owner_user_id": owner_user_id,
                "project_code": project_code,
                "title_ar": project_title,
                "title_en": project_title,
                "description_ar": None,
                "description_en": None,
                "city": _normalize_text(payload.get("project_city")),
                "area": _normalize_text(payload.get("project_area")),
                "submission_status": "submitted",
                "developer_payload": payload,
            }
            if not dry_run:
                inserted = execute(client.table("projects").insert(project_payload)).data
                project_id = inserted[0]["id"]
            else:
                project_id = "dry-run"
        project_cache[cache_key] = project_id

        unit_code = _normalize_text(payload.get("unit_code")) or _generate_unit_code("PR")
        beds = parse_int(payload.get("bedrooms")) or 0
        baths = parse_int(payload.get("bathrooms")) or 0
        size_m2 = parse_float(payload.get("size_m2"))
        area = _normalize_text(payload.get("area"))
        city = _normalize_text(payload.get("city")) or _normalize_text(payload.get("project_city")) or area
        address = _normalize_text(payload.get("address"))
        title = _build_title(unit_type, area)
        listing_payload = {
            "owner_user_id": owner_user_id,
            "developer_id": developer_id,
            "project_id": project_id if project_id != "dry-run" else None,
            "title": title,
            "title_ar": title,
            "title_en": title,
            "type": unit_type,
            "purpose": "new-development",
            "price": price,
            "currency": _normalize_text(payload.get("currency")) or settings.default_currency,
            "city": city,
            "area": area,
            "address": address,
            "beds": beds,
            "baths": baths,
            "size_m2": size_m2,
            "description": _normalize_text(payload.get("notes")),
            "amenities": [],
            "status": "draft",
            "submission_status": "submitted",
            "unit_code": unit_code,
            "inventory_source": "project",
            "developer_payload": payload,
        }

        if dry_run:
            report.rows_inserted += 1
            continue

        existing_id = _find_existing_project_unit(client, unit_code, project_id)
        if existing_id:
            execute(client.table("listings").update(listing_payload).eq("id", existing_id))
            report.rows_updated += 1
        else:
            execute(client.table("listings").insert(listing_payload))
            report.rows_inserted += 1

    return report
