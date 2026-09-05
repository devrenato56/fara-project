# FARA — Plan de Trabajo (Hackathon, día único) — v2

Alineado a `ARCHITECTURE_FARA.md` v5. Cambios de fondo respecto a la v1 de este plan al final del documento.

Checkpoints obligatorios de la organización:
- **12:00 pm** — Release "Arquitectura - FARA" en GitHub
- **4:30 pm** — Release "Entrega Final - FARA" en GitHub (código + URL producción + tests + pitch.pdf)

**Nota de lectura:** el diagrama de arquitectura describe roles ("PostgreSQL + pgvector", "Redis pub/sub + timer", "Runner de código"), no proveedores — así debe ser un diagrama de arquitectura. Este plan sí fija los proveedores concretos con los que se implementa cada rol, porque es un documento de ejecución, no de arquitectura:

| Rol en el diagrama | Implementación elegida |
|---|---|
| PostgreSQL + pgvector | Supabase (Postgres gestionado + extensión pgvector) |
| Auth Provider (Google/GitHub) | Supabase Auth |
| Redis (pub/sub + timer de salas) | Supabase Realtime (broadcast + presence); el timer se calcula en cliente contra un `started_at` guardado en `matches` |
| Runner de código | Piston API pública |
| API Monolito | FastAPI (Python), un solo servicio/deploy |

---

## Fase 0 — Bootstrap de estructura (ambos, en paralelo, ~30 min)

### Tarea 0.1 — Estructura de backend (Renato)
- Crear proyecto FastAPI con esta estructura:
  ```
  backend/
    app/
      main.py
      core/config.py          # env vars, settings con pydantic-settings
      db/supabase.py          # cliente Supabase inicializado
      services/
        piston.py             # wrapper de ejecución de código
        llm.py                 # cliente(s) LLM (Gemini + fallback)
        realtime.py            # helper para publicar eventos en canales Supabase Realtime
      agents/
        matcher.py             # Agente Matching de Código (A1)
        generator.py           # Agente Generador de Ejercicios (A2)
        versus.py              # Agente Versus — guion completo (A3)
        evaluator.py           # Agente Evaluador (A4)
      routers/
        auth.py
        organizations.py       # switcher de Organization, Membership
        projects.py            # incluye invite link y ProjectMember
        problems.py
        submissions.py
        matches.py              # vs IA y vs Humano
      schemas/                  # modelos Pydantic (request/response)
      models/                   # tipos que mapean tablas de Supabase
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
      dashboard/                      # incluye el switcher de Organization
      projects/
        [projectId]/
          invite/                     # pantalla de aceptar invitación (ProjectMember externo)
      problems/[problemId]/code/
      match/
        [matchId]/
          waiting-room/               # sala de espera, solo vs Humano
          arena/                      # vs IA o vs Humano
      billing/
    components/
      ui/                             # shadcn o similar
      layout/Sidebar.tsx
      layout/OrgSwitcher.tsx
      dashboard/
      projects/
      code-editor/                    # wrapper de Monaco/CodeMirror
      match/
    lib/
      api-client.ts                   # fetch tipado hacia FastAPI
      supabase-client.ts              # auth + realtime desde el frontend
    types/
  ```
- Configurar cliente de Supabase Auth (Google/GitHub) según el wireframe de landing.
- Configurar variable de entorno apuntando a la URL del backend (Railway/Render).
- Elegir y montar el editor de código (recomendado: Monaco).

**Checkpoint de Fase 0:** ambos repos con esqueleto pusheado, backend responde `/health`, frontend renderiza el layout con sidebar y switcher de organización (aunque sea con datos mock).

---

## Fase 1 — Auth, Organization y modelo de datos (Tom: frontend, Renato: backend) (~1h)

Esta fase creció respecto a la v1 del plan: ya no es solo "tablas + login", incluye el multi-tenant real que exige la arquitectura.

### Tareas Renato (backend/datos)
Crear en Supabase el modelo de datos de la sección 9 del doc de arquitectura:
- `users` (gestionado por Supabase Auth; extender con `streak_days`, `plan`)
- `organizations` (id, name, owner_id)
- `memberships` (org_id, user_id, joined_at) — un usuario puede estar en varias organizaciones, sin roles
- `projects` (id, org_id, name, description, invite_token, created_at)
- `project_members` (id, project_id, user_id, is_external, joined_at) — equipo de fight, independiente de `memberships`
- `project_repos` (project_id, repo_full_name, repo_url)
- `technologies` (id, name, icon_url, is_trending)
- `project_tech` (project_id, technology_id)
- `problems` (id, project_id, title, description, source_snippet, source_url, difficulty, transferable_concepts jsonb, new_concepts jsonb, status) — **sin** `target_tech` como campo único
- `problem_tech` (problem_id, technology_id) — relación muchos-a-muchos, reemplaza el campo único
- `submissions` (id, problem_id, user_id, match_id nullable, code, score, feedback, status, created_at)
- `matches` (id, problem_id, challenger_id, opponent_type, opponent_user_id nullable, status, duration_sec, ai_completion_time_sec nullable, ai_reveal_script jsonb nullable, winner_id nullable)
- `code_embeddings` (id, problem_id, embedding vector) — pgvector

Endpoints:
- `POST /organizations`, `GET /organizations` (listar las del usuario), endpoint de switch de organización activa (puede ser solo estado en frontend si no hay necesidad de persistirlo).
- `POST /projects/{id}/invite` — genera/retorna el `invite_token`.
- `POST /projects/{id}/join` — un usuario (miembro de la org o externo) se une a `project_members` vía token; setea `is_external` según corresponda.
- RLS básica: un usuario ve organizaciones donde tiene `membership`, y proyectos de esas organizaciones.

### Tareas Tom (frontend)
- Landing con Sign in with Google / GitHub / Phone.
- Guard de rutas: sin sesión, redirige a landing.
- **Switcher de Organization** en la sidebar ("Renato's org ▾") — selector real, no label fijo, consumiendo `GET /organizations`.
- Layout con Sidebar (Dashboard, Your projects, Billing, Settings).
- Dashboard con datos mock inicialmente (racha, últimos proyectos, tecnologías aprendidas).
- Pantalla de aceptar invitación a proyecto (`/projects/[id]/invite`) para el flujo de `ProjectMember` externo.

**Checkpoint de Fase 1:** un usuario se loguea, ve al menos una organización en el switcher, puede crear un proyecto dentro de ella, y las tablas completas del modelo existen en Supabase.

---

## Fase 2 — Ingesta de repos y generación de problemas (Renato: LLM + GitHub, Tom: UI de creación de proyecto) (~1h)

Sin cambios de fondo respecto a la v1, con un ajuste: los problemas ahora se generan con relación muchos-a-muchos a tecnologías, no una sola.

### Tareas Renato
- `services/github.py`: dado un `repo_full_name`, traer el árbol y contenido relevante (filtrar extensión, ignorar binarios/`node_modules`, límite de tamaño para no reventar contexto).
- `agents/matcher.py` (Agente A1) + `agents/generator.py` (Agente A2): pueden implementarse como una sola llamada a Gemini en la práctica (análisis + generación en un prompt), pero conceptualmente separados como indica el diagrama de componentes. Salida: problemas con `title`, `description`, `source_snippet`, `difficulty`, `transferable_concepts`, `new_concepts`, y **lista de tecnologías** a las que el problema es adaptable (no una sola).
- Endpoint `POST /projects` (dentro de una `organization`, con repos y stack seleccionado).
- Endpoint `POST /projects/{id}/generate-problems`: dispara el análisis en background, guarda `problems` + `problem_tech`, y al terminar publica evento en un canal de Supabase Realtime (`project:{id}`) con tipo `problems.ready`.

### Tareas Tom
- Modal "Create new project" (nombre, descripción, repos, selector de stack/tecnologías) según wireframe, dentro de la organización activa.
- Pantalla "Generating your problems..." suscrita al canal Realtime `project:{id}`; al recibir `problems.ready`, redirige al detalle.
- Vista de detalle de proyecto: "Problemas propuestos" (mostrando íconos de las tecnologías a las que cada uno es adaptable — ya no una sola), botón para **compartir enlace de invitación** ("Your Team"), botones Code / Fight por problema.

**Checkpoint de Fase 2:** flujo completo desde crear proyecto con un repo real hasta ver problemas generados, cada uno con sus tecnologías adaptables, y un enlace de invitación funcional.

---

## Fase 3 — Modo Code (Renato: ejecución + evaluación, Tom: editor + resultado) (~1h)

Sin cambios respecto a la v1 — esta fase ya estaba alineada.

### Tareas Renato
- `services/piston.py`: wrapper async sobre la API de Piston, con timeout y manejo de errores de red.
- `agents/evaluator.py` (Agente A4) → `evaluar_submission(problema, codigo_usuario, resultado_ejecucion) -> {score, feedback}`.
- Endpoint `POST /problems/{id}/submissions`: ejecuta en Piston → evalúa → guarda en Supabase → responde con score y feedback.
- **Suite de pruebas automáticas obligatoria**: al menos un test de camino feliz y uno de caso de error.

### Tareas Tom
- Pantalla de Code mode: enunciado + editor Monaco + botón Submit.
- Pantalla de resultado: ícono de éxito/fallo, score, feedback, botones Retry / Next problem / Switch to fight mode.

**Checkpoint de Fase 3:** un usuario resuelve un problema real, ve su código ejecutarse contra Piston, y recibe score + feedback generado por LLM.

---

## Fase 4 — Modo Fight vs IA (Renato: agente versus + matches, Tom: UI de arena) (~45 min)

Esta fase se simplifica respecto a la v1 gracias a ADR-07: el guion de la IA se genera **completo, una sola vez, antes de iniciar el timer** — no hay streaming en vivo del LLM durante el duelo.

### Tareas Renato
- `agents/versus.py` (Agente A3) → `generar_guion(problema, nivel) -> {steps: [...], completionTimeSec}`: una sola llamada al LLM que devuelve la secuencia completa de pasos (buggy → corrección → limpio) y el tiempo total que la IA "tarda" en resolver.
- Endpoint `POST /matches` con `opponentType=ai`: genera el guion, guarda `Match` + `ai_reveal_script` + `ai_completion_time_sec`, publica `match.started` con el guion vía Realtime, arranca el timer (guardando `started_at`).
- Endpoint `POST /matches/{id}/submissions`: ejecuta en Piston, evalúa con A4, compara el instante `t` del envío del usuario contra `completionTimeSec` de la IA para decidir ganador (usuario gana si `t < completionTimeSec` y `score >= umbral`).

### Tareas Tom
- Pantalla "Choose the battle stack" → Start fight (vs IA).
- Arena: editor + timer countdown (calculado en cliente contra `started_at`) + panel que reproduce el guion de la IA paso a paso a ritmo simulado (ya generado completo, el frontend solo lo reproduce con delays).
- Pantalla "Evaluando tu solución..." y resultado final (You won / You lost) con feedback.

**Checkpoint de Fase 4:** un usuario entra a un duelo contra la IA, ve el guion reproducirse con errores y correcciones, envía su código, y el sistema declara ganador comparando tiempo y score.

---

## Fase 5 — Modo Fight vs Humano (Renato: salas + sincronización, Tom: UI de sala de espera) (~1h)

**Esta fase es nueva respecto a la v1 del plan.** En la v1 el fight contra otra persona era un "si sobra tiempo"; en la arquitectura v5 es un modo de primera clase (ADR-09: sin atajos, ambas soluciones pasan por Runner + Evaluador porque el rival es real). Se hace después de la Fase 4 porque reutiliza toda su infraestructura de matches y arena, solo cambia el origen del oponente.

### Tareas Renato
- Endpoint `POST /matches` con `opponentType=human`: crea el match en estado `WaitingOpponent`, publica la sala en el canal Realtime del proyecto (para que aparezca a quien tenga el invite link).
- Endpoint `POST /matches/{id}/join`: el segundo usuario se une (debe ser `ProjectMember` del proyecto, incluyendo externos); al unirse, publica `match.started` a ambos clientes y arranca el timer compartido.
- Endpoint `POST /matches/{id}/submissions`: acepta un envío por usuario; cuando ambos han enviado (o el timer llega a 0), ejecuta ambos en Piston, evalúa ambos con A4, determina ganador por score, guarda ambos `submissions`, publica `match.finished` con feedback individual para cada uno.
- Manejo de estado `Abandoned` si un jugador se desconecta de forma sostenida.

### Tareas Tom
- Pantalla de sala de espera (`waiting-room`): estado "esperando rival", se activa al recibir `match.started` vía Realtime.
- Arena vs Humano: mismo componente de editor + timer que la Fase 4, sin el panel de reproducción de guion IA.
- Pantalla "Evaluando ambas soluciones..." y resultados finales para ambos jugadores (You won / You lost) con feedback individual.

**Checkpoint de Fase 5:** dos usuarios reales (dos pestañas/dispositivos) entran a un duelo vía enlace de invitación, ambos resuelven en paralelo, y el sistema declara ganador con feedback para ambos.

---

## Fase 6 — Pulido, despliegue y entregables obligatorios (ambos, ~45 min)

Requisitos explícitos de las bases que descalifican o restan puntaje si faltan.

### Tareas conjuntas
- **README.md definitivo**: nombre, misión, problema, MVP, stack, setup local, integrantes y roles.
- **Carpeta `/docs`**: diagramas Mermaid de `ARCHITECTURE_FARA.md`, `pitch.pdf`.
- **`.env.example`** sin credenciales reales expuestas.
- Deploy de backend en Railway/Render y frontend en Vercel; confirmar URL de producción activa **antes** de las 4:30 pm.
- Verificar que la suite de tests corre limpia (`pytest`).
- Publicar el Release "Entrega Final - FARA" en GitHub.

### División sugerida
- **Renato**: deploy de backend, revisión de que no haya API keys hardcodeadas, correr y arreglar tests.
- **Tom**: deploy de frontend, README, deck de pitch, última pasada de UI/UX contra el wireframe original.

**Checkpoint final:** Release publicado, URL de producción funcionando, tests en verde, pitch listo.

---

## Fuera de alcance para hoy

**Community y News** no forman parte de este plan (ADR-08 de la arquitectura). No aparecen en sidebar ni en estructura de carpetas.

**Billing** queda en el plan como flag de plan en `User` (NPC / Giga Chad), sin pasarela de pago real — consistente con la arquitectura, que lo modela como campo simple, no como servicio de billing completo.

## Orden de prioridad si el tiempo se acaba

1. Modo Code funcionando end-to-end (Fase 3) — prueba el core técnico.
2. Generación de problemas desde un repo real (Fase 2) — es el diferencial de producto frente al jurado.
3. Modo Fight vs IA (Fase 4) — ya simplificado por el guion pregenerado, es más barato de lo que parece.
4. Tests y deploy (Fase 6) — innegociable, no se recorta.
5. **Modo Fight vs Humano (Fase 5) es lo primero que se recorta si falta tiempo**, a pesar de estar en la arquitectura como feature completa — reutiliza casi toda la infraestructura de la Fase 4, así que si se corta, se corta con el menor costo de las cinco fases de producto.

---

## Cambios de esta versión (v2) respecto a la v1 del plan

1. Se agregó el rol de cada proveedor (Supabase, Piston, FastAPI) frente a los roles genéricos del diagrama de arquitectura, dejando claro que el diagrama no debía nombrarlos.
2. El modelo de datos de la Fase 1 incorpora `Organization`, `Membership`, `ProjectMember` (con `is_external`) e `invite_token`, ausentes en la v1.
3. `Problem` ↔ `Technology` pasa a ser muchos-a-muchos (`problem_tech`) en vez de un campo único `target_tech`.
4. El Agente Versus (Fase 4) se simplifica: guion completo generado una vez, sin streaming en vivo (ADR-07) — la v1 lo dejaba como plan B, ahora es el plan único.
5. Se agrega la **Fase 5 — Modo Fight vs Humano** como fase completa con su propio checkpoint, en vez de ser un recorte opcional dentro de la fase de Fight como en la v1.
6. La fase de despliegue pasa de numerarse como Fase 5 a Fase 6 por la inserción de la nueva fase.
