import json
import re

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def parse_json_array(text: str) -> list[dict]:
    """Extrae un array JSON de la respuesta cruda de un LLM (tolera fences ```json ... ```)."""
    cleaned = _CODE_FENCE_RE.sub("", text).strip()
    data = json.loads(cleaned)
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    return data
