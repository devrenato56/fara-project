import httpx

from app.core.config import get_settings


class PistonExecutionError(Exception):
    pass


async def run_code(language: str, version: str, code: str, stdin: str = "") -> dict:
    """Ejecuta código en Piston y devuelve el resultado crudo (stdout/stderr/exit code)."""
    settings = get_settings()
    payload = {
        "language": language,
        "version": version,
        "files": [{"content": code}],
        "stdin": stdin,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.post(f"{settings.piston_api_url}/execute", json=payload)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise PistonExecutionError(str(exc)) from exc
    return response.json()
