import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createProfileIfNotExists } from "@/services/profile.service";



import { getLevelFromXP } from "@/utils/levelEngine";









export async function GET() {


  try {


    const { userId } = await auth();



    if (!userId) {

      return new NextResponse(
        "Unauthorized",
        {status:401}
      );

    }






    // GET PROFILE

    let {data:profile,error} =
    await supabase

      .from("user_profiles")

      .select("*")

      .eq(
        "clerk_user_id",
        userId
      )

      .maybeSingle();






    if(error){

      throw error;

    }







    // CREATE PROFILE IF MISSING

    if(!profile){


      const user =
      await currentUser();



      if(!user){

        return new NextResponse(
          "Unauthorized",
          {status:401}
        );

      }



      profile =
      await createProfileIfNotExists(
        user
      );


    }









    // GET XP DATA

    const {data:xpData} =
    await supabase

      .from("user_xp")

      .select(
        `
        xp,
        pyq_solved,
        correct_answers,
        accuracy
        `
      )

      .eq(
        "user_id",
        userId
      )

      .maybeSingle();






    const xp = xpData?.xp || 0;
    const levelStats = getLevelFromXP(xp);

    const levelData = {
      level: levelStats.currentLevel,
      progress: levelStats.progressPercentage
    };







    return NextResponse.json({


      ...profile,


      current_track:

        profile.current_track ||

        profile.exam?.toLowerCase()

        ||

        "jee",



      target_year:

        profile.target_year ||

        new Date().getFullYear(),




      // XP DATA

      xp,

      pyq_solved:
        xpData?.pyq_solved || 0,


      correct_answers:
        xpData?.correct_answers || 0,


      accuracy:
        xpData?.accuracy || 0,




      // LEVEL

      level:
        levelData.level,


      badge:
        levelData.badge,


      progress:
        levelData.progress



    });





  } 
  
  

  catch(error){


    console.error(
      "[PROFILE_FETCH_ERROR]",
      error
    );


    return new NextResponse(
      "Internal Server Error",
      {status:500}
    );


  }


}