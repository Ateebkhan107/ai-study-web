import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Legacy client counters are not proof of completed activity. PYQ and test
// submissions have their own authenticated persistence endpoints.
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    { error: "Rewards require a persisted activity. Use the submission endpoint." },
    { status: 409 }
  );
}
