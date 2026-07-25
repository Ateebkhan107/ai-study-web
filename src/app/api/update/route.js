import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { addXP } from "@/lib/xp";



export async function POST(req) {

  try {

    const { userId } = await auth();


    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    }


    const user = await currentUser();


    const body = await req.json();


    const {

      correctAnswers = 0,

      totalQuestions = 0,

      source = "pyq",

    } = body;



    // XP RULE
    // PYQ correct = 10 XP
    // Test correct = 15 XP


    const gainedXP =
      source === "test"
        ? correctAnswers * 15
        : correctAnswers * 10;




    const { data: existingUser } =
      await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", userId)
        .single();




    const name = user?.firstName || user?.username || "Student";
    
    let stats = {};

    if (existingUser) {
      const newSolved = (existingUser.pyq_solved || 0) + totalQuestions;
      const newCorrect = (existingUser.correct_answers || 0) + correctAnswers;
      const newAccuracy = newSolved > 0 ? Math.round((newCorrect / newSolved) * 100) : 0;
      
      stats = {
        pyq_solved: newSolved,
        correct_answers: newCorrect,
        accuracy: newAccuracy
      };
    } else {
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      stats = {
        pyq_solved: totalQuestions,
        correct_answers: correctAnswers,
        accuracy
      };
    }

    await addXP(userId, gainedXP, name, false, stats);




    return NextResponse.json({


      success:true,


      source,


      xpAdded:gainedXP,


    });



  }


  catch(error){


    console.error(
      "XP update failed:",
      error
    );


    return NextResponse.json(

      {
        error:
        "XP update failed"
      },


      {
        status:500
      }

    );

  }


}