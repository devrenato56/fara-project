from app.db.supabase import get_supabase


def upsert_technologies(names: list[str]) -> dict[str, str]:
    """Devuelve {nombre: technology_id}, creando las que no existan."""
    supabase = get_supabase()
    name_to_id: dict[str, str] = {}

    for name in names:
        existing = supabase.table("technologies").select("id").eq("name", name).execute()
        if existing.data:
            name_to_id[name] = existing.data[0]["id"]
        else:
            inserted = supabase.table("technologies").insert({"name": name}).execute()
            name_to_id[name] = inserted.data[0]["id"]

    return name_to_id
