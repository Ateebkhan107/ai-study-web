import "server-only";

import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";
import { createGeminiRequestRunner } from "./geminiRetry.server.js";

const runStructuredRequest = createGeminiRequestRunner();

export function getZiGenerationQuotaStatus() {
  return runStructuredRequest.getQuotaCooldown();
}

const DEFAULT_MODEL_PRO = "gemini-3.6-flash";
const DEFAULT_MODEL_AI_MODE = "gemini-3.6-pro"; // Ready for premium model
const FALLBACK_MODELS = ["gemini-flash-lite-latest"];

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function logZiProviderStatus(status, error) {
  if (!isDevelopment()) return;

  console.info(`[Zi] provider status: ${status}`);
  if (error) {
    console.error(`[Zi] provider error name: ${error?.name || "UnknownError"}`);
    console.error(`[Zi] provider error message: ${error?.message || "Unknown provider error"}`);
  }
}

function isModelAvailabilityError(error) {
  const message = error?.message || "";

  return (
    message.includes('"code": 503') ||
    message.includes("[503 Service Unavailable]") ||
    message.includes('"status": "UNAVAILABLE"') ||
    message.includes("no longer available to new users")
  );
}

function toGeminiRole(role) {
  return role === "assistant" ? "model" : "user";
}

function toGeminiContents(messages) {
  const contents = [];
  const validMessages = messages.filter((message) => message?.content?.trim());
  
  for (const message of validMessages) {
    const role = toGeminiRole(message.role);
    const text = message.content.trim();
    
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }
  
  return contents.filter((message, index) => index > 0 || message.role === "user");
}

export async function streamZiResponse({
  messages,
  systemPrompt,
  signal,
  accessContext,
}) {
  const isAiMode = accessContext?.isAiMode || false;

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.ZI_AI_MODEL || (isAiMode ? DEFAULT_MODEL_AI_MODE : DEFAULT_MODEL_PRO);

  if (isDevelopment()) {
    console.info(`[Zi] model: ${modelName}`);
    console.info(`[Zi] API key present: ${Boolean(apiKey)}`);
  }

  if (!apiKey) {
    const error = new Error("Zi AI provider is not configured.");
    error.code = "ZI_PROVIDER_NOT_CONFIGURED";
    logZiProviderStatus("missing-api-key", error);
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = [
    modelName,
    ...FALLBACK_MODELS.filter((fallbackModel) => fallbackModel !== modelName),
  ];
  let lastError;

  for (const currentModel of modelsToTry) {
    if (isDevelopment()) {
      console.info(`[Zi] model: ${currentModel}`);
    }

    try {
      const result = await ai.models.generateContentStream(
        {
          model: currentModel,
          contents: toGeminiContents(messages),
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 3500,
            temperature: 0.6,
            thinkingConfig: {
              includeThoughts: false,
              thinkingLevel: "LOW",
            },
          },
        },
        { abortSignal: signal }
      );

      logZiProviderStatus("stream-started");
      return result;
    } catch (error) {
      lastError = error;
      logZiProviderStatus("start-error", error);

      if (!isModelAvailabilityError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

// Separate non-streaming analysis entry point; the existing tutor stream and
// its in-progress configuration are deliberately unchanged.
async function completeZiStructuredTask({ systemPrompt, prompt, responseJsonSchema, signal, onProviderUsage }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Zi AI provider is not configured.");
    error.code = "ZI_PROVIDER_NOT_CONFIGURED";
    throw error;
  }
  const deadline = AbortSignal.timeout(45000);
  const abortSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
  const modelName = process.env.ZI_AI_MODEL || DEFAULT_MODEL_PRO;
  const models = [...new Set([modelName, ...FALLBACK_MODELS])];
  let requests = 0;
  let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let failure = null;
  try {
    const response = await runStructuredRequest({
      models, signal: abortSignal, deadlineAt: Date.now() + 45000,
      cooldownKey: createHash("sha256").update(`${apiKey}:${modelName}`).digest("hex"),
      operation: async (model) => {
        // The installed SDK discards Retry-After headers when constructing an
        // ApiError. Use the same Gemini REST endpoint for structured tasks so
        // headers AND google.rpc quota/retry details survive. Tutor streaming
        // still uses the existing SDK unchanged; provider/model routing is unchanged.
        const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST", signal: abortSignal,
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json", responseJsonSchema, temperature: 0.1, maxOutputTokens: 8000,
              ...(model === modelName ? { thinkingConfig: { includeThoughts: false, thinkingLevel: "LOW" } } : {}),
            },
          }),
        });
        let body;
        try { body = await result.json(); } catch { body = {}; }
        if (!result.ok) throw Object.assign(new Error("Gemini HTTP request failed."), { status: result.status, body, headers: new Headers({ ...(result.headers.get("retry-after") ? { "retry-after": result.headers.get("retry-after") } : {}) }) });
        return body;
      },
    });
    requests = response.providerRequests;
    const result = response.result;
    usage = { inputTokens: result.usageMetadata?.promptTokenCount || 0, outputTokens: result.usageMetadata?.candidatesTokenCount || 0, totalTokens: result.usageMetadata?.totalTokenCount || 0 };
    const text = result.candidates?.[0]?.content?.parts?.filter((part) => !part.thought).map((part) => part.text || "").join("");
    if (result.candidates?.[0]?.finishReason !== "STOP" || !text) throw Object.assign(new Error("Incomplete structured response."), { code: "ZI_ANALYSIS_INCOMPLETE" });
    let data;
    try { data = JSON.parse(text); } catch { throw Object.assign(new Error("Invalid structured JSON."), { code: "ZI_ANALYSIS_INVALID_JSON" }); }
    return { data, model: response.model, providerRequests: requests, usage };
  } catch (error) {
    requests = error.providerRequests ?? requests;
    failure = error.providerDiagnostic || null;
    const safeError = new Error(abortSignal.aborted ? "Zi structured request was cancelled or timed out." : "Zi structured request could not be completed.");
    safeError.code = ["ZI_ANALYSIS_INCOMPLETE", "ZI_ANALYSIS_INVALID_JSON"].includes(error.code) ? error.code : abortSignal.aborted ? "ZI_ANALYSIS_ABORTED" : "ZI_ANALYSIS_PROVIDER_ERROR";
    if (Number.isInteger(error.status)) safeError.providerStatus = error.status;
    safeError.providerRequests = requests;
    safeError.providerDiagnostic = failure;
    throw safeError;
  } finally {
    try { onProviderUsage?.({ providerRequests: requests, usage, diagnostic: failure, estimatedInputTokens: Math.ceil((prompt.length + systemPrompt.length) / 3) * requests }); } catch { /* Telemetry is non-authoritative. */ }
  }
}

// Preserve Phase 2's exact response contract and existing tutor behavior.
export async function completeZiPatternAnalysis(params) {
  const { data, model } = await completeZiStructuredTask(params);
  return { data, model };
}

export async function completeZiQuestionTask(params) {
  return completeZiStructuredTask(params);
}
