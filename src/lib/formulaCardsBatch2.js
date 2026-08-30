export const BATCH_2_CHAPTER_DEFINITIONS = [
  { title: "Projectile Motion & Vector", slug: "projectile-motion-vector", sort_order: 3 },
  { title: "Relative Motion", slug: "relative-motion", sort_order: 4 },
  { title: "Newton's Laws of Motion", slug: "newtons-laws-of-motion", sort_order: 5 },
  { title: "Friction", slug: "friction", sort_order: 6 },
  { title: "Work, Power & Energy", slug: "work-power-energy", sort_order: 7 },
];

const chapter = (track, slug) => `${track}-physics-${slug}`;

const commonVariables = {
  u: { latex: "u", symbol: "$u$", meaning: "speed of projection" },
  theta: { latex: "\\theta", symbol: "$\\theta$", meaning: "angle of projection" },
  g: { latex: "g", symbol: "$g$", meaning: "acceleration due to gravity" },
  beta: { latex: "\\beta", symbol: "$\\beta$", meaning: "angle of incline" },
  alpha: { latex: "\\alpha", symbol: "$\\alpha$", meaning: "angle of projection with the inclined plane" },
};

function card(chapterId, slug, payload) {
  return {
    id: `${chapterId}-${slug}`,
    chapter_id: chapterId,
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    is_active: true,
    ...payload,
  };
}

function projectileCards(chapterId) {
  return [
    card(chapterId, "standard-results", {
      title: "Standard Projectile Results",
      card_type: "formula",
      body: "The handbook lists time of flight, horizontal range, and maximum height for projectile motion.",
      formulas: [
        { label: "Time of flight", latex: "T=\\frac{2u\\sin\\theta}{g}" },
        { label: "Horizontal range", latex: "R=\\frac{u^2\\sin 2\\theta}{g}" },
        { label: "Maximum height", latex: "H=\\frac{u^2\\sin^2\\theta}{2g}" },
      ],
      variables: [commonVariables.u, commonVariables.theta, commonVariables.g],
      conditions: [],
      importance: 5,
      source_page: 5,
      sort_order: 1,
    }),
    card(chapterId, "trajectory-equation", {
      title: "Trajectory Equation",
      card_type: "formula",
      body: "The equation of path relates vertical position to horizontal position for projectile motion.",
      formulas: [
        { latex: "y=x\\tan\\theta-\\frac{gx^2}{2u^2\\cos^2\\theta}" },
        { latex: "y=x\\tan\\theta\\left(1-\\frac{x}{R}\\right)" },
      ],
      variables: [
        commonVariables.u,
        commonVariables.theta,
        commonVariables.g,
        { latex: "R", symbol: "$R$", meaning: "horizontal range" },
      ],
      conditions: [],
      importance: 5,
      source_page: 5,
      sort_order: 2,
    }),
    card(chapterId, "inclined-plane-diagram", {
      title: "Projection on an Inclined Plane",
      card_type: "diagram",
      body: "The handbook resolves projectile motion on axes attached to the inclined plane.",
      formulas: [],
      variables: [commonVariables.alpha, commonVariables.beta],
      conditions: ["The native diagram follows the source orientation with x along the incline and y normal to it."],
      diagram_data: { type: "projectile-incline" },
      importance: 4,
      source_page: 5,
      sort_order: 3,
    }),
    card(chapterId, "inclined-plane-table", {
      title: "Inclined Plane Formula Table",
      card_type: "table",
      body: "The handbook compares projection up the incline and down the incline.",
      formulas: [],
      variables: [commonVariables.u, commonVariables.alpha, commonVariables.beta, commonVariables.g],
      conditions: [],
      table_data: {
        columns: ["Result", "Up the incline", "Down the incline"],
        rows: [
          ["Range", "$\\frac{2u^2\\sin\\alpha\\cos(\\alpha+\\beta)}{g\\cos^2\\beta}$", "$\\frac{2u^2\\sin\\alpha\\cos(\\alpha-\\beta)}{g\\cos^2\\beta}$"],
          ["Time of flight", "$\\frac{2u\\sin\\alpha}{g\\cos\\beta}$", "$\\frac{2u\\sin\\alpha}{g\\cos\\beta}$"],
          ["Angle for maximum range", "$\\frac{\\pi}{4}-\\frac{\\beta}{2}$", "$\\frac{\\pi}{4}+\\frac{\\beta}{2}$"],
          ["Maximum range", "$\\frac{u^2}{g(1+\\sin\\beta)}$", "$\\frac{u^2}{g(1-\\sin\\beta)}$"],
        ],
      },
      importance: 5,
      source_page: 5,
      sort_order: 4,
    }),
  ];
}

function relativeCards(chapterId) {
  return [
    card(chapterId, "relative-velocity-acceleration", {
      title: "Relative Velocity & Acceleration",
      card_type: "formula",
      body: "The handbook defines velocity and acceleration of A with respect to B by vector subtraction.",
      formulas: [
        { label: "Velocity of A with respect to B", latex: "\\vec v_{AB}=\\vec v_A-\\vec v_B" },
        { label: "Acceleration of A with respect to B", latex: "\\vec a_{AB}=\\vec a_A-\\vec a_B" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 5,
      sort_order: 1,
    }),
    card(chapterId, "relative-position-straight-line", {
      title: "Relative Position Along a Straight Line",
      card_type: "formula",
      body: "For relative motion along a straight line, the handbook writes the position of B with respect to A as a difference of positions.",
      formulas: [{ latex: "\\vec x_{BA}=\\vec x_B-\\vec x_A" }],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 5,
      sort_order: 2,
    }),
    card(chapterId, "river-shortest-time", {
      title: "River Crossing: Shortest Time",
      card_type: "mixed",
      body: "For shortest time, the velocity perpendicular to the river is the boat/man velocity relative to river.",
      formulas: [
        { latex: "v_x=v_R" },
        { latex: "v_f=v_{mR}" },
        { latex: "v_m=\\sqrt{v_{mR}^2+v_R^2}" },
      ],
      variables: [
        { latex: "v_R", symbol: "$v_R$", meaning: "river velocity" },
        { latex: "v_{mR}", symbol: "$v_{mR}$", meaning: "man/boat velocity relative to river" },
      ],
      conditions: [],
      diagram_data: { type: "river-shortest-time" },
      importance: 5,
      source_page: 6,
      sort_order: 3,
    }),
    card(chapterId, "river-shortest-path", {
      title: "River Crossing: Shortest Path",
      card_type: "mixed",
      body: "For shortest path, velocity along the river is zero, so the drift is zero.",
      formulas: [
        { latex: "v_x=0" },
        { latex: "v_y=\\sqrt{v_{mR}^2-v_R^2}" },
        { latex: "v_m=\\sqrt{v_{mR}^2-v_R^2}" },
        { latex: "t=\\frac{d}{v_y}=\\frac{d}{\\sqrt{v_{mR}^2-v_R^2}}" },
        { latex: "v_R-v_{mR}\\sin\\theta=0" },
        { latex: "\\theta=\\sin^{-1}\\left(\\frac{v_R}{v_{mR}}\\right)" },
      ],
      variables: [
        { latex: "d", symbol: "$d$", meaning: "river width" },
        { latex: "\\theta", symbol: "$\\theta$", meaning: "angle used in the source diagram" },
      ],
      conditions: ["The source states that in this case the drift should be zero."],
      diagram_data: { type: "river-shortest-path" },
      importance: 5,
      source_page: 6,
      sort_order: 4,
    }),
    card(chapterId, "rain-problems", {
      title: "Rain Problems",
      card_type: "formula",
      body: "The rain velocity relative to the man is written as the vector difference of rain and man velocities.",
      formulas: [
        { latex: "\\vec v_{Rm}=\\vec v_R-\\vec v_m" },
        { latex: "v_{Rm}=\\sqrt{v_R^2+v_m^2}" },
      ],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 7,
      sort_order: 5,
    }),
  ];
}

function newtonCards(chapterId) {
  return [
    card(chapterId, "third-law", {
      title: "Third Law Pair",
      card_type: "formula",
      body: "The handbook writes the force on A due to B as equal and opposite to the force on B due to A.",
      formulas: [{ latex: "\\vec F_{AB}=-\\vec F_{BA}" }],
      variables: [
        { latex: "\\vec F_{AB}", symbol: "$\\vec F_{AB}$", meaning: "force on A due to B" },
        { latex: "\\vec F_{BA}", symbol: "$\\vec F_{BA}$", meaning: "force on B due to A" },
      ],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 1,
    }),
    card(chapterId, "second-law-components", {
      title: "Second Law in Components",
      card_type: "formula",
      body: "The second law is written component-wise as rate of change of momentum.",
      formulas: [
        { latex: "F_x=\\frac{dP_x}{dt}=ma_x" },
        { latex: "F_y=\\frac{dP_y}{dt}=ma_y" },
        { latex: "F_z=\\frac{dP_z}{dt}=ma_z" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 2,
    }),
    card(chapterId, "weighing-machine-spring-balance", {
      title: "Weighing Machine & Spring Balance",
      card_type: "concept",
      body: "The source states that a weighing machine and spring balance measure force exerted on their contact or hook, not weight directly.",
      formulas: [],
      variables: [],
      conditions: [
        "A weighing machine measures the force exerted by the object on its upper surface.",
        "A spring balance measures the force exerted by the object at the hook.",
      ],
      importance: 3,
      source_page: 7,
      sort_order: 3,
    }),
    card(chapterId, "spring-force-properties", {
      title: "Spring Force & Spring Constant",
      card_type: "formula",
      body: "The spring force and spring constant relations are listed together in the source.",
      formulas: [
        { label: "Spring force", latex: "\\vec F=-k\\vec x" },
        { label: "Spring property", latex: "K\\ell=\\text{constant}" },
        { latex: "\\ell_1=\\frac{m\\ell}{m+n}" },
        { latex: "\\ell_2=\\frac{n\\ell}{m+n}" },
        { latex: "k\\ell=k_1\\ell_1=k_2\\ell_2" },
      ],
      variables: [
        { latex: "\\vec x", symbol: "$\\vec x$", meaning: "displacement of the free end from natural length or deformation" },
        { latex: "k", symbol: "$k$", meaning: "spring constant" },
      ],
      conditions: ["The cut-spring relation is for a spring cut in the ratio m : n."],
      importance: 4,
      source_page: 7,
      sort_order: 4,
    }),
    card(chapterId, "spring-combinations", {
      title: "Spring Combinations",
      card_type: "formula",
      body: "The source gives equivalent spring constant formulas for series and parallel combinations.",
      formulas: [
        { label: "Series", latex: "\\frac{1}{k_{eq}}=\\frac{1}{k_1}+\\frac{1}{k_2}+\\cdots" },
        { label: "Parallel", latex: "k_{eq}=k_1+k_2+k_3+\\cdots" },
      ],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 8,
      sort_order: 5,
    }),
    card(chapterId, "pulley-relation", {
      title: "Pulley Relation",
      card_type: "diagram",
      body: "The pulley relation shown in the source averages the two string-end velocities and accelerations.",
      formulas: [
        { latex: "V_p=\\frac{V_1+V_2}{2}" },
        { latex: "a_p=\\frac{a_1+a_2}{2}" },
      ],
      variables: [],
      conditions: [],
      diagram_data: { type: "pulley-system" },
      importance: 4,
      source_page: 8,
      sort_order: 6,
    }),
    card(chapterId, "atwood-machine", {
      title: "Atwood Machine",
      card_type: "diagram",
      body: "The handbook gives acceleration and tension for the two-mass pulley system.",
      formulas: [
        { latex: "a=\\frac{(m_2-m_1)g}{m_1+m_2}" },
        { latex: "T=\\frac{2m_1m_2g}{m_1+m_2}" },
      ],
      variables: [],
      conditions: [],
      diagram_data: { type: "atwood-machine" },
      importance: 5,
      source_page: 8,
      sort_order: 7,
    }),
    card(chapterId, "wedge-constraint", {
      title: "Wedge Constraint",
      card_type: "diagram",
      body: "For bodies in contact without deformation, the source states that the velocity components perpendicular to the contact plane are equal.",
      formulas: [{ latex: "V_3=V_1\\sin\\theta" }],
      variables: [],
      conditions: ["Applies when there is no deformation and the bodies remain in contact."],
      diagram_data: { type: "wedge-constraint" },
      importance: 5,
      source_page: 8,
      sort_order: 8,
    }),
    card(chapterId, "system-and-non-inertial-frame", {
      title: "System & Non-Inertial Frame",
      card_type: "mixed",
      body: "The source lists Newton's law for a system and the pseudo-force form for a non-inertial frame.",
      formulas: [
        { label: "System", latex: "\\vec F_{ext}=m_1\\vec a_1+m_2\\vec a_2+m_3\\vec a_3+\\cdots" },
        { label: "Non-inertial frame", latex: "\\vec F_{Real}+\\vec F_{Pseudo}=m\\vec a" },
        { label: "Pseudo force", latex: "\\vec F_{Pseudo}=-m\\vec a_{Frame}" },
      ],
      variables: [],
      conditions: [
        "An inertial reference frame moves with constant velocity.",
        "A non-inertial reference frame moves with non-zero acceleration.",
      ],
      importance: 5,
      source_page: 9,
      sort_order: 9,
    }),
  ];
}

function frictionCards(chapterId) {
  return [
    card(chapterId, "friction-types", {
      title: "Types of Friction",
      card_type: "table",
      body: "The handbook divides friction force into kinetic and static friction.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Type", "Source statement"],
        rows: [
          ["Kinetic", "$f_k=\\mu_kN$"],
          ["Static", "Exists when there is tendency of relative motion but no relative motion."],
        ],
      },
      importance: 4,
      source_page: 9,
      sort_order: 1,
    }),
    card(chapterId, "kinetic-static-formulas", {
      title: "Kinetic & Static Friction Formulas",
      card_type: "formula",
      body: "Kinetic friction has a fixed proportional form; static friction is variable and self-adjusting up to limiting friction.",
      formulas: [
        { label: "Kinetic friction", latex: "f_k=\\mu_kN" },
        { label: "Limiting friction", latex: "f_{max}=\\mu_sN" },
        { label: "Static friction range", latex: "0\\le f_s\\le f_{smax}" },
      ],
      variables: [
        { latex: "\\mu_k", symbol: "$\\mu_k$", meaning: "coefficient of kinetic friction" },
        { latex: "\\mu_s", symbol: "$\\mu_s$", meaning: "coefficient of static friction" },
        { latex: "N", symbol: "$N$", meaning: "normal reaction" },
      ],
      conditions: ["The source states static friction is variable and self-adjusting."],
      importance: 5,
      source_page: 9,
      sort_order: 2,
    }),
    card(chapterId, "friction-applied-force-graph", {
      title: "Friction vs Applied Force",
      card_type: "diagram",
      body: "The source graph shows static friction increasing up to maximum static friction, then kinetic friction at a lower constant level.",
      formulas: [
        { latex: "f_{static\\ maximum}=\\mu_sN" },
        { latex: "f_k=\\mu_kN" },
      ],
      variables: [],
      conditions: [],
      diagram_data: { type: "friction-graph" },
      importance: 5,
      source_page: 9,
      sort_order: 3,
    }),
  ];
}

function workPowerEnergyCards(chapterId) {
  return [
    card(chapterId, "constant-and-multiple-forces", {
      title: "Work by Constant & Multiple Forces",
      card_type: "formula",
      body: "The source defines work by a constant force and extends it to multiple forces through the resultant force.",
      formulas: [
        { label: "Constant force", latex: "W=\\vec F\\cdot\\vec S" },
        { label: "Resultant force", latex: "\\sum \\vec F=\\vec F_1+\\vec F_2+\\vec F_3+\\cdots" },
        { latex: "W=(\\sum \\vec F)\\cdot\\vec S" },
        { latex: "W=W_1+W_2+W_3+\\cdots" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 10,
      sort_order: 1,
    }),
    card(chapterId, "variable-force", {
      title: "Work by a Variable Force",
      card_type: "formula",
      body: "For a variable force, the handbook gives the differential work expression.",
      formulas: [{ latex: "dW=\\vec F\\cdot d\\vec s" }],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 10,
      sort_order: 2,
    }),
    card(chapterId, "momentum-kinetic-energy", {
      title: "Momentum & Kinetic Energy",
      card_type: "formula",
      body: "The source relates kinetic energy and linear momentum.",
      formulas: [
        { latex: "K=\\frac{p^2}{2m}" },
        { latex: "P=\\sqrt{2mK}" },
      ],
      variables: [{ latex: "P", symbol: "$P$", meaning: "linear momentum" }],
      conditions: [],
      importance: 5,
      source_page: 10,
      sort_order: 3,
    }),
    card(chapterId, "potential-energy-conservative-force", {
      title: "Potential Energy & Conservative Force",
      card_type: "formula",
      body: "The potential energy relation is written as the negative of work done by the force.",
      formulas: [
        { latex: "U_2-U_1=-\\int_{r_1}^{r_2}\\vec F\\cdot d\\vec r=-W" },
        { latex: "U=-\\int_{\\infty}^{r}\\vec F\\cdot d\\vec r=-W" },
        { label: "Conservative force", latex: "F=-\\frac{\\partial U}{\\partial r}" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 10,
      sort_order: 4,
    }),
    card(chapterId, "work-energy-theorem-power", {
      title: "Work-Energy Theorem & Power",
      card_type: "mixed",
      body: "The source gives the work-energy theorem, its modified form, and average/instantaneous power.",
      formulas: [
        { label: "Work-energy theorem", latex: "W_C+W_{NC}+W_{PS}=\\Delta K" },
        { latex: "W_C=-\\Delta U" },
        { latex: "W_{NC}+W_{PS}=\\Delta K+\\Delta U" },
        { latex: "W_{NC}+W_{PS}=\\Delta E" },
        { label: "Average power", latex: "P_{av}=\\frac{W}{t}" },
        { label: "Instantaneous power", latex: "P=\\frac{\\vec F\\cdot d\\vec S}{dt}=\\vec F\\cdot\\frac{d\\vec S}{dt}=\\vec F\\cdot\\vec v" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 10,
      sort_order: 5,
    }),
  ];
}

const CARD_BUILDERS = {
  "projectile-motion-vector": projectileCards,
  "relative-motion": relativeCards,
  "newtons-laws-of-motion": newtonCards,
  friction: frictionCards,
  "work-power-energy": workPowerEnergyCards,
};

export function getBatch2Chapters(track) {
  return BATCH_2_CHAPTER_DEFINITIONS.map((item) => ({
    id: chapter(track, item.slug),
    subject_id: `${track}-physics`,
    title: item.title,
    slug: item.slug,
    sort_order: item.sort_order,
  }));
}

export function getBatch2Cards(track) {
  return BATCH_2_CHAPTER_DEFINITIONS.flatMap((item) => CARD_BUILDERS[item.slug](chapter(track, item.slug)));
}
