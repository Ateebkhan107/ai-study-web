import { generationJobResponse } from "@/lib/zi/testGenerator/jobHttp.server";
// Awaited bounded invocation, separate from the 60-second tutor route. A host
// unable to guarantee 300 seconds must not enable the pilot. No background task.
export const runtime = "nodejs";
export const maxDuration = 300;
export const POST = (request, { params }) => generationJobResponse(request, params, "execute");
