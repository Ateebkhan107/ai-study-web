import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-1.5-flash";

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
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error("Zi AI provider is not configured.");
    error.code = "ZI_PROVIDER_NOT_CONFIGURED";
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.ZI_AI_MODEL || DEFAULT_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 900,
      temperature: 0.6,
    },
  });

  const result = await model.generateContentStream(
    {
      contents: toGeminiContents(messages),
    },
    { signal }
  );

  return result.stream;
}
