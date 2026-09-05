from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
from pydantic import BaseModel
from typing import List

from app.core.auth import CurrentUser, get_current_user
from app.services.github import _headers

router = APIRouter(prefix="/github", tags=["github"])

class GitHubRepo(BaseModel):
    id: int
    full_name: str
    description: str | None = None
    stargazers_count: int
    language: str | None = None

@router.get("/my-repos", response_model=List[GitHubRepo])
async def get_my_repositories(
    username: str = Query(..., min_length=1),
    user: CurrentUser = Depends(get_current_user)
) -> List[GitHubRepo]:
    """Fetch public GitHub repositories for a given username."""
    async with httpx.AsyncClient(timeout=10.0, headers=_headers()) as client:
        try:
            resp = await client.get(
                f"https://api.github.com/users/{username}/repos",
                params={"sort": "updated", "per_page": 30}
            )
            resp.raise_for_status()
            items = resp.json()
            
            repos = []
            for item in items:
                repos.append(
                    GitHubRepo(
                        id=item["id"],
                        full_name=item["full_name"],
                        description=item["description"],
                        stargazers_count=item["stargazers_count"],
                        language=item["language"]
                    )
                )
            return repos
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Error fetching GitHub repositories: {exc}"
            )
