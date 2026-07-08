import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createProfileIfNotExists } from "@/services/profile.service";



// LEVEL SYSTEM
function getLevel(xp) {


  if (xp >= 10000) {

    return {
      level:"Master",
      badge:"👑",
      progress:100
    };

  }



  if (xp >= 5000) {

    return {
      level:"Legend",
      badge:"💎",
      progress:Math.floor(
        ((xp-5000)/5000)*100
      )
    };

  }




  if (xp >= 2000) {

    return {
      level:"Champion",
      badge:"🔥",
      progress:Math.floor(
        ((xp-2000)/3000)*100
      )
    };

  }





  if (xp >= 500) {

    return {
      level:"Achiever",
      badge:"⚡",
      progress:Math.floor(
        ((xp-500)/1500)*100
      )
    };

  }




  return {

    level:"Explorer",
    badge:"🌱",
    progress:Math.floor(
      (xp/500)*100
    )

  };


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






    const xp =
    xpData?.xp || 0;


    const levelData =
    getLevel(xp);







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