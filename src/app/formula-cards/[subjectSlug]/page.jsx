import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Baby,
  BarChart3,
  Box,
  Brain,
  CircleDot,
  Dna,
  FlaskConical,
  Gauge,
  HeartPulse,
  Layers3,
  Leaf,
  Magnet,
  Microscope,
  Network,
  Orbit,
  Radio,
  Route,
  ShieldCheck,
  Sigma,
  Sparkles,
  Sprout,
  Trees,
  TrendingUp,
  Triangle,
  Waves,
} from "lucide-react";
import FormulaChapterProgress from "@/components/formula-cards/FormulaChapterProgress";
import { getFormulaChaptersForSubject } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

const MATHEMATICS_SECTIONS = [
  {
    title: "Algebra",
    description: "Foundations, equations, sequences, binomial, complex & counting",
    Icon: Sigma,
    cue: "Core Algebra",
    accentClass: "border-l-indigo-500/80 dark:border-l-indigo-400/80",
    iconContainerClass:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-400",
    slugs: [
      "fundamental-of-mathematics",
      "quadratic-equation",
      "sequence-and-series",
      "binomial-theorem",
      "complex-number",
      "permutation-and-combination",
      "sets-and-relation",
      "mathematical-reasoning",
    ],
    match: [
      "fundamental",
      "quadratic",
      "sequence",
      "series",
      "progression",
      "binomial",
      "complex",
      "permutation",
      "combination",
      "set",
      "relation",
      "reasoning",
      "matrix",
      "matrices",
      "determinant",
    ],
  },
  {
    title: "Trigonometry",
    description: "Inverse functions, identities and triangle relations",
    Icon: Triangle,
    cue: "Identities & Triangles",
    accentClass: "border-l-violet-500/80 dark:border-l-violet-400/80",
    iconContainerClass:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-400",
    slugs: [
      "inverse-trigonometric-functions",
      "solution-of-triangle",
    ],
    match: [
      "trigonometr",
      "inverse-trig",
      "solution-of-triangle",
      "triangle",
      "ratio",
      "identity",
      "identities",
    ],
  },
  {
    title: "Coordinate Geometry",
    description: "2D lines, circles, parabolas, ellipses and hyperbolas",
    Icon: CircleDot,
    cue: "2D & Conics",
    accentClass: "border-l-emerald-500/80 dark:border-l-emerald-400/80",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
    slugs: [
      "straight-line",
      "circle",
      "parabola",
      "ellipse",
      "hyperbola",
    ],
    match: [
      "straight",
      "line",
      "circle",
      "parabola",
      "ellipse",
      "hyperbola",
      "conic",
      "coordinate",
      "locus",
    ],
  },
  {
    title: "Calculus",
    description: "Limits, derivatives, applications, definite & indefinite integrals",
    Icon: TrendingUp,
    cue: "Differential & Integral",
    accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
    iconContainerClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    slugs: [
      "limit-of-function",
      "method-of-differentiation",
      "application-of-derivatives",
      "indefinite-integration",
      "definite-integration",
    ],
    match: [
      "limit",
      "continuity",
      "differentiat",
      "derivative",
      "application of derivative",
      "tangent",
      "normal",
      "maxima",
      "minima",
      "integration",
      "integral",
      "indefinite",
      "definite",
      "area under",
      "differential equation",
      "calculus",
    ],
  },
  {
    title: "Vectors & 3D Geometry",
    description: "Vector algebra, cross products, 3D lines and planes",
    Icon: Box,
    cue: "Space & Geometry",
    accentClass: "border-l-sky-500/80 dark:border-l-sky-400/80",
    iconContainerClass:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-400",
    slugs: [
      "vectors",
      "3-dimension",
    ],
    match: [
      "vector",
      "3-dimension",
      "3d",
      "three dimension",
      "space",
      "plane",
      "direction cosine",
    ],
  },
  {
    title: "Probability & Statistics",
    description: "Random experiments, probability distributions & data dispersion",
    Icon: BarChart3,
    cue: "Chance & Data",
    accentClass: "border-l-rose-500/80 dark:border-l-rose-400/80",
    iconContainerClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
    slugs: [
      "probability",
      "statistics",
    ],
    match: [
      "probability",
      "statistic",
      "mean",
      "variance",
      "standard deviation",
      "distribution",
      "random variable",
    ],
  },
];

const PHYSICS_SECTIONS = [
  {
    title: "Mechanics",
    description: "Motion, forces, energy and rotation",
    Icon: Gauge,
    match: [
      "unit",
      "dimension",
      "motion",
      "projectile",
      "laws of motion",
      "friction",
      "work",
      "energy",
      "power",
      "circular",
      "centre of mass",
      "center of mass",
      "collision",
      "rotation",
      "gravitation",
      "fluid",
      "elastic",
      "viscosity",
      "surface tension",
    ],
  },
  {
    title: "Thermodynamics & Waves",
    description: "Heat, kinetic theory, oscillations and waves",
    Icon: Waves,
    match: [
      "thermal",
      "calorimetry",
      "heat",
      "thermodynamics",
      "kinetic",
      "oscillation",
      "simple harmonic",
      "wave",
      "sound",
    ],
  },
  {
    title: "Electromagnetism",
    description: "Charges, circuits, fields and induction",
    Icon: Magnet,
    match: [
      "electrostatics",
      "electric",
      "current",
      "capacitor",
      "magnet",
      "magnetic",
      "emi",
      "induction",
      "alternating",
      "ac ",
      "electromagnetic",
    ],
  },
  {
    title: "Optics",
    description: "Ray optics, wave optics and instruments",
    Icon: Sparkles,
    match: ["ray", "optics", "lens", "mirror", "wave optics", "interference", "diffraction"],
  },
  {
    title: "Modern Physics",
    description: "Atoms, nuclei, quantum ideas and devices",
    Icon: Atom,
    match: [
      "modern",
      "dual",
      "matter",
      "radiation",
      "atom",
      "nuclei",
      "nucleus",
      "semiconductor",
      "communication",
    ],
  },
];

const CHEMISTRY_SECTIONS = [
  {
    title: "Physical Chemistry",
    description: "Formula maps, equilibrium, energy and rates",
    Icon: FlaskConical,
    cue: "Formula / Process",
    range: [1, 10],
    accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
    iconContainerClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
  },
  {
    title: "Inorganic Chemistry",
    description: "Periodic patterns, bonding, groups and qualitative facts",
    Icon: Layers3,
    cue: "Classification / Facts",
    range: [11, 18],
    accentClass: "border-l-emerald-500/70 dark:border-l-emerald-400/70",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  {
    title: "Organic Chemistry",
    description: "Mechanisms, reagents and reaction routes",
    Icon: Route,
    cue: "Reaction Focus",
    range: [19, Infinity],
    accentClass: "border-l-orange-500/80 dark:border-l-orange-400/80",
    iconContainerClass:
      "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-400",
  },
];

const BIOLOGY_SECTIONS = [
  {
    title: "Diversity",
    description: "Living world, classification and kingdoms",
    Icon: Network,
    cue: "Taxonomy",
    range: [1, 4],
    accentClass: "border-l-emerald-500/70 dark:border-l-emerald-400/70",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  {
    title: "Structural Organisation",
    description: "Plant anatomy, morphology and animal tissues",
    Icon: Microscope,
    cue: "Structures",
    range: [5, 7],
    accentClass: "border-l-lime-500/70 dark:border-l-lime-400/70",
    iconContainerClass:
      "border-lime-500/20 bg-lime-500/10 text-lime-700 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400",
  },
  {
    title: "Cell Biology",
    description: "Cell structure, organelles and division",
    Icon: Dna,
    cue: "Cell Recall",
    range: [8, 9],
    accentClass: "border-l-sky-500/70 dark:border-l-sky-400/70",
    iconContainerClass:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-400",
  },
  {
    title: "Plant Physiology",
    description: "Transport, nutrition, photosynthesis and growth",
    Icon: Leaf,
    cue: "Pathways",
    range: [10, 14],
    accentClass: "border-l-green-500/70 dark:border-l-green-400/70",
    iconContainerClass:
      "border-green-500/20 bg-green-500/10 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400",
  },
  {
    title: "Human Physiology",
    description: "Systems, coordination and regulation",
    Icon: HeartPulse,
    cue: "Mechanisms",
    range: [15, 20],
    accentClass: "border-l-rose-500/70 dark:border-l-rose-400/70",
    iconContainerClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
  },
  {
    title: "Reproduction",
    description: "Organisms, flowering plants and human reproduction",
    Icon: Baby,
    cue: "Sequences",
    range: [21, 24],
    accentClass: "border-l-pink-500/70 dark:border-l-pink-400/70",
    iconContainerClass:
      "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-400",
  },
  {
    title: "Genetics & Evolution",
    description: "Inheritance, molecular genetics and evolution",
    Icon: Brain,
    cue: "Ratios / DNA",
    range: [25, 27],
    accentClass: "border-l-violet-500/70 dark:border-l-violet-400/70",
    iconContainerClass:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-400",
  },
  {
    title: "Human Welfare",
    description: "Health, food production and useful microbes",
    Icon: ShieldCheck,
    cue: "Disease / Use",
    range: [28, 30],
    accentClass: "border-l-teal-500/70 dark:border-l-teal-400/70",
    iconContainerClass:
      "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-400",
  },
  {
    title: "Biotechnology",
    description: "Tools, processes and applications",
    Icon: Sprout,
    cue: "Tools",
    range: [31, 32],
    accentClass: "border-l-cyan-500/70 dark:border-l-cyan-400/70",
    iconContainerClass:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-400",
  },
  {
    title: "Ecology",
    description: "Populations, ecosystems and conservation",
    Icon: Trees,
    cue: "Systems",
    range: [33, 35],
    accentClass: "border-l-emerald-600/70 dark:border-l-emerald-300/70",
    iconContainerClass:
      "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-300",
  },
];

function buildRangeSections(sectionDefs, chapters) {
  return sectionDefs
    .map((section) => ({
      ...section,
      chapters: chapters.filter((chapter) => {
        const order = Number(chapter.sort_order || 0);
        return order >= section.range[0] && order <= section.range[1];
      }),
    }))
    .filter((section) => section.chapters.length > 0);
}

function buildMathSections(chapters) {
  const remaining = new Set(chapters.map((chapter) => chapter.id));

  const sections = MATHEMATICS_SECTIONS.map((section) => {
    const matchedChapters = [];

    // 1. First add matching predefined slugs in pedagogical order
    if (section.slugs) {
      section.slugs.forEach((slug) => {
        const found = chapters.find((c) => c.slug === slug && remaining.has(c.id));
        if (found) {
          matchedChapters.push(found);
          remaining.delete(found.id);
        }
      });
    }

    // 2. Add any additional chapters matching keywords
    if (section.match) {
      chapters.forEach((chapter) => {
        if (!remaining.has(chapter.id)) return;
        const searchable = `${chapter.title} ${chapter.slug}`.toLowerCase();
        const isMatch = section.match.some((term) => searchable.includes(term));
        if (isMatch) {
          matchedChapters.push(chapter);
          remaining.delete(chapter.id);
        }
      });
    }

    return {
      ...section,
      chapters: matchedChapters,
    };
  }).filter((section) => section.chapters.length > 0);

  const uncategorized = chapters.filter((chapter) => remaining.has(chapter.id));
  if (uncategorized.length > 0) {
    sections.push({
      title: "Additional Topics",
      description: "More mathematics revision decks",
      Icon: Orbit,
      cue: "Revision Deck",
      accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
      iconContainerClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
      chapters: uncategorized,
    });
  }

  return sections;
}

function getChapterSections(subject, chapters) {
  if (subject.name === "Mathematics") {
    return buildMathSections(chapters);
  }

  if (subject.name === "Chemistry") {
    return buildRangeSections(CHEMISTRY_SECTIONS, chapters);
  }

  if (subject.exam === "NEET" && subject.name === "Biology") {
    return buildRangeSections(BIOLOGY_SECTIONS, chapters);
  }

  if (subject.name !== "Physics") {
    return [
      {
        title: "Study Syllabus",
        description: "Chapter decks ready for revision",
        Icon: Orbit,
        cue: "Revision Deck",
        accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
        iconContainerClass:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
        chapters,
      },
    ];
  }

  const remaining = new Set(chapters.map((chapter) => chapter.id));
  const sections = PHYSICS_SECTIONS.map((section) => {
    const sectionChapters = chapters.filter((chapter) => {
      if (!remaining.has(chapter.id)) return false;
      const searchable = `${chapter.title} ${chapter.slug}`.toLowerCase();
      const isMatch = section.match.some((term) => searchable.includes(term));
      if (isMatch) remaining.delete(chapter.id);
      return isMatch;
    });

    return { ...section, chapters: sectionChapters };
  }).filter((section) => section.chapters.length > 0);

  const uncategorized = chapters.filter((chapter) => remaining.has(chapter.id));
  if (uncategorized.length > 0) {
    sections.push({
      title: "More Physics",
      description: "Additional formula decks",
      Icon: Radio,
      cue: "Formula Deck",
      accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
      iconContainerClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
      chapters: uncategorized,
    });
  }

  return sections.map((section) => ({
    cue: "Formula Deck",
    accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
    iconContainerClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    ...section,
  }));
}

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

export default async function FormulaSubjectPage({ params, searchParams }) {
  const { subjectSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject, chapters } = await getFormulaChaptersForSubject(subjectSlug, exam);

  if (!subject) notFound();

  const isBiologyRevision = subject.exam === "NEET" && subject.name === "Biology";
  const deckTitle = isBiologyRevision ? "Revision Cards" : "Formula Cards";
  const chapterSections = getChapterSections(subject, chapters);
  const maxCardCount = Math.max(...chapters.map((chapter) => chapter.card_count || 0), 0);
  const totalCardsCount = chapters.reduce((sum, ch) => sum + (ch.card_count || 0), 0);

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
                {subject.exam} Syllabus
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl font-display">
                  {subject.name}
                </h1>
                {chapters.length > 0 && (
                  <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 tabular-nums">
                    {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
                  </span>
                )}
                {totalCardsCount > 0 && (
                  <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 tabular-nums">
                    {totalCardsCount} cards
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 dark:text-stone-300 sm:text-base">
                Pick a chapter to open the interactive {isBiologyRevision ? "revision" : "formula"} deck. Structured by syllabus units for targeted JEE revision.
              </p>
            </div>
          </div>
        </header>

        {chapters.length > 0 ? (
          <section className="space-y-6 sm:space-y-7">
            {chapterSections.map(
              ({ title, description, Icon, cue, accentClass, iconContainerClass, chapters: sectionChapters }) => (
                <div key={title} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-stone-800/60">
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

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {sectionChapters.map((chapter) => {
                      const cardCount = chapter.card_count || 0;
                      const weightLevel = getWeightLevel(cardCount, maxCardCount);

                      return (
                        <Link
                          key={chapter.id}
                          href={`/formula-cards/${subject.slug}/${chapter.slug}?exam=${subject.exam}`}
                          className={`prepzii-interactive group flex flex-col justify-between rounded-xl border border-l-[3px] border-slate-200/80 bg-white p-3.5 transition-all duration-150 hover:border-amber-400/80 hover:bg-amber-50/20 hover:shadow-sm dark:border-stone-800/80 dark:bg-[#131313] dark:hover:border-stone-700 dark:hover:bg-[#161616] ${
                            accentClass || ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-300">
                                {chapter.title}
                              </h3>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 pt-0.5">
                              <ChapterWeight level={weightLevel} cardCount={cardCount} />
                              <ArrowRight className="prepzii-interactive-icon h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-600 dark:group-hover:text-amber-400" />
                            </div>
                          </div>

                          <FormulaChapterProgress chapterId={chapter.id} cardCount={cardCount} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )
            )}
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
