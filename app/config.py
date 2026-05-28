import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""

    # App
    app_name: str = "AGH 跨境肿瘤患者管理系统"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/agh_demo"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/agh_demo"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # File Storage (Aliyun OSS)
    oss_access_key_id: str = ""
    oss_access_key_secret: str = ""
    oss_bucket: str = ""
    oss_endpoint: str = ""

    # WhatsApp Business API
    whatsapp_business_id: str = ""
    whatsapp_access_token: str = ""

    # Kimi (Moonshot) AI
    kimi_api_key: str = ""

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()