# FARA

**Convierte tu experiencia en ventaja.** Practica una tecnología nueva sobre el código real que ya escribiste, en vez de sobre ejercicios genéricos inventados.

---

## El problema

Cuando un profesional de software necesita adoptar una tecnología nueva —porque su equipo migra de stack, porque un proyecto lo exige, o porque busca otra oportunidad laboral— el camino habitual sigue siendo el mismo: tutoriales genéricos y proyectos de práctica desconectados de su experiencia.

Eso genera una fricción concreta: **aprender "desde cero" cuando en realidad se parte de años de experiencia es un desperdicio de tiempo**. El problema no es la falta de contenido educativo —de eso sobra—, sino la falta de un puente entre lo que la persona ya sabe hacer y lo que necesita incorporar.

## La solución

FARA es una plataforma agéntica que toma los repositorios de GitHub del usuario, identifica fragmentos de código con potencial de traducción a la tecnología que quiere aprender, y genera **ejercicios prácticos anclados a ese código propio** —señalando explícitamente qué conceptos son transferibles (ya los domina) y cuáles son genuinamente nuevos.

El diferencial es el **modo Fight**: el usuario resuelve el ejercicio en paralelo a una IA que escribe su propia solución a ritmo humano, cometiendo errores deliberados —calibrados por nivel y concentrados en los conceptos nuevos— y corrigiéndolos sobre la marcha. Ver el proceso de error y corrección enseña más que ver código perfecto. Todo de forma transparente: el usuario sabe en todo momento que compite contra una IA.

## MVP implementado

| Fase | Alcance | Estado |
|---|---|---|
| Auth y multi-tenant | Login con Google/GitHub (Supabase Auth), `Organization` + `Membership` reales, switcher de organización | ✅ |
| Ingesta y generación | Lectura de repos vía GitHub API → Agente de Matching → Agente Generador → problemas con conceptos transferibles/nuevos | ✅ |
| Modo Code | Editor Monaco, ejecución real en Piston, evaluación con LLM (score + feedback cualitativo) | ✅ |
| Modo Fight vs IA | Guion completo pregenerado con errores deliberados calibrados por nivel, timer, resolución por tiempo + score | ✅ |
| Modo Fight vs Humano | Sala de espera vía Realtime, duelo en paralelo con timer compartido, evaluación de ambas soluciones, abandono | ✅ |
| Colaboración | Enlace de invitación por proyecto, `ProjectMember` internos y externos | ✅ |
| Billing | Flag de plan por usuario (NPC / Giga Chad), sin pasarela real | ✅ |
| Community / News | Fuera de alcance (ADR-08) — pantallas con contenido de muestra | ⚪ |

## Arquitectura

```
Next.js (Vercel)  ──HTTPS/Realtime──>  FastAPI (Railway/Render)  ──>  Supabase (Postgres + pgvector + Auth + Realtime)
                                              │
                                              ├──>  Gemini      (4 agentes: matching, generación, versus, evaluación)
                                              ├──>  GitHub API  (ingesta de repos)
                                              └──>  Piston      (ejecución aislada de código, autohospedado)
```

Los diagramas completos (componentes, clases, secuencias, ERD, máquinas de estado) están en
[`docs/architecture/ARCHITECTURE_FARA.md`](docs/architecture/ARCHITECTURE_FARA.md), en Mermaid, y renderizan directo en GitHub.

Los cuatro agentes se orquestan directamente desde FastAPI, sin frameworks tipo LangChain:

| Agente | Archivo | Rol |
|---|---|---|
| A1 · Matching de código | `backend/app/agents/matcher.py` | Detecta fragmentos con potencial de traducción |
| A2 · Generador de ejercicios | `backend/app/agents/generator.py` | Convierte cada fragmento en un problema |
| A3 · Versus | `backend/app/agents/versus.py` | Genera el guion de la IA con errores deliberados |
| A4 · Evaluador | `backend/app/agents/evaluator.py` | Califica envíos usando el resultado real de ejecución |

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind 4, Monaco Editor |
| Backend | FastAPI (Python 3.12+), Pydantic |
| Base de datos | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth (Google / GitHub) |
| Realtime | Supabase Realtime (broadcast) |
| LLM | Gemini (`gemini-3.6-flash`) |
| Ejecución de código | Piston autohospedado (Docker) |
| Testing | Pytest |

## Setup local

### Requisitos
Python 3.12+, Node 20+, Docker, y un proyecto de Supabase.

### 1. Base de datos

Ejecutá [`backend/supabase/migrations/0001_init.sql`](backend/supabase/migrations/0001_init.sql) en el SQL Editor de Supabase. Crea las 13 tablas, la extensión `pgvector`, el trigger que sincroniza `auth.users` → `public.users` y las policies de RLS.

En **Authentication → Sign In / Providers** habilitá GitHub y/o Google. La callback URL a registrar en el proveedor es `https://<tu-project-ref>.supabase.co/auth/v1/callback`. En **URL Configuration**, agregá `http://localhost:3000/**` a los Redirect URLs.

### 2. Runner de código (Piston)

La API pública de Piston pasó a ser whitelist-only en febrero de 2026, así que se autohospeda:

```bash
docker run -d --name fara-piston --restart unless-stopped --privileged \
  -p 2000:2000 -v piston-packages:/piston/packages ghcr.io/engineer-man/piston

# El contenedor viene sin lenguajes: instalá los que vayas a usar
for pkg in "python 3.10.0" "node 20.11.1" "go 1.16.2" "java 15.0.2"; do
  set -- $pkg
  curl -s -X POST http://localhost:2000/api/v2/packages \
    -H "Content-Type: application/json" -d "{\"language\":\"$1\",\"version\":\"$2\"}"
done
```

### 3. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # completá SUPABASE_*, GEMINI_API_KEY
python -m uvicorn app.main:app --reload --port 8000
```

Documentación interactiva de la API en `http://localhost:8000/docs`.

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # completá NEXT_PUBLIC_SUPABASE_*
npm run dev
```

Abrí `http://localhost:3000`.

### Tests

```bash
cd backend && .venv/bin/python -m pytest
```

Cubren el camino feliz y los casos de error de la ejecución en Piston, el parseo de las respuestas del LLM, la calibración de niveles del agente Versus, y que todos los endpoints exijan autenticación.

## Deploy

- **Frontend → Vercel**: root directory `frontend/`. Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (URL pública del backend).
- **Backend → Railway / Render**: root directory `backend/`, usa el `Dockerfile` incluido. Variables: las de `.env.example`, más `CORS_ORIGINS` con el dominio de Vercel y `PISTON_API_URL` apuntando al servicio de Piston.
- **Piston**: se despliega como un segundo servicio en la misma plataforma, desde la imagen `ghcr.io/engineer-man/piston` (requiere modo privilegiado). Hay que instalarle los runtimes una vez, igual que en local.

Recordá agregar el dominio de producción a los Redirect URLs de Supabase Auth.

## Estructura del repositorio

```
backend/
  app/
    agents/       # los 4 agentes de IA
    core/         # config, auth (JWT de Supabase), control de acceso
    routers/      # organizations, projects, problems, submissions, matches
    services/     # github, llm, piston, realtime, technologies
    schemas/      # modelos Pydantic de request/response
  supabase/migrations/
  tests/
frontend/
  app/            # App Router: (auth) publica, (app) shell autenticado
  components/     # layout, projects, code-editor, common
  context/        # AppContext: sesión, organizaciones, proyectos
  lib/            # api-client, supabase-client, mappers, runtimes
docs/
  architecture/   # ARCHITECTURE_FARA.md, WORKFLOW.md
  context/        # propuesta de valor
  stack/          # decisiones de stack
  plan-trabajo/   # plan de ejecución
```

## Equipo

| Integrante | Rol |
|---|---|
| Renato ([@devrenato56](https://github.com/devrenato56)) | Backend: modelo de datos, API, agentes de IA, integración con Piston y despliegue |
| Tom ([@TomJordan1](https://github.com/TomJordan1)) | Frontend: interfaz, flujos de UX y despliegue del cliente |
| [@OldestDream](https://github.com/OldestDream), [@pammdada](https://github.com/pammdada) | Documentación y propuesta de producto |
