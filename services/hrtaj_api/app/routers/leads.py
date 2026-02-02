from fastapi import APIRouter, Depends

from app.schemas import ApiResponse, LeadRouteRequest, LeadScoreRequest
from app.security import require_leads_key
from app.services.lead_service import route_lead, score_lead, sla_breached

router = APIRouter(dependencies=[Depends(require_leads_key)])


@router.post("/score", response_model=ApiResponse)
def score_lead_endpoint(payload: LeadScoreRequest) -> ApiResponse:
    result = score_lead(payload.lead_id, payload.listing_id, payload.source, payload.price)
    return ApiResponse(ok=True, data=result.model_dump())


@router.post("/route", response_model=ApiResponse)
def route_lead_endpoint(payload: LeadRouteRequest) -> ApiResponse:
    result = route_lead(payload)
    return ApiResponse(ok=True, data=result.model_dump())


@router.get("/sla", response_model=ApiResponse)
def sla_endpoint(minutes: int = 90) -> ApiResponse:
    breached = sla_breached(minutes)
    return ApiResponse(ok=True, data={"breached": breached, "minutes": minutes})
