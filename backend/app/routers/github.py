import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
from pydantic import BaseModel
from typing import List, Optional

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.services.github import _headers

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/github", tags=["github"])


class GitHubRepo(BaseModel):
    id: int
    full_name: str
    description: str | None = None
    stargazers_count: int
    language: str | None = None


async def _fetch_github_repos(username: str) -> List[GitHubRepo]:
    """Fetch public GitHub repositories for a given username."""
    async with httpx.AsyncClient(timeout=15.0, headers=_headers()) as client:
        resp = await client.get(
            f"https://api.github.com/users/{username}/repos",
            params={"sort": "updated", "per_page": 30, "type": "owner"},
        )
        if resp.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GitHub user '{username}' not found",
            )
        if resp.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="GitHub API rate limit exceeded. Try again later or configure a GITHUB_TOKEN.",
            )
        resp.raise_for_status()
        items = resp.json()

        return [
            GitHubRepo(
                id=item["id"],
                full_name=item["full_name"],
                description=item.get("description"),
                stargazers_count=item.get("stargazers_count", 0),
                language=item.get("language"),
            )
            for item in items
            if not item.get("fork", False)
        ]


def _extract_github_username(user_id: str) -> Optional[str]:
    """Extract the actual GitHub username from Supabase auth identity data."""
    sb = get_supabase()
    try:
        result = sb.table("users").select("username").eq("id", user_id).single().execute()
        db_username = result.data.get("username") if result.data else None
    except Exception:
        db_username = None

    # Also try reading from auth.users via admin API to get the identity provider data
    try:
        auth_response = sb.auth.admin.get_user_by_id(user_id)
        if auth_response and auth_response.user:
            user_meta = auth_response.user.user_metadata or {}

            # GitHub OAuth stores the handle in 'user_name'
            gh_username = user_meta.get("user_name")
            if gh_username:
                logger.info("Found GitHub username '%s' from auth identity for user %s", gh_username, user_id)
                return gh_username

            # Check identities array for a GitHub identity
            identities = auth_response.user.identities or []
            for identity in identities:
                if identity.provider == "github":
                    identity_data = identity.identity_data or {}
                    gh_username = identity_data.get("user_name") or identity_data.get("preferred_username")
                    if gh_username:
                        logger.info("Found GitHub username '%s' from identity data for user %s", gh_username, user_id)
                        return gh_username
    except Exception as exc:
        logger.warning("Could not read auth identity for user %s: %s", user_id, exc)

    # Fall back to the public.users username (might be the email prefix or display name)
    return db_username


@router.get("/my-repos", response_model=List[GitHubRepo])
async def get_my_repositories(
    username: Optional[str] = Query(None, min_length=1),
    user: CurrentUser = Depends(get_current_user),
) -> List[GitHubRepo]:
    """Fetch public GitHub repositories for the current user.

    Tries to resolve the GitHub username from:
    1. The explicit `username` query param (if provided)
    2. The GitHub identity stored in Supabase Auth
    3. The public.users.username field (fallback)
    """
    gh_username = username
    if not gh_username:
        gh_username = _extract_github_username(user.id)

    if not gh_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not determine your GitHub username. Please provide it explicitly.",
        )

    logger.info("Fetching repos for GitHub user: %s (auth user: %s)", gh_username, user.id)

    try:
        return await _fetch_github_repos(gh_username)
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        logger.error("Error fetching GitHub repos for '%s': %s", gh_username, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error fetching GitHub repositories: {exc}",
        )


@router.get("/search-repos", response_model=List[GitHubRepo])
async def search_repos(
    username: str = Query(..., min_length=1),
    user: CurrentUser = Depends(get_current_user),
) -> List[GitHubRepo]:
    """Search public GitHub repositories for any username."""
    try:
        return await _fetch_github_repos(username)
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        logger.error("Error searching GitHub repos for '%s': %s", username, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error fetching GitHub repositories: {exc}",
        )
