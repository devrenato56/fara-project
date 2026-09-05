from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, matches, organizations, problems, projects, submissions

settings = get_settings()

app = FastAPI(title="FARA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(projects.router)
app.include_router(problems.router)
app.include_router(submissions.router)
app.include_router(matches.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
