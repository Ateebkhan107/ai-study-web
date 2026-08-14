import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelFromXP } from "@/utils/levelEngine";

// PREPZII XP JOURNEY SYSTEM

export async function GET() {


  const { data, error } = await supabaseAdmin

    .from("user_xp")

    .select(
      `
      user_id,
      name,
      xp,
      pyq_solved,
      correct_answers,
      accuracy,
      updated_at
      `
    )

    .order(
      "xp",
      {
        ascending:false
      }
    )
    .order(
      "updated_at",
      {
        ascending:true
      }
    );





  if (error) {


    return NextResponse.json(

      {
        error:error.message
      },

      {
        status:500
      }

    );


  }






  const dedupedUsers = [];
  const usersById = new Map();

  for (const user of data || []) {
    const userId = String(user.user_id || "").trim();
    if (!userId) continue;

    const existing = usersById.get(userId);
    const userXp = Number(user.xp) || 0;
    const existingXp = Number(existing?.xp) || 0;
    const userUpdatedAt = user.updated_at ? new Date(user.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
    const existingUpdatedAt = existing?.updated_at ? new Date(existing.updated_at).getTime() : Number.MAX_SAFE_INTEGER;

    if (!existing || userXp > existingXp || (userXp === existingXp && userUpdatedAt < existingUpdatedAt)) {
      usersById.set(userId, user);
    }
  }

  dedupedUsers.push(...usersById.values());
  dedupedUsers.sort((a, b) => {
    const xpDiff = (Number(b.xp) || 0) - (Number(a.xp) || 0);
    if (xpDiff !== 0) return xpDiff;
    const aUpdatedAt = a.updated_at ? new Date(a.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bUpdatedAt = b.updated_at ? new Date(b.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
    return aUpdatedAt - bUpdatedAt;
  });

  const leaderboard =

    dedupedUsers.map((user,index)=>{


      const levelData = getLevelFromXP(
        user.xp || 0
      );



      return {


        rank:index + 1,


        user_id:user.user_id,


        name:user.name,

        xp:user.xp || 0,


        solved:user.pyq_solved || 0,


        correct:user.correct_answers || 0,


        accuracy:user.accuracy || 0,



        // LEVEL SYSTEM

        level:levelData.currentLevel,


        badge:levelData.title,


        progress:levelData.progressPercentage,


      };


    });





  return NextResponse.json(
    leaderboard
  );


}
