# Agente A1 — Matching de Codigo.
# Dado el codigo de un repo y las tecnologias objetivo del proyecto, identifica
# los fragmentos con mayor potencial de traduccion (Fase 2).

from app.services.json_llm import parse_json_array
from app.services.llm import generate

MAX_FRAGMENTS = 5

_PROMPT_TEMPLATE = """Sos un analista de codigo senior. Un desarrollador quiere aprender {tecnologias} \
partiendo de codigo real que ya escribio.

Te paso archivos de su repositorio. Identifica hasta {max_fragmentos} fragmentos (funciones, \
endpoints, clases) que sean buenos candidatos para reescribirse en {tecnologias}: preferi logica \
de negocio concreta y autocontenida sobre boilerplate.

Para cada fragmento devolves:
- source_path: el path del archivo de origen (tal cual aparece en el encabezado)
- source_snippet: el fragmento de codigo relevante (recortado, no el archivo completo)
- transferable_concepts: lista corta de conceptos que se transfieren directo (logica de negocio, \
diseno de API, nombres de dominio)
- new_concepts: lista corta de conceptos genuinamente nuevos en {tecnologias} que este fragmento \
va a exigir (sintaxis, manejo de concurrencia, tipado, etc.)

Responde EXCLUSIVAMENTE con un array JSON, sin texto adicional, con este shape:
[{{"source_path": "...", "source_snippet": "...", "transferable_concepts": ["..."], "new_concepts": ["..."]}}]

Archivos:
{archivos}
"""


def _format_archivos(codigo_por_archivo: dict[str, str]) -> str:
    return "\n\n".join(f"--- {path} ---\n{content}" for path, content in codigo_por_archivo.items())


async def analizar_repo(codigo_por_archivo: dict[str, str], tecnologias: list[str]) -> list[dict]:
    prompt = _PROMPT_TEMPLATE.format(
        tecnologias=", ".join(tecnologias),
        max_fragmentos=MAX_FRAGMENTS,
        archivos=_format_archivos(codigo_por_archivo),
    )
    response_text = await generate(prompt)
    return parse_json_array(response_text)
