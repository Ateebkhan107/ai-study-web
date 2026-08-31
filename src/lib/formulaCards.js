import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBatch2Cards, getBatch2Chapters } from "@/lib/formulaCardsBatch2";
import { getBatch3Cards, getBatch3Chapters } from "@/lib/formulaCardsBatch3";
import { getBatch4Cards, getBatch4Chapters } from "@/lib/formulaCardsBatch4";
import { getBatch5Cards, getBatch5Chapters } from "@/lib/formulaCardsBatch5";
import { getBatch6Cards, getBatch6Chapters } from "@/lib/formulaCardsBatch6";
import { getChemistryBatch1Cards, getChemistryBatch1Chapters } from "@/lib/formulaCardsChemistryBatch1";
import { getChemistryBatch2Cards, getChemistryBatch2Chapters } from "@/lib/formulaCardsChemistryBatch2";
import { getChemistryBatch3Cards, getChemistryBatch3Chapters } from "@/lib/formulaCardsChemistryBatch3";
import { getChemistryInorganicBatch1Cards, getChemistryInorganicBatch1Chapters } from "@/lib/formulaCardsChemistryInorganicBatch1";
import { getChemistryInorganicBatch2Cards, getChemistryInorganicBatch2Chapters } from "@/lib/formulaCardsChemistryInorganicBatch2";
import { getChemistryInorganicBatch3Cards, getChemistryInorganicBatch3Chapters } from "@/lib/formulaCardsChemistryInorganicBatch3";
import { getChemistryInorganicBatch4Cards, getChemistryInorganicBatch4Chapters } from "@/lib/formulaCardsChemistryInorganicBatch4";
import { getChemistryOrganicBatch1Cards, getChemistryOrganicBatch1Chapters } from "@/lib/formulaCardsChemistryOrganicBatch1";
import { getChemistryOrganicBatch2Cards, getChemistryOrganicBatch2Chapters } from "@/lib/formulaCardsChemistryOrganicBatch2";
import { getChemistryOrganicBatch3Cards, getChemistryOrganicBatch3Chapters } from "@/lib/formulaCardsChemistryOrganicBatch3";
import { getChemistryOrganicBatch4Cards, getChemistryOrganicBatch4Chapters } from "@/lib/formulaCardsChemistryOrganicBatch4";
import { getChemistryOrganicBatch5Cards, getChemistryOrganicBatch5Chapters } from "@/lib/formulaCardsChemistryOrganicBatch5";
import { getMathBatch1Cards, getMathBatch1Chapters } from "@/lib/formulaCardsMathBatch1";
import { getMathBatch2Cards, getMathBatch2Chapters } from "@/lib/formulaCardsMathBatch2";
import { getMathBatch3Cards, getMathBatch3Chapters } from "@/lib/formulaCardsMathBatch3";
import { getMathBatch4Cards, getMathBatch4Chapters } from "@/lib/formulaCardsMathBatch4";
import { getMathBatch5Cards, getMathBatch5Chapters } from "@/lib/formulaCardsMathBatch5";
import { getMathBatch6Cards, getMathBatch6Chapters } from "@/lib/formulaCardsMathBatch6";
import { getBiologyBatch1Cards, getBiologyBatch1Chapters } from "@/lib/formulaCardsBiologyBatch1";
import { getBiologyBatch2Cards, getBiologyBatch2Chapters } from "@/lib/formulaCardsBiologyBatch2";

const CARD_SELECT = `
  id,
  title,
  card_type,
  body,
  formulas,
  variables,
  conditions,
  table_data,
  diagram_data,
  diagram_svg,
  recall_data,
  importance,
  source_page,
  sort_order,
  is_active
`;

const SUBJECT_SELECT = `
  id,
  name,
  slug,
  exam,
  sort_order
`;

export const FORMULA_CARD_SUBJECTS = [
  { id: "jee-physics", name: "Physics", slug: "physics", exam: "JEE", sort_order: 1 },
  { id: "jee-chemistry", name: "Chemistry", slug: "chemistry", exam: "JEE", sort_order: 2 },
  { id: "jee-mathematics", name: "Mathematics", slug: "mathematics", exam: "JEE", sort_order: 3 },
  { id: "neet-physics", name: "Physics", slug: "physics", exam: "NEET", sort_order: 1 },
  { id: "neet-chemistry", name: "Chemistry", slug: "chemistry", exam: "NEET", sort_order: 2 },
  { id: "neet-biology", name: "Biology", slug: "biology", exam: "NEET", sort_order: 3 },
];

export const FORMULA_CARD_CHAPTERS = [
  {
    id: "jee-physics-unit-and-dimensions",
    subject_id: "jee-physics",
    title: "Unit and Dimensions",
    slug: "unit-and-dimensions",
    sort_order: 1,
  },
  {
    id: "jee-physics-rectilinear-motion",
    subject_id: "jee-physics",
    title: "Rectilinear Motion",
    slug: "rectilinear-motion",
    sort_order: 2,
  },
  ...getBatch2Chapters("jee"),
  ...getBatch3Chapters("jee"),
  ...getBatch4Chapters("jee"),
  ...getBatch5Chapters("jee"),
  ...getBatch6Chapters("jee"),
  ...getChemistryBatch1Chapters("jee"),
  ...getChemistryBatch2Chapters("jee"),
  ...getChemistryBatch3Chapters("jee"),
  ...getChemistryInorganicBatch1Chapters("jee"),
  ...getChemistryInorganicBatch2Chapters("jee"),
  ...getChemistryInorganicBatch3Chapters("jee"),
  ...getChemistryInorganicBatch4Chapters("jee"),
  ...getChemistryOrganicBatch1Chapters("jee"),
  ...getChemistryOrganicBatch2Chapters("jee"),
  ...getChemistryOrganicBatch3Chapters("jee"),
  ...getChemistryOrganicBatch4Chapters("jee"),
  ...getChemistryOrganicBatch5Chapters("jee"),
  ...getMathBatch1Chapters(),
  ...getMathBatch2Chapters(),
  ...getMathBatch3Chapters(),
  ...getMathBatch4Chapters(),
  ...getMathBatch5Chapters(),
  ...getMathBatch6Chapters(),
  {
    id: "neet-physics-unit-and-dimensions",
    subject_id: "neet-physics",
    title: "Unit and Dimensions",
    slug: "unit-and-dimensions",
    sort_order: 1,
  },
  {
    id: "neet-physics-rectilinear-motion",
    subject_id: "neet-physics",
    title: "Rectilinear Motion",
    slug: "rectilinear-motion",
    sort_order: 2,
  },
  ...getBatch2Chapters("neet"),
  ...getBatch3Chapters("neet"),
  ...getBatch4Chapters("neet"),
  ...getBatch5Chapters("neet"),
  ...getBatch6Chapters("neet"),
  ...getChemistryBatch1Chapters("neet"),
  ...getChemistryBatch2Chapters("neet"),
  ...getChemistryBatch3Chapters("neet"),
  ...getChemistryInorganicBatch1Chapters("neet"),
  ...getChemistryInorganicBatch2Chapters("neet"),
  ...getChemistryInorganicBatch3Chapters("neet"),
  ...getChemistryInorganicBatch4Chapters("neet"),
  ...getChemistryOrganicBatch1Chapters("neet"),
  ...getChemistryOrganicBatch2Chapters("neet"),
  ...getChemistryOrganicBatch3Chapters("neet"),
  ...getChemistryOrganicBatch4Chapters("neet"),
  ...getChemistryOrganicBatch5Chapters("neet"),
  ...getBiologyBatch1Chapters(),
  ...getBiologyBatch2Chapters(),
];

const unitCards = (chapterId) => [
  {
    id: `${chapterId}-unit-definition`,
    chapter_id: chapterId,
    title: "Unit",
    card_type: "concept",
    body:
      "Measurement of a physical quantity is expressed in terms of an internationally accepted basic standard called a unit.",
    formulas: [],
    variables: [],
    conditions: ["Source: Physics Formula Handbook, Unit and Dimensions."],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 3,
    source_page: 2,
    sort_order: 1,
    is_active: true,
  },
  {
    id: `${chapterId}-fundamental-units`,
    chapter_id: chapterId,
    title: "Fundamental SI Units",
    card_type: "table",
    body: "The handbook lists seven fundamental physical quantities and their SI units.",
    formulas: [],
    variables: [],
    conditions: [],
    table_data: {
      columns: ["Physical quantity", "SI unit", "Symbol"],
      rows: [
        ["Length", "Metre", "m"],
        ["Mass", "Kilogram", "kg"],
        ["Time", "Second", "s"],
        ["Electric current", "Ampere", "A"],
        ["Temperature", "Kelvin", "K"],
        ["Luminous intensity", "Candela", "cd"],
        ["Amount of substance", "Mole", "mol"],
      ],
    },
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 2,
    sort_order: 2,
    is_active: true,
  },
  {
    id: `${chapterId}-supplementary-units-prefixes`,
    chapter_id: chapterId,
    title: "Supplementary Units & Metric Prefixes",
    card_type: "table",
    body:
      "Plane angle and solid angle are listed as supplementary units, followed by common metric prefixes.",
    formulas: [],
    variables: [],
    conditions: [],
    table_data: {
      sections: [
        {
          title: "Supplementary units",
          columns: ["Physical quantity", "SI unit", "Symbol"],
          rows: [
            ["Plane angle", "Radian", "r"],
            ["Solid angle", "Steradian", "sr"],
          ],
        },
        {
          title: "Metric prefixes",
          columns: ["Prefix", "Symbol", "Value"],
          rows: [
            ["Centi", "c", "$10^{-2}$"],
            ["Milli", "m", "$10^{-3}$"],
            ["Micro", "$\\mu$", "$10^{-6}$"],
            ["Nano", "n", "$10^{-9}$"],
            ["Pico", "p", "$10^{-12}$"],
            ["Kilo", "K", "$10^{3}$"],
            ["Mega", "M", "$10^{6}$"],
          ],
        },
      ],
    },
    diagram_data: null,
    diagram_svg: null,
    importance: 4,
    source_page: 2,
    sort_order: 3,
    is_active: true,
  },
];

const rectilinearCards = (chapterId) => [
  {
    id: `${chapterId}-average-velocity-speed`,
    chapter_id: chapterId,
    title: "Average Velocity & Average Speed",
    card_type: "formula",
    body:
      "Average velocity uses total displacement over total time. Average speed uses total distance travelled over total time.",
    formulas: [
      { label: "Average velocity", latex: "\\vec v_{av}=\\bar v=\\langle v\\rangle=\\frac{\\vec r_f-\\vec r_i}{\\Delta t}" },
      { label: "Average speed", latex: "\\text{Average speed}=\\frac{\\text{Total distance travelled}}{\\text{Total time taken}}" },
    ],
    variables: [
      { latex: "\\vec r_i", symbol: "$\\vec r_i$", meaning: "initial position" },
      { latex: "\\vec r_f", symbol: "$\\vec r_f$", meaning: "final position" },
      { latex: "\\Delta t", symbol: "$\\Delta t$", meaning: "time interval" },
    ],
    conditions: ["Velocity depends on displacement; speed depends on distance travelled."],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 3,
    sort_order: 1,
    is_active: true,
  },
  {
    id: `${chapterId}-instantaneous-velocity`,
    chapter_id: chapterId,
    title: "Instantaneous Velocity",
    card_type: "formula",
    body: "Instantaneous velocity is the limiting value of displacement per time interval as the interval becomes very small.",
    formulas: [
      { label: "Instantaneous velocity", latex: "\\vec v_{inst}=\\lim_{\\Delta t\\to 0}\\left(\\frac{\\Delta \\vec r}{\\Delta t}\\right)" },
    ],
    variables: [{ latex: "\\Delta \\vec r", symbol: "$\\Delta \\vec r$", meaning: "small displacement in time $\\Delta t$" }],
    conditions: [],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 3,
    sort_order: 2,
    is_active: true,
  },
  {
    id: `${chapterId}-acceleration`,
    chapter_id: chapterId,
    title: "Average & Instantaneous Acceleration",
    card_type: "formula",
    body:
      "Average acceleration compares the change in velocity over a time interval. Instantaneous acceleration is the limiting value at an instant.",
    formulas: [
      { label: "Average acceleration", latex: "\\vec a_{av}=\\frac{\\Delta \\vec v}{\\Delta t}=\\frac{\\vec v_f-\\vec v_i}{\\Delta t}" },
      { label: "Instantaneous acceleration", latex: "\\vec a=\\frac{d\\vec v}{dt}=\\lim_{\\Delta t\\to 0}\\left(\\frac{\\Delta \\vec v}{\\Delta t}\\right)" },
    ],
    variables: [
      { latex: "\\vec v_i", symbol: "$\\vec v_i$", meaning: "initial velocity" },
      { latex: "\\vec v_f", symbol: "$\\vec v_f$", meaning: "final velocity" },
    ],
    conditions: [],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 3,
    sort_order: 3,
    is_active: true,
  },
  {
    id: `${chapterId}-x-t-graph`,
    chapter_id: chapterId,
    title: "Position-Time Graph",
    card_type: "diagram",
    body:
      "For uniformly accelerated motion with non-zero acceleration, position is a quadratic polynomial in time, so the x-t graph is a parabola.",
    formulas: [{ label: "Graph fact", latex: "x\\text{ is quadratic in }t\\Rightarrow x\\text{-}t\\text{ graph is a parabola}" }],
    variables: [],
    conditions: ["The handbook shows opposite curvatures for positive and negative acceleration."],
    table_data: null,
    diagram_data: { type: "xt" },
    diagram_svg: null,
    importance: 4,
    source_page: 3,
    sort_order: 4,
    is_active: true,
  },
  {
    id: `${chapterId}-v-t-graph`,
    chapter_id: chapterId,
    title: "Velocity-Time Graph",
    card_type: "diagram",
    body:
      "For uniformly accelerated motion, velocity is a linear polynomial in time, so the v-t graph is a straight line with slope a.",
    formulas: [{ label: "Slope", latex: "\\text{slope}=a" }],
    variables: [{ latex: "u", symbol: "$u$", meaning: "initial velocity on the v-axis" }],
    conditions: ["Positive acceleration gives positive slope; negative acceleration gives negative slope."],
    table_data: null,
    diagram_data: { type: "vt" },
    diagram_svg: null,
    importance: 4,
    source_page: 3,
    sort_order: 5,
    is_active: true,
  },
  {
    id: `${chapterId}-a-t-graph`,
    chapter_id: chapterId,
    title: "Acceleration-Time Graph",
    card_type: "diagram",
    body:
      "In uniformly accelerated motion, acceleration is constant, so the a-t graph is a horizontal line.",
    formulas: [{ label: "Constant acceleration", latex: "a=\\text{constant}" }],
    variables: [],
    conditions: ["The handbook shows separate horizontal lines for positive and negative acceleration."],
    table_data: null,
    diagram_data: { type: "at" },
    diagram_svg: null,
    importance: 4,
    source_page: 4,
    sort_order: 6,
    is_active: true,
  },
  {
    id: `${chapterId}-maxima-minima`,
    chapter_id: chapterId,
    title: "Maxima & Minima",
    card_type: "formula",
    body:
      "The handbook states derivative tests for locating maximum and minimum points.",
    formulas: [
      { label: "Maximum", latex: "\\frac{dy}{dx}=0\\ \\text{and}\\ \\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)<0" },
      { label: "Minimum", latex: "\\frac{dy}{dx}=0\\ \\text{and}\\ \\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)>0" },
    ],
    variables: [],
    conditions: [],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 3,
    source_page: 4,
    sort_order: 7,
    is_active: true,
  },
  {
    id: `${chapterId}-equations-of-motion`,
    chapter_id: chapterId,
    title: "Equations of Motion",
    card_type: "mixed",
    body: "These equations are for motion with constant acceleration.",
    formulas: [
      { latex: "v=u+at" },
      { latex: "s=ut+\\frac{1}{2}at^2" },
      { latex: "s=vt-\\frac{1}{2}at^2" },
      { latex: "x_f=x_i+ut+\\frac{1}{2}at^2" },
      { latex: "v^2=u^2+2as" },
      { latex: "s=\\frac{u+v}{2}t" },
      { latex: "s_n=u+\\frac{a}{2}(2n-1)" },
    ],
    variables: [
      { latex: "u", symbol: "$u$", meaning: "initial velocity" },
      { latex: "v", symbol: "$v$", meaning: "final velocity" },
      { latex: "a", symbol: "$a$", meaning: "constant acceleration" },
      { latex: "s", symbol: "$s$", meaning: "displacement" },
    ],
    conditions: ["Use for constant acceleration only."],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 4,
    sort_order: 8,
    is_active: true,
  },
  {
    id: `${chapterId}-free-fall`,
    chapter_id: chapterId,
    title: "Freely Falling Bodies",
    card_type: "mixed",
    body:
      "For freely falling bodies, the handbook uses u = 0 and takes upward direction as positive.",
    formulas: [
      { latex: "v=-gt" },
      { latex: "s=-\\frac{1}{2}gt^2" },
      { latex: "s=vt+\\frac{1}{2}gt^2" },
      { latex: "h_f=h_i-\\frac{1}{2}gt^2" },
      { latex: "v^2=-2gs" },
      { latex: "s_n=-\\frac{g}{2}(2n-1)" },
    ],
    variables: [{ latex: "g", symbol: "$g$", meaning: "acceleration due to gravity" }],
    conditions: ["$u=0$", "Upward direction is taken as positive."],
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    importance: 5,
    source_page: 4,
    sort_order: 9,
    is_active: true,
  },
];

export const FORMULA_CARD_SEED_CARDS = [
  ...unitCards("jee-physics-unit-and-dimensions"),
  ...rectilinearCards("jee-physics-rectilinear-motion"),
  ...getBatch2Cards("jee"),
  ...getBatch3Cards("jee"),
  ...getBatch4Cards("jee"),
  ...getBatch5Cards("jee"),
  ...getBatch6Cards("jee"),
  ...getChemistryBatch1Cards("jee"),
  ...getChemistryBatch2Cards("jee"),
  ...getChemistryBatch3Cards("jee"),
  ...getChemistryInorganicBatch1Cards("jee"),
  ...getChemistryInorganicBatch2Cards("jee"),
  ...getChemistryInorganicBatch3Cards("jee"),
  ...getChemistryInorganicBatch4Cards("jee"),
  ...getChemistryOrganicBatch1Cards("jee"),
  ...getChemistryOrganicBatch2Cards("jee"),
  ...getChemistryOrganicBatch3Cards("jee"),
  ...getChemistryOrganicBatch4Cards("jee"),
  ...getChemistryOrganicBatch5Cards("jee"),
  ...getMathBatch1Cards(),
  ...getMathBatch2Cards(),
  ...getMathBatch3Cards(),
  ...getMathBatch4Cards(),
  ...getMathBatch5Cards(),
  ...getMathBatch6Cards(),
  ...unitCards("neet-physics-unit-and-dimensions"),
  ...rectilinearCards("neet-physics-rectilinear-motion"),
  ...getBatch2Cards("neet"),
  ...getBatch3Cards("neet"),
  ...getBatch4Cards("neet"),
  ...getBatch5Cards("neet"),
  ...getBatch6Cards("neet"),
  ...getChemistryBatch1Cards("neet"),
  ...getChemistryBatch2Cards("neet"),
  ...getChemistryBatch3Cards("neet"),
  ...getChemistryInorganicBatch1Cards("neet"),
  ...getChemistryInorganicBatch2Cards("neet"),
  ...getChemistryInorganicBatch3Cards("neet"),
  ...getChemistryInorganicBatch4Cards("neet"),
  ...getChemistryOrganicBatch1Cards("neet"),
  ...getChemistryOrganicBatch2Cards("neet"),
  ...getChemistryOrganicBatch3Cards("neet"),
  ...getChemistryOrganicBatch4Cards("neet"),
  ...getChemistryOrganicBatch5Cards("neet"),
  ...getBiologyBatch1Cards(),
  ...getBiologyBatch2Cards(),
];

function sortByOrder(items) {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function mergeById(primary = [], fallback = []) {
  const rows = new Map();
  fallback.forEach((item) => rows.set(item.id, item));
  primary.forEach((item) => rows.set(item.id, item));
  return [...rows.values()];
}

async function readDbOrFallback(queryFn, fallback) {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.warn("[FORMULA_CARDS_DB_FALLBACK]", error.message || error);
      return fallback;
    }
    return data || fallback;
  } catch (error) {
    console.warn("[FORMULA_CARDS_DB_FALLBACK]", error?.message || error);
    return fallback;
  }
}

export const getCachedFormulaSubjects = unstable_cache(
  async () =>
    readDbOrFallback(
      () =>
        supabaseAdmin
          .from("formula_subjects")
          .select(SUBJECT_SELECT)
          .order("exam", { ascending: true })
          .order("sort_order", { ascending: true }),
      FORMULA_CARD_SUBJECTS
    ),
  ["formula-card-subjects"],
  { revalidate: 3600, tags: ["formula-cards"] }
);

export async function getFormulaSubjectsForExam(exam) {
  const normalizedExam = String(exam || "JEE").toUpperCase() === "NEET" ? "NEET" : "JEE";
  const subjects = await getCachedFormulaSubjects();
  return sortByOrder(subjects.filter((subject) => subject.exam === normalizedExam));
}

export async function getFormulaSubjectBySlug(subjectSlug, exam = "JEE") {
  const subjects = await getFormulaSubjectsForExam(exam);
  return subjects.find((subject) => subject.slug === subjectSlug) || null;
}

export async function getFormulaChaptersForSubject(subjectSlug, exam = "JEE") {
  const subject = await getFormulaSubjectBySlug(subjectSlug, exam);
  if (!subject) return { subject: null, chapters: [] };

  const fallbackChapters = FORMULA_CARD_CHAPTERS.filter((chapter) => chapter.subject_id === subject.id);
  const dbChapters = await readDbOrFallback(
    () =>
      supabaseAdmin
        .from("formula_chapters")
        .select("id, subject_id, title, slug, sort_order, formula_cards(id)")
        .eq("subject_id", subject.id)
        .order("sort_order", { ascending: true }),
    []
  );
  const chapters = mergeById(
    dbChapters,
    fallbackChapters.map((chapter) => ({
      ...chapter,
      formula_cards: FORMULA_CARD_SEED_CARDS.filter((card) => card.chapter_id === chapter.id && card.is_active).map((card) => ({
        id: card.id,
      })),
    }))
  );

  return {
    subject,
    chapters: sortByOrder(chapters).map((chapter) => ({
      ...chapter,
      card_count: Array.isArray(chapter.formula_cards) ? chapter.formula_cards.length : chapter.card_count || 0,
    })),
  };
}

export async function getFormulaChapterDeck(subjectSlug, chapterSlug, exam = "JEE") {
  const { subject, chapters } = await getFormulaChaptersForSubject(subjectSlug, exam);
  const chapter = chapters.find((item) => item.slug === chapterSlug) || null;
  if (!subject || !chapter) return { subject, chapter: null, cards: [], originalBook: null };

  const fallbackCards = FORMULA_CARD_SEED_CARDS.filter((card) => card.chapter_id === chapter.id && card.is_active);
  const dbCards = await readDbOrFallback(
    () =>
      supabaseAdmin
        .from("formula_cards")
        .select(CARD_SELECT)
        .eq("chapter_id", chapter.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    []
  );

  const originalBook = await getOriginalFormulaBook(subject.name, subject.exam);

  return {
    subject,
    chapter,
    cards: sortByOrder(mergeById(dbCards, fallbackCards)),
    originalBook,
  };
}

export async function getOriginalFormulaBook(subject, exam) {
  return readDbOrFallback(
    () =>
      supabaseAdmin
        .from("formula_books")
        .select("id, title, subject, stream")
        .eq("subject", subject)
        .eq("stream", exam)
        .order("title", { ascending: true })
        .limit(1)
        .maybeSingle(),
    null
  );
}
