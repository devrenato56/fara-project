# Agente A4 — Evaluador.
# Evalua un envio (codigo + resultado de ejecucion) y devuelve score + feedback
# cualitativo. Usado tanto en modo Code como en modo Fight (Fase 3).


async def evaluar_submission(problema: dict, codigo_usuario: str, resultado_ejecucion: dict) -> dict:
    raise NotImplementedError
