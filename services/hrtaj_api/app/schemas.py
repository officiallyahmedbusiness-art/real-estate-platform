from pydantic import BaseModel, Field
from typing import Any, Optional


class ErrorPayload(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ApiResponse(BaseModel):
    ok: bool
    data: Optional[Any] = None
    error: Optional[ErrorPayload] = None


class ImportRowError(BaseModel):
    row: int
    field: str
    message: str


class ImportReport(BaseModel):
    rows_total: int
    rows_inserted: int
    rows_updated: int
    rows_failed: int
    mapping: dict[str, str]
    errors: list[ImportRowError] = Field(default_factory=list)


class LeadScoreRequest(BaseModel):
    lead_id: Optional[str] = None
    listing_id: Optional[str] = None
    source: Optional[str] = None
    price: Optional[float] = None
    created_at: Optional[str] = None


class LeadScoreResult(BaseModel):
    score: int
    label: str
    recommended_next_action: str


class LeadRouteRequest(BaseModel):
    lead_id: str
    dry_run: bool = False
    prefer_staff: bool = False
    area_hint: Optional[str] = None
    window_hours: int = 24


class LeadRouteResult(BaseModel):
    lead_id: str
    assigned_to: Optional[str]
    mode: str
    candidates: list[str]
