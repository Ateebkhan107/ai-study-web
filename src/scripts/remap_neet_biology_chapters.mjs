import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const NCERT_CHAPTERS = [
  "The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom",
  "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals",
  "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Photosynthesis in Higher Plants",
  "Respiration in Plants", "Plant Growth and Development", "Digestion and Absorption",
  "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination",
  "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration",
  "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health",
  "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution",
  "Human Health and Disease", "Microbes in Human Welfare", "Biotechnology: Principles and Processes",
  "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation",
];

const exactChapter = (row) => {
  const { chapter, topic } = row;
  if (NCERT_CHAPTERS.includes(chapter)) return chapter;
  const direct = {
    "Animal Kingdom": "Animal Kingdom",
    "Biomolecules": "Biomolecules",
    "Chemical Coordination & Integration": "Chemical Coordination and Integration",
    "Evolution": "Evolution",
    "Molecular Basis of Inheritance": "Molecular Basis of Inheritance",
    "Plant Growth & Development": "Plant Growth and Development",
    "Plant Kingdom": "Plant Kingdom",
    "Principles of Inheritance & Variation (Genetics)": "Principles of Inheritance and Variation",
    "Sexual Reproduction in Flowering Plants": "Sexual Reproduction in Flowering Plants",
    "Structural Organisation in Animals": "Structural Organisation in Animals",
  };
  if (direct[chapter]) return direct[chapter];

  if (chapter === "The Living World & Biological Classification") {
    return ["Taxonomy", "Taxonomic categories"].includes(topic) ? "The Living World" : "Biological Classification";
  }
  if (chapter === "Morphology & Anatomy of Flowering Plants") {
    return ["Stem anatomy", "Leaf anatomy"].includes(topic) ? "Anatomy of Flowering Plants" : "Morphology of Flowering Plants";
  }
  if (chapter === "Cell: Structure, Function & Cell Division") {
    return ["Mitosis", "Meiosis"].includes(topic) ? "Cell Cycle and Cell Division" : "Cell: The Unit of Life";
  }
  if (chapter === "Plant Physiology (Photosynthesis & Respiration)") {
    return ["Respiration", "Krebs cycle"].includes(topic) ? "Respiration in Plants" : "Photosynthesis in Higher Plants";
  }
  if (chapter === "Human Physiology (Digestion, Respiration, Circulation)") {
    if (topic === "Digestion") return "Digestion and Absorption";
    if (["Respiration", "Respiratory gases"].includes(topic)) return "Breathing and Exchange of Gases";
    return "Body Fluids and Circulation";
  }
  if (chapter === "Excretion, Locomotion & Neural Control") {
    if (["Ultrafiltration", "Excretion"].includes(topic)) return "Excretory Products and their Elimination";
    if (topic === "Muscle contraction") return "Locomotion and Movement";
    return "Neural Control and Coordination";
  }
  if (chapter === "Human Reproduction & Reproductive Health") {
    return topic === "Contraception" ? "Reproductive Health" : "Human Reproduction";
  }
  if (chapter === "Human Health, Diseases & Microbes") {
    return topic === "Microbes in human welfare" ? "Microbes in Human Welfare" : "Human Health and Disease";
  }
  if (chapter === "Biotechnology: Principles & Applications") {
    return ["Biotech applications", "RNAi"].includes(topic)
      ? "Biotechnology and its Applications"
      : "Biotechnology: Principles and Processes";
  }
  if (chapter === "Ecology, Ecosystem & Biodiversity Conservation") {
    if (topic === "Population ecology") return "Organisms and Populations";
    if (["Ecosystem", "Ecological pyramids"].includes(topic)) return "Ecosystem";
    return "Biodiversity and Conservation";
  }
  throw new Error(`No NCERT mapping for ${chapter} / ${topic}`);
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase.from("questions")
    .select("id,chapter,topic")
    .eq("exam", "NEET")
    .eq("subject", "Biology")
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}
if (rows.length !== 100) throw new Error(`Refusing remap: expected 100 Biology rows, found ${rows.length}`);

const groups = new Map();
const updates = new Map();
for (const row of rows) {
  const chapter = exactChapter(row);
  if (!groups.has(chapter)) groups.set(chapter, []);
  groups.get(chapter).push(row.id);
  if (row.chapter !== chapter) {
    if (!updates.has(chapter)) updates.set(chapter, []);
    updates.get(chapter).push(row.id);
  }
}
if (groups.size !== 33) throw new Error(`Refusing remap: expected 33 populated NCERT chapters, found ${groups.size}`);

let changed = 0;
for (const [chapter, ids] of updates) {
  const { data, error } = await supabase.from("questions")
    .update({ chapter }).in("id", ids).select("id");
  if (error) throw error;
  if (data.length !== ids.length) throw new Error(`${chapter}: updated ${data.length}/${ids.length}`);
  changed += data.length;
}
console.log(JSON.stringify({ total: rows.length, changed, chapters: Object.fromEntries([...groups].map(([chapter, ids]) => [chapter, ids.length])) }, null, 2));
