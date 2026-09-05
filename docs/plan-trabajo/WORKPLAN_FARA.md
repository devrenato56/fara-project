# FARA — Plan de Trabajo (Hackathon, día único)

Checkpoints obligatorios de la organización:
- **12:00 pm** — Release "Arquitectura - FARA" en GitHub
- **4:30 pm** — Release "Entrega Final - FARA" en GitHub (código + URL producción + tests + pitch.pdf)

Decisión de sandbox tomada: **Piston API pública** (`https://emkc.org/api/v2/piston/execute`) para ejecución de código tanto en modo Code como en modo Fight. Sin infraestructura propia de contenedores.

---

## Fase 0 — Bootstrap de estructura (ambos, en paralelo, ~30 min)

Antes de dividir por fases, cada uno monta el esqueleto de su lado para no bloquearse mutuamente.

### Tarea 0.1 — Estructura de backend (Renato)
- Crear proyecto FastAPI con esta estructura:
  ```
  backend/
    app/
      main.py
      core/config.py        # env vars, settings con pydantic-settings
      db/supabase.py        # cliente Supabase inicializado
      services/
        piston.py           # wrapper de ejecución de código
        llm.py               # cliente(s) LLM (Gemini + fallback)
      agents/
        analyzer.py          # analizar_repo()
        versus.py            # generar_solucion_progresiva()
        evaluator.py          # evaluar_submission()
      routers/
        auth.py
        projects.py
        problems.py
        submissions.py
        matches.py
      schemas/                # modelos Pydantic (request/response)
      models/                 # tipos que mapean tablas de Supabase
    tests/
    requirements.txt
    .env.example
    Dockerfile
  ```
- Levantar `main.py` con CORS habilitado para el dominio de Vercel y `localhost:3000`.
- Confirmar conexión a Supabase con una query trivial.
- Push inicial a GitHub con este esqueleto.

### Tarea 0.2 — Estructura de frontend (Tom)
- Sobre el proyecto Next ya inicializado, definir estructura de carpetas:
  ```
  frontend/
    app/
      (auth)/login/
      dashboard/
      projects/
        [projectId]/
      problems/[problemId]/code/
      match/[matchId]/
      billing/
    components/
      ui/                    # shadcn o similar
      layout/Sidebar.tsx
      dashboard/
      projects/
      code-editor/            # wrapper de Monaco/CodeMirror
      match/
    lib/
      api-client.ts           # fetch tipado hacia FastAPI
      supabase-client.ts       # auth desde el frontend
    types/
  ```
- Configurar cliente de Supabase Auth (Google/GitHub) según el wireframe de landing.
- Configurar variable de entorno apuntando a la URL del backend (Railway/Render).
- Elegir y montar el editor de código (recomendado: Monaco, es el de VS Code y tiene soporte de syntax highlighting listo).

**Checkpoint de Fase 0:** ambos repos con esqueleto pusheado, backend responde `/health`, frontend renderiza el layout con sidebar aunque las páginas estén vacías.

---

## Fase 1 — Auth + Modelo de datos en Supabase (Tom: frontend, Renato: backend) (~45 min)

### Tareas Renato (backend/datos)
- Definir y crear en Supabase las tablas mínimas para el MVP (recortadas del modelo completo, sin Community/News/Billing todavía):
  - `users` (lo gestiona Supabase Auth, extender con `streak_days` si alcanza)
  - `projects` (id, user_id, name, description, created_at)
  - `project_repos` (project_id, repo_full_name, repo_url)
  - `problems` (id, project_id, title, description, source_snippet, source_url, target_tech, difficulty, transferable_concepts jsonb, new_concepts jsonb, status)
  - `submissions` (id, problem_id, user_id, match_id nullable, code, language, score, feedback, status, created_at)
  - `matches` (id, problem_id, status, duration_sec, started_at, winner_id nullable)
  - `match_participants` (match_id, user_id, is_ai)
- Configurar Row Level Security básica (cada usuario ve sus propios proyectos).
- Exponer endpoint `POST /auth/callback` si se necesita algo custom, o confirmar que el flujo de Supabase Auth funciona directo desde el frontend sin pasar por el backend.

### Tareas Tom (frontend)
- Implementar pantalla de Landing con botones Sign in with Google / GitHub (según wireframe).
- Implementar guard de rutas: sin sesión, redirige a landing.
- Implementar layout con Sidebar (Dashboard, Your projects, Billing, Settings) — News y Community quedan fuera del MVP, no hace falta ni el ítem en el sidebar.
- Pantalla de Dashboard con datos mock primero (racha, últimos proyectos, gráfico de tecnologías) para no bloquearse esperando al backend.

**Checkpoint de Fase 1:** un usuario puede loguearse, ve el dashboard con su sidebar, y las tablas existen en Supabase.

---

## Fase 2 — Ingesta de repos y generación de problemas (Renato: LLM + GitHub, Tom: UI de creación de proyecto) (~1h)

Esta es la fase que sustenta el diferencial de producto. Prioridad máxima.

### Tareas Renato
- Implementar `services/github.py`: dado un `repo_full_name`, traer vía GitHub API el árbol de archivos y el contenido de los archivos relevantes (filtrar por extensión, ignorar `node_modules`, `.git`, binarios, límite de tamaño total para no reventar el contexto del LLM).
- Implementar `agents/analyzer.py` → `analizar_repo(codigo: str, target_tech: str) -> list[Problem]`:
  - Un solo prompt a Gemini que reciba el código relevante + la tecnología objetivo, y devuelva JSON estructurado con: título, descripción, fragmento fuente, tecnología detectada de origen, conceptos transferibles, conceptos nuevos, dificultad sugerida.
  - Forzar salida JSON (usar modo de salida estructurada de Gemini o parseo defensivo con reintento si falla el parseo).
- Endpoint `POST /projects/{id}/generate-problems`: dispara el análisis en background (`asyncio.create_task` o `BackgroundTasks`), y al terminar actualiza el proyecto en Supabase; notifica al frontend vía Supabase Realtime (canal por `project_id`) en vez de armar WebSockets propios.
- Endpoint `POST /projects` para crear el proyecto con sus repos asociados.

### Tareas Tom
- Modal "Create new project" (nombre, descripción, selector de repos de GitHub del usuario, selector de stack/tecnología objetivo) según wireframe.
- Pantalla de estado "Generating your problems..." suscrita al canal de Supabase Realtime del proyecto; al recibir el evento de completado, redirige a la vista de detalle.
- Vista de detalle de proyecto: lista de "Problemas propuestos" con botones Code / Fight, tal como el wireframe.

**Checkpoint de Fase 2:** flujo completo desde crear proyecto con un repo real hasta ver problemas generados en pantalla.

---

## Fase 3 — Modo Code (Renato: ejecución + evaluación, Tom: editor + resultado) (~1h)

### Tareas Renato
- Implementar `services/piston.py`: wrapper async sobre la API de Piston, con timeout y manejo de errores de red.
- Implementar `agents/evaluator.py` → `evaluar_submission(problema, codigo_usuario, resultado_ejecucion) -> {score, feedback}`: prompt que recibe el enunciado, el código del usuario y el stdout/stderr/exit code real de Piston, y devuelve score 0-100 más feedback textual.
- Endpoint `POST /problems/{id}/submissions`: ejecuta en Piston → llama al evaluador → guarda en Supabase → responde con score y feedback.
- **Escribir la suite de pruebas automáticas obligatoria** (requisito explícito de la organización): al menos un test de camino feliz (submission correcta → score alto) y un test de caso de error (código que falla en ejecución → manejo correcto sin caerse el backend).

### Tareas Tom
- Pantalla de Code mode: enunciado del problema + editor Monaco + botón Submit, según wireframe.
- Pantalla de resultado (Checker): ícono de éxito/fallo, score, feedback, botones Retry problem / Next problem / Switch to fight mode.
- Manejo de estado de carga mientras se ejecuta y evalúa (el wireframe muestra el ícono de "Generating..." reutilizable aquí).

**Checkpoint de Fase 3:** un usuario resuelve un problema real, ve su código ejecutarse contra Piston, y recibe score + feedback generado por LLM.

---

## Fase 4 — Modo Fight / Versus (Renato: agente versus + matchmaking, Tom: UI de duelo) (~1h)

Si el tiempo aprieta, esta fase se puede acotar a **solo IA vs usuario** (sin duelo entre dos usuarios reales), que es más simple y sigue siendo demostrable.

### Tareas Renato
- Implementar `agents/versus.py` → `generar_solucion_progresiva(problema, nivel) -> stream de pasos`: prompt que genera una "solución humanizada" con errores deliberados y su corrección, calibrada por nivel de dificultad. Si el tiempo no da para streaming real, generar la secuencia completa de antemano y reproducirla en el frontend a ritmo simulado.
- Endpoint `POST /matches`: crea el match, si el oponente es IA dispara el agente versus; si es otro usuario, usa Supabase Realtime para sincronizar estado y timer entre ambos clientes.
- Reutilizar `evaluar_submission` de la Fase 3 para calificar ambas soluciones al cierre del match.
- Endpoint que resuelve el match: compara scores, determina ganador, guarda feedback para ambos participantes.

### Tareas Tom
- Pantalla "Choose your opponent" + "Choose the battle stack" + botón Start fight, según wireframe.
- Pantalla de Arena: editor + timer countdown (5:00) + panel mostrando el progreso simulado de la IA (o del oponente real vía Realtime).
- Pantalla "FARA is reviewing both responses..." y pantallas finales de resultado (You won / You lost) con feedback para ambos, según wireframe.

**Checkpoint de Fase 4:** un usuario entra a un duelo contra la IA, ambos "resuelven" en paralelo, y el sistema declara ganador con feedback.

---

## Fase 5 — Pulido, despliegue y entregables obligatorios (ambos, ~45 min)

Esta fase no es opcional: son requisitos explícitos de las bases que descalifican o restan puntaje si faltan.

### Tareas conjuntas
- **README.md definitivo**: nombre, misión, problema, MVP, stack, setup local, integrantes y roles.
- **Carpeta `/docs`**: diagrama de arquitectura (los Mermaid ya generados), `pitch.pdf` con el deck.
- **`.env.example`** sin credenciales reales expuestas.
- Deploy de backend en Railway/Render y frontend en Vercel; confirmar que la URL de producción está viva **antes** de las 4:30 pm, con margen.
- Verificar que la suite de tests corre limpia (`pytest`).
- Publicar el Release "Entrega Final - FARA" en GitHub con todo lo anterior.

### División sugerida dentro de esta fase
- **Renato**: deploy de backend, revisión de que no haya API keys hardcodeadas, correr y arreglar tests.
- **Tom**: deploy de frontend, README, deck de pitch, última pasada de UI/UX contra el wireframe original.

**Checkpoint final:** Release publicado, URL de producción funcionando, tests en verde, pitch listo para las 5:00 pm.

---

## Fuera de alcance para hoy (explícitamente pospuesto)

**Community y News no forman parte de este plan.** Quedan descartadas del MVP; no aparecen ni en el sidebar ni en la estructura de carpetas. Pesan poco en la rúbrica (no son ni Innovación, ni Ingeniería, ni Modelo de Negocio directamente) y consumen tiempo desproporcionado. Si el jurado pregunta, la respuesta es: "están diseñadas en el wireframe y el modelo de datos, priorizamos el loop core para la demo."

Billing sí queda en el plan (aparece en el sidebar y en Fase 1), porque conecta directo con el criterio de Modelo de Negocio (20% de la rúbrica) aunque sea una pantalla simple sin pasarela de pago real integrada hoy.

## Orden de prioridad si el tiempo se acaba

1. Modo Code funcionando end-to-end (Fase 3) — es la prueba de que el core técnico funciona.
2. Generación de problemas desde un repo real (Fase 2) — es el diferencial de producto frente al jurado.
3. Modo Fight, aunque sea solo contra IA sin streaming real (Fase 4).
4. Tests y deploy (Fase 5) — innegociable, no se recorta.
