import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Atom, Calculator, Dna, FlaskConical, Layers3 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getFormulaSubjectsForExam } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

const SUBJECT_ICONS = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
  Biology: Dna,
};

async function getPreferredExam() {
  const { userId } = await auth();
  if (!userId) return "JEE";

  const { data } = await supabaseAdmin
    .from("user_profiles")
    .select("exam")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return String(data?.exam || "").toUpperCase() === "NEET" ? "NEET" : "JEE";
}

function SubjectGroup({ exam, subjects, preferred }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
            {exam}
          </p>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            {exam === "NEET" ? "Medical track" : "Engineering track"}
          </h2>
        </div>
        {preferred && (
          <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Your track
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {subjects.map((subject) => {
          const Icon = SUBJECT_ICONS[subject.name] || Layers3;
          const deckLabel = subject.exam === "NEET" && subject.name === "Biology" ? "revision cards" : "formula cards";
          return (
            <Link
              key={subject.id}
              href={`/formula-cards/${subject.slug}?exam=${subject.exam}`}
              className="group rounded-2xl border border-slate-200 bg-[var(--card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg dark:border-stone-800 dark:bg-[var(--surface)] dark:hover:border-amber-500/50"
            >
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">{subject.name}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-stone-400">
                Open chapter-wise {deckLabel}.
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function FormulaCardsPage() {
  const preferredExam = await getPreferredExam();
  const [jeeSubjects, neetSubjects] = await Promise.all([
    getFormulaSubjectsForExam("JEE"),
    getFormulaSubjectsForExam("NEET"),
  ]);
  const orderedGroups =
    preferredExam === "NEET"
      ? [
          ["NEET", neetSubjects],
          ["JEE", jeeSubjects],
        ]
      : [
          ["JEE", jeeSubjects],
          ["NEET", neetSubjects],
        ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <Link href="/dashboard" className="text-sm font-black text-slate-500 transition hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-300">
            Back to dashboard
          </Link>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-stone-400">
              Formula Cards
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              Choose a subject
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-stone-300">
              Native revision cards for formulas, tables, and quick concept checks.
            </p>
          </div>
        </header>

        {orderedGroups.map(([exam, subjects]) => (
          <SubjectGroup key={exam} exam={exam} subjects={subjects} preferred={exam === preferredExam} />
        ))}
      </div>
    </main>
  );
}
