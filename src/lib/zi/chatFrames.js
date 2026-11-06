export const ZI_CHAT_MEDIA_TYPE = "application/x-ndjson";
const MAX_FRAME_CHARS = 65536;
const MAX_TEXT_CHARS = 65536;
const encoder = new TextEncoder();

export function ziChatFrame(type, value) {
  return encoder.encode(JSON.stringify(value === undefined ? { type } : { type, value }) + "\n");
}

export function ziChatResponse(body, headers) {
  return new Response(body, {
    headers: {
      "Content-Type": `${ZI_CHAT_MEDIA_TYPE}; charset=utf-8`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export function ziChatReply(text, action) {
  const frames = [ziChatFrame("text", text)];
  if (action) frames.push(ziChatFrame("action", action));
  frames.push(ziChatFrame("done"));
  return ziChatResponse(new Blob(frames), { "X-Zi-Prompt-Charged": "0" });
}

// Only a complete, well-formed response with the framed media type can carry an action.
// Older plain-text endpoints remain readable, with their entire body treated as prose.
export async function readZiChat(response, onText, signal) {
  const framed = response.headers.get("Content-Type")?.split(";")[0].trim() === ZI_CHAT_MEDIA_TYPE;
  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let text = "", pending = "", action = null, done = false, invalid = false;
  let finished = false;

  function append(value) {
    if (text.length + value.length > MAX_TEXT_CHARS) {
      invalid = true;
      return;
    }
    text += value;
    onText?.(text);
  }

  function readChunk(chunk) {
    if (!framed) {
      append(chunk);
      return;
    }
    if (invalid) return;
    const lines = (pending + chunk).split("\n");
    pending = lines.pop();
    if (pending.length > MAX_FRAME_CHARS) {
      invalid = true;
      return;
    }
    for (const line of lines) {
      if (done || !line || line.length > MAX_FRAME_CHARS) { invalid = true; break; }
      try {
        const frame = JSON.parse(line);
        if (!frame || typeof frame !== "object" || Array.isArray(frame)) throw Error("Invalid frame");
        const keys = Object.keys(frame);
        if (frame.type === "text" && keys.length === 2 && typeof frame.value === "string" && !action) {
          append(frame.value);
        } else if (frame.type === "action" && keys.length === 2 && !action && frame.value &&
          typeof frame.value === "object" && !Array.isArray(frame.value) && typeof frame.value.type === "string") {
          action = frame.value;
        } else if (frame.type === "done" && keys.length === 1) {
          done = true;
        } else throw Error("Invalid frame order or type");
      } catch {
        invalid = true;
      }
      if (invalid) break;
    }
  }

  try {
    while (!invalid) {
      signal?.throwIfAborted();
      const next = await reader.read();
      signal?.throwIfAborted();
      if (next.done) {
        finished = true;
        readChunk(decoder.decode());
        break;
      }
      readChunk(decoder.decode(next.value, { stream: true }));
    }
    return { text, action: framed && finished && done && !invalid && !pending ? action : null };
  } finally {
    if (!finished) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
