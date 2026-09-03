import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfilePageData } from "@/services/profile.server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await getProfilePageData(userId, sessionClaims);
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
