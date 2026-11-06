import "server-only";

const MARKER = "__ZI_ACTION__=";
const MAX_PROPOSAL_CHARS = 16384;
const MAX_PROSE_CHARS = 48000;

// Provider text can propose an action, but only a complete STOP may produce
// a candidate for the route's independent authorization and validation.
export async function readZiProviderAction(stream, onText, signal) {
  let tail = "", proposal = "", inProposal = false, oversized = false, proseSize = 0;
  let finishReason, invalidCompletion = false;
  function emit(text) {
    if (!text) return;
    proseSize += text.length;
    if (proseSize > MAX_PROSE_CHARS) throw Error("Zi prose limit exceeded");
    onText(text);
  }

  for await (const chunk of stream) {
    signal?.throwIfAborted();
    const text = typeof chunk.text === "function" ? chunk.text() : chunk.text;
    const reason = chunk.candidates?.[0]?.finishReason;
    if (finishReason && (text || (reason && reason !== finishReason))) invalidCompletion = true;
    if (reason) finishReason = reason;
    if (typeof text !== "string" || !text) continue;
    if (!inProposal) {
      tail += text;
      const index = tail.indexOf(MARKER);
      if (index === -1) {
        const keepFrom = Math.max(0, tail.length - MARKER.length + 1);
        emit(tail.slice(0, keepFrom));
        tail = tail.slice(keepFrom);
        continue;
      }
      emit(tail.slice(0, index));
      inProposal = true;
      proposal = tail.slice(index + MARKER.length);
      tail = "";
    } else if (!oversized) {
      proposal += text;
    }
    if (proposal.length > MAX_PROPOSAL_CHARS) {
      proposal = "";
      oversized = true;
    }
  }
  signal?.throwIfAborted();
  if (!inProposal) emit(tail);
  if (oversized || !inProposal || invalidCompletion || finishReason !== "STOP") return null;

  try {
    const parsed = JSON.parse(proposal);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) && typeof parsed.type === "string" ? parsed : null;
  } catch {
    return null;
  }
}
