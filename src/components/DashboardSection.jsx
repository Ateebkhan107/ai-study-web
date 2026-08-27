import Link from "next/link";
import { Atom, FlaskConical, Calculator, Dna, BookOpen, ArrowRight } from "lucide-react";
import { getCachedFormulaBookSummaries } from "@/lib/formulaBooks";
import SubjectVisual from "@/components/SubjectVisual";

const SUBJECT_META = {
  Chemistry: { 
    icon: FlaskConical, 
    color: "text-emerald-600 dark:text-emerald-400", 
    border: "border-emerald-200/60 dark:border-emerald-500/20",
    gradient: "from-emerald-50/80 to-transparent dark:from-emerald-900/10 dark:to-transparent",
    hoverBorder: "hover:border-emerald-400/60 dark:hover:border-emerald-500/40",
    hoverShadow: "hover:shadow-emerald-500/10"
  },
  Mathematics: { 
    icon: Calculator, 
    color: "text-orange-600 dark:text-orange-400", 
    border: "border-orange-200/60 dark:border-orange-500/20",
    gradient: "from-orange-50/80 to-transparent dark:from-orange-900/10 dark:to-transparent",
    hoverBorder: "hover:border-orange-400/60 dark:hover:border-orange-500/40",
    hoverShadow: "hover:shadow-orange-500/10"
  },
  Physics: { 
    icon: Atom,
    color: "text-amber-600 dark:text-amber-400", 
    border: "border-amber-200/60 dark:border-amber-500/20",
    gradient: "from-amber-50/80 to-transparent dark:from-amber-900/10 dark:to-transparent",
    hoverBorder: "hover:border-amber-400/60 dark:hover:border-amber-500/40",
    hoverShadow: "hover:shadow-amber-500/10"
  },
  Biology: { 
    icon: Dna, 
    color: "text-rose-600 dark:text-rose-400", 
    border: "border-rose-200/60 dark:border-rose-500/20",
    gradient: "from-rose-50/80 to-transparent dark:from-rose-900/10 dark:to-transparent",
    hoverBorder: "hover:border-rose-400/60 dark:hover:border-rose-500/40",
    hoverShadow: "hover:shadow-rose-500/10"
  },
};

function getMeta(subject) {
  return SUBJECT_META[subject] || { 
    icon: BookOpen, 
    color: "text-blue-600 dark:text-blue-400", 
    border: "border-blue-200/60 dark:border-blue-500/20",
    gradient: "from-blue-50/80 to-transparent dark:from-blue-900/10 dark:to-transparent",
    hoverBorder: "hover:border-blue-400/60 dark:hover:border-blue-500/40",
    hoverShadow: "hover:shadow-blue-500/10"
  };
}

export default async function DashboardSection({ config, compact = false }) {
  const isNeet = config?.badge?.toLowerCase().includes("neet");
  const formulaBooks = await getCachedFormulaBookSummaries();

  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );
  
  const subjectOrder = (config?.subjects || []).map((subject) => subject.label);
  
  let orderedFormulas = subjectOrder
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
        <div className={`grid gap-3 sm:grid-cols-2 ${
          compact ? "grid-cols-1 sm:gap-4 lg:grid-cols-1" : "grid-cols-1 sm:gap-5 lg:grid-cols-3"
        }`}>
          {orderedFormulas.map((book) => {
            const meta = getMeta(book.subject);
            const Icon = meta.icon;
            
            return (
              <Link href={`/formula-books/${book.id}`} key={book.id} className="block group outline-none">
                <div 
                  className={`relative flex flex-col justify-between h-full overflow-hidden rounded-[20px] border bg-[var(--card)] bg-gradient-to-br ${meta.gradient} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-[var(--surface)] ${meta.border} ${meta.hoverBorder} ${meta.hoverShadow} ${
                    compact ? "min-h-[110px]" : "min-h-[130px]"
                  }`}
                >
                  
                  {/* Oversized Cropped Watermark */}
                  <div 
                    className={`absolute -top-8 -right-6 h-32 w-32 sm:-top-10 sm:-right-8 sm:h-40 sm:w-40 pointer-events-none transition-transform duration-700 group-hover:scale-110 opacity-[0.06] dark:opacity-[0.08] ${meta.color}`}
                  >
                    <SubjectVisual subject={book.subject} className="w-full h-full" />
                  </div>

                  <div className={`relative z-10 flex flex-col justify-between h-full w-full ${compact ? "p-5" : "p-6"}`}>
                    
                    <div>
                      {/* Eyebrow Label integrated tightly with Title */}
                      <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} strokeWidth={3} />
                        <span className={`text-[9.5px] font-black uppercase tracking-[0.25em] ${meta.color}`}>
                          {book.subject}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black font-display leading-tight text-slate-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-white pr-10">
                        {book.title}
                      </h3>
                    </div>

                    {/* Integrated Text Link Button */}
                    <div className="mt-8 flex items-center">
                      <div className={`inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${meta.color}`}>
                        <span className="relative">
                          Continue
                          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-current scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 opacity-40" />
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
                      </div>
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
