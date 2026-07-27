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
      .from('user_profiles')
      .select('id, clerk_user_id, email, full_name, exam, class_level, target_year, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (track !== "ALL") {
      query = query.eq('exam', track);
    }
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Limit to top 100 for performance on admin panel
    query = query.limit(100);

    const { data: profilesData, error: profilesError } = await query;

    if (profilesError) throw profilesError;

    if (!profilesData || profilesData.length === 0) {
      return NextResponse.json({ success: true, students: [] });
    }

    const clerkUserIds = profilesData.map(p => p.clerk_user_id).filter(Boolean);

    // Left Join Logic: Fetch optional data manually to avoid FK constraint errors
    const [xpRes, badgesRes, analyticsRes] = await Promise.all([
      supabaseAdmin.from('user_xp').select('*').in('user_id', clerkUserIds),
      supabaseAdmin.from('user_badges').select('user_id').in('user_id', clerkUserIds),
      supabaseAdmin.from('test_attempts').select('user_id').in('user_id', clerkUserIds)
    ]);

    const xpData = xpRes.data || [];
    const badgesData = badgesRes.data || [];
    const analyticsData = analyticsRes.data || [];

    const students = profilesData.map(profile => {
      const userXp = xpData.find(x => x.user_id === profile.clerk_user_id) || {};
      const userBadges = badgesData.filter(b => b.user_id === profile.clerk_user_id);
      const userAnalytics = analyticsData.filter(a => a.user_id === profile.clerk_user_id);

      return {
        ...profile,
        xp: userXp.xp || 0,
        current_level: userXp.level || 1,
        rank_name: userXp.rank_name || "Unranked",
        badges_count: userBadges.length,
        tests_taken: userAnalytics.length
      };
    });

    // Sort by XP descending manually since we fetched created_at from profiles
    students.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    return NextResponse.json({ success: true, students });

  } catch (error) {
    console.error("Fetch Students Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
