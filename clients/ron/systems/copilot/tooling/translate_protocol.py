import json
import re
from typing import Any, Dict, List

HEADER = "ACP/1.0"
REQUIRED_FIELDS = {
    "command_type",
    "target_type",
    "execution_mode",
    "request_id",
    "summary",
    "payload_json",
    "guards_json",
}
COMMAND_TYPES = {"create", "update", "delete", "state", "specify", "intake", "validate"}
TARGET_TYPES = {"project", "system", "file", "folder", "task", "docs", "runtime"}
EXECUTION_MODES = {"dry_run", "plan_only", "apply"}
JSON_FIELDS = {"payload_json", "guards_json", "context_json"}


def extract_block(text: str) -> str:
    lines = text.splitlines()
    start = None
    for idx, line in enumerate(lines):
        if line.strip() == HEADER:
            start = idx
            break
    if start is None:
        raise ValueError("Missing ACP header ACP/1.0")

    block_lines = [lines[start].strip()]
    for line in lines[start + 1 :]:
        if not line.strip():
            break
        block_lines.append(line.rstrip())

    return "\n".join(block_lines)


def parse_block(block: str) -> Dict[str, Any]:
    lines = block.splitlines()
    if not lines or lines[0].strip() != HEADER:
        raise ValueError("Invalid ACP header")

    parsed: Dict[str, Any] = {"protocol": HEADER}
    for raw in lines[1:]:
        if ":" not in raw:
            raise ValueError(f"Invalid field line: {raw}")
        key, value = raw.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            raise ValueError("Empty field key")
        parsed[key] = value

    missing = sorted(REQUIRED_FIELDS - set(parsed.keys()))
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    if parsed["command_type"] not in COMMAND_TYPES:
        raise ValueError("Invalid command_type")
    if parsed["target_type"] not in TARGET_TYPES:
        raise ValueError("Invalid target_type")
    if parsed["execution_mode"] not in EXECUTION_MODES:
        raise ValueError("Invalid execution_mode")

    for field in JSON_FIELDS:
        if field not in parsed:
            continue
        try:
            obj = json.loads(parsed[field])
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in {field}: {exc}") from exc
        if not isinstance(obj, dict):
            raise ValueError(f"{field} must be a JSON object")
        parsed[field] = obj

    return parsed


def translate_to_action(parsed: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "action": parsed["command_type"],
        "target": parsed["target_type"],
        "mode": parsed["execution_mode"],
        "request_id": parsed["request_id"],
        "summary": parsed["summary"],
        "payload": parsed["payload_json"],
        "guards": parsed["guards_json"],
        "context": parsed.get("context_json", {}),
    }


def convert_text_to_action(text: str) -> Dict[str, Any]:
    block = extract_block(text)
    parsed = parse_block(block)
    return translate_to_action(parsed)


def convert_nl_to_block(request: str, request_id: str = "req-auto") -> str:
    # Minimal deterministic baseline: unknown NL is wrapped as an intake command.
    payload = {
        "original_request": request,
        "intent": "intake"
    }
    guards = {
        "scope": "project_only",
        "require_confirmation": True
    }
    return "\n".join(
        [
            HEADER,
            "command_type: intake",
            "target_type: project",
            "execution_mode: plan_only",
            f"request_id: {request_id}",
            "summary: Intake request converted from natural language",
            f"payload_json: {json.dumps(payload, separators=(',', ':'))}",
            f"guards_json: {json.dumps(guards, separators=(',', ':'))}",
        ]
    )


if __name__ == "__main__":
    sample = convert_nl_to_block("Create protocol project for strict command blocks")
    action = convert_text_to_action(sample)
    print(json.dumps({"block": sample, "action": action}, indent=2))
