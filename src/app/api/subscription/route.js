import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionForUser, isSubscriptionActive } from "@/lib/accessControl";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getSubscriptionForUser(userId);
    const isPro = isSubscriptionActive(data);

    return NextResponse.json({
      subscription: data,
      isPro,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
