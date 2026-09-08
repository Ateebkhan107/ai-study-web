import "server-only";

export const ZI_VISUAL_TYPES = [
  "comparison",
  "flow",
  "timeline",
  "process_steps",
  "concept_map",
  "simple_graph",
  "labeled_diagram",
  "data_table",
];

export const ZI_INTERACTION_TYPES = [
  "step_reveal",
  "label_reveal",
  "node_inspect",
  "row_reveal",
  "quick_quiz",
  "graph_parameter",
];

const VISUAL_KEYS = new Set(["type", "visual"]);
const BASE_KEYS = new Set(["visualType", "title", "interaction"]);
const MAX_TITLE_LENGTH = 100;
const MAX_LABEL_LENGTH = 100;
const MAX_DETAIL_LENGTH = 300;
const MAX_NODES = 12;
const MAX_EDGES = 16;
const MAX_EVENTS = 10;
const MAX_STEPS = 10;
const MAX_GRAPH_POINTS = 50;
const MAX_TABLE_COLUMNS = 5;
const MAX_TABLE_ROWS = 10;
const MAX_COMPARISON_COLUMNS = 3;
const MAX_COMPARISON_ITEMS = 8;
const MAX_BRANCHES = 8;
const MAX_BRANCH_CHILDREN = 8;
const MAX_QUIZ_QUESTIONS = 3;
const MAX_QUIZ_OPTIONS = 4;
const MAX_GRAPH_PARAMETERS = 3;
const MAX_PARAM_ABS_VALUE = 100;
const ALLOWED_DIAGRAM_KINDS = new Set(["radial", "layered", "horizontal", "vertical"]);
const ALLOWED_POSITIONS = new Set(["center", "outer", "middle", "left", "right", "top", "bottom"]);
const ALLOWED_GRAPH_KINDS = new Set(["quadratic", "linear", "exponential", "sine"]);
const GRAPH_PARAM_KEYS = {
  quadratic: new Set(["a", "b", "c"]),
  linear: new Set(["m", "b"]),
  exponential: new Set(["a", "b", "c"]),
  sine: new Set(["a", "b", "c"]),
};

const INTERACTION_COMPATIBILITY = {
  step_reveal: new Set(["timeline", "process_steps", "flow"]),
  label_reveal: new Set(["labeled_diagram"]),
  node_inspect: new Set(["concept_map", "flow"]),
  row_reveal: new Set(["comparison", "data_table"]),
  quick_quiz: new Set(["comparison", "process_steps", "concept_map", "labeled_diagram", "data_table"]),
  graph_parameter: new Set(["simple_graph"]),
};

function hasOnlyAllowedKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function hasUnsafeText(value) {
  return /<\s*\/?\s*(script|iframe|style|svg|object|embed|canvas|html|body|img|video|audio)\b/i.test(value);
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || hasUnsafeText(text)) return "";
  return text.slice(0, maxLength);
}

function cleanId(value) {
  const id = cleanText(value, 40);
  return /^[a-zA-Z0-9_-]{1,40}$/.test(id) ? id : "";
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function boundedNumber(value) {
  const number = finiteNumber(value);
  if (number === null || Math.abs(number) > MAX_PARAM_ABS_VALUE) return null;
  return number;
}

function validateBase(visual, allowedKeys) {
  if (!visual || typeof visual !== "object" || Array.isArray(visual)) return null;
  if (!hasOnlyAllowedKeys(visual, allowedKeys)) return null;
  const visualType = ZI_VISUAL_TYPES.includes(visual.visualType) ? visual.visualType : null;
  const title = cleanText(visual.title, MAX_TITLE_LENGTH);
  if (!visualType || !title) return null;
  return { visualType, title };
}

function validateComparison(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "columns"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.columns)) return null;
  if (visual.columns.length < 2 || visual.columns.length > MAX_COMPARISON_COLUMNS) return null;

  const columns = visual.columns.map((column) => {
    if (!column || typeof column !== "object" || Array.isArray(column)) return null;
    if (!hasOnlyAllowedKeys(column, new Set(["label", "items"]))) return null;
    const label = cleanText(column.label, MAX_LABEL_LENGTH);
    if (!label || !Array.isArray(column.items) || column.items.length > MAX_COMPARISON_ITEMS) return null;
    const items = column.items.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      if (!hasOnlyAllowedKeys(item, new Set(["label", "value"]))) return null;
      const itemLabel = cleanText(item.label, MAX_LABEL_LENGTH);
      const value = cleanText(item.value, MAX_DETAIL_LENGTH);
      return itemLabel && value ? { label: itemLabel, value } : null;
    });
    if (items.some((item) => !item)) return null;
    return { label, items };
  });

  if (columns.some((column) => !column)) return null;
  return { ...base, columns };
}

function validateFlow(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "nodes", "edges"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.nodes) || !Array.isArray(visual.edges)) return null;
  if (visual.nodes.length < 2 || visual.nodes.length > MAX_NODES || visual.edges.length > MAX_EDGES) return null;

  const ids = new Set();
  const nodes = visual.nodes.map((node) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return null;
    if (!hasOnlyAllowedKeys(node, new Set(["id", "label", "detail"]))) return null;
    const id = cleanId(node.id);
    const label = cleanText(node.label, MAX_LABEL_LENGTH);
    const detail = cleanText(node.detail, MAX_DETAIL_LENGTH) || undefined;
    if (!id || !label || ids.has(id)) return null;
    ids.add(id);
    return detail ? { id, label, detail } : { id, label };
  });
  if (nodes.some((node) => !node)) return null;

  const edges = visual.edges.map((edge) => {
    if (!edge || typeof edge !== "object" || Array.isArray(edge)) return null;
    if (!hasOnlyAllowedKeys(edge, new Set(["from", "to", "label"]))) return null;
    const from = cleanId(edge.from);
    const to = cleanId(edge.to);
    const label = cleanText(edge.label, MAX_LABEL_LENGTH) || undefined;
    if (!from || !to || !ids.has(from) || !ids.has(to) || from === to) return null;
    return label ? { from, to, label } : { from, to };
  });

  if (edges.some((edge) => !edge)) return null;
  return { ...base, nodes, edges };
}

function validateTimeline(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "events"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.events)) return null;
  if (visual.events.length < 2 || visual.events.length > MAX_EVENTS) return null;

  const events = visual.events.map((event) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) return null;
    if (!hasOnlyAllowedKeys(event, new Set(["label", "description"]))) return null;
    const label = cleanText(event.label, MAX_LABEL_LENGTH);
    const description = cleanText(event.description, MAX_DETAIL_LENGTH);
    return label && description ? { label, description } : null;
  });

  if (events.some((event) => !event)) return null;
  return { ...base, events };
}

function validateProcessSteps(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "steps"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.steps)) return null;
  if (visual.steps.length < 2 || visual.steps.length > MAX_STEPS) return null;

  const steps = visual.steps.map((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return null;
    if (!hasOnlyAllowedKeys(step, new Set(["number", "label", "detail"]))) return null;
    const label = cleanText(step.label, MAX_LABEL_LENGTH);
    const detail = cleanText(step.detail, MAX_DETAIL_LENGTH);
    return label && detail ? { number: index + 1, label, detail } : null;
  });

  if (steps.some((step) => !step)) return null;
  return { ...base, steps };
}

function validateConceptMap(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "center", "branches"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.branches)) return null;
  if (visual.branches.length < 1 || visual.branches.length > MAX_BRANCHES) return null;
  const center = cleanText(visual.center, MAX_LABEL_LENGTH);
  if (!center) return null;

  const branches = visual.branches.map((branch) => {
    if (!branch || typeof branch !== "object" || Array.isArray(branch)) return null;
    if (!hasOnlyAllowedKeys(branch, new Set(["label", "children", "detail"]))) return null;
    const label = cleanText(branch.label, MAX_LABEL_LENGTH);
    const detail = cleanText(branch.detail, MAX_DETAIL_LENGTH) || undefined;
    if (!label || !Array.isArray(branch.children) || branch.children.length > MAX_BRANCH_CHILDREN) return null;
    const children = branch.children.map((child) => cleanText(child, MAX_LABEL_LENGTH)).filter(Boolean);
    if (children.length !== branch.children.length) return null;
    return detail ? { label, detail, children } : { label, children };
  });

  if (branches.some((branch) => !branch)) return null;
  return { ...base, center, branches };
}

function validateSimpleGraph(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "xLabel", "yLabel", "points", "graphKind", "params"]);
  const base = validateBase(visual, allowedKeys);
  if (!base) return null;

  const xLabel = cleanText(visual.xLabel, MAX_LABEL_LENGTH);
  const yLabel = cleanText(visual.yLabel, MAX_LABEL_LENGTH);
  if (!xLabel || !yLabel) return null;

  let points = null;
  if (visual.points !== undefined) {
    if (!Array.isArray(visual.points)) return null;
    if (visual.points.length < 2 || visual.points.length > MAX_GRAPH_POINTS) return null;
    points = visual.points.map((point) => {
      if (!point || typeof point !== "object" || Array.isArray(point)) return null;
      if (!hasOnlyAllowedKeys(point, new Set(["x", "y", "label"]))) return null;
      const x = finiteNumber(point.x);
      const y = finiteNumber(point.y);
      const label = cleanText(point.label, MAX_LABEL_LENGTH) || undefined;
      if (x === null || y === null) return null;
      return label ? { x, y, label } : { x, y };
    });
    if (points.some((point) => !point)) return null;
  }

  const graphKind = visual.graphKind && ALLOWED_GRAPH_KINDS.has(visual.graphKind)
    ? visual.graphKind
    : null;
  let params = null;
  if (visual.params !== undefined) {
    if (!graphKind || !visual.params || typeof visual.params !== "object" || Array.isArray(visual.params)) return null;
    const allowedParamKeys = GRAPH_PARAM_KEYS[graphKind];
    if (!hasOnlyAllowedKeys(visual.params, allowedParamKeys)) return null;
    params = {};
    for (const [key, value] of Object.entries(visual.params)) {
      const number = boundedNumber(value);
      if (number === null) return null;
      params[key] = number;
    }
  }

  if (!points && !graphKind) return null;
  return {
    ...base,
    xLabel,
    yLabel,
    ...(points ? { points } : {}),
    ...(graphKind ? { graphKind } : {}),
    ...(params ? { params } : {}),
  };
}

function validateLabeledDiagram(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "diagramKind", "centerLabel", "labels"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.labels)) return null;
  if (!ALLOWED_DIAGRAM_KINDS.has(visual.diagramKind)) return null;
  if (visual.labels.length < 1 || visual.labels.length > MAX_NODES) return null;
  const centerLabel = cleanText(visual.centerLabel, MAX_LABEL_LENGTH);
  if (!centerLabel) return null;

  const labels = visual.labels.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    if (!hasOnlyAllowedKeys(item, new Set(["label", "position"]))) return null;
    const label = cleanText(item.label, MAX_LABEL_LENGTH);
    const position = ALLOWED_POSITIONS.has(item.position) ? item.position : null;
    return label && position ? { label, position } : null;
  });

  if (labels.some((label) => !label)) return null;
  return { ...base, diagramKind: visual.diagramKind, centerLabel, labels };
}

function validateDataTable(visual) {
  const allowedKeys = new Set([...BASE_KEYS, "headers", "rows"]);
  const base = validateBase(visual, allowedKeys);
  if (!base || !Array.isArray(visual.headers) || !Array.isArray(visual.rows)) return null;
  if (visual.headers.length < 2 || visual.headers.length > MAX_TABLE_COLUMNS) return null;
  if (visual.rows.length < 1 || visual.rows.length > MAX_TABLE_ROWS) return null;

  const headers = visual.headers.map((header) => cleanText(header, MAX_LABEL_LENGTH));
  if (headers.some((header) => !header)) return null;

  const rows = visual.rows.map((row) => {
    if (!Array.isArray(row) || row.length !== headers.length) return null;
    const cells = row.map((cell) => cleanText(cell, MAX_DETAIL_LENGTH));
    return cells.some((cell) => !cell) ? null : cells;
  });

  if (rows.some((row) => !row)) return null;
  return { ...base, headers, rows };
}

function validateQuickQuiz(interaction) {
  if (!Array.isArray(interaction.questions)) return null;
  if (interaction.questions.length < 1 || interaction.questions.length > MAX_QUIZ_QUESTIONS) return null;

  const questions = interaction.questions.map((question) => {
    if (!question || typeof question !== "object" || Array.isArray(question)) return null;
    if (!hasOnlyAllowedKeys(question, new Set(["question", "options", "correctIndex", "explanation"]))) return null;
    const questionText = cleanText(question.question, MAX_DETAIL_LENGTH);
    const explanation = cleanText(question.explanation, MAX_DETAIL_LENGTH);
    if (!questionText || !explanation || !Array.isArray(question.options)) return null;
    if (question.options.length < 2 || question.options.length > MAX_QUIZ_OPTIONS) return null;
    const options = question.options.map((option) => cleanText(option, MAX_LABEL_LENGTH));
    const correctIndex = Number(question.correctIndex);
    if (
      options.some((option) => !option) ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= options.length
    ) {
      return null;
    }
    return { question: questionText, options, correctIndex, explanation };
  });

  if (questions.some((question) => !question)) return null;
  return { type: "quick_quiz", questions };
}

function validateGraphParameter(interaction, visual) {
  if (!visual.graphKind || !ALLOWED_GRAPH_KINDS.has(visual.graphKind)) return null;
  if (!Array.isArray(interaction.parameters)) return null;
  if (interaction.parameters.length < 1 || interaction.parameters.length > MAX_GRAPH_PARAMETERS) return null;
  const allowedParamKeys = GRAPH_PARAM_KEYS[visual.graphKind];
  const keys = new Set();

  const parameters = interaction.parameters.map((param) => {
    if (!param || typeof param !== "object" || Array.isArray(param)) return null;
    if (!hasOnlyAllowedKeys(param, new Set(["key", "label", "min", "max", "step", "default"]))) return null;
    const key = cleanId(param.key);
    const label = cleanText(param.label, MAX_LABEL_LENGTH);
    const min = boundedNumber(param.min);
    const max = boundedNumber(param.max);
    const step = boundedNumber(param.step);
    const defaultValue = boundedNumber(param.default);
    if (
      !key ||
      !allowedParamKeys.has(key) ||
      keys.has(key) ||
      !label ||
      min === null ||
      max === null ||
      step === null ||
      defaultValue === null ||
      min >= max ||
      step <= 0 ||
      defaultValue < min ||
      defaultValue > max
    ) {
      return null;
    }
    keys.add(key);
    return { key, label, min, max, step, default: defaultValue };
  });

  if (parameters.some((param) => !param)) return null;
  return { type: "graph_parameter", parameters };
}

function validateNodeInspect(interaction, visual) {
  if (interaction.details === undefined) return { type: "node_inspect" };
  if (!interaction.details || typeof interaction.details !== "object" || Array.isArray(interaction.details)) return null;

  const validKeys = new Set();
  if (visual.visualType === "flow") {
    visual.nodes.forEach((node) => validKeys.add(node.id));
  } else if (visual.visualType === "concept_map") {
    validKeys.add(visual.center);
    visual.branches.forEach((branch) => validKeys.add(branch.label));
  }

  if (!hasOnlyAllowedKeys(interaction.details, validKeys)) return null;
  const details = {};
  for (const [key, value] of Object.entries(interaction.details)) {
    const detail = cleanText(value, MAX_DETAIL_LENGTH);
    if (!detail) return null;
    details[key] = detail;
  }
  return { type: "node_inspect", details };
}

function validateVisualInteraction(rawInteraction, visual) {
  if (rawInteraction === undefined) return null;
  if (!rawInteraction || typeof rawInteraction !== "object" || Array.isArray(rawInteraction)) return null;
  const interactionType = ZI_INTERACTION_TYPES.includes(rawInteraction.type) ? rawInteraction.type : null;
  if (!interactionType || !INTERACTION_COMPATIBILITY[interactionType].has(visual.visualType)) return null;

  if (interactionType === "step_reveal") {
    return hasOnlyAllowedKeys(rawInteraction, new Set(["type"])) ? { type: "step_reveal" } : null;
  }
  if (interactionType === "label_reveal") {
    return hasOnlyAllowedKeys(rawInteraction, new Set(["type"])) ? { type: "label_reveal" } : null;
  }
  if (interactionType === "row_reveal") {
    return hasOnlyAllowedKeys(rawInteraction, new Set(["type"])) ? { type: "row_reveal" } : null;
  }
  if (interactionType === "node_inspect") {
    if (!hasOnlyAllowedKeys(rawInteraction, new Set(["type", "details"]))) return null;
    return validateNodeInspect(rawInteraction, visual);
  }
  if (interactionType === "quick_quiz") {
    if (!hasOnlyAllowedKeys(rawInteraction, new Set(["type", "questions"]))) return null;
    return validateQuickQuiz(rawInteraction);
  }
  if (interactionType === "graph_parameter") {
    if (!hasOnlyAllowedKeys(rawInteraction, new Set(["type", "parameters"]))) return null;
    return validateGraphParameter(rawInteraction, visual);
  }

  return null;
}

export function validateZiVisualAction(actionObj) {
  if (!actionObj || typeof actionObj !== "object" || Array.isArray(actionObj)) return null;
  if (!hasOnlyAllowedKeys(actionObj, VISUAL_KEYS)) return null;
  if (actionObj.type !== "visual_explanation") return null;

  const visual = actionObj.visual;
  const visualType = visual?.visualType;
  let safeVisual = null;

  if (visualType === "comparison") safeVisual = validateComparison(visual);
  if (visualType === "flow") safeVisual = validateFlow(visual);
  if (visualType === "timeline") safeVisual = validateTimeline(visual);
  if (visualType === "process_steps") safeVisual = validateProcessSteps(visual);
  if (visualType === "concept_map") safeVisual = validateConceptMap(visual);
  if (visualType === "simple_graph") safeVisual = validateSimpleGraph(visual);
  if (visualType === "labeled_diagram") safeVisual = validateLabeledDiagram(visual);
  if (visualType === "data_table") safeVisual = validateDataTable(visual);

  if (!safeVisual) return null;

  const interaction = validateVisualInteraction(visual.interaction, safeVisual);
  return {
    type: "visual_explanation",
    visual: interaction ? { ...safeVisual, interaction } : safeVisual,
  };
}
