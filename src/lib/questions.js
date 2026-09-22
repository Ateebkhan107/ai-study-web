import { supabase } from "./supabase.js";
import { allocateQuestionCounts } from "./questionDistribution.js";
import { getChapterTargets } from "./pyqChapterMapping.js";

// Keep the public questions API compatible for test/institute routes that use
// the shared chapter alias expansion.
export { getChapterTargets };

// Chapter alias mapping to ensure frontend chapter selections match all DB variations
export const CHAPTER_ALIASES = {
  // Physics
  "Physical World & Units of Measurement": ["Units and Measurements", "Units and Dimensions", "Physical World and Measurement"],
  "Kinematics (Motion in a Straight Line & Plane)": ["Kinematics", "Motion in a Straight Line", "Motion in a Plane"],
  "Laws of Motion & Friction": ["Laws of Motion"],
  "Work, Energy & Power": ["Work Power and Energy", "Work Power Energy", "Work, Energy and Power", "Work, Power and Energy"],
  "System of Particles & Rotational Motion": ["Rotational Motion", "Rotation", "Rotational Dynamics", "System of Particles and Rotational Motion", "Centre of Mass", "Motion of System of Particles and Rigid Body"],
  "Gravitation": ["Gravitation", "Advanced Gravitational Potentials & Orbits"],
  "Mechanical Properties of Solids & Fluids": ["Properties of Matter", "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Properties of Bulk Matter"],
  "Thermal Properties of Matter & Thermodynamics": ["Thermodynamics", "Thermal Properties of Matter", "Properties of Matter & Thermodynamics", "Thermodynamics & Properties"],
  "Kinetic Theory of Gases & Oscillations (SHM)": ["Kinetic Theory of Gases", "Behavior of Perfect Gas and Kinetic Theory", "Oscillations"],
  "Waves & Sound": ["Waves", "Oscillations & Waves", "Oscillations and Waves"],
  "Electrostatics & Capacitance": ["Electrostatics", "Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Electrostatics & Current Electricity"],
  "Current Electricity": ["Current Electricity", "Electrostatics & Current Electricity"],
  "Magnetic Effects of Current & Magnetism": ["Magnetism", "Magnetic Effects of Current and Magnetism", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetism", "Electrodynamics & Magnetism"],
  "Electromagnetic Induction & Alternating Current": ["Electromagnetic Induction", "Alternating Current", "Electromagnetic Induction and Alternating Currents"],
  "Electromagnetic Waves": ["Electromagnetic Waves"],
  "Ray Optics & Optical Instruments": ["Ray Optics", "Optics", "Ray Optics and Optical Instruments", "Optics & Modern Physics"],
  "Wave Optics": ["Wave Optics", "Optics"],
  "Dual Nature of Radiation & Matter": ["Dual Nature of Radiation and Matter", "Dual Nature of Matter and Radiation"],
  "Atoms & Nuclei": ["Atoms", "Nuclei", "Atoms and Nuclei", "Modern Physics", "Optics & Modern Physics"],
  "Semiconductor Electronics & Devices": ["Semiconductor", "Electronic Devices", "Semiconductor Electronics"],
  "Communication Systems": ["Communication Systems"],

  // Chemistry
  "Some Basic Concepts of Chemistry (Mole Concept)": ["Some Basic Concepts of Chemistry", "Physical Chemistry"],
  "Structure of Atom": ["Structure of Atom", "Atomic Structure"],
  "Classification of Elements & Periodicity": ["Classification of Elements and Periodicity in Properties", "Periodic Table & Periodicity", "Inorganic Chemistry"],
  "Chemical Bonding & Molecular Structure": ["Chemical Bonding and Molecular Structure", "Chemical Bonding & Molecular Structure", "Chemical Bonding & Coordination"],
  "States of Matter: Gases & Liquids": ["States of Matter: Gases and Liquids", "Solid State"],
  "Chemical Thermodynamics & Energetics": ["Chemical Thermodynamics", "Thermodynamics"],
  "Chemical & Ionic Equilibrium": ["Equilibrium", "Equilibrium: Chemical and Ionic", "Chemical Equilibrium", "Ionic Equilibrium"],
  "Redox Reactions & Electrochemistry": ["Electrochemistry", "Redox Reactions", "Redox Reactions and Electrochemistry"],
  "Hydrogen": ["Hydrogen"],
  "s-Block Elements": ["The s-Block Elements", "s-Block Elements"],
  "Chemical Kinetics": ["Chemical Kinetics"],
  "Solutions & Colligative Properties": ["Solutions"],
  "Surface Chemistry": ["Surface Chemistry"],
  "Environmental Chemistry": ["Environmental Chemistry"],
  "Solid State": ["The Solid State", "Solid State"],
  "p-Block Elements (Groups 13 to 18)": ["The p-Block Elements (Class 11)", "The p-Block Elements (Class 12)", "The p-Block Elements", "p-Block Elements"],
  "d and f-Block Elements": ["d and f-Block Elements", "The d- and f-Block Elements", "The s-Block Elements"],
  "Coordination Compounds": ["Coordination Compounds"],
  "General Principles of Extraction (Metallurgy)": ["Metallurgy", "General Principles and Processes of Isolation of Elements"],
  "General Organic Chemistry (GOC) & Nomenclature": ["General Organic Chemistry (GOC)", "Organic Chemistry: Some Basic Principles and Techniques", "Organic Chemistry", "Organic Chemistry Basics"],
  "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)": ["Hydrocarbons"],
  "Haloalkanes & Haloarenes": ["Haloalkanes and Haloarenes"],
  "Alcohols, Phenols & Ethers": ["Alcohols, Phenols and Ethers"],
  "Aldehydes, Ketones & Carboxylic Acids": ["Aldehydes, Ketones and Carboxylic Acids"],
  "Amines & Organic Nitrogen Compounds": ["Amines"],
  "Biomolecules, Polymers & Everyday Chemistry": ["Biomolecules", "Biomolecules and Polymers", "Polymers", "Chemistry in Everyday Life"],
  "Biomolecules": ["Biomolecules"],
  "Polymers": ["Polymers"],
  "Chemistry in Everyday Life": ["Chemistry in Everyday Life"],

  // Maths
  "Sets, Relations & Functions": ["Sets, Relations and Functions", "Sets & Relations"],
  "Complex Numbers & Quadratic Equations": ["Complex Numbers and Quadratic Equations", "Complex Numbers", "Quadratic Equations", "Advanced Complex Number Loci & Geometry"],
  "Matrices & Determinants": ["Matrices and Determinants", "Advanced Matrices & Eigenvalue Relations"],
  "Permutations & Combinations": ["Permutations and Combinations"],
  "Binomial Theorem & Sequences (AP, GP)": ["Binomial Theorem and Its Applications", "Sequence and Series"],
  "Trigonometry & Inverse Trigonometric Functions": ["Trigonometry", "Inverse Trigonometric Equations and Properties"],
  "Straight Lines & Circles": ["Coordinate Geometry: Straight Lines", "Coordinate Geometry: Circles", "Coordinate Geometry"],
  "Conic Sections (Parabola, Ellipse, Hyperbola)": ["Coordinate Geometry: Conic Sections (Parabola, Ellipse, Hyperbola)"],
  "Limits, Continuity & Differentiability": ["Limit, Continuity and Differentiability", "Calculus", "Limits & Derivatives"],
  "Application of Derivatives (MOD & Maxima-Minima)": ["Advanced Maxima-Minima & Optimization", "Calculus"],
  "Indefinite & Definite Integrals": ["Integral Calculus", "Calculus", "Integrals"],
  "Area Under Curves & Differential Equations": ["Differential Equations", "Advanced Differential Equations & Orthogonal Trajectories"],
  "Vector Algebra & 3D Geometry": ["Vector Algebra", "Three Dimensional Geometry", "Vectors and 3D Geometry", "Lines, Planes and Spheres Intersections in 3D"],
  "Statistics & Probability": ["Statistics and Probability", "Mathematical Reasoning"],

  // Biology
  "The Living World & Biological Classification": ["The Living World", "Biological Classification"],
  "Plant Kingdom": ["Plant Kingdom"],
  "Animal Kingdom": ["Animal Kingdom"],
  "Morphology & Anatomy of Flowering Plants": ["Morphology of Flowering Plants", "Anatomy of Flowering Plants"],
  "Structural Organisation in Animals": ["Structural Organisation in Animals"],
  "Cell: Structure, Function & Cell Division": ["Cell: The Unit of Life", "Cell Cycle and Cell Division", "Cell Biology"],
  "Biomolecules": ["Biomolecules"],
  "Plant Physiology (Photosynthesis & Respiration)": ["Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Physiology"],
  "Plant Growth & Development": ["Plant Growth and Development"],
  "Human Physiology (Digestion, Respiration, Circulation)": ["Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Human Physiology"],
  "Excretion, Locomotion & Neural Control": ["Excretory Products and Elimination", "Locomotion and Movement", "Neural Control and Coordination"],
  "Chemical Coordination & Integration": ["Chemical Coordination and Integration"],
  "Sexual Reproduction in Flowering Plants": ["Sexual Reproduction in Flowering Plants"],
  "Human Reproduction & Reproductive Health": ["Human Reproduction", "Reproductive Health", "Reproduction in Organisms"],
  "Principles of Inheritance & Variation (Genetics)": ["Principles of Inheritance and Variation", "Genetics"],
  "Molecular Basis of Inheritance": ["Molecular Basis of Inheritance"],
  "Evolution": ["Evolution"],
  "Human Health, Diseases & Microbes": ["Human Health and Diseases", "Microbes in Human Welfare", "Strategies for Enhancement in Food Production"],
  "Biotechnology: Principles & Applications": ["Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Biotechnology"],
  "Ecology, Ecosystem & Biodiversity Conservation": ["Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues", "Ecology"],
};

// convert frontend names → database names
function fixSubject(subject) {
  if (subject === "Maths") {
    return "Mathematics";
  }
  if (subject === "Biology") {
    return "Biology";
  }
  return subject;
}

// difficulty converter
function fixDifficulty(difficulty) {
  if (!difficulty) return "";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}

const QUESTION_SELECT_FIELDS = `
  id,
  exam,
  subject,
  chapter,
  difficulty,
  topic,
  question_type,
  question_text,
  question_image,
  option_a,
  option_b,
  option_c,
  option_d,
  option_a_image,
  option_b_image,
  option_c_image,
  option_d_image,
  correct_option,
  marks,
  negative_marks
`;

function shuffleUniqueQuestions(questions) {
  const unique = new Map();
  for (const question of questions || []) {
    if (question?.id && !unique.has(question.id)) {
      unique.set(question.id, question);
    }
  }
  return [...unique.values()].sort(() => Math.random() - 0.5);
}

function pickBalancedByDifficulty(questions, limit) {
  const buckets = {
    Easy: [],
    Medium: [],
    Hard: [],
    Other: [],
  };

  shuffleUniqueQuestions(questions).forEach((question) => {
    const key = buckets[question.difficulty] ? question.difficulty : "Other";
    buckets[key].push(question);
  });

  const result = [];
  const seen = new Set();
  const order = ["Easy", "Medium", "Hard", "Other"];

  while (result.length < limit) {
    let added = false;
    for (const key of order) {
      const question = buckets[key].shift();
      if (!question || seen.has(question.id)) continue;
      result.push(question);
      seen.add(question.id);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }

  return result;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function distributeEvenlyByChapter(questions, targetLimit, isJee = false, difficulty = "mixed") {
  if (!questions || questions.length === 0) return [];
  if (questions.length <= targetLimit) return shuffleArray(questions);

  // Group by chapter
  const byChapter = new Map();
  for (const q of questions) {
    const ch = q.chapter || "General";
    if (!byChapter.has(ch)) byChapter.set(ch, []);
    byChapter.get(ch).push(q);
  }

  // Determine Numerical vs MCQ targets for JEE
  let numTarget = 0;
  if (isJee) {
    if (targetLimit >= 30) numTarget = 10;
    else if (targetLimit >= 25) numTarget = 5;
    else numTarget = Math.max(1, Math.round(targetLimit * 0.2));
  }
  const mcqTarget = targetLimit - numTarget;

  function sampleEvenly(poolByChapter, limit, filterFn = () => true) {
    if (limit <= 0) return [];
    const chapters = shuffleArray(Array.from(poolByChapter.keys()));
    const chapterQueues = new Map();
    for (const ch of chapters) {
      let qs = (poolByChapter.get(ch) || []).filter(filterFn);
      if (difficulty && difficulty.toLowerCase() === "mixed") {
        qs = pickBalancedByDifficulty(qs, qs.length);
      } else {
        qs = shuffleArray(qs);
      }
      if (qs.length > 0) chapterQueues.set(ch, qs);
    }

    const selected = [];
    const activeChapters = Array.from(chapterQueues.keys());
    let round = 0;

    while (selected.length < limit && activeChapters.length > 0) {
      const ch = activeChapters[round % activeChapters.length];
      const qList = chapterQueues.get(ch);
      if (qList && qList.length > 0) {
        selected.push(qList.shift());
        round++;
      } else {
        const idx = activeChapters.indexOf(ch);
        if (idx !== -1) activeChapters.splice(idx, 1);
      }
    }
    return selected;
  }

  if (isJee && numTarget > 0) {
    const mcqs = sampleEvenly(
      byChapter,
      mcqTarget,
      (q) => String(q.question_type || "MCQ").toLowerCase() !== "numerical"
    );
    const seenIds = new Set(mcqs.map((q) => q.id));

    const remainingByChapter = new Map();
    for (const [ch, qs] of byChapter.entries()) {
      remainingByChapter.set(
        ch,
        qs.filter((q) => !seenIds.has(q.id))
      );
    }

    const nums = sampleEvenly(
      remainingByChapter,
      numTarget,
      (q) => String(q.question_type || "MCQ").toLowerCase() === "numerical"
    );
    nums.forEach((q) => seenIds.add(q.id));

    // If numericals were fewer than numTarget, backfill from mcqs
    if (mcqs.length + nums.length < targetLimit) {
      const needed = targetLimit - (mcqs.length + nums.length);
      const backfill = sampleEvenly(
        remainingByChapter,
        needed,
        (q) => !seenIds.has(q.id)
      );
      return [...mcqs, ...nums, ...backfill];
    }
    return [...mcqs, ...nums];
  }

  return sampleEvenly(byChapter, targetLimit);
}

export async function getQuestions({
  exam,
  subject,
  chapter,
  difficulty,
  limit = 20,
  client = supabase,
  sourceType,
  status,
  activeOnly = false,
  strictFilters = false,
}) {
  try {
    let subjects = [];

    const isAllSubjects =
      !subject ||
      subject.trim().toLowerCase() === "all" ||
      subject.trim().toLowerCase() === "mixed subjects";

    if (!isAllSubjects) {
      subjects = subject.split(",").map((s) => fixSubject(s.trim()));
    } else {
      if (exam === "NEET") {
        subjects = ["Physics", "Chemistry", "Biology"];
      } else {
        subjects = ["Physics", "Chemistry", "Mathematics"];
      }
    }

    const distribution = allocateQuestionCounts(exam, limit, subjects);
    const isJee = exam === "JEE Main" || exam === "JEE";

    const finalQuestions = await Promise.all(
      subjects.map(async (sub) => {
        let subjectLimit = limit;
        if (subjects.length > 1) {
          subjectLimit = distribution[sub] || 0;
        }

        if (subjectLimit <= 0) return [];

        const buildQuery = () => {
          let query = client.from("questions").select(QUESTION_SELECT_FIELDS);
          query = isJee
            ? query.in("exam", ["JEE Main", "JEE"])
            : query.eq("exam", exam);

          if (sourceType) {
            query = query.eq("source_type", sourceType);
          }

          if (status) {
            query = query.eq("status", status);
          }

          if (activeOnly) {
            query = query.eq("is_active", true);
          }

          if (sub === "Botany" || sub === "Zoology") {
            query = query.eq("subject", "Biology");
          } else {
            query = query.eq("subject", sub);
          }

          const isAllChapters =
            !chapter ||
            chapter.trim().toLowerCase() === "all" ||
            chapter.trim().toLowerCase() === "all chapters";

          if (!isAllChapters) {
            const targetChapters = getChapterTargets(chapter);
            query = query.in("chapter", targetChapters);
          }

          if (difficulty && difficulty.toLowerCase() !== "mixed") {
            query = query.eq("difficulty", fixDifficulty(difficulty));
          }

          return { query, isAllChapters };
        };

        const { query: baseQuery, isAllChapters } = buildQuery();

        let data = [];

        if (isAllChapters) {
          // Fetch across multiple chunks in parallel to ensure all 30+ chapters are covered
          const pageRanges = [
            [0, 999],
            [1000, 1999],
            [2000, 2999],
            [3000, 3999],
            [4000, 4999],
          ];

          const results = await Promise.all(
            pageRanges.map(([start, end]) => {
              const { query } = buildQuery();
              return query.range(start, end);
            })
          );

          for (const res of results) {
            if (res.data && res.data.length > 0) {
              data.push(...res.data);
            }
          }
        } else {
          const res = await baseQuery.range(0, 999);
          if (res.data && res.data.length > 0) {
            data = res.data;
          }
        }

        if (data && data.length > 0) {
          return distributeEvenlyByChapter(data, subjectLimit, isJee, difficulty);
        }

        if (strictFilters) {
          return [];
        }

        // Fallback 1: Relax chapter filter if no questions found
        let fallbackQuery = client.from("questions").select(QUESTION_SELECT_FIELDS);
        fallbackQuery = isJee
          ? fallbackQuery.in("exam", ["JEE Main", "JEE"])
          : fallbackQuery.eq("exam", exam);
        fallbackQuery = fallbackQuery.eq(
          "subject",
          sub === "Botany" || sub === "Zoology" ? "Biology" : sub
        );

        if (activeOnly) {
          fallbackQuery = fallbackQuery.eq("is_active", true);
        }

        if (difficulty && difficulty.toLowerCase() !== "mixed") {
          fallbackQuery = fallbackQuery.eq("difficulty", fixDifficulty(difficulty));
        }

        const fallbackRes = await fallbackQuery.range(0, 999);
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          return distributeEvenlyByChapter(fallbackRes.data, subjectLimit, isJee, difficulty);
        }

        // Fallback 2: Relax difficulty too
        let anyQuery = client.from("questions").select(QUESTION_SELECT_FIELDS);
        anyQuery = isJee
          ? anyQuery.in("exam", ["JEE Main", "JEE"])
          : anyQuery.eq("exam", exam);
        anyQuery = anyQuery.eq(
          "subject",
          sub === "Botany" || sub === "Zoology" ? "Biology" : sub
        );
        if (activeOnly) {
          anyQuery = anyQuery.eq("is_active", true);
        }
        const anyRes = await anyQuery.range(0, 999);
        if (anyRes.data && anyRes.data.length > 0) {
          return distributeEvenlyByChapter(anyRes.data, subjectLimit, isJee, difficulty);
        }

        return [];
      })
    );

    return finalQuestions.flat().map((q) => ({
      id: q.id,
      exam: q.exam,
      subject: q.subject,
      chapter: q.chapter,
      difficulty: q.difficulty,
      topic: q.topic,
      question_type: q.question_type || "MCQ",
      text: q.question_text,
      question_image: q.question_image,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      option_images: [
        q.option_a_image,
        q.option_b_image,
        q.option_c_image,
        q.option_d_image,
      ],
      correct: ["A", "B", "C", "D"].indexOf(q.correct_option),
      correct_value: q.correct_option,
      marks: q.marks || 4,
      negative_marks: q.negative_marks || -1,
    }));
  } catch (err) {
    console.error("Question fetch error:", err);
    return [];
  }
}
