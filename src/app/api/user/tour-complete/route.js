import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const existingMetadata = user.publicMetadata || {};
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMetadata,
        productTourCompleted: true,
      },
    });

    return NextResponse.json({ success: true, productTourCompleted: true });
  } catch (error) {
    console.error("[TOUR_COMPLETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
