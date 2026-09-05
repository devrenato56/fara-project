import base64

import httpx

from app.core.config import get_settings

ALLOWED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".java", ".rb", ".rs",
    ".c", ".cpp", ".cs", ".php", ".kt", ".swift",
}
IGNORED_PATH_PARTS = {
    "node_modules", "dist", "build", ".git", "vendor", "venv",
    ".venv", "__pycache__", "target",
}
MAX_FILES = 15
MAX_BYTES_PER_FILE = 20_000


class GitHubFetchError(Exception):
    pass


def _headers() -> dict:
    token = get_settings().github_token
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _is_relevant(path: str) -> bool:
    if any(part in path.split("/") for part in IGNORED_PATH_PARTS):
        return False
    return any(path.endswith(ext) for ext in ALLOWED_EXTENSIONS)


async def fetch_repo_code(full_name: str) -> dict[str, str]:
    """Trae hasta MAX_FILES archivos relevantes de un repo publico de GitHub."""
    async with httpx.AsyncClient(timeout=20.0, headers=_headers()) as client:
        try:
            repo_resp = await client.get(f"https://api.github.com/repos/{full_name}")
            repo_resp.raise_for_status()
            default_branch = repo_resp.json()["default_branch"]

            tree_resp = await client.get(
                f"https://api.github.com/repos/{full_name}/git/trees/{default_branch}",
                params={"recursive": "1"},
            )
            tree_resp.raise_for_status()
            tree = tree_resp.json().get("tree", [])
        except httpx.HTTPError as exc:
            raise GitHubFetchError(f"Could not read repo {full_name}: {exc}") from exc

        candidate_paths = [
            item["path"] for item in tree if item.get("type") == "blob" and _is_relevant(item["path"])
        ][:MAX_FILES]

        files: dict[str, str] = {}
        for path in candidate_paths:
            try:
                content_resp = await client.get(
                    f"https://api.github.com/repos/{full_name}/contents/{path}",
                    params={"ref": default_branch},
                )
                content_resp.raise_for_status()
                data = content_resp.json()
                if data.get("encoding") != "base64":
                    continue
                content = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
                files[f"{full_name}/{path}"] = content[:MAX_BYTES_PER_FILE]
            except httpx.HTTPError:
                continue

        return files
