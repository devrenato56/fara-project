# Agente A3 — Versus.
# Genera el guion completo (buggy -> correccion -> limpio) de la solucion de
# la IA para el modo Fight vs IA, antes de iniciar el timer (ADR-07, Fase 4).

from app.services.json_llm import parse_json_object
from app.services.llm import generate

# Calibracion por nivel: cuanto mas novato el usuario, mas pausada va la IA y
# mas errores deliberados comete sobre los conceptos nuevos del problema.
LEVELS = {
    "easy": {"errores": 3, "segundos": 240, "ritmo": "muy pausado, como alguien que piensa en voz alta"},
    "medium": {"errores": 2, "segundos": 180, "ritmo": "pausado pero constante"},
    "hard": {"errores": 1, "segundos": 120, "ritmo": "agil, con pocas dudas"},
}

_PROMPT_TEMPLATE = """Sos un desarrollador resolviendo este ejercicio EN VIVO mientras alguien te mira \
competir. Tenes que producir el guion completo de tu resolucion, paso a paso.

Problema: {title}
Enunciado: {description}
Tecnologia objetivo: {tecnologia}

Conceptos que el usuario YA domina (no te equivoques en estos): {transferibles}
Conceptos NUEVOS para el usuario (concentra aca tus errores deliberados): {nuevos}

Reglas del guion:
- Ritmo {ritmo}; el total debe durar {segundos} segundos.
- Comete exactamente {errores} error(es) deliberado(s), SOLO sobre los conceptos nuevos, \
y corregilos en un paso posterior. Los errores deben ser realistas (los que comete alguien \
que viene de otro stack), no absurdos.
- Cada paso muestra el archivo COMPLETO como quedaria en ese instante, no un diff.
- El ultimo paso debe ser la solucion final correcta y limpia.
- 5 a 7 pasos en total, con time_sec creciente entre 0 y {segundos}.

Responde EXCLUSIVAMENTE con un objeto JSON, sin texto adicional, con este shape:
{{
  "completion_time_sec": {segundos},
  "steps": [
    {{"time_sec": 0, "code": "...", "description": "que esta haciendo la IA en este paso", "is_buggy": false}}
  ]
}}
"""


async def generar_solucion_progresiva(problema: dict, nivel: str = "medium", tecnologia: str = "Go") -> dict:
    config = LEVELS.get(nivel, LEVELS["medium"])

    prompt = _PROMPT_TEMPLATE.format(
        title=problema.get("title", ""),
        description=problema.get("description", ""),
        tecnologia=tecnologia,
        transferibles=", ".join(problema.get("transferable_concepts") or []),
        nuevos=", ".join(problema.get("new_concepts") or []),
        ritmo=config["ritmo"],
        errores=config["errores"],
        segundos=config["segundos"],
    )

    result = parse_json_object(await generate(prompt))

    steps = result.get("steps") or []
    if not steps:
        raise ValueError("El guion generado no tiene pasos")

    return {
        "steps": steps,
        "completion_time_sec": int(result.get("completion_time_sec") or config["segundos"]),
    }
