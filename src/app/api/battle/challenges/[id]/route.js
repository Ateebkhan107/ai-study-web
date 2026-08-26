import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { challengeIsExpired, createBattleForPlayers, getBattleProfile } from "@/lib/battle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(error, fallback = 500) {
  return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: error.status || fallback });
}

export async function PATCH(request, context) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();
    const action = body.action === "accept" ? "accept" : "decline";

    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from("battle_challenges")
      .select("id, challenger_id, challenged_id, status, battle_id, expires_at")
      .eq("id", id)
      .maybeSingle();
    if (challengeError) throw challengeError;
    if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    if (challenge.challenged_id !== userId) return NextResponse.json({ error: "Only the challenged student can respond." }, { status: 403 });
    if (challenge.status !== "PENDING") return NextResponse.json({ error: "Challenge is no longer pending." }, { status: 400 });

    if (challengeIsExpired(challenge)) {
      await supabaseAdmin.from("battle_challenges").update({ status: "EXPIRED" }).eq("id", challenge.id);
      return NextResponse.json({ error: "Challenge expired." }, { status: 400 });
    }

    if (action === "decline") {
      const { data, error } = await supabaseAdmin
        .from("battle_challenges")
        .update({ status: "DECLINED" })
        .eq("id", challenge.id)
        .select("id, status")
        .single();
      if (error) throw error;
      return NextResponse.json({ challenge: data });
    }

    const [challenger, challenged] = await Promise.all([
      getBattleProfile(challenge.challenger_id),
      getBattleProfile(challenge.challenged_id),
    ]);
    if (!challenger?.username || !challenged?.username) {
      return NextResponse.json({ error: "Both students need usernames before battling." }, { status: 428 });
    }
    if (challenger.exam !== challenged.exam) {
      return NextResponse.json({ error: "Challenge exam track mismatch." }, { status: 400 });
    }

    const match = await createBattleForPlayers({
      exam: challenged.exam,
      playerAId: challenge.challenger_id,
      playerBId: challenge.challenged_id,
    });

    const { data, error } = await supabaseAdmin
      .from("battle_challenges")
      .update({ status: "ACCEPTED", battle_id: match.id })
      .eq("id", challenge.id)
      .select("id, status, battle_id")
      .single();
    if (error) throw error;

    return NextResponse.json({ challenge: data, battleId: match.id });
  } catch (error) {
    console.error("[BATTLE_CHALLENGE_PATCH_ERROR]", error);
    return jsonError(error);
  }
}
