import { NextResponse } from "next/server";
import { getCachedFormulaBookSummaries } from "@/lib/formulaBooks";

export async function GET() {
  const data = await getCachedFormulaBookSummaries();
  return NextResponse.json(data);
}
