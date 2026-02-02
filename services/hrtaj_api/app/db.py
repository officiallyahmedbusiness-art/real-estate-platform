from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.logging import get_logger

logger = get_logger(__name__)


def get_service_client() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=0.5, max=2))
def execute(query):
    return query.execute()
