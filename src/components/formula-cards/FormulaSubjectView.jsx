"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Baby,
  BarChart3,
  BookOpen,
  Box,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Dna,
  Filter,
  FlaskConical,
  Gauge,
  HeartPulse,
  Layers3,
  Leaf,
  Magnet,
  Microscope,
  Network,
  Orbit,
  Route,
  Search,
  ShieldCheck,
  Sigma,
  Sparkles,
  Sprout,
  Trees,
  TrendingUp,
  Triangle,
  Waves,
  X,
} from "lucide-react";
import FormulaChapterProgress from "@/components/formula-cards/FormulaChapterProgress";

const SUBJECT_ICON_MAP = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Sigma,
  Biology: Dna,
};

const SECTION_ICON_MAP = {
  Gauge,
  Waves,
  Magnet,
  Sparkles,
  Atom,
  Orbit,
  Sigma,
  Triangle,
  CircleDot,
  TrendingUp,
  Box,
  BarChart3,
  FlaskConical,
  Layers3,
  Route,
  Network,
  Microscope,
  Dna,
  Leaf,
  HeartPulse,
  Baby,
  Brain,
  ShieldCheck,
  Sprout,
  Trees,
};

function getWeightLevel(cardCount, maxCards) {
  if (!maxCards || cardCount <= 0) return 1;
  return Math.max(1, Math.min(4, Math.ceil((cardCount / maxCards) * 4)));
}

function ChapterWeight({ level, cardCount }) {
  const label =
    level >= 4
      ? `Heavy deck (${cardCount} cards)`
      : level === 3
      ? `Comprehensive deck (${cardCount} cards)`
      : level === 2
      ? `Standard deck (${cardCount} cards)`
      : `Quick deck (${cardCount} cards)`;

  return (
    <div className="flex items-end gap-0.5" title={label} aria-label={label}>
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-1 rounded-full transition-colors ${
            bar <= level ? "bg-amber-500 dark:bg-amber-400" : "bg-slate-200 dark:bg-stone-800"
          }`}
          style={{ height: `${bar * 2.5 + 4}px` }}
        />
      ))}
    </div>
  );
}

export default function FormulaSubjectView({
  subject,
  chapters,
  sections,
  availableSubjects = [],
  exam = "JEE",
  hasProfileTrack = false,
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomainFilter, setActiveDomainFilter] = useState("all");

  const isBiologyRevision = subject?.exam === "NEET" && subject?.name === "Biology";
  const deckTitle = isBiologyRevision ? "Revision Cards" : "Formula Cards";
  const SubjectIcon = SUBJECT_ICON_MAP[subject?.name] || Orbit;

  const maxCardCount = useMemo(
    () => Math.max(...chapters.map((ch) => ch.card_count || 0), 0),
    [chapters]
  );
  const totalCardsCount = useMemo(
    () => chapters.reduce((sum, ch) => sum + (ch.card_count || 0), 0),
    [chapters]
  );

  // Filter sections and chapters by search query and domain filter
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sections
      .map((section) => {
        // Domain filter check
        if (activeDomainFilter !== "all" && section.title !== activeDomainFilter) {
          return null;
        }

        // Search filtering inside section
        const matchingChapters = section.chapters.filter((chapter) => {
          if (!query) return true;
          const searchHaystack = `${chapter.title} ${chapter.slug} ${section.title} ${section.description}`.toLowerCase();
          return searchHaystack.includes(query);
        });

        if (matchingChapters.length === 0) return null;

        return {
          ...section,
          chapters: matchingChapters,
        };
      })
      .filter(Boolean);
  }, [sections, searchQuery, activeDomainFilter]);

  const totalMatchingChapters = useMemo(
    () => filteredSections.reduce((sum, sec) => sum + sec.chapters.length, 0),
    [filteredSections]
  );

  const handleExamChange = (newExam) => {
    if (newExam === exam) return;
    // Map current subject to equivalent or first subject in other exam
    let targetSubject = subject.slug;
    if (newExam === "JEE" && subject.slug === "biology") {
      targetSubject = "physics";
    }
    router.push(`/formula-cards/${targetSubject}?exam=${newExam}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-stone-800">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-300 dark:text-stone-700">/</span>
          <Link
            href="/formula-cards"
            className="text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-amber-300 transition-colors"
          >
            {deckTitle}
          </Link>
          <span className="text-slate-300 dark:text-stone-700">/</span>
          <span className="font-bold text-slate-900 dark:text-amber-400">{subject.name}</span>
        </nav>

        {/* Exam Track Switcher - Only shown when user has NO fixed profile track */}
        {!hasProfileTrack && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">
              Track:
            </span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-stone-800 dark:bg-stone-900">
              <button
                onClick={() => handleExamChange("JEE")}
                className={`rounded-lg px-3 py-1 text-xs font-black transition-all ${
                  exam === "JEE"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-amber-400 dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-950 dark:text-stone-400 dark:hover:text-white"
                }`}
              >
                JEE Main / Adv
              </button>
              <button
                onClick={() => handleExamChange("NEET")}
                className={`rounded-lg px-3 py-1 text-xs font-black transition-all ${
                  exam === "NEET"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-amber-400 dark:text-slate-950"
                    : "text-slate-600 hover:text-slate-950 dark:text-stone-400 dark:hover:text-white"
                }`}
              >
                NEET Medical
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subject Navigation Tabs Strip */}
      {availableSubjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-stone-500 shrink-0 mr-1 hidden sm:inline">
            Subjects:
          </span>
          {availableSubjects.map((s) => {
            const IconComponent = SUBJECT_ICON_MAP[s.name] || BookOpen;
            const isActive = s.slug === subject.slug;

            return (
              <Link
                key={s.id}
                href={`/formula-cards/${s.slug}?exam=${exam}`}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all shrink-0 border ${
                  isActive
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-900 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
                    : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-stone-800/80 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-white"
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-stone-500"}`} />
                <span>{s.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-5 shadow-sm dark:border-stone-800/80 dark:from-[#141414] dark:via-[#111111] dark:to-stone-900/40 sm:p-7">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400 shadow-inner">
                <SubjectIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400 sm:text-[11px]">
                  {subject.exam} Syllabus Quick Study
                </p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl font-display">
                  {subject.name}
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-stone-300">
              Interactive chapter flashcards for instant formula memorization, key boundary conditions, and high-yield derivations tailored for {exam}.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="flex flex-col justify-center rounded-xl border border-slate-200/70 bg-white/80 p-3 text-center dark:border-stone-800 dark:bg-black/40">
              <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums">
                {chapters.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                Chapters
              </span>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center dark:border-amber-400/20 dark:bg-amber-400/5">
              <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 tabular-nums">
                {totalCardsCount}
              </span>
              <span className="text-[11px] font-bold text-amber-700/80 dark:text-amber-400/80 uppercase tracking-wider">
                Cards
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col justify-center rounded-xl border border-slate-200/70 bg-white/80 p-3 text-center dark:border-stone-800 dark:bg-black/40">
              <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tabular-nums">
                {sections.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
                Domains
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Unit Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${subject.name} chapters, topics, formulas...`}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-[#131313] dark:text-white dark:placeholder:text-stone-500 dark:focus:border-amber-400 dark:focus:ring-amber-400/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-stone-500 dark:hover:text-stone-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveDomainFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0 ${
              activeDomainFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            All Units ({chapters.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec.title}
              onClick={() =>
                setActiveDomainFilter((prev) => (prev === sec.title ? "all" : sec.title))
              }
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0 ${
                activeDomainFilter === sec.title
                  ? "bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {sec.title} ({sec.chapters.length})
            </button>
          ))}
        </div>
      </div>

      {/* Content: Sections and Chapter Grid */}
      {filteredSections.length > 0 ? (
        <section className="space-y-7">
          {filteredSections.map(
            ({ title, description, iconName, cue, accentClass, iconContainerClass, chapters: sectionChapters }) => {
              const Icon = SECTION_ICON_MAP[iconName] || Orbit;

              return (
                <div key={title} className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5 dark:border-stone-800/70">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          iconContainerClass ||
                          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-900 dark:text-stone-100">
                          {title}
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-stone-400">
                          {description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {cue && (
                        <span className="hidden rounded-md border border-slate-200/80 bg-slate-50/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400 sm:inline-flex">
                          {cue}
                        </span>
                      )}
                      <span className="rounded-md border border-slate-200/60 bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600 dark:border-stone-800 dark:bg-[#141414] dark:text-stone-400">
                        {sectionChapters.length} {sectionChapters.length === 1 ? "chapter" : "chapters"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sectionChapters.map((chapter) => {
                      const cardCount = chapter.card_count || 0;
                      const weightLevel = getWeightLevel(cardCount, maxCardCount);

                      return (
                        <Link
                          key={chapter.id}
                          href={`/formula-cards/${subject.slug}/${chapter.slug}?exam=${subject.exam}`}
                          className={`prepzii-interactive group flex flex-col justify-between rounded-xl border border-l-[3.5px] border-slate-200/90 bg-white p-4 transition-all duration-150 hover:border-amber-400/90 hover:bg-amber-50/20 hover:shadow-md dark:border-stone-800/90 dark:bg-[#131313] dark:hover:border-amber-500/50 dark:hover:bg-[#171717] ${
                            accentClass || ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-stone-500">
                                {chapter.sort_order ? `Chapter ${chapter.sort_order}` : "Deck"}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-300 line-clamp-1">
                                {chapter.title}
                              </h3>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 pt-0.5">
                              <ChapterWeight level={weightLevel} cardCount={cardCount} />
                              <ArrowRight className="prepzii-interactive-icon h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-amber-600 dark:text-stone-600 dark:group-hover:text-amber-400" />
                            </div>
                          </div>

                          <FormulaChapterProgress chapterId={chapter.id} cardCount={cardCount} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center dark:border-stone-800 dark:bg-stone-900/30">
          <Search className="mx-auto h-8 w-8 text-slate-400 dark:text-stone-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No chapters match &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-stone-400">
            Try a different keyword or reset the unit filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveDomainFilter("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
