import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET() {

  const { data, error } = await supabase
    .from("pyq_questions")
    .select("*");


  console.log("PYQ DATA:", data);
  console.log("PYQ ERROR:", error);


  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }


  return NextResponse.json(data);
}