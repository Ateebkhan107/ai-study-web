import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildFeaturePermissions, getUserAccessContext } from "@/lib/accessControl";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser().catch(() => null);
    const access = await getUserAccessContext({
      userId,
      email: user?.primaryEmailAddress?.emailAddress || "",
    });

    return NextResponse.json({
      plan: access.plan,
      accountType: access.accountType,
      isPro: access.isPro,
      subscription: access.subscription,
      isPlatformAdmin: access.isPlatformAdmin,
      institutes: access.instituteMemberships.map((membership) => ({
        ...membership.institute,
        role: membership.role,
        member_status: membership.status,
      })),
      customTestUsage: access.customTestUsage,
      features: buildFeaturePermissions(access),
    });
  } catch (error) {
    console.error("[ACCESS_CONTEXT_ERROR]", error);
    return NextResponse.json({ error: "Failed to load access context" }, { status: 500 });
  }
}
