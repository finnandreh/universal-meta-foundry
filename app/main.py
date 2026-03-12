from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


def create_app() -> FastAPI:
    app = FastAPI(title="Universal Meta Foundry Sanity API")
    web_dir = Path(__file__).resolve().parent.parent / "web"

    app.mount("/web", StaticFiles(directory=web_dir), name="web")

    @app.get("/")
    def home() -> FileResponse:
        return FileResponse(web_dir / "index.html")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
