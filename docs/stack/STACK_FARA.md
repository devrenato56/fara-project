# FARA — Stack Tecnológico (MVP Hackathon)

## Resumen

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js (ya inicializado) | Decisión previa del equipo |
| Editor de código | Monaco Editor | El mismo editor de VS Code, syntax highlighting listo, integración simple en React |
| Backend | FastAPI (Python) | Async nativo, tipado con Pydantic, coherente con el ecosistema de IA |
| Base de datos | Supabase (Postgres) | Ya decidido por el equipo |
| Auth | Supabase Auth | Incluido con Supabase, soporta Google/GitHub tal como el wireframe de landing |
| Realtime / notificaciones | Supabase Realtime | Evita construir WebSockets propios para "Generating..." y el modo Fight |
| Vector store | Postgres + pgvector (extensión de Supabase) | No se suma un vector DB aparte; se aprovecha la misma instancia de Supabase |
| LLM orquestador | Gemini 2.0 Flash (tier gratuito) | Análisis de repos y generación de problemas; contexto largo, costo cero para la demo |
| LLM evaluación/versus (si hay créditos) | Claude o GPT como opción superior; Gemini como fallback | Mejor razonamiento sobre código para feedback y solución progresiva del modo Fight |
| Sandbox de ejecución de código | Piston API (pública) | Ejecución real multi-lenguaje sin infraestructura propia |
| Testing backend | Pytest | Requisito obligatorio de las bases (suite de pruebas automáticas) |
| Deploy backend | Railway o Render | Deploy desde GitHub en minutos |
| Deploy frontend | Vercel | Estándar para Next.js |
| Control de versiones | GitHub | Requisito de la organización (Releases obligatorios) |

---

## Backend: FastAPI (Python)

Elegido por sobre Django/Flask porque:
- Async nativo, necesario para llamadas a LLM y a Piston que no son instantáneas.
- Validación de datos con Pydantic, útil para el JSON estructurado que devuelven los prompts.
- WebSockets/SSE integrados si se necesitan además de Supabase Realtime.
- Menor fricción de setup que Django para el tiempo disponible.

## Base de datos: Supabase (Postgres)

- Ya era decisión previa del equipo.
- Se usa `pgvector` como extensión de la misma instancia en lugar de sumar Pinecone/Weaviate/Chroma — un solo lugar de datos, una sola conexión.
- Supabase Auth resuelve el login social (Google/GitHub) que pide el wireframe de landing sin backend propio de autenticación.
- Supabase Realtime reemplaza la necesidad de levantar WebSockets propios para:
  - Notificar cuando termina la generación de problemas ("Generating your problems...").
  - Sincronizar estado y timer entre dos usuarios en el modo Fight.

## LLM orquestador

**Gemini 2.0 Flash** para el análisis de repos y generación de problemas:
- Tier gratuito generoso, suficiente para la demo.
- Contexto largo, permite mandar varios archivos de código en un solo prompt sin necesidad de embeddings/RAG para el volumen de una demo.

**Claude o GPT (si hay créditos disponibles)** para evaluación de submissions y generación de la solución progresiva del modo Fight, donde la calidad del razonamiento sobre código importa más. Gemini queda como fallback si no hay créditos.

No se usan frameworks de agentes (LangChain, CrewAI). Se implementan 3 funciones especializadas orquestadas directamente desde el backend:
1. `analizar_repo()` — matching + generación de problemas en un solo prompt.
2. `generar_solucion_progresiva()` — solución con errores deliberados para el modo Fight.
3. `evaluar_submission()` — score + feedback usando el resultado real de ejecución.

## Sandbox de ejecución: Piston API

- API pública gratuita, ejecuta código en +40 lenguajes en contenedores aislados.
- Sin infraestructura propia de contenedores — descartado por tiempo.
- Usada tanto en modo Code como en modo Fight.
- Alternativa descartada por complejidad para hoy: Judge0 (mejor para test cases estructurados, pero no necesario si el LLM evalúa sobre el stdout/stderr crudo).

## Testing

- **Pytest** en el backend, cubriendo al menos:
  - Camino feliz: submission correcta → score alto.
  - Caso de error: código que falla en ejecución → manejo correcto sin caída del servicio.
- Requisito obligatorio explícito de las bases del hackathon (Release final).

## Deploy

- **Backend:** Railway o Render, deploy directo desde GitHub.
- **Frontend:** Vercel, estándar para Next.js.
- Confirmar URL de producción activa antes de las 4:30 pm (hora límite de entrega).

## Explícitamente descartado para el MVP de hoy

- Vector DB dedicado (Pinecone/Weaviate) — se usa pgvector sobre Supabase.
- Framework de agentes (LangChain/CrewAI) — orquestación directa desde FastAPI.
- Sandbox de contenedores propio (Docker/Judge0) — se usa Piston.
- Cola distribuida (Celery/RabbitMQ) — se usa `BackgroundTasks` de FastAPI + Supabase Realtime.
- Community, News — fuera de alcance del MVP.
