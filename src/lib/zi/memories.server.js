import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const ZI_MEMORY_TYPES = [
  "concept_confusion",
  "study_priority",
  "temporary_goal",
  "exam_deadline",
  "subject_preference",
  "learning_note",
];

const TEMPORARY_MEMORY_TYPES = new Set([
  "study_priority",
  "temporary_goal",
  "exam_deadline",
]);

const MAX_MEMORY_TEXT_LENGTH = 300;
const MAX_LABEL_LENGTH = 80;
const MAX_ACTIVE_MEMORIES = 8;
const MAX_QUERY_MEMORIES = 24;
const MAX_EXPIRY_DAYS = 370;
const DEFAULT_TEMPORARY_DAYS = 30;

const SENSITIVE_PATTERNS = [
  /\b(api[_ -]?key|secret[_ -]?key|access[_ -]?token|auth[_ -]?token|bearer token|password|passcode|otp)\b/i,
  /\b(card number|cvv|cvc|bank account|upi pin|routing number|iban)\b/i,
  /\b(medical record|diagnosis|prescription|therapy notes?)\b/i,
];

const CANDIDATE_KEYS = new Set([
  "type",
  "memory_type",
  "text",
  "memory_text",
  "subject",
  "chapter",
  "expiresAt",
  "expires_at",
  "durationDays",
  "duration_days",
  "memory_key",
]);

function hasOnlyAllowedKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function cleanText(value, maxLength = MAX_MEMORY_TEXT_LENGTH) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeSearchText(value) {
  return cleanText(value, 220)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeMemoryType(value) {
  return ZI_MEMORY_TYPES.includes(value) ? value : null;
}

function normalizeSubject(value) {
  const text = cleanText(value, MAX_LABEL_LENGTH);
  if (!text) return null;

  const lower = text.toLowerCase();
  if (["math", "maths", "mathematics"].includes(lower)) return "Mathematics";
  if (lower === "physics") return "Physics";
  if (lower === "chemistry") return "Chemistry";
  if (lower === "biology") return "Biology";

  return text;
}

function normalizeChapter(value) {
  return cleanText(value, MAX_LABEL_LENGTH) || null;
}

function isSensitiveMemory(text) {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}

export function buildLearningMemoryKey(memory) {
  const type = normalizeMemoryType(memory?.memory_type || memory?.type);
  const subject = normalizeSearchText(memory?.subject || "general");
  const chapter = normalizeSearchText(memory?.chapter || "general");
  const text = normalizeSearchText(memory?.memory_text || memory?.text).slice(0, 90);

  if (!type || !text) return null;
  if (subject !== "general" || chapter !== "general") {
    return [type, subject || "general", chapter || "general"].join(":");
  }

  return [type, subject || "general", chapter || "general", text].join(":");
}

function resolveExpiresAt(memoryType, candidate) {
  if (!TEMPORARY_MEMORY_TYPES.has(memoryType)) return null;

  const durationDays = Number(candidate?.durationDays || candidate?.duration_days);
  if (Number.isInteger(durationDays) && durationDays > 0) {
    const clampedDays = Math.min(durationDays, MAX_EXPIRY_DAYS);
    const expiry = new Date(Date.now() + clampedDays * 24 * 60 * 60 * 1000);
    return expiry.toISOString();
  }

  const proposed = candidate?.expires_at || candidate?.expiresAt;
  if (typeof proposed === "string") {
    const parsed = new Date(proposed);
    const max = new Date(Date.now() + MAX_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(parsed.getTime()) && parsed > new Date() && parsed <= max) {
      return parsed.toISOString();
    }
  }

  return new Date(
    Date.now() + DEFAULT_TEMPORARY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
}

export function validateLearningMemoryCandidate(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  if (!hasOnlyAllowedKeys(candidate, CANDIDATE_KEYS)) return null;

  const memoryType = normalizeMemoryType(candidate.memory_type || candidate.type);
  const memoryText = cleanText(candidate.memory_text || candidate.text);
  if (!memoryType || !memoryText || isSensitiveMemory(memoryText)) return null;

  const memory = {
    memory_type: memoryType,
    memory_text: memoryText,
    subject: normalizeSubject(candidate.subject),
    chapter: normalizeChapter(candidate.chapter),
    expires_at: resolveExpiresAt(memoryType, candidate),
  };

  const memoryKey = buildLearningMemoryKey(memory);
  if (!memoryKey) return null;

  return {
    ...memory,
    memory_key: memoryKey,
  };
}

export function validateZiLearningMemoryAction(actionObj) {
  if (!actionObj || typeof actionObj !== "object" || Array.isArray(actionObj)) {
    return null;
  }

  const actionTypes = new Set([
    "save_learning_memory",
    "update_learning_memory",
    "delete_learning_memory",
  ]);
  if (!actionTypes.has(actionObj.type)) return null;

  const candidate = validateLearningMemoryCandidate(actionObj.memory || actionObj);
  if (!candidate) return null;

  return {
    type: actionObj.type,
    memory: candidate,
  };
}

export async function saveLearningMemory({ userId, memory }) {
  const validated = validateLearningMemoryCandidate(memory);
  if (!userId || !validated) return { ok: false, status: 400 };

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("zi_memories")
    .upsert(
      {
        clerk_user_id: userId,
        memory_type: validated.memory_type,
        memory_key: validated.memory_key,
        memory_text: validated.memory_text,
        subject: validated.subject,
        chapter: validated.chapter,
        expires_at: validated.expires_at,
        updated_at: now,
      },
      { onConflict: "clerk_user_id,memory_key" }
    )
    .select("id, memory_type, memory_text, subject, chapter, expires_at")
    .single();

  if (error) throw error;
  return { ok: true, memory: data };
}

function deterministicDeleteScore(target, row) {
  let score = 0;
  if (target.memory_type && target.memory_type === row.memory_type) score += 3;
  if ((target.subject || "") === (row.subject || "")) score += 2;
  if ((target.chapter || "") === (row.chapter || "")) score += 2;

  const targetText = normalizeSearchText(target.memory_text);
  const rowText = normalizeSearchText(row.memory_text);
  if (targetText && rowText) {
    if (targetText === rowText) score += 8;
    else if (targetText.includes(rowText) || rowText.includes(targetText)) score += 5;
  }

  return score;
}

export async function deleteLearningMemory({ userId, memory }) {
  const validated = validateLearningMemoryCandidate(memory);
  if (!userId || !validated) return { ok: false, status: 400 };

  const { data: rows, error: lookupError } = await supabaseAdmin
    .from("zi_memories")
    .select("id, memory_type, memory_text, subject, chapter, expires_at")
    .eq("clerk_user_id", userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(MAX_QUERY_MEMORIES);

  if (lookupError) throw lookupError;

  const match = (rows || [])
    .map((row) => ({ row, score: deterministicDeleteScore(validated, row) }))
    .filter((item) => item.score >= 8)
    .sort((a, b) => b.score - a.score)[0]?.row;

  if (!match?.id) return { ok: true, deleted: false };

  const { error } = await supabaseAdmin
    .from("zi_memories")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("id", match.id);

  if (error) throw error;
  return { ok: true, deleted: true };
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function extractTrustedScope(entityContext) {
  if (typeof entityContext !== "string" || !entityContext) {
    return { subject: null, chapter: null };
  }

  const subject = entityContext.match(/^Subject:\s*(.+)$/m)?.[1] || null;
  const chapter = entityContext.match(/^Chapter:\s*(.+)$/m)?.[1] || null;

  return {
    subject: normalizeSubject(subject),
    chapter: normalizeChapter(chapter),
  };
}

function rankMemory(memory, scope) {
  let score = 0;
  if (TEMPORARY_MEMORY_TYPES.has(memory.memory_type)) score += 6;
  if (!memory.subject) score += 2;
  if (memory.memory_type === "concept_confusion") score += 2;

  const memorySubject = normalizeSearchText(memory.subject);
  const memoryChapter = normalizeSearchText(memory.chapter);
  const scopeSubject = normalizeSearchText(scope?.subject);
  const scopeChapter = normalizeSearchText(scope?.chapter);

  if (memorySubject && scopeSubject && memorySubject === scopeSubject) score += 8;
  if (memoryChapter && scopeChapter && memoryChapter === scopeChapter) score += 10;

  return score;
}

export async function getZiLearningMemories(userId, options = {}) {
  if (!userId) return [];
  const scope = extractTrustedScope(options.entityContext);

  const { data, error } = await supabaseAdmin
    .from("zi_memories")
    .select("id, memory_type, memory_text, subject, chapter, expires_at, updated_at")
    .eq("clerk_user_id", userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("updated_at", { ascending: false })
    .limit(MAX_QUERY_MEMORIES);

  if (error) {
    console.error("[ZI_MEMORIES_FETCH_ERROR]", error);
    return [];
  }

  return (data || [])
    .sort((a, b) => rankMemory(b, scope) - rankMemory(a, scope))
    .slice(0, MAX_ACTIVE_MEMORIES);
}

export function formatZiLearningMemories(memories) {
  if (!Array.isArray(memories) || memories.length === 0) return "";

  const lines = ["Saved learning memories (explicitly user-approved):"];
  for (const memory of memories.slice(0, MAX_ACTIVE_MEMORIES)) {
    const scope = [memory.subject, memory.chapter].filter(Boolean).join(" / ");
    const expiry = formatExpiry(memory.expires_at);
    const prefix = scope ? `${scope}: ` : "";
    const suffix = expiry ? ` (active until ${expiry})` : "";
    lines.push(`- ${prefix}${memory.memory_text}${suffix}`);
  }
  lines.push("");
  lines.push("Use these gently as remembered study notes. Current explicit user requests and active page/item safety rules override them.");

  return lines.join("\n");
}
