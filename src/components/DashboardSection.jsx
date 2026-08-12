"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlaskConical, Calculator, Zap, Dna, BookOpen, Bookmark, ChevronRight, Library } from "lucide-react";

// Subject → Premium Book Visual Identity
const SUBJECT_META = {
  Chemistry: { 
    icon: FlaskConical, 
    spine: "from-emerald-400 via-emerald-500 to-emerald-600", 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20", 
    border: "border-emerald-500/20 dark:border-emerald-500/30"  
  },
  Mathematics: { 
    icon: Calculator, 
    spine: "from-indigo-400 via-indigo-500 to-indigo-600", 
    color: "text-indigo-500", 
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20", 
    border: "border-indigo-500/20 dark:border-indigo-500/30"  
  },
  Physics: { 
    icon: Zap, 
    spine: "from-amber-400 via-amber-500 to-amber-600", 
    color: "text-amber-500", 
    bg: "bg-amber-500/10 dark:bg-amber-500/20", 
    border: "border-amber-500/20 dark:border-amber-500/30"  
  },
  Biology: { 
    icon: Dna, 
    spine: "from-rose-400 via-rose-500 to-rose-600", 
    color: "text-rose-500", 
    bg: "bg-rose-500/10 dark:bg-rose-500/20", 
    border: "border-rose-500/20 dark:border-rose-500/30"  
  },
};

function getMeta(subject) {
  return SUBJECT_META[subject] || { 
    icon: BookOpen, 
    spine: "from-blue-400 via-blue-500 to-blue-600", 
    color: "text-blue-500", 
    bg: "bg-blue-500/10 dark:bg-blue-500/20", 
    border: "border-blue-500/20 dark:border-blue-500/30" 
  };
}

export default function DashboardSection({ config }) {
  const [formulaBooks, setFormulaBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isNeet = config?.badge?.toLowerCase().includes("neet");

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch("/api/formula-books");
        const data = await res.json();
        setFormulaBooks(data);
      } catch (error) {
        console.error("Formula books loading failed:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const filteredFormulas = formulaBooks.filter((book) =>
    isNeet ? book.stream === "NEET" : book.stream === "JEE"
  );

  return (
    <div className="space-y-4">

      {/* ── Section header ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10">
          <Library className="h-[18px] w-[18px] text-indigo-500 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            Formula Library
          </h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Your essential quick-access handbooks
          </p>
        </div>
      </div>

      {/* ── Loading skeleton ──────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="relative h-[180px] animate-pulse overflow-hidden rounded-l-md rounded-r-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* ── Formula grid ──────────────────────────────────────── */}
      {!loading && filteredFormulas.length > 0 && (
        <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {filteredFormulas.map((book, index) => {
            const meta = getMeta(book.subject);
            const Icon = meta.icon;
            
            return (
              <Link href={`/formula-books/${book.id}`} key={book.id} className="block group">
                {/* Clean Premium Card */}
                <div 
                  className="relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  
                  {/* Subject Color Accent Line (Left Edge) */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${meta.spine} z-20`} />

                  {/* Background Watermark Icon */}
                  <Icon className={`absolute -bottom-6 -right-6 h-32 w-32 -rotate-12 transform opacity-[0.03] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 dark:opacity-[0.04] ${meta.color}`} />

                  <div className="relative z-10 flex h-full flex-col py-5 pl-5 pr-4">
                    
                    {/* Top Row: Tag & Subject */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${meta.bg} ${meta.color} border ${meta.border} backdrop-blur-sm`}>
                        <Icon className="w-3 h-3" strokeWidth={2.5} />
                        {book.subject}
                      </span>

                      {book.tag && (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
                          {book.tag}
                        </span>
                      )}
                    </div>

                    {/* Book Title */}
                    <h3 className="mb-2 text-base font-black leading-snug text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 sm:text-lg">
                      {book.title}
                    </h3>

                    {/* Formula Embossed Box */}
                    {book.formula && (
                      <div className={`mt-auto rounded-xl bg-gradient-to-br px-3 py-2.5 ${meta.bg} to-transparent border ${meta.border} shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-300 group-hover:bg-white/50 dark:group-hover:bg-slate-800/50`}>
                        <p className={`font-mono text-[13px] font-bold tracking-tight leading-snug ${meta.color}`}>
                          {book.formula}
                        </p>
                        {book.sub && (
                          <p className="font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 opacity-80">
                            {book.sub}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Interactive Arrow */}
                    <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 border border-slate-200 dark:border-slate-700">
                      <ChevronRight className={`w-4 h-4 ${meta.color}`} strokeWidth={2.5} />
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && filteredFormulas.length === 0 && (
        <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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
