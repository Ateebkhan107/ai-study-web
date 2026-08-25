import Link from "next/link";
import { Atom, FlaskConical, Calculator, Dna, BookOpen, ChevronRight } from "lucide-react";
import { getCachedFormulaBookSummaries } from "@/lib/formulaBooks";
import SubjectVisual from "@/components/SubjectVisual";

// Subject → Premium Book Visual Identity
const SUBJECT_META = {
  Chemistry: { 
    icon: FlaskConical, 
    spine: "bg-emerald-500",
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20", 
    border: "border-emerald-500/20 dark:border-emerald-500/30"  
  },
  Mathematics: { 
    icon: Calculator, 
    spine: "bg-indigo-500",
    color: "text-indigo-500", 
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20", 
    border: "border-indigo-500/20 dark:border-indigo-500/30"  
  },
  Physics: { 
    icon: Atom,
    spine: "bg-amber-500",
    color: "text-amber-500", 
    bg: "bg-amber-500/10 dark:bg-amber-500/20", 
    border: "border-amber-500/20 dark:border-amber-500/30"  
  },
  Biology: { 
    icon: Dna, 
    spine: "bg-rose-500",
    color: "text-rose-500", 
    bg: "bg-rose-500/10 dark:bg-rose-500/20", 
    border: "border-rose-500/20 dark:border-rose-500/30"  
  },
};

function getMeta(subject) {
  return SUBJECT_META[subject] || { 
    icon: BookOpen, 
    spine: "bg-blue-500",
    color: "text-blue-500", 
    bg: "bg-blue-500/10 dark:bg-blue-500/20", 
    border: "border-blue-500/20 dark:border-blue-500/30" 
  };
}

export default async function DashboardSection({ config, compact = false }) {
  const isNeet = config?.badge?.toLowerCase().includes("neet");
  const formulaBooks = await getCachedFormulaBookSummaries();

  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );
  const subjectOrder = (config?.subjects || []).map((subject) => subject.label);
  const orderedFormulas = subjectOrder
    .map((subject) => filteredFormulas.find((book) => book.subject === subject))
    .filter(Boolean);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>

      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Quick Study
        </h2>
      </div>

      {orderedFormulas.length > 0 && (
        <div className={`grid grid-cols-2 gap-2.5 md:grid-cols-2 ${
          compact ? "py-0 sm:gap-3 lg:grid-cols-1" : "py-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
        }`}>
          {orderedFormulas.map((book) => {
            const meta = getMeta(book.subject);
            const Icon = meta.icon;
            
            return (
              <Link href={`/formula-books/${book.id}`} key={book.id} className="block group">
                <div 
                  className={`relative flex h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--card)] transition-colors duration-200 hover:border-brand/50 dark:border-[var(--border)]/50 dark:bg-[var(--surface)] ${
                    compact ? "min-h-[86px] sm:min-h-[92px] lg:min-h-[108px]" : "min-h-[120px] flex-col sm:min-h-[160px]"
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 z-20 w-1.5 ${meta.spine}`} />
                  <SubjectVisual
                    subject={book.subject}
                    className={`absolute -bottom-5 -right-5 h-20 w-20 opacity-[0.055] dark:opacity-[0.075] sm:h-24 sm:w-24 ${meta.color}`}
                  />

                  <div className={`relative z-10 flex h-full min-w-0 pl-4 pr-3 sm:pl-5 sm:pr-4 ${
                    compact ? "flex-col justify-between py-3 lg:flex-row lg:items-center lg:gap-3 lg:py-3" : "flex-col justify-between py-3 sm:py-5"
                  }`}>
                    <span className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color} ${meta.border} sm:gap-1.5 sm:text-[10px] sm:px-2.5`}>
                        <Icon className="w-3 h-3" strokeWidth={2.5} />
                        {book.subject}
                      </span>

                    <h3 className={`min-w-0 text-sm font-black leading-snug text-slate-900 transition-colors group-hover:text-amber-700 dark:text-white dark:group-hover:text-brand ${
                      compact ? "mt-2 lg:mt-0 lg:flex-1" : "mt-3 sm:text-base"
                    }`}>
                      {book.title}
                    </h3>

                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand group-hover:text-black dark:bg-[var(--surface-elevated)] dark:text-slate-300 ${
                      compact ? "mt-2 self-start lg:mt-0 lg:self-center" : "mt-2"
                    }`}>
                      <ChevronRight className={`w-4 h-4 ${meta.color}`} strokeWidth={2.5} />
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {orderedFormulas.length === 0 && (
        <div className="relative overflow-hidden bg-slate-50/50 dark:bg-[var(--surface)]/30 border border-dashed border-slate-300 dark:border-[var(--border)] rounded-2xl p-6 text-center flex flex-col items-center justify-center">
          <SubjectVisual
            subject={isNeet ? "Biology" : "Physics"}
            className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 text-slate-900 opacity-[0.035] dark:text-white dark:opacity-[0.055]"
          />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-[var(--surface-elevated)] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
            No Library Books Found
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm">
            We haven&apos;t added any formula handbooks for {isNeet ? "NEET" : "JEE"} yet. Check back soon for updates!
          </p>
        </div>
      )}

    </div>
  );
}
