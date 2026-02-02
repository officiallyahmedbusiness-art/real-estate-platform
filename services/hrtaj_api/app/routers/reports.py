from fastapi import APIRouter, Depends

from app.schemas import ApiResponse
from app.security import require_admin_key
from app.services.report_service import daily_report, pipeline_report

router = APIRouter()


@router.get("/daily", response_model=ApiResponse, dependencies=[Depends(require_admin_key)])
def daily_endpoint(days: int = 7) -> ApiResponse:
    data = daily_report(days)
    return ApiResponse(ok=True, data=data)


@router.get("/pipeline", response_model=ApiResponse, dependencies=[Depends(require_admin_key)])
def pipeline_endpoint(days: int = 30) -> ApiResponse:
    data = pipeline_report(days)
    return ApiResponse(ok=True, data=data)
