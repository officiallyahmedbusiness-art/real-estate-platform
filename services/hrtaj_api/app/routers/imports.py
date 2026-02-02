from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response

from app.import_utils import HEADER_ALIASES
from app.schemas import ApiResponse
from app.security import require_import_key
from app.services.import_service import import_projects, import_resale

router = APIRouter(dependencies=[Depends(require_import_key)])


@router.post("/resale", response_model=ApiResponse)
async def import_resale_endpoint(
    file: UploadFile = File(...),
    owner_user_id: str | None = Form(default=None),
    hr_owner_user_id: str | None = Form(default=None),
    default_city: str | None = Form(default=None),
    default_purpose: str | None = Form(default=None),
    dry_run: bool = Form(default=False),
) -> ApiResponse:
    content = await file.read()
    report = import_resale(
        content,
        file.filename or "upload.csv",
        owner_user_id,
        hr_owner_user_id,
        default_city,
        default_purpose,
        dry_run,
    )
    return ApiResponse(ok=True, data=report.model_dump())


@router.post("/projects", response_model=ApiResponse)
async def import_projects_endpoint(
    file: UploadFile = File(...),
    developer_id: str | None = Form(default=None),
    owner_user_id: str | None = Form(default=None),
    dry_run: bool = Form(default=False),
) -> ApiResponse:
    content = await file.read()
    try:
        report = import_projects(content, file.filename or "upload.csv", developer_id, owner_user_id, dry_run)
    except ValueError as exc:
        return ApiResponse(ok=False, error={"code": "invalid_request", "message": str(exc)})
    return ApiResponse(ok=True, data=report.model_dump())


@router.get("/sample-template", response_model=None)
def sample_template(kind: str = "resale") -> Response:
    if kind == "project":
        headers = [
            "project_title",
            "project_code",
            "project_city",
            "project_area",
            "type",
            "price",
            "currency",
            "unit_code",
            "bedrooms",
            "bathrooms",
            "size_m2",
            "area",
            "city",
            "address",
            "notes",
        ]
    else:
        headers = [
            "Agent",
            "المنطقة",
            "نوع",
            "السعر",
            "العملة",
            "الكود",
            "الدور",
            "المساحة",
            "مصعد",
            "تشطيب",
            "عدادات",
            "غ",
            "ر",
            "ح",
            "مطبخ",
            "فيو",
            "مباني",
            "في صور",
            "مدخل العمارة",
            "العمولة",
            "تاريخ",
            "المطلوب",
            "اسم المالك / س",
            "الرقم",
            "اعلان",
            "العنوان",
            "مكان للنوت",
        ]
    csv = ",".join(headers) + "\n"
    return Response(content=csv, media_type="text/csv")


@router.get("/mapping", response_model=ApiResponse)
def get_mapping() -> ApiResponse:
    return ApiResponse(ok=True, data={"headers": HEADER_ALIASES})
