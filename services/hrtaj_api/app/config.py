from dataclasses import dataclass, field
import os
from dotenv import load_dotenv

load_dotenv()


def _parse_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    allowed_origins: list[str] = field(
        default_factory=lambda: _parse_csv(
            os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
        )
    )
    admin_api_key: str = os.getenv("HRTAJ_ADMIN_API_KEY", "")
    import_api_key: str = os.getenv("HRTAJ_IMPORT_API_KEY", "")
    leads_api_key: str = os.getenv("HRTAJ_LEADS_API_KEY", "")
    staff_owner_user_id: str = os.getenv("HRTAJ_STAFF_OWNER_USER_ID", "")
    default_currency: str = os.getenv("HRTAJ_DEFAULT_CURRENCY", "EGP")
    default_purpose: str = os.getenv("HRTAJ_DEFAULT_PURPOSE", "sale")


settings = Settings()
