import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const track = profile?.exam === "NEET" ? "NEET" : "JEE";

    return NextResponse.json({
      track,
      readinessScore: 60,
      topics:
        track === "NEET"
          ? [
              { subject: "Biology", topic: "Genetics & Evolution", efficiency: 84 },
              { subject: "Chemistry", topic: "Organic Chemistry", efficiency: 62 },
              { subject: "Physics", topic: "Thermodynamics", efficiency: 45 },
            ]
          : [
              { subject: "Mathematics", topic: "Integral Calculus", efficiency: 76 },
              { subject: "Physics", topic: "Electrostatics", efficiency: 58 },
              { subject: "Chemistry", topic: "Chemical Bonding", efficiency: 49 },
            ],
    });
  } catch (error) {
    console.error("[ANALYTICS_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
