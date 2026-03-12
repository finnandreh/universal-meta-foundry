from pathlib import Path
import json

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


def scan_real_projects(workspace_root: Path) -> list[dict[str, object]]:
    clients_dir = workspace_root / "clients"
    rows: list[dict[str, object]] = []

    if not clients_dir.exists():
        return rows

    for client_dir in sorted([p for p in clients_dir.iterdir() if p.is_dir()]):
        systems_root = client_dir / "systems"
        if not systems_root.exists() or not systems_root.is_dir():
            continue

        for project_dir in sorted([p for p in systems_root.iterdir() if p.is_dir()]):
            state_path = project_dir / "project.state.json"
            systems: list[str] = []

            if state_path.exists():
                try:
                    payload = json.loads(state_path.read_text(encoding="utf-8"))
                    source = payload.get("systems") if isinstance(payload, dict) else None
                    if isinstance(source, dict):
                        systems = sorted([str(key) for key in source.keys()])
                except Exception:
                    systems = []

            rows.append(
                {
                    "client": client_dir.name,
                    "project": project_dir.name,
                    "systems": systems,
                    "has_project_state": state_path.exists(),
                }
            )

    return rows


def create_app() -> FastAPI:
    app = FastAPI(title="Universal Meta Foundry Sanity API")
    workspace_root = Path(__file__).resolve().parent.parent
    web_dir = workspace_root / "web"

    app.mount("/web", StaticFiles(directory=web_dir), name="web")

    @app.get("/")
    def home() -> FileResponse:
        return FileResponse(web_dir / "index.html")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/projects/list")
    def list_projects() -> dict[str, object]:
        return {
            "projects": scan_real_projects(workspace_root)
        }

    return app


app = create_app()
