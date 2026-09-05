from datetime import datetime

from pydantic import BaseModel


class SubmissionCreate(BaseModel):
    code: str
    language: str
    version: str


class SubmissionOut(BaseModel):
    id: str
    problem_id: str
    user_id: str
    score: int | None
    feedback: str | None
    status: str
    created_at: datetime
