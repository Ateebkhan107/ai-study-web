import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProfileIfNotExists } from "@/services/profile.service";



import { getLevelFromXP } from "@/utils/levelEngine";

async function getGlobalRank(userId, xp) {
  if (!userId) return null;

  const { count, error } = await supabaseAdmin
    .from("user_xp")
    .select("id", { count: "exact", head: true })
    .gt("xp", xp);

  if (error) {
    throw error;
  }

  return (count || 0) + 1;
}









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
    await supabaseAdmin

      .from("user_profiles")

      .select("id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at")

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
    await supabaseAdmin

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

    const rank = await getGlobalRank(userId, xp);







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


      rank,




      // LEVEL

      level:
        levelStats.currentLevel,


      badge: levelStats.title,


      progress:
        levelStats.progressPercentage



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
