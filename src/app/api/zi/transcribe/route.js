import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserAccessContext } from "@/lib/accessControl";

import { checkZiRateLimit } from "@/lib/zi/rateLimit";
import {
  isAllowedZiTranscriptionMimeType,
  normalizeAudioMimeType,
  transcribeZiAudio,
  ZI_TRANSCRIBE_MAX_BYTES,
} from "@/lib/zi/transcription.server";

function jsonError(message, status, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const access = await getUserAccessContext({ userId });
    if (access.plan === "FREE") {
      return NextResponse.json({ error: "ZI_PRO_REQUIRED" }, { status: 403 });
    }

  const { allowed, remaining, resetMs } = checkZiRateLimit(userId, access.plan);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(resetMs / 1000)),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return jsonError("Audio upload must use multipart form data", 415);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid audio upload", 400);
  }

  const audio = formData.get("audio");
  if (!audio || typeof audio.arrayBuffer !== "function") {
    return jsonError("Missing audio file", 400);
  }

  const size = Number(audio.size || 0);
  const mimeType = normalizeAudioMimeType(audio.type);

  if (size <= 0) {
    return jsonError("No speech detected", 422, { code: "NO_SPEECH" });
  }

  if (size > ZI_TRANSCRIBE_MAX_BYTES) {
    return jsonError("Audio is too large", 413, { maxBytes: ZI_TRANSCRIBE_MAX_BYTES });
  }

  if (!isAllowedZiTranscriptionMimeType(mimeType)) {
    return jsonError("Unsupported audio type", 415);
  }

  try {
    const audioBuffer = await audio.arrayBuffer();
    const text = await transcribeZiAudio({
      audioBuffer,
      mimeType,
      signal: request.signal,
    });

    if (!text) {
      return jsonError("No speech detected", 422, { code: "NO_SPEECH" });
    }

    return NextResponse.json({ text });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ZI_TRANSCRIBE_ERROR]", error);
    }

    if (error?.code === "ZI_TRANSCRIPTION_NOT_CONFIGURED") {
      return jsonError("Zi transcription is not configured", 503);
    }

    return jsonError("Transcription failed", 502);
  }
}
