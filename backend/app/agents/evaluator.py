# Agente A4 — Evaluador.
# Evalua un envio (codigo + resultado de ejecucion) y devuelve score + feedback
# cualitativo. Usado tanto en modo Code como en modo Fight (Fase 3).

from app.services.llm import LLMUnavailableError, generate_json_object

# Score minimo para considerar aprobado un envio (modo Code y modo Fight).
PASS_THRESHOLD = 70

_PROMPT_TEMPLATE = """Sos un evaluador tecnico. Un usuario intento resolver este problema:

Titulo: {title}
Enunciado: {description}

Su codigo:
{codigo}

Resultado de ejecucion real (stdout/stderr/exit code):
{resultado}

Evalua si el codigo resuelve correctamente el problema, considerando el resultado de ejecucion \
como evidencia objetiva (no confies solo en que "parezca" correcto si el output indica error).

Responde EXCLUSIVAMENTE con un objeto JSON, sin texto adicional, con este shape:
{{"score": <entero 0-100>, "feedback": "<2-4 oraciones, cualitativo, especifico de este codigo>"}}
"""


async def evaluar_submission(problema: dict, codigo_usuario: str, resultado_ejecucion: dict) -> dict:
    prompt = _PROMPT_TEMPLATE.format(
        title=problema.get("title", ""),
        description=problema.get("description", ""),
        codigo=codigo_usuario,
        resultado=resultado_ejecucion,
    )
    result = await generate_json_object(prompt)
    try:
        return {"score": int(result["score"]), "feedback": str(result["feedback"])}
    except (KeyError, ValueError, TypeError) as exc:
        # El JSON parseo bien pero le faltan/tienen mal tipo los campos que
        # pedimos -- misma categoria de falla que un JSON invalido.
        raise LLMUnavailableError(f"Respuesta incompleta del evaluador: {exc}") from exc
