export const EXAM_CONFIG = {
  JEE: {
    badge: "🚀 JEE Main & Advanced",
    badgeStyles: "border-purple-500/30 bg-purple-500/10 text-purple-400 dark:border-purple-400/20 dark:bg-purple-500/5",
    themeGlow: "from-purple-500/10 via-transparent to-transparent",
    dashboardTitle: "Welcome Back, JEE Aspirant 🚀",
    subjects: [
      { id: "physics", label: "Physics", icon: "⚛️", color: "from-blue-500 to-indigo-600" },
      { id: "chemistry", label: "Chemistry", icon: "🧪", color: "from-teal-500 to-emerald-600" },
      { id: "maths", label: "Mathematics", icon: "∑", color: "from-purple-500 to-pink-600" }
    ],
    focusTopics: [
      { topic: "Rotational Dynamics", subject: "Physics", urgency: "High Yield" },
      { topic: "Coordination Compounds", subject: "Chemistry", urgency: "Revision Needed" },
      { topic: "Definite Integration", subject: "Mathematics", urgency: "Must Solve" }
    ],
    quickActions: [
      { label: "Start JEE Mock Test", action: "mock-test", secondary: "Full syllabus criteria" },
      { label: "Solve JEE Main PYQs", action: "pyq-main", secondary: "2019 - 2026 archives" },
      { label: "Solve JEE Advanced PYQs", action: "pyq-advanced", secondary: "High-order matrices" },
      { label: "Review Mistakes", action: "review", secondary: "AI error analysis logs" }
    ],
    formulas: [
      { subject: "Physics", title: "Kinematic Equations", formula: "v = u + at", sub: "v² = u² + 2as", tag: "Mechanics" },
      { subject: "Chemistry", title: "Ideal Gas Law", formula: "PV = nRT", sub: "P=press, V=vol", tag: "Gas State" },
      { subject: "Mathematics", title: "Quadratic Formula", formula: "x = (-b ± √D) / 2a", sub: "Where D = b² - 4ac", tag: "Algebra" }
    ],
    analyticsLabel: "Rank Improvement Tracking",
    
    // ── JEE SPECIFIC TEST SUITE CONFIG ──
    testSuite: {
      title: "JEE Test Arena 🎯",
      description: "Simulate real exam conditions with automated ranks, NTA-style integer type marking (+4/-1, +3/-1), and advanced percentile predictors.",
      categories: [
        { name: "JEE Main Full-Length Mock", count: "15 Available", duration: "180 mins", blueprint: "300 Marks Pattern" },
        { name: "JEE Advanced (Paper 1 & 2)", count: "8 Combos", duration: "360 mins", blueprint: "Variable Multi-Select Pattern" },
        { name: "PCM Sectional Sprint-Runs", count: "42 Segments", duration: "60 mins", blueprint: "High-Intensity Chapter Sprints" }
      ]
    },
    
    // ── JEE SPECIFIC PYQ ARCHIVE CONFIG ──
    pyqSuite: {
      title: "JEE Previous Year Archives 📚",
      description: "Practice shift-wise previous year question sets with step-by-step symbolic derivation workflows and alternative AI short-cut analysis logs.",
      papers: [
        { title: "JEE Main 2026 (Jan/April Shifts)", meta: "All 24 Shift Booklets", difficulty: "Official NTA Standard" },
        { title: "JEE Main 2025 Complete Archive", meta: "All 24 Shift Booklets", difficulty: "High-Algebra Concentration" },
        { title: "JEE Advanced 10-Year Master-Vault", meta: "Papers from 2016 - 2025", difficulty: "Extreme Conceptual Complexity" }
      ]
    }
  },
  NEET: {
    badge: "🧬 NEET Medical UG",
    badgeStyles: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:border-emerald-400/20 dark:bg-emerald-500/5",
    themeGlow: "from-emerald-500/10 via-transparent to-transparent",
    dashboardTitle: "Welcome Back, NEET Aspirant 🧬",
    subjects: [
      { id: "physics", label: "Physics", icon: "⚛️", color: "from-blue-500 to-indigo-600" },
      { id: "chemistry", label: "Chemistry", icon: "🧪", color: "from-teal-500 to-emerald-600" },
      { id: "biology", label: "Biology", icon: "🧬", color: "from-emerald-400 to-teal-600" }
    ],
    focusTopics: [
      { topic: "Semi-conductors", subject: "Physics", urgency: "High Yield" },
      { topic: "Chemical Bonding", subject: "Chemistry", urgency: "Formula Run" },
      { topic: "Photosynthesis in Plants", subject: "Biology", urgency: "NCERT Core" }
    ],
    quickActions: [
      { label: "Start NEET Mock Test", action: "mock-test", secondary: "720 Mark Simulation" },
      { label: "Solve NEET Core PYQs", action: "pyq-neet", secondary: "NCERT mapped modules" },
      { label: "Review Mistakes", action: "review", secondary: "AI error analysis logs" },
      { label: "NCERT Flash Revision", action: "ncert-flash", secondary: "High-retention memory cards" }
    ],
    formulas: [
      { subject: "Physics", title: "Photoelectric Effect", formula: "E = hnu = phi + Kmax", sub: "phi is work function", tag: "Modern Physics" },
      { subject: "Chemistry", title: "Arrhenius Equation", formula: "k = A e^(-Ea/RT)", sub: "Ea is activation energy", tag: "Kinetics" },
      { subject: "Biology", title: "Hardy-Weinberg Rule", formula: "p² + 2pq + q² = 1", sub: "Genotypic distribution frequencies", tag: "Genetics" }
    ],
    analyticsLabel: "Biology Performance Core",
    
    // ── NEET SPECIFIC TEST SUITE CONFIG ──
    testSuite: {
      title: "NEET Test Simulation Center 🩺",
      description: "Master the 720-mark structure with high-velocity tracking, multi-option botanical layouts, strict negative scoring, and OMR pacing logs.",
      categories: [
        { name: "NEET Full Syllabus Mock Exam", count: "25 Available", duration: "200 mins", blueprint: "720 Marks (200 Qs Layout)" },
        { name: "Biology High-Speed Quickfires", count: "60 Test Units", duration: "45 mins", blueprint: "90 Questions Pure Botany/Zoology" },
        { name: "PCB Sectional Diagnostics", count: "35 Segments", duration: "120 mins", blueprint: "Balanced 360-Mark Mini-Mocks" }
      ]
    },
    
    // ── NEET SPECIFIC PYQ ARCHIVE CONFIG ──
    pyqSuite: {
      title: "NEET Past Year Archives 🧬",
      description: "Access structured collections of medical entrance questions perfectly indexed sentence-by-sentence to the official foundational NCERT textbooks.",
      papers: [
        { title: "NEET UG 2026 Paper (With Re-test logs)", meta: "Code W, X, Y, Z Series", difficulty: "High NCERT Extraction" },
        { title: "NEET UG 2025 Paper Set", meta: "Complete Official Code-Booklet", difficulty: "Moderate Physics / High Botany" },
        { title: "AIPMT Classic Core (Pre-NEET Series)", meta: "Historical Sets 2010 - 2015", difficulty: "Conceptual Memory Focus" }
      ]
    }
  }
};