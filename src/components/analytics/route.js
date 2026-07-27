import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabaseToken = await getToken({ template: "supabase" });
    const supabaseClient = await getSupabaseClient(supabaseToken);

    // Pull the active student's metrics record
    const { data: profile, error } = await supabaseClient
      .from("user_profiles")
      .select("current_track, exam_readiness_score")
      .single();

    if (error) throw error;

    // Based on the track inside your database, we generate the proper topic data structure!
    const track = profile?.current_track?.toUpperCase() || "JEE";
    
    const analyticsData = {
      track: track,
      readinessScore: profile?.exam_readiness_score || 60,
      // Dynamic topics mapping to your exam selection!
      topics: track === "NEET" 
        ? [
            { subject: "Biology", topic: "Genetics & Evolution", efficiency: 84 },
            { subject: "Chemistry", topic: "Organic Chemistry", efficiency: 62 },
            { subject: "Physics", topic: "Thermodynamics", efficiency: 45 }
          ]
        : [
            { subject: "Mathematics", topic: "Integral Calculus", efficiency: 76 },
            { subject: "Physics", topic: "Electrostatics", efficiency: 58 },
            { subject: "Chemistry", topic: "Chemical Bonding", efficiency: 49 }
          ]
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[ANALYTICS_FETCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}