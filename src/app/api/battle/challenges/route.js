import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { BATTLE_EXPIRES_MINUTES, challengeIsExpired, findProfileByUsername, requireBattleProfile } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeUsername } from "@/lib/username";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

async function hydrateChallenges(challenges, currentUserId) {
  const ids = [
    ...new Set((challenges || []).flatMap((challenge) => [challenge.challenger_id, challenge.challenged_id]).filter(Boolean)),
  ];
  if (ids.length === 0) return [];

  const { data: profiles, error } = await supabaseAdmin
    .from("user_profiles")
    .select("clerk_user_id, username, full_name, exam, target_year")
    .in("clerk_user_id", ids);
  if (error) throw error;

  const byId = new Map((profiles || []).map((profile) => [profile.clerk_user_id, profile]));
  return (challenges || []).map((challenge) => {
    const opponentId = challenge.challenger_id === currentUserId ? challenge.challenged_id : challenge.challenger_id;
    const opponent = byId.get(opponentId);
    return {
      ...challenge,
      direction: challenge.challenger_id === currentUserId ? "outgoing" : "incoming",
      opponent: {
        id: opponent?.clerk_user_id,
        username: opponent?.username || null,
        displayName: opponent?.full_name || "PrepZii Student",
        exam: opponent?.exam || "JEE",
        targetYear: opponent?.target_year || null,
      },
    };
  });
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const username = normalizeUsername(searchParams.get("username"));

    if (username) {
      const profile = await findProfileByUsername(username);
      if (!profile) return NextResponse.json({ user: null });

      const { data: stats } = await supabaseAdmin
        .from("battle_stats")
        .select("wins, losses, draws, total_battles")
        .eq("user_id", profile.clerk_user_id)
        .maybeSingle();

      return NextResponse.json({
        user: {
          id: profile.clerk_user_id,
          username: profile.username,
          displayName: profile.displayName,
          exam: profile.exam,
          targetYear: profile.target_year || null,
          stats: stats || { wins: 0, losses: 0, draws: 0, totalBattles: 0 },
        },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("battle_challenges")
      .select("id, challenger_id, challenged_id, status, battle_id, expires_at, created_at")
      .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;

    return NextResponse.json({ challenges: await hydrateChallenges(data || [], userId) });
  } catch (error) {
    console.error("[BATTLE_CHALLENGES_GET_ERROR]", error);
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const currentProfile = await requireBattleProfile(userId);
    const opponent = await findProfileByUsername(body.username);

    if (!opponent) return NextResponse.json({ error: "No student found with that username." }, { status: 404 });
    if (opponent.clerk_user_id === userId) {
      return NextResponse.json({ error: "You cannot challenge yourself." }, { status: 400 });
    }
    if (opponent.exam !== currentProfile.exam) {
      return NextResponse.json({ error: `Battle Arena matches ${currentProfile.exam} students only.` }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("battle_challenges")
      .select("id, status, expires_at")
      .eq("challenger_id", userId)
      .eq("challenged_id", opponent.clerk_user_id)
      .eq("status", "PENDING")
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing && !challengeIsExpired(existing)) {
      return NextResponse.json({ challenge: existing, status: "pending" });
    }

    if (existing && challengeIsExpired(existing)) {
      await supabaseAdmin.from("battle_challenges").update({ status: "EXPIRED" }).eq("id", existing.id);
    }

    const expiresAt = new Date(Date.now() + BATTLE_EXPIRES_MINUTES * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("battle_challenges")
      .insert({
        challenger_id: userId,
        challenged_id: opponent.clerk_user_id,
        status: "PENDING",
        expires_at: expiresAt,
      })
      .select("id, challenger_id, challenged_id, status, battle_id, expires_at, created_at")
      .single();
    if (error) throw error;

    return NextResponse.json({ challenge: data, status: "pending" });
  } catch (error) {
    console.error("[BATTLE_CHALLENGES_POST_ERROR]", error);
    return jsonError(error);
  }
}
