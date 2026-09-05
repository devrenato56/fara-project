from app.db.supabase import get_supabase


def publish(channel: str, event: str, payload: dict) -> None:
    """Publica un evento en un canal de Supabase Realtime (broadcast)."""
    supabase = get_supabase()
    supabase.channel(channel).send_broadcast(event, payload)
