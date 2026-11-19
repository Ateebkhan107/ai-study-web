import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isUniqueUsernameError, validateUsername } from "@/lib/username";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const updateData = {};

    if (typeof body.full_name === "string") {
      updateData.full_name = body.full_name;
    }

    if (typeof body.target_year === "number") {
      updateData.target_year = body.target_year;
    }

    if (typeof body.current_track === "string") {
      updateData.exam = body.current_track.toLowerCase() === "neet" ? "NEET" : "JEE";
    }

    if (typeof body.username === "string") {
      const validation = validateUsername(body.username);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updateData.username = validation.username;
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updateData)
      .eq("clerk_user_id", userId)
      .select("id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at")
      .maybeSingle();

    if (error) {
      if (isUniqueUsernameError(error)) {
        return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const currentTrack = data.exam?.toLowerCase() || "jee";
    const response = NextResponse.json({
      ...data,
      current_track: currentTrack,
    });

    if (updateData.exam) {
      response.cookies.set("prepzii_track", currentTrack, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: new URL(req.url).protocol === "https:",
      });
    }

    return response;
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
