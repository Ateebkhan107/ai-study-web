import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelFromXP } from "@/utils/levelEngine";

const DEMO_STUDENTS = [
  ["Rahul", 2840, 412, 337],
  ["Abhijeet", 2715, 398, 322],
  ["Priya", 2590, 376, 301],
  ["Arjun", 2460, 354, 281],
  ["Sneha", 2345, 339, 267],
  ["Rohan", 2210, 316, 247],
  ["Ananya", 2095, 302, 235],
  ["Aditya", 1980, 287, 222],
  ["Ishita", 1875, 271, 208],
  ["Kunal", 1760, 254, 193],
  ["Meera", 1655, 241, 181],
  ["Siddharth", 1540, 226, 168],
  ["Kavya", 1435, 211, 155],
  ["Aman", 1320, 198, 144],
  ["Nisha", 1215, 182, 131],
  ["Varun", 1100, 168, 119],
  ["Riya", 995, 151, 105],
  ["Harsh", 880, 137, 94],
  ["Pooja", 765, 121, 81],
  ["Dev", 650, 106, 69],
].map(([name, xp, solved, correct], index) => ({
  user_id: `demo-student-${index + 1}`,
  name,
  xp,
  pyq_solved: solved,
  correct_answers: correct,
  accuracy: Math.round((correct / solved) * 100),
  is_demo: true,
}));


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

  const rankedUsers = [
    ...dedupedUsers.map((user) => ({ ...user, is_demo: false })),
    ...DEMO_STUDENTS,
  ].sort((a, b) => {
    const xpDiff = (Number(b.xp) || 0) - (Number(a.xp) || 0);
    if (xpDiff !== 0) return xpDiff;

    const aUpdatedAt = a.updated_at ? new Date(a.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bUpdatedAt = b.updated_at ? new Date(b.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
    return aUpdatedAt - bUpdatedAt;
  });

  const leaderboard =

    rankedUsers.map((user,index)=>{


      const levelData = getLevelFromXP(
        user.xp || 0
      );



      return {


        rank:index + 1,


        user_id:user.user_id,


        name:user.name,

        is_demo:user.is_demo,


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
