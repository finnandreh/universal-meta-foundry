# copilot

Generated project for client `ron` under `clients/ron/systems/copilot`.

## Scope

- In scope: this project folder only
- Out of scope: Foundry core files

## Intake Summary

- Description: Design a reusable AI command protocol that converts natural language requests into strict structured command blocks parsed by another program and translated into Copilot-like actions.
- Protocol: `gui_prompt_sections.md#PGH-INTAKE-CODEGEN`

## Intake Clarification (Required)

Environment/toolchain and board-profile clarification is unresolved for this project family.

- Toolchain candidates: Python CLI processor, Node.js service, or embedded bridge runtime.
- Board profile: not applicable unless protocol is deployed on edge hardware.
- Resolution state: deferred to high-priority todo (`rcp-001`) with safe default = Python 3.12 local tooling.

Start-cycle resolution:

- `rcp-001` completed by selecting Python 3.12 local tooling as current execution environment.

## Meta Derivation (Derived Before Protocol)

- Meta Philosophy:
  - Prefer explicit, machine-parseable command intent over ambiguous natural language.
  - Enforce strict validation before execution to reduce unsafe automation.
  - Keep protocol evolvable with backward-compatible versioning.
- Meta Skill:
  - Convert intent into bounded fields (action, target, mode, payload, guards).
  - Separate parse, validate, and translate phases for observability.
  - Detect missing required fields early and emit structured errors.
- Meta Framework:
  - Intake -> Meta derivation -> Protocol definition -> Validator implementation -> Translation integration.
  - All incoming requests pass through parse -> validate -> normalize -> translate pipeline.
- Meta Scaffold:
  - `protocol/`: spec and schema
  - `tooling/`: executable validator/translator
  - project docs/tasks/state files for lifecycle tracking

## Protocol Definition Snapshot

Defined in `protocol/ai_command_protocol.md` and JSON schema in `protocol/command_block.schema.json`.

Core elements covered:

- protocol name
- grammar
- legal fields
- command types
- target types
- execution modes
- validation rules
- translation strategy

Start-cycle completion:

- Added protocol examples for natural-language-to-ACP conversion in `protocol/ai_command_protocol.md`.

## First Executable Step Implemented

- Implemented Python validator/translator utility:
  - `tooling/translate_protocol.py`
- Supports:
  - extracting protocol command blocks from text
  - strict field and enum validation
  - translation into copilot-like normalized action objects

## Protocol Mode Rule

After setup, operate in protocol mode:

- future natural language requests should be converted into protocol-valid command blocks before translation
- invalid requests should return structured validation errors

## Start-Cycle Reuse Evaluation

Template candidate decisions:

- `building_block`: ACP line-oriented header + required field grammar.
- `complex_pattern`: parse -> validate -> normalize -> translate pipeline in `tooling/translate_protocol.py`.
- `building_block`: fail-closed validation model for enum/JSON field enforcement.

Compatibility notes for future template promotion:

- Keep `ACP/1.0` header stable for existing integrations.
- Add new fields only as optional in minor versions.
- Preserve required field names for backward compatibility.
