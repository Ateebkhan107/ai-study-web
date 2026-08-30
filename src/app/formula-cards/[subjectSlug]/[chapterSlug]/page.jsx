import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import FormulaCardDeck from "@/components/formula-cards/FormulaCardDeck";
import { getFormulaChapterDeck } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

export default async function FormulaDeckPage({ params, searchParams }) {
  const { subjectSlug, chapterSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject, chapter, cards, originalBook } = await getFormulaChapterDeck(subjectSlug, chapterSlug, exam);

  if (!subject || !chapter) notFound();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-500 dark:text-stone-400">
              <Link href="/formula-cards" className="transition hover:text-amber-700 dark:hover:text-amber-300">
                Formula Cards
              </Link>
              <span>/</span>
              <Link href={`/formula-cards/${subject.slug}?exam=${subject.exam}`} className="transition hover:text-amber-700 dark:hover:text-amber-300">
                {subject.name}
              </Link>
            </div>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              {subject.exam} - {subject.name}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              {chapter.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-stone-300">
              {cards.length} source-backed revision {cards.length === 1 ? "card" : "cards"} from the {subject.name} Formula Handbook.
            </p>
          </div>

          {originalBook?.id && (
            <Link
              href={`/formula-books/${originalBook.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            >
              <FileText className="h-4 w-4" />
              View original handbook
            </Link>
          )}
        </header>

        <FormulaCardDeck cards={cards} />
      </div>
    </main>
  );
}
