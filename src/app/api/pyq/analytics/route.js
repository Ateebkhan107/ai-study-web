import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET(request) {

  try {

    const { data, error } = await supabase
      .from("pyq_attempts")
      .select("*");


    if (error) {

      console.log(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );

    }


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