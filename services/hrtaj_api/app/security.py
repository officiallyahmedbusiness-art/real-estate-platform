from fastapi import Header, HTTPException

from app.config import settings
from app.logging import get_logger

logger = get_logger(__name__)


def _is_dev() -> bool:
    return settings.app_env.lower() in {"dev", "development", "local"}


def require_admin_key(x_hrtaj_admin_key: str | None = Header(default=None)) -> None:
    if not settings.admin_api_key:
        if _is_dev():
            logger.warning("HRTAJ_ADMIN_API_KEY not set; allowing admin access in dev.")
            return
        raise HTTPException(status_code=500, detail="Admin API key is not configured.")
    if x_hrtaj_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Invalid admin API key.")


def require_import_key(x_hrtaj_import_key: str | None = Header(default=None)) -> None:
    if not settings.import_api_key:
        if _is_dev():
            logger.warning("HRTAJ_IMPORT_API_KEY not set; allowing import access in dev.")
            return
        raise HTTPException(status_code=500, detail="Import API key is not configured.")
    if x_hrtaj_import_key != settings.import_api_key:
        raise HTTPException(status_code=401, detail="Invalid import API key.")


def require_leads_key(x_hrtaj_leads_key: str | None = Header(default=None)) -> None:
    if not settings.leads_api_key:
        if _is_dev():
            logger.warning("HRTAJ_LEADS_API_KEY not set; allowing leads access in dev.")
            return
        raise HTTPException(status_code=500, detail="Leads API key is not configured.")
    if x_hrtaj_leads_key != settings.leads_api_key:
        raise HTTPException(status_code=401, detail="Invalid leads API key.")
