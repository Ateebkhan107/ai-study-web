import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getAnalyticsForUser } from "@/services/analytics.server";
import { normalizeTrack } from "@/lib/analyticsHelpers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const track = normalizeTrack(searchParams.get("track") || "JEE");
    const { allowed, stats } = await getAnalyticsForUser(userId, track);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "PRO_REQUIRED",
          message: "Advanced Analytics is available with PrepZii Pro.",
          upgradeUrl: "/pro",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ANALYTICS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
