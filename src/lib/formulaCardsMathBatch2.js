export const MATH_BATCH_2_CHAPTER_DEFINITIONS = [
  { title: "Limit of Function", slug: "limit-of-function", sort_order: 6 },
  { title: "Method of Differentiation", slug: "method-of-differentiation", sort_order: 7 },
  { title: "Application of Derivatives", slug: "application-of-derivatives", sort_order: 8 },
];

const chapter = (slug) => `jee-mathematics-${slug}`;

const vars = {
  x: { latex: "x", symbol: "$x$", meaning: "variable" },
  m: { latex: "m", symbol: "$m$", meaning: "slope" },
  theta: { latex: "\\theta", symbol: "$\\theta$", meaning: "angle or parameter" },
  f: { latex: "f", symbol: "$f$", meaning: "function" },
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

function limitCards(chapterId) {
  return [
    card(chapterId, "existence-indeterminate-forms", {
      title: "Existence of Limit and Indeterminate Forms",
      card_type: "mixed",
      body: "The handbook defines limit existence using left-hand and right-hand limits, then lists common indeterminate forms.",
      formulas: [
        { latex: "\\lim_{h\\to0^+}f(a-h)=\\lim_{h\\to0^+}f(a+h)=M" },
        { latex: "\\frac{0}{0},\\ \\frac{\\infty}{\\infty},\\ 0\\times\\infty,\\ \\infty-\\infty,\\ \\infty^0,\\ 0^0,\\ 1^\\infty" },
      ],
      variables: [vars.f],
      conditions: ["The common value must be some finite value $M$."],
      importance: 5,
      source_page: 8,
      sort_order: 1,
    }),
    card(chapterId, "standard-limits", {
      title: "Standard Limits",
      card_type: "table",
      body: "The source groups the core standard limits into one list.",
      formulas: [],
      variables: [vars.x],
      conditions: ["These formulas were visually checked against page 8 because parsed text merged multiple limit expressions."],
      table_data: {
        columns: ["Limit", "Value"],
        rows: [
          ["$\\lim_{x\\to0}\\frac{\\sin x}{x}$", "$1$"],
          ["$\\lim_{x\\to0}\\frac{\\tan x}{x}$", "$1$"],
          ["$\\lim_{x\\to0}\\frac{\\tan^{-1}x}{x}$", "$1$"],
          ["$\\lim_{x\\to0}\\frac{\\sin^{-1}x}{x}$", "$1$"],
          ["$\\lim_{x\\to0}\\frac{e^x-1}{x}$", "$1$"],
          ["$\\lim_{x\\to0}\\frac{\\ln(1+x)}{x}$", "$1$"],
          ["$\\lim_{x\\to0}(1+x)^{1/x}=\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^x$", "$e$"],
          ["$\\lim_{x\\to0}\\frac{a^x-1}{x}$", "$\\log_e a$, $a>0$"],
          ["$\\lim_{x\\to a}\\frac{x^n-a^n}{x-a}$", "$na^{n-1}$"],
        ],
      },
      importance: 5,
      source_page: 8,
      sort_order: 2,
    }),
    card(chapterId, "exponential-log-expansions", {
      title: "Exponential and Log Expansions",
      card_type: "table",
      body: "The expansion method section starts with $a^x$, $e^x$, and $\\ln(1+x)$.",
      formulas: [],
      variables: [vars.x],
      conditions: ["The $\\ln(1+x)$ expansion is listed for $-1<x\\le1$."],
      table_data: {
        columns: ["Function", "Expansion"],
        rows: [
          ["$a^x$", "$1+\\frac{x\\ln a}{1!}+\\frac{x^2\\ln^2a}{2!}+\\frac{x^3\\ln^3a}{3!}+\\cdots$, $a>0$"],
          ["$e^x$", "$1+\\frac{x}{1!}+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots$"],
          ["$\\ln(1+x)$", "$x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\frac{x^4}{4}+\\cdots$"],
        ],
      },
      importance: 5,
      source_page: 8,
      sort_order: 3,
    }),
    card(chapterId, "trig-binomial-expansions", {
      title: "Trigonometric and Binomial Expansions",
      card_type: "table",
      body: "The source continues expansion-based limits with sine, cosine, tangent, and binomial expansion.",
      formulas: [],
      variables: [vars.x],
      conditions: ["For $(1+x)^n$, the source states $|x|<1$ and $n\\in R$."],
      table_data: {
        columns: ["Function", "Expansion"],
        rows: [
          ["$\\sin x$", "$x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\frac{x^7}{7!}+\\cdots$"],
          ["$\\cos x$", "$1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\frac{x^6}{6!}+\\cdots$"],
          ["$\\tan x$", "$x+\\frac{x^3}{3}+\\frac{2x^5}{15}+\\cdots$"],
          ["$(1+x)^n$", "$1+nx+\\frac{n(n-1)}{1\\cdot2}x^2+\\frac{n(n-1)(n-2)}{1\\cdot2\\cdot3}x^3+\\cdots$"],
        ],
      },
      importance: 5,
      source_page: 9,
      sort_order: 4,
    }),
    card(chapterId, "one-infinity-type", {
      title: "Limits of Form $1^\\infty$, $0^0$, $\\infty^0$",
      card_type: "formula",
      body: "The handbook gives a direct rule for $(1)^\\infty$ type problems.",
      formulas: [
        { latex: "\\lim_{x\\to0}(1+x)^{1/x}=e" },
        { latex: "\\lim_{x\\to a}[f(x)]^{g(x)}=e^{\\lim_{x\\to a}[f(x)-1]g(x)}" },
      ],
      variables: [vars.f],
      conditions: ["Use the rule when $f(x)\\to1$ and $g(x)\\to\\infty$ as $x\\to a$."],
      importance: 5,
      source_page: 9,
      sort_order: 5,
    }),
    card(chapterId, "sandwich-theorem", {
      title: "Sandwich Theorem",
      card_type: "formula",
      body: "The source states the squeeze theorem using bounding functions with equal limits.",
      formulas: [
        { latex: "f(x)\\le g(x)\\le h(x)\\ \\forall x" },
        { latex: "\\lim_{x\\to a}f(x)=l=\\lim_{x\\to a}h(x)\\Rightarrow \\lim_{x\\to a}g(x)=l" },
      ],
      variables: [vars.f],
      conditions: [],
      importance: 4,
      source_page: 9,
      sort_order: 6,
    }),
  ];
}

function differentiationCards(chapterId) {
  return [
    card(chapterId, "elementary-derivatives-algebra-log", {
      title: "Elementary Derivatives: Algebra and Logs",
      card_type: "table",
      body: "The elementary derivative list begins with power, exponential, and logarithmic derivatives.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Function", "Derivative"],
        rows: [
          ["$x^n$", "$nx^{n-1}$"],
          ["$a^x$", "$a^x\\ln a$"],
          ["$\\ln|x|$", "$\\frac{1}{x}$"],
          ["$\\log_a x$", "$\\frac{1}{x\\ln a}$"],
        ],
      },
      importance: 5,
      source_page: 9,
      sort_order: 1,
    }),
    card(chapterId, "elementary-derivatives-trig", {
      title: "Elementary Derivatives: Trigonometric",
      card_type: "table",
      body: "The source lists derivatives of basic trigonometric functions.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Function", "Derivative"],
        rows: [
          ["$\\sin x$", "$\\cos x$"],
          ["$\\cos x$", "$-\\sin x$"],
          ["$\\sec x$", "$\\sec x\\tan x$"],
          ["$\\cosec x$", "$-\\cosec x\\cot x$"],
          ["$\\tan x$", "$\\sec^2x$"],
          ["$\\cot x$", "$-\\cosec^2x$"],
        ],
      },
      importance: 5,
      source_page: 9,
      sort_order: 2,
    }),
    card(chapterId, "differentiation-rules", {
      title: "Differentiation Rules",
      card_type: "table",
      body: "The method section gives linearity, product, quotient, and chain rules.",
      formulas: [],
      variables: [vars.f],
      conditions: [],
      table_data: {
        columns: ["Rule", "Formula"],
        rows: [
          ["Sum/difference", "$\\frac{d}{dx}(f\\pm g)=f'(x)\\pm g'(x)$"],
          ["Constant multiple", "$\\frac{d}{dx}(kf(x))=k\\frac{d}{dx}f(x)$"],
          ["Product", "$\\frac{d}{dx}(f(x)g(x))=f(x)g'(x)+g(x)f'(x)$"],
          ["Quotient", "$\\frac{d}{dx}\\left(\\frac{f(x)}{g(x)}\\right)=\\frac{g(x)f'(x)-f(x)g'(x)}{g^2(x)}$"],
          ["Chain", "$\\frac{d}{dx}(f(g(x)))=f'(g(x))g'(x)$"],
        ],
      },
      importance: 5,
      source_page: 10,
      sort_order: 3,
    }),
    card(chapterId, "inverse-trig-derivatives", {
      title: "Inverse Trigonometric Derivatives",
      card_type: "table",
      body: "The inverse trigonometric derivative table was visually checked because extraction split the secant/cosecant entries.",
      formulas: [],
      variables: [vars.x],
      conditions: ["For $\\sin^{-1}x$ and $\\cos^{-1}x$, $-1<x<1$.", "For $\\tan^{-1}x$ and $\\cot^{-1}x$, $x\\in R$.", "For $\\sec^{-1}x$ and $\\cosec^{-1}x$, $x\\in(-\\infty,-1)\\cup(1,\\infty)$."],
      table_data: {
        columns: ["Function", "Derivative"],
        rows: [
          ["$\\sin^{-1}x$", "$\\frac{1}{\\sqrt{1-x^2}}$"],
          ["$\\cos^{-1}x$", "$-\\frac{1}{\\sqrt{1-x^2}}$"],
          ["$\\tan^{-1}x$", "$\\frac{1}{1+x^2}$"],
          ["$\\cot^{-1}x$", "$-\\frac{1}{1+x^2}$"],
          ["$\\sec^{-1}x$", "$\\frac{1}{|x|\\sqrt{x^2-1}}$"],
          ["$\\cosec^{-1}x$", "$-\\frac{1}{|x|\\sqrt{x^2-1}}$"],
        ],
      },
      importance: 5,
      source_page: 10,
      sort_order: 4,
    }),
    card(chapterId, "substitution-table", {
      title: "Differentiation Using Substitution",
      card_type: "table",
      body: "The source lists common substitutions used to simplify expressions before differentiating.",
      formulas: [],
      variables: [vars.theta],
      conditions: [],
      table_data: {
        columns: ["Expression", "Substitution", "Range"],
        rows: [
          ["$\\sqrt{x^2+a^2}$", "$x=a\\tan\\theta$", "$-\\frac{\\pi}{2}<\\theta<\\frac{\\pi}{2}$"],
          ["$\\sqrt{a^2-x^2}$", "$x=a\\sin\\theta$", "$-\\frac{\\pi}{2}\\le\\theta\\le\\frac{\\pi}{2}$"],
          ["$\\sqrt{x^2-a^2}$", "$x=a\\sec\\theta$", "$\\theta\\in[0,\\pi],\\theta\\ne\\frac{\\pi}{2}$"],
          ["$\\sqrt{\\frac{x+a}{a-x}}$", "$x=a\\cos\\theta$", "$\\theta\\in(0,\\pi]$"],
        ],
      },
      importance: 5,
      source_page: 10,
      sort_order: 5,
    }),
    card(chapterId, "parametric-and-function-wrt-function", {
      title: "Parametric and Function-with-Respect-to-Function",
      card_type: "formula",
      body: "The source gives parametric differentiation and derivative of one function with respect to another.",
      formulas: [
        { latex: "y=f(\\theta),\\ x=g(\\theta)\\Rightarrow \\frac{dy}{dx}=\\frac{dy/d\\theta}{dx/d\\theta}" },
        { latex: "y=f(x),\\ z=g(x)\\Rightarrow \\frac{dy}{dz}=\\frac{dy/dx}{dz/dx}=\\frac{f'(x)}{g'(x)}" },
      ],
      variables: [vars.f, vars.theta],
      conditions: [],
      importance: 5,
      source_page: 11,
      sort_order: 6,
    }),
    card(chapterId, "multi-function-determinant", {
      title: "Multi-Function Determinant Derivative",
      card_type: "formula",
      body: "The handbook gives a determinant derivative by differentiating each row once and summing.",
      formulas: [
        { latex: "F(x)=\\begin{vmatrix}f(x)&g(x)&h(x)\\\\l(x)&m(x)&n(x)\\\\u(x)&v(x)&w(x)\\end{vmatrix}" },
        { latex: "F'(x)=\\begin{vmatrix}f'(x)&g'(x)&h'(x)\\\\l(x)&m(x)&n(x)\\\\u(x)&v(x)&w(x)\\end{vmatrix}+\\begin{vmatrix}f(x)&g(x)&h(x)\\\\l'(x)&m'(x)&n'(x)\\\\u(x)&v(x)&w(x)\\end{vmatrix}+\\begin{vmatrix}f(x)&g(x)&h(x)\\\\l(x)&m(x)&n(x)\\\\u'(x)&v'(x)&w'(x)\\end{vmatrix}" },
      ],
      variables: [vars.f],
      conditions: ["All listed functions are differentiable functions of $x$."],
      importance: 4,
      source_page: 11,
      sort_order: 7,
    }),
  ];
}

function applicationCards(chapterId) {
  return [
    card(chapterId, "tangent-normal-equations", {
      title: "Tangent and Normal Equations",
      card_type: "mixed",
      body: "The source gives tangent and normal at $(x_1,y_1)$ on $y=f(x)$.",
      formulas: [
        { latex: "y-y_1=f'(x_1)(x-x_1)" },
        { latex: "y-y_1=-\\frac{1}{f'(x_1)}(x-x_1)" },
      ],
      variables: [vars.f],
      conditions: ["Tangent formula requires $f'(x_1)$ real.", "Normal formula requires $f'(x_1)$ nonzero real."],
      diagram_data: { type: "math-tangent-normal" },
      importance: 5,
      source_page: 11,
      sort_order: 1,
    }),
    card(chapterId, "external-point-tangent", {
      title: "Tangent from an External Point",
      card_type: "mixed",
      body: "For external point $P(a,b)$, the source solves for the point of contact $Q(h,f(h))$.",
      formulas: [
        { latex: "f'(h)=\\frac{f(h)-b}{h-a}" },
        { latex: "y-b=\\frac{f(h)-b}{h-a}(x-a)" },
      ],
      variables: [vars.f],
      conditions: ["$P(a,b)$ does not lie on the curve $y=f(x)$."],
      importance: 5,
      source_page: 12,
      sort_order: 2,
    }),
    card(chapterId, "tangent-normal-lengths", {
      title: "Tangent, Normal, Subtangent and Subnormal",
      card_type: "mixed",
      body: "The source lists four lengths for point $P(h,k)$ and slope $m$.",
      formulas: [
        { latex: "PT=|k|\\sqrt{1+\\frac{1}{m^2}}" },
        { latex: "PN=|k|\\sqrt{1+m^2}" },
        { latex: "TM=\\left|\\frac{k}{m}\\right|" },
        { latex: "MN=|km|" },
      ],
      variables: [vars.m],
      conditions: ["The four quantities are length of tangent, normal, subtangent, and subnormal respectively."],
      diagram_data: { type: "math-subtangent-subnormal" },
      importance: 5,
      source_page: 12,
      sort_order: 3,
    }),
    card(chapterId, "angle-shortest-distance", {
      title: "Angle and Shortest Distance Between Curves",
      card_type: "mixed",
      body: "The source defines the angle between curves through their tangents or normals and notes the common-normal shortest distance.",
      formulas: [{ latex: "\\tan\\theta=\\left|\\frac{m_1-m_2}{1+m_1m_2}\\right|" }],
      variables: [vars.m, vars.theta],
      conditions: ["The angle is the acute angle between tangents or normals at the intersection point.", "Shortest distance between two non-intersecting differentiable curves is along their common normal, wherever defined."],
      diagram_data: { type: "math-angle-curves" },
      importance: 5,
      source_page: 12,
      sort_order: 4,
    }),
    card(chapterId, "rolles-and-mvt", {
      title: "Rolle's Theorem and Mean Value Theorem",
      card_type: "table",
      body: "The theorem conditions are copied from the visible source page.",
      formulas: [],
      variables: [vars.f],
      conditions: [],
      table_data: {
        columns: ["Theorem", "Conditions", "Conclusion"],
        rows: [
          ["Rolle's theorem", "$f$ continuous on $[a,b]$, derivable on $(a,b)$, and $f(a)=f(b)$", "$\\exists c\\in(a,b)$ such that $f'(c)=0$"],
          ["Mean value theorem", "$f$ continuous on $[a,b]$ and derivable on $(a,b)$", "$\\exists c\\in(a,b)$ such that $\\frac{f(b)-f(a)}{b-a}=f'(c)$"],
        ],
      },
      importance: 5,
      source_page: 12,
      sort_order: 5,
    }),
    card(chapterId, "mensuration-solids", {
      title: "Mensuration: Cuboid, Cube, Cone, Cylinder, Sphere",
      card_type: "table",
      body: "The AOD section ends with useful mensuration formulae.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Body", "Formulae"],
        rows: [
          ["Cuboid", "$V=lbh$, $S=2(lb+bh+hl)$"],
          ["Cube", "$V=a^3$, $S=6a^2$"],
          ["Cone", "$V=\\frac{1}{3}\\pi r^2h$, curved surface area $=\\pi rl$"],
          ["Cylinder", "curved surface area $=2\\pi rh$, total surface area $=2\\pi rh+2\\pi r^2$"],
          ["Sphere", "$V=\\frac{4}{3}\\pi r^3$, surface area $=4\\pi r^2$"],
        ],
      },
      importance: 4,
      source_page: 13,
      sort_order: 6,
    }),
    card(chapterId, "mensuration-sector-prism-pyramid", {
      title: "Mensuration: Sector, Prism and Pyramid",
      card_type: "table",
      body: "The remaining mensuration entries cover circular sector, prism, and pyramid.",
      formulas: [],
      variables: [vars.theta],
      conditions: ["In circular sector area, $\\theta$ is in radians.", "The source notes lateral surfaces of a prism are rectangles and slant surfaces of a pyramid are triangles."],
      table_data: {
        columns: ["Shape", "Formulae"],
        rows: [
          ["Circular sector", "$A=\\frac{1}{2}r^2\\theta$"],
          ["Prism", "$V=(\\text{area of base})\\times(\\text{height})$"],
          ["Prism surface area", "lateral $=(\\text{perimeter of base})\\times(\\text{height})$, total $=$ lateral $+2(\\text{area of base})$"],
          ["Pyramid", "$V=\\frac{1}{3}(\\text{area of base})\\times(\\text{height})$"],
          ["Pyramid curved surface", "$\\frac{1}{2}(\\text{perimeter of base})\\times(\\text{slant height})$"],
        ],
      },
      importance: 4,
      source_page: 13,
      sort_order: 7,
    }),
  ];
}

const CARD_BUILDERS = {
  "limit-of-function": limitCards,
  "method-of-differentiation": differentiationCards,
  "application-of-derivatives": applicationCards,
};

export function getMathBatch2Chapters() {
  return MATH_BATCH_2_CHAPTER_DEFINITIONS.map((item) => ({
    id: chapter(item.slug),
    subject_id: "jee-mathematics",
    title: item.title,
    slug: item.slug,
    sort_order: item.sort_order,
  }));
}

export function getMathBatch2Cards() {
  return MATH_BATCH_2_CHAPTER_DEFINITIONS.flatMap((item) => CARD_BUILDERS[item.slug](chapter(item.slug)));
}
