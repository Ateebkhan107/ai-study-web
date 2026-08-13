import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("pyq_questions")
    .select("id, exam, subject, chapter, status")
    .limit(1);

  return NextResponse.json({ data });
}
