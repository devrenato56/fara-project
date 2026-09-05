from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, matches, organizations, problems, projects, submissions

settings = get_settings()

app = FastAPI(title="FARA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Vercel genera un dominio distinto por cada preview/redeploy, asi que
    # ademas de la lista explicita se aceptan los dominios *.vercel.app y
    # localhost: evita que un redeploy con URL nueva rompa el frontend.
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
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
