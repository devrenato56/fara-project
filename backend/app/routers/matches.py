from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.agents import versus
from app.agents.evaluator import PASS_THRESHOLD, evaluar_submission
from app.core.access import get_project_of_problem, require_project_access
from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import get_supabase
from app.schemas.match import MatchCreate, MatchOut, MatchResultOut, MatchSubmissionCreate
from app.services import realtime
from app.services.llm import LLMUnavailableError
from app.services.piston import PistonExecutionError, run_code

router = APIRouter(prefix="/matches", tags=["matches"])

OPEN_STATUSES = ("created", "waiting_opponent", "in_progress", "reviewing")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_match_or_404(match_id: str) -> dict:
    result = get_supabase().table("matches").select("*").eq("id", match_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return result.data[0]


def _get_problem_or_404(problem_id: str) -> dict:
    result = get_supabase().table("problems").select("*").eq("id", problem_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")
    return result.data[0]


def _require_participant(match: dict, user_id: str) -> None:
    if user_id not in (match["challenger_id"], match.get("opponent_user_id")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant of this match")


def _opponent_id(match: dict, user_id: str) -> str | None:
    if match["opponent_type"] == "ai":
        return None
    return match["opponent_user_id"] if user_id == match["challenger_id"] else match["challenger_id"]


def _match_submissions(match_id: str) -> list[dict]:
    return (
        get_supabase()
        .table("submissions")
        .select("*")
        .eq("match_id", match_id)
        .order("created_at")
        .execute()
        .data
    )


def _elapsed_sec(match: dict) -> float:
    if not match.get("started_at"):
        return 0.0
    started = datetime.fromisoformat(match["started_at"])
    return (datetime.now(timezone.utc) - started).total_seconds()


@router.post("", response_model=MatchOut, status_code=status.HTTP_201_CREATED)
async def create_match(body: MatchCreate, user: CurrentUser = Depends(get_current_user)) -> MatchOut:
    problem = _get_problem_or_404(body.problem_id)
    project = get_project_of_problem(body.problem_id)
    require_project_access(user.id, project)

    supabase = get_supabase()
    row: dict = {
        "problem_id": body.problem_id,
        "challenger_id": user.id,
        "opponent_type": body.opponent_type,
    }

    if body.opponent_type == "ai":
        # ADR-07: el guion se genera completo una sola vez, antes del timer.
        guion = await versus.generar_solucion_progresiva(problem, body.level, body.technology)
        row.update(
            {
                "status": "in_progress",
                "started_at": _now(),
                "ai_reveal_script": guion["steps"],
                "ai_completion_time_sec": guion["completion_time_sec"],
            }
        )
    else:
        row["status"] = "waiting_opponent"

    result = supabase.table("matches").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create match")
    match = result.data[0]

    if body.opponent_type == "ai":
        realtime.publish(f"match:{match['id']}", "match.started", {"match_id": match["id"]})
    else:
        # La sala queda anunciada en el canal del proyecto, para quien tenga el enlace.
        realtime.publish(
            f"project:{project['id']}",
            "match.created",
            {
                "match_id": match["id"],
                "problem_id": body.problem_id,
                "challenger_id": user.id,
            },
        )

    return MatchOut(**match)


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: str, user: CurrentUser = Depends(get_current_user)) -> MatchOut:
    match = _get_match_or_404(match_id)
    # Una sala abierta es visible para cualquiera con acceso al proyecto (es
    # justamente a quien se le esta ofreciendo el duelo).
    if match["status"] == "waiting_opponent":
        require_project_access(user.id, get_project_of_problem(match["problem_id"]))
    else:
        _require_participant(match, user.id)
    return MatchOut(**match)


@router.post("/{match_id}/join", response_model=MatchOut)
def join_match(match_id: str, user: CurrentUser = Depends(get_current_user)) -> MatchOut:
    match = _get_match_or_404(match_id)

    if match["opponent_type"] != "human":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This match has no human slot")
    if match["status"] != "waiting_opponent":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match is not waiting for an opponent")
    if match["challenger_id"] == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot join your own match")

    require_project_access(user.id, get_project_of_problem(match["problem_id"]))

    updated = (
        get_supabase()
        .table("matches")
        .update({"opponent_user_id": user.id, "status": "in_progress", "started_at": _now()})
        .eq("id", match_id)
        .execute()
    )
    match = updated.data[0]

    realtime.publish(
        f"match:{match_id}",
        "match.started",
        {"match_id": match_id, "opponent_user_id": user.id, "started_at": match["started_at"]},
    )
    return MatchOut(**match)


def _finish(match_id: str, winner_id: str | None, results: dict) -> None:
    get_supabase().table("matches").update(
        {"status": "finished", "winner_id": winner_id}
    ).eq("id", match_id).execute()

    realtime.publish(
        f"match:{match_id}",
        "match.finished",
        {"match_id": match_id, "winner_id": winner_id, "results": results},
    )


@router.post("/{match_id}/submissions", response_model=MatchResultOut)
async def submit_to_match(
    match_id: str, body: MatchSubmissionCreate, user: CurrentUser = Depends(get_current_user)
) -> MatchResultOut:
    match = _get_match_or_404(match_id)
    _require_participant(match, user.id)

    if match["status"] not in OPEN_STATUSES:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match is already closed")

    supabase = get_supabase()
    existing = [s for s in _match_submissions(match_id) if s["user_id"] == user.id]
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already submitted for this match")

    elapsed = _elapsed_sec(match)
    problem = _get_problem_or_404(match["problem_id"])

    try:
        ejecucion = await run_code(body.language, body.version, body.code)
    except PistonExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    try:
        evaluacion = await evaluar_submission(problem, body.code, ejecucion)
    except LLMUnavailableError as exc:
        # El envio no se pierde: el duelo sigue abierto y se puede reintentar.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="El evaluador no está disponible en este momento. Reintenta el envío.",
        ) from exc

    passed = evaluacion["score"] >= PASS_THRESHOLD

    supabase.table("submissions").insert(
        {
            "problem_id": match["problem_id"],
            "user_id": user.id,
            "match_id": match_id,
            "code": body.code,
            "score": evaluacion["score"],
            "feedback": evaluacion["feedback"],
            "status": "passed" if passed else "failed",
        }
    ).execute()

    if match["opponent_type"] == "ai":
        # Gana el usuario si aprueba ANTES del tiempo que la IA "tarda".
        won = passed and elapsed < (match["ai_completion_time_sec"] or 0)
        winner_id = user.id if won else None
        _finish(match_id, winner_id, {user.id: evaluacion})
        return MatchResultOut(
            match_status="finished",
            outcome="won" if won else "lost",
            score=evaluacion["score"],
            feedback=evaluacion["feedback"],
            winner_id=winner_id,
        )

    # vs Humano: cada envio se evalua al llegar; el match cierra con el segundo.
    others = [s for s in _match_submissions(match_id) if s["user_id"] != user.id]
    if not others:
        supabase.table("matches").update({"status": "reviewing"}).eq("id", match_id).execute()
        realtime.publish(
            f"match:{match_id}", "match.submission_received", {"match_id": match_id, "user_id": user.id}
        )
        return MatchResultOut(
            match_status="reviewing",
            outcome="pending",
            score=evaluacion["score"],
            feedback=evaluacion["feedback"],
        )

    rival = others[0]
    # Empate en score: gana quien envio primero (el rival ya estaba adentro).
    winner_id = user.id if evaluacion["score"] > (rival["score"] or 0) else rival["user_id"]
    _finish(
        match_id,
        winner_id,
        {
            user.id: evaluacion,
            rival["user_id"]: {"score": rival["score"], "feedback": rival["feedback"]},
        },
    )
    return MatchResultOut(
        match_status="finished",
        outcome="won" if winner_id == user.id else "lost",
        score=evaluacion["score"],
        feedback=evaluacion["feedback"],
        opponent_score=rival["score"],
        opponent_feedback=rival["feedback"],
        winner_id=winner_id,
    )


@router.post("/{match_id}/finish", response_model=MatchResultOut)
def finish_match(match_id: str, user: CurrentUser = Depends(get_current_user)) -> MatchResultOut:
    """Cierra el match cuando el timer llega a 0 (lo dispara el cliente, que ya
    corre la cuenta regresiva). Idempotente."""
    match = _get_match_or_404(match_id)
    _require_participant(match, user.id)

    submissions = _match_submissions(match_id)
    mine = next((s for s in submissions if s["user_id"] == user.id), None)
    rival = next((s for s in submissions if s["user_id"] != user.id), None)

    if match["status"] != "finished":
        if match["opponent_type"] == "ai":
            # Si el usuario no envio a tiempo, la IA "llego" primero.
            winner_id = match["challenger_id"] if mine and mine["status"] == "passed" else None
        else:
            # Gana quien haya enviado; si nadie envio, no hay ganador.
            winner_id = None
            if mine and not rival:
                winner_id = user.id
            elif rival and not mine:
                winner_id = rival["user_id"]
            elif mine and rival:
                winner_id = mine["user_id"] if (mine["score"] or 0) >= (rival["score"] or 0) else rival["user_id"]

        results = {s["user_id"]: {"score": s["score"], "feedback": s["feedback"]} for s in submissions}
        _finish(match_id, winner_id, results)
        match["winner_id"] = winner_id

    return MatchResultOut(
        match_status="finished",
        outcome="won" if match["winner_id"] == user.id else "lost",
        score=(mine["score"] if mine else 0) or 0,
        feedback=(mine["feedback"] if mine else "No enviaste una solución antes de que se acabara el tiempo."),
        opponent_score=rival["score"] if rival else None,
        opponent_feedback=rival["feedback"] if rival else None,
        winner_id=match["winner_id"],
    )


@router.post("/{match_id}/abandon", response_model=MatchOut)
def abandon_match(match_id: str, user: CurrentUser = Depends(get_current_user)) -> MatchOut:
    """El jugador deja el duelo (desconexion sostenida o salida explicita):
    el rival gana por abandono."""
    match = _get_match_or_404(match_id)
    _require_participant(match, user.id)

    if match["status"] not in OPEN_STATUSES:
        return MatchOut(**match)

    winner_id = _opponent_id(match, user.id)
    updated = (
        get_supabase()
        .table("matches")
        .update({"status": "abandoned", "winner_id": winner_id})
        .eq("id", match_id)
        .execute()
    )

    realtime.publish(
        f"match:{match_id}",
        "match.abandoned",
        {"match_id": match_id, "abandoned_by": user.id, "winner_id": winner_id},
    )
    return MatchOut(**updated.data[0])
