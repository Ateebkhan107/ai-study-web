import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    // 1. Parse the payload message arriving from Clerk's security system
    const payload = await req.json();
    const { data, type } = payload;

    // 2. Listen specifically for the "user.created" notification event
    if (type === "user.created") {
      const { id, first_name, last_name } = data;
      
      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "New Student";

      // Keep the initial profile row aligned with the onboarding table used elsewhere.
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          clerk_user_id: id,
          full_name: fullName,
          target_year: 2026,
          exam: "JEE",
        });

      if (error) {
        console.error("Supabase profile insertion error:", error);
        return new NextResponse("Database write failed", { status: 500 });
      }

      console.log(`Successfully created a live database profile for user: ${id}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
