import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import FormulaCardDeck from "@/components/formula-cards/FormulaCardDeck";
import { getFormulaChapterDeck } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

export default async function FormulaDeckPage({ params, searchParams }) {
  const { subjectSlug, chapterSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject, chapter, cards, originalBook } = await getFormulaChapterDeck(subjectSlug, chapterSlug, exam);

  if (!subject || !chapter) notFound();

  const isBiologyRevision = subject.exam === "NEET" && subject.name === "Biology";
  const deckTitle = isBiologyRevision ? "Revision Cards" : "Formula Cards";

  return (
    <main className="min-h-screen bg-[var(--background)] px-3 py-4 text-slate-950 dark:text-white sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <header className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm">
            <Link
              href={`/formula-cards/${subject.slug}?exam=${subject.exam}`}
              className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-950 dark:text-stone-400 dark:hover:text-amber-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Chapters</span>
            </Link>
            <span className="text-slate-300 dark:text-stone-700">•</span>
            <Link
              href="/formula-cards"
              className="text-slate-400 transition-colors hover:text-slate-700 dark:text-stone-500 dark:hover:text-stone-300"
            >
              {deckTitle}
            </Link>
            <span className="text-slate-300 dark:text-stone-700">/</span>
            <Link
              href={`/formula-cards/${subject.slug}?exam=${subject.exam}`}
              className="text-slate-500 transition-colors hover:text-slate-900 dark:text-stone-400 dark:hover:text-amber-300"
            >
              {subject.name}
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 sm:text-[11px]">
                {subject.exam} • {subject.name}
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl font-display">
                {chapter.title}
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-stone-400 sm:text-sm tabular-nums">
                {cards.length} revision {cards.length === 1 ? "card" : "cards"}
              </p>
            </div>

            {originalBook?.id && (
              <Link
                href={`/formula-books/${originalBook.id}`}
                className="inline-flex h-9 sm:h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-800 dark:bg-[#141414] dark:text-stone-200 dark:hover:border-stone-700 dark:hover:text-amber-300 sm:w-auto"
              >
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>View original handbook</span>
              </Link>
            )}
          </div>
        </header>

        <FormulaCardDeck cards={cards} />
      </div>
    </main>
  );
}
