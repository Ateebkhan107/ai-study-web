import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import FormulaSubjectView from "@/components/formula-cards/FormulaSubjectView";
import { getFormulaChaptersForSubject, getFormulaSubjectsForExam } from "@/lib/formulaCards";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
  const { subjectSlug } = await params;
  const query = await searchParams;
  const exam = String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const { subject } = await getFormulaChaptersForSubject(subjectSlug, exam);

  if (!subject) return { title: "Formula Cards | PrepZii" };

  return {
    title: `${subject.name} Formula Cards (${exam}) | PrepZii`,
    description: `Master high-yield formulas and concepts for ${subject.name} for ${exam} preparation.`,
  };
}

const MATHEMATICS_SECTIONS = [
  {
    title: "Algebra",
    description: "Foundations, equations, sequences, binomial, complex & counting",
    iconName: "Sigma",
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
    iconName: "Triangle",
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
      "trigonometric ratio",
      "identity",
      "identities",
    ],
  },
  {
    title: "Coordinate Geometry",
    description: "2D lines, circles, parabolas, ellipses and hyperbolas",
    iconName: "CircleDot",
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
    iconName: "TrendingUp",
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
    iconName: "Box",
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
    iconName: "BarChart3",
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
    title: "Measurements & Basics",
    description: "Units, dimensions, errors and practical measurement techniques",
    iconName: "Gauge",
    cue: "Core Foundations",
    accentClass: "border-l-sky-500/80 dark:border-l-sky-400/80",
    iconContainerClass:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-400",
    slugs: [
      "unit-and-dimensions",
      "error-and-measurement",
    ],
    match: [
      "unit",
      "dimension",
      "measurement",
      "error",
      "vernier",
      "screw gauge",
    ],
  },
  {
    title: "Mechanics",
    description: "Kinematics, Newton's laws, work-energy, rotational dynamics, gravitation & fluids",
    iconName: "Gauge",
    cue: "Kinematics & Dynamics",
    accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
    iconContainerClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    slugs: [
      "rectilinear-motion",
      "projectile-motion-vector",
      "relative-motion",
      "newtons-laws-of-motion",
      "friction",
      "work-power-energy",
      "circular-motion",
      "centre-of-mass",
      "rigid-body-dynamics",
      "gravitation",
      "fluid-mechanics-properties-matter",
    ],
    match: [
      "rectilinear",
      "projectile",
      "relative",
      "laws of motion",
      "friction",
      "work",
      "power",
      "circular",
      "centre of mass",
      "center of mass",
      "rigid",
      "rotation",
      "gravitation",
      "fluid",
      "matter",
      "viscosity",
      "surface tension",
      "elasticity",
    ],
  },
  {
    title: "Thermodynamics & Waves",
    description: "Heat, kinetic theory, simple harmonic motion and wave mechanics",
    iconName: "Waves",
    cue: "Thermal & Wave Motion",
    accentClass: "border-l-rose-500/80 dark:border-l-rose-400/80",
    iconContainerClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
    slugs: [
      "simple-harmonic-motion",
      "string-waves",
      "heat-thermodynamics",
      "sound-waves",
    ],
    match: [
      "simple harmonic",
      "shm",
      "oscillation",
      "string wave",
      "thermal",
      "calorimetry",
      "heat",
      "thermodynamics",
      "kinetic theory",
      "sound",
      "doppler",
    ],
  },
  {
    title: "Electromagnetism",
    description: "Electrostatics, current electricity, capacitance, magnetism, induction, AC & EM waves",
    iconName: "Magnet",
    cue: "Fields & Circuits",
    accentClass: "border-l-indigo-500/80 dark:border-l-indigo-400/80",
    iconContainerClass:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-400",
    slugs: [
      "electrostatics",
      "current-electricity",
      "capacitance",
      "magnetic-effect-current-force",
      "electromagnetic-induction",
      "alternating-current",
      "electromagnetic-waves",
    ],
    match: [
      "electrostatics",
      "electric",
      "current",
      "capacitance",
      "capacitor",
      "magnetic",
      "magnetism",
      "electromagnetic induction",
      "emi",
      "alternating current",
      "ac ",
      "electromagnetic wave",
      "em wave",
    ],
  },
  {
    title: "Optics",
    description: "Geometrical ray optics, optical instruments and wave optics",
    iconName: "Sparkles",
    cue: "Ray & Wave Optics",
    accentClass: "border-l-violet-500/80 dark:border-l-violet-400/80",
    iconContainerClass:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-400",
    slugs: [
      "geometrical-optics",
      "wave-optics",
    ],
    match: [
      "geometrical optics",
      "ray optics",
      "wave optics",
      "lens",
      "mirror",
      "optical",
      "interference",
      "diffraction",
      "polarisation",
      "polarization",
      "optics",
    ],
  },
  {
    title: "Modern Physics",
    description: "Atoms, nuclei, dual nature, semiconductors & communication systems",
    iconName: "Atom",
    cue: "Quantum & Electronic Devices",
    accentClass: "border-l-emerald-500/80 dark:border-l-emerald-400/80",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
    slugs: [
      "modern-physics",
      "semiconductor",
      "principle-of-communication",
    ],
    match: [
      "modern physics",
      "dual nature",
      "matter wave",
      "radiation",
      "photoelectric",
      "atom",
      "nuclei",
      "nucleus",
      "semiconductor",
      "communication",
      "logic gate",
      "transistor",
    ],
  },
];

const CHEMISTRY_SECTIONS = [
  {
    title: "Physical Chemistry",
    description: "Formula maps, equilibrium, energy and rates",
    iconName: "FlaskConical",
    cue: "Formula / Process",
    range: [1, 10],
    accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
    iconContainerClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
  },
  {
    title: "Inorganic Chemistry",
    description: "Periodic patterns, bonding, groups and qualitative facts",
    iconName: "Layers3",
    cue: "Classification / Facts",
    range: [11, 18],
    accentClass: "border-l-emerald-500/70 dark:border-l-emerald-400/70",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  {
    title: "Organic Chemistry",
    description: "Mechanisms, reagents and reaction routes",
    iconName: "Route",
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
    iconName: "Network",
    cue: "Taxonomy",
    range: [1, 4],
    accentClass: "border-l-emerald-500/70 dark:border-l-emerald-400/70",
    iconContainerClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  {
    title: "Structural Organisation",
    description: "Plant anatomy, morphology and animal tissues",
    iconName: "Microscope",
    cue: "Structures",
    range: [5, 7],
    accentClass: "border-l-lime-500/70 dark:border-l-lime-400/70",
    iconContainerClass:
      "border-lime-500/20 bg-lime-500/10 text-lime-700 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400",
  },
  {
    title: "Cell Biology",
    description: "Cell structure, organelles and division",
    iconName: "Dna",
    cue: "Cell Recall",
    range: [8, 9],
    accentClass: "border-l-sky-500/70 dark:border-l-sky-400/70",
    iconContainerClass:
      "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-400",
  },
  {
    title: "Plant Physiology",
    description: "Transport, nutrition, photosynthesis and growth",
    iconName: "Leaf",
    cue: "Pathways",
    range: [10, 14],
    accentClass: "border-l-green-500/70 dark:border-l-green-400/70",
    iconContainerClass:
      "border-green-500/20 bg-green-500/10 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400",
  },
  {
    title: "Human Physiology",
    description: "Systems, coordination and regulation",
    iconName: "HeartPulse",
    cue: "Mechanisms",
    range: [15, 20],
    accentClass: "border-l-rose-500/70 dark:border-l-rose-400/70",
    iconContainerClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
  },
  {
    title: "Reproduction",
    description: "Organisms, flowering plants and human reproduction",
    iconName: "Baby",
    cue: "Sequences",
    range: [21, 24],
    accentClass: "border-l-pink-500/70 dark:border-l-pink-400/70",
    iconContainerClass:
      "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-400",
  },
  {
    title: "Genetics & Evolution",
    description: "Inheritance, molecular genetics and evolution",
    iconName: "Brain",
    cue: "Ratios / DNA",
    range: [25, 27],
    accentClass: "border-l-violet-500/70 dark:border-l-violet-400/70",
    iconContainerClass:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-400",
  },
  {
    title: "Human Welfare",
    description: "Health, food production and useful microbes",
    iconName: "ShieldCheck",
    cue: "Disease / Use",
    range: [28, 30],
    accentClass: "border-l-teal-500/70 dark:border-l-teal-400/70",
    iconContainerClass:
      "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-400",
  },
  {
    title: "Biotechnology",
    description: "Tools, processes and applications",
    iconName: "Sprout",
    cue: "Tools",
    range: [31, 32],
    accentClass: "border-l-cyan-500/70 dark:border-l-cyan-400/70",
    iconContainerClass:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-400",
  },
  {
    title: "Ecology",
    description: "Populations, ecosystems and conservation",
    iconName: "Trees",
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

    if (section.slugs) {
      section.slugs.forEach((slug) => {
        const found = chapters.find((c) => c.slug === slug && remaining.has(c.id));
        if (found) {
          matchedChapters.push(found);
          remaining.delete(found.id);
        }
      });
    }

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
      iconName: "Orbit",
      cue: "Revision Deck",
      accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
      iconContainerClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
      chapters: uncategorized,
    });
  }

  return sections;
}

function buildPhysicsSections(chapters) {
  const remaining = new Set(chapters.map((chapter) => chapter.id));

  const sections = PHYSICS_SECTIONS.map((section) => {
    const matchedChapters = [];

    if (section.slugs) {
      section.slugs.forEach((slug) => {
        const found = chapters.find((c) => c.slug === slug && remaining.has(c.id));
        if (found) {
          matchedChapters.push(found);
          remaining.delete(found.id);
        }
      });
    }

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
      description: "More physics formula decks",
      iconName: "Orbit",
      cue: "Formula Deck",
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

  if (subject.name === "Physics") {
    return buildPhysicsSections(chapters);
  }

  if (subject.name === "Chemistry") {
    return buildRangeSections(CHEMISTRY_SECTIONS, chapters);
  }

  if (subject.exam === "NEET" && subject.name === "Biology") {
    return buildRangeSections(BIOLOGY_SECTIONS, chapters);
  }

  return [
    {
      title: "Study Syllabus",
      description: "Chapter decks ready for revision",
      iconName: "Orbit",
      cue: "Revision Deck",
      accentClass: "border-l-amber-500/80 dark:border-l-amber-400/80",
      iconContainerClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
      chapters,
    },
  ];
}

export default async function FormulaSubjectPage({ params, searchParams }) {
  const { subjectSlug } = await params;
  const query = await searchParams;

  const { userId } = await auth();
  let profileExam = null;
  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("exam")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (profile?.exam) {
      profileExam = String(profile.exam).toUpperCase() === "NEET" ? "NEET" : "JEE";
    }
  }

  // When profile track is set, strictly use it; otherwise fallback to query param or JEE
  const exam = profileExam || (String(query?.exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE");

  let resolvedSubjectSlug = subjectSlug;
  if (exam === "JEE" && subjectSlug.toLowerCase() === "biology") {
    resolvedSubjectSlug = "physics";
  } else if (exam === "NEET" && (subjectSlug.toLowerCase() === "mathematics" || subjectSlug.toLowerCase() === "maths")) {
    resolvedSubjectSlug = "physics";
  }

  const [{ subject, chapters }, availableSubjects] = await Promise.all([
    getFormulaChaptersForSubject(resolvedSubjectSlug, exam),
    getFormulaSubjectsForExam(exam),
  ]);

  if (!subject) notFound();

  const chapterSections = getChapterSections(subject, chapters);

  return (
    <main className="min-h-screen bg-[var(--background)] py-4 text-slate-950 dark:text-white">
      <FormulaSubjectView
        subject={subject}
        chapters={chapters}
        sections={chapterSections}
        availableSubjects={availableSubjects}
        exam={exam}
        hasProfileTrack={Boolean(profileExam)}
      />
    </main>
  );
}
