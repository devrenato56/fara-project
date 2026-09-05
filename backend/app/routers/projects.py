import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.agents import generator, matcher
from app.core.access import is_org_member, require_org_member, require_project_access
from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.problem import ProblemOut
from app.schemas.project import (
    ProjectCreate,
    ProjectDetailOut,
    ProjectInviteOut,
    ProjectJoinIn,
    ProjectMemberOut,
    ProjectOut,
)
from app.services import realtime
from app.services.github import GitHubFetchError, fetch_repo_code
from app.services.technologies import upsert_technologies

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_project_or_404(project_id: str) -> dict:
    supabase = get_supabase()
    result = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return result.data[0]


def _project_to_out(project: dict) -> ProjectOut:
    repos = [r["repo_full_name"] for r in project.get("project_repos", [])]
    technologies = [pt["technologies"]["name"] for pt in project.get("project_tech", []) if pt.get("technologies")]
    return ProjectOut(**{**project, "repos": repos, "technologies": technologies})


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, user: CurrentUser = Depends(get_current_user)) -> ProjectOut:
    require_org_member(user.id, body.org_id)

    supabase = get_supabase()

    project_result = (
        supabase.table("projects")
        .insert({"org_id": body.org_id, "name": body.name, "description": body.description})
        .execute()
    )
    if not project_result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create project")
    project = project_result.data[0]

    if body.repos:
        supabase.table("project_repos").insert(
            [
                {
                    "project_id": project["id"],
                    "repo_full_name": full_name,
                    "repo_url": f"https://github.com/{full_name}",
                }
                for full_name in body.repos
            ]
        ).execute()

    if body.technologies:
        tech_ids = upsert_technologies(body.technologies)
        supabase.table("project_tech").insert(
            [{"project_id": project["id"], "technology_id": tech_id} for tech_id in tech_ids.values()]
        ).execute()

    return ProjectOut(
        **project,
        repos=list(body.repos),
        technologies=list(body.technologies),
    )


@router.get("", response_model=list[ProjectOut])
def list_projects(org_id: str, user: CurrentUser = Depends(get_current_user)) -> list[ProjectOut]:
    require_org_member(user.id, org_id)

    supabase = get_supabase()
    result = (
        supabase.table("projects")
        .select("*, project_repos(repo_full_name), project_tech(technologies(name))")
        .eq("org_id", org_id)
        .execute()
    )
    return [_project_to_out(project) for project in result.data]


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project(project_id: str, user: CurrentUser = Depends(get_current_user)) -> ProjectDetailOut:
    supabase = get_supabase()
    result = (
        supabase.table("projects")
        .select("*, project_repos(repo_full_name), project_tech(technologies(name))")
        .eq("id", project_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project = result.data[0]
    # ProjectMember externo (via invitacion) tambien necesita ver el proyecto
    # para poder pelear en el (Fase 5).
    require_project_access(user.id, project)

    problems_result = (
        supabase.table("problems")
        .select("*, problem_tech(technologies(name))")
        .eq("project_id", project_id)
        .execute()
    )
    problems = [
        ProblemOut(
            **{
                **p,
                "technologies": [
                    pt["technologies"]["name"] for pt in p.get("problem_tech", []) if pt.get("technologies")
                ],
            }
        )
        for p in problems_result.data
    ]

    base = _project_to_out(project)
    return ProjectDetailOut(**base.model_dump(), problems=problems)


@router.post("/{project_id}/invite", response_model=ProjectInviteOut)
def get_invite_link(project_id: str, user: CurrentUser = Depends(get_current_user)) -> ProjectInviteOut:
    project = _get_project_or_404(project_id)
    require_org_member(user.id, project["org_id"])
    return ProjectInviteOut(invite_token=project["invite_token"])


@router.post("/{project_id}/join", response_model=ProjectMemberOut, status_code=status.HTTP_201_CREATED)
def join_project(
    project_id: str, body: ProjectJoinIn, user: CurrentUser = Depends(get_current_user)
) -> ProjectMemberOut:
    project = _get_project_or_404(project_id)

    if str(project["invite_token"]) != body.invite_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid invite token")

    supabase = get_supabase()

    existing = (
        supabase.table("project_members")
        .select("*")
        .eq("project_id", project_id)
        .eq("user_id", user.id)
        .execute()
    )
    if existing.data:
        return ProjectMemberOut(**existing.data[0])

    is_external = not is_org_member(user.id, project["org_id"])

    result = (
        supabase.table("project_members")
        .insert({"project_id": project_id, "user_id": user.id, "is_external": is_external})
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not join project")

    return ProjectMemberOut(**result.data[0])


MOCK_CODE_TEMPLATES = {
    "Go": """package main

import (
    "encoding/json"
    "net/http"
)

type Task struct {
    ID        string `json:"id"`
    Title     string `json:"title"`
    Completed bool   `json:"completed"`
}

func ListTasksHandler(w http.ResponseWriter, r *http.Request) {
    tasks := []Task{
        {ID: "1", Title: "Configurar API Gateway", Completed: true},
        {ID: "2", Title: "Implementar autenticación JWT", Completed: false},
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tasks)
}
""",
    "Docker": """FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8000
CMD ["./server"]
""",
    "PostgreSQL": """CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIMEZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_completed ON tasks(completed);
""",
    "Redis": """package cache

import (
    "context"
    "time"
    "github.com/redis/go-redis/v9"
)

func SetSession(ctx context.Context, rdb *redis.Client, token string, userId string) error {
    return rdb.Set(ctx, "session:"+token, userId, 24*time.Hour).Err()
}
""",
    "Python": """from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id < 0:
        raise HTTPException(status_code=400, detail="Invalid ID")
    return {"item_id": item_id, "status": "ok"}
""",
    "TypeScript": """export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
}

export function formatUser(user: User): string {
    return `[${user.role.toUpperCase()}] ${user.email}`;
}
""",
}


def _build_fallback_problems(tecnologias: list[str]) -> list[dict]:
    main_tech = tecnologias[0] if tecnologias else "Go"
    return [
        {
            "title": f"Implementar servicio de gestión de datos en {main_tech}",
            "description": f"Construye una función o módulo idiomático en {main_tech} que valide estructuras de datos, maneje errores de entrada y retorne una respuesta válida.",
            "source_path": f"src/demo_{main_tech.lower()}.code",
            "source_snippet": f"// Estructura principal en {main_tech}\nfunc ProcessData(input string) (string, error) {{\n    // Reconstruir validación\n}}",
            "difficulty": "easy",
            "transferable_concepts": ["Diseño de APIs", "Validación de entrada", "Manejo de errores"],
            "new_concepts": [f"Sintaxis e idiomática en {main_tech}", "Manejo de tipos"],
            "technologies": tecnologias,
        },
        {
            "title": f"Manejo de persistencia y concurrencia ({', '.join(tecnologias[:2])})",
            "description": f"Diseña una capa de acceso o almacenamiento eficiente combinando {', '.join(tecnologias[:2])} para evitar operaciones bloqueantes en el hilo principal.",
            "source_path": f"src/storage.{main_tech.lower()}",
            "source_snippet": f"// Operación de almacenamiento\nfunc SaveRecord(ctx context.Context, record Record) error {{\n    // Implementar almacenamiento\n}}",
            "difficulty": "medium",
            "transferable_concepts": ["Patrón de Almacenamiento", "Aislamiento de transacciones"],
            "new_concepts": [f"Concurrencia en {main_tech}", "Manejo de estado"],
            "technologies": tecnologias,
        },
        {
            "title": f"Despliegue y configuración de entorno ({', '.join(tecnologias)})",
            "description": f"Configura los artefactos y dependencias necesarias para ejecutar y empaquetar el servicio en entornos productivos.",
            "source_path": "Dockerfile",
            "source_snippet": "FROM golang:1.22-alpine\nWORKDIR /app\nCOPY . .\nCMD [\"./server\"]",
            "difficulty": "hard",
            "transferable_concepts": ["Aislamiento de contenedores", "Variables de entorno"],
            "new_concepts": ["Empaquetado multi-etapa", "Configuración de producción"],
            "technologies": tecnologias,
        },
    ]


async def _generate_problems_task(project_id: str) -> None:
    supabase = get_supabase()
    channel = f"project:{project_id}"

    try:
        repos = supabase.table("project_repos").select("repo_full_name").eq("project_id", project_id).execute().data
        tech_rows = (
            supabase.table("project_tech")
            .select("technologies(name)")
            .eq("project_id", project_id)
            .execute()
            .data
        )
        tecnologias = [row["technologies"]["name"] for row in tech_rows if row.get("technologies")]
        if not tecnologias:
            tecnologias = ["Go", "Docker"]

        codigo_por_archivo: dict[str, str] = {}
        for repo in repos:
            try:
                codigo_por_archivo.update(await fetch_repo_code(repo["repo_full_name"]))
            except GitHubFetchError as exc:
                logger.warning("Skipping repo %s: %s", repo["repo_full_name"], exc)

        # Fallback a codigo sintetico si los repos no existen en GitHub
        if not codigo_por_archivo:
            for tech in tecnologias:
                template = MOCK_CODE_TEMPLATES.get(tech)
                if template:
                    ext = (
                        "go" if tech == "Go"
                        else "sql" if tech == "PostgreSQL"
                        else "py" if tech == "Python"
                        else "ts" if tech == "TypeScript"
                        else "txt"
                    )
                    codigo_por_archivo[f"src/demo_{tech.lower()}.{ext}"] = template
            if not codigo_por_archivo:
                codigo_por_archivo["src/main.go"] = MOCK_CODE_TEMPLATES["Go"]

        problemas = []
        try:
            fragmentos = await matcher.analizar_repo(codigo_por_archivo, tecnologias)
            if fragmentos:
                problemas = await generator.generar_ejercicios(fragmentos, tecnologias)
        except Exception as exc:
            logger.warning("Agent generation failed, falling back to synthetic problems: %s", exc)

        if not problemas:
            problemas = _build_fallback_problems(tecnologias)

        tech_ids = upsert_technologies(tecnologias)

        for problema in problemas:
            problem_technologies = problema.get("technologies") or tecnologias
            source_path = problema.get("source_path")

            inserted = (
                supabase.table("problems")
                .insert(
                    {
                        "project_id": project_id,
                        "title": problema.get("title", "Untitled problem"),
                        "description": problema.get("description", ""),
                        "source_snippet": problema.get("source_snippet"),
                        "source_url": (
                            f"https://github.com/{source_path}" if source_path and "/" in source_path else None
                        ),
                        "difficulty": problema.get("difficulty", "medium"),
                        "transferable_concepts": problema.get("transferable_concepts", []),
                        "new_concepts": problema.get("new_concepts", []),
                        "status": "proposed",
                    }
                )
                .execute()
            )
            if inserted.data:
                problem_id = inserted.data[0]["id"]

                problem_tech_ids = [tech_ids[name] for name in problem_technologies if name in tech_ids]
                if problem_tech_ids:
                    supabase.table("problem_tech").insert(
                        [{"problem_id": problem_id, "technology_id": tid} for tid in problem_tech_ids]
                    ).execute()

        realtime.publish(channel, "problems.ready", {"project_id": project_id, "count": len(problemas)})
    except Exception as exc:
        logger.exception("Problem generation failed completely for project %s: %s", project_id, exc)
        realtime.publish(channel, "problems.failed", {"project_id": project_id, "reason": "internal_error"})


@router.post("/{project_id}/generate-problems", status_code=status.HTTP_202_ACCEPTED)
def generate_problems(
    project_id: str,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    project = _get_project_or_404(project_id)
    require_org_member(user.id, project["org_id"])

    background_tasks.add_task(_generate_problems_task, project_id)
    return {"status": "generating"}

