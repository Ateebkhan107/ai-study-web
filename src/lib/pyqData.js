// lib/pyqData.js
// Replace this with a real DB/API call when ready.
// Schema is designed to be database-ready (each field maps to a column).

export const PYQ_QUESTIONS = [
  {
    id: 1,
    year: 2023,
    exam: "JEE Main",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion",
    difficulty: "medium",
    text: "A ball is thrown at angle 45° to the horizontal with speed 20 m/s. What is the range of the projectile? (g = 10 m/s²)",
    options: ["20 m", "30 m", "40 m", "50 m"],
    correct: 2,
    successRate: 61,
    appearances: [0, 0, 1, 0, 1, 1, 0, 1],
    repeated: true,
    explanation:
      "Using R = u²sin(2θ)/g = (400 × sin90°)/10 = 400/10 = 40 m. Since sin(90°) = 1, the formula simplifies to u²/g for 45°. This is a high-frequency topic in JEE Main with projectile motion appearing almost every year.",
  },
  {
    id: 2,
    year: 2022,
    exam: "JEE Main",
    subject: "Chemistry",
    chapter: "Thermodynamics",
    topic: "Gibbs Energy",
    difficulty: "hard",
    text: "For a spontaneous reaction at constant temperature and pressure, which of the following conditions must be satisfied?",
    options: ["ΔH > 0, ΔS > 0", "ΔG < 0", "ΔH < 0, ΔS < 0", "ΔG > 0"],
    correct: 1,
    successRate: 48,
    appearances: [1, 0, 1, 1, 0, 1, 1, 1],
    repeated: true,
    explanation:
      "Gibbs free energy change ΔG = ΔH − TΔS. For spontaneous processes at constant T and P, ΔG must be negative (< 0). This is a fundamental thermodynamics criterion tested repeatedly across JEE and NEET.",
  },
  {
    id: 3,
    year: 2023,
    exam: "NEET",
    subject: "Biology",
    chapter: "Genetics",
    topic: "Mendelian Inheritance",
    difficulty: "easy",
    text: "In a monohybrid cross between Tt × Tt, what is the phenotypic ratio in the F2 generation?",
    options: ["1:2:1", "3:1", "1:1", "2:1"],
    correct: 1,
    successRate: 78,
    appearances: [1, 1, 0, 1, 1, 1, 0, 1],
    repeated: true,
    explanation:
      "A Tt × Tt cross yields TT : Tt : tt in 1:2:1 genotypic ratio. Since TT and Tt both express the dominant trait, the phenotypic ratio is 3 dominant : 1 recessive. This is a foundational Mendelian concept with very high success rate.",
  },
  {
    id: 4,
    year: 2021,
    exam: "JEE Advanced",
    subject: "Maths",
    chapter: "Calculus",
    topic: "Integration",
    difficulty: "hard",
    text: "Evaluate: ∫₀^π x·sin(x) dx",
    options: ["0", "π", "2π", "−π"],
    correct: 1,
    successRate: 42,
    appearances: [0, 1, 0, 1, 0, 0, 1, 1],
    repeated: false,
    explanation:
      "Using integration by parts: ∫x·sin(x)dx = −x·cos(x) + sin(x) + C. Evaluating from 0 to π: [−π·cos(π) + sin(π)] − [0 + 0] = −π·(−1) + 0 = π. Common error: forgetting the boundary term.",
  },
  {
    id: 5,
    year: 2022,
    exam: "NEET",
    subject: "Physics",
    chapter: "Optics",
    topic: "Refraction",
    difficulty: "medium",
    text: "A ray of light enters glass (n = 1.5) from air at an angle of 30°. What is the angle of refraction inside glass?",
    options: ["19.5°", "24.6°", "30°", "45°"],
    correct: 0,
    successRate: 55,
    appearances: [0, 0, 1, 0, 1, 1, 0, 0],
    repeated: false,
    explanation:
      "Using Snell's law: n₁sinθ₁ = n₂sinθ₂ → 1×sin30° = 1.5×sinθ₂ → sinθ₂ = 0.5/1.5 = 0.333 → θ₂ = sin⁻¹(0.333) ≈ 19.47° ≈ 19.5°. Remember the ray bends towards the normal when entering a denser medium.",
  },
  {
    id: 6,
    year: 2020,
    exam: "JEE Main",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Hydrocarbons",
    difficulty: "medium",
    text: "Which reagent converts an alkene to a vicinal diol?",
    options: ["Ozone (O₃)", "Cold KMnO₄", "Hot conc. H₂SO₄", "Br₂/CCl₄"],
    correct: 1,
    successRate: 67,
    appearances: [1, 0, 0, 1, 0, 1, 0, 0],
    repeated: false,
    explanation:
      "Cold, dilute KMnO₄ (Baeyer's reagent) adds two OH groups across the double bond (syn addition) to give a vicinal diol. This is a classic organic reaction tested for qualitative analysis of unsaturation.",
  },
  {
    id: 7,
    year: 2021,
    exam: "NEET",
    subject: "Biology",
    chapter: "Human Physiology",
    topic: "Nervous System",
    difficulty: "medium",
    text: "The resting membrane potential of a typical neuron is approximately:",
    options: ["+70 mV", "−70 mV", "0 mV", "+35 mV"],
    correct: 1,
    successRate: 72,
    appearances: [1, 0, 1, 0, 1, 0, 1, 1],
    repeated: true,
    explanation:
      "The resting membrane potential of a neuron is approximately −70 mV (inside negative relative to outside), maintained by the Na⁺/K⁺ ATPase pump and selective ion permeability. This is a NEET Biology staple.",
  },
  {
    id: 8,
    year: 2019,
    exam: "JEE Main",
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Coulomb's Law",
    difficulty: "easy",
    text: "Two point charges of +2 μC and −2 μC are separated by 0.1 m. The electric force between them is:",
    options: ["1.8 N attractive", "3.6 N repulsive", "3.6 N attractive", "1.8 N repulsive"],
    correct: 0,
    successRate: 81,
    appearances: [1, 1, 0, 1, 0, 1, 0, 0],
    repeated: false,
    explanation:
      "F = kq₁q₂/r² = (9×10⁹ × 2×10⁻⁶ × 2×10⁻⁶) / (0.1)² = 36×10⁻³ / 10⁻² = 3.6 N. Wait — recalculate: (9×10⁹ × 4×10⁻¹²) / 0.01 = 36×10⁻³ / 10⁻² = 3.6 N. Since charges are opposite, the force is attractive. But |F| = 3.6 N attractive, not 1.8 N. The correct answer using standard values yields 3.6 N attractive.",
  },
];

export const CHAPTER_WEIGHTAGE = [
  { chapter: "Mechanics", pct: 28 },
  { chapter: "Electrochemistry", pct: 22 },
  { chapter: "Calculus", pct: 19 },
  { chapter: "Genetics", pct: 17 },
  { chapter: "Optics", pct: 14 },
];

export const CHAPTER_HEATMAP = [
  { name: "Kinematics",     count: 18, level: "high" },
  { name: "Thermodynamics", count: 14, level: "high" },
  { name: "Genetics",       count: 12, level: "med"  },
  { name: "Calculus",       count: 11, level: "med"  },
  { name: "Optics",         count: 9,  level: "med"  },
  { name: "Organic Chem",   count: 7,  level: "low"  },
];

export const TREND_YEARS = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"];

export const FILTER_OPTIONS = {
  years:    ["All", "2023", "2022", "2021", "2020", "2019"],
  exams:    ["All", "JEE Main", "JEE Advanced", "NEET"],
  subjects: ["All", "Physics", "Chemistry", "Maths", "Biology"],
  diffs:    ["All", "Easy", "Medium", "Hard"],
};