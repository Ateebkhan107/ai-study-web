// mockData.js
// Shape mirrors what a Supabase query would return:
// SELECT questions.*, user_responses.selected_option, user_responses.time_taken
// FROM questions JOIN user_responses ON questions.id = user_responses.question_id
// WHERE user_responses.session_id = :sessionId

export const mockSessionMeta = {
  sessionId: "session_abc123",
  testName: "JEE Advanced Full Mock #4",
  date: "June 8, 2026",
  duration: "3h 00m",
  totalQuestions: 10,
  attempted: 9,
  score: 62,
  maxScore: 120,
};

export const mockQuestions = [
  {
    id: "q1",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Projectile Motion",
    difficulty: "Medium",
    question:
      "A ball is thrown horizontally from a height of 20 m with an initial speed of 10 m/s. How far from the base of the building does the ball land? (Take g = 10 m/s²)",
    options: [
      { id: "A", text: "10 m" },
      { id: "B", text: "20 m" },
      { id: "C", text: "25 m" },
      { id: "D", text: "40 m" },
    ],
    userAnswer: "B",
    correctAnswer: "B",
    explanation:
      "Time to fall: h = ½gt² → 20 = ½(10)t² → t = 2s. Horizontal distance = u × t = 10 × 2 = 20 m. The ball lands 20 m from the base.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 95,
  },
  {
    id: "q2",
    subject: "Physics",
    chapter: "Laws of Motion",
    topic: "Newton's Third Law",
    difficulty: "Hard",
    question:
      "A block of mass 5 kg is placed on a rough inclined plane of inclination 30°. If the coefficient of static friction is 0.4, what is the minimum force required to push the block up the incline? (g = 10 m/s²)",
    options: [
      { id: "A", text: "43.3 N" },
      { id: "B", text: "59.1 N" },
      { id: "C", text: "25.0 N" },
      { id: "D", text: "52.6 N" },
    ],
    userAnswer: "A",
    correctAnswer: "B",
    explanation:
      "Force = mg(sin θ + μcos θ) = 5×10×(sin30° + 0.4×cos30°) = 50×(0.5 + 0.4×0.866) = 50×(0.5 + 0.346) = 50×0.846 ≈ 59.1 N. Remember to add both the gravitational component and friction (which now opposes upward motion).",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 180,
  },
  {
    id: "q3",
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    topic: "VSEPR Theory",
    difficulty: "Easy",
    question:
      "According to VSEPR theory, which of the following molecules has a trigonal bipyramidal geometry?",
    options: [
      { id: "A", text: "SF₄" },
      { id: "B", text: "PCl₅" },
      { id: "C", text: "XeF₄" },
      { id: "D", text: "IF₅" },
    ],
    userAnswer: "B",
    correctAnswer: "B",
    explanation:
      "PCl₅ has 5 bonding pairs and 0 lone pairs around the central phosphorus atom, giving a perfect trigonal bipyramidal geometry. SF₄ is see-saw (1 lone pair), XeF₄ is square planar (2 lone pairs), and IF₅ is square pyramidal (1 lone pair).",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 60,
  },
  {
    id: "q4",
    subject: "Chemistry",
    chapter: "Electrochemistry",
    topic: "Nernst Equation",
    difficulty: "Hard",
    question:
      "For the cell reaction Zn(s) | Zn²⁺(0.1M) || Cu²⁺(0.01M) | Cu(s), the EMF at 25°C is (E°cell = 1.10 V, RT/F = 0.0257 V):",
    options: [
      { id: "A", text: "1.07 V" },
      { id: "B", text: "1.13 V" },
      { id: "C", text: "1.04 V" },
      { id: "D", text: "1.16 V" },
    ],
    userAnswer: "C",
    correctAnswer: "A",
    explanation:
      "Using Nernst: E = E° - (RT/nF)ln([Zn²⁺]/[Cu²⁺]) = 1.10 - (0.0257/2)ln(0.1/0.01) = 1.10 - 0.01285×ln(10) = 1.10 - 0.01285×2.303 = 1.10 - 0.0296 ≈ 1.07 V.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 210,
  },
  {
    id: "q5",
    subject: "Mathematics",
    chapter: "Calculus",
    topic: "Integration",
    difficulty: "Medium",
    question: "Evaluate: ∫₀^(π/2) sin²x dx",
    options: [
      { id: "A", text: "π/4" },
      { id: "B", text: "π/2" },
      { id: "C", text: "1/2" },
      { id: "D", text: "π/6" },
    ],
    userAnswer: "A",
    correctAnswer: "A",
    explanation:
      "Using the identity sin²x = (1 - cos2x)/2: ∫₀^(π/2) (1 - cos2x)/2 dx = [x/2 - sin2x/4]₀^(π/2) = π/4 - 0 = π/4.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 120,
  },
  {
    id: "q6",
    subject: "Mathematics",
    chapter: "Coordinate Geometry",
    topic: "Parabola",
    difficulty: "Medium",
    question:
      "The equation of the tangent to the parabola y² = 8x which is perpendicular to the line 2x + y + 1 = 0 is:",
    options: [
      { id: "A", text: "x - 2y + 8 = 0" },
      { id: "B", text: "x + 2y - 8 = 0" },
      { id: "C", text: "x - 2y - 8 = 0" },
      { id: "D", text: "2x - y + 1 = 0" },
    ],
    userAnswer: "D",
    correctAnswer: "A",
    explanation:
      "Slope of given line = -2, so slope of perpendicular = 1/2. For parabola y² = 4ax (a=2), tangent y = mx + a/m: y = (1/2)x + 2/(1/2) = (1/2)x + 4. Rearranging: x - 2y + 8 = 0.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 195,
  },
  {
    id: "q7",
    subject: "Physics",
    chapter: "Waves",
    topic: "Standing Waves",
    difficulty: "Medium",
    question:
      "A string of length L is fixed at both ends. The number of loops formed when the string vibrates in its 4th harmonic is:",
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "5" },
    ],
    userAnswer: "C",
    correctAnswer: "C",
    explanation:
      "For a string fixed at both ends, the nth harmonic has n loops (antinodes between nodes). The 4th harmonic (n=4) forms exactly 4 loops. The fundamental (1st harmonic) has 1 loop, 2nd has 2, and so on.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 75,
  },
  {
    id: "q8",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Reaction Mechanisms",
    difficulty: "Hard",
    question:
      "In the SN2 reaction of (R)-2-bromobutane with NaOH, the product formed is:",
    options: [
      { id: "A", text: "(R)-2-butanol with retention" },
      { id: "B", text: "(S)-2-butanol with inversion" },
      { id: "C", text: "Racemic mixture" },
      { id: "D", text: "(R)-2-butanol with inversion" },
    ],
    userAnswer: null,
    correctAnswer: "B",
    explanation:
      "SN2 reactions proceed with Walden inversion — the nucleophile (OH⁻) attacks from the back side of the leaving group (Br⁻). This inverts the stereocenter configuration, converting (R) to (S). SN2 always gives 100% inversion, never racemization.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 0,
  },
  {
    id: "q9",
    subject: "Mathematics",
    chapter: "Algebra",
    topic: "Complex Numbers",
    difficulty: "Easy",
    question: "If z = (1 + i)/(1 - i), then z⁴ is equal to:",
    options: [
      { id: "A", text: "-1" },
      { id: "B", text: "1" },
      { id: "C", text: "i" },
      { id: "D", text: "-i" },
    ],
    userAnswer: "B",
    correctAnswer: "B",
    explanation:
      "z = (1+i)/(1-i) × (1+i)/(1+i) = (1+i)²/2 = 2i/2 = i. Therefore z⁴ = i⁴ = (i²)² = (-1)² = 1.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 90,
  },
  {
    id: "q10",
    subject: "Physics",
    chapter: "Modern Physics",
    topic: "Photoelectric Effect",
    difficulty: "Medium",
    question:
      "Light of frequency 2×10¹⁵ Hz falls on a metal with work function 4 eV. What is the maximum kinetic energy of emitted electrons? (h = 6.6×10⁻³⁴ Js)",
    options: [
      { id: "A", text: "4.25 eV" },
      { id: "B", text: "8.25 eV" },
      { id: "C", text: "2.25 eV" },
      { id: "D", text: "6.50 eV" },
    ],
    userAnswer: "A",
    correctAnswer: "A",
    explanation:
      "KE_max = hf - φ = (6.6×10⁻³⁴ × 2×10¹⁵)/(1.6×10⁻¹⁹) - 4 = 13.2×10⁻¹⁹/1.6×10⁻¹⁹ - 4 = 8.25 - 4 = 4.25 eV.",
    marks: { correct: 4, wrong: -1 },
    timeTaken: 150,
  },
];

// Derived stats — in production, compute from Supabase aggregates
export const computeStats = (questions) => {
  const attempted = questions.filter((q) => q.userAnswer !== null);
  const correct = attempted.filter((q) => q.userAnswer === q.correctAnswer);
  const wrong = attempted.filter((q) => q.userAnswer !== q.correctAnswer);
  const unattempted = questions.filter((q) => q.userAnswer === null);

  const accuracy =
    attempted.length > 0
      ? Math.round((correct.length / attempted.length) * 100)
      : 0;

  // Identify weak topics: subjects with >50% wrong answers
  const subjectMap = {};
  questions.forEach((q) => {
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { total: 0, wrong: 0 };
    subjectMap[q.subject].total++;
    if (q.userAnswer !== null && q.userAnswer !== q.correctAnswer) {
      subjectMap[q.subject].wrong++;
    }
  });

  const weakTopics = Object.entries(subjectMap)
    .filter(([, v]) => v.total > 0 && v.wrong / v.total >= 0.4)
    .map(([subject, v]) => ({
      subject,
      wrongCount: v.wrong,
      total: v.total,
      percentage: Math.round((v.wrong / v.total) * 100),
    }));

  return { correct: correct.length, wrong: wrong.length, unattempted: unattempted.length, accuracy, weakTopics };
};