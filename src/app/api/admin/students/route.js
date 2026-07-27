import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";

export async function GET(req) {
  const admin = await isAdmin();
  
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const track = searchParams.get("track") || "ALL";
  
  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, clerk_id, username, full_name, track, target_year, xp, current_level, rank_name, created_at')
      .order('xp', { ascending: false });

    if (track !== "ALL") {
      query = query.eq('track', track);
    }
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    // Limit to top 100 for performance on admin panel
    query = query.limit(100);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, students: data });

  } catch (error) {
    console.error("Fetch Students Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
