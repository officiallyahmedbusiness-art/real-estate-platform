import io
import re
from datetime import datetime
from typing import Any, Dict, Iterable, Tuple

import pandas as pd


HEADER_ALIASES: Dict[str, Iterable[str]] = {
    "agent": ["agent", "agent name", "representative", "المندوب", "المسؤول"],
    "city": ["city", "المدينة"],
    "area": ["area", "zone", "district", "المنطقة", "الحي"],
    "type": ["type", "unit type", "property type", "نوع", "نوع الوحدة"],
    "purpose": ["purpose", "الغرض"],
    "price": ["price", "السعر", "السعر المطلوب", "value"],
    "currency": ["currency", "العملة"],
    "unit_code": ["unit code", "code", "الكود", "كود"],
    "floor": ["floor", "الدور"],
    "size_m2": ["size", "area m2", "المساحة", "مساحة", "m2", "sqm"],
    "elevator": ["elevator", "مصعد"],
    "finishing": ["finishing", "تشطيب"],
    "meters": ["meters", "عدادات"],
    "bedrooms": ["bedrooms", "beds", "غ", "غرف", "غرف نوم"],
    "reception": ["reception", "ر", "ريسبشن"],
    "bathrooms": ["bathrooms", "baths", "حمام", "ح"],
    "kitchen": ["kitchen", "مطبخ"],
    "view": ["view", "فيو"],
    "building": ["building", "مباني", "العمارة"],
    "has_images": ["has images", "صور", "في صور"],
    "entrance": ["entrance", "مدخل العمارة"],
    "commission": ["commission", "العمولة"],
    "date": ["date", "التاريخ", "تاريخ"],
    "target": ["target", "المطلوب"],
    "owner_name": ["owner name", "اسم المالك", "اسم المالك / س", "المالك"],
    "owner_phone": ["owner phone", "phone", "رقم المالك", "الرقم"],
    "ad_channel": ["ad", "channel", "اعلان", "إعلان"],
    "address": ["address", "العنوان"],
    "notes": ["notes", "ملاحظات", "مكان للنوت"],
    "project_title": ["project", "project title", "اسم المشروع", "project_name"],
    "project_code": ["project code", "كود المشروع"],
    "project_city": ["project city", "مدينة المشروع"],
    "project_area": ["project area", "منطقة المشروع"],
}


def normalize_header(value: str) -> str:
    cleaned = re.sub(r"[\s\-_()]+", "", str(value).strip().lower())
    cleaned = re.sub(r"[^\w\u0600-\u06FF]+", "", cleaned)
    return cleaned


def map_headers(columns: Iterable[str]) -> Tuple[dict[str, str], dict[str, str]]:
    normalized = {normalize_header(col): col for col in columns}
    mapping: dict[str, str] = {}
    reverse: dict[str, str] = {}
    for key, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize_header(alias)
            if alias_norm in normalized:
                source = normalized[alias_norm]
                mapping[key] = source
                reverse[source] = key
                break
    return mapping, reverse


def parse_bool(value: Any) -> bool | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "yes", "y", "نعم", "صح"}:
        return True
    if text in {"0", "false", "no", "n", "لا"}:
        return False
    return None


def parse_int(value: Any) -> int | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return int(float(str(value).replace(",", "")))
    except ValueError:
        return None


def parse_float(value: Any) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(str(value).replace(",", ""))
    except ValueError:
        return None


def parse_date(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    try:
        parsed = pd.to_datetime(value)
        return parsed.isoformat()
    except Exception:
        return None


def read_table(file_bytes: bytes, filename: str) -> pd.DataFrame:
    lower = filename.lower()
    if lower.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_bytes))
    if lower.endswith(".xlsx") or lower.endswith(".xls"):
        return pd.read_excel(io.BytesIO(file_bytes))
    raise ValueError("Unsupported file type. Use CSV or Excel.")


def build_row_payload(row: pd.Series, mapping: dict[str, str]) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    for key, source in mapping.items():
        payload[key] = row.get(source)
    return payload
