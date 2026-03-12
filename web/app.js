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
      "Expand from prototype into modules, interfaces, and prompt package depth without over-coupling.",
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
      "Stabilize diagnostics, tests, and dependency hygiene before scaling prompt quality and execution readiness.",
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
const viewModeSelect = document.getElementById("viewModeSelect");
const soulEnabled = document.getElementById("soulEnabled");
const soulProfile = document.getElementById("soulProfile");
const soulRecommendationMode = document.getElementById("soulRecommendationMode");
const soulMaxSuggestions = document.getElementById("soulMaxSuggestions");
const soulPrinciplesAnchor = document.getElementById("soulPrinciplesAnchor");
const soulInheritanceSource = document.getElementById("soulInheritanceSource");
const soulCapabilitiesEnabled = document.getElementById("soulCapabilitiesEnabled");
const soulCapabilitiesDisabled = document.getElementById("soulCapabilitiesDisabled");
const evolutionInbox = document.getElementById("evolutionInbox");
const gateName = document.getElementById("gateName");
const checks = document.getElementById("checks");
const tasks = document.getElementById("tasks");
const packet = document.getElementById("packet");
const copilotReadiness = document.getElementById("copilotReadiness");
const domainName = document.getElementById("domainName");
const clientName = document.getElementById("clientName");
const prototypeGoal = document.getElementById("prototypeGoal");
const domainNotes = document.getElementById("domainNotes");
const projectName = document.getElementById("projectName");
const systemName = document.getElementById("systemName");
const clientCatalog = document.getElementById("clientCatalog");
const projectCatalog = document.getElementById("projectCatalog");
const systemCatalog = document.getElementById("systemCatalog");
const templateCatalog = document.getElementById("templateCatalog");
const stateCatalog = document.getElementById("stateCatalog");
const taskTemplateCatalog = document.getElementById("taskTemplateCatalog");
const applyClientCatalogBtn = document.getElementById("applyClientCatalogBtn");
const applyProjectCatalogBtn = document.getElementById("applyProjectCatalogBtn");
const applySystemCatalogBtn = document.getElementById("applySystemCatalogBtn");
const applyTemplateCatalogBtn = document.getElementById("applyTemplateCatalogBtn");
const applyStateCatalogBtn = document.getElementById("applyStateCatalogBtn");
const applyTaskTemplateCatalogBtn = document.getElementById("applyTaskTemplateCatalogBtn");
const promptStructurePreview = document.getElementById("promptStructurePreview");
const taskBoard = document.getElementById("taskBoard");
const statusClientFilter = document.getElementById("statusClientFilter");
const statusProjectFilter = document.getElementById("statusProjectFilter");
const statusStateFilter = document.getElementById("statusStateFilter");
const refreshStatusBtn = document.getElementById("refreshStatusBtn");
const copilotUpdateStatusBtn = document.getElementById("copilotUpdateStatusBtn");
const projectStatusSummary = document.getElementById("projectStatusSummary");
const projectStatusView = document.getElementById("projectStatusView");
const projectStatusJson = document.getElementById("projectStatusJson");
const stateFilter = document.getElementById("stateFilter");
const taskTemplateSelect = document.getElementById("taskTemplateSelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const exportDraftBtn = document.getElementById("exportDraftBtn");
const importDraftBtn = document.getElementById("importDraftBtn");
const importDraftInput = document.getElementById("importDraftInput");
const exportProjectBundleBtn = document.getElementById("exportProjectBundleBtn");
const importProjectBundleBtn = document.getElementById("importProjectBundleBtn");
const importProjectBundleInput = document.getElementById("importProjectBundleInput");
const resetDraftBtn = document.getElementById("resetDraftBtn");
const draftStatus = document.getElementById("draftStatus");
const promptPacketSummary = document.getElementById("promptPacketSummary");
const schemaBadge = document.getElementById("schemaBadge");
const schemaInfoBtn = document.getElementById("schemaInfoBtn");
const schemaInfoPanel = document.getElementById("schemaInfoPanel");

const DRAFT_KEY = "umf.prototypeDraft.v1";
const DRAFT_SCHEMA_VERSION = 2;
const SOUL_PROFILE_PRESETS = {
  light: {
    recommendation_mode: "suggest_only",
    max_suggestions_per_cycle: 4,
    enabled: [
      "pattern_miner",
      "drift_guard",
      "learning_budget_controller",
      "explainability_narrator"
    ],
    disabled: [
      "reuse_recommender",
      "gate_predictor",
      "risk_radar",
      "prompt_quality_critic",
      "schema_guardian",
      "evolution_conflict_resolver",
      "plugin_fitness_advisor",
      "inheritance_auditor"
    ]
  },
  standard: {
    recommendation_mode: "suggest_only",
    max_suggestions_per_cycle: 6,
    enabled: [
      "pattern_miner",
      "drift_guard",
      "learning_budget_controller",
      "explainability_narrator",
      "reuse_recommender",
      "gate_predictor",
      "risk_radar",
      "prompt_quality_critic",
      "schema_guardian"
    ],
    disabled: [
      "evolution_conflict_resolver",
      "plugin_fitness_advisor",
      "inheritance_auditor"
    ]
  },
  extended: {
    recommendation_mode: "guided_apply",
    max_suggestions_per_cycle: 8,
    enabled: [
      "pattern_miner",
      "drift_guard",
      "learning_budget_controller",
      "explainability_narrator",
      "reuse_recommender",
      "gate_predictor",
      "risk_radar",
      "prompt_quality_critic",
      "schema_guardian",
      "evolution_conflict_resolver",
      "plugin_fitness_advisor",
      "inheritance_auditor"
    ],
    disabled: []
  }
};

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
    { title: "Capture internal baseline example", state: "todo", priority: "high" },
    { title: "Map client constraints to prompt", state: "planned", priority: "medium" },
    { title: "Review reusable rollout notes", state: "done", priority: "low" }
  ];
}

function getDefaultSetupCatalog() {
  return {
    clients: ["internal"],
    templates: [
      "Capture internal reusable baseline",
      "Prepare client rollout prompt",
      "Frontend discovery and terms mapping"
    ],
    projects_by_client: {
      internal: ["umf-prototype"]
    },
    systems_by_client_project: {
      "internal/umf-prototype": ["core-planner"]
    },
    task_states: ["todo", "planned", "done"],
    task_templates: [
      { title: "Capture internal baseline example", state: "todo", priority: "high" },
      { title: "Map client constraints to prompt", state: "planned", priority: "medium" },
      { title: "Review reusable rollout notes", state: "done", priority: "low" }
    ],
    project_status_by_key: {
      "internal/umf-prototype/core-planner": {
        status: "active",
        phase: "prototype_mode",
        updated_by: "system",
        last_updated: ""
      }
    }
  };
}

function getDefaultSoulConfig() {
  return {
    enabled: true,
    profile: "light",
    recommendation_mode: "suggest_only",
    principles_anchor: "foundry_v2_core_principles",
    inheritance_source: "universal-meta-foundry@v2",
    capabilities: {
      enabled: [
        "pattern_miner",
        "drift_guard",
        "learning_budget_controller",
        "explainability_narrator"
      ],
      disabled: ["plugin_fitness_advisor", "inheritance_auditor"]
    },
    learning_budget: {
      max_suggestions_per_cycle: 5
    },
    risk_threshold: {
      auto_block_level: "high"
    },
    audit: {
      last_inheritance_check: ""
    },
    identity_manifest: {
      master_identity_file: "soul.identity.json",
      generated_identity_template: "shared/templates/soul.identity.template.json",
      required_for_generated_projects: true,
      generated_identity_file: "soul.identity.json",
      instruction_scope_rule: "generated_projects_must_define_own_scope"
    },
    evolution: {
      suggestions: [],
      history: [],
      last_scanned_at: ""
    }
  };
}

function parseCatalogText(rawValue, fallbackValues) {
  const parsed = String(rawValue || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return parsed.length > 0 ? parsed : fallbackValues.slice();
}

function normalizeCatalog(values, fallbackValues) {
  if (!Array.isArray(values)) {
    return fallbackValues.slice();
  }

  const normalized = values
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : fallbackValues.slice();
}

function normalizePriority(value) {
  return ["high", "medium", "low"].includes(value) ? value : "medium";
}

function normalizeSoulProfile(value) {
  return ["light", "standard", "extended"].includes(value) ? value : "light";
}

function normalizeRecommendationMode(value) {
  return ["suggest_only", "guided_apply"].includes(value) ? value : "suggest_only";
}

function normalizeRiskLevel(value) {
  return ["low", "medium", "high"].includes(value) ? value : "high";
}

function effectiveCapabilities(config) {
  const enabled = new Set(config.capabilities.enabled);
  const disabled = new Set(config.capabilities.disabled);
  return Array.from(enabled).filter((key) => !disabled.has(key));
}

function hasCapability(key) {
  return effectiveCapabilities(soulConfig).includes(key);
}

function uniqueStrings(values) {
  return Array.from(new Set(values));
}

function makeClientProjectKey(client, project) {
  return `${client}/${project}`;
}

function makeProjectSystemKey(client, project, system) {
  return `${client}/${project}/${system}`;
}

function nowIso() {
  return new Date().toISOString();
}

function cloneObjectOfArrays(source, fallback) {
  const out = {};
  const base = source && typeof source === "object" ? source : {};
  for (const [key, value] of Object.entries(base)) {
    out[key] = normalizeCatalog(value, []);
  }

  if (Object.keys(out).length === 0 && fallback) {
    for (const [key, value] of Object.entries(fallback)) {
      out[key] = value.slice();
    }
  }

  return out;
}

function parseTaskTemplatesText(rawValue, validStates) {
  const parsed = String(rawValue || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split("|").map((item) => item.trim());
      const title = parts[0] || "New task";
      const state = validStates.includes(parts[1]) ? parts[1] : validStates[0];
      const priority = normalizePriority(parts[2]);
      return { title, state, priority };
    });

  return parsed;
}

function serializeTaskTemplates(templates) {
  return templates.map((item) => `${item.title} | ${item.state} | ${item.priority}`).join("\n");
}

function getProjectsForClient(client) {
  const projects = setupCatalog.projects_by_client[client];
  return Array.isArray(projects) && projects.length > 0 ? projects : ["umf-prototype"];
}

function getSystemsForClientProject(client, project) {
  const key = makeClientProjectKey(client, project);
  const systems = setupCatalog.systems_by_client_project[key];
  return Array.isArray(systems) && systems.length > 0 ? systems : ["core-planner"];
}

function setSelectOptions(selectElement, values, preferredValue) {
  const preserved = preferredValue || selectElement.value;
  selectElement.innerHTML = "";

  for (const item of values) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectElement.appendChild(option);
  }

  if (values.includes(preserved)) {
    selectElement.value = preserved;
    return;
  }

  if (values.length > 0) {
    selectElement.value = values[0];
  }
}

function syncSetupInputsFromCatalog() {
  clientCatalog.value = setupCatalog.clients.join("\n");
  templateCatalog.value = setupCatalog.templates.join("\n");
  stateCatalog.value = setupCatalog.task_states.join("\n");
  taskTemplateCatalog.value = serializeTaskTemplates(setupCatalog.task_templates);
}

function syncProjectSystemCatalogInputs() {
  const currentClient = clientName.value;
  const currentProject = projectName.value;
  projectCatalog.value = getProjectsForClient(currentClient).join("\n");
  systemCatalog.value = getSystemsForClientProject(currentClient, currentProject).join("\n");
}

function renderSetupDropdowns(preferredClient, preferredProject, preferredSystem, preferredTemplate) {
  setSelectOptions(clientName, setupCatalog.clients, preferredClient);
  const selectedClient = clientName.value;
  setSelectOptions(projectName, getProjectsForClient(selectedClient), preferredProject);
  const selectedProject = projectName.value;
  setSelectOptions(
    systemName,
    getSystemsForClientProject(selectedClient, selectedProject),
    preferredSystem
  );
  setSelectOptions(prototypeGoal, setupCatalog.templates, preferredTemplate);
  renderTaskTemplateSelect();
  renderStateFilterChips();
  syncProjectSystemCatalogInputs();
}

function renderTaskTemplateSelect(preferredIndex) {
  const selected =
    preferredIndex !== undefined ? String(preferredIndex) : String(taskTemplateSelect.value || "0");

  taskTemplateSelect.innerHTML = "";

  setupCatalog.task_templates.forEach((template, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${template.title} [${template.state} | ${template.priority}]`;
    taskTemplateSelect.appendChild(option);
  });

  if (setupCatalog.task_templates.length === 0) {
    const option = document.createElement("option");
    option.value = "0";
    option.textContent = "New task [todo | medium]";
    taskTemplateSelect.appendChild(option);
  }

  const allowed = Array.from(taskTemplateSelect.options).map((item) => item.value);
  taskTemplateSelect.value = allowed.includes(selected) ? selected : allowed[0];
}

function renderStateFilterChips() {
  stateFilter.innerHTML = "";
  for (const state of setupCatalog.task_states) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.filter = state;
    button.textContent = state;
    stateFilter.appendChild(button);
  }

  if (!setupCatalog.task_states.includes(currentFilter)) {
    currentFilter = setupCatalog.task_states[0];
  }

  setActiveFilterButton(currentFilter);
}

function ensureSetupIntegrity() {
  if (!setupCatalog.clients.includes(clientName.value)) {
    setupCatalog.clients.push(clientName.value || "internal");
  }

  for (const client of setupCatalog.clients) {
    if (!Array.isArray(setupCatalog.projects_by_client[client]) || setupCatalog.projects_by_client[client].length === 0) {
      setupCatalog.projects_by_client[client] = ["umf-prototype"];
    }
    for (const project of setupCatalog.projects_by_client[client]) {
      const key = makeClientProjectKey(client, project);
      if (
        !Array.isArray(setupCatalog.systems_by_client_project[key]) ||
        setupCatalog.systems_by_client_project[key].length === 0
      ) {
        setupCatalog.systems_by_client_project[key] = ["core-planner"];
      }

      for (const system of setupCatalog.systems_by_client_project[key]) {
        const projectSystemKey = makeProjectSystemKey(client, project, system);
        if (!setupCatalog.project_status_by_key[projectSystemKey]) {
          setupCatalog.project_status_by_key[projectSystemKey] = {
            status: "active",
            phase: currentMode ? `${currentMode}_mode` : "prototype_mode",
            updated_by: "system",
            last_updated: ""
          };
        }
      }
    }
  }

  if (!setupCatalog.task_states.includes(currentFilter)) {
    currentFilter = setupCatalog.task_states[0];
  }
}

function setDefaultDomainFields() {
  const defaultSetup = getDefaultSetupCatalog();
  const defaultSoul = getDefaultSoulConfig();
  domainName.value = "Universal Meta-Foundry";
  setupCatalog = JSON.parse(JSON.stringify(defaultSetup));
  soulConfig = JSON.parse(JSON.stringify(defaultSoul));
  syncSetupInputsFromCatalog();
  renderSetupDropdowns(
    "internal",
    "umf-prototype",
    "core-planner",
    "Capture internal reusable baseline"
  );
  domainNotes.value = "Focus on minimal-first visual planning with explicit phase gates.";
  syncSoulInputsFromConfig();
}

let currentMode = "prototype";
let currentViewMode = "user";
let currentFilter = "todo";
let taskModel = getDefaultTaskModel();
let setupCatalog = getDefaultSetupCatalog();
let soulConfig = getDefaultSoulConfig();

function setDraftStatus(message) {
  draftStatus.textContent = message;
}

function applyViewMode(mode) {
  currentViewMode = mode === "technical" ? "technical" : "user";
  viewModeSelect.value = currentViewMode;

  const detailPanels = document.querySelectorAll(".details-panel");
  for (const panel of detailPanels) {
    const isTechnical = currentViewMode === "technical";
    panel.hidden = !isTechnical;
    panel.open = isTechnical;
  }
}

function syncSoulInputsFromConfig() {
  soulEnabled.value = soulConfig.enabled ? "true" : "false";
  soulProfile.value = soulConfig.profile;
  soulRecommendationMode.value = soulConfig.recommendation_mode;
  soulMaxSuggestions.value = String(soulConfig.learning_budget.max_suggestions_per_cycle);
  soulPrinciplesAnchor.value = soulConfig.principles_anchor;
  soulInheritanceSource.value = soulConfig.inheritance_source;
  soulCapabilitiesEnabled.value = soulConfig.capabilities.enabled.join("\n");
  soulCapabilitiesDisabled.value = soulConfig.capabilities.disabled.join("\n");
}

function applySoulProfilePreset(profile) {
  const selectedProfile = normalizeSoulProfile(profile);
  const preset = SOUL_PROFILE_PRESETS[selectedProfile];
  if (!preset) {
    return;
  }

  soulConfig.profile = selectedProfile;
  soulConfig.recommendation_mode = preset.recommendation_mode;
  soulConfig.learning_budget.max_suggestions_per_cycle = preset.max_suggestions_per_cycle;
  soulConfig.capabilities.enabled = preset.enabled.slice();
  soulConfig.capabilities.disabled = preset.disabled.slice();
  syncSoulInputsFromConfig();
}

function updateSoulConfigFromInputs() {
  soulConfig.enabled = soulEnabled.value === "true";
  soulConfig.profile = normalizeSoulProfile(soulProfile.value);
  soulConfig.recommendation_mode = normalizeRecommendationMode(soulRecommendationMode.value);
  soulConfig.learning_budget.max_suggestions_per_cycle = Math.max(
    1,
    Math.min(20, Number(soulMaxSuggestions.value || 5))
  );
  soulConfig.principles_anchor =
    soulPrinciplesAnchor.value.trim() || "foundry_v2_core_principles";
  soulConfig.inheritance_source =
    soulInheritanceSource.value.trim() || "universal-meta-foundry@v2";
  soulConfig.capabilities.enabled = parseCatalogText(soulCapabilitiesEnabled.value, []);
  soulConfig.capabilities.disabled = parseCatalogText(soulCapabilitiesDisabled.value, []);
}

function getSuggestionById(suggestionId) {
  return soulConfig.evolution.suggestions.find((item) => item.id === suggestionId);
}

function runEvolutionScan() {
  if (!soulConfig.enabled) {
    return;
  }

  const suggestions = [];

  if (hasCapability("pattern_miner") && taskModel.length >= 5 && setupCatalog.task_templates.length < 5) {
    suggestions.push({
      id: "sugg_expand_task_templates",
      title: "Expand task template catalog",
      reason: "Task board has high activity but template catalog is small.",
      type: "setup_catalog_improvement",
      risk: "low",
      proposed_action: "append_task_templates"
    });
  }

  if (hasCapability("drift_guard") && setupCatalog.task_states.length <= 3) {
    suggestions.push({
      id: "sugg_extend_task_states",
      title: "Add richer task states",
      reason: "Only minimal states detected. Add blocked/review/testing for clearer flow.",
      type: "workflow_governance_update",
      risk: "low",
      proposed_action: "extend_task_states"
    });
  }

  if (hasCapability("reuse_recommender") && setupCatalog.clients.length > 1) {
    suggestions.push({
      id: "sugg_add_reuse_review_task",
      title: "Add cross-client reuse review task",
      reason: "Multiple clients are active; reuse alignment task is recommended.",
      type: "gui_enhancement",
      risk: "low",
      proposed_action: "add_reuse_task_template"
    });
  }

  if (hasCapability("prompt_quality_critic") && domainNotes.value.trim().length > 180) {
    suggestions.push({
      id: "sugg_prompt_clarity_task",
      title: "Create prompt clarity review task",
      reason: "Domain notes are long. Add a focused clarity pass before handoff.",
      type: "workflow_governance_update",
      risk: "medium",
      proposed_action: "add_prompt_clarity_task"
    });
  }

  const maxSuggestions = soulConfig.learning_budget.max_suggestions_per_cycle;
  const bounded = suggestions.slice(0, maxSuggestions);
  const now = nowIso();

  for (const item of bounded) {
    const existing = getSuggestionById(item.id);
    if (existing) {
      existing.last_seen_at = now;
      continue;
    }

    soulConfig.evolution.suggestions.push({
      ...item,
      status: "pending",
      created_at: now,
      last_seen_at: now,
      decided_at: ""
    });
  }

  soulConfig.evolution.last_scanned_at = now;
}

function applySuggestionAction(suggestion) {
  switch (suggestion.proposed_action) {
    case "extend_task_states": {
      const nextStates = uniqueStrings([...setupCatalog.task_states, "blocked", "review", "testing"]);
      setupCatalog.task_states = nextStates;
      taskModel = taskModel.map((item) => ({
        ...item,
        state: nextStates.includes(item.state) ? item.state : nextStates[0]
      }));
      setupCatalog.task_templates = setupCatalog.task_templates.map((item) => ({
        ...item,
        state: nextStates.includes(item.state) ? item.state : nextStates[0]
      }));
      break;
    }
    case "append_task_templates": {
      const existingKeys = new Set(
        setupCatalog.task_templates.map((item) => `${item.title}|${item.state}|${item.priority}`)
      );
      const proposals = [
        { title: "Audit recurring client customizations", state: "planned", priority: "medium" },
        { title: "Promote reusable internal pattern", state: "todo", priority: "high" }
      ];
      for (const item of proposals) {
        const key = `${item.title}|${item.state}|${item.priority}`;
        if (!existingKeys.has(key)) {
          setupCatalog.task_templates.push(item);
          existingKeys.add(key);
        }
      }
      break;
    }
    case "add_reuse_task_template": {
      const title = "Cross-client reusable pattern review";
      const exists = setupCatalog.task_templates.some((item) => item.title === title);
      if (!exists) {
        setupCatalog.task_templates.push({ title, state: "todo", priority: "medium" });
      }
      break;
    }
    case "add_prompt_clarity_task": {
      const exists = taskModel.some((item) => item.title === "Prompt clarity pass");
      if (!exists) {
        taskModel.push({ title: "Prompt clarity pass", state: "todo", priority: "medium" });
      }
      break;
    }
    default:
      break;
  }
}

function decideSuggestion(suggestionId, decision) {
  const target = getSuggestionById(suggestionId);
  if (!target) {
    return;
  }

  target.status = decision;
  target.decided_at = nowIso();
  if (decision === "accepted") {
    applySuggestionAction(target);
  }

  soulConfig.evolution.history.push({
    id: target.id,
    title: target.title,
    decision,
    decided_at: target.decided_at
  });
}

function renderEvolutionInbox() {
  const visible = soulConfig.evolution.suggestions
    .filter((item) => item.status === "pending" || item.status === "deferred")
    .slice(0, soulConfig.learning_budget.max_suggestions_per_cycle);

  evolutionInbox.innerHTML = "";

  if (visible.length === 0) {
    const empty = document.createElement("article");
    empty.className = "status-card";
    empty.innerHTML = "<h3>No pending suggestions</h3><p>Soul Brain has no active recommendations right now.</p>";
    evolutionInbox.appendChild(empty);
    return;
  }

  for (const item of visible) {
    const card = document.createElement("article");
    card.className = "status-card evolution-card";

    const tags = document.createElement("div");
    tags.className = "evolution-meta";
    for (const value of [item.type, `risk:${item.risk}`, `status:${item.status}`]) {
      const tag = document.createElement("span");
      tag.className = "evolution-tag";
      tag.textContent = value;
      tags.appendChild(tag);
    }

    const actions = document.createElement("div");
    actions.className = "evolution-actions";

    const acceptBtn = document.createElement("button");
    acceptBtn.type = "button";
    acceptBtn.className = "mode-btn";
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", () => {
      decideSuggestion(item.id, "accepted");
      syncSetupInputsFromCatalog();
      syncProjectSystemCatalogInputs();
      renderSetupDropdowns(clientName.value, projectName.value, systemName.value, prototypeGoal.value);
      renderTaskBoard();
      refreshDerivedViews();
      setDraftStatus("Evolution suggestion accepted and applied.");
    });

    const deferBtn = document.createElement("button");
    deferBtn.type = "button";
    deferBtn.className = "ghost-btn";
    deferBtn.textContent = "Defer";
    deferBtn.addEventListener("click", () => {
      decideSuggestion(item.id, "deferred");
      renderEvolutionInbox();
      persistState();
      setDraftStatus("Evolution suggestion deferred.");
    });

    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "ghost-btn";
    rejectBtn.textContent = "Reject";
    rejectBtn.addEventListener("click", () => {
      decideSuggestion(item.id, "rejected");
      renderEvolutionInbox();
      persistState();
      setDraftStatus("Evolution suggestion rejected.");
    });

    actions.appendChild(acceptBtn);
    actions.appendChild(deferBtn);
    actions.appendChild(rejectBtn);

    card.innerHTML = `<h3>${item.title}</h3><p>${item.reason}</p>`;
    card.appendChild(tags);
    card.appendChild(actions);
    evolutionInbox.appendChild(card);
  }
}

function sanitizeDraft(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Draft payload must be an object.");
  }

  const schemaVersion = Number(payload.schema_version || 1);
  const mode = payload.mode;
  const viewMode = payload.view_mode;
  const filter = payload.filter;
  const domain = payload.domain;
  const tasks = payload.tasks;
  const setup = payload.setup;
  const soul = payload.soul;
  const defaultSetup = getDefaultSetupCatalog();
  const defaultSoul = getDefaultSoulConfig();

  const normalizedMode =
    typeof mode === "string" && MODE_DATA[mode] ? mode : "prototype";
  const normalizedViewMode =
    typeof viewMode === "string" && ["user", "technical"].includes(viewMode)
      ? viewMode
      : "user";
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
        : "Capture internal reusable baseline",
    notes:
      domain && typeof domain.notes === "string"
        ? domain.notes
        : "Focus on minimal-first visual planning with explicit phase gates.",
    project:
      domain && typeof domain.project === "string" ? domain.project : "umf-prototype",
    system: domain && typeof domain.system === "string" ? domain.system : "core-planner"
  };

  const normalizedSetup = {
    clients: normalizeCatalog(setup && setup.clients, defaultSetup.clients),
    templates: normalizeCatalog(setup && setup.templates, defaultSetup.templates),
    projects_by_client: cloneObjectOfArrays(
      setup && setup.projects_by_client,
      defaultSetup.projects_by_client
    ),
    systems_by_client_project: cloneObjectOfArrays(
      setup && setup.systems_by_client_project,
      defaultSetup.systems_by_client_project
    ),
    task_states: normalizeCatalog(setup && setup.task_states, defaultSetup.task_states),
    task_templates: [],
    project_status_by_key:
      setup && setup.project_status_by_key && typeof setup.project_status_by_key === "object"
        ? setup.project_status_by_key
        : { ...defaultSetup.project_status_by_key }
  };

  const normalizedSoul = {
    enabled:
      soul && typeof soul.enabled === "boolean" ? soul.enabled : defaultSoul.enabled,
    profile: normalizeSoulProfile(soul && soul.profile),
    recommendation_mode: normalizeRecommendationMode(
      soul && soul.recommendation_mode
    ),
    principles_anchor:
      soul && typeof soul.principles_anchor === "string" && soul.principles_anchor.trim()
        ? soul.principles_anchor.trim()
        : defaultSoul.principles_anchor,
    inheritance_source:
      soul && typeof soul.inheritance_source === "string" && soul.inheritance_source.trim()
        ? soul.inheritance_source.trim()
        : defaultSoul.inheritance_source,
    capabilities: {
      enabled: normalizeCatalog(
        soul && soul.capabilities && soul.capabilities.enabled,
        defaultSoul.capabilities.enabled
      ),
      disabled: normalizeCatalog(
        soul && soul.capabilities && soul.capabilities.disabled,
        defaultSoul.capabilities.disabled
      )
    },
    learning_budget: {
      max_suggestions_per_cycle: Math.max(
        1,
        Math.min(
          20,
          Number(
            soul &&
              soul.learning_budget &&
              soul.learning_budget.max_suggestions_per_cycle
              ? soul.learning_budget.max_suggestions_per_cycle
              : defaultSoul.learning_budget.max_suggestions_per_cycle
          )
        )
      )
    },
    risk_threshold: {
      auto_block_level: normalizeRiskLevel(
        soul && soul.risk_threshold && soul.risk_threshold.auto_block_level
      )
    },
    audit: {
      last_inheritance_check:
        soul &&
        soul.audit &&
        typeof soul.audit.last_inheritance_check === "string"
          ? soul.audit.last_inheritance_check
          : ""
    },
    identity_manifest: {
      master_identity_file:
        soul &&
        soul.identity_manifest &&
        typeof soul.identity_manifest.master_identity_file === "string" &&
        soul.identity_manifest.master_identity_file.trim()
          ? soul.identity_manifest.master_identity_file.trim()
          : defaultSoul.identity_manifest.master_identity_file,
      generated_identity_template:
        soul &&
        soul.identity_manifest &&
        typeof soul.identity_manifest.generated_identity_template === "string" &&
        soul.identity_manifest.generated_identity_template.trim()
          ? soul.identity_manifest.generated_identity_template.trim()
          : defaultSoul.identity_manifest.generated_identity_template,
      required_for_generated_projects:
        soul &&
        soul.identity_manifest &&
        typeof soul.identity_manifest.required_for_generated_projects === "boolean"
          ? soul.identity_manifest.required_for_generated_projects
          : defaultSoul.identity_manifest.required_for_generated_projects,
      generated_identity_file:
        soul &&
        soul.identity_manifest &&
        typeof soul.identity_manifest.generated_identity_file === "string" &&
        soul.identity_manifest.generated_identity_file.trim()
          ? soul.identity_manifest.generated_identity_file.trim()
          : defaultSoul.identity_manifest.generated_identity_file,
      instruction_scope_rule:
        soul &&
        soul.identity_manifest &&
        typeof soul.identity_manifest.instruction_scope_rule === "string" &&
        soul.identity_manifest.instruction_scope_rule.trim()
          ? soul.identity_manifest.instruction_scope_rule.trim()
          : defaultSoul.identity_manifest.instruction_scope_rule
    },
    evolution: {
      suggestions:
        soul &&
        soul.evolution &&
        Array.isArray(soul.evolution.suggestions)
          ? soul.evolution.suggestions
              .filter((item) => item && typeof item === "object" && typeof item.id === "string")
              .map((item) => ({
                id: String(item.id),
                title: String(item.title || "Untitled suggestion"),
                reason: String(item.reason || "No reason provided."),
                type: String(item.type || "workflow_governance_update"),
                risk: normalizeRiskLevel(item.risk),
                proposed_action: String(item.proposed_action || "none"),
                status: ["pending", "deferred", "accepted", "rejected"].includes(item.status)
                  ? item.status
                  : "pending",
                created_at: String(item.created_at || ""),
                last_seen_at: String(item.last_seen_at || ""),
                decided_at: String(item.decided_at || "")
              }))
          : [],
      history:
        soul && soul.evolution && Array.isArray(soul.evolution.history)
          ? soul.evolution.history
          : [],
      last_scanned_at:
        soul && soul.evolution && typeof soul.evolution.last_scanned_at === "string"
          ? soul.evolution.last_scanned_at
          : ""
    }
  };

  const normalizedTaskTemplates = Array.isArray(setup && setup.task_templates)
    ? setup.task_templates
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "New task",
          state: normalizedSetup.task_states.includes(item.state)
            ? item.state
            : normalizedSetup.task_states[0],
          priority: normalizePriority(item.priority)
        }))
    : [];

  normalizedSetup.task_templates =
    normalizedTaskTemplates.length > 0
      ? normalizedTaskTemplates
      : defaultSetup.task_templates.map((item) => ({ ...item }));

  let normalizedTasks = getDefaultTaskModel();
  if (Array.isArray(tasks)) {
    const sanitized = tasks
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        state: normalizedSetup.task_states.includes(item.state)
          ? item.state
          : normalizedSetup.task_states[0],
        priority: ["high", "medium", "low"].includes(item.priority)
          ? item.priority
          : "medium"
      }))
      .filter((item) => item.title.trim().length > 0);

    if (sanitized.length > 0) {
      normalizedTasks = sanitized;
    }
  }

  if (!normalizedSetup.clients.includes(normalizedDomain.client)) {
    normalizedSetup.clients.push(normalizedDomain.client);
  }

  if (!normalizedSetup.projects_by_client[normalizedDomain.client]) {
    normalizedSetup.projects_by_client[normalizedDomain.client] = [normalizedDomain.project];
  } else if (!normalizedSetup.projects_by_client[normalizedDomain.client].includes(normalizedDomain.project)) {
    normalizedSetup.projects_by_client[normalizedDomain.client].push(normalizedDomain.project);
  }

  const clientProjectKey = makeClientProjectKey(normalizedDomain.client, normalizedDomain.project);
  if (!normalizedSetup.systems_by_client_project[clientProjectKey]) {
    normalizedSetup.systems_by_client_project[clientProjectKey] = [normalizedDomain.system];
  } else if (!normalizedSetup.systems_by_client_project[clientProjectKey].includes(normalizedDomain.system)) {
    normalizedSetup.systems_by_client_project[clientProjectKey].push(normalizedDomain.system);
  }

  if (!normalizedSetup.templates.includes(normalizedDomain.goal)) {
    normalizedSetup.templates.push(normalizedDomain.goal);
  }

  return {
    schema_version: schemaVersion,
    mode: normalizedMode,
    view_mode: normalizedViewMode,
    filter: normalizedFilter,
    soul: normalizedSoul,
    domain: normalizedDomain,
    tasks: normalizedTasks,
    setup: normalizedSetup
  };
}

function buildDraftPayload() {
  return {
    schema_version: DRAFT_SCHEMA_VERSION,
    mode: currentMode,
    view_mode: currentViewMode,
    filter: currentFilter,
    soul: soulConfig,
    domain: {
      name: domainName.value,
      client: clientName.value,
      goal: prototypeGoal.value,
      notes: domainNotes.value,
      project: projectName.value,
      system: systemName.value
    },
    setup: {
      clients: setupCatalog.clients,
      templates: setupCatalog.templates,
      projects_by_client: setupCatalog.projects_by_client,
      systems_by_client_project: setupCatalog.systems_by_client_project,
      task_states: setupCatalog.task_states,
      task_templates: setupCatalog.task_templates,
      project_status_by_key: setupCatalog.project_status_by_key
    },
    tasks: taskModel
  };
}

function applyDraftPayload(payload) {
  const normalized = sanitizeDraft(payload);
  currentMode = normalized.mode;
  currentViewMode = normalized.view_mode;
  currentFilter = normalized.filter;
  setupCatalog = {
    clients: normalized.setup.clients.slice(),
    templates: normalized.setup.templates.slice(),
    projects_by_client: JSON.parse(JSON.stringify(normalized.setup.projects_by_client)),
    systems_by_client_project: JSON.parse(
      JSON.stringify(normalized.setup.systems_by_client_project)
    ),
    task_states: normalized.setup.task_states.slice(),
    task_templates: normalized.setup.task_templates.map((item) => ({ ...item })),
    project_status_by_key: JSON.parse(
      JSON.stringify(normalized.setup.project_status_by_key || {})
    )
  };
  soulConfig = JSON.parse(JSON.stringify(normalized.soul));

  ensureSetupIntegrity();
  syncSetupInputsFromCatalog();
  syncSoulInputsFromConfig();
  renderSetupDropdowns(
    normalized.domain.client,
    normalized.domain.project,
    normalized.domain.system,
    normalized.domain.goal
  );
  domainName.value = normalized.domain.name;
  domainNotes.value = normalized.domain.notes;
  taskModel = normalized.tasks;

  setActiveModeButton(currentMode);
  applyViewMode(currentViewMode);
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

function toSlug(value, fallback) {
  const raw = (value || "").trim().toLowerCase();
  const normalized = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function buildPromptStructure() {
  const client = toSlug(clientName.value, "internal");
  const domain = toSlug(domainName.value, "domain");
  const project = toSlug(projectName.value, "umf-prototype");
  const system = toSlug(systemName.value, "core-planner");

  return [
    "workspace/",
    "  domains/",
    `    ${domain}/`,
    "      clients/",
    `        ${client}/`,
    `          projects/${project}/`,
    `          systems/${system}/`,
    "          outputs/",
    "          docs/",
    "  shared/",
    "    templates/",
    "    interface_patterns/",
    "  foundry/",
    "    philosophy/",
    "    metaframework/",
    "    generators/"
  ].join("\n");
}

function renderPromptStructurePreview() {
  promptStructurePreview.textContent = buildPromptStructure();
}

function buildCopilotReadiness() {
  const domainReady = domainName.value.trim().length > 0;
  const clientReady = clientName.value.trim().length > 0;
  const projectReady = projectName.value.trim().length > 0;
  const systemReady = systemName.value.trim().length > 0;
  const goalReady = prototypeGoal.value.trim().length > 0;
  const taskStateReady = setupCatalog.task_states.length > 0;
  const taskTemplateReady = setupCatalog.task_templates.length > 0;
  const hasTodoTask = taskModel.some(
    (item) => item.state === currentFilter && item.title.trim().length > 0
  );
  const hasNoBlankTitles = taskModel.every((item) => item.title.trim().length > 0);
  const identityManifest = soulConfig.identity_manifest || {};
  const generatedSoulIdentityPlanned =
    !identityManifest.required_for_generated_projects ||
    (typeof identityManifest.generated_identity_file === "string" &&
      identityManifest.generated_identity_file.trim().length > 0);

  const checks = [
    {
      id: "domain_context",
      label: "Domain context is complete (domain/client/project/system)",
      pass: domainReady && clientReady && projectReady && systemReady
    },
    {
      id: "goal_present",
      label: "Prompt goal is defined",
      pass: goalReady
    },
    {
      id: "todo_available",
      label: "At least one task exists for the selected state filter",
      pass: hasTodoTask
    },
    {
      id: "task_states",
      label: "Task state catalog is configured",
      pass: taskStateReady
    },
    {
      id: "task_templates",
      label: "Task template catalog is configured",
      pass: taskTemplateReady
    },
    {
      id: "task_titles",
      label: "Task titles are non-empty",
      pass: hasNoBlankTitles
    },
    {
      id: "policy_deferred",
      label: "Execution policy remains prompt-only and deferred",
      pass: true
    },
    {
      id: "generated_soul_identity",
      label: "Generated project soul identity file is planned when required",
      pass: generatedSoulIdentityPlanned
    }
  ];

  return {
    ready: checks.every((item) => item.pass),
    checks
  };
}

function renderCopilotReadiness() {
  const readiness = buildCopilotReadiness();
  copilotReadiness.innerHTML = "";

  for (const item of readiness.checks) {
    const li = document.createElement("li");
    li.textContent = `${item.pass ? "[ok]" : "[pending]"} ${item.label}`;
    copilotReadiness.appendChild(li);
  }
}

function renderStatusFilters() {
  setSelectOptions(statusClientFilter, ["all", ...setupCatalog.clients], statusClientFilter.value || "all");

  const scopedProjects =
    statusClientFilter.value === "all"
      ? uniqueStrings(
          setupCatalog.clients.flatMap((client) => getProjectsForClient(client))
        )
      : getProjectsForClient(statusClientFilter.value);

  setSelectOptions(statusProjectFilter, ["all", ...scopedProjects], statusProjectFilter.value || "all");
  setSelectOptions(statusStateFilter, ["all", ...setupCatalog.task_states], statusStateFilter.value || "all");
}

function collectProjectStatusRows() {
  const rows = [];

  for (const client of setupCatalog.clients) {
    for (const project of getProjectsForClient(client)) {
      for (const system of getSystemsForClientProject(client, project)) {
        const statusKey = makeProjectSystemKey(client, project, system);
        const statusEntry = setupCatalog.project_status_by_key[statusKey] || {
          status: "active",
          phase: `${currentMode}_mode`,
          updated_by: "system",
          last_updated: ""
        };

        const scopedTasks = taskModel.filter((item) => setupCatalog.task_states.includes(item.state));
        const stateCounts = Object.fromEntries(
          setupCatalog.task_states.map((state) => [
            state,
            scopedTasks.filter((item) => item.state === state).length
          ])
        );

        rows.push({
          key: statusKey,
          client,
          project,
          system,
          state_counts: stateCounts,
          status: statusEntry.status,
          phase: statusEntry.phase,
          updated_by: statusEntry.updated_by,
          last_updated: statusEntry.last_updated
        });
      }
    }
  }

  return rows;
}

function renderProjectStatusView() {
  const clientFilter = statusClientFilter.value || "all";
  const projectFilter = statusProjectFilter.value || "all";
  const stateFilterValue = statusStateFilter.value || "all";

  const rows = collectProjectStatusRows().filter((row) => {
    if (clientFilter !== "all" && row.client !== clientFilter) {
      return false;
    }

    if (projectFilter !== "all" && row.project !== projectFilter) {
      return false;
    }

    if (stateFilterValue !== "all" && row.state_counts[stateFilterValue] === 0) {
      return false;
    }

    return true;
  });

  projectStatusSummary.textContent =
    `Showing ${rows.length} project(s) | Client: ${clientFilter} | Project: ${projectFilter} | State: ${stateFilterValue}`;

  projectStatusView.innerHTML = "";
  for (const row of rows) {
    const card = document.createElement("article");
    card.className = "status-card";
    card.innerHTML = `
      <h3>${row.client} / ${row.project} / ${row.system}</h3>
      <p>Status: ${row.status} | Phase: ${row.phase}</p>
      <p>Updated by: ${row.updated_by || "n/a"} | Last updated: ${row.last_updated || "not set"}</p>
      <p>State counts: ${Object.entries(row.state_counts)
        .map(([state, count]) => `${state}=${count}`)
        .join(", ")}</p>
    `;
    projectStatusView.appendChild(card);
  }

  projectStatusJson.textContent = JSON.stringify(
    {
      filters: {
        client: clientFilter,
        project: projectFilter,
        state: stateFilterValue
      },
      total_projects: rows.length,
      projects: rows
    },
    null,
    2
  );
}

function renderPromptPacketSummary(payload) {
  const lines = [
    {
      title: "Context",
      text: `${payload.domain.client} / ${payload.domain.project} / ${payload.domain.system}`
    },
    {
      title: "Mode and Gate",
      text: `${payload.phase} | ${payload.current_gate}`
    },
    {
      title: "Soul Brain",
      text: `${payload.soul.profile} | ${payload.soul.recommendation_mode} | enabled=${payload.soul.enabled}`
    },
    {
      title: "Evolution Inbox",
      text: `${payload.soul.evolution_inbox.pending_count} pending suggestion(s)`
    },
    {
      title: "Template",
      text: payload.domain.prototype_goal
    },
    {
      title: "Selected Tasks",
      text: `${payload.selected_tasks.length} task(s) in state filter ${payload.selected_state}`
    },
    {
      title: "Copilot Handoff",
      text: payload.copilot_handoff.ready ? "Ready" : "Pending checks"
    },
    {
      title: "Next Recommendation",
      text: payload.next_recommendation
    }
  ];

  promptPacketSummary.innerHTML = "";
  for (const line of lines) {
    const card = document.createElement("article");
    card.className = "status-card";
    card.innerHTML = `<h3>${line.title}</h3><p>${line.text}</p>`;
    promptPacketSummary.appendChild(card);
  }
}

function buildProjectBundle() {
  const client = clientName.value;
  const project = projectName.value;
  const system = systemName.value;
  const projectSystemKey = makeProjectSystemKey(client, project, system);

  return {
    bundle_type: "umf_project_bundle",
    bundle_version: 1,
    exported_at: nowIso(),
    schema_version: DRAFT_SCHEMA_VERSION,
    project_identity: {
      domain: domainName.value,
      client,
      project,
      system
    },
    domain: {
      name: domainName.value,
      client,
      goal: prototypeGoal.value,
      notes: domainNotes.value,
      project,
      system
    },
    soul: soulConfig,
    setup_subset: {
      clients: [client],
      projects_by_client: {
        [client]: getProjectsForClient(client)
      },
      systems_by_client_project: {
        [makeClientProjectKey(client, project)]: getSystemsForClientProject(client, project)
      },
      task_states: setupCatalog.task_states,
      task_templates: setupCatalog.task_templates,
      project_status_by_key: {
        [projectSystemKey]:
          setupCatalog.project_status_by_key[projectSystemKey] || {
            status: "active",
            phase: `${currentMode}_mode`,
            updated_by: "system",
            last_updated: nowIso()
          }
      }
    },
    tasks: taskModel,
    provenance: {
      export_reason: "portable_project_handoff",
      source: "foundry"
    }
  };
}

function mergeProjectBundle(bundle) {
  if (!bundle || bundle.bundle_type !== "umf_project_bundle") {
    throw new Error("Invalid project bundle type.");
  }

  const identity = bundle.project_identity || {};
  const domain = bundle.domain || {};
  const soul = bundle.soul;
  const setupSubset = bundle.setup_subset || {};
  const client = String(identity.client || domain.client || "internal");
  const project = String(identity.project || domain.project || "umf-prototype");
  const system = String(identity.system || domain.system || "core-planner");

  setupCatalog.clients = uniqueStrings([...setupCatalog.clients, client]);
  setupCatalog.templates = uniqueStrings([
    ...setupCatalog.templates,
    ...(domain.goal ? [String(domain.goal)] : [])
  ]);

  setupCatalog.task_states = uniqueStrings([
    ...setupCatalog.task_states,
    ...normalizeCatalog(setupSubset.task_states, [])
  ]);

  const currentProjects = setupCatalog.projects_by_client[client] || [];
  const incomingProjects = normalizeCatalog(
    setupSubset.projects_by_client && setupSubset.projects_by_client[client],
    [project]
  );
  setupCatalog.projects_by_client[client] = uniqueStrings([...currentProjects, ...incomingProjects, project]);

  const clientProjectKey = makeClientProjectKey(client, project);
  const currentSystems = setupCatalog.systems_by_client_project[clientProjectKey] || [];
  const incomingSystems = normalizeCatalog(
    setupSubset.systems_by_client_project && setupSubset.systems_by_client_project[clientProjectKey],
    [system]
  );
  setupCatalog.systems_by_client_project[clientProjectKey] = uniqueStrings([
    ...currentSystems,
    ...incomingSystems,
    system
  ]);

  const incomingTemplates = Array.isArray(setupSubset.task_templates)
    ? setupSubset.task_templates.map((item) => ({
        title: String(item.title || "New task"),
        state: setupCatalog.task_states.includes(item.state)
          ? item.state
          : setupCatalog.task_states[0],
        priority: normalizePriority(item.priority)
      }))
    : [];

  const mergedTemplateMap = new Map(
    setupCatalog.task_templates.map((item) => [
      `${item.title}|${item.state}|${item.priority}`,
      item
    ])
  );
  for (const item of incomingTemplates) {
    mergedTemplateMap.set(`${item.title}|${item.state}|${item.priority}`, item);
  }
  setupCatalog.task_templates = Array.from(mergedTemplateMap.values());

  const incomingTasks = Array.isArray(bundle.tasks)
    ? bundle.tasks.map((item) => ({
        title: String(item.title || "").trim(),
        state: setupCatalog.task_states.includes(item.state)
          ? item.state
          : setupCatalog.task_states[0],
        priority: normalizePriority(item.priority)
      }))
    : [];

  const taskMap = new Map(taskModel.map((item) => [`${item.title}|${item.state}|${item.priority}`, item]));
  for (const item of incomingTasks) {
    if (item.title) {
      taskMap.set(`${item.title}|${item.state}|${item.priority}`, item);
    }
  }
  taskModel = Array.from(taskMap.values());

  const projectSystemKey = makeProjectSystemKey(client, project, system);
  const incomingStatus =
    setupSubset.project_status_by_key &&
    setupSubset.project_status_by_key[projectSystemKey];
  setupCatalog.project_status_by_key[projectSystemKey] = incomingStatus || {
    status: "active",
    phase: `${currentMode}_mode`,
    updated_by: "bundle_import",
    last_updated: nowIso()
  };

  domainName.value = String(domain.name || domainName.value || "Universal Meta-Foundry");
  domainNotes.value = String(domain.notes || domainNotes.value || "");
  if (soul && typeof soul === "object") {
    soulConfig = sanitizeDraft({
      mode: currentMode,
      view_mode: currentViewMode,
      filter: currentFilter,
      domain: {
        name: domainName.value,
        client,
        goal: String(domain.goal || prototypeGoal.value),
        notes: domainNotes.value,
        project,
        system
      },
      setup: setupCatalog,
      tasks: taskModel,
      soul
    }).soul;
    syncSoulInputsFromConfig();
  }

  ensureSetupIntegrity();
  renderSetupDropdowns(client, project, system, String(domain.goal || prototypeGoal.value));
}

function renderPacket(mode, data) {
  runEvolutionScan();
  renderEvolutionInbox();
  const visibleTasks = getFilteredTasks();
  const promptStructure = buildPromptStructure();
  const readiness = buildCopilotReadiness();
  const statusRows = collectProjectStatusRows();
  const promptTarget = {
    domain: toSlug(domainName.value, "domain"),
    client: toSlug(clientName.value, "internal"),
    project: toSlug(projectName.value, "umf-prototype"),
    system: toSlug(systemName.value, "core-planner")
  };

  const payload = {
      phase: `${mode}_mode`,
      view_mode: currentViewMode,
      soul: {
        ...soulConfig,
        active_capabilities: effectiveCapabilities(soulConfig),
        evolution_inbox: {
          pending_count: soulConfig.evolution.suggestions.filter(
            (item) => item.status === "pending" || item.status === "deferred"
          ).length,
          last_scanned_at: soulConfig.evolution.last_scanned_at
        }
      },
      soul_identity_manifest: {
        master_identity_file: soulConfig.identity_manifest.master_identity_file,
        generated_identity_template: soulConfig.identity_manifest.generated_identity_template,
        required_for_generated_projects:
          soulConfig.identity_manifest.required_for_generated_projects,
        generated_identity_file: soulConfig.identity_manifest.generated_identity_file,
        instruction_scope_rule: soulConfig.identity_manifest.instruction_scope_rule
      },
      current_gate: data.gate,
      domain: {
        name: domainName.value.trim(),
        client: clientName.value.trim(),
        prototype_goal: prototypeGoal.value.trim(),
        notes: domainNotes.value.trim(),
        project: projectName.value.trim(),
        system: systemName.value.trim()
      },
      prompt_target: promptTarget,
      prompt_outline: promptStructure.split("\n"),
      setup_catalog: {
        clients: setupCatalog.clients,
        templates: setupCatalog.templates,
        projects_by_client: setupCatalog.projects_by_client,
        systems_by_client_project: setupCatalog.systems_by_client_project,
        task_states: setupCatalog.task_states,
        task_templates: setupCatalog.task_templates
      },
      reuse_strategy: {
        mode: "internal_first_examples",
        internal_capture_client: "internal",
        selected_template: prototypeGoal.value,
        rollout_policy: "reuse_internal_example_then_apply_to_client"
      },
      project_status_tracking: {
        rows: statusRows,
        copilot_must_update_status: true
      },
      execution_policy: "prompt_only",
      copilot_execution: "deferred",
      copilot_handoff: {
        ready: readiness.ready,
        requires_status_update: true,
        checklist: readiness.checks.map((item) => ({
          id: item.id,
          label: item.label,
          pass: item.pass
        }))
      },
      selected_tasks: visibleTasks,
      selected_state: currentFilter,
      acceptance_checks: data.checks,
      next_recommendation:
        mode === "prototype"
          ? "Refine prompt packet, then start Copilot generation in a later cycle"
          : "Continue refining prompt quality and gate readiness before execution"
    };

  renderPromptPacketSummary(payload);
  packet.textContent = JSON.stringify(payload, null, 2);
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
    for (const state of setupCatalog.task_states) {
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
  renderPromptStructurePreview();
  renderStatusFilters();
  renderProjectStatusView();
  renderCopilotReadiness();
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
  const selectedIndex = Number(taskTemplateSelect.value || 0);
  const selectedTemplate = setupCatalog.task_templates[selectedIndex] || {
    title: "New task",
    state: currentFilter,
    priority: "medium"
  };

  taskModel.push({
    title: selectedTemplate.title,
    state: selectedTemplate.state,
    priority: selectedTemplate.priority
  });

  renderTaskBoard();
  refreshDerivedViews();
  setDraftStatus("Task added from template list.");
});

refreshStatusBtn.addEventListener("click", () => {
  renderStatusFilters();
  renderProjectStatusView();
  setDraftStatus("Project status view refreshed.");
});

copilotUpdateStatusBtn.addEventListener("click", () => {
  const client = statusClientFilter.value !== "all" ? statusClientFilter.value : clientName.value;
  const project = statusProjectFilter.value !== "all" ? statusProjectFilter.value : projectName.value;
  const system = systemName.value;
  const key = makeProjectSystemKey(client, project, system);

  setupCatalog.project_status_by_key[key] = {
    status: "copilot_updated",
    phase: `${currentMode}_mode`,
    updated_by: "copilot",
    last_updated: nowIso()
  };

  refreshDerivedViews();
  setDraftStatus("Project status updated by Copilot action.");
});

exportDraftBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(buildDraftPayload(), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "umf-prompt-draft.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setDraftStatus("Prompt draft exported to JSON file.");
});

exportProjectBundleBtn.addEventListener("click", () => {
  const bundle = buildProjectBundle();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `umf-project-bundle-${toSlug(clientName.value, "client")}-${toSlug(
    projectName.value,
    "project"
  )}-${toSlug(systemName.value, "system")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setDraftStatus("Project bundle exported.");
});

importProjectBundleBtn.addEventListener("click", () => {
  importProjectBundleInput.click();
});

importProjectBundleInput.addEventListener("change", async () => {
  const file = importProjectBundleInput.files && importProjectBundleInput.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const bundle = JSON.parse(text);
    mergeProjectBundle(bundle);
    renderTaskBoard();
    refreshDerivedViews();
    setDraftStatus("Project bundle imported and merged into main JSON.");
  } catch {
    setDraftStatus("Project bundle import failed. Provide a valid project bundle JSON.");
  } finally {
    importProjectBundleInput.value = "";
  }
});

applyClientCatalogBtn.addEventListener("click", () => {
  const defaultSetup = getDefaultSetupCatalog();
  const selectedClient = clientName.value;
  const selectedProject = projectName.value;
  const selectedSystem = systemName.value;
  const selectedTemplate = prototypeGoal.value;

  setupCatalog.clients = parseCatalogText(clientCatalog.value, defaultSetup.clients);

  for (const client of setupCatalog.clients) {
    if (!setupCatalog.projects_by_client[client]) {
      setupCatalog.projects_by_client[client] = ["umf-prototype"];
    }
  }

  renderSetupDropdowns(selectedClient, selectedProject, selectedSystem, selectedTemplate);
  refreshDerivedViews();
  setDraftStatus("Client catalog applied.");
});

applyProjectCatalogBtn.addEventListener("click", () => {
  const selectedClient = clientName.value;
  const selectedProject = projectName.value;
  const selectedSystem = systemName.value;
  const selectedTemplate = prototypeGoal.value;

  setupCatalog.projects_by_client[selectedClient] = parseCatalogText(projectCatalog.value, [
    "umf-prototype"
  ]);

  renderSetupDropdowns(selectedClient, selectedProject, selectedSystem, selectedTemplate);
  refreshDerivedViews();
  setDraftStatus("Project catalog applied for selected client.");
});

applySystemCatalogBtn.addEventListener("click", () => {
  const selectedClient = clientName.value;
  const selectedProject = projectName.value;
  const selectedSystem = systemName.value;
  const selectedTemplate = prototypeGoal.value;
  const key = makeClientProjectKey(selectedClient, selectedProject);

  setupCatalog.systems_by_client_project[key] = parseCatalogText(systemCatalog.value, [
    "core-planner"
  ]);

  renderSetupDropdowns(selectedClient, selectedProject, selectedSystem, selectedTemplate);
  refreshDerivedViews();
  setDraftStatus("Sub-part catalog applied for selected client and project.");
});

applyTemplateCatalogBtn.addEventListener("click", () => {
  const selectedClient = clientName.value;
  const selectedProject = projectName.value;
  const selectedSystem = systemName.value;
  const selectedTemplate = prototypeGoal.value;
  const defaultSetup = getDefaultSetupCatalog();

  setupCatalog.templates = parseCatalogText(templateCatalog.value, defaultSetup.templates);

  renderSetupDropdowns(selectedClient, selectedProject, selectedSystem, selectedTemplate);
  refreshDerivedViews();
  setDraftStatus("Prototype template catalog applied.");
});

applyStateCatalogBtn.addEventListener("click", () => {
  const defaultSetup = getDefaultSetupCatalog();
  setupCatalog.task_states = parseCatalogText(stateCatalog.value, defaultSetup.task_states);

  if (!setupCatalog.task_states.includes(currentFilter)) {
    currentFilter = setupCatalog.task_states[0];
  }

  taskModel = taskModel.map((item) => ({
    ...item,
    state: setupCatalog.task_states.includes(item.state)
      ? item.state
      : setupCatalog.task_states[0]
  }));

  setupCatalog.task_templates = setupCatalog.task_templates.map((item) => ({
    ...item,
    state: setupCatalog.task_states.includes(item.state)
      ? item.state
      : setupCatalog.task_states[0]
  }));

  renderSetupDropdowns(clientName.value, projectName.value, systemName.value, prototypeGoal.value);
  renderTaskBoard();
  refreshDerivedViews();
  setDraftStatus("Task state catalog applied.");
});

applyTaskTemplateCatalogBtn.addEventListener("click", () => {
  const parsed = parseTaskTemplatesText(taskTemplateCatalog.value, setupCatalog.task_states);
  if (parsed.length > 0) {
    setupCatalog.task_templates = parsed;
  }

  renderTaskTemplateSelect();
  refreshDerivedViews();
  setDraftStatus("Task template catalog applied.");
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
      setDraftStatus("Prompt draft imported from JSON.");
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
  currentFilter = setupCatalog.task_states[0] || "todo";
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

for (const input of [
  domainName,
  domainNotes,
]) {
  input.addEventListener("input", () => {
    renderPromptStructurePreview();
    renderPacket(currentMode, MODE_DATA[currentMode]);
    persistState();
  });
}

for (const select of [prototypeGoal, systemName]) {
  select.addEventListener("change", () => {
    renderPromptStructurePreview();
    syncProjectSystemCatalogInputs();
    renderPacket(currentMode, MODE_DATA[currentMode]);
    persistState();
  });
}

viewModeSelect.addEventListener("change", () => {
  applyViewMode(viewModeSelect.value);
  refreshDerivedViews();
  setDraftStatus(
    currentViewMode === "technical"
      ? "Technical view enabled. JSON detail panels are visible."
      : "User view enabled. Human-readable summaries are prioritized."
  );
});

for (const element of [
  soulEnabled,
  soulRecommendationMode,
  soulMaxSuggestions,
  soulPrinciplesAnchor,
  soulInheritanceSource,
  soulCapabilitiesEnabled,
  soulCapabilitiesDisabled
]) {
  const eventName = element.tagName === "TEXTAREA" || element.type === "text" ? "input" : "change";
  element.addEventListener(eventName, () => {
    updateSoulConfigFromInputs();
    refreshDerivedViews();
    setDraftStatus("Soul Brain configuration updated.");
  });
}

soulProfile.addEventListener("change", () => {
  applySoulProfilePreset(soulProfile.value);
  refreshDerivedViews();
  setDraftStatus("Soul profile preset applied.");
});

clientName.addEventListener("change", () => {
  const selectedClient = clientName.value;
  setSelectOptions(projectName, getProjectsForClient(selectedClient), projectName.value);
  setSelectOptions(
    systemName,
    getSystemsForClientProject(selectedClient, projectName.value),
    systemName.value
  );
  syncProjectSystemCatalogInputs();
  refreshDerivedViews();
});

projectName.addEventListener("change", () => {
  const selectedClient = clientName.value;
  const selectedProject = projectName.value;
  setSelectOptions(
    systemName,
    getSystemsForClientProject(selectedClient, selectedProject),
    systemName.value
  );
  syncProjectSystemCatalogInputs();
  refreshDerivedViews();
});

for (const select of [statusClientFilter, statusProjectFilter, statusStateFilter]) {
  select.addEventListener("change", () => {
    renderStatusFilters();
    renderProjectStatusView();
    persistState();
  });
}

setDefaultDomainFields();
loadPersistedState();
applyViewMode(currentViewMode);
syncSoulInputsFromConfig();
runEvolutionScan();
renderEvolutionInbox();
setActiveModeButton(currentMode);
renderTaskBoard();
updateMode(currentMode);
setDraftStatus("Draft ready.");
