import Link from "next/link";
import { cache } from "react";
import { formulaExam, formulaPath, NOINDEX, publicMetadata } from "@/lib/seo.mjs";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormulaCardDeck from "@/components/formula-cards/FormulaCardDeck";
import { getFormulaChapterDeck } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

const loadDeck = cache(getFormulaChapterDeck);

export async function generateMetadata({ params, searchParams }) {
  const { subjectSlug, chapterSlug } = await params;
  const query = await searchParams;
  const { subject, chapter, cards } = await loadDeck(subjectSlug, chapterSlug, formulaExam(query?.exam));
  if (!subject || !chapter) return { robots: NOINDEX };

  const resource = subject.name === "Biology" ? "Revision Cards" : "Formula Cards";
  return {
    ...publicMetadata({
      title: `${chapter.title} ${resource} for ${subject.exam}`,
      description: `Revise ${chapter.title} with ${subject.name} study cards for ${subject.exam}. Explore available formulas, definitions and concept checks on PrepZii.`,
      path: formulaPath(subject.slug, chapter.slug, subject.exam),
    }),
    ...(cards.length ? {} : { robots: NOINDEX }),
  };
}

export default async function FormulaDeckPage({ params, searchParams }) {
  const { subjectSlug, chapterSlug } = await params;
  const query = await searchParams;
  const exam = formulaExam(query?.exam);
  const { subject, chapter, cards } = await loadDeck(subjectSlug, chapterSlug, exam);

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

          </div>
        </header>

        <FormulaCardDeck
          key={chapter.id}
          cards={cards.map(({ id, importance }) => ({ id, importance }))}
          initialCards={cards.slice(0, 2)}
          chapterId={chapter.id}
          deckUrl={`/api/formula-cards/${encodeURIComponent(subjectSlug)}/${encodeURIComponent(chapterSlug)}?exam=${exam}`}
        />
      </div>
    </main>
  );
}
