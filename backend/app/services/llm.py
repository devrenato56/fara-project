from google import genai

from app.core.config import get_settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=get_settings().gemini_api_key)
    return _client


async def generate(prompt: str, model: str = "gemini-2.0-flash") -> str:
    """Llamada simple al LLM orquestador (Gemini). Usado por los agentes."""
    response = await _get_client().aio.models.generate_content(model=model, contents=prompt)
    return response.text
