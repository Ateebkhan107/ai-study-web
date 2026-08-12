import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");

const DRY_RUN = process.env.APPLY !== "1";
const REPORT_DIR = "tmp/pyq-chapter-mapping";
const PAGE_SIZE = 1000;
const UPDATE_CHUNK_SIZE = 50;

const CANONICAL_CHAPTERS = {
  Physics: [
    "Physical World & Units of Measurement",
    "Kinematics (Motion in a Straight Line & Plane)",
    "Laws of Motion & Friction",
    "Work, Energy & Power",
    "System of Particles & Rotational Motion",
    "Gravitation",
    "Mechanical Properties of Solids & Fluids",
    "Thermal Properties of Matter & Thermodynamics",
    "Kinetic Theory of Gases & Oscillations (SHM)",
    "Waves & Sound",
    "Electrostatics & Capacitance",
    "Current Electricity",
    "Magnetic Effects of Current & Magnetism",
    "Electromagnetic Induction & Alternating Current",
    "Electromagnetic Waves",
    "Ray Optics & Optical Instruments",
    "Wave Optics",
    "Dual Nature of Radiation & Matter",
    "Atoms & Nuclei",
    "Semiconductor Electronics & Devices",
    "Communication Systems",
  ],
  Chemistry: [
    "Some Basic Concepts of Chemistry (Mole Concept)",
    "Structure of Atom",
    "Classification of Elements & Periodicity",
    "Chemical Bonding & Molecular Structure",
    "States of Matter: Gases & Liquids",
    "Chemical Thermodynamics & Energetics",
    "Chemical & Ionic Equilibrium",
    "Redox Reactions & Electrochemistry",
    "Hydrogen",
    "s-Block Elements",
    "Chemical Kinetics",
    "Solutions & Colligative Properties",
    "Surface Chemistry",
    "Environmental Chemistry",
    "Solid State",
    "p-Block Elements (Groups 13 to 18)",
    "d and f-Block Elements",
    "Coordination Compounds",
    "General Principles of Extraction (Metallurgy)",
    "General Organic Chemistry (GOC) & Nomenclature",
    "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
    "Haloalkanes & Haloarenes",
    "Alcohols, Phenols & Ethers",
    "Aldehydes, Ketones & Carboxylic Acids",
    "Amines & Organic Nitrogen Compounds",
    "Biomolecules, Polymers & Everyday Chemistry",
    "Biomolecules",
    "Polymers",
    "Chemistry in Everyday Life",
  ],
  Maths: [
    "Sets",
    "Relations and Functions – I",
    "Trigonometric Functions",
    "Principle of Mathematical Induction",
    "Complex Numbers and Quadratic Equations",
    "Linear Inequalities",
    "Permutations and Combinations",
    "Binomial Theorem",
    "Sequences and Series",
    "Straight Lines",
    "Conic Sections",
    "Introduction to Three Dimensional Geometry",
    "Limits and Derivatives",
    "Mathematical Reasoning",
    "Statistics",
    "Probability – I",
    "Relations and Functions – II",
    "Inverse Trigonometric Functions",
    "Matrices",
    "Determinants",
    "Continuity and Differentiability",
    "Application of Derivatives",
    "Integrals",
    "Application of Integrals",
    "Differential Equations",
    "Vector Algebra",
    "Three Dimensional Geometry",
    "Linear Programming",
    "Probability – II",
  ],
  Biology: [
    "The Living World & Biological Classification",
    "Plant Kingdom",
    "Animal Kingdom",
    "Morphology & Anatomy of Flowering Plants",
    "Structural Organisation in Animals",
    "Cell: Structure, Function & Cell Division",
    "Biomolecules",
    "Plant Physiology (Photosynthesis & Respiration)",
    "Plant Growth & Development",
    "Human Physiology (Digestion, Respiration, Circulation)",
    "Excretion, Locomotion & Neural Control",
    "Chemical Coordination & Integration",
    "Sexual Reproduction in Flowering Plants",
    "Human Reproduction & Reproductive Health",
    "Principles of Inheritance & Variation (Genetics)",
    "Molecular Basis of Inheritance",
    "Evolution",
    "Human Health, Diseases & Microbes",
    "Biotechnology: Principles & Applications",
    "Ecology, Ecosystem & Biodiversity Conservation",
  ],
};

const ALIASES = {
  "Units and Measurements": "Physical World & Units of Measurement",
  "Units and Dimensions": "Physical World & Units of Measurement",
  "Units, Dimensions & Measurements": "Physical World & Units of Measurement",
  Kinematics: "Kinematics (Motion in a Straight Line & Plane)",
  "Motion in a Straight Line": "Kinematics (Motion in a Straight Line & Plane)",
  "Motion in a Plane": "Kinematics (Motion in a Straight Line & Plane)",
  "Laws of Motion": "Laws of Motion & Friction",
  "Work, Energy and Power": "Work, Energy & Power",
  "Work Power and Energy": "Work, Energy & Power",
  "Rotational Motion": "System of Particles & Rotational Motion",
  Rotation: "System of Particles & Rotational Motion",
  "Centre of Mass": "System of Particles & Rotational Motion",
  "Center of Mass": "System of Particles & Rotational Motion",
  "Properties of Matter": "Mechanical Properties of Solids & Fluids",
  Thermodynamics: "Thermal Properties of Matter & Thermodynamics",
  "Thermal Properties of Matter": "Thermal Properties of Matter & Thermodynamics",
  Oscillations: "Kinetic Theory of Gases & Oscillations (SHM)",
  Waves: "Waves & Sound",
  Electrostatics: "Electrostatics & Capacitance",
  "Electric Charges and Fields": "Electrostatics & Capacitance",
  "Electrostatic Potential and Capacitance": "Electrostatics & Capacitance",
  Magnetism: "Magnetic Effects of Current & Magnetism",
  Electromagnetism: "Magnetic Effects of Current & Magnetism",
  "Electromagnetic Induction": "Electromagnetic Induction & Alternating Current",
  "Alternating Current": "Electromagnetic Induction & Alternating Current",
  "Ray Optics": "Ray Optics & Optical Instruments",
  "Ray Optics and Optical Instruments": "Ray Optics & Optical Instruments",
  "Dual Nature of Radiation and Matter": "Dual Nature of Radiation & Matter",
  "Modern Physics & Dual Nature": "Dual Nature of Radiation & Matter",
  "Atoms and Nuclei": "Atoms & Nuclei",
  "Modern Physics": "Atoms & Nuclei",
  "Semiconductors & Electronic Devices": "Semiconductor Electronics & Devices",
  Semiconductor: "Semiconductor Electronics & Devices",

  "Some Basic Concepts of Chemistry": "Some Basic Concepts of Chemistry (Mole Concept)",
  "Mole Concept": "Some Basic Concepts of Chemistry (Mole Concept)",
  "Atomic Structure": "Structure of Atom",
  "Periodic Table & Periodicity": "Classification of Elements & Periodicity",
  "Chemical Bonding and Molecular Structure": "Chemical Bonding & Molecular Structure",
  "States of Matter": "States of Matter: Gases & Liquids",
  "Chemical Thermodynamics": "Chemical Thermodynamics & Energetics",
  Equilibrium: "Chemical & Ionic Equilibrium",
  "Chemical Equilibrium": "Chemical & Ionic Equilibrium",
  "Ionic Equilibrium": "Chemical & Ionic Equilibrium",
  Electrochemistry: "Redox Reactions & Electrochemistry",
  "Electrochemistry & Redox Reactions": "Redox Reactions & Electrochemistry",
  "Redox Reactions": "Redox Reactions & Electrochemistry",
  Solutions: "Solutions & Colligative Properties",
  "The Solid State": "Solid State",
  "p-Block Elements": "p-Block Elements (Groups 13 to 18)",
  "The p-Block Elements": "p-Block Elements (Groups 13 to 18)",
  "The d- and f-Block Elements": "d and f-Block Elements",
  Metallurgy: "General Principles of Extraction (Metallurgy)",
  "General Organic Chemistry (GOC)": "General Organic Chemistry (GOC) & Nomenclature",
  "Organic Chemistry": "General Organic Chemistry (GOC) & Nomenclature",
  Hydrocarbons: "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)",
  "Haloalkanes and Haloarenes": "Haloalkanes & Haloarenes",
  "Alcohols, Phenols and Ethers": "Alcohols, Phenols & Ethers",
  "Aldehydes, Ketones and Carboxylic Acids": "Aldehydes, Ketones & Carboxylic Acids",
  Amines: "Amines & Organic Nitrogen Compounds",
  "Biomolecules and Polymers": "Biomolecules, Polymers & Everyday Chemistry",

  Trigonometry: "Trigonometric Functions",
  "Mathematical Induction": "Principle of Mathematical Induction",
  "Complex Numbers & Quadratic Equations": "Complex Numbers and Quadratic Equations",
  "Complex Numbers": "Complex Numbers and Quadratic Equations",
  "Quadratic Equations": "Complex Numbers and Quadratic Equations",
  "Permutations & Combinations": "Permutations and Combinations",
  "Sequence and Series": "Sequences and Series",
  Probability: "Probability – I",
  "Limits & Derivatives": "Limits and Derivatives",
  "Application of Derivatives (MOD & Maxima-Minima)": "Application of Derivatives",
  "Integral Calculus": "Integrals",
  "Indefinite & Definite Integrals": "Integrals",
  "Vectors and 3D Geometry": "Vector Algebra",
  "3D Geometry": "Three Dimensional Geometry",
  "Statistics and Probability": "Statistics",

  "General Biology": "The Living World & Biological Classification",
  "Cell Structure, Biomolecules & Cell Division": "Cell: Structure, Function & Cell Division",
  "Human Physiology (Digestion & Respiration)": "Human Physiology (Digestion, Respiration, Circulation)",
  "Genetics & Principles of Inheritance": "Principles of Inheritance & Variation (Genetics)",
  "Plant Growth & Mineral Nutrition": "Plant Growth & Development",
};

const RULES = {
  Physics: [
    ["Electromagnetic Induction & Alternating Current", ["faraday", "lenz", "magnetic flux", "induced emf", "self inductance", "mutual inductance", "alternating current", "reactance", "impedance", "transformer"]],
    ["Electromagnetic Waves", ["electromagnetic wave", "em wave", "displacement current", "radio wave", "microwave"]],
    ["Magnetic Effects of Current & Magnetism", ["magnetic field", "magnetic moment", "moving charge", "lorentz", "biot", "savart", "ampere", "solenoid", "galvanometer", "cyclotron"]],
    ["Current Electricity", ["current", "resistance", "resistor", "ohm", "wheatstone", "meter bridge", "potentiometer", "kirchhoff", "battery"]],
    ["Electrostatics & Capacitance", ["capacitor", "capacitance", "electric field", "electric potential", "dipole", "coulomb", "gauss", "charge density"]],
    ["Ray Optics & Optical Instruments", ["lens", "mirror", "prism", "refraction", "reflection", "focal length", "microscope", "telescope"]],
    ["Wave Optics", ["interference", "diffraction", "young", "fringe", "polarisation", "polarization", "brewster"]],
    ["Semiconductor Electronics & Devices", ["semiconductor", "diode", "transistor", "logic gate", "rectifier", "zener", "p-n junction"]],
    ["Dual Nature of Radiation & Matter", ["photoelectric", "de broglie", "photon", "work function", "stopping potential"]],
    ["Atoms & Nuclei", ["bohr", "hydrogen spectrum", "radioactive", "half life", "nucleus", "nuclei", "binding energy", "alpha decay", "beta decay"]],
    ["Waves & Sound", ["sound", "wave", "doppler", "pipe", "organ pipe", "string", "beats", "resonance"]],
    ["Kinetic Theory of Gases & Oscillations (SHM)", ["simple harmonic", "shm", "oscillation", "spring", "kinetic theory", "rms speed", "mean free path"]],
    ["Thermal Properties of Matter & Thermodynamics", ["temperature", "heat", "calorimetry", "thermal", "entropy", "enthalpy", "adiabatic", "isothermal", "specific heat"]],
    ["Mechanical Properties of Solids & Fluids", ["young's modulus", "elastic", "viscosity", "surface tension", "bernoulli", "poiseuille", "bulk modulus"]],
    ["Gravitation", ["gravitation", "gravitational", "planet", "satellite", "escape velocity", "kepler", "orbital"]],
    ["System of Particles & Rotational Motion", ["moment of inertia", "torque", "angular momentum", "centre of mass", "center of mass", "rolling", "rotational"]],
    ["Work, Energy & Power", ["work done", "kinetic energy", "potential energy", "power", "conservative force"]],
    ["Laws of Motion & Friction", ["friction", "inclined plane", "newton", "tension", "pseudo force", "pulley"]],
    ["Kinematics (Motion in a Straight Line & Plane)", ["velocity", "acceleration", "projectile", "displacement", "relative velocity"]],
    ["Physical World & Units of Measurement", ["dimension", "significant figures", "vernier", "screw gauge", "measurement", "least count"]],
  ],
  Chemistry: [
    ["Amines & Organic Nitrogen Compounds", ["amine", "aniline", "diazonium", "benzene diazonium", "nitrobenzene"]],
    ["Aldehydes, Ketones & Carboxylic Acids", ["aldehyde", "ketone", "carboxylic", "aldol", "cannizzaro", "tollen", "fehling"]],
    ["Alcohols, Phenols & Ethers", ["alcohol", "phenol", "ether", "williamson", "kolbe", "reimer"]],
    ["Haloalkanes & Haloarenes", ["haloalkane", "haloarene", "alkyl halide", "aryl halide", "sn1", "sn2"]],
    ["Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", ["alkane", "alkene", "alkyne", "benzene", "aromatic", "hydrocarbon"]],
    ["General Organic Chemistry (GOC) & Nomenclature", ["iupac", "isomer", "carbocation", "carbanion", "inductive effect", "mesomeric", "resonance", "hybridisation of carbon"]],
    ["Biomolecules, Polymers & Everyday Chemistry", ["protein", "carbohydrate", "glucose", "fructose", "sucrose", "polymer", "nylon", "bakelite", "drug", "antacid"]],
    ["Chemistry in Everyday Life", ["antacid", "antihistamine", "tranquilizer", "drug", "detergent"]],
    ["Polymers", ["polymer", "monomer", "nylon", "bakelite", "rubber", "teflon"]],
    ["Biomolecules", ["glucose", "fructose", "carbohydrate", "protein", "enzyme", "vitamin", "dna", "rna"]],
    ["Coordination Compounds", ["coordination", "ligand", "complex", "crystal field", "chelate", "coordination number"]],
    ["d and f-Block Elements", ["d-block", "f-block", "transition element", "lanthanoid", "actinoid", "paramagnetic"]],
    ["p-Block Elements (Groups 13 to 18)", ["p-block", "boron", "carbon family", "nitrogen family", "phosphorus", "xenon", "interhalogen"]],
    ["s-Block Elements", ["s-block", "alkali metal", "alkaline earth", "beryllium", "calcium", "sodium carbonate"]],
    ["Hydrogen", ["hydrogen peroxide", "heavy water", "hydride", "dihydrogen"]],
    ["General Principles of Extraction (Metallurgy)", ["metallurgy", "extraction", "roasting", "calcination", "froth flotation"]],
    ["Surface Chemistry", ["adsorption", "colloid", "catalysis", "emulsion", "micelle"]],
    ["Solid State", ["unit cell", "crystal lattice", "packing efficiency", "schottky", "frenkel", "bcc", "fcc"]],
    ["Solutions & Colligative Properties", ["colligative", "raoult", "osmotic pressure", "vapour pressure", "boiling point elevation", "freezing point depression"]],
    ["Chemical Kinetics", ["rate constant", "order of reaction", "first order", "half life", "activation energy", "arrhenius"]],
    ["Redox Reactions & Electrochemistry", ["redox", "oxidation number", "electrode", "cell potential", "nernst", "conductance", "faraday constant"]],
    ["Chemical & Ionic Equilibrium", ["equilibrium", "le chatelier", "kp", "kc", "ionic product", "buffer", "solubility product", "ph"]],
    ["Chemical Thermodynamics & Energetics", ["thermodynamic", "enthalpy", "entropy", "gibbs", "heat of formation", "spontaneous"]],
    ["Chemical Bonding & Molecular Structure", ["bond order", "hybridization", "hybridisation", "molecular orbital", "vsepr", "dipole moment"]],
    ["Classification of Elements & Periodicity", ["periodic", "ionization", "ionisation", "electron affinity", "electronegativity", "atomic radius"]],
    ["Structure of Atom", ["quantum number", "orbital", "de broglie", "bohr", "photoelectron", "aufbau"]],
    ["Some Basic Concepts of Chemistry (Mole Concept)", ["mole", "molarity", "molality", "stoichiometry", "limiting reagent", "empirical formula"]],
    ["States of Matter: Gases & Liquids", ["ideal gas", "real gas", "van der waals", "kinetic molecular", "critical temperature"]],
    ["Environmental Chemistry", ["greenhouse", "pollution", "ozone", "smog", "bod", "cod"]],
  ],
  Maths: [
    ["Matrices", ["matrix", "matrices", "eigenvalue", "adjoint", "inverse of a matrix"]],
    ["Determinants", ["determinant", "cofactor", "minor"]],
    ["Vector Algebra", ["vector", "dot product", "cross product", "scalar triple"]],
    ["Three Dimensional Geometry", ["plane", "direction cosine", "direction ratio", "shortest distance", "line in space"]],
    ["Differential Equations", ["differential equation", "dy/dx", "order and degree"]],
    ["Application of Integrals", ["area bounded", "area enclosed", "area under", "region bounded"]],
    ["Integrals", ["integral", "integration", "definite integral", "indefinite integral"]],
    ["Application of Derivatives", ["maxima", "minima", "tangent", "normal", "increasing", "decreasing"]],
    ["Continuity and Differentiability", ["continuous", "continuity", "differentiable", "differentiability"]],
    ["Limits and Derivatives", ["limit", "derivative", "first principle"]],
    ["Inverse Trigonometric Functions", ["sin^-1", "cos^-1", "tan^-1", "inverse trigonometric"]],
    ["Trigonometric Functions", ["trigonometric", "sin", "cos", "tan", "cot"]],
    ["Conic Sections", ["parabola", "ellipse", "hyperbola", "eccentricity", "focus", "directrix"]],
    ["Straight Lines", ["straight line", "slope", "line passes", "pair of lines"]],
    ["Probability – II", ["conditional probability", "bayes", "random variable", "binomial distribution"]],
    ["Probability – I", ["probability", "event", "cards", "dice"]],
    ["Statistics", ["mean", "variance", "standard deviation", "median"]],
    ["Sequences and Series", ["arithmetic progression", "geometric progression", "sequence", "series", "sum of"]],
    ["Binomial Theorem", ["binomial", "coefficient of", "middle term"]],
    ["Permutations and Combinations", ["permutation", "combination", "arrangement", "selection", "ways"]],
    ["Complex Numbers and Quadratic Equations", ["complex number", "imaginary", "arg", "modulus", "quadratic equation", "roots of"]],
    ["Relations and Functions – II", ["onto", "one-one", "bijective", "composite function"]],
    ["Relations and Functions – I", ["relation", "function", "domain", "range"]],
    ["Sets", ["set", "subset", "union", "intersection", "venn"]],
    ["Mathematical Reasoning", ["statement", "contrapositive", "converse", "logical", "truth value"]],
    ["Linear Inequalities", ["inequality", "linear inequality"]],
    ["Linear Programming", ["linear programming", "objective function", "constraints"]],
    ["Introduction to Three Dimensional Geometry", ["coordinates in space", "octant"]],
    ["Principle of Mathematical Induction", ["mathematical induction"]],
  ],
  Biology: [
    ["Ecology, Ecosystem & Biodiversity Conservation", ["ecosystem", "ecology", "biodiversity", "population", "conservation", "food chain", "pyramid"]],
    ["Biotechnology: Principles & Applications", ["biotechnology", "pcr", "plasmid", "restriction enzyme", "recombinant", "gel electrophoresis"]],
    ["Human Health, Diseases & Microbes", ["disease", "immunity", "antibody", "cancer", "malaria", "typhoid", "microbe", "vaccine"]],
    ["Evolution", ["evolution", "natural selection", "darwin", "homologous", "analogous", "hardy-weinberg"]],
    ["Molecular Basis of Inheritance", ["dna", "rna", "transcription", "translation", "genetic code", "replication", "lac operon"]],
    ["Principles of Inheritance & Variation (Genetics)", ["mendel", "inheritance", "pedigree", "genotype", "phenotype", "linkage"]],
    ["Human Reproduction & Reproductive Health", ["sperm", "ovum", "pregnancy", "menstruation", "contraceptive", "fallopian", "ivf"]],
    ["Sexual Reproduction in Flowering Plants", ["pollen", "embryo sac", "endosperm", "double fertilization", "ovule"]],
    ["Chemical Coordination & Integration", ["hormone", "pituitary", "thyroid", "adrenal", "insulin"]],
    ["Excretion, Locomotion & Neural Control", ["nephron", "kidney", "muscle", "neuron", "synapse", "locomotion"]],
    ["Human Physiology (Digestion, Respiration, Circulation)", ["digestion", "breathing", "respiration", "blood", "heart", "circulation", "expiratory"]],
    ["Plant Growth & Development", ["auxin", "gibberellin", "cytokinin", "abscisic", "plant growth"]],
    ["Plant Physiology (Photosynthesis & Respiration)", ["photosynthesis", "respiration", "chlorophyll", "rubisco", "krebs", "glycolysis"]],
    ["Cell: Structure, Function & Cell Division", ["cell", "mitosis", "meiosis", "ribosome", "golgi", "chromosome", "biomembrane"]],
    ["Biomolecules", ["enzyme", "protein", "nucleic acid", "amino acid", "carbohydrate"]],
    ["Structural Organisation in Animals", ["tissue", "cartilage", "ligament", "epithelium", "skeletal muscle"]],
    ["Morphology & Anatomy of Flowering Plants", ["root", "stem", "leaf", "flower", "fabaceae", "liliaceae", "solanaceae", "lenticel"]],
    ["Animal Kingdom", ["phylum", "coelom", "radial symmetry", "arthropoda", "chordata"]],
    ["Plant Kingdom", ["moss", "protonema", "bryophyte", "pteridophyte", "gymnosperm", "angiosperm"]],
    ["The Living World & Biological Classification", ["taxonomic", "classification", "whittaker", "monera", "protista"]],
  ],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function normalKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const canonicalByKey = new Map();
for (const chapters of Object.values(CANONICAL_CHAPTERS)) {
  for (const chapter of chapters) canonicalByKey.set(normalKey(chapter), chapter);
}
for (const [alias, chapter] of Object.entries(ALIASES)) canonicalByKey.set(normalKey(alias), chapter);

function canonicalSubject(subject) {
  return subject === "Mathematics" ? "Maths" : subject;
}

function canonicalChapter(chapter) {
  return canonicalByKey.get(normalKey(chapter)) || "";
}

function isUnmapped(chapter) {
  return !chapter || /^unmapped$/i.test(chapter) || / core$/i.test(chapter);
}

function isPlaceholderQuestion(question) {
  return /^\s*Question\s+\d+\s*:\s*Refer to (the )?source image\.?\s*$/i.test(String(question || ""));
}

function questionText(row) {
  return [
    row.question,
    row.option_a,
    row.option_b,
    row.option_c,
    row.option_d,
    row.explanation,
  ].filter(Boolean).join(" ");
}

function classifyByText(row) {
  const subject = canonicalSubject(row.subject);
  const rules = RULES[subject] || [];
  const text = normalKey(questionText(row));
  if (!text || isPlaceholderQuestion(row.question)) return null;

  const scored = rules
    .map(([chapter, keywords]) => ({
      chapter,
      score: keywords.reduce((total, keyword) => total + (text.includes(normalKey(keyword)) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;
  const [best, second] = scored;
  const accepted = best.score >= 2 || (best.score === 1 && !second);
  const hasMargin = !second || best.score > second.score;
  if (!accepted || !hasMargin) return null;
  return best.chapter;
}

async function fetchRows() {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .select("id,exam,exam_type,year,attempt,shift,paper_code,question_number,subject,chapter,question,question_image,option_a,option_b,option_c,option_d,explanation,status")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function buildPlan(rows) {
  const updates = [];
  const manualReview = [];
  const alreadyCanonical = [];

  for (const row of rows) {
    const subject = canonicalSubject(row.subject);
    const validChapters = new Set(CANONICAL_CHAPTERS[subject] || []);
    const fromExisting = canonicalChapter(row.chapter);
    const existingIsCanonical = validChapters.has(row.chapter);
    let nextChapter = "";
    let reason = "";

    if (existingIsCanonical) {
      alreadyCanonical.push(row.id);
      continue;
    }

    if (fromExisting && validChapters.has(fromExisting)) {
      nextChapter = fromExisting;
      reason = "existing chapter alias matched canonical test-page chapter";
    } else {
      const classified = classifyByText(row);
      if (classified && validChapters.has(classified)) {
        nextChapter = classified;
        reason = "stored question/options text matched chapter keywords";
      }
    }

    if (nextChapter && nextChapter !== row.chapter) {
      updates.push({
        id: row.id,
        paper_code: row.paper_code,
        question_number: row.question_number,
        subject: row.subject,
        old_chapter: row.chapter,
        new_chapter: nextChapter,
        reason,
      });
      continue;
    }

    if (isUnmapped(row.chapter) || !existingIsCanonical) {
      manualReview.push({
        id: row.id,
        paper_code: row.paper_code,
        question_number: row.question_number,
        subject: row.subject,
        chapter: row.chapter,
        reason: isPlaceholderQuestion(row.question)
          ? "image-only placeholder; chapter cannot be identified safely from stored text"
          : "stored text did not produce a confident canonical chapter match",
      });
    }
  }

  return { updates, manualReview, alreadyCanonical };
}

async function applyUpdates(updates) {
  for (let start = 0; start < updates.length; start += UPDATE_CHUNK_SIZE) {
    const chunk = updates.slice(start, start + UPDATE_CHUNK_SIZE);
    for (const update of chunk) {
      const { error } = await supabase
        .from("pyq_questions")
        .update({ chapter: update.new_chapter })
        .eq("id", update.id);
      if (error) throw new Error(`${update.id}: ${error.message}`);
    }
  }
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const rows = await fetchRows();
  const plan = buildPlan(rows);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(REPORT_DIR, `backup-before-pyq-chapter-map-${timestamp}.json`);
  const updatesPath = path.join(REPORT_DIR, `pyq-chapter-map-updates-${timestamp}.json`);
  const manualPath = path.join(REPORT_DIR, `pyq-chapter-map-manual-review-${timestamp}.json`);

  const backupRows = rows
    .filter((row) => plan.updates.some((update) => update.id === row.id))
    .map((row) => ({ id: row.id, chapter: row.chapter, subject: row.subject, paper_code: row.paper_code, question_number: row.question_number }));

  await fs.writeFile(backupPath, JSON.stringify(backupRows, null, 2));
  await fs.writeFile(updatesPath, JSON.stringify(plan.updates, null, 2));
  await fs.writeFile(manualPath, JSON.stringify(plan.manualReview, null, 2));

  if (!DRY_RUN) {
    await applyUpdates(plan.updates);
  }

  const bySubject = {};
  for (const update of plan.updates) {
    const subject = canonicalSubject(update.subject);
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  }

  console.log(JSON.stringify({
    dryRun: DRY_RUN,
    totalRows: rows.length,
    alreadyCanonical: plan.alreadyCanonical.length,
    plannedOrAppliedUpdates: plan.updates.length,
    manualReview: plan.manualReview.length,
    updatesBySubject: bySubject,
    backupPath,
    updatesPath,
    manualReviewPath: manualPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
