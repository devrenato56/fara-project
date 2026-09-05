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

@router.get("/search", response_model=List[GitHubRepo])
async def search_repositories(
    q: str = Query(..., min_length=2),
    user: CurrentUser = Depends(get_current_user)
) -> List[GitHubRepo]:
    """Search for public GitHub repositories."""
    async with httpx.AsyncClient(timeout=10.0, headers=_headers()) as client:
        try:
            # Using the GitHub Search API
            # Note: We restrict to reasonable parameters, e.g., sort by stars
            resp = await client.get(
                "https://api.github.com/search/repositories",
                params={"q": q, "sort": "stars", "order": "desc", "per_page": 10}
            )
            resp.raise_for_status()
            data = resp.json()
            
            items = data.get("items", [])
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
                detail=f"Error searching GitHub repositories: {exc}"
            )
