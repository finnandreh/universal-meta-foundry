const MODE_DATA = {
  prototype: {
    summary:
      "Use only the minimum shell needed to test visual shape, interaction flow, and domain language.",
    gate: "Prototype Gate",
    checks: [
      "Frontend shell renders and feels coherent on mobile + desktop",
      "Primary interaction path is clickable",
      "Domain vocabulary can be edited quickly"
    ],
    tasks: [
      "Refine top-level navigation labels",
      "Capture first pass of module names",
      "Record prototype review notes"
    ]
  },
  growth: {
    summary:
      "Expand from prototype into modules, interfaces, and scaffold layers without over-coupling.",
    gate: "Core Gate",
    checks: [
      "Modules are named with clear boundaries",
      "Interface assumptions are explicit",
      "Task list distinguishes todo vs planned"
    ],
    tasks: [
      "Add architecture and modules docs",
      "Define interface contracts",
      "Split reusable patterns from domain specifics"
    ]
  },
  hardening: {
    summary:
      "Stabilize diagnostics, tests, and dependency hygiene before scaling generation depth.",
    gate: "Hardening Gate",
    checks: [
      "Validation coverage meets baseline",
      "Diagnostics are observable in runtime",
      "Naming and dependency structure are consistent"
    ],
    tasks: [
      "Add integration checks",
      "Tighten diagnostics and logs",
      "Review architecture drift and cleanup"
    ]
  }
};

const modeGrid = document.getElementById("modeGrid");
const modeSummary = document.getElementById("modeSummary");
const gateName = document.getElementById("gateName");
const checks = document.getElementById("checks");
const tasks = document.getElementById("tasks");
const packet = document.getElementById("packet");
const domainName = document.getElementById("domainName");
const clientName = document.getElementById("clientName");
const prototypeGoal = document.getElementById("prototypeGoal");
const domainNotes = document.getElementById("domainNotes");
const taskBoard = document.getElementById("taskBoard");
const stateFilter = document.getElementById("stateFilter");
const addTaskBtn = document.getElementById("addTaskBtn");
const exportDraftBtn = document.getElementById("exportDraftBtn");
const importDraftBtn = document.getElementById("importDraftBtn");
const importDraftInput = document.getElementById("importDraftInput");
const resetDraftBtn = document.getElementById("resetDraftBtn");
const draftStatus = document.getElementById("draftStatus");
const schemaBadge = document.getElementById("schemaBadge");
const schemaInfoBtn = document.getElementById("schemaInfoBtn");
const schemaInfoPanel = document.getElementById("schemaInfoPanel");

const DRAFT_KEY = "umf.prototypeDraft.v1";
const DRAFT_SCHEMA_VERSION = 2;

schemaBadge.textContent = `Schema v${DRAFT_SCHEMA_VERSION}`;
schemaBadge.title =
  `Draft schema compatibility: v${DRAFT_SCHEMA_VERSION} native, v1 import supported`;

function toggleSchemaInfo(forceOpen) {
  const isCurrentlyOpen = !schemaInfoPanel.hidden;
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !isCurrentlyOpen;

  schemaInfoPanel.hidden = !shouldOpen;
  schemaInfoBtn.setAttribute("aria-expanded", String(shouldOpen));
}

function getDefaultTaskModel() {
  return [
    { title: "Refine top-level navigation labels", state: "todo", priority: "high" },
    { title: "Capture first pass of module names", state: "planned", priority: "medium" },
    { title: "Record prototype review notes", state: "done", priority: "low" }
  ];
}

function setDefaultDomainFields() {
  domainName.value = "Universal Meta-Foundry";
  clientName.value = "internal";
  prototypeGoal.value = "Shape frontend interaction before deep scaffold expansion";
  domainNotes.value = "Focus on minimal-first visual planning with explicit phase gates.";
}

let currentMode = "prototype";
let currentFilter = "todo";
let taskModel = getDefaultTaskModel();

function setDraftStatus(message) {
  draftStatus.textContent = message;
}

function sanitizeDraft(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Draft payload must be an object.");
  }

  const schemaVersion = Number(payload.schema_version || 1);
  const mode = payload.mode;
  const filter = payload.filter;
  const domain = payload.domain;
  const tasks = payload.tasks;

  const normalizedMode =
    typeof mode === "string" && MODE_DATA[mode] ? mode : "prototype";
  const normalizedFilter =
    typeof filter === "string" && ["todo", "planned", "done"].includes(filter)
      ? filter
      : "todo";

  const normalizedDomain = {
    name:
      domain && typeof domain.name === "string"
        ? domain.name
        : "Universal Meta-Foundry",
    client: domain && typeof domain.client === "string" ? domain.client : "internal",
    goal:
      domain && typeof domain.goal === "string"
        ? domain.goal
        : domain && typeof domain.prototype_goal === "string"
          ? domain.prototype_goal
        : "Shape frontend interaction before deep scaffold expansion",
    notes:
      domain && typeof domain.notes === "string"
        ? domain.notes
        : "Focus on minimal-first visual planning with explicit phase gates."
  };

  let normalizedTasks = getDefaultTaskModel();
  if (Array.isArray(tasks)) {
    const sanitized = tasks
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        state: ["todo", "planned", "done"].includes(item.state) ? item.state : "todo",
        priority: ["high", "medium", "low"].includes(item.priority)
          ? item.priority
          : "medium"
      }))
      .filter((item) => item.title.trim().length > 0);

    if (sanitized.length > 0) {
      normalizedTasks = sanitized;
    }
  }

  return {
    schema_version: schemaVersion,
    mode: normalizedMode,
    filter: normalizedFilter,
    domain: normalizedDomain,
    tasks: normalizedTasks
  };
}

function buildDraftPayload() {
  return {
    schema_version: DRAFT_SCHEMA_VERSION,
    mode: currentMode,
    filter: currentFilter,
    domain: {
      name: domainName.value,
      client: clientName.value,
      goal: prototypeGoal.value,
      notes: domainNotes.value
    },
    tasks: taskModel
  };
}

function applyDraftPayload(payload) {
  const normalized = sanitizeDraft(payload);
  currentMode = normalized.mode;
  currentFilter = normalized.filter;
  domainName.value = normalized.domain.name;
  clientName.value = normalized.domain.client;
  prototypeGoal.value = normalized.domain.goal;
  domainNotes.value = normalized.domain.notes;
  taskModel = normalized.tasks;

  setActiveModeButton(currentMode);
  setActiveFilterButton(currentFilter);
  renderTaskBoard();
  updateMode(currentMode);

  if (normalized.schema_version === 1) {
    setDraftStatus("Legacy draft imported (v1) and normalized to current format.");
  }
}

function persistState() {
  const payload = buildDraftPayload();

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Best effort only; prototype should still work when storage is unavailable.
  }
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return;
    }

    applyDraftPayload(JSON.parse(raw));
  } catch {
    // Ignore malformed payloads and continue with defaults.
  }
}

function renderList(target, items) {
  target.innerHTML = "";
  for (const text of items) {
    const li = document.createElement("li");
    li.textContent = text;
    target.appendChild(li);
  }
}

function getFilteredTasks() {
  return taskModel
    .filter((item) => item.state === currentFilter)
    .map((item) => ({
      title: item.title.trim(),
      state: item.state,
      priority: item.priority
    }))
    .filter((item) => item.title.length > 0);
}

function renderPacket(mode, data) {
  const visibleTasks = getFilteredTasks();

  packet.textContent = JSON.stringify(
    {
      phase: `${mode}_mode`,
      current_gate: data.gate,
      domain: {
        name: domainName.value.trim(),
        client: clientName.value.trim(),
        prototype_goal: prototypeGoal.value.trim(),
        notes: domainNotes.value.trim()
      },
      selected_tasks: visibleTasks,
      selected_state: currentFilter,
      acceptance_checks: data.checks,
      next_recommendation:
        mode === "prototype"
          ? "Promote to growth_mode after visual review"
          : "Continue to next gate after acceptance checks pass"
    },
    null,
    2
  );
}

function setActiveModeButton(mode) {
  for (const btn of modeGrid.querySelectorAll("button[data-mode]")) {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  }
}

function setActiveFilterButton(filter) {
  for (const chip of stateFilter.querySelectorAll("button[data-filter]")) {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  }
}

function renderTaskBoard() {
  taskBoard.innerHTML = "";

  taskModel.forEach((task, index) => {
    const row = document.createElement("div");
    row.className = "task-row";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = task.title;
    titleInput.setAttribute("aria-label", `Task ${index + 1} title`);
    titleInput.addEventListener("input", () => {
      taskModel[index].title = titleInput.value;
      refreshDerivedViews();
    });

    const stateSelect = document.createElement("select");
    stateSelect.setAttribute("aria-label", `Task ${index + 1} state`);
    for (const state of ["todo", "planned", "done"]) {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      if (task.state === state) {
        option.selected = true;
      }
      stateSelect.appendChild(option);
    }
    stateSelect.addEventListener("change", () => {
      taskModel[index].state = stateSelect.value;
      refreshDerivedViews();
    });

    const prioritySelect = document.createElement("select");
    prioritySelect.setAttribute("aria-label", `Task ${index + 1} priority`);
    for (const priority of ["high", "medium", "low"]) {
      const option = document.createElement("option");
      option.value = priority;
      option.textContent = priority;
      if (task.priority === priority) {
        option.selected = true;
      }
      prioritySelect.appendChild(option);
    }
    prioritySelect.addEventListener("change", () => {
      taskModel[index].priority = prioritySelect.value;
      refreshDerivedViews();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", `Remove task ${index + 1}`);
    removeBtn.addEventListener("click", () => {
      taskModel = taskModel.filter((_, i) => i !== index);
      renderTaskBoard();
      refreshDerivedViews();
    });

    row.appendChild(titleInput);
    row.appendChild(stateSelect);
    row.appendChild(prioritySelect);
    row.appendChild(removeBtn);
    taskBoard.appendChild(row);
  });
}

function refreshDerivedViews() {
  const modeData = MODE_DATA[currentMode];
  const visibleTaskTitles = getFilteredTasks().map(
    (item) => `${item.title} (${item.priority})`
  );

  renderList(tasks, visibleTaskTitles);
  renderPacket(currentMode, modeData);
  persistState();
}

function updateMode(mode) {
  currentMode = mode;
  const data = MODE_DATA[mode];
  modeSummary.textContent = data.summary;
  gateName.textContent = data.gate;
  renderList(checks, data.checks);
  refreshDerivedViews();
}

modeGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (!button) {
    return;
  }

  setActiveModeButton(button.dataset.mode);
  updateMode(button.dataset.mode);
});

stateFilter.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) {
    return;
  }

  currentFilter = button.dataset.filter;
  setActiveFilterButton(currentFilter);
  refreshDerivedViews();
});

addTaskBtn.addEventListener("click", () => {
  taskModel.push({ title: "New task", state: currentFilter, priority: "medium" });
  renderTaskBoard();
  refreshDerivedViews();
  setDraftStatus("Draft updated.");
});

exportDraftBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(buildDraftPayload(), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "umf-prototype-draft.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setDraftStatus("Draft exported to JSON file.");
});

importDraftBtn.addEventListener("click", () => {
  importDraftInput.click();
});

importDraftInput.addEventListener("change", async () => {
  const file = importDraftInput.files && importDraftInput.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    applyDraftPayload(parsed);
    persistState();
    if (Number(parsed.schema_version || 1) >= DRAFT_SCHEMA_VERSION) {
      setDraftStatus("Draft imported from JSON.");
    }
  } catch {
    setDraftStatus("Import failed. Provide a valid JSON draft file.");
  } finally {
    importDraftInput.value = "";
  }
});

resetDraftBtn.addEventListener("click", () => {
  localStorage.removeItem(DRAFT_KEY);
  setDefaultDomainFields();
  currentMode = "prototype";
  currentFilter = "todo";
  taskModel = getDefaultTaskModel();
  setActiveModeButton(currentMode);
  setActiveFilterButton(currentFilter);
  renderTaskBoard();
  updateMode(currentMode);
  setDraftStatus("Draft reset to defaults.");
});

schemaInfoBtn.addEventListener("click", () => {
  toggleSchemaInfo();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleSchemaInfo(false);
  }
});

for (const input of [domainName, clientName, prototypeGoal, domainNotes]) {
  input.addEventListener("input", () => {
    renderPacket(currentMode, MODE_DATA[currentMode]);
    persistState();
  });
}

setDefaultDomainFields();
loadPersistedState();
setActiveModeButton(currentMode);
setActiveFilterButton(currentFilter);
renderTaskBoard();
updateMode(currentMode);
setDraftStatus("Draft ready.");
