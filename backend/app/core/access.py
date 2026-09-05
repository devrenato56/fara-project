from fastapi import HTTPException, status

from app.db.supabase import get_supabase


def is_org_member(user_id: str, org_id: str) -> bool:
    result = (
        get_supabase()
        .table("memberships")
        .select("id")
        .eq("org_id", org_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


def is_project_member(user_id: str, project_id: str) -> bool:
    result = (
        get_supabase()
        .table("project_members")
        .select("id")
        .eq("project_id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


def require_org_member(user_id: str, org_id: str) -> None:
    if not is_org_member(user_id, org_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this organization"
        )


def require_project_access(user_id: str, project: dict) -> None:
    """Acceso a un proyecto: miembro de su organizacion, o ProjectMember
    (que puede ser externo a la organizacion, via enlace de invitacion)."""
    if is_org_member(user_id, project["org_id"]) or is_project_member(user_id, project["id"]):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this project")


def get_project_of_problem(problem_id: str) -> dict:
    supabase = get_supabase()
    problem = supabase.table("problems").select("project_id").eq("id", problem_id).execute()
    if not problem.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    project = (
        supabase.table("projects").select("*").eq("id", problem.data[0]["project_id"]).execute()
    )
    if not project.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project.data[0]
