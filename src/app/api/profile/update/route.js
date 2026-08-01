import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updateData)
      .eq("clerk_user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ...data,
      current_track: data?.current_track || data?.exam?.toLowerCase() || body.current_track || "jee",
    });
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
