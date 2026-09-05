from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.problem import ProblemOut

router = APIRouter(prefix="/problems", tags=["problems"])


def _problem_to_out(problem: dict) -> ProblemOut:
    technologies = [pt["technologies"]["name"] for pt in problem.get("problem_tech", []) if pt.get("technologies")]
    return ProblemOut(**{**problem, "technologies": technologies})


@router.get("/{problem_id}", response_model=ProblemOut)
def get_problem(problem_id: str, user: CurrentUser = Depends(get_current_user)) -> ProblemOut:
    supabase = get_supabase()
    result = (
        supabase.table("problems")
        .select("*, problem_tech(technologies(name))")
        .eq("id", problem_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    return _problem_to_out(result.data[0])
