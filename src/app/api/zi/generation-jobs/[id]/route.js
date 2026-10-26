import { generationJobResponse } from "@/lib/zi/testGenerator/jobHttp.server";
export const runtime = "nodejs";
export const maxDuration = 30;
export const GET = (request, { params }) => generationJobResponse(request, params, "read");
