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

        codigo_por_archivo: dict[str, str] = {}
        for repo in repos:
            try:
                codigo_por_archivo.update(await fetch_repo_code(repo["repo_full_name"]))
            except GitHubFetchError as exc:
                logger.warning("Skipping repo %s: %s", repo["repo_full_name"], exc)

        if not codigo_por_archivo or not tecnologias:
            realtime.publish(channel, "problems.failed", {"project_id": project_id, "reason": "no_source_material"})
            return

        fragmentos = await matcher.analizar_repo(codigo_por_archivo, tecnologias)
        problemas = await generator.generar_ejercicios(fragmentos, tecnologias)

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
                            f"https://github.com/{source_path}" if source_path else None
                        ),
                        "difficulty": problema.get("difficulty", "medium"),
                        "transferable_concepts": problema.get("transferable_concepts", []),
                        "new_concepts": problema.get("new_concepts", []),
                        "status": "proposed",
                    }
                )
                .execute()
            )
            problem_id = inserted.data[0]["id"]

            problem_tech_ids = [tech_ids[name] for name in problem_technologies if name in tech_ids]
            if problem_tech_ids:
                supabase.table("problem_tech").insert(
                    [{"problem_id": problem_id, "technology_id": tid} for tid in problem_tech_ids]
                ).execute()

        realtime.publish(channel, "problems.ready", {"project_id": project_id, "count": len(problemas)})
    except Exception:
        logger.exception("Problem generation failed for project %s", project_id)
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
