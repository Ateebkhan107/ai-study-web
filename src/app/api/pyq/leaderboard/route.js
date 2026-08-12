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
      accuracy
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






  const leaderboard =

    data.map((user,index)=>{


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
