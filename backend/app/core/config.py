from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    gemini_api_key: str = ""

    github_token: str = ""

    # Publica (emkc.org) es whitelist-only desde 2/2026 -- se autohostea via
    # backend/docker-compose.piston.yml (ver README).
    piston_api_url: str = "http://localhost:2000/api/v2"

    # En produccion se setea CORS_ORIGINS con el dominio de Vercel, separado
    # por comas: CORS_ORIGINS=https://fara.vercel.app,http://localhost:3000
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
