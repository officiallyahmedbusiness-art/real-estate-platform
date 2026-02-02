from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logging import configure_logging, get_logger
from app.routers import health, imports, leads, reports

configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(
    title="HRTAJ API",
    version="0.1.0",
    description="HRTAJ auxiliary service for imports, CRM automation, and reporting.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(imports.router, prefix="/v1/import", tags=["import"])
app.include_router(leads.router, prefix="/v1/leads", tags=["leads"])
app.include_router(reports.router, prefix="/v1/reports", tags=["reports"])

logger.info("HRTAJ API initialized (env=%s)", settings.app_env)
