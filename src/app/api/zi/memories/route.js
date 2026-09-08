import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserAccessContext } from "@/lib/accessControl";

import {
  deleteLearningMemory,
  saveLearningMemory,
  validateLearningMemoryCandidate,
} from "@/lib/zi/memories.server";

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return jsonError("Unauthorized", 401);
    const access = await getUserAccessContext({ userId });
    if (!access.isAiMode) return NextResponse.json({ error: "AI_MODE_REQUIRED", message: "Zi AI requires AI Mode." }, { status: 403 });

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    const action = body?.action;
    const memory = validateLearningMemoryCandidate(body?.memory);
    if (!["save", "update", "delete"].includes(action) || !memory) {
      return jsonError("Invalid learning memory request", 400);
    }

    if (action === "delete") {
      await deleteLearningMemory({ userId, memory });
      return NextResponse.json({ success: true });
    }

    await saveLearningMemory({ userId, memory });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ZI_MEMORIES_ERROR]", {
      name: error?.name,
      message: error?.message,
    });
    return jsonError("Failed to update learning memory", 500);
  }
}
