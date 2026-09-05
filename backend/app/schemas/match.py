from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class MatchCreate(BaseModel):
    problem_id: str
    opponent_type: Literal["ai", "human"]
    opponent_user_id: str | None = None
    technology: str = "Go"
    level: Literal["easy", "medium", "hard"] = "medium"


class MatchOut(BaseModel):
    id: str
    problem_id: str
    challenger_id: str
    opponent_type: str
    opponent_user_id: str | None
    status: str
    duration_sec: int
    started_at: datetime | None
    ai_completion_time_sec: int | None
    ai_reveal_script: dict | list | None
    winner_id: str | None


class MatchSubmissionCreate(BaseModel):
    code: str
    language: str
    version: str


class MatchResultOut(BaseModel):
    match_status: str
    outcome: Literal["won", "lost", "pending"]
    score: int
    feedback: str
    opponent_score: int | None = None
    opponent_feedback: str | None = None
    winner_id: str | None = None
