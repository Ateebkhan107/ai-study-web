import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserAccessContext } from "@/lib/accessControl";
import { checkZiRateLimit } from "@/lib/zi/rateLimit";
import { BuilderRequest, handleBuilder } from "@/lib/zi/testGenerator/builder.server";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const parsed = BuilderRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid test configuration. Check the selected values." }, { status: 400 });
  const access = await getUserAccessContext({ userId });
  const rate = checkZiRateLimit(userId, access.plan);
  if (!rate.allowed) return NextResponse.json({ error: "Too many updates. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(Math.ceil(rate.resetMs / 1000)) } });
  try {
    const action = handleBuilder({ userId, access, ...parsed.data });
    return NextResponse.json({ action }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error.status ? error.message : "Test configuration is unavailable." }, { status: error.status || 503, headers: { "Cache-Control": "no-store" } });
  }
}
