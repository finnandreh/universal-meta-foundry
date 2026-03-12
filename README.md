# Universal Meta-Foundry

Universal Meta-Foundry is a prompt-governed system for creating new projects with a consistent architecture process, not just ad-hoc code generation.

Instead of jumping directly into implementation, this repository enforces a reusable flow:

1. Define intent and constraints at intake
2. Build a meta prompt foundation
3. Plan and execute todo items through start/stop lifecycle
4. Capture reusable patterns for future projects
5. Keep template compatibility across projects

## Purpose

The core purpose is to make project creation repeatable across many domains by applying the same meta layers every time:

- Meta Philosophy: principles and tradeoff rules
- Meta Skill: decomposition and analysis method
- Meta Framework: lifecycle and governance flow
- Meta Scaffold: concrete project structure and artifacts

This reduces drift, improves explainability, and makes reuse intentional.

## How It Works

The UI is a prompt generator that emits protocol text referencing hash sections in the prompt spec.

Primary flow:

- Intake: generate project meta prompt todo + first implementation step
- Specify: refine work using delta meta prompt todos for scaffolded projects
- State Start: execute meta prompt todo first, then remaining todos
- State Stop: update docs and convert unfinished work into restartable todos

Prompt spec source:

- gui_prompt_sections.md

## Governance Model

Project operations are guarded by template governance:

- Project-to-template mappings tracked in `shared/templates/template_archive_index.json`
- Reuse discoveries classified as `building_block` or `complex_pattern`
- Template upgrades require compatibility and migration notes

## Repository Layout

- app/: FastAPI backend serving UI and project listing API
- web/: Prompt generator UI
- clients/: Generated client projects
- shared/templates/: Template artifacts and template archive index
- universal_meta_foundry_v3.md: Foundry master/changelog document
- foundry_future_planner.md: Deferred Foundry improvements backlog

## Run Locally

Prerequisites:

- Python 3.12+

Install dependencies:

```bash
pip install -r requirements.txt
```

Start backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Open in browser:

- http://127.0.0.1:8001

Run tests:

```bash
python -m pytest -q
```

## Current State

This repository is actively evolving as a meta system builder. The key behavior is already in place:

- Intake/start/specify/stop prompt protocols
- Meta prompt foundation and delta workflow
- Template archive guard checks
- Project-scoped generation under `clients/<client>/systems/<project>`

## Contributing Notes

When adding or modifying behavior:

- Keep changes aligned with the prompt spec in gui_prompt_sections.md
- Keep docs updated (README/changelog/planner) with meaningful changes
- Preserve project scope boundaries and avoid unrelated core edits
