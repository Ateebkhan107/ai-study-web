const fs = require("fs");
const path = require("path");

const pdfPath = "/Users/ateebfatmi/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/EE89D0F9-47ED-4CD9-84FD-CF229363E08A/NEET UG 2025 Question Paper with Solutions_ FREE PDF Download.pdf";

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function getChapter(subject, text, explanation) {
  const combined = (text + " " + (explanation || "")).toLowerCase();

  if (subject === "Physics") {
    if (combined.includes("capacitor") || combined.includes("charge") || combined.includes("dipole") || combined.includes("potential energy") || combined.includes("electric field") || combined.includes("coulomb") || combined.includes("electrostatic")) return "Electrostatics & Capacitance";
    if (combined.includes("current") || combined.includes("resistor") || combined.includes("resistance") || combined.includes("ohm") || combined.includes("battery") || combined.includes("wheatstone") || combined.includes("volt")) return "Current Electricity";
    if (combined.includes("magnetic") || combined.includes("solenoid") || combined.includes("biot") || combined.includes("ampere") || combined.includes("lorentz") || combined.includes("galvanometer")) return "Magnetic Effects of Current & Magnetism";
    if (combined.includes("induction") || combined.includes("flux") || combined.includes("faraday") || combined.includes("lenz") || combined.includes("alternating current") || combined.includes("ac power") || combined.includes("reactance") || combined.includes("inductor")) return "Electromagnetic Induction & Alternating Current";
    if (combined.includes("electromagnetic wave") || combined.includes("em wave")) return "Electromagnetic Waves";
    if (combined.includes("lens") || combined.includes("microscope") || combined.includes("telescope") || combined.includes("refraction") || combined.includes("reflection") || combined.includes("prism") || combined.includes("focal length") || combined.includes("polaroid") || combined.includes("polarization") || combined.includes("photoelectric") || combined.includes("wave optics") || combined.includes("interference") || combined.includes("diffraction")) return "Ray & Wave Optics";
    if (combined.includes("de-broglie") || combined.includes("bohr") || combined.includes("photon") || combined.includes("work function") || combined.includes("atom") || combined.includes("nucleus") || combined.includes("radioactive") || combined.includes("half-life")) return "Modern Physics & Dual Nature";
    if (combined.includes("semiconductor") || combined.includes("diode") || combined.includes("transistor") || combined.includes("logic gate") || combined.includes("n-type") || combined.includes("p-type") || combined.includes("rectifier")) return "Semiconductors & Electronic Devices";
    if (combined.includes("impulse") || combined.includes("mass") || combined.includes("height") || combined.includes("velocity") || combined.includes("acceleration") || combined.includes("speed") || combined.includes("projectile") || combined.includes("distance") || combined.includes("displacement") || combined.includes("bus")) return "Kinematics (Motion in a Straight Line & Plane)";
    if (combined.includes("force") || combined.includes("friction") || combined.includes("inclined") || combined.includes("newton") || combined.includes("momentum")) return "Laws of Motion & Friction";
    if (combined.includes("kinetic energy") || combined.includes("work") || combined.includes("power") || combined.includes("stopping distance")) return "Work, Energy & Power";
    if (combined.includes("rod") || combined.includes("rotational") || combined.includes("moment of inertia") || combined.includes("torque") || combined.includes("angular") || combined.includes("center of mass") || combined.includes("centre of mass")) return "System of Particles & Rotational Motion";
    if (combined.includes("sun") || combined.includes("planet") || combined.includes("orbit") || combined.includes("earth") || combined.includes("gravitational") || combined.includes("kepler") || combined.includes("mars")) return "Gravitation";
    if (combined.includes("temperature") || combined.includes("heat") || combined.includes("thermal") || combined.includes("conduction") || combined.includes("gas") || combined.includes("chamber") || combined.includes("pressure") || combined.includes("volume")) return "Thermal Properties of Matter & Thermodynamics";
    if (combined.includes("spring") || combined.includes("oscillat") || combined.includes("frequency") || combined.includes("amplitude") || combined.includes("pipe") || combined.includes("sound") || combined.includes("resonance")) return "Oscillations & Waves";
    if (combined.includes("error") || combined.includes("measurement") || combined.includes("vernier") || combined.includes("dimension")) return "Units, Dimensions & Measurements";
    return "Physics Core";
  }

  if (subject === "Chemistry") {
    if (combined.includes("acid") || combined.includes("base") || combined.includes("ester") || combined.includes("reagent") || combined.includes("goc") || combined.includes("isomer") || combined.includes("sn2") || combined.includes("sn1") || combined.includes("carbocation") || combined.includes("induction") || combined.includes("lassaigne")) return "General Organic Chemistry (GOC) & Nomenclature";
    if (combined.includes("benzene") || combined.includes("alkene") || combined.includes("alkyne") || combined.includes("alkane") || combined.includes("hydrocarbon")) return "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)";
    if (combined.includes("haloalkane") || combined.includes("alcohol") || combined.includes("phenol") || combined.includes("ether")) return "Haloalkanes, Alcohols & Ethers";
    if (combined.includes("aldehyde") || combined.includes("ketone") || combined.includes("carboxylic")) return "Aldehydes, Ketones & Carboxylic Acids";
    if (combined.includes("amine") || combined.includes("aniline") || combined.includes("diazonium") || combined.includes("nitrogen")) return "Amines & Organic Nitrogen Compounds";
    if (combined.includes("sugar") || combined.includes("fructose") || combined.includes("glucose") || combined.includes("vitamin") || combined.includes("polymer") || combined.includes("protein") || combined.includes("carbohydrate") || combined.includes("dna") || combined.includes("rna")) return "Biomolecules, Polymers & Everyday Chemistry";
    if (combined.includes("mole") || combined.includes("molar") || combined.includes("concentration") || combined.includes("stoichiometry")) return "Some Basic Concepts of Chemistry (Mole Concept)";
    if (combined.includes("bohr") || combined.includes("atom") || combined.includes("electron") || combined.includes("quantum") || combined.includes("orbital") || combined.includes("dalton")) return "Structure of Atom";
    if (combined.includes("periodic") || combined.includes("ionization") || combined.includes("electronegativity") || combined.includes("radius") || combined.includes("isoelectronic")) return "Periodic Table & Periodicity";
    if (combined.includes("bond order") || combined.includes("hybridization") || combined.includes("xeo3") || combined.includes("xef2") || combined.includes("molecular orbital")) return "Chemical Bonding & Molecular Structure";
    if (combined.includes("thermodynamic") || combined.includes("enthalpy") || combined.includes("gibbs") || combined.includes("spontaneous") || combined.includes("heat of formation")) return "Chemical Thermodynamics & Energetics";
    if (combined.includes("equilibrium") || combined.includes("kp") || combined.includes("kc") || combined.includes("le-chatelier") || combined.includes("ph") || combined.includes("buffer")) return "Chemical & Ionic Equilibrium";
    if (combined.includes("oxidation") || combined.includes("redox") || combined.includes("cell") || combined.includes("electrode") || combined.includes("conductance") || combined.includes("molar conductivity")) return "Electrochemistry & Redox Reactions";
    if (combined.includes("rate constant") || combined.includes("first order") || combined.includes("half-life") || combined.includes("kinetics")) return "Chemical Kinetics";
    if (combined.includes("solution") || combined.includes("vapour pressure") || combined.includes("boiling point") || combined.includes("raoult")) return "Solutions & Colligative Properties";
    if (combined.includes("complex") || combined.includes("ligand") || combined.includes("coordination") || combined.includes("chelate") || combined.includes("wilkinson") || combined.includes("ziegler")) return "Coordination Compounds";
    if (combined.includes("p-block") || combined.includes("nitrogen") || combined.includes("arsenic") || combined.includes("antimony") || combined.includes("phosphoric") || combined.includes("xenon")) return "p-Block Elements (Groups 13 to 18)";
    if (combined.includes("d-block") || combined.includes("f-block") || combined.includes("transition") || combined.includes("paramagnetic") || combined.includes("cr2+") || combined.includes("nd3+")) return "d and f-Block Elements";
    if (combined.includes("haber") || combined.includes("wacker") || combined.includes("metallurgy") || combined.includes("extraction")) return "General Principles of Extraction (Metallurgy)";
    return "Chemistry Core";
  }

  if (subject === "Biology") {
    if (combined.includes("cell") || combined.includes("mitosis") || combined.includes("meiosis") || combined.includes("spindle") || combined.includes("ribosome") || combined.includes("golgi") || combined.includes("chromatin") || combined.includes("centromere") || combined.includes("membrane")) return "Cell Structure, Biomolecules & Cell Division";
    if (combined.includes("enzyme") || combined.includes("apoenzyme") || combined.includes("rubisco") || combined.includes("catalase") || combined.includes("nucleoside") || combined.includes("nucleotide") || combined.includes("adenosine")) return "Cell Structure, Biomolecules & Cell Division";
    if (combined.includes("photosynthesis") || combined.includes("respiration") || combined.includes("npp") || combined.includes("gpp") || combined.includes("chlorophyll") || combined.includes("succinate") || combined.includes("electron transport")) return "Plant Physiology (Photosynthesis & Respiration)";
    if (combined.includes("auxin") || combined.includes("cytokinin") || combined.includes("gibberellin") || combined.includes("abscisic") || combined.includes("phytohormone") || combined.includes("senescence")) return "Plant Growth & Mineral Nutrition";
    if (combined.includes("heart") || combined.includes("kidney") || combined.includes("adrenal") || combined.includes("blood") || combined.includes("pregnancy") || combined.includes("frog") || combined.includes("nephron") || combined.includes("menstruation") || combined.includes("menarche") || combined.includes("sperm") || combined.includes("embryo sac") || combined.includes("insulin") || combined.includes("pituitary")) return "Human Physiology (Digestion & Respiration)";
    if (combined.includes("flower") || combined.includes("gymnosperm") || combined.includes("pteridophyte") || combined.includes("bryophyte") || combined.includes("gemmae") || combined.includes("seed") || combined.includes("endosperm") || combined.includes("monocot") || combined.includes("angiosperm") || combined.includes("prothallus")) return "Plant Kingdom & Animal Kingdom";
    if (combined.includes("gene") || combined.includes("dna") || combined.includes("rna") || combined.includes("chromosome") || combined.includes("mendelian") || combined.includes("inheritance") || combined.includes("pedigree") || combined.includes("monohybrid") || combined.includes("dihybrid") || combined.includes("transcription") || combined.includes("rnai") || combined.includes("splicing") || combined.includes("genetic code") || combined.includes("histone") || combined.includes("hershey")) return "Genetics & Principles of Inheritance";
    if (combined.includes("evolution") || combined.includes("homology") || combined.includes("analogy") || combined.includes("convergent") || combined.includes("whittaker") || combined.includes("coelom")) return "Molecular Basis of Inheritance & Evolution";
    if (combined.includes("plasmid") || combined.includes("ecori") || combined.includes("recombinant") || combined.includes("bioreactor") || combined.includes("pcr") || combined.includes("gel electrophoresis") || combined.includes("selectable marker") || combined.includes("cloning")) return "Biotechnology: Principles & Applications";
    if (combined.includes("ecosystem") || combined.includes("ecology") || combined.includes("ex-situ") || combined.includes("conservation") || combined.includes("epiphyte") || combined.includes("commensalism") || combined.includes("mutualism") || combined.includes("fig wasp") || combined.includes("biodiversity") || combined.includes("evil quartet") || combined.includes("population") || combined.includes("verhulst")) return "Ecology, Ecosystem & Biodiversity Conservation";
    if (combined.includes("disease") || combined.includes("cancer") || combined.includes("immunity") || combined.includes("lymphoid") || combined.includes("streptokinase") || combined.includes("microbe") || combined.includes("alcohol") || combined.includes("yeast") || combined.includes("ivf")) return "Human Health, Diseases & Microbes";
    return "Biology Core";
  }

  return `${subject} Core`;
}

async function run() {
  const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  // Normalize whitespace: replace multiple spaces/newlines with single space in question tags
  const normalizedText = fullText.replace(/\s+/g, " ");

  // Match Question X :
  const qMatches = [...normalizedText.matchAll(/Question\s+(\d+)\s*:/gi)];
//   console.log(`Found ${qMatches.length} questions in PDF!`);

  const parsedQuestions = [];

  for (let i = 0; i < qMatches.length; i++) {
    const qNum = parseInt(qMatches[i][1], 10);
    const startIdx = qMatches[i].index;
    const endIdx = i < qMatches.length - 1 ? qMatches[i + 1].index : normalizedText.length;
    const block = normalizedText.substring(startIdx, endIdx);

    // Subject assignment
    let subject = "Physics";
    if (qNum >= 46 && qNum <= 90) subject = "Chemistry";
    else if (qNum >= 91) subject = "Biology";

    // Extract Question Text
    let qTextMatch = block.match(/Question\s+\d+\s*:\s*([\s\S]*?)(?=Options:|$)/i);
    let qText = qTextMatch ? qTextMatch[1].trim() : "";

    // Extract Options
    let optAMatch = block.match(/\(a\)\s*([\s\S]*?)(?=\(b\)|Answer:|$)/i);
    let optBMatch = block.match(/\(b\)\s*([\s\S]*?)(?=\(c\)|Answer:|$)/i);
    let optCMatch = block.match(/\(c\)\s*([\s\S]*?)(?=\(d\)|Answer:|$)/i);
    let optDMatch = block.match(/\(d\)\s*([\s\S]*?)(?=Answer:|Solution:|$)/i);

    let optA = optAMatch ? optAMatch[1].trim() : "Option A";
    let optB = optBMatch ? optBMatch[1].trim() : "Option B";
    let optC = optCMatch ? optCMatch[1].trim() : "Option C";
    let optD = optDMatch ? optDMatch[1].trim() : "Option D";

    // Clean options from trailing Answer/Solution tags
    optA = optA.replace(/Answer:[\s\S]*/i, "").trim();
    optB = optB.replace(/Answer:[\s\S]*/i, "").trim();
    optC = optC.replace(/Answer:[\s\S]*/i, "").trim();
    optD = optD.replace(/Answer:[\s\S]*/i, "").trim();

    // Extract Answer
    let ansMatch = block.match(/Answer:\s*\(([a-d])\)/i);
    let correctOpt = ansMatch ? ansMatch[1].toLowerCase() : "a";

    // Extract Solution
    let solMatch = block.match(/Solution:\s*([\s\S]*?)(?=$)/i);
    let solution = solMatch ? solMatch[1].trim() : "";

    // Clean solution text
    solution = solution.replace(/Question\s+\d+:[\s\S]*/i, "").trim();

    const chapter = getChapter(subject, qText, solution);

    parsedQuestions.push({
      exam: "NEET",
      exam_type: "NEET UG",
      year: 2025,
      paper_code: "Narmada 48",
      attempt: "NEET 2025 Official",
      shift: "Shift 1",
      subject: subject,
      chapter: chapter,
      question_type: "MCQ",
      question: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_option: correctOpt,
      explanation: solution || "Detailed step-by-step solution available in NEET 2025 archives.",
      marks_positive: 4,
      marks_negative: -1,
    });
  }

//   console.log(`Parsed ${parsedQuestions.length} questions.`);
  if (parsedQuestions.length > 0) {
//     console.log("Sample Question 1 (Physics):", parsedQuestions[0].question.substring(0, 100));
  }
  if (parsedQuestions.length >= 46) {
//     console.log("Sample Question 46 (Chemistry):", parsedQuestions[45].question.substring(0, 100));
  }
  if (parsedQuestions.length >= 91) {
//     console.log("Sample Question 91 (Biology):", parsedQuestions[90].question.substring(0, 100));
  }

  if (parsedQuestions.length === 0) {
    console.error("No questions parsed!");
    return;
  }

  // Delete existing 2025 NEET PYQs to avoid duplicates
//   console.log("Deleting old 2025 NEET PYQs...");
  await supabase.from("pyq_questions").delete().eq("exam", "NEET").eq("year", 2025);

  // Insert in batches of 50
//   console.log(`Inserting ${parsedQuestions.length} questions into Supabase pyq_questions table...`);
  const batchSize = 50;
  for (let i = 0; i < parsedQuestions.length; i += batchSize) {
    const batch = parsedQuestions.slice(i, i + batchSize);
    const { error } = await supabase.from("pyq_questions").insert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} insert error:`, error);
    } else {
//       console.log(`Batch ${Math.floor(i / batchSize) + 1} (${batch.length} questions) inserted successfully!`);
    }
  }

//   console.log("🎉 NEET 2025 PYQ UPLOAD COMPLETE!");
}

run();
