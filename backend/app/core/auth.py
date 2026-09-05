from fastapi import Header, HTTPException, status

from app.db.supabase import get_supabase


class CurrentUser:
    def __init__(self, id: str, email: str | None):
        self.id = id
        self.email = email


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    """Valida el JWT de Supabase Auth enviado por el frontend (`Authorization: Bearer <token>`)."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        response = get_supabase().auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if response is None or response.user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return CurrentUser(id=response.user.id, email=response.user.email)
