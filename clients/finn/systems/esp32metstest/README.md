# esp32metstest

Generated project for client `finn` under `clients/finn/systems/esp32metstest`.

## Scope

- In scope: this project folder only
- Out of scope: Foundry core files

## Intake Summary

- Description: Make an ESP32 app that can control 2 digital pins and 8 PWM outputs from serial terminal.
- Protocol: `gui_prompt_sections.md#PGH-INTAKE-CODEGEN`

## Meta Prompt Todo (High Priority)

- Meta Philosophy:
  - Keep runtime control explicit, observable, and safe-by-default.
  - Prefer deterministic command behavior over hidden automation.
- Meta Skill:
  - Decompose into serial parser, digital output control, PWM control, and status reporting.
  - Keep commands simple and testable from monitor.
- Meta Framework:
  - Intake -> meta prompt todo -> implementation todos -> start execution -> validation.
  - Execute meta prompt todo first on start cycle.
- Meta Scaffold:
  - Minimal ESP-IDF layout with root CMake, `main/CMakeLists.txt`, and `main/main.c`.
  - Project docs + task/state tracking files.
- Governance:
  - Keep edits scoped to `clients/finn/systems/esp32metstest`.
  - Track reusable patterns and compatibility notes for future template promotion.

Acceptance:
- Must execute as first start-cycle todo.
- Must remain compatible with template governance policy.

Start-cycle status:
- Completed first during `PGH-STATE-START` execution.

## Reuse Candidates Identified During Intake

- Reuse candidate: LEDC multi-channel PWM setup pattern for 8 channels.
- Reuse candidate: serial command parser pattern (`help`, `status`, verb + arguments).
- Reuse candidate: bulk GPIO initialization loop for digital outputs.

## Start-Cycle Reuse Evaluation

Template candidate decisions:

- `building_block`: serial command grammar for mixed digital/PWM control (`dig`, `pwm`, `status`, `help`).
- `complex_pattern`: LEDC multi-channel runtime control with per-channel duty update and shared frequency updates.
- `building_block`: board-safe GPIO map validation step before pin freeze.

Compatibility notes for future template promotion:

- Keep command grammar backward-compatible when extending features.
- Treat ESP32 classic GPIO 6..11 as flash-reserved and excluded from reusable default pin maps.
- If target changes to ESP32-S3/C3 variants, keep same command contract and only swap pin profile set.

## Current Implemented Step

Implemented first executable step:

- ESP-IDF scaffold with serial command runtime for:
  - 2 digital outputs (`DIGITAL_GPIOS`: GPIO 2, GPIO 4)
  - 8 PWM outputs (`PWM_GPIOS`: GPIO 13, 14, 15, 16, 17, 18, 19, 21)
- PlatformIO scaffold with equivalent serial command runtime in `src/main.cpp`
- Serial commands:
  - `dig <index_0_to_1> <0_or_1>`
  - `pwm <channel_0_to_7> <duty_0_to_4095> <freq_hz_100_to_40000>`
  - `status`
  - `help`

## Build (ESP-IDF)

From this project folder:

1. `idf.py set-target esp32`
2. `idf.py build`
3. `idf.py flash monitor`

## Build (PlatformIO)

From this project folder:

1. `pio run`
2. `pio run -t upload`
3. `pio device monitor -b 115200`

PlatformIO config:

- `platformio.ini` uses:
  - platform: `espressif32`
  - board: `esp32dev`
  - framework: `arduino`

## Start-Ready Todo Plan

Completed in this start cycle:

1. Executed Meta Prompt Todo baseline and locked project-specific governance language.
2. Validated pin map against ESP32 constraints and removed flash-reserved GPIO 6..11 usage.
3. Captured reusable LEDC/serial patterns and compatibility notes.

Next backlog candidates:

1. Add serial input validation edge-case tests/documentation.
2. Add optional global PWM update command for all 8 channels.
3. Add safety command to reset all outputs to default state.
