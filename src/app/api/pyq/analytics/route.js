import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


import { auth } from "@clerk/nextjs/server";

export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track")?.toUpperCase() || "JEE";
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: rawData, error } = await supabase
      .from("pyq_attempts")
      .select("*, pyq_questions(exam)")
      .eq("user_id", userId);

    if (error) {

      console.log(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );

    }


    const data = (rawData || []).filter(a => {
        const ex = a.pyq_questions?.exam;
        if (!ex) return false;
        return ex.toUpperCase().includes(track === "JEE" ? "JEE" : "NEET");
    });

    const totalAttempts = data.length;


    const correctAnswers = data.filter(
      (attempt) => attempt.is_correct === true
    ).length;


    const accuracy =
      totalAttempts > 0
        ? Math.round(
            (correctAnswers / totalAttempts) * 100
          )
        : 0;



    return NextResponse.json({

      totalAttempts,

      correctAnswers,

      wrongAnswers:
        totalAttempts - correctAnswers,

      accuracy,

      topics: []

    });


  } catch (err) {


    return NextResponse.json(
      {
        error: err.message
      },
      {
        status: 500
      }
    );


  }

}