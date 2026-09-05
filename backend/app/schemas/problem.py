from pydantic import BaseModel


class ProblemOut(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    source_snippet: str | None
    source_url: str | None
    difficulty: str
    transferable_concepts: list[str]
    new_concepts: list[str]
    status: str
    technologies: list[str] = []
