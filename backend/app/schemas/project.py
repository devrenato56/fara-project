from pydantic import BaseModel


class ProjectInviteOut(BaseModel):
    invite_token: str


class ProjectJoinIn(BaseModel):
    invite_token: str


class ProjectMemberOut(BaseModel):
    id: str
    project_id: str
    user_id: str
    is_external: bool
