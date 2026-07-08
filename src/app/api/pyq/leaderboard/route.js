import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


// XP LEVEL SYSTEM
function getLevel(xp) {

  if (xp >= 10000) {
    return {
      level: "Master",
      badge: "👑",
      progress: 100,
    };
  }


  if (xp >= 5000) {
    return {
      level: "Diamond",
      badge: "💎",
      progress: Math.floor(
        ((xp - 5000) / 5000) * 100
      ),
    };
  }


  if (xp >= 2000) {
    return {
      level: "Gold",
      badge: "🥇",
      progress: Math.floor(
        ((xp - 2000) / 3000) * 100
      ),
    };
  }


  if (xp >= 500) {
    return {
      level: "Silver",
      badge: "🥈",
      progress: Math.floor(
        ((xp - 500) / 1500) * 100
      ),
    };
  }


  return {
    level: "Bronze",
    badge: "🥉",
    progress: Math.floor(
      (xp / 500) * 100
    ),
  };

}



export async function GET() {

  const { data, error } = await supabase
    .from("user_xp")
    .select(
      `
      user_id,
      name,
      xp,
      pyq_solved,
      correct_answers,
      accuracy
      `
    )
    .order(
      "xp",
      {
        ascending:false
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



  const leaderboard =
    data.map((user,index)=>{

      const levelData = getLevel(
        user.xp || 0
      );


      return {

        rank:index+1,

        user_id:user.user_id,

        name:user.name,

        xp:user.xp,

        solved:user.pyq_solved,

        correct:user.correct_answers,

        accuracy:user.accuracy,


        // NEW LEVEL SYSTEM
        level:levelData.level,

        badge:levelData.badge,

        progress:levelData.progress,

      };

    });



  return NextResponse.json(
    leaderboard
  );

}