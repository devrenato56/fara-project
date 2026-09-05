from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.organization import OrganizationCreate, OrganizationOut

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(body: OrganizationCreate, user: CurrentUser = Depends(get_current_user)) -> OrganizationOut:
    supabase = get_supabase()

    org_result = (
        supabase.table("organizations")
        .insert({"name": body.name, "owner_id": user.id})
        .execute()
    )
    if not org_result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create organization")

    org = org_result.data[0]

    supabase.table("memberships").insert({"org_id": org["id"], "user_id": user.id}).execute()

    return OrganizationOut(**org)


@router.get("", response_model=list[OrganizationOut])
def list_organizations(user: CurrentUser = Depends(get_current_user)) -> list[OrganizationOut]:
    supabase = get_supabase()

    memberships = supabase.table("memberships").select("org_id").eq("user_id", user.id).execute()
    org_ids = [m["org_id"] for m in memberships.data]
    if not org_ids:
        return []

    orgs = supabase.table("organizations").select("*").in_("id", org_ids).execute()
    return [OrganizationOut(**org) for org in orgs.data]


class OrgMemberOut(BaseModel):
    user_id: str
    username: str
    avatar_url: str | None = None

@router.get("/{org_id}/members", response_model=list[OrgMemberOut])
def get_organization_members(org_id: str, user: CurrentUser = Depends(get_current_user)) -> list[OrgMemberOut]:
    supabase = get_supabase()
    
    # Check if user is a member
    from app.core.access import is_org_member
    if not is_org_member(user.id, org_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this organization")
        
    result = supabase.table("memberships").select("user_id, users(username, avatar_url)").eq("org_id", org_id).execute()
    members = []
    for row in result.data:
        if row["user_id"] != user.id:  # Exclude self
            u_data = row.get("users", {})
            if isinstance(u_data, list) and len(u_data) > 0:
                u_data = u_data[0]
            members.append(OrgMemberOut(
                user_id=row["user_id"],
                username=u_data.get("username", "Unknown") if u_data else "Unknown",
                avatar_url=u_data.get("avatar_url") if u_data else None
            ))
            
    return members
