import "server-only";
import { auth } from "@clerk/nextjs/server";
import { getUserAccessContext } from "@/lib/accessControl";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { assertPilot, ReserveJobRequest, JobId, jobRepository, reserveGenerationJob, readGenerationJob, executeGenerationJob } from "./jobs.server.js";

export function hasSameRequestOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    // Next's local Node adapter can construct request.url with localhost even
    // when the browser requested 127.0.0.1. Use its actual HTTP Host, never an
    // arbitrary forwarded-host header, while retaining the request protocol.
    const url = new URL(request.url);
    const host = request.headers.get("host") || url.host;
    if (!/^[a-zA-Z0-9.:[\]-]+$/.test(host)) return false;
    return origin === new URL(`${url.protocol}//${host}`).origin;
  } catch { return false; }
}

export async function generationJobResponse(request, params, operation) {
  const headers = { "Cache-Control": "no-store", "Retry-After": "3" };
  try {
    const { userId } = await auth();
    assertPilot(userId);
    if (request.method === "POST" && !hasSameRequestOrigin(request)) {
      return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
    }
    const repo = jobRepository(supabaseAdmin);
    const id = params ? JobId.parse((await params).id) : null;
    let job;
    if (operation === "read") job = await readGenerationJob({ userId, id }, { repo });
    else {
      const access = await getUserAccessContext({ userId });
      if (operation === "reserve") {
        const text = await request.text();
        if (text.length > 5000) return Response.json({ error: "Invalid request." }, { status: 400, headers });
        const { token } = ReserveJobRequest.parse(JSON.parse(text));
        job = await reserveGenerationJob({ userId, access, token }, { repo });
      } else job = await executeGenerationJob({ userId, access, id }, { repo, client: supabaseAdmin });
    }
    return Response.json({ job }, { headers, status: operation === "reserve" ? 202 : 200 });
  } catch (error) {
    const status = error.status || (error.name === "ZodError" || error instanceof SyntaxError ? 400 : 503);
    return Response.json({ error: error.status ? error.message : status === 400 ? "Invalid generation request." : "Generation is unavailable. Resume status before retrying." }, { status, headers });
  }
}
