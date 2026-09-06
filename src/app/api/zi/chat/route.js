import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkZiRateLimit } from "@/lib/zi/rateLimit";
import { ZI_SYSTEM_PROMPT } from "@/lib/zi/prompt";
import { streamZiResponse } from "@/lib/zi/provider";
import { ZiChatRequestSchema } from "@/lib/zi/validation";

const encoder = new TextEncoder();

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = ZiChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { allowed, remaining, resetMs } = checkZiRateLimit(userId);
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

  let providerStream;
  try {
    providerStream = await streamZiResponse({
      messages: parsed.data.messages,
      systemPrompt: ZI_SYSTEM_PROMPT,
      signal: request.signal,
    });
  } catch (error) {
    if (error?.code === "ZI_PROVIDER_NOT_CONFIGURED") {
      console.error("[ZI_PROVIDER_CONFIG_ERROR]", error.message);
      return jsonError("Zi provider is not configured", 503);
    }

    console.error("[ZI_PROVIDER_START_ERROR]", {
      message: error?.message,
      name: error?.name,
    });
    return jsonError("Zi provider unavailable", 503);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of providerStream) {
          if (request.signal.aborted) break;
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        if (request.signal.aborted || error?.name === "AbortError") {
          controller.close();
          return;
        }

        console.error("[ZI_STREAM_ERROR]", {
          message: error?.message,
          name: error?.name,
        });
        controller.enqueue(
          encoder.encode("Zi couldn't respond right now. Try again in a moment.")
        );
        controller.close();
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
