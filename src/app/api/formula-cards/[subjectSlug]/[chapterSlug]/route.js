import { getFormulaChapterDeck } from "@/lib/formulaCards";
import { formulaExam } from "@/lib/seo.mjs";

export const dynamic = "force-dynamic";
const responseOptions = { headers: { "Cache-Control": "no-store" } };

export async function GET(request, { params }) {
  const { subjectSlug, chapterSlug } = await params;
  const exam = formulaExam(new URL(request.url).searchParams.get("exam"));
  try {
    const { chapter, cards } = await getFormulaChapterDeck(subjectSlug, chapterSlug, exam);
    if (!chapter) {
      return Response.json({ error: "Chapter not found" }, { ...responseOptions, status: 404 });
    }
    return Response.json({ cards }, responseOptions);
  } catch (error) {
    console.error("[FORMULA_CARDS_DECK_ERROR]", error);
    return Response.json({ error: "Cards temporarily unavailable" }, { ...responseOptions, status: 503 });
  }
}
