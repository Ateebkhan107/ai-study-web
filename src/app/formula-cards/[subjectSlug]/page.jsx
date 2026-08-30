import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { getFormulaChaptersForSubject, getOriginalFormulaBook } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

export default async function FormulaSubjectPage({ params, searchParams }) {
  const { subjectSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject, chapters } = await getFormulaChaptersForSubject(subjectSlug, exam);

  if (!subject) notFound();

  const originalBook = await getOriginalFormulaBook(subject.name, subject.exam);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="space-y-3">
          <Link href="/formula-cards" className="text-sm font-black text-slate-500 transition hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-300">
            Formula Cards
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                {subject.exam}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                {subject.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-stone-300">
                Pick a chapter to open the interactive formula deck.
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
          </div>
        </header>

        {chapters.length > 0 ? (
          <section className="grid gap-3 sm:grid-cols-2">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/formula-cards/${subject.slug}/${chapter.slug}?exam=${subject.exam}`}
                className="group rounded-2xl border border-slate-200 bg-[var(--card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg dark:border-stone-800 dark:bg-[var(--surface)] dark:hover:border-amber-500/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">{chapter.title}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-500 dark:text-stone-400">
                        {chapter.card_count} {chapter.card_count === 1 ? "card" : "cards"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600 dark:text-stone-500 dark:group-hover:text-amber-300" />
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-[var(--card)] p-8 text-center dark:border-stone-700 dark:bg-[var(--surface)]">
            <p className="text-sm font-bold text-slate-500 dark:text-stone-400">
              Formula cards for {subject.name} are not available yet.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
