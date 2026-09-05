import google.generativeai as genai

from app.core.config import get_settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if not _configured:
        genai.configure(api_key=get_settings().gemini_api_key)
        _configured = True


async def generate(prompt: str, model: str = "gemini-2.0-flash") -> str:
    """Llamada simple al LLM orquestador (Gemini). Usado por los agentes."""
    _ensure_configured()
    client = genai.GenerativeModel(model)
    response = await client.generate_content_async(prompt)
    return response.text
