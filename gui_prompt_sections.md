# GUI Prompt Sections

This document defines reusable prompt sections for the Universal Meta-Foundry GUI.

Use the hash code in each section as the canonical reference from GUI-generated prompt text.

## PGH-INTAKE-CODEGEN

Perform exactly:
1. Read intake context (client, project, description).
2. Ask required intake clarification questions before implementation if missing:
	- Environment/toolchain: ESP-IDF, PlatformIO, Arduino, or other
	- Target hardware/board profile
	- Build/flash workflow expectations
3. If clarification answers are missing, add a high-priority environment-decision todo and continue with safe planning defaults only.
4. Create a project meta prompt immediately and add it as a high-priority todo.
5. The meta prompt must include: meta-philosophy, meta-skill, meta-framework, and meta-scaffold.
6. Build that meta prompt todo using `PGH-META-PROMPT-TODO-TEMPLATE`.
7. Apply Foundry philosophy/meta recipe stack before implementation planning (philosophy -> meta-skill -> meta-framework -> meta-scaffold -> governance).
8. Generate prioritized implementation task list.
9. During todo generation, scan internal reusable knowledge first (existing project docs/code and shared template assets).
10. Add explicit reuse candidates to todo items (for example MQTT patterns, package/install patterns like apt setup, interface scaffolds, or diagnostics blocks when relevant).
11. Implement first executable step in target project path.
12. Return exact files changed and exact code.

Do not:
1. Skip reusable-knowledge scan when creating todos.
2. Modify Foundry core files unless explicitly requested.
3. Skip creating the initial meta prompt todo during intake.
4. Assume environment/toolchain when explicit intake answer is required.

## PGH-TEMPLATE-INTELLIGENCE

Perform exactly:
1. Before planning or implementation, check for reusable building blocks in:
	- target project history (README, tasks, state, and existing code)
	- sibling implementations under `clients/*/systems/*`
	- shared assets under `shared/templates`, `shared/reusable_modules`, and `shared/interface_patterns`
2. Classify discoveries as:
	- `building_block`: simple reusable pattern
	- `complex_pattern`: multi-file reusable logic
3. If a better pattern is found, define template-upgrade notes and migration notes.
4. Ensure backward compatibility by documenting behavior for projects that still use older template versions.
5. Update `shared/templates/template_archive_index.json` when template usage or version mapping changes.

Do not:
1. Introduce breaking template upgrades without compatibility notes.
2. Add template changes without updating project-template mapping index.

## PGH-DELETE-PROJECT

Perform exactly:
1. Delete only provided project target path.
2. Verify target path is removed.
3. Report deleted paths.

Do not:
1. Delete any sibling project/client paths.
2. Edit Foundry core files.

## PGH-STATE-START

Perform exactly:
1. Set project state to start in project state/task files.
2. Read pending todo items from project docs/tasks.
3. Execute the meta prompt todo first, processing meta-philosophy, meta-skill, meta-framework, and meta-scaffold before feature todos.
4. Execute remaining todos in priority order.
5. Evaluate completed work for reusable template candidates (`building_block` vs `complex_pattern`).
6. If reusable, add template-candidate notes and compatibility notes for existing projects.
7. Mark completed todos done.
8. Report completed vs remaining todo items.

Do not:
1. Edit files outside target project path.

## PGH-STATE-STOP

Perform exactly:
1. Set project state to stop in project state/task files.
2. Update docs with current important notes.
3. Add short project state summary.
4. Convert unfinished work into prioritized todo list.
5. While generating todos, include reusable internal patterns that can accelerate restart.
6. Report updated files.

Do not:
1. Implement new feature code while applying stop.

## PGH-SPECIFY-ACTIVE

Perform exactly:
1. Run `PGH-TEMPLATE-INTELLIGENCE` checks before asking questions.
2. Ask clarifying questions for requested customization.
3. If project is already scaffolded, translate customization request into a meta-prompt delta todo (not full meta reset).
4. Produce short implementation plan including reusable candidates and compatibility impact.
5. Wait for confirmation.
6. Implement after confirmation in project path only.
7. Return exact files and exact code changes.

## PGH-SPECIFY-STOP-TODO

Perform exactly:
1. Run `PGH-TEMPLATE-INTELLIGENCE` checks before asking questions.
2. Ask clarifying questions for requested customization.
3. Do not implement code.
4. If project is already scaffolded, do not recreate full meta foundation; create/update a meta-prompt delta todo using `PGH-META-PROMPT-TODO-TEMPLATE`.
5. Add/update prioritized todo entries in docs/tasks.
6. Include reusable internal patterns in todo entries where relevant.
7. Add start-ready notes.
8. Return updated docs/tasks file list.

## PGH-META-PROMPT-TODO-TEMPLATE

When creating or reforming the project meta prompt todo, use this markdown structure:

```md
### Meta Prompt Todo (High Priority)

- Meta Philosophy:
	- Define core design principles and tradeoff rules for this project.
- Meta Skill:
	- Define analysis and decomposition method (how to derive modules/interfaces).
- Meta Framework:
	- Define lifecycle flow from intake -> planning -> implementation -> validation.
- Meta Scaffold:
	- Define concrete folder/files and minimal artifacts required before feature build.
- Governance:
	- Define boundaries, compatibility constraints, and template-usage tracking.

Acceptance:
- Must be executable as first start-cycle todo.
- Must remain compatible with template archive index policy.

Scaffolded project rule:
- If baseline meta foundation already exists, create `Meta Prompt Delta Todo` instead of a full replacement.
- Delta todo should only include changed/added philosophy, skill, framework, scaffold, and governance updates.
```

## PGH-STATE-GENERIC

Perform exactly:
1. Apply requested state in project state/task files.
2. Preserve existing fields and valid JSON/markdown format.
3. Report exact files updated.
