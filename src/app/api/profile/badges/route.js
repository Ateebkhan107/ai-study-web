import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserBadgeProgress } from "@/utils/badgeEngine";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const badges = await getUserBadgeProgress(userId);
    return NextResponse.json(badges);
  } catch (error) {
    console.error("[PROFILE_BADGES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
