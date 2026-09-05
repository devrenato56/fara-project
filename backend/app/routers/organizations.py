from fastapi import APIRouter, Depends, HTTPException, status

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
