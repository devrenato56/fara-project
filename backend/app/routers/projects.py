from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["projects"])

# Fase 1/2: POST /projects, POST /projects/{id}/invite, POST /projects/{id}/join,
# POST /projects/{id}/generate-problems.
