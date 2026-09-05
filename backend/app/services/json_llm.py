import json
import re

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _parse_json(text: str) -> object:
    return json.loads(_CODE_FENCE_RE.sub("", text).strip())


def parse_json_array(text: str) -> list[dict]:
    """Extrae un array JSON de la respuesta cruda de un LLM (tolera fences ```json ... ```)."""
    data = _parse_json(text)
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    return data


def parse_json_object(text: str) -> dict:
    """Extrae un objeto JSON de la respuesta cruda de un LLM (tolera fences ```json ... ```)."""
    data = _parse_json(text)
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object")
    return data
