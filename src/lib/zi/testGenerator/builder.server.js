import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { z } from "zod";
import { TEST_PAGE_CHAPTERS, CHAPTER_ALIASES } from "../../pyqChapterMapping.js";
import { chapterScope } from "./scope.server.js";
import { getZiGenerationQuotaStatus } from "../provider.js";

const label = z.string().trim().min(2).max(120).regex(/^[^\u0000-\u001f<>]*$/);
export const BuilderPatch = z.object({
  exam: z.enum(["JEE Main", "NEET"]).optional(),
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology"]).optional(),
  chapter: label.optional(), topic: label.optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Mixed"]).optional(),
  questionCount: z.number().int().min(5).max(30).optional(),
  mode: z.enum(["timed", "practice"]).optional(),
  durationMinutes: z.number().int().min(5).max(180).optional(),
}).strict();
const State = z.object({ owner: z.string().min(1), expiresAt: z.number(), revision: z.number().int(),
  config: BuilderPatch, confirmed: z.boolean(), preferenceUsed: z.boolean() }).strict();
export const BuilderRequest = z.object({
  operation: z.enum(["update", "confirm", "reset"]),
  token: z.string().min(1).max(4096).optional(), patch: BuilderPatch.optional(),
}).strict();
export class BuilderError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function key(secret = process.env.ZI_TEST_BUILDER_SECRET || process.env.CLERK_SECRET_KEY) {
  if (!secret) throw new BuilderError("Test configuration is temporarily unavailable.", 503);
  // Separate purpose/key domain; no authentication behavior is changed.
  return Buffer.from(hkdfSync("sha256", secret, "prepzii", "zi-test-builder-v1", 32));
}
function seal(state, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  cipher.setAAD(Buffer.from("zi-test-builder-v1"));
  const body = Buffer.concat([cipher.update(JSON.stringify(state)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}
function unseal(token, owner, now, secret) {
  let state;
  try {
    if (typeof token !== "string" || token.length > 4096) throw new Error();
    const data = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(secret), data.subarray(0, 12));
    decipher.setAAD(Buffer.from("zi-test-builder-v1"));
    decipher.setAuthTag(data.subarray(12, 28));
    state = State.parse(JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString()));
  } catch { throw new BuilderError("This configuration is invalid. Start a new test configuration.", 400); }
  if (state.owner !== owner) throw new BuilderError("This configuration belongs to another student.", 403);
  if (state.expiresAt <= now) throw new BuilderError("This configuration expired. Start a new test configuration.", 410);
  return state;
}

export function generationAvailability(env = process.env, quotaStatus = getZiGenerationQuotaStatus()) {
  const featureFlagEnabled = env.ZI_AI_TEST_GENERATION_ENABLED === "true";
  // Fail closed even if somebody sets the future integration flag during Phase 4.
  const quotaBlocked = env.ZI_AI_TEST_PROVIDER_STATUS === "quota_blocked" || quotaStatus.blocked;
  return { generationEnabled: false, featureFlagEnabled,
    state: quotaBlocked ? "quota_blocked" : featureFlagEnabled ? "verification_pending" : "disabled",
    message: quotaBlocked
      ? "AI test generation is paused because the provider quota is unavailable. You can configure a test; no generation requests will be sent."
      : "AI test generation is disabled pending live validation and security approval. You can configure and confirm a test, but no test will be created." };
}
export function missingConfiguration(c) {
  return ["exam", "subject", ...(!c.chapter && !c.topic ? ["topic"] : []), "difficulty", "questionCount", "mode",
    ...(c.mode === "timed" ? ["durationMinutes"] : [])].filter((field) => !c[field]);
}
function enforceAccess(config, access) {
  const track = config.exam === "NEET" ? "NEET" : "JEE";
  const allowed = [access.examTrack, ...(access.proTracks || [])];
  if (config.exam && !access.isPlatformAdmin && !allowed.includes(track)) {
    throw new BuilderError(`Your current exam access does not include ${config.exam}. Choose your enabled exam track or update your exam access in PrepZii.`, 403);
  }
  if ((config.exam === "NEET" && config.subject === "Mathematics") || (config.exam === "JEE Main" && config.subject === "Biology")) {
    throw new BuilderError("That subject is not supported for the selected exam.");
  }
}
function promptFor(c, confirmed) {
  if (confirmed) return "Your configuration is confirmed. No test has been generated or saved.";
  const missing = missingConfiguration(c);
  if (!missing.length) return "Review the summary below, then confirm your configuration.";
  const prompts = { exam: "Which exam would you like — JEE Main or NEET?", subject: "Which subject would you like?",
    topic: "Which chapter or topic should the test cover?", difficulty: c.questionCount
      ? "What difficulty would you like — Easy, Medium, Hard, or Mixed?"
      : "What difficulty and how many questions (5–30) would you like?",
    questionCount: "How many questions would you like (5–30)?", mode: "Would you prefer a timed test or practice quiz?",
    durationMinutes: "How many minutes should the timed test last (5–180)?" };
  return prompts[missing[0]];
}
const catalog = Object.entries(TEST_PAGE_CHAPTERS).flatMap(([subject, chapters]) => chapters.flatMap((chapter) =>
  [chapter, ...(CHAPTER_ALIASES[chapter] || [])].map((name) => ({ name, chapter, subject: subject === "Maths" ? "Mathematics" : subject }))));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export function parseBuilderText(text, current = {}) {
  const lower = text.toLowerCase().trim().replace(/\b(twenty[ -]five|thirty[ -]five|five|ten|fifteen|twenty|thirty|forty|fifty)\b/g,
    (word) => ({ "twenty five": "25", "twenty-five": "25", "thirty five": "35", "thirty-five": "35", five: "5", ten: "10", fifteen: "15", twenty: "20", thirty: "30", forty: "40", fifty: "50" })[word]);
  const patch = {};
  const errors = [];
  const start = /\b(?:create|generate|make|build|prepare|set)\b.{0,160}\b(?:test|quiz|questions)\b|\b(?:want|need)\s+(?:an?\s+)?(?:ai\s+)?(?:practice\s+)?(?:test|quiz)\b|\btest me\b|\bquiz me\b|\b(?:ai|original|personalized) (?:test|quiz)\b/.test(lower);
  if (!start && /^(?:explain|teach|why|how|what|solve|help|show|tell)\b/.test(lower)) return { handled: false };
  // Explicit official/existing-bank requests retain the existing action flow.
  if (start && /\b(?:pyqs?|previous.year|official|existing question bank)\b/.test(lower)) return { handled: false };
  if (/\bjee\s*(?:advanced|adv)\b/.test(lower)) errors.push("JEE Advanced generation is not supported yet. Choose JEE Main or NEET.");
  else if (/\b(?:sat|cat|gate|upsc|cbse|boards?)\b/.test(lower)) errors.push("Only JEE Main and NEET are supported for AI practice tests.");
  else if (/\bneet(?:\s*ug)?\b/.test(lower)) patch.exam = "NEET";
  else if (/\bjee\s*mains?\b/.test(lower)) patch.exam = "JEE Main";
  const subject = lower.match(/\b(physics|chemistry|mathematics|maths|math|biology)\b/)?.[1];
  if (subject) patch.subject = ({ maths: "Mathematics", math: "Mathematics" })[subject] || subject[0].toUpperCase() + subject.slice(1);
  const difficulty = lower.match(/\b(easy|easier|medium|moderate|hard|harder|difficult|mixed)\b/)?.[1];
  if (difficulty) patch.difficulty = ({ moderate: "Medium", difficult: "Hard", harder: "Hard", easier: "Easy" })[difficulty] || difficulty[0].toUpperCase() + difficulty.slice(1);
  if (/\b(?:impossible|extreme|expert|beginner)\b|\bdifficulty\s*(?:is|to|:)?\s*(?!easy\b|medium\b|moderate\b|hard\b|difficult\b|mixed\b)[a-z]+/.test(lower) && !difficulty) errors.push("Choose Easy, Medium, Hard, or Mixed difficulty.");
  const count = lower.match(/(?<![\w.])(-?\d+(?:\.\d+)?)\s+(?:(?:easy|medium|moderate|hard|difficult|mixed|jee|mains?|neet|ug)\s+){0,5}(?:questions?|mcqs?)\b|\b(?:count|questions?|make it)\s*(?:to|:|=)?\s*(-?\d+(?:\.\d+)?)\b/);
  const bare = /^-?\d+(?:\.\d+)?$/.test(lower) ? Number(lower) : null;
  const number = count ? Number(count[1] || count[2]) : bare !== null && (!current.questionCount || current.mode !== "timed" || current.durationMinutes) ? bare : null;
  if (number !== null) {
    if (!Number.isInteger(number) || number < 5 || number > 30) errors.push("Choose a question count from 5 to 30.");
    else patch.questionCount = number;
  }
  if (/\bpractice(?: quiz| mode)?\b|\buntimed\b/.test(lower)) patch.mode = "practice";
  else if (/\btimed(?: test| mode)?\b/.test(lower)) patch.mode = "timed";
  const duration = lower.match(/(?<![\w.])(-?\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/);
  const minutes = duration ? Number(duration[1]) : bare !== null && current.mode === "timed" && current.questionCount && !current.durationMinutes ? bare : null;
  if (minutes !== null) {
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180) errors.push("Choose a duration from 5 to 180 minutes.");
    else patch.durationMinutes = minutes;
  }
  const normalized = ` ${norm(text)} `;
  const subjects = patch.subject || current.subject;
  const matches = catalog.filter((entry) => (!subjects || subjects === entry.subject) && normalized.includes(` ${norm(entry.name)} `)).sort((a, b) => b.name.length - a.name.length);
  if (matches.length && new Set(matches.filter((m) => m.name.length === matches[0].name.length).map((m) => m.subject)).size === 1) {
    patch.subject = matches[0].subject; patch.chapter = matches[0].chapter; patch.topic = matches[0].name;
  } else if (/\bhuman physiology\b/.test(lower)) {
    patch.subject = "Biology"; patch.chapter = "Human Physiology"; patch.topic = "Human Physiology";
  } else {
    const topic = text.match(/\b(?:on|about|topic(?:\s+to)?|chapter(?:\s+to)?)\s+(.+?)(?=\s+(?:with|for|at|in|and|using|\d+\s*questions?|easy|medium|hard|mixed|timed|practice)\b|[.!?]|$)/i)?.[1]?.trim();
    if (topic && norm(topic) !== norm(subject || "") && topic.length >= 2 && topic.length <= 120) { patch.topic = topic; patch.chapter = topic; }
    else if (current.exam && current.subject && !current.topic && !current.chapter && !Object.keys(patch).length && /^[a-z][a-z\s,&()-]{1,100}$/i.test(text)) { patch.topic = text.trim(); patch.chapter = text.trim(); }
  }
  if (/\b(?:weak topics?|mistakes?|got wrong)\b/.test(lower) && start) {
    delete patch.topic; delete patch.chapter;
    errors.push("Choose the topic for this configuration. Automatic selection from saved performance is not connected yet; I will not infer weaknesses.");
  }
  const confirm = /^(?:yes[,! ]*)?(?:confirm(?: configuration)?|looks good|go ahead|generate(?: it| now)?)[.! ]*$/.test(lower);
  const cancel = /^(?:cancel|cancel test|stop building|never mind)[.! ]*$/.test(lower);
  const followup = Object.keys(patch).length > 0 || errors.length > 0 || confirm || cancel;
  return { handled: start || (Object.keys(current).length > 0 && followup), start, patch, errors, confirm, cancel };
}

/** Authenticated routes are the only callers. Tokens are authenticated encrypted
 * state, never client-authoritative configuration. No database or AI calls. */
export function handleBuilder({ userId, access, token, text, operation, patch }, { now = Date.now(), secret, env = process.env } = {}) {
  if (!userId || access?.userId !== userId) throw new BuilderError("Unauthorized", 401);
  if (text !== undefined && !parseBuilderText(text).start && /^(?:explain|teach|why|how|what|solve|help|show|tell)\b/i.test(text.trim())) return null;
  let state = token ? unseal(token, userId, now, secret) : { owner: userId, expiresAt: now + 60 * 60 * 1000, revision: 0, config: {}, confirmed: false, preferenceUsed: false };
  const parsed = text !== undefined ? parseBuilderText(text, state.config) : null;
  if (parsed && !parsed.handled && !(token && (Object.keys(parsed.patch || {}).length || parsed.errors?.length || parsed.confirm || parsed.cancel))) return null;
  if (operation === "reset" || parsed?.cancel) state = { ...state, config: {}, confirmed: false, preferenceUsed: false };
  const errors = [...(parsed?.errors || [])];
  const validated = BuilderPatch.safeParse(patch || parsed?.patch || {});
  if (!validated.success) throw new BuilderError("Invalid test configuration. Check the selected values.");
  const update = validated.data; // Invalid fields are never included by the parser.
  if (update.exam) state.preferenceUsed = false;
  if (!state.config.exam && !update.exam && !errors.length && access.examTrack) {
    state.config.exam = access.examTrack === "NEET" ? "NEET" : "JEE Main"; state.preferenceUsed = true;
  }
  let config = { ...state.config, ...update };
  if (update.subject && state.config.subject && update.subject !== state.config.subject && !update.chapter && !update.topic) { delete config.chapter; delete config.topic; }
  if (update.exam && update.exam !== state.config.exam && !update.subject) {
    if ((update.exam === "NEET" && config.subject === "Mathematics") || (update.exam === "JEE Main" && config.subject === "Biology")) { delete config.subject; delete config.chapter; delete config.topic; }
  }
  try { enforceAccess(config, access); }
  catch (error) { errors.push(error.message); config = state.config; }
  if (config.mode === "practice") delete config.durationMinutes;
  if (config.subject && config.chapter) config.chapter = chapterScope(config.subject, config.chapter).chapter;
  let missing = missingConfiguration(config);
  const confirming = operation === "confirm" || parsed?.confirm;
  if (confirming && (!token || Object.entries(config).some(([field, value]) => value !== state.config[field]))) {
    errors.push("Update and review the summary before confirming.");
    config = state.config;
    missing = missingConfiguration(config);
  }
  if (confirming && missing.length) errors.push("Complete the missing details before confirming.");
  state = { ...state, config, revision: state.revision + 1,
    confirmed: errors.length ? false : confirming ? !missing.length : Object.keys(update).length ? false : state.confirmed };
  const prompt = errors.length ? errors.join(" ") : promptFor(config, state.confirmed);
  return { type: "ai_test_builder", token: seal(state, secret), config, revision: state.revision,
    expiresAt: state.expiresAt, confirmed: state.confirmed, preferenceUsed: state.preferenceUsed,
    missing, errors, prompt, availability: generationAvailability(env) };
}

// Integration seam only. No caller in Phase 4 invokes Phase 3 or saves a test.
export function confirmedGenerationConfiguration({ userId, access, token }, options = {}) {
  const state = unseal(token, userId, options.now ?? Date.now(), options.secret);
  enforceAccess(state.config, access);
  if (access.userId !== userId || !state.confirmed || missingConfiguration(state.config).length) throw new BuilderError("Confirm a complete configuration first.");
  const { exam, subject, difficulty, questionCount, chapter, topic, mode, durationMinutes } = state.config;
  const scopeLabel = topic || chapter;
  const resolved = chapterScope(subject, scopeLabel).chapter;
  const knownChapter = (TEST_PAGE_CHAPTERS[subject === "Mathematics" ? "Maths" : subject] || []).includes(resolved);
  return {
    // Keep chapter aliases (e.g. Rotational Motion) so strict Phase 2 exclusion
    // rules remain intact. Do not misinterpret a chapter alias as an exact topic.
    generationConfig: { exam, subject, difficulty, questionCount, ...(knownChapter ? { chapter: scopeLabel } : { topic: scopeLabel }) },
    sessionConfig: { mode, ...(mode === "timed" ? { durationMinutes } : {}) },
  };
}
