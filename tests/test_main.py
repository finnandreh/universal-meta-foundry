from fastapi.testclient import TestClient

from app.main import app


def test_root_serves_frontend_prototype() -> None:
    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Universal Meta-Foundry" in response.text
    assert "View Mode" in response.text
    assert "User View" in response.text
    assert "Technical View" in response.text
    assert "Soul Brain" in response.text
    assert "Soul Profile" in response.text
    assert "Recommendation Mode" in response.text
    assert "Learning Budget: Max Suggestions Per Cycle" in response.text
    assert "Principles Anchor" in response.text
    assert "Inheritance Source" in response.text
    assert "Enabled Capabilities" in response.text
    assert "Disabled Capabilities" in response.text
    assert "Evolution Inbox" in response.text
    assert "Domain Draft" in response.text
    assert "Setup Catalog" in response.text
    assert "Apply Client Catalog" in response.text
    assert "Apply Project Catalog" in response.text
    assert "Apply Sub-Part Catalog" in response.text
    assert "Apply Task State Catalog" in response.text
    assert "Apply Task Template Catalog" in response.text
    assert "Task Board" in response.text
    assert "Project Status Explorer" in response.text
    assert "Refresh Status View" in response.text
    assert "Copilot Update Project Status" in response.text
    assert "Technical JSON view" in response.text
    assert "Project Bundle Manager" in response.text
    assert "Export Project Bundle" in response.text
    assert "Import Project Bundle" in response.text
    assert "Prompt Structure Preview" in response.text
    assert "Project Name" in response.text
    assert "Sub-Part Name" in response.text
    assert "Add Task" in response.text
    assert "Task Template to Add" in response.text
    assert "Export JSON" in response.text
    assert "Import JSON" in response.text
    assert "Generated Prompt Packet Preview" in response.text
    assert "Copilot Handoff" in response.text
    assert "Ready for Copilot Handoff" in response.text
    assert "prompt packet is complete before execution" in response.text
    assert "Prototype Template" in response.text
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
