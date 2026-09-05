from fastapi import Depends, Header, HTTPException, status
from supabase import Client

from app.db.supabase import get_supabase


class CurrentUser:
    def __init__(self, id: str, email: str | None = None):
        self.id = id
        self.email = email


def get_current_user_id(
    authorization: str | None = Header(default=None),
    supabase: Client = Depends(get_supabase),
) -> str:
    """Extrae el user_id a partir del JWT de Supabase enviado en el header
    `Authorization: Bearer <token>`. El frontend obtiene ese token de
    `supabase.auth.getSession()` (ver lib/supabase-client.ts).
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el header Authorization con el token de Supabase",
        )

    token = authorization.split(" ", 1)[1].strip()

    try:
        auth_response = supabase.auth.get_user(token)
    except Exception as exc:  # credenciales invalidas, token expirado, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
        ) from exc

    if auth_response is None or auth_response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
        )

    return auth_response.user.id


def get_current_user(
    authorization: str | None = Header(default=None),
    supabase: Client = Depends(get_supabase),
) -> CurrentUser:
    user_id = get_current_user_id(authorization, supabase)
    return CurrentUser(id=user_id, email=None)

