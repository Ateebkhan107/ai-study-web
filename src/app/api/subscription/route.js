import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileAccessProfile, getSubscriptionForUser, isSubscriptionActive, normalizeExamTrack } from "@/lib/accessControl";

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedTrack = searchParams.get("examTrack");
    const profile = requestedTrack ? null : await getProfileAccessProfile(userId);
    const examTrack = normalizeExamTrack(requestedTrack || profile?.examTrack);
    const data = await getSubscriptionForUser(userId, examTrack);
    const isPro = isSubscriptionActive(data);

    return NextResponse.json({
      subscription: data,
      isPro,
      examTrack,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
