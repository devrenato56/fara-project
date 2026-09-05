import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def publish(channel: str, event: str, payload: dict) -> None:
    """Publica un evento broadcast en un canal de Supabase Realtime.

    Usa el endpoint HTTP de broadcast: el cliente sync de supabase-py no
    soporta canales Realtime (solo el async, que exigiria manejar el ciclo
    de vida del websocket en cada publicacion).
    """
    settings = get_settings()
    url = f"{settings.supabase_url}/realtime/v1/api/broadcast"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }
    body = {"messages": [{"topic": channel, "event": event, "payload": payload}]}

    try:
        response = httpx.post(url, json=body, headers=headers, timeout=10.0)
        response.raise_for_status()
    except httpx.HTTPError:
        # Un evento perdido no debe tumbar el flujo que lo dispara: el cliente
        # siempre puede recuperar el estado consultando el recurso por HTTP.
        logger.warning("No se pudo publicar %s en %s", event, channel, exc_info=True)
