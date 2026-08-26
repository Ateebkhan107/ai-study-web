import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validateUsername } from "@/lib/username";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validation = validateUsername(searchParams.get("username"));

    if (!validation.ok) {
      return NextResponse.json({
        available: false,
        valid: false,
        username: validation.username,
        error: validation.error,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("clerk_user_id")
      .eq("username", validation.username)
      .maybeSingle();

    if (error) {
      const message = String(error.message || "").toLowerCase();
      if (error.code === "42703" || message.includes("username")) {
        return NextResponse.json(
          {
            available: false,
            valid: true,
            username: validation.username,
            error: "Username database migration is not applied yet.",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    const available = !data || data.clerk_user_id === userId;

    return NextResponse.json({
      available,
      valid: true,
      username: validation.username,
      error: available ? "" : "Already taken.",
    });
  } catch (error) {
    console.error("[USERNAME_AVAILABILITY_ERROR]", error);
    return NextResponse.json({ error: "Unable to check username right now." }, { status: 500 });
  }
}
