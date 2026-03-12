# Kitchen Inventory (Generated System)

This is a generated system package under clients/test and is intentionally separate from Foundry core files.

## Boundary Rule

Do not modify Foundry core files while implementing this system.

Protected files:

- web/app.js
- soul.identity.json
- universal_meta_foundry_v3.md

Allowed edit scope:

- clients/test/systems/kitchen-inventory/**

## Included

- system.identity.json - system identity and scope
- starter_inventory.json - baseline kitchen inventory seed data
- tasks.json - starter execution tasks
- kitchen_app.py - FastAPI app with inventory endpoints and static UI hosting
- web/index.html - kitchen inventory frontend
- web/app.js - frontend behavior (add item, low-stock filter, consume action)
- web/styles.css - frontend styling
- test_kitchen_app.py - API regression tests

## Implemented Features

- Add item form and inventory list UI
- Low-stock filter (low/out) in both API and UI
- Quick consume action (decrement quantity by 1)
- Health endpoint and summary endpoint

## Run

1. Start server from workspace root:
	C:/universal-meta-foundry/.venv/Scripts/python.exe -m uvicorn kitchen_app:app --app-dir clients/test/systems/kitchen-inventory --host 127.0.0.1 --port 8010
2. Open http://127.0.0.1:8010

## Test

1. Run only this generated system's tests:
	C:/universal-meta-foundry/.venv/Scripts/python.exe -m pytest -q clients/test/systems/kitchen-inventory/test_kitchen_app.py