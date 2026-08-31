import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, FileText } from "lucide-react";
import { getFormulaChaptersForSubject, getOriginalFormulaBook } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

export default async function FormulaSubjectPage({ params, searchParams }) {
  const { subjectSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject, chapters } = await getFormulaChaptersForSubject(subjectSlug, exam);

  if (!subject) notFound();

  const originalBook = await getOriginalFormulaBook(subject.name, subject.exam);
  const isBiologyRevision = subject.exam === "NEET" && subject.name === "Biology";
  const deckTitle = isBiologyRevision ? "Revision Cards" : "Formula Cards";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-7">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-950 dark:text-stone-400 dark:hover:text-amber-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-slate-300 dark:text-stone-700">•</span>
            <Link
              href="/formula-cards"
              className="text-slate-500 transition-colors hover:text-slate-900 dark:text-stone-400 dark:hover:text-amber-300"
            >
              {deckTitle}
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400 sm:text-[11px]">
                {subject.exam}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl font-display">
                  {subject.name}
                </h1>
                {chapters.length > 0 && (
                  <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-xs font-bold text-slate-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 tabular-nums">
                    {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 dark:text-stone-300 sm:text-base">
                Pick a chapter to open the interactive {isBiologyRevision ? "revision" : "formula"} deck.
              </p>
            </div>

            {originalBook?.id && (
              <Link
                href={`/formula-books/${originalBook.id}`}
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-stone-800 dark:bg-[#141414] dark:text-stone-200 dark:hover:border-stone-700 dark:hover:text-amber-300 sm:w-auto sm:text-sm"
              >
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>View original handbook</span>
              </Link>
            )}
          </div>
        </header>

        {chapters.length > 0 ? (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/formula-cards/${subject.slug}/${chapter.slug}?exam=${subject.exam}`}
                className="group flex items-center justify-between gap-3.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 transition-colors hover:border-amber-400/70 hover:bg-amber-50/20 dark:border-stone-800/80 dark:bg-[#131313] dark:hover:border-stone-700 dark:hover:bg-[#171717]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-300 sm:text-[15px]">
                      {chapter.title}
                    </h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-stone-400 tabular-nums">
                      {chapter.card_count} {chapter.card_count === 1 ? "card" : "cards"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-600 dark:group-hover:text-amber-400" />
              </Link>
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center dark:border-stone-800 dark:bg-[#131313]">
            <p className="text-sm font-medium text-slate-500 dark:text-stone-400">
              {deckTitle} for {subject.name} are not available yet.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
