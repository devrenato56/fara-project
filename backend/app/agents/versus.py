import logging

from app.services.llm import LLMUnavailableError, generate_json_object

logger = logging.getLogger(__name__)

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


def _fallback_versus_script(problema: dict, nivel: str, tecnologia: str) -> dict:
    config = LEVELS.get(nivel, LEVELS["medium"])
    sec = config["segundos"]
    t1 = int(sec * 0.25)
    t2 = int(sec * 0.5)
    t3 = int(sec * 0.75)

    title = problema.get("title", "Ejercicio")

    code_v1 = f"// Iniciando solución en {tecnologia}\n// {title}\n\nfunc main() {{\n    // Escribiendo lógica inicial...\n}}"
    code_v2 = f"// Solución en {tecnologia}\npackage main\n\nimport \"fmt\"\n\nfunc main() {{\n    fmt.Println(\"Manejo de datos\")\n}}"
    code_v3 = f"// Corrección e implementación limpia\npackage main\n\nimport \"fmt\"\n\nfunc main() {{\n    // Solución optimizada para {tecnologia}\n    fmt.Println(\"¡Duelo completado!\")\n}}"

    return {
        "steps": [
            {"time_sec": 0, "code": code_v1, "description": f"La IA inicializa la estructura base en {tecnologia}.", "is_buggy": False},
            {"time_sec": t1, "code": code_v2, "description": "La IA implementa la primera versión de la función.", "is_buggy": True},
            {"time_sec": t2, "code": code_v2, "description": "La IA detecta un error de sintaxis y prepara la corrección.", "is_buggy": True},
            {"time_sec": t3, "code": code_v3, "description": "La IA aplica la corrección y prueba la ejecución.", "is_buggy": False},
            {"time_sec": sec, "code": code_v3, "description": "La IA finaliza la solución limpia y completa.", "is_buggy": False},
        ],
        "completion_time_sec": sec,
    }


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

    try:
        result = await generate_json_object(prompt)
        steps = result.get("steps") or []
        if steps:
            return {
                "steps": steps,
                "completion_time_sec": int(result.get("completion_time_sec") or config["segundos"]),
            }
    except Exception as exc:
        logger.warning("Generación de guion IA falló, usando guion de fallback: %s", exc)

    return _fallback_versus_script(problema, nivel, tecnologia)
