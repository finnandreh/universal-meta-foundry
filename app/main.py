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


def load_template_archive_index(workspace_root: Path) -> dict[str, object]:
    index_path = workspace_root / "shared" / "templates" / "template_archive_index.json"
    if not index_path.exists():
        return {
            "exists": False,
            "path": "shared/templates/template_archive_index.json",
            "mapped_project_paths": [],
            "mapping_count": 0,
        }

    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except Exception:
        return {
            "exists": True,
            "path": "shared/templates/template_archive_index.json",
            "parse_error": True,
            "mapped_project_paths": [],
            "mapping_count": 0,
        }

    usage = payload.get("project_template_usage") if isinstance(payload, dict) else None
    mapped_project_paths: list[str] = []
    if isinstance(usage, list):
        for row in usage:
            if not isinstance(row, dict):
                continue
            project_path = row.get("project_path")
            if isinstance(project_path, str) and project_path.strip():
                mapped_project_paths.append(project_path.strip().replace("\\", "/"))

    mapped_project_paths = sorted(set(mapped_project_paths))
    return {
        "exists": True,
        "path": "shared/templates/template_archive_index.json",
        "mapped_project_paths": mapped_project_paths,
        "mapping_count": len(mapped_project_paths),
    }


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
        projects = scan_real_projects(workspace_root)
        template_index = load_template_archive_index(workspace_root)

        mapped_set = set(template_index.get("mapped_project_paths", []))
        validated_projects: list[dict[str, object]] = []
        for row in projects:
            client = str(row.get("client", ""))
            project = str(row.get("project", ""))
            project_path = f"clients/{client}/systems/{project}"
            validated_row = dict(row)
            validated_row["project_path"] = project_path
            validated_row["template_index_mapped"] = project_path in mapped_set
            validated_projects.append(validated_row)

        return {
            "projects": validated_projects,
            "template_archive_index": template_index,
        }

    return app


app = create_app()
