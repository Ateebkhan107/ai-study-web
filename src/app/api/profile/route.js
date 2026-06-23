import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createProfileIfNotExists } from "@/services/profile.service";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!profile) {
      const user = await currentUser();

      if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      profile = await createProfileIfNotExists(user);
    }

    return NextResponse.json({
      ...profile,
      current_track: profile.current_track || profile.exam?.toLowerCase() || "jee",
      target_year: profile.target_year || new Date().getFullYear(),
    });
  } catch (error) {
    console.error("[PROFILE_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
