import { generationJobResponse } from "@/lib/zi/testGenerator/jobHttp.server";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = (request) => generationJobResponse(request, null, "reserve");
export const GET = (request) => generationJobResponse(request, null, "read");
