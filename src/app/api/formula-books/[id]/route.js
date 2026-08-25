import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";
import { FEATURES, canUseFeature, getUserAccessContext } from "@/lib/accessControl";

export async function GET(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser().catch(() => null);
  const access = await getUserAccessContext({
    userId,
    email: user?.primaryEmailAddress?.emailAddress || "",
  });
  const permission = canUseFeature(access, FEATURES.FORMULA_HANDBOOK);

  if (!permission.allowed) {
    return NextResponse.json(
      { error: "ACCESS_DENIED", message: "Formula Handbook is not available for this account." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("formula_books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
