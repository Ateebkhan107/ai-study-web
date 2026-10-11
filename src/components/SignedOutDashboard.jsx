import Link from "next/link";
import {
  Scroll,
  Target,
  Swords,
  Flame,
  BarChart3,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
} from "lucide-react";
import DashboardHeaderQuote from "@/components/DashboardHeaderQuote";
import BattleFloatingButton from "@/components/battle/BattleFloatingButton";
import SignedOutPracticeHub from "@/components/SignedOutPracticeHub";
import SubjectVisual from "@/components/SubjectVisual";
import { getCachedFormulaBookSummaries } from "@/lib/formulaBooks";

const GENERAL_SUBJECTS = [
  {
    subject: "Physics",
    title: "Physics Handbook",
    stream: "JEE",
    tag: "JEE & NEET",
    icon: Atom,
    color: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-[#2A2A2A]",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    badgeBg: "bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    subject: "Chemistry",
    title: "Chemistry Handbook",
    stream: "JEE",
    tag: "JEE & NEET",
    icon: FlaskConical,
    color: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-[#2A2A2A]",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeBg: "bg-emerald-100/80 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    subject: "Mathematics",
    title: "Mathematics Handbook",
    stream: "JEE",
    tag: "JEE PCM",
    icon: Calculator,
    color: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-[#2A2A2A]",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-500",
    badgeBg: "bg-orange-100/80 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    subject: "Biology",
    title: "Biology Handbook",
    stream: "NEET",
    tag: "NEET PCB",
    icon: Dna,
    color: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-[#2A2A2A]",
    hoverBorder: "hover:border-rose-400 dark:hover:border-rose-500",
    badgeBg: "bg-rose-100/80 text-rose-900 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

export default async function SignedOutDashboard() {
  // Attempt to load cached book summaries if available
  let books = [];
  try {
    books = await getCachedFormulaBookSummaries();
  } catch {
    books = [];
  }

  // Resolve link data for each of the 4 general subjects
  const subjectCards = GENERAL_SUBJECTS.map((item) => {
    const matched = books.find(
      (b) => b.subject?.toLowerCase() === item.subject.toLowerCase() && b.stream === item.stream
    );
    return {
      ...item,
      id: matched?.id || item.subject.toLowerCase(),
      href: `/formula-cards/${item.subject.toLowerCase()}?exam=${item.stream}`,
    };
  });

  return (
    <div className="relative min-h-screen w-full min-w-0">
      {/* Subtle radial dotted background overlay */}
      <div
        className="absolute inset-y-0 left-1/2 z-0 h-full w-dvw -translate-x-1/2 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-none [background-size:34px_34px] opacity-10 dark:opacity-15" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Header Greeting & Daily Quote (Generalised for both JEE & NEET) */}
        <div className="relative grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.82fr)_minmax(0,0.33fr)] lg:items-start">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:border-brand/30 dark:bg-brand/10 dark:text-brand sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              JEE &amp; NEET ASPIRANTS
            </div>

            <h1 className="mt-2 flex flex-wrap items-center gap-1.5 break-words text-2xl font-black font-display tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
              <span>Hey,</span>
              <span>Aspirant</span>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand" aria-hidden="true" />
            </h1>

            <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Welcome to PrepZii • Authentic past papers, timed mock tests &amp; high-yield handbooks for JEE (PCM) and NEET (PCB).
            </p>
          </div>

          <DashboardHeaderQuote />
        </div>

        {/* Top Grid: Quick Practice Hub (Left) + Performance Hub Preview (Right) */}
        <div className="relative z-10 grid gap-4 sm:gap-5 lg:gap-6 mt-4 sm:mt-0">
          <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.75fr)] lg:items-stretch">
            {/* Quick Practice Hub */}
            <SignedOutPracticeHub />

            {/* Performance Hub Preview (Right Column) */}
            <div className="min-w-0">
              <div className="relative h-full overflow-hidden rounded-2xl border border-amber-200 bg-white p-4 sm:p-5 dark:border-[#2A2A2A] dark:bg-[#141414] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Your Analytics
                    </p>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-900 dark:bg-[#F5C518] dark:text-black">
                      Unlock On Sign In
                    </span>
                  </div>

                  <h2 className="mt-2 text-base sm:text-lg font-black font-display tracking-tight text-slate-950 dark:text-white">
                    Track Your Prep Growth
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    What you unlock with a free PrepZii account:
                  </p>

                  <div className="mt-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Flame className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-950 dark:text-white">Daily Consistency Streaks</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Daily question targets &amp; midnight reset countdown.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-950 dark:text-white">Chapter-Level Accuracy AI</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Pinpoint weak topics before the actual exam.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Trophy className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-950 dark:text-white">Live National Percentile</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Compare your scores against aspirants across India.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2A2A2A] flex items-center gap-2">
                  <Link
                    href="/sign-up"
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-center text-xs font-black shadow-sm transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/sign-in"
                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-[#2A2A2A] text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Grid: Quick Study Handbooks (All 4 Subjects) + Study Strategy & Guide */}
          <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            {/* Quick Study Formula Books - Generalised covering all 4 subjects */}
            <div className="min-w-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Quick Study Handbooks
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:bg-[#1A1A1A] dark:text-slate-400">
                    Physics • Chem • Math • Bio
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjectCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <Link
                        href={card.href}
                        key={card.subject}
                        className="block group outline-none"
                      >
                        <div
                          className={`relative flex flex-col justify-between h-full min-h-[115px] overflow-hidden rounded-[20px] border bg-white dark:bg-[#141414] transition-all duration-300 hover:-translate-y-1 ${card.border} ${card.hoverBorder} p-4 sm:p-4`}
                        >
                          {/* Oversized Cropped Watermark */}
                          <div
                            className={`absolute -top-3 -right-3 h-24 w-24 sm:-top-5 sm:-right-5 sm:h-28 sm:w-28 pointer-events-none transition-transform duration-700 group-hover:scale-110 opacity-[0.06] dark:opacity-[0.08] ${card.color}`}
                          >
                            <SubjectVisual subject={card.subject} className="w-full h-full" />
                          </div>

                          <div className="relative z-10 flex flex-col justify-between h-full w-full">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5 opacity-90">
                                <div className="flex items-center gap-1.5">
                                  <Icon className={`w-3.5 h-3.5 ${card.color}`} strokeWidth={3} />
                                  <span className={`text-[9.5px] font-black uppercase tracking-[0.25em] ${card.color}`}>
                                    {card.subject}
                                  </span>
                                </div>
                                <span className={`rounded-md px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${card.badgeBg}`}>
                                  {card.tag}
                                </span>
                              </div>

                              <h3 className="text-sm sm:text-base font-black font-display leading-tight text-slate-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-white pr-6">
                                {card.title}
                              </h3>
                            </div>

                            <div className="mt-3 flex items-center">
                              <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${card.color}`}>
                                <span className="relative">
                                  Open Cards
                                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-current scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 opacity-40" />
                                </span>
                                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={3} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preparation Blueprint & Strategy - Generalised for JEE and NEET */}
            <div className="min-w-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-[#2A2A2A] dark:bg-[#141414]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Preparation Strategy
                  </p>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-amber-900 dark:bg-[#F5C518] dark:text-black">
                    High Yield
                  </span>
                </div>

                <h2 className="mt-2 text-base sm:text-lg font-black font-display tracking-tight text-slate-950 dark:text-white">
                  3-Step Scoring Blueprint
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Proven sequence used by top percentile aspirants on PrepZii:
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                        Review Formulas &amp; Core Concepts
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Flip through the Handbook summary cards on the left before attempting problem sets to refresh formulas, reaction mechanisms, and units.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                        Train with Exam-Specific Timers
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Practice with strict timer discipline — ~2.4 mins per question for JEE Main problem-solving, and under 1 min per question for NEET speed drills.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                        Analyze Mistake Traps
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Review step-by-step solutions after every test. Diagnose numerical calculations, organic reactions, and diagram-based questions to eliminate recurring errors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-[#2A2A2A] flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Ready to begin?
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/pyq"
                      className="inline-flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs font-black transition-colors"
                    >
                      Solve PYQs <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href="/test"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#2A2A2A] px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Take Mock Test
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <BattleFloatingButton />
    </div>
  );
}
