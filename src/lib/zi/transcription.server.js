import "server-only";

import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

export const ZI_TRANSCRIBE_MAX_BYTES = 8 * 1024 * 1024;

export const ZI_TRANSCRIBE_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
]);

const DEFAULT_TRANSCRIPTION_MODEL = "gemini-3.6-flash";
const FALLBACK_TRANSCRIPTION_MODELS = ["gemini-flash-lite-latest"];

export function normalizeAudioMimeType(mimeType) {
  return String(mimeType || "").split(";")[0].trim().toLowerCase();
}

export function isAllowedZiTranscriptionMimeType(mimeType) {
  return ZI_TRANSCRIBE_AUDIO_TYPES.has(normalizeAudioMimeType(mimeType));
}

export async function transcribeZiAudio({
  audioBuffer,
  mimeType,
  signal,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName =
    process.env.ZI_TRANSCRIPTION_MODEL ||
    process.env.ZI_AI_MODEL ||
    DEFAULT_TRANSCRIPTION_MODEL;

  if (!apiKey) {
    const error = new Error("Zi transcription provider is not configured.");
    error.code = "ZI_TRANSCRIPTION_NOT_CONFIGURED";
    throw error;
  }

  const normalizedMimeType = normalizeAudioMimeType(mimeType);
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");
  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = [
    modelName,
    ...FALLBACK_TRANSCRIPTION_MODELS.filter((fallbackModel) => fallbackModel !== modelName),
  ];
  let lastError;

  for (const currentModel of modelsToTry) {
    try {
      const response = await ai.models.generateContent(
        {
          model: currentModel,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Transcribe the spoken audio exactly into plain text. " +
                    "Return only the transcript. If there is no intelligible speech, return an empty string.",
                },
                createPartFromBase64(audioBase64, normalizedMimeType),
              ],
            },
          ],
          config: {
            maxOutputTokens: 300,
            temperature: 0,
          },
        },
        { abortSignal: signal }
      );

      return String(response.text || "").trim();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
