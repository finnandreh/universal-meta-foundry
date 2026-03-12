from __future__ import annotations

import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient

APP_FILE = Path(__file__).resolve().parent / "kitchen_app.py"


def load_app_module():
    spec = importlib.util.spec_from_file_location("kitchen_inventory_app", APP_FILE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load app module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_health_route() -> None:
    module = load_app_module()
    client = TestClient(module.app)

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_items_and_low_filter() -> None:
    module = load_app_module()
    client = TestClient(module.app)

    all_items = client.get("/api/items")
    assert all_items.status_code == 200
    assert all_items.json()["total"] >= 1

    low_items = client.get("/api/items", params={"low_only": True})
    assert low_items.status_code == 200
    for item in low_items.json()["items"]:
        assert item["status"] in {"low", "out"}


def test_create_and_update_item() -> None:
    module = load_app_module()
    client = TestClient(module.app)

    create_response = client.post(
        "/api/items",
        json={
            "name": "Test Yogurt",
            "category": "Fridge",
            "quantity": 1,
            "unit": "cup"
        },
    )
    assert create_response.status_code == 201

    update_response = client.patch("/api/items/Test Yogurt", json={"quantity": 0})
    assert update_response.status_code == 200
    assert update_response.json()["item"]["status"] == "out"
