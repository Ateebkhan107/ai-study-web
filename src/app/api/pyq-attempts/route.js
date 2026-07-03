import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req) {

  try {

    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    console.log("BODY RECEIVED:", body);


    const { data, error } = await supabase
      .from("pyq_attempts")
      .insert({
        user_id: userId,
        question_id: body.question_id,
        selected_option: body.selected_option,
        is_correct: body.is_correct
      })
      .select();


    if (error) {

      console.log("SUPABASE INSERT ERROR:", error);

      return NextResponse.json(
        {
          error: error.message
        },
        {
          status: 500
        }
      );

    }


    return NextResponse.json(data);


  } catch (err) {


    console.log("SERVER ERROR:", err);


    return NextResponse.json(
      {
        error: err.message
      },
      {
        status:500
      }
    );

  }

}