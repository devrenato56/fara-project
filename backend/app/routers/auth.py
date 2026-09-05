from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

# Fase 1: el login social (Google/GitHub) lo maneja Supabase Auth desde el
# frontend. Este router queda para endpoints propios si hicieran falta
# (p.ej. completar el perfil de un usuario recien creado).
