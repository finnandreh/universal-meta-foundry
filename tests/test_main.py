from fastapi.testclient import TestClient

from app.main import app


def test_root_serves_frontend_prototype() -> None:
    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Universal Meta-Foundry" in response.text
    assert "Domain Draft" in response.text
    assert "Task Board" in response.text
    assert "Add Task" in response.text
    assert "Export JSON" in response.text
    assert "Import JSON" in response.text
    assert "Schema v2" in response.text
    assert "v1 import supported" in response.text
    assert "schemaInfoBtn" in response.text
    assert "Schema compatibility:" in response.text
    assert "Reset Draft" in response.text


def test_health_endpoint_returns_ok() -> None:
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
