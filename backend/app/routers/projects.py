from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.project import ProjectInviteOut, ProjectJoinIn, ProjectMemberOut

router = APIRouter(prefix="/projects", tags=["projects"])

# Fase 2: POST /projects, POST /projects/{id}/generate-problems.


def _get_project_or_404(project_id: str) -> dict:
    supabase = get_supabase()
    result = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return result.data[0]


def _is_org_member(user_id: str, org_id: str) -> bool:
    supabase = get_supabase()
    result = (
        supabase.table("memberships")
        .select("id")
        .eq("org_id", org_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


@router.post("/{project_id}/invite", response_model=ProjectInviteOut)
def get_invite_link(project_id: str, user: CurrentUser = Depends(get_current_user)) -> ProjectInviteOut:
    project = _get_project_or_404(project_id)

    if not _is_org_member(user.id, project["org_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this project's organization")

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

    is_external = not _is_org_member(user.id, project["org_id"])

    result = (
        supabase.table("project_members")
        .insert({"project_id": project_id, "user_id": user.id, "is_external": is_external})
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not join project")

    return ProjectMemberOut(**result.data[0])
