import asyncio
import logging

import httpx
from google import genai
from google.genai import errors as genai_errors

from app.core.config import get_settings
from app.services.json_llm import parse_json_array, parse_json_object

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

MAX_ATTEMPTS = 3
BACKOFF_SEC = 2
RATE_LIMIT_BACKOFF_SEC = 10


class LLMUnavailableError(Exception):
    """El proveedor de LLM no respondio tras varios reintentos."""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=get_settings().gemini_api_key)
    return _client


async def generate(prompt: str, model: str = "gemini-1.5-flash") -> str:
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
            wait = BACKOFF_SEC * attempt
        except genai_errors.ClientError as exc:
            if exc.code != 429:
                # El resto de los 4xx (400, 403...) son error nuestro: no
                # tiene sentido reintentar 3 veces el mismo prompt invalido.
                # Igual se traduce a LLMUnavailableError, para que a quien
                # llama a generate() le alcance con un unico except.
                raise LLMUnavailableError(str(exc)) from exc
            # 429 (rate limit) es transitorio y se beneficia de esperar mas.
            last_error = exc
            wait = RATE_LIMIT_BACKOFF_SEC * attempt

        logger.warning("LLM intento %s/%s fallo: %s", attempt, MAX_ATTEMPTS, last_error)
        if attempt < MAX_ATTEMPTS:
            await asyncio.sleep(wait)

    raise LLMUnavailableError(str(last_error)) from last_error


async def generate_json_object(prompt: str, model: str = "gemini-1.5-flash") -> dict:
    """generate() + parseo a objeto, traduciendo un JSON mal formado del
    modelo al mismo LLMUnavailableError -- para el llamador es un unico
    tipo de falla, responda lo que responda el proveedor."""
    try:
        return parse_json_object(await generate(prompt, model))
    except (ValueError, KeyError) as exc:
        raise LLMUnavailableError(f"Respuesta no parseable del LLM: {exc}") from exc


async def generate_json_array(prompt: str, model: str = "gemini-1.5-flash") -> list[dict]:
    """Idem generate_json_object(), para respuestas que son un array."""
    try:
        return parse_json_array(await generate(prompt, model))
    except (ValueError, KeyError) as exc:
        raise LLMUnavailableError(f"Respuesta no parseable del LLM: {exc}") from exc
