import Link from "next/link";
import { Atom, FlaskConical, Calculator, Dna, BookOpen, ArrowRight } from "lucide-react";
import { getCachedFormulaBookSummaries } from "@/lib/formulaBooks";
import SubjectVisual from "@/components/SubjectVisual";

const SUBJECT_META = {
  Chemistry: { 
    icon: FlaskConical, 
    color: "text-emerald-700 dark:text-emerald-400", 
    border: "border-emerald-200 dark:border-[#2A2A2A]",
    gradient: "",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    hoverShadow: "hover:shadow-none"
  },
  Mathematics: { 
    icon: Calculator, 
    color: "text-orange-700 dark:text-orange-400", 
    border: "border-orange-200 dark:border-[#2A2A2A]",
    gradient: "",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500",
    hoverShadow: "hover:shadow-none"
  },
  Physics: { 
    icon: Atom,
    color: "text-amber-700 dark:text-amber-400", 
    border: "border-amber-200 dark:border-[#2A2A2A]",
    gradient: "",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    hoverShadow: "hover:shadow-none"
  },
  Biology: { 
    icon: Dna, 
    color: "text-rose-700 dark:text-rose-400", 
    border: "border-rose-200 dark:border-[#2A2A2A]",
    gradient: "",
    hoverBorder: "hover:border-rose-400 dark:hover:border-rose-500",
    hoverShadow: "hover:shadow-none"
  },
};

function getMeta(subject) {
  return SUBJECT_META[subject] || { 
    icon: BookOpen, 
    color: "text-blue-700 dark:text-blue-400", 
    border: "border-blue-200 dark:border-[#2A2A2A]",
    gradient: "",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
    hoverShadow: "hover:shadow-none"
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
    <div data-tour="tour-revision-cards" className={compact ? "space-y-3" : "space-y-4"}>

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
              <Link href={`/formula-cards/${book.subject.toLowerCase()}?exam=${book.stream}`} key={book.id} className="block group outline-none">
                <div 
                  className={`relative flex flex-col justify-between h-full overflow-hidden rounded-[20px] border bg-white dark:bg-[#141414] transition-all duration-300 hover:-translate-y-1 ${meta.border} ${meta.hoverBorder} ${meta.hoverShadow} ${
                    compact ? "min-h-[110px] sm:min-h-[110px]" : "min-h-[120px] sm:min-h-[130px]"
                  }`}
                >
                  
                  {/* Oversized Cropped Watermark */}
                  <div 
                    className={`absolute -top-4 -right-4 h-24 w-24 sm:-top-10 sm:-right-8 sm:h-40 sm:w-40 pointer-events-none transition-transform duration-700 group-hover:scale-110 opacity-[0.06] dark:opacity-[0.08] ${meta.color}`}
                  >
                    <SubjectVisual subject={book.subject} className="w-full h-full" />
                  </div>

                  <div className={`relative z-10 flex flex-col justify-between h-full w-full ${compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
                    
                    <div>
                      {/* Eyebrow Label integrated tightly with Title */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 opacity-90">
                        <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${meta.color}`} strokeWidth={3} />
                        <span className={`text-[9px] sm:text-[9.5px] font-black uppercase tracking-[0.25em] ${meta.color}`}>
                          {book.subject}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-xl font-black font-display leading-tight text-slate-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-white pr-6 sm:pr-10">
                        {book.title}
                      </h3>
                    </div>

                    {/* Integrated Text Link Button */}
                    <div className="mt-3 sm:mt-8 flex items-center">
                      <div className={`inline-flex items-center gap-1 sm:gap-1.5 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${meta.color}`}>
                        <span className="relative">
                          Open Cards
                          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-current scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 opacity-40" />
                        </span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
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
        <div className="relative overflow-hidden bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center flex flex-col items-center justify-center dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
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
