import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeUsername, validateUsername, USERNAME_PATTERN } from "@/lib/username";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = normalizeUsername(searchParams.get("q"));
    const mode = searchParams.get("mode") === "exact" ? "exact" : "prefix";
    const limit = Math.min(10, Math.max(1, Number(searchParams.get("limit")) || 8));

    if (!query || query.length < 1 || query.length > 20 || !/^[a-z0-9_]+$/.test(query)) {
      return NextResponse.json({ users: [] });
    }

    if (mode === "exact") {
      const validation = validateUsername(query);
      if (!validation.ok) return NextResponse.json({ users: [] });
    } else if (!USERNAME_PATTERN.test(query.padEnd(3, "a").slice(0, Math.max(3, query.length)))) {
      return NextResponse.json({ users: [] });
    }

    const baseSelect = "id, username, full_name, exam, target_year";
    const { data, error } = mode === "exact"
      ? await supabaseAdmin
        .from("user_profiles")
        .select(baseSelect)
        .eq("username", query)
        .limit(1)
      : await supabaseAdmin
        .from("user_profiles")
        .select(baseSelect)
        .ilike("username", `${query}%`)
        .order("username", { ascending: true })
        .limit(limit);

    if (error) throw error;

    const users = (data || []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.full_name || "PrepZii Student",
      exam: profile.exam || "JEE",
      targetYear: profile.target_year || null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[USERNAME_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
