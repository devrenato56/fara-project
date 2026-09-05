from datetime import datetime

from pydantic import BaseModel

from app.schemas.problem import ProblemOut


class ProjectInviteOut(BaseModel):
    invite_token: str


class ProjectJoinIn(BaseModel):
    invite_token: str


class ProjectMemberOut(BaseModel):
    id: str
    project_id: str
    user_id: str
    is_external: bool


class ProjectCreate(BaseModel):
    org_id: str
    name: str
    description: str | None = None
    repos: list[str] = []  # "owner/repo"
    technologies: list[str] = []  # nombres, p.ej. ["Go", "Docker"]


class ProjectOut(BaseModel):
    id: str
    org_id: str
    name: str
    description: str | None
    invite_token: str
    created_at: datetime
    repos: list[str]
    technologies: list[str]
    problems_count: int = 0
    completed_count: int = 0
    progress_percent: int = 0


class ProjectDetailOut(ProjectOut):
    problems: list[ProblemOut]
