import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("clerk_user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const isPro = Boolean(
      data?.expires_at && new Date(data.expires_at) > new Date()
    );

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
