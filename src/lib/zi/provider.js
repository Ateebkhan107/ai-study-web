import "server-only";

import { GoogleGenAI } from "@google/genai";

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
  return messages
    .filter((message) => message?.content?.trim())
    .map((message) => ({
      role: toGeminiRole(message.role),
      parts: [{ text: message.content.trim() }],
    }))
    .filter((message, index) => index > 0 || message.role === "user");
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
            maxOutputTokens: 2500,
            temperature: 0.6,
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
