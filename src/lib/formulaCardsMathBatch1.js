export const MATH_BATCH_1_CHAPTER_DEFINITIONS = [
  { title: "Straight Line", slug: "straight-line", sort_order: 1 },
  { title: "Circle", slug: "circle", sort_order: 2 },
  { title: "Parabola", slug: "parabola", sort_order: 3 },
  { title: "Ellipse", slug: "ellipse", sort_order: 4 },
  { title: "Hyperbola", slug: "hyperbola", sort_order: 5 },
];

const chapter = (slug) => `jee-mathematics-${slug}`;

const vars = {
  a: { latex: "a", symbol: "$a$", meaning: "parameter or semi-major axis depending on context" },
  b: { latex: "b", symbol: "$b$", meaning: "line coefficient or semi-minor axis depending on context" },
  e: { latex: "e", symbol: "$e$", meaning: "eccentricity" },
  m: { latex: "m", symbol: "$m$", meaning: "slope or ratio depending on context" },
  theta: { latex: "\\theta", symbol: "$\\theta$", meaning: "angle or parameter depending on context" },
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

function straightLineCards(chapterId) {
  return [
    card(chapterId, "distance-section", {
      title: "Distance and Section Formula",
      card_type: "formula",
      body: "The source opens Straight Line with distance between two points and section formula.",
      formulas: [
        { latex: "d=\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}" },
        { latex: "x=\\frac{mx_2\\pm nx_1}{m\\pm n},\\quad y=\\frac{my_2\\pm ny_1}{m\\pm n}" },
      ],
      variables: [vars.m],
      conditions: ["The section formula was visually checked because extraction dropped the $n$ terms beside $x_1,y_1$."],
      importance: 5,
      source_page: 2,
      sort_order: 1,
    }),
    card(chapterId, "centres-of-triangle", {
      title: "Centroid, Incentre and Excentre",
      card_type: "formula",
      body: "Triangle centre coordinates are grouped in one compact revision card.",
      formulas: [
        { latex: "G\\left(\\frac{x_1+x_2+x_3}{3},\\frac{y_1+y_2+y_3}{3}\\right)" },
        { latex: "I\\left(\\frac{ax_1+bx_2+cx_3}{a+b+c},\\frac{ay_1+by_2+cy_3}{a+b+c}\\right)" },
        { latex: "I_1\\left(\\frac{-ax_1+bx_2+cx_3}{-a+b+c},\\frac{-ay_1+by_2+cy_3}{-a+b+c}\\right)" },
      ],
      variables: [vars.a, vars.b],
      conditions: [],
      table_data: {
        columns: ["Centre", "Coordinates"],
        rows: [
          ["Centroid", "$G\\left(\\frac{x_1+x_2+x_3}{3},\\frac{y_1+y_2+y_3}{3}\\right)$"],
          ["Incentre", "$I\\left(\\frac{ax_1+bx_2+cx_3}{a+b+c},\\frac{ay_1+by_2+cy_3}{a+b+c}\\right)$"],
          ["Excentre", "$I_1\\left(\\frac{-ax_1+bx_2+cx_3}{-a+b+c},\\frac{-ay_1+by_2+cy_3}{-a+b+c}\\right)$"],
        ],
      },
      importance: 4,
      source_page: 2,
      sort_order: 2,
    }),
    card(chapterId, "area-slope-collinearity", {
      title: "Area, Slope and Collinearity",
      card_type: "formula",
      body: "The source lists determinant tests for triangle area and collinearity plus slope of a line through two points.",
      formulas: [
        { latex: "\\Delta ABC=\\frac{1}{2}\\begin{vmatrix}x_1&y_1&1\\\\x_2&y_2&1\\\\x_3&y_3&1\\end{vmatrix}" },
        { latex: "m=\\frac{y_1-y_2}{x_1-x_2}" },
        { latex: "\\begin{vmatrix}x_1&y_1&1\\\\x_2&y_2&1\\\\x_3&y_3&1\\end{vmatrix}=0" },
      ],
      variables: [vars.m],
      conditions: ["The determinant and slope lines were visually verified because the rendered PDF drops some 1s/subscripts in the page text."],
      importance: 5,
      source_page: 2,
      sort_order: 3,
    }),
    card(chapterId, "angle-parallel-perpendicular", {
      title: "Angle, Parallel and Perpendicular Lines",
      card_type: "formula",
      body: "The source gives angle between two lines and line-pair conditions for parallel/perpendicular cases.",
      formulas: [
        { latex: "\\tan\\theta=\\left|\\frac{m_1-m_2}{1+m_1m_2}\\right|" },
        { latex: "\\frac{a}{a'}=\\frac{b}{b'}\\ne\\frac{c}{c'}" },
        { latex: "aa'+bb'=0" },
      ],
      variables: [vars.theta],
      conditions: ["The two general lines are $ax+by+c=0$ and $a'x+b'y+c'=0$."],
      importance: 5,
      source_page: 3,
      sort_order: 4,
    }),
    card(chapterId, "distances-reflection-foot", {
      title: "Distances, Reflection and Foot",
      card_type: "formula",
      body: "Point-line relations are grouped: distance between parallel lines, point-line distance, reflection, and foot of perpendicular.",
      formulas: [
        { latex: "d=\\left|\\frac{c_1-c_2}{\\sqrt{a^2+b^2}}\\right|" },
        { latex: "d=\\left|\\frac{ax_1+by_1+c}{\\sqrt{a^2+b^2}}\\right|" },
        { latex: "\\frac{x-x_1}{a}=\\frac{y-y_1}{b}=-2\\frac{ax_1+by_1+c}{a^2+b^2}" },
        { latex: "\\frac{x-x_1}{a}=\\frac{y-y_1}{b}=-\\frac{ax_1+by_1+c}{a^2+b^2}" },
      ],
      variables: [vars.a, vars.b],
      conditions: ["The last two formulae are for reflection of a point about a line and foot of perpendicular respectively."],
      diagram_data: { type: "math-point-line-distance" },
      importance: 5,
      source_page: 3,
      sort_order: 5,
    }),
    card(chapterId, "bisectors-concurrency-origin-pair", {
      title: "Bisectors, Concurrency and Pair Through Origin",
      card_type: "formula",
      body: "The source closes Straight Line with angle bisectors, concurrency determinant, and pair of lines through origin.",
      formulas: [
        { latex: "\\frac{ax+by+c}{\\sqrt{a^2+b^2}}=\\pm\\frac{a'x+b'y+c'}{\\sqrt{a'^2+b'^2}}" },
        { latex: "\\begin{vmatrix}a_1&b_1&c_1\\\\a_2&b_2&c_2\\\\a_3&b_3&c_3\\end{vmatrix}=0" },
        { latex: "ax^2+2hxy+by^2=0" },
        { latex: "\\tan\\theta=\\left|\\frac{2\\sqrt{h^2-ab}}{a+b}\\right|" },
      ],
      variables: [vars.a, vars.b, vars.theta],
      conditions: ["The concurrency determinant is for three lines $a_ix+b_iy+c_i=0$, $i=1,2,3$."],
      importance: 5,
      source_page: 3,
      sort_order: 6,
    }),
  ];
}

function circleCards(chapterId) {
  return [
    card(chapterId, "intercepts-parametric", {
      title: "Intercepts and Parametric Equation",
      card_type: "formula",
      body: "For $x^2+y^2+2gx+2fy+c=0$, the source gives axis intercepts and circle parametrisation.",
      formulas: [
        { latex: "\\text{x-axis intercept}=2\\sqrt{g^2-c}" },
        { latex: "\\text{y-axis intercept}=2\\sqrt{f^2-c}" },
        { latex: "x=h+r\\cos\\theta,\\quad y=k+r\\sin\\theta" },
      ],
      variables: [vars.theta],
      conditions: [],
      diagram_data: { type: "math-circle-standard" },
      importance: 5,
      source_page: 4,
      sort_order: 1,
    }),
    card(chapterId, "tangent-forms", {
      title: "Tangent Forms",
      card_type: "formula",
      body: "The handbook lists slope, point, and parametric forms of tangent to $x^2+y^2=a^2$.",
      formulas: [
        { label: "Slope form", latex: "y=mx\\pm a\\sqrt{1+m^2}" },
        { label: "Point form", latex: "xx_1+yy_1=a^2\\quad\\text{or}\\quad T=0" },
        { label: "Parametric form", latex: "x\\cos\\alpha+y\\sin\\alpha=a" },
      ],
      variables: [vars.a, vars.m],
      conditions: [],
      table_data: {
        columns: ["Form", "Tangent"],
        rows: [
          ["Slope", "$y=mx\\pm a\\sqrt{1+m^2}$"],
          ["Point", "$xx_1+yy_1=a^2$ or $T=0$"],
          ["Parametric", "$x\\cos\\alpha+y\\sin\\alpha=a$"],
        ],
      },
      importance: 5,
      source_page: 4,
      sort_order: 2,
    }),
    card(chapterId, "pair-tangent-length-director", {
      title: "Pair of Tangents, Tangent Length and Director Circle",
      card_type: "formula",
      body: "The source gives pair-of-tangents relation, tangent length, and director circle.",
      formulas: [
        { latex: "SS_1=T^2" },
        { latex: "\\text{length of tangent}=\\sqrt{S_1}" },
        { latex: "x^2+y^2=2a^2\\quad\\text{for}\\quad x^2+y^2=a^2" },
      ],
      variables: [vars.a],
      conditions: [],
      importance: 5,
      source_page: 4,
      sort_order: 3,
    }),
    card(chapterId, "chord-of-contact", {
      title: "Chord of Contact Relations",
      card_type: "formula",
      body: "The chord of contact section lists its equation plus length, triangle area, tangent angle, and circumcircle.",
      formulas: [
        { latex: "T=0" },
        { latex: "\\text{length}=\\frac{2LR}{\\sqrt{R^2+L^2}}" },
        { latex: "\\text{area}=\\frac{RL^3}{R^2+L^2}" },
        { latex: "\\tan\\theta=\\frac{2RL}{L^2-R^2}" },
        { latex: "(x-x_1)(x+g)+(y-y_1)(y+f)=0" },
      ],
      variables: [vars.theta],
      conditions: ["The area is for the triangle formed by the pair of tangents and its chord of contact."],
      importance: 4,
      source_page: 4,
      sort_order: 4,
    }),
    card(chapterId, "orthogonal-radical-family", {
      title: "Orthogonal Circles, Radical Axis and Family",
      card_type: "formula",
      body: "The final Circle entries give orthogonality, radical axis, and two family forms.",
      formulas: [
        { latex: "2g_1g_2+2f_1f_2=c_1+c_2" },
        { latex: "S_1-S_2=0" },
        { latex: "2(g_1-g_2)x+2(f_1-f_2)y+(c_1-c_2)=0" },
        { latex: "S_1+KS_2=0" },
        { latex: "S+KL=0" },
      ],
      variables: [],
      conditions: [],
      importance: 5,
      source_page: 4,
      sort_order: 5,
    }),
  ];
}

function parabolaCards(chapterId) {
  return [
    card(chapterId, "standard-geometry", {
      title: "Standard Parabola Geometry",
      card_type: "mixed",
      body: "The source defines the standard parabola and its vertex, focus, directrix, axis, and latus rectum.",
      formulas: [
        { latex: "y^2=4ax" },
        { latex: "\\text{vertex}=(0,0)" },
        { latex: "\\text{focus}=(a,0)" },
        { latex: "\\text{directrix}:x+a=0" },
        { latex: "\\text{axis}:y=0" },
        { latex: "\\text{latus rectum}=4a" },
        { latex: "L(a,2a),\\quad L'(a,-2a)" },
      ],
      variables: [vars.a],
      conditions: [],
      diagram_data: { type: "math-parabola-standard" },
      importance: 5,
      source_page: 5,
      sort_order: 1,
    }),
    card(chapterId, "parametric-tangents", {
      title: "Parametric Representation and Tangents",
      card_type: "formula",
      body: "The source lists parametrisation and three tangent forms for $y^2=4ax$.",
      formulas: [
        { latex: "x=at^2,\\quad y=2at" },
        { latex: "y=mx+\\frac{a}{m},\\quad m\\ne0" },
        { latex: "ty=x+at^2" },
        { latex: "T=0" },
      ],
      variables: [vars.a, vars.m],
      conditions: [],
      importance: 5,
      source_page: 5,
      sort_order: 2,
    }),
    card(chapterId, "normal-forms", {
      title: "Normal Forms",
      card_type: "formula",
      body: "Normals to $y^2=4ax$ are given at a point, by slope, and in parametric form.",
      formulas: [
        { latex: "y-y_1=-\\frac{y_1}{2a}(x-x_1)" },
        { latex: "y=mx-2am-am^3\\quad\\text{at }(am^2,-2am)" },
        { latex: "y+tx=2at+at^3\\quad\\text{at }(at^2,2at)" },
      ],
      variables: [vars.a, vars.m],
      conditions: [],
      importance: 5,
      source_page: 5,
      sort_order: 3,
    }),
  ];
}

function ellipseCards(chapterId) {
  return [
    card(chapterId, "standard-geometry", {
      title: "Standard Ellipse Geometry",
      card_type: "mixed",
      body: "The source gives the standard ellipse, eccentricity, directrices, foci, axes, vertices, and latus rectum.",
      formulas: [
        { latex: "\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1,\\quad a>b" },
        { latex: "b^2=a^2(1-e^2)" },
        { latex: "e=\\sqrt{1-\\frac{b^2}{a^2}},\\quad 0<e<1" },
        { latex: "x=\\pm\\frac{a}{e}" },
        { latex: "S=(\\pm ae,0)" },
        { latex: "\\text{major axis}=2a,\\quad \\text{minor axis}=2b" },
        { latex: "A'=(-a,0),\\quad A=(a,0)" },
        { latex: "\\ell=\\frac{2b^2}{a}=2a(1-e^2)" },
      ],
      variables: [vars.a, vars.b, vars.e],
      conditions: [],
      diagram_data: { type: "math-ellipse-standard" },
      importance: 5,
      source_page: 5,
      sort_order: 1,
    }),
    card(chapterId, "auxiliary-parametric-position", {
      title: "Auxiliary Circle, Parametric Form and Position",
      card_type: "formula",
      body: "The source lists auxiliary circle, parametric representation, and point position test.",
      formulas: [
        { latex: "x^2+y^2=a^2" },
        { latex: "x=a\\cos\\theta,\\quad y=b\\sin\\theta" },
        { latex: "\\frac{x_1^2}{a^2}+\\frac{y_1^2}{b^2}-1\\gtrless 0" },
      ],
      variables: [vars.a, vars.b, vars.theta],
      conditions: ["The point lies outside, inside, or on the ellipse according as the expression is $>$, $<$, or $=0$."],
      importance: 5,
      source_page: 5,
      sort_order: 2,
    }),
    card(chapterId, "line-intersection-tangents", {
      title: "Line Intersection and Tangents",
      card_type: "formula",
      body: "The source gives the line-ellipse intersection condition and tangent forms.",
      formulas: [
        { latex: "y=mx+c\\text{ meets in real, coincident, or imaginary points as }c^2<,=,>a^2m^2+b^2" },
        { latex: "y=mx\\pm\\sqrt{a^2m^2+b^2}" },
        { latex: "\\frac{xx_1}{a^2}+\\frac{yy_1}{b^2}=1" },
        { latex: "\\frac{x\\cos\\theta}{a}+\\frac{y\\sin\\theta}{b}=1" },
      ],
      variables: [vars.a, vars.b, vars.m, vars.theta],
      conditions: ["The line condition is for $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$."],
      importance: 5,
      source_page: 6,
      sort_order: 3,
    }),
    card(chapterId, "normals-director", {
      title: "Normals and Director Circle",
      card_type: "formula",
      body: "The source closes Ellipse with normal forms and director circle.",
      formulas: [
        { latex: "\\frac{a^2x}{x_1}-\\frac{b^2y}{y_1}=a^2-b^2" },
        { latex: "ax\\sec\\theta-by\\csc\\theta=a^2-b^2" },
        { latex: "y=mx-\\frac{(a^2-b^2)m}{\\sqrt{a^2+b^2m^2}}" },
        { latex: "x^2+y^2=a^2+b^2" },
      ],
      variables: [vars.a, vars.b, vars.m, vars.theta],
      conditions: [],
      importance: 5,
      source_page: 6,
      sort_order: 4,
    }),
  ];
}

function hyperbolaCards(chapterId) {
  return [
    card(chapterId, "standard-geometry", {
      title: "Standard Hyperbola Geometry",
      card_type: "mixed",
      body: "The source gives the standard hyperbola and its core geometry.",
      formulas: [
        { latex: "\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1" },
        { latex: "b^2=a^2(e^2-1)" },
        { latex: "S=(\\pm ae,0)" },
        { latex: "x=\\pm\\frac{a}{e}" },
        { latex: "A=(\\pm a,0)" },
        { latex: "\\ell=\\frac{2b^2}{a}=2a(e^2-1)" },
      ],
      variables: [vars.a, vars.b, vars.e],
      conditions: [],
      diagram_data: { type: "math-hyperbola-standard" },
      importance: 5,
      source_page: 6,
      sort_order: 1,
    }),
    card(chapterId, "conjugate-aux-parametric-position", {
      title: "Conjugate, Auxiliary Circle, Parametric Form and Position",
      card_type: "formula",
      body: "The source groups conjugate hyperbola, auxiliary circle, parametric representation, and point position test.",
      formulas: [
        { latex: "\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1\\quad\\text{and}\\quad -\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1" },
        { latex: "x^2+y^2=a^2" },
        { latex: "x=a\\sec\\theta,\\quad y=b\\tan\\theta" },
        { latex: "S_1=\\frac{x_1^2}{a^2}-\\frac{y_1^2}{b^2}-1" },
      ],
      variables: [vars.a, vars.b, vars.theta],
      conditions: ["$S_1>,=,<0$ according as the point lies inside, on, or outside the curve."],
      table_data: {
        columns: ["Item", "Formula"],
        rows: [
          ["Conjugate pair", "$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$, $-\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$"],
          ["Auxiliary circle", "$x^2+y^2=a^2$"],
          ["Parametric form", "$x=a\\sec\\theta$, $y=b\\tan\\theta$"],
          ["Position expression", "$S_1=\\frac{x_1^2}{a^2}-\\frac{y_1^2}{b^2}-1$"],
        ],
      },
      importance: 4,
      source_page: 6,
      sort_order: 2,
    }),
    card(chapterId, "tangent-forms", {
      title: "Tangent Forms",
      card_type: "formula",
      body: "The handbook gives slope, point, and parametric tangent forms for the standard hyperbola.",
      formulas: [
        { latex: "y=mx\\pm\\sqrt{a^2m^2-b^2}" },
        { latex: "\\frac{xx_1}{a^2}-\\frac{yy_1}{b^2}=1" },
        { latex: "\\frac{x\\sec\\theta}{a}-\\frac{y\\tan\\theta}{b}=1" },
      ],
      variables: [vars.a, vars.b, vars.m, vars.theta],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 3,
    }),
    card(chapterId, "normal-forms", {
      title: "Normal Forms",
      card_type: "formula",
      body: "The source lists normal equations at a point, at parametric point, and in slope form.",
      formulas: [
        { latex: "\\frac{a^2x}{x_1}+\\frac{b^2y}{y_1}=a^2+b^2=a^2e^2" },
        { latex: "\\frac{ax}{\\sec\\theta}+\\frac{by}{\\tan\\theta}=a^2+b^2=a^2e^2" },
        { latex: "y=mx\\pm\\frac{(a^2+b^2)m}{\\sqrt{a^2-b^2m^2}}" },
      ],
      variables: [vars.a, vars.b, vars.m, vars.theta],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 4,
    }),
    card(chapterId, "asymptotes", {
      title: "Asymptotes",
      card_type: "mixed",
      body: "The source gives the two asymptotes and their pair equation.",
      formulas: [
        { latex: "\\frac{x}{a}+\\frac{y}{b}=0" },
        { latex: "\\frac{x}{a}-\\frac{y}{b}=0" },
        { latex: "\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=0" },
      ],
      variables: [vars.a, vars.b],
      conditions: [],
      diagram_data: { type: "math-hyperbola-asymptotes" },
      importance: 5,
      source_page: 7,
      sort_order: 5,
    }),
    card(chapterId, "rectangular-hyperbola", {
      title: "Rectangular or Equilateral Hyperbola",
      card_type: "mixed",
      body: "The final Hyperbola section gives rectangular hyperbola geometry and tangent/normal formulae.",
      formulas: [
        { latex: "xy=c^2,\\quad e=\\sqrt2" },
        { latex: "\\text{vertices}=(\\pm c,\\pm c)" },
        { latex: "\\text{foci}=(\\pm\\sqrt2c,\\pm\\sqrt2c)" },
        { latex: "x+y=\\pm\\sqrt2c" },
        { latex: "\\ell=2\\sqrt2c=\\text{T.A.}=\\text{C.A.}" },
        { latex: "x=ct,\\quad y=\\frac{c}{t},\\quad t\\in R-\\{0\\}" },
        { latex: "\\frac{x}{x_1}+\\frac{y}{y_1}=2" },
        { latex: "\\frac{x}{t}+ty=2c" },
        { latex: "xt^3-yt=c(t^4-1)" },
        { latex: "kx+hy=2hk" },
      ],
      variables: [],
      conditions: ["$kx+hy=2hk$ is the chord with middle point $(h,k)$."],
      diagram_data: { type: "math-rectangular-hyperbola" },
      importance: 5,
      source_page: 7,
      sort_order: 6,
    }),
  ];
}

const CARD_BUILDERS = {
  "straight-line": straightLineCards,
  circle: circleCards,
  parabola: parabolaCards,
  ellipse: ellipseCards,
  hyperbola: hyperbolaCards,
};

export function getMathBatch1Chapters() {
  return MATH_BATCH_1_CHAPTER_DEFINITIONS.map((item) => ({
    id: chapter(item.slug),
    subject_id: "jee-mathematics",
    title: item.title,
    slug: item.slug,
    sort_order: item.sort_order,
  }));
}

export function getMathBatch1Cards() {
  return MATH_BATCH_1_CHAPTER_DEFINITIONS.flatMap((item) => CARD_BUILDERS[item.slug](chapter(item.slug)));
}
