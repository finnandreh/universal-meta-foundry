# AI Command Protocol (ACP)

## Protocol Name

- Name: `ACP` (AI Command Protocol)
- Version: `1.0`

## Grammar

Command blocks use a strict, line-oriented form:

```text
ACP/1.0
command_type: <value>
target_type: <value>
execution_mode: <value>
request_id: <string>
summary: <string>
payload_json: <json object>
guards_json: <json object>
```

Optional fields:

- `context_json`
- `notes`

## Legal Fields

Required fields:

- `command_type`
- `target_type`
- `execution_mode`
- `request_id`
- `summary`
- `payload_json`
- `guards_json`

Optional fields:

- `context_json`
- `notes`

## Command Types

- `create`
- `update`
- `delete`
- `state`
- `specify`
- `intake`
- `validate`

## Target Types

- `project`
- `system`
- `file`
- `folder`
- `task`
- `docs`
- `runtime`

## Execution Modes

- `dry_run`
- `plan_only`
- `apply`

## Validation Rules

- Header must be exactly `ACP/1.0`.
- All required fields must exist.
- Enum fields must use legal values.
- `payload_json`, `guards_json`, and `context_json` (if present) must be valid JSON objects.
- Translator must fail closed: invalid blocks do not produce actions.

## Translation Strategy

Pipeline:

1. Extract ACP block from raw text
2. Parse key-value fields
3. Validate required fields and enums
4. Parse JSON fields
5. Normalize into action object:
   - `action`: command type
   - `target`: target type
   - `mode`: execution mode
   - `request_id`
   - `summary`
   - `payload`
   - `guards`
   - `context`

## Protocol Mode Behavior

For future natural language requests:

- Convert request into ACP block first.
- Validate ACP block.
- Only then translate to execution action.

## Examples: Natural Language To ACP

### Example 1

Natural language request:

"Create a new project named inventory under client test."

ACP block:

```text
ACP/1.0
command_type: create
target_type: project
execution_mode: plan_only
request_id: req-001
summary: Create project inventory under client test
payload_json: {"client":"test","project":"inventory"}
guards_json: {"scope":"project_only","require_confirmation":true}
```

### Example 2

Natural language request:

"Set project ron/copilot core system to start."

ACP block:

```text
ACP/1.0
command_type: state
target_type: system
execution_mode: apply
request_id: req-002
summary: Set ron/copilot core to start
payload_json: {"client":"ron","project":"copilot","system":"core","requested_state":"start"}
guards_json: {"scope":"project_only","require_confirmation":false}
```

### Example 3

Natural language request:

"Delete clients/test/systems/old-project safely."

ACP block:

```text
ACP/1.0
command_type: delete
target_type: folder
execution_mode: dry_run
request_id: req-003
summary: Delete old-project folder after safety check
payload_json: {"path":"clients/test/systems/old-project"}
guards_json: {"scope":"project_only","require_confirmation":true}
```
