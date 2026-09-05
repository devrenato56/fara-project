# Agente A2 — Generador de Ejercicios.
# A partir de los fragmentos identificados por el Agente Matching, genera el
# problema equivalente junto a los conceptos transferibles/nuevos (Fase 2).

from app.services.llm import generate_json_array

_PROMPT_TEMPLATE = """Sos disenador de ejercicios de programacion. A partir de estos fragmentos de \
codigo real (con sus conceptos transferibles/nuevos ya identificados), generame un problema de \
practica por fragmento para que el usuario lo reconstruya en: {tecnologias}.

Cada problema debe reconstruir la MISMA logica del fragmento de origen, no un ejercicio generico.

Fragmentos:
{fragmentos}

Responde EXCLUSIVAMENTE con un array JSON, sin texto adicional, un objeto por fragmento, con este shape:
[{{
  "title": "titulo corto del problema",
  "description": "enunciado claro de que hay que construir, en 2-4 oraciones",
  "source_path": "el source_path del fragmento de origen",
  "source_snippet": "el source_snippet del fragmento de origen, sin modificar",
  "difficulty": "easy" | "medium" | "hard",
  "transferable_concepts": ["..."],
  "new_concepts": ["..."],
  "technologies": ["subconjunto de {tecnologias} al que este problema es adaptable"]
}}]
"""


def _format_fragmentos(fragmentos: list[dict]) -> str:
    return "\n\n".join(
        f"--- {f.get('source_path')} ---\n"
        f"snippet: {f.get('source_snippet')}\n"
        f"transferable_concepts: {f.get('transferable_concepts')}\n"
        f"new_concepts: {f.get('new_concepts')}"
        for f in fragmentos
    )


async def generar_ejercicios(fragmentos: list[dict], tecnologias: list[str]) -> list[dict]:
    if not fragmentos:
        return []

    prompt = _PROMPT_TEMPLATE.format(
        tecnologias=", ".join(tecnologias),
        fragmentos=_format_fragmentos(fragmentos),
    )
    return await generate_json_array(prompt)
