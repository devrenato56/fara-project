import asyncio
import logging

import httpx
from google import genai
from google.genai import errors as genai_errors

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

MAX_ATTEMPTS = 3
BACKOFF_SEC = 2


class LLMUnavailableError(Exception):
    """El proveedor de LLM no respondio tras varios reintentos."""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=get_settings().gemini_api_key)
    return _client


async def generate(prompt: str, model: str = "gemini-3.6-flash") -> str:
    """Llamada al LLM orquestador (Gemini), con reintentos ante fallos transitorios.

    Es el unico punto por el que pasan los 4 agentes, asi que el reintento vive
    aca y no repetido en cada uno.
    """
    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = await _get_client().aio.models.generate_content(model=model, contents=prompt)
            return response.text
        except (httpx.TransportError, genai_errors.ServerError) as exc:
            # Cortes de red y 5xx del proveedor: son transitorios, reintentamos.
            last_error = exc
            logger.warning("LLM intento %s/%s fallo: %s", attempt, MAX_ATTEMPTS, exc)
            if attempt < MAX_ATTEMPTS:
                await asyncio.sleep(BACKOFF_SEC * attempt)

    raise LLMUnavailableError(str(last_error)) from last_error
