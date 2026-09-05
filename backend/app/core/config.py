from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    gemini_api_key: str = ""

    piston_api_url: str = "https://emkc.org/api/v2/piston"

    cors_origins: list[str] = [
        "http://localhost:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
