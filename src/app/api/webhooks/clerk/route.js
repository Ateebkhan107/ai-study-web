import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; // Standard client used for server administrative operations

export async function POST(req) {
  try {
    // 1. Parse the payload message arriving from Clerk's security system
    const payload = await req.json();
    const { data, type } = payload;

    // 2. Listen specifically for the "user.created" notification event
    if (type === "user.created") {
      const { id, first_name, last_name, phone_numbers } = data;
      
      const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "New Student";
      const primaryPhone = phone_numbers?.[0]?.phone_number || null;

      // 3. Automatically insert a matching blank profile locker into your Supabase vault
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: id, // Matches Clerk's unique user ID perfectly
          full_name: fullName,
          phone_number: primaryPhone,
          current_track: "jee", // Defaults safely to JEE track initialization
          target_year: 2026,
          exam_readiness_score: 60,
          level: 1,
          xp: 0
        });

      if (error) {
        console.error("Supabase profile insertion error:", error);
        return new NextResponse("Database write failed", { status: 500 });
      }

      console.log(`Successfully created a live database locker for user: ${id}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}