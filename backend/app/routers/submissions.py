from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.evaluator import evaluar_submission
from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.submission import SubmissionCreate, SubmissionOut
from app.services.piston import PistonExecutionError, run_code

router = APIRouter(prefix="/problems", tags=["submissions"])

PASS_THRESHOLD = 70


@router.post("/{problem_id}/submissions", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def submit_solution(
    problem_id: str, body: SubmissionCreate, user: CurrentUser = Depends(get_current_user)
) -> SubmissionOut:
    supabase = get_supabase()

    problem_result = supabase.table("problems").select("*").eq("id", problem_id).execute()
    if not problem_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    problem = problem_result.data[0]

    try:
        resultado_ejecucion = await run_code(body.language, body.version, body.code)
    except PistonExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    evaluacion = await evaluar_submission(problem, body.code, resultado_ejecucion)
    submission_status = "passed" if evaluacion["score"] >= PASS_THRESHOLD else "failed"

    inserted = (
        supabase.table("submissions")
        .insert(
            {
                "problem_id": problem_id,
                "user_id": user.id,
                "code": body.code,
                "score": evaluacion["score"],
                "feedback": evaluacion["feedback"],
                "status": submission_status,
            }
        )
        .execute()
    )
    return SubmissionOut(**inserted.data[0])
