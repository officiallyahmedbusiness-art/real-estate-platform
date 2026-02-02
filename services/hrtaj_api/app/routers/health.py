from fastapi import APIRouter

from app.schemas import ApiResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse)
def health() -> ApiResponse:
    return ApiResponse(ok=True, data={"status": "ok"})
