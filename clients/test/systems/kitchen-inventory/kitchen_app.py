import json
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
STARTER_DATA_FILE = BASE_DIR / "starter_inventory.json"
WEB_DIR = BASE_DIR / "web"


class InventoryItem(BaseModel):
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    quantity: int = Field(ge=0)
    unit: str = Field(min_length=1)
    status: Literal["ok", "low", "out"] = "ok"


class ItemCreate(BaseModel):
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    quantity: int = Field(ge=0)
    unit: str = Field(min_length=1)


class ItemUpdate(BaseModel):
    quantity: int | None = Field(default=None, ge=0)
    status: Literal["ok", "low", "out"] | None = None


class InventoryStore:
    def __init__(self, starter_file: Path) -> None:
        payload = json.loads(starter_file.read_text(encoding="utf-8"))
        self.low_stock_threshold = int(payload.get("low_stock_threshold", 2))
        self.items = [InventoryItem(**item) for item in payload.get("items", [])]

    def _derive_status(self, quantity: int) -> Literal["ok", "low", "out"]:
        if quantity == 0:
            return "out"
        if quantity <= self.low_stock_threshold:
            return "low"
        return "ok"

    def list_items(
        self,
        status: Literal["ok", "low", "out"] | None = None,
        low_only: bool = False,
    ) -> list[InventoryItem]:
        rows = self.items
        if low_only:
            rows = [item for item in rows if item.status in {"low", "out"}]
        if status is not None:
            rows = [item for item in rows if item.status == status]
        return rows

    def create_item(self, payload: ItemCreate) -> InventoryItem:
        normalized_name = payload.name.strip().lower()
        if any(item.name.strip().lower() == normalized_name for item in self.items):
            raise ValueError("Item already exists")

        item = InventoryItem(
            name=payload.name.strip(),
            category=payload.category.strip(),
            quantity=payload.quantity,
            unit=payload.unit.strip(),
            status=self._derive_status(payload.quantity),
        )
        self.items.append(item)
        return item

    def update_item(self, item_name: str, payload: ItemUpdate) -> InventoryItem:
        target = None
        for item in self.items:
            if item.name.strip().lower() == item_name.strip().lower():
                target = item
                break

        if target is None:
            raise KeyError("Item not found")

        if payload.quantity is not None:
            target.quantity = payload.quantity
            target.status = self._derive_status(payload.quantity)

        if payload.status is not None:
            target.status = payload.status

        return target


app = FastAPI(title="Kitchen Inventory", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = InventoryStore(STARTER_DATA_FILE)
app.mount("/web", StaticFiles(directory=str(WEB_DIR)), name="web")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


@app.get("/api/config")
def get_config() -> dict[str, object]:
    categories = sorted({item.category for item in store.items})
    return {
        "low_stock_threshold": store.low_stock_threshold,
        "categories": categories,
        "statuses": ["ok", "low", "out"],
    }


@app.get("/api/items")
def get_items(
    status: Literal["ok", "low", "out"] | None = Query(default=None),
    low_only: bool = Query(default=False),
) -> dict[str, object]:
    items = store.list_items(status=status, low_only=low_only)
    return {"total": len(items), "items": [item.model_dump() for item in items]}


@app.get("/api/summary")
def get_summary() -> dict[str, object]:
    rows = store.list_items()
    counts = {"ok": 0, "low": 0, "out": 0}
    for item in rows:
        counts[item.status] += 1
    return {"total": len(rows), "status_counts": counts}


@app.post("/api/items", status_code=201)
def create_item(payload: ItemCreate) -> dict[str, object]:
    try:
        item = store.create_item(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"item": item.model_dump()}


@app.patch("/api/items/{item_name}")
def patch_item(item_name: str, payload: ItemUpdate) -> dict[str, object]:
    try:
        item = store.update_item(item_name=item_name, payload=payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"item": item.model_dump()}
