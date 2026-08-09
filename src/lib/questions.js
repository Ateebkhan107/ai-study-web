import { supabase } from "@/lib/supabase";

// Chapter alias mapping to ensure frontend chapter selections match all DB variations
const CHAPTER_ALIASES = {
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

// ratio
function getDistribution(exam, total) {
  if (exam === "NEET") {
    const phy = Math.floor(total * 0.25);
    const chem = Math.floor(total * 0.25);
    const bio = total - phy - chem;
    return { Physics: phy, Chemistry: chem, Biology: bio };
  }
  const each = Math.floor(total / 3);
  return { Physics: each, Chemistry: each, Mathematics: total - each * 2 };
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

export async function getQuestions({
  exam,
  subject,
  chapter,
  difficulty,
  limit = 20,
  client = supabase,
}) {
  try {
//     console.log("FETCH PARAMS:", { exam, subject, chapter, difficulty, limit });
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

    const finalQuestions = await Promise.all(subjects.map(async (sub) => {
      let subjectLimit = limit;
      if (subjects.length > 1) {
        subjectLimit = getDistribution(exam, limit)[sub] || Math.floor(limit / subjects.length);
      }

      let query = client.from("questions").select(QUESTION_SELECT_FIELDS);
      query = exam === "JEE Main"
        ? query.in("exam", ["JEE Main", "JEE"])
        : query.eq("exam", exam);

      // Subject filter
      if (sub === "Botany" || sub === "Zoology") {
        query = query.eq("subject", "Biology");
      } else {
        query = query.eq("subject", sub);
      }

      // Chapters
      const isAllChapters =
        !chapter ||
        chapter.trim().toLowerCase() === "all" ||
        chapter.trim().toLowerCase() === "all chapters";

      if (!isAllChapters) {
        const rawChapters = chapter.split(",").map((c) => c.trim());
        let targetChapters = [];
        rawChapters.forEach((c) => {
          targetChapters.push(c);
          if (CHAPTER_ALIASES[c]) {
            targetChapters.push(...CHAPTER_ALIASES[c]);
          }
        });
        targetChapters = Array.from(new Set(targetChapters));

        query = query.in("chapter", targetChapters);
      }

      // Difficulty
      if (difficulty && difficulty.toLowerCase() !== "mixed") {
        query = query.eq("difficulty", fixDifficulty(difficulty));
      }

      let { data, error } = await query;

      // Fallback 1: If no questions found with strict chapter filter, relax chapter filter and fetch from subject
      if (!data || data.length === 0) {
        let fallbackQuery = client.from("questions").select(QUESTION_SELECT_FIELDS);
        fallbackQuery = exam === "JEE Main"
          ? fallbackQuery.in("exam", ["JEE Main", "JEE"])
          : fallbackQuery.eq("exam", exam);
        fallbackQuery = fallbackQuery.eq("subject", sub === "Botany" || sub === "Zoology" ? "Biology" : sub);

        if (difficulty && difficulty.toLowerCase() !== "mixed") {
          fallbackQuery = fallbackQuery.eq("difficulty", fixDifficulty(difficulty));
        }

        const fallbackRes = await fallbackQuery;
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          data = fallbackRes.data;
        }
      }

      // Fallback 2: If still no questions found, ignore difficulty too
      if (!data || data.length === 0) {
        let anyQuery = client.from("questions").select(QUESTION_SELECT_FIELDS);
        anyQuery = exam === "JEE Main"
          ? anyQuery.in("exam", ["JEE Main", "JEE"])
          : anyQuery.eq("exam", exam);
        anyQuery = anyQuery.eq("subject", sub === "Botany" || sub === "Zoology" ? "Biology" : sub);
        const anyRes = await anyQuery;
        if (anyRes.data && anyRes.data.length > 0) {
          data = anyRes.data;
        }
      }

      if (error && (!data || data.length === 0)) {
//         console.log("SUPABASE ERROR:", error);
        return [];
      }

      return (data || []).slice(0, subjectLimit);
    }));

//     console.log("TOTAL QUESTIONS FOUND:", finalQuestions.length);

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
//     console.log("Question error:", err);
    return [];
  }
}
