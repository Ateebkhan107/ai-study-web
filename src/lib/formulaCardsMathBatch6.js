export const MATH_BATCH_6_CHAPTER_DEFINITIONS = [
  { title: "Solution of Triangle", slug: "solution-of-triangle", sort_order: 20 },
  { title: "Inverse Trigonometric Functions", slug: "inverse-trigonometric-functions", sort_order: 21 },
  { title: "Statistics", slug: "statistics", sort_order: 22 },
  { title: "Mathematical Reasoning", slug: "mathematical-reasoning", sort_order: 23 },
  { title: "Sets and Relation", slug: "sets-and-relation", sort_order: 24 },
];

const chapter = (slug) => `jee-mathematics-${slug}`;

const vars = {
  a: { latex: "a", symbol: "$a$", meaning: "side length or set/cardinality symbol from context" },
  b: { latex: "b", symbol: "$b$", meaning: "side length or constant from context" },
  c: { latex: "c", symbol: "$c$", meaning: "side length or constant from context" },
  A: { latex: "A", symbol: "$A$", meaning: "angle, event, or set from context" },
  B: { latex: "B", symbol: "$B$", meaning: "angle, event, or set from context" },
  C: { latex: "C", symbol: "$C$", meaning: "angle, event, or set from context" },
  s: { latex: "s", symbol: "$s$", meaning: "semi-perimeter, $s=\\frac{a+b+c}{2}$" },
  delta: { latex: "\\Delta", symbol: "$\\Delta$", meaning: "area of triangle" },
  R: { latex: "R", symbol: "$R$", meaning: "circumradius or relation from context" },
  r: { latex: "r", symbol: "$r$", meaning: "inradius, exradius, or count index from context" },
  x: { latex: "x", symbol: "$x$", meaning: "variable or observation" },
  n: { latex: "n", symbol: "$n$", meaning: "number of observations or elements" },
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

function solutionOfTriangleCards(chapterId) {
  return [
    card(chapterId, "sine-cosine-projection", {
      title: "Sine, Cosine and Projection Formulae",
      card_type: "mixed",
      body: "The source begins with standard triangle notation: sides $a,b,c$ opposite angles $A,B,C$.",
      formulas: [
        { label: "Sine rule", latex: "\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}" },
        { label: "Cosine formula", latex: "\\cos A=\\frac{b^2+c^2-a^2}{2bc},\\quad \\cos B=\\frac{c^2+a^2-b^2}{2ca},\\quad \\cos C=\\frac{a^2+b^2-c^2}{2ab}" },
        { label: "Projection formula", latex: "a=b\\cos C+c\\cos B,\\quad b=c\\cos A+a\\cos C,\\quad c=a\\cos B+b\\cos A" },
      ],
      variables: [vars.a, vars.b, vars.c, vars.A, vars.B, vars.C],
      conditions: [],
      diagram_data: { type: "math-triangle-labels" },
      importance: 5,
      source_page: 41,
      sort_order: 1,
    }),
    card(chapterId, "napier-half-angle", {
      title: "Napier Analogy and Half-Angle Formulae",
      card_type: "table",
      body: "The half-angle relations are listed with $s=\\frac{a+b+c}{2}$.",
      formulas: [{ latex: "s=\\frac{a+b+c}{2}" }],
      variables: [vars.s],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Napier analogy / tangent rule",
            columns: ["Formula"],
            rows: [
              ["$\\tan\\frac{B-C}{2}=\\frac{b-c}{b+c}\\cot\\frac{A}{2}$"],
              ["$\\tan\\frac{C-A}{2}=\\frac{c-a}{c+a}\\cot\\frac{B}{2}$"],
              ["$\\tan\\frac{A-B}{2}=\\frac{a-b}{a+b}\\cot\\frac{C}{2}$"],
            ],
          },
          {
            title: "Half-angle formulae",
            columns: ["Function", "Formula"],
            rows: [
              ["$\\sin\\frac{A}{2}$", "$\\sqrt{\\frac{(s-b)(s-c)}{bc}}$"],
              ["$\\sin\\frac{B}{2}$", "$\\sqrt{\\frac{(s-c)(s-a)}{ca}}$"],
              ["$\\sin\\frac{C}{2}$", "$\\sqrt{\\frac{(s-a)(s-b)}{ab}}$"],
              ["$\\cos\\frac{A}{2}$", "$\\sqrt{\\frac{s(s-a)}{bc}}$"],
              ["$\\cos\\frac{B}{2}$", "$\\sqrt{\\frac{s(s-b)}{ca}}$"],
              ["$\\cos\\frac{C}{2}$", "$\\sqrt{\\frac{s(s-c)}{ab}}$"],
              ["$\\tan\\frac{A}{2}$", "$\\sqrt{\\frac{(s-b)(s-c)}{s(s-a)}}=\\frac{\\Delta}{s(s-a)}$"],
            ],
          },
        ],
      },
      importance: 5,
      source_page: 41,
      sort_order: 2,
    }),
    card(chapterId, "area-and-m-n-rule", {
      title: "Area Formulae and m-n Rule",
      card_type: "mixed",
      body: "The area formulae appear before the source's cevian relation for $BD:DC=m:n$.",
      formulas: [
        { latex: "\\sin A=\\frac{2}{bc}\\sqrt{s(s-a)(s-b)(s-c)}=\\frac{2\\Delta}{bc}" },
        { latex: "\\Delta=\\frac{1}{2}ab\\sin C=\\frac{1}{2}bc\\sin A=\\frac{1}{2}ca\\sin B=\\sqrt{s(s-a)(s-b)(s-c)}" },
        { latex: "(m+n)\\cot\\theta=m\\cot\\alpha-n\\cot\\beta=n\\cot B-m\\cot C" },
      ],
      variables: [vars.delta],
      conditions: ["The m-n rule is stated for a point $D$ on $BC$ with $BD:DC=m:n$."],
      importance: 5,
      source_page: 42,
      sort_order: 3,
    }),
    card(chapterId, "radii", {
      title: "Circumradius, Inradius and Exradii",
      card_type: "table",
      body: "The source lists the circumradius, inradius, and exradius relations together.",
      formulas: [],
      variables: [vars.R, vars.r],
      conditions: ["Only the source-visible cyclic and non-cyclic formulas are included."],
      table_data: {
        columns: ["Radius", "Formula"],
        rows: [
          ["Circumradius", "$R=\\frac{a}{2\\sin A}=\\frac{b}{2\\sin B}=\\frac{c}{2\\sin C}=\\frac{abc}{4\\Delta}$"],
          ["Inradius", "$r=\\frac{\\Delta}{s}$"],
          ["Inradius", "$r=(s-a)\\tan\\frac{A}{2}=(s-b)\\tan\\frac{B}{2}=(s-c)\\tan\\frac{C}{2}$"],
          ["Inradius", "$r=4R\\sin\\frac{A}{2}\\sin\\frac{B}{2}\\sin\\frac{C}{2}$"],
          ["Exradii", "$r_1=\\frac{\\Delta}{s-a},\\quad r_2=\\frac{\\Delta}{s-b},\\quad r_3=\\frac{\\Delta}{s-c}$"],
          ["Exradii", "$r_1=s\\tan\\frac{A}{2},\\quad r_2=s\\tan\\frac{B}{2},\\quad r_3=s\\tan\\frac{C}{2}$"],
          ["Source-visible exradius relation", "$r_1=4R\\sin\\frac{A}{2}\\cos\\frac{B}{2}\\cos\\frac{C}{2}$"],
        ],
      },
      diagram_data: { type: "math-triangle-circles" },
      importance: 5,
      source_page: 42,
      sort_order: 4,
    }),
    card(chapterId, "bisector-median-altitude", {
      title: "Angle Bisector, Median and Altitude",
      card_type: "formula",
      body: "The source gives the $A$-vertex formulas for internal angle bisector, median, and altitude.",
      formulas: [
        { label: "Angle bisector", latex: "\\beta_a=\\frac{2bc\\cos\\frac{A}{2}}{b+c}" },
        { label: "Median", latex: "m_a=\\frac{1}{2}\\sqrt{2b^2+2c^2-a^2}" },
        { label: "Altitude", latex: "A_a=\\frac{2\\Delta}{a}" },
      ],
      variables: [vars.delta],
      conditions: [],
      importance: 5,
      source_page: 43,
      sort_order: 5,
    }),
    card(chapterId, "pedal-triangle", {
      title: "Pedal Triangle",
      card_type: "mixed",
      body: "The pedal triangle is formed by joining the feet of the altitudes.",
      formulas: [
        { latex: "\\text{Angles of pedal triangle}=\\pi-2A,\\quad \\pi-2B,\\quad \\pi-2C" },
        { latex: "\\text{Sides}=a\\cos A=R\\sin2A,\\quad b\\cos B=R\\sin2B,\\quad c\\cos C=R\\sin2C" },
      ],
      variables: [vars.R],
      conditions: ["The source notes that the circumradii of triangles $PBC$, $PCA$, $PAB$, and $ABC$ are equal."],
      diagram_data: { type: "math-pedal-triangle" },
      importance: 4,
      source_page: 43,
      sort_order: 6,
    }),
    card(chapterId, "excentral-triangle", {
      title: "Excentral Triangle",
      card_type: "formula",
      body: "The excentral triangle is formed by joining the excentres $I_1,I_2,I_3$.",
      formulas: [
        { latex: "\\text{Angles}=\\frac{\\pi}{2}-\\frac{A}{2},\\quad \\frac{\\pi}{2}-\\frac{B}{2},\\quad \\frac{\\pi}{2}-\\frac{C}{2}" },
        { latex: "\\text{Sides}=4R\\cos\\frac{A}{2},\\quad 4R\\cos\\frac{B}{2},\\quad 4R\\cos\\frac{C}{2}" },
        { latex: "II_1=4R\\sin\\frac{A}{2},\\quad II_2=4R\\sin\\frac{B}{2},\\quad II_3=4R\\sin\\frac{C}{2}" },
      ],
      variables: [vars.R],
      conditions: ["The source states that $\\Delta ABC$ is the pedal triangle of $\\Delta I_1I_2I_3$ and that $I$ is its orthocentre."],
      importance: 4,
      source_page: 44,
      sort_order: 7,
    }),
    card(chapterId, "special-point-distances", {
      title: "Distances Between Special Points",
      card_type: "table",
      body: "The source closes Solution of Triangle with distances involving circumcentre, orthocentre, incentre, and centroid.",
      formulas: [],
      variables: [vars.R],
      conditions: [],
      table_data: {
        columns: ["Distance", "Formula"],
        rows: [
          ["$OH^2$", "$R^2(1-8\\cos A\\cos B\\cos C)$"],
          ["$OI^2$", "$R^2\\left(1-8\\sin\\frac{A}{2}\\sin\\frac{B}{2}\\sin\\frac{C}{2}\\right)=R^2-2Rr$"],
          ["$OG^2$", "$R^2-\\frac{1}{9}(a^2+b^2+c^2)$"],
        ],
      },
      importance: 4,
      source_page: 44,
      sort_order: 8,
    }),
  ];
}

function inverseTrigCards(chapterId) {
  return [
    card(chapterId, "principal-domain-range", {
      title: "Principal Domains and Ranges",
      card_type: "table",
      body: "The principal value table is stored exactly as visually verified from the handbook.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Function", "Domain", "Range"],
        rows: [
          ["$\\sin^{-1}x$", "$-1\\le x\\le1$", "$-\\frac{\\pi}{2}\\le y\\le\\frac{\\pi}{2}$"],
          ["$\\cos^{-1}x$", "$-1\\le x\\le1$", "$0\\le y\\le\\pi$"],
          ["$\\tan^{-1}x$", "$x\\in\\mathbb{R}$", "$-\\frac{\\pi}{2}<y<\\frac{\\pi}{2}$"],
          ["$\\cosec^{-1}x$", "$x\\le-1\\text{ or }x\\ge1$", "$-\\frac{\\pi}{2}\\le y\\le\\frac{\\pi}{2},\\ y\\ne0$"],
          ["$\\sec^{-1}x$", "$x\\le-1\\text{ or }x\\ge1$", "$0\\le y\\le\\pi,\\ y\\ne\\frac{\\pi}{2}$"],
          ["$\\cot^{-1}x$", "$x\\in\\mathbb{R}$", "$0<y<\\pi$"],
        ],
      },
      importance: 5,
      source_page: 44,
      sort_order: 1,
    }),
    card(chapterId, "inverse-direct-negative", {
      title: "Inverse-of-Direct and Negative Argument Identities",
      card_type: "table",
      body: "These identities are listed immediately after the principal range table.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Inverse-of-direct identities",
            columns: ["Identity", "Condition"],
            rows: [
              ["$\\sin^{-1}(\\sin x)=x$", "$-\\frac{\\pi}{2}\\le x\\le\\frac{\\pi}{2}$"],
              ["$\\cos^{-1}(\\cos x)=x$", "$0\\le x\\le\\pi$"],
              ["$\\tan^{-1}(\\tan x)=x$", "$-\\frac{\\pi}{2}<x<\\frac{\\pi}{2}$"],
              ["$\\cot^{-1}(\\cot x)=x$", "$0<x<\\pi$"],
              ["$\\sec^{-1}(\\sec x)=x$", "$0\\le x\\le\\pi,\\ x\\ne\\frac{\\pi}{2}$"],
              ["$\\cosec^{-1}(\\cosec x)=x$", "$x\\ne0,\\ -\\frac{\\pi}{2}\\le x\\le\\frac{\\pi}{2}$"],
            ],
          },
          {
            title: "Negative argument identities",
            columns: ["Identity", "Condition"],
            rows: [
              ["$\\sin^{-1}(-x)=-\\sin^{-1}x$", "$-1\\le x\\le1$"],
              ["$\\tan^{-1}(-x)=-\\tan^{-1}x$", "$x\\in\\mathbb{R}$"],
              ["$\\cos^{-1}(-x)=\\pi-\\cos^{-1}x$", "$-1\\le x\\le1$"],
              ["$\\cot^{-1}(-x)=\\pi-\\cot^{-1}x$", "$x\\in\\mathbb{R}$"],
            ],
          },
        ],
      },
      importance: 5,
      source_page: 45,
      sort_order: 2,
    }),
    card(chapterId, "complementary-identities", {
      title: "Complementary Inverse Trig Identities",
      card_type: "table",
      body: "The complementary identities are grouped as a compact table.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Identity", "Condition"],
        rows: [
          ["$\\sin^{-1}x+\\cos^{-1}x=\\frac{\\pi}{2}$", "$-1\\le x\\le1$"],
          ["$\\tan^{-1}x+\\cot^{-1}x=\\frac{\\pi}{2}$", "$x\\in\\mathbb{R}$"],
          ["$\\cosec^{-1}x+\\sec^{-1}x=\\frac{\\pi}{2}$", "$|x|\\ge1$"],
        ],
      },
      importance: 4,
      source_page: 45,
      sort_order: 3,
    }),
    card(chapterId, "addition-identities", {
      title: "Addition Identities",
      card_type: "table",
      body: "The addition identities include the source's piecewise conditions.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Expression", "Identity", "Condition"],
        rows: [
          ["$\\sin^{-1}x+\\sin^{-1}y$", "$\\sin^{-1}(x\\sqrt{1-y^2}+y\\sqrt{1-x^2})$", "$x\\ge0,y\\ge0,x^2+y^2\\le1$"],
          ["$\\sin^{-1}x+\\sin^{-1}y$", "$\\pi-\\sin^{-1}(x\\sqrt{1-y^2}+y\\sqrt{1-x^2})$", "$x\\ge0,y\\ge0,x^2+y^2>1$"],
          ["$\\cos^{-1}x+\\cos^{-1}y$", "$\\cos^{-1}(xy-\\sqrt{1-x^2}\\sqrt{1-y^2})$", "$x\\ge0,y\\ge0$"],
          ["$\\tan^{-1}x+\\tan^{-1}y$", "$\\tan^{-1}\\frac{x+y}{1-xy}$", "$x>0,y>0,xy<1$"],
          ["$\\tan^{-1}x+\\tan^{-1}y$", "$\\pi+\\tan^{-1}\\frac{x+y}{1-xy}$", "$x>0,y>0,xy>1$"],
          ["$\\tan^{-1}x+\\tan^{-1}y$", "$\\frac{\\pi}{2}$", "$x>0,y>0,xy=1$"],
        ],
      },
      importance: 5,
      source_page: 45,
      sort_order: 4,
    }),
    card(chapterId, "subtraction-identities", {
      title: "Subtraction Identities",
      card_type: "table",
      body: "The subtraction identities are kept separate for mobile readability.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Expression", "Identity", "Condition"],
        rows: [
          ["$\\sin^{-1}x-\\sin^{-1}y$", "$\\sin^{-1}(x\\sqrt{1-y^2}-y\\sqrt{1-x^2})$", "$x\\ge0,y\\ge0$"],
          ["$\\cos^{-1}x-\\cos^{-1}y$", "$\\cos^{-1}(xy+\\sqrt{1-x^2}\\sqrt{1-y^2})$", "$x\\ge0,y\\ge0,x\\le y$"],
          ["$\\tan^{-1}x-\\tan^{-1}y$", "$\\tan^{-1}\\frac{x-y}{1+xy}$", "$x\\ge0,y\\ge0$"],
        ],
      },
      importance: 5,
      source_page: 46,
      sort_order: 5,
    }),
    card(chapterId, "double-angle-arctan", {
      title: "Double-Angle Style and Three-Arctan Results",
      card_type: "table",
      body: "The source's longer piecewise identities are split into table rows instead of a giant paragraph.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Double-angle style identities",
            columns: ["Expression", "Value", "Condition"],
            rows: [
              ["$\\sin^{-1}(2x\\sqrt{1-x^2})$", "$2\\sin^{-1}x$", "$|x|\\le\\frac{1}{\\sqrt2}$"],
              ["$\\sin^{-1}(2x\\sqrt{1-x^2})$", "$\\pi-2\\sin^{-1}x$", "$x>\\frac{1}{\\sqrt2}$"],
              ["$\\sin^{-1}(2x\\sqrt{1-x^2})$", "$-(\\pi+2\\sin^{-1}x)$", "$x<-\\frac{1}{\\sqrt2}$"],
              ["$\\cos^{-1}(2x^2-1)$", "$2\\cos^{-1}x$", "$0\\le x\\le1$"],
              ["$\\cos^{-1}(2x^2-1)$", "$2\\pi-2\\cos^{-1}x$", "$-1\\le x<0$"],
              ["$\\tan^{-1}\\frac{2x}{1-x^2}$", "$2\\tan^{-1}x$", "$|x|<1$"],
              ["$\\tan^{-1}\\frac{2x}{1-x^2}$", "$\\pi+2\\tan^{-1}x$", "$x<-1$"],
              ["$\\tan^{-1}\\frac{2x}{1-x^2}$", "$-(\\pi-2\\tan^{-1}x)$", "$x>1$"],
              ["$\\sin^{-1}\\frac{2x}{1+x^2}$", "$2\\tan^{-1}x$", "$|x|\\le1$"],
              ["$\\sin^{-1}\\frac{2x}{1+x^2}$", "$\\pi-2\\tan^{-1}x$", "$x>1$"],
              ["$\\sin^{-1}\\frac{2x}{1+x^2}$", "$-(\\pi+2\\tan^{-1}x)$", "$x<-1$"],
              ["$\\cos^{-1}\\frac{1-x^2}{1+x^2}$", "$2\\tan^{-1}x$", "$x\\ge0$"],
              ["$\\cos^{-1}\\frac{1-x^2}{1+x^2}$", "$-2\\tan^{-1}x$", "$x<0$"],
            ],
          },
          {
            title: "Three-arctan result and notes",
            columns: ["Result", "Condition"],
            rows: [
              ["$\\tan^{-1}x+\\tan^{-1}y+\\tan^{-1}z=\\tan^{-1}\\frac{x+y+z-xyz}{1-xy-yz-zx}$", "$x>0,y>0,z>0,xy+yz+zx<1$"],
              ["If $\\tan^{-1}x+\\tan^{-1}y+\\tan^{-1}z=\\pi$, then $x+y+z=xyz$", ""],
              ["If $\\tan^{-1}x+\\tan^{-1}y+\\tan^{-1}z=\\frac{\\pi}{2}$, then $xy+yz+zx=1$", ""],
              ["$\\tan^{-1}1+\\tan^{-1}2+\\tan^{-1}3=\\pi$", ""],
            ],
          },
        ],
      },
      importance: 5,
      source_page: 46,
      sort_order: 6,
    }),
  ];
}

function statisticsCards(chapterId) {
  return [
    card(chapterId, "arithmetic-mean", {
      title: "Arithmetic Mean",
      card_type: "formula",
      body: "The handbook defines arithmetic mean for observations and frequency data.",
      formulas: [
        { latex: "\\overline{x}=\\frac{x_1+x_2+\\cdots+x_n}{n}=\\frac{\\sum x_i}{n}" },
        { latex: "\\overline{x}=\\frac{\\sum f_i x_i}{N},\\quad N=\\sum f_i" },
      ],
      variables: [vars.x, vars.n],
      conditions: [],
      importance: 5,
      source_page: 47,
      sort_order: 1,
    }),
    card(chapterId, "mean-properties", {
      title: "Properties of Mean",
      card_type: "table",
      body: "The visible mean properties are stored as a compact list.",
      formulas: [],
      variables: [vars.x],
      conditions: [],
      table_data: {
        columns: ["Property"],
        rows: [
          ["$\\sum (x_i-\\overline{x})=0$"],
          ["$\\sum (x_i-\\overline{x})^2$ is minimum"],
          ["A.M. of $(x_i+\\lambda)=\\overline{x}+\\lambda$"],
          ["A.M. of $(a x_i+b)=a\\overline{x}+b$"],
        ],
      },
      importance: 4,
      source_page: 47,
      sort_order: 2,
    }),
    card(chapterId, "median-mode", {
      title: "Median, Mode and Empirical Relation",
      card_type: "table",
      body: "The source gives median rules, mode definition, and the mean-median-mode relation.",
      formulas: [],
      variables: [vars.n],
      conditions: ["The even-number median entry is left to the PDF fallback because the printed index is visibly ambiguous."],
      table_data: {
        columns: ["Topic", "Source-backed result"],
        rows: [
          ["Median for odd $n$", "$\\left(\\frac{n+1}{2}\\right)^{\\text{th}}$ term"],
          ["Mode", "Value of the variable which occurs most frequently in a distribution."],
          ["Symmetric distribution", "Mean = Mode = Median"],
          ["Skew distribution", "$\\text{Median}=\\frac{2(\\text{Mean})+\\text{Mode}}{3}$"],
        ],
      },
      importance: 4,
      source_page: 48,
      sort_order: 3,
    }),
    card(chapterId, "range-mean-deviation", {
      title: "Range and Mean Deviation",
      card_type: "formula",
      body: "Range is expressed through largest and smallest observations; mean deviation is listed for simple and frequency data.",
      formulas: [
        { latex: "\\text{Range}=\\frac{L-S}{L+S}" },
        { latex: "MD=\\frac{\\sum |x_i-A|}{n}" },
        { latex: "MD=\\frac{\\sum f_i|x_i-A|}{N}" },
      ],
      variables: [vars.x, vars.n],
      conditions: ["$L$ is the largest value and $S$ is the smallest value."],
      importance: 5,
      source_page: 48,
      sort_order: 4,
    }),
    card(chapterId, "variance-standard-deviation", {
      title: "Variance and Standard Deviation",
      card_type: "formula",
      body: "The variance formula appears with its shortcut form and assumed-mean form.",
      formulas: [
        { latex: "\\text{Standard deviation}=+\\sqrt{\\text{variance}}" },
        { latex: "\\sigma_x^2=\\frac{\\sum (x_i-\\overline{x})^2}{n}" },
        { latex: "\\sigma_x^2=\\frac{\\sum x_i^2}{n}-\\left(\\frac{\\sum x_i}{n}\\right)^2=\\frac{\\sum x_i^2}{n}-(\\overline{x})^2" },
        { latex: "\\sigma_d^2=\\frac{\\sum d_i^2}{n}-\\left(\\frac{\\sum d_i}{n}\\right)^2,\\quad d_i=x_i-a" },
      ],
      variables: [vars.x, vars.n],
      conditions: ["For the assumed-mean method, $a$ is the assumed mean."],
      importance: 5,
      source_page: 49,
      sort_order: 5,
    }),
    card(chapterId, "coefficients-transformations", {
      title: "Coefficient Measures and Variance Transformations",
      card_type: "table",
      body: "The chapter closes with coefficient measures and variance transformation properties.",
      formulas: [],
      variables: [vars.x],
      conditions: ["$\\lambda,a,b$ are constants."],
      table_data: {
        columns: ["Result", "Formula"],
        rows: [
          ["Coefficient of standard deviation", "$\\frac{\\sigma}{\\overline{x}}$"],
          ["Coefficient of variation", "$\\frac{\\sigma}{\\overline{x}}\\times100$"],
          ["Variance shift", "$\\operatorname{var}(x_i+\\lambda)=\\operatorname{var}(x_i)$"],
          ["Variance scale", "$\\operatorname{var}(\\lambda x_i)=\\lambda^2\\operatorname{var}(x_i)$"],
          ["Variance linear transform", "$\\operatorname{var}(a x_i+b)=a^2\\operatorname{var}(x_i)$"],
        ],
      },
      importance: 5,
      source_page: 49,
      sort_order: 6,
    }),
  ];
}

function reasoningCards(chapterId) {
  return [
    card(chapterId, "truth-table-operators", {
      title: "Truth Table Operators",
      card_type: "table",
      body: "The source opens Mathematical Reasoning with truth values for compound statements.",
      formulas: [],
      variables: [],
      conditions: ["The handbook's operator table is visually reproduced without adding external corrections."],
      table_data: {
        columns: ["$p$", "$q$", "$p\\wedge q$", "$p\\vee q$", "$p\\to q$", "$q\\to p$", "$p\\leftrightarrow q$", "$q\\leftrightarrow p$"],
        rows: [
          ["T", "T", "T", "T", "T", "T", "T", "T"],
          ["T", "F", "F", "T", "F", "T", "F", "F"],
          ["F", "T", "F", "F", "T", "F", "F", "F"],
          ["F", "F", "F", "F", "T", "T", "T", "T"],
        ],
      },
      importance: 4,
      source_page: 49,
      sort_order: 1,
    }),
    card(chapterId, "tautology-contradiction", {
      title: "Tautology and Contradiction",
      card_type: "table",
      body: "The source defines tautology and contradiction using $p\\vee\\sim p$ and $p\\wedge\\sim p$.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Tautology: $p\\vee\\sim p$",
            columns: ["$p$", "$\\sim p$", "$p\\vee\\sim p$"],
            rows: [
              ["T", "F", "T"],
              ["F", "T", "T"],
            ],
          },
          {
            title: "Contradiction: $p\\wedge\\sim p$",
            columns: ["$p$", "$\\sim p$", "$p\\wedge\\sim p$"],
            rows: [
              ["T", "F", "F"],
              ["F", "T", "F"],
            ],
          },
        ],
      },
      importance: 4,
      source_page: 49,
      sort_order: 2,
    }),
    card(chapterId, "negations", {
      title: "Negation Identities",
      card_type: "table",
      body: "The negation row lists the source transformations for conjunction, disjunction, implication, and biconditional.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Statement", "Negation"],
        rows: [
          ["$p\\wedge q$", "$(\\sim p)\\vee(\\sim q)$"],
          ["$p\\vee q$", "$(\\sim p)\\wedge(\\sim q)$"],
          ["$p\\to q$", "$p\\wedge(\\sim q)$"],
          ["$p\\leftrightarrow q$", "$p\\leftrightarrow -q$"],
        ],
      },
      importance: 4,
      source_page: 50,
      sort_order: 3,
    }),
    card(chapterId, "contrapositive", {
      title: "Implication and Contrapositive",
      card_type: "formula",
      body: "The source states the contrapositive relation directly.",
      formulas: [{ latex: "p\\Rightarrow q\\quad \\text{has contrapositive}\\quad \\sim q\\Rightarrow \\sim p" }],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 50,
      sort_order: 4,
    }),
  ];
}

function setsRelationCards(chapterId) {
  return [
    card(chapterId, "set-algebra-laws", {
      title: "Algebra of Sets",
      card_type: "table",
      body: "The source groups the standard algebraic laws of sets before counting formulas.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Law", "Formulae"],
        rows: [
          ["Commutative", "$(A\\cup B)=B\\cup A;\\quad A\\cap B=B\\cap A$"],
          ["Associative", "$(A\\cup B)\\cup C=A\\cup(B\\cup C);\\quad (A\\cap B)\\cap C=A\\cap(B\\cap C)$"],
          ["Distributive", "$A\\cup(B\\cap C)=(A\\cup B)\\cap(A\\cup C);\\quad A\\cap(B\\cup C)=(A\\cap B)\\cup(A\\cap C)$"],
          ["De Morgan", "$(A\\cup B)'=A'\\cap B';\\quad (A\\cap B)'=A'\\cup B'$"],
          ["Identity", "$A\\cap U=A;\\quad A\\cup\\phi=A$"],
          ["Complement", "$A\\cup A'=U,\\quad A\\cap A'=\\phi,\\quad (A')'=A$"],
          ["Idempotent", "$A\\cap A=A,\\quad A\\cup A=A$"],
        ],
      },
      importance: 5,
      source_page: 50,
      sort_order: 1,
    }),
    card(chapterId, "set-counting", {
      title: "Set Counting Formulae",
      card_type: "table",
      body: "The counting results are stated for finite sets $A,B,C$ and finite universal set $U$.",
      formulas: [],
      variables: [],
      conditions: ["$A,B,C$ are finite sets and $U$ is the finite universal set."],
      table_data: {
        columns: ["Result", "Formula"],
        rows: [
          ["Two-set union", "$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)$"],
          ["Difference", "$n(A-B)=n(A)-n(A\\cap B)$"],
          ["Three-set union", "$n(A\\cup B\\cup C)=n(A)+n(B)+n(C)-n(A\\cap B)-n(B\\cap C)-n(A\\cap C)+n(A\\cap B\\cap C)$"],
        ],
      },
      importance: 5,
      source_page: 50,
      sort_order: 2,
    }),
    card(chapterId, "exactly-one-two", {
      title: "Exactly One and Exactly Two Sets",
      card_type: "formula",
      body: "The source lists compact formulas for elements belonging to exactly two and exactly one of three sets.",
      formulas: [
        { label: "Exactly two", latex: "n(A\\cap B)+n(B\\cap C)+n(C\\cap A)-3n(A\\cap B\\cap C)" },
        { label: "Exactly one", latex: "n(A)+n(B)+n(C)-2n(A\\cap B)-2n(B\\cap C)-2n(A\\cap C)+3n(A\\cap B\\cap C)" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 50,
      sort_order: 3,
    }),
    card(chapterId, "basic-relations", {
      title: "Void, Universal and Identity Relations",
      card_type: "table",
      body: "The relation section defines relation types on a given set $A$.",
      formulas: [],
      variables: [vars.A],
      conditions: [],
      table_data: {
        columns: ["Relation", "Source definition"],
        rows: [
          ["Void relation", "$\\phi\\subseteq A\\times A$; the void or empty relation on $A$."],
          ["Universal relation", "$A\\times A\\subseteq A\\times A$; the universal relation on $A$."],
          ["Identity relation", "$I_A=\\{(a,a):a\\in A\\}$; every element of $A$ is related to itself only."],
        ],
      },
      importance: 4,
      source_page: 51,
      sort_order: 4,
    }),
    card(chapterId, "relation-properties", {
      title: "Reflexive, Symmetric, Transitive and Equivalence",
      card_type: "table",
      body: "The final relation card stores the source conditions for relation properties.",
      formulas: [],
      variables: [vars.A, vars.R],
      conditions: ["Every identity relation is reflexive but every reflexive relation is not identity."],
      table_data: {
        columns: ["Property", "Condition"],
        rows: [
          ["Reflexive", "$(a,a)\\in R$ for all $a\\in A$"],
          ["Not reflexive", "There exists $a\\in A$ such that $(a,a)\\notin R$"],
          ["Symmetric", "$(a,b)\\in R\\Rightarrow(b,a)\\in R$ for all $a,b\\in A$"],
          ["Transitive", "$(a,b)\\in R$ and $(b,c)\\in R\\Rightarrow(a,c)\\in R$ for all $a,b,c\\in A$"],
          ["Equivalence relation", "Reflexive, symmetric, and transitive."],
        ],
      },
      importance: 5,
      source_page: 51,
      sort_order: 5,
    }),
  ];
}

export function getMathBatch6Chapters() {
  return MATH_BATCH_6_CHAPTER_DEFINITIONS.map((definition) => ({
    id: chapter(definition.slug),
    subject_id: "jee-mathematics",
    title: definition.title,
    slug: definition.slug,
    sort_order: definition.sort_order,
  }));
}

export function getMathBatch6Cards() {
  return [
    ...solutionOfTriangleCards(chapter("solution-of-triangle")),
    ...inverseTrigCards(chapter("inverse-trigonometric-functions")),
    ...statisticsCards(chapter("statistics")),
    ...reasoningCards(chapter("mathematical-reasoning")),
    ...setsRelationCards(chapter("sets-and-relation")),
  ];
}
