import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vital Connect"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "vital-connect-emergency-secret-key-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # PostgreSQL Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://vital@localhost:5432/vital_connect"
    )

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Geocoding & Nominatim
    NOMINATIM_USER_AGENT: str = "vital-connect-app/2.0"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
