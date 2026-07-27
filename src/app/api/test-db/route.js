import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase.from('pyq_questions').select('*').limit(1);
  return NextResponse.json({ data });
}
