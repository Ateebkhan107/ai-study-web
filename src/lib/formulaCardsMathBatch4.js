export const MATH_BATCH_4_CHAPTER_DEFINITIONS = [
  { title: "Fundamental of Mathematics", slug: "fundamental-of-mathematics", sort_order: 11 },
  { title: "Quadratic Equation", slug: "quadratic-equation", sort_order: 12 },
  { title: "Sequence & Series", slug: "sequence-and-series", sort_order: 13 },
  { title: "Binomial Theorem", slug: "binomial-theorem", sort_order: 14 },
];

const chapter = (slug) => `jee-mathematics-${slug}`;

const vars = {
  a: { latex: "a", symbol: "$a$", meaning: "constant, endpoint, or first term" },
  b: { latex: "b", symbol: "$b$", meaning: "constant or endpoint" },
  d: { latex: "d", symbol: "$d$", meaning: "common difference" },
  f: { latex: "f", symbol: "$f$", meaning: "function" },
  n: { latex: "n", symbol: "$n$", meaning: "positive integer or index" },
  r: { latex: "r", symbol: "$r$", meaning: "index or common ratio" },
  x: { latex: "x", symbol: "$x$", meaning: "variable" },
  alpha: { latex: "\\alpha", symbol: "$\\alpha$", meaning: "angle or root" },
  beta: { latex: "\\beta", symbol: "$\\beta$", meaning: "angle or root" },
  theta: { latex: "\\theta", symbol: "$\\theta$", meaning: "angle" },
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

function fundamentalsCards(chapterId) {
  return [
    card(chapterId, "interval-types", {
      title: "Finite Interval Types",
      card_type: "table",
      body: "The handbook defines intervals as subsets of $\\mathbb{R}$ used in inequalities and domains.",
      formulas: [],
      variables: [vars.a, vars.b, vars.x],
      conditions: ["The source assumes $a,b\\in\\mathbb{R}$ and $a<b$."],
      table_data: {
        columns: ["Interval", "Set form", "Endpoint note"],
        rows: [
          ["Open", "$(a,b)=\\{x:a<x<b\\}$", "Endpoints not included"],
          ["Closed", "$[a,b]=\\{x:a\\le x\\le b\\}$", "Endpoints included; source notes this is possible only when both $a$ and $b$ are finite"],
          ["Open-closed", "$(a,b]=\\{x:a<x\\le b\\}$", "Left endpoint open, right endpoint closed"],
          ["Closed-open", "$[a,b)=\\{x:a\\le x<b\\}$", "Left endpoint closed, right endpoint open"],
        ],
      },
      importance: 4,
      source_page: 19,
      sort_order: 1,
    }),
    card(chapterId, "infinite-intervals-modulus", {
      title: "Infinite Intervals and Modulus Properties",
      card_type: "table",
      body: "The source continues intervals with infinite endpoints, then lists core modulus properties.",
      formulas: [],
      variables: [vars.a, vars.b, vars.x],
      conditions: ["Modulus properties are stated for $a,b\\in\\mathbb{R}$."],
      table_data: {
        sections: [
          {
            title: "Infinite intervals",
            columns: ["Interval", "Set form"],
            rows: [
              ["$(a,\\infty)$", "$\\{x:x>a\\}$"],
              ["$[a,\\infty)$", "$\\{x:x\\ge a\\}$"],
              ["$(-\\infty,b)$", "$\\{x:x<b\\}$"],
              ["$(-\\infty,b]$", "$\\{x:x\\le b\\}$"],
              ["$(-\\infty,\\infty)$", "$\\{x:x\\in\\mathbb{R}\\}$"],
            ],
          },
          {
            title: "Modulus properties",
            columns: ["Property"],
            rows: [
              ["$|a|\\ge0$"],
              ["$|a|=|-a|$"],
              ["$|a|\\ge a$, $|a|\\ge-a$"],
              ["$|ab|=|a||b|$"],
              ["$\\left|\\frac{a}{b}\\right|=\\frac{|a|}{|b|}$"],
              ["$|a+b|\\le |a|+|b|$"],
              ["$|a-b|\\ge ||a|-|b||$"],
            ],
          },
        ],
      },
      importance: 4,
      source_page: 19,
      sort_order: 2,
    }),
    card(chapterId, "sum-difference-identities", {
      title: "Trig Sum and Difference Identities",
      card_type: "table",
      body: "The first trigonometry block gives sum and difference identities and immediate product forms.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Identity"],
        rows: [
          ["$\\sin(A\\pm B)=\\sin A\\cos B\\pm\\cos A\\sin B$"],
          ["$2\\sin A\\cos B=\\sin(A+B)+\\sin(A-B)$"],
          ["$2\\cos A\\sin B=\\sin(A+B)-\\sin(A-B)$"],
          ["$\\cos(A\\pm B)=\\cos A\\cos B\\mp\\sin A\\sin B$"],
          ["$2\\cos A\\cos B=\\cos(A+B)+\\cos(A-B)$"],
          ["$2\\sin A\\sin B=\\cos(A-B)-\\cos(A+B)$"],
          ["$\\sin^2A-\\sin^2B=\\cos^2B-\\cos^2A=\\sin(A+B)\\sin(A-B)$"],
          ["$\\cos^2A-\\sin^2B=\\cos^2B-\\sin^2A=\\cos(A+B)\\cos(A-B)$"],
          ["$\\cot(A\\pm B)=\\frac{\\cot A\\cot B\\mp1}{\\cot B\\pm\\cot A}$"],
          ["$\\tan(A+B+C)=\\frac{\\tan A+\\tan B+\\tan C-\\tan A\\tan B\\tan C}{1-\\tan A\\tan B-\\tan B\\tan C-\\tan C\\tan A}$"],
        ],
      },
      importance: 5,
      source_page: 19,
      sort_order: 3,
    }),
    card(chapterId, "sum-product-multiple-angle", {
      title: "Sum-Product and Multiple-Angle Identities",
      card_type: "table",
      body: "The next visible block lists sum-to-product formulas and double/triple angle identities.",
      formulas: [],
      variables: [vars.theta],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Sum-to-product",
            columns: ["Identity"],
            rows: [
              ["$\\sin C+\\sin D=2\\sin\\frac{C+D}{2}\\cos\\frac{C-D}{2}$"],
              ["$\\sin C-\\sin D=2\\cos\\frac{C+D}{2}\\sin\\frac{C-D}{2}$"],
              ["$\\cos C+\\cos D=2\\cos\\frac{C+D}{2}\\cos\\frac{C-D}{2}$"],
              ["$\\cos C-\\cos D=-2\\sin\\frac{C+D}{2}\\sin\\frac{C-D}{2}$"],
            ],
          },
          {
            title: "Multiple angles",
            columns: ["Identity"],
            rows: [
              ["$\\cos2A=\\cos^2A-\\sin^2A=2\\cos^2A-1=1-2\\sin^2A$"],
              ["$2\\cos^2\\frac{\\theta}{2}=1+\cos\\theta$, $2\\sin^2\\frac{\\theta}{2}=1-\cos\\theta$"],
              ["$\\sin2A=\\frac{2\\tan A}{1+\tan^2A}$"],
              ["$\\cos2A=\\frac{1-\tan^2A}{1+\tan^2A}$"],
              ["$\\sin3A=3\\sin A-4\\sin^3A$"],
              ["$\\cos3A=4\\cos^3A-3\\cos A$"],
              ["$\\tan3A=\\frac{3\\tan A-\\tan^3A}{1-3\\tan^2A}$"],
            ],
          },
        ],
      },
      importance: 5,
      source_page: 20,
      sort_order: 4,
    }),
    card(chapterId, "important-trig-ratios", {
      title: "Important Trigonometric Ratios",
      card_type: "table",
      body: "The source records selected exact trigonometric values.",
      formulas: [],
      variables: [vars.n],
      conditions: ["The first row is stated for integer $n$."],
      table_data: {
        columns: ["Ratio"],
        rows: [
          ["$\\sin n\\pi=0$, $\\cos n\\pi=\\pm1$, $\\tan n\\pi=0$"],
          ["$\\sin15^\\circ=\\sin\\frac{\\pi}{12}=\\frac{\\sqrt3-1}{2\\sqrt2}=\\cos75^\\circ=\\cos\\frac{5\\pi}{12}$"],
          ["$\\cos15^\\circ=\\cos\\frac{\\pi}{12}=\\frac{\\sqrt3+1}{2\\sqrt2}=\\sin75^\\circ=\\sin\\frac{5\\pi}{12}$"],
          ["$\\tan15^\\circ=\\frac{\\sqrt3-1}{\\sqrt3+1}=2-\\sqrt3=\\cot75^\\circ$"],
          ["$\\tan75^\\circ=\\frac{\\sqrt3+1}{\\sqrt3-1}=2+\\sqrt3=\\cot15^\\circ$"],
          ["$\\sin18^\\circ=\\sin\\frac{\\pi}{10}=\\frac{\\sqrt5-1}{4}$"],
          ["$\\cos36^\\circ=\\cos\\frac{\\pi}{5}=\\frac{\\sqrt5+1}{4}$"],
        ],
      },
      importance: 4,
      source_page: 20,
      sort_order: 5,
    }),
    card(chapterId, "trig-range-series", {
      title: "Trig Expression Range and Series",
      card_type: "table",
      body: "The source gives the range of $a\\sin\\theta+b\\cos\\theta$ and finite sine/cosine series.",
      formulas: [],
      variables: [vars.a, vars.b, vars.n, vars.theta],
      conditions: [],
      table_data: {
        columns: ["Result", "Formula"],
        rows: [
          ["Range", "$-\\sqrt{a^2+b^2}\\le a\\sin\\theta+b\\cos\\theta\\le\\sqrt{a^2+b^2}$"],
          ["Sine series", "$\\sin\\alpha+\\sin(\\alpha+\\beta)+\\cdots+\\sin(\\alpha+(n-1)\\beta)=\\frac{\\sin\\frac{n\\beta}{2}}{\\sin\\frac{\\beta}{2}}\\sin\\left(\\alpha+\\frac{n-1}{2}\\beta\\right)$"],
          ["Cosine series", "$\\cos\\alpha+\\cos(\\alpha+\\beta)+\\cdots+\\cos(\\alpha+(n-1)\\beta)=\\frac{\\sin\\frac{n\\beta}{2}}{\\sin\\frac{\\beta}{2}}\\cos\\left(\\alpha+\\frac{n-1}{2}\\beta\\right)$"],
        ],
      },
      importance: 5,
      source_page: 21,
      sort_order: 6,
    }),
    card(chapterId, "trigonometric-equations", {
      title: "General Solutions of Trig Equations",
      card_type: "table",
      body: "Principal solutions are defined as solutions lying in $[0,2\\pi)$, followed by general solutions.",
      formulas: [],
      variables: [vars.alpha, vars.theta, vars.n],
      conditions: [],
      table_data: {
        columns: ["Equation", "General solution"],
        rows: [
          ["$\\sin\\theta=\\sin\\alpha$", "$\\theta=n\\pi+(-1)^n\\alpha$, $\\alpha\\in\\left[-\\frac{\\pi}{2},\\frac{\\pi}{2}\\right]$, $n\\in\\mathbb{I}$"],
          ["$\\cos\\theta=\\cos\\alpha$", "$\\theta=2n\\pi\\pm\\alpha$, $\\alpha\\in[0,\\pi]$, $n\\in\\mathbb{I}$"],
          ["$\\tan\\theta=\\tan\\alpha$", "$\\theta=n\\pi+\\alpha$, $\\alpha\\in\\left(-\\frac{\\pi}{2},\\frac{\\pi}{2}\\right)$, $n\\in\\mathbb{I}$"],
          ["$\\sin^2\\theta=\\sin^2\\alpha$, $\\cos^2\\theta=\\cos^2\\alpha$, $\\tan^2\\theta=\\tan^2\\alpha$", "$\\theta=n\\pi\\pm\\alpha$"],
        ],
      },
      importance: 5,
      source_page: 21,
      sort_order: 7,
    }),
  ];
}

function quadraticCards(chapterId) {
  return [
    card(chapterId, "standard-form-roots", {
      title: "Quadratic Equation, Formula and Roots",
      card_type: "mixed",
      body: "The source begins with the standard quadratic equation, discriminant, and root relations.",
      formulas: [
        { latex: "ax^2+bx+c=0,\\ a\\ne0" },
        { latex: "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" },
        { latex: "D\\equiv b^2-4ac" },
        { latex: "\\alpha+\\beta=-\\frac{b}{a},\\quad \\alpha\\beta=\\frac{c}{a}" },
        { latex: "(x-\\alpha)(x-\\beta)=0\\Rightarrow x^2-(\\alpha+\\beta)x+\\alpha\\beta=0" },
      ],
      variables: [vars.alpha, vars.beta],
      conditions: ["$D$ is called the discriminant of the quadratic equation."],
      importance: 5,
      source_page: 22,
      sort_order: 1,
    }),
    card(chapterId, "nature-of-roots", {
      title: "Nature of Roots",
      card_type: "table",
      body: "The handbook presents root nature as a decision tree based on $D$ and coefficient sets.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Condition", "Nature of roots"],
        rows: [
          ["$D=0$", "Roots are equal, $\\alpha=\\beta=-\\frac{b}{2a}$"],
          ["$a,b,c\\in\\mathbb{R}$ and $D>0$", "Roots are real"],
          ["$a,b,c\\in\\mathbb{R}$ and $D<0$", "Roots are imaginary, $\\alpha=p+iq$, $\\beta=p-iq$"],
          ["$a,b,c\\in\\mathbb{Q}$ and $D$ is a perfect square", "Roots are rational"],
          ["$a,b,c\\in\\mathbb{Q}$ and $D$ is not a perfect square", "Roots are irrational, $\\alpha=p+\\sqrt q$, $\\beta=p-\\sqrt q$"],
          ["$a=1$, $b,c\\in\\mathbb{I}$ and $D$ is a perfect square", "Roots are integral"],
        ],
      },
      importance: 5,
      source_page: 22,
      sort_order: 2,
    }),
    card(chapterId, "common-roots", {
      title: "Common Roots of Two Quadratics",
      card_type: "formula",
      body: "The common-root conditions compare $a_1x^2+b_1x+c_1=0$ and $a_2x^2+b_2x+c_2=0$.",
      formulas: [
        { latex: "\\frac{a_1}{a_2}=\\frac{b_1}{b_2}=\\frac{c_1}{c_2}" },
        { latex: "\\alpha=\\frac{c_1a_2-c_2a_1}{a_1b_2-a_2b_1}=\\frac{b_1c_2-b_2c_1}{c_1a_2-c_2a_1}" },
      ],
      variables: [vars.alpha],
      conditions: ["The first formula is for both roots common.", "The second formula is for only one common root $\\alpha$."],
      importance: 4,
      source_page: 23,
      sort_order: 3,
    }),
    card(chapterId, "restricted-range", {
      title: "Restricted-Domain Range of a Quadratic",
      card_type: "table",
      body: "For $f(x)=ax^2+bx+c$ and $x\\in[x_1,x_2]$, the source uses whether the vertex abscissa lies inside the interval.",
      formulas: [],
      variables: [vars.f, vars.x],
      conditions: ["$D=b^2-4ac$."],
      table_data: {
        columns: ["Condition", "Range"],
        rows: [
          ["$-\\frac{b}{2a}\\notin[x_1,x_2]$", "$f(x)\\in[\\min\\{f(x_1),f(x_2)\\},\\max\\{f(x_1),f(x_2)\\}]$"],
          ["$-\\frac{b}{2a}\\in[x_1,x_2]$", "$f(x)\\in\\left[\\min\\left\\{f(x_1),f(x_2),-\\frac{D}{4a}\\right\\},\\max\\left\\{f(x_1),f(x_2),-\\frac{D}{4a}\\right\\}\\right]$"],
        ],
      },
      importance: 5,
      source_page: 23,
      sort_order: 4,
    }),
    card(chapterId, "root-location-conditions", {
      title: "Root Location Conditions",
      card_type: "table",
      body: "The source states these conditions for $f(x)=ax^2+bx+c$ where $a>0$ and $a,b,c\\in\\mathbb{R}$.",
      formulas: [],
      variables: [vars.f, vars.x],
      conditions: ["All rows use $f(x)=0$."],
      table_data: {
        columns: ["Root location", "Condition"],
        rows: [
          ["Both roots greater than $x_0$", "$b^2-4ac\\ge0$, $f(x_0)>0$, and $-\\frac{b}{2a}>x_0$"],
          ["Both roots smaller than $x_0$", "$b^2-4ac\\ge0$, $f(x_0)>0$, and $-\\frac{b}{2a}<x_0$"],
          ["Roots on either side of $x_0$", "$f(x_0)<0$"],
          ["Both roots confined between $x_1$ and $x_2$, $x_1<x_2$", "$b^2-4ac\\ge0$, $f(x_1)>0$, $f(x_2)>0$, and $x_1<-\\frac{b}{2a}<x_2$"],
          ["Exactly one root in $(x_1,x_2)$", "$f(x_1)f(x_2)<0$"],
        ],
      },
      importance: 5,
      source_page: 24,
      sort_order: 5,
    }),
  ];
}

function sequenceCards(chapterId) {
  return [
    card(chapterId, "ap-terms-sum", {
      title: "Arithmetic Progression: Term and Sum",
      card_type: "formula",
      body: "The source defines an A.P. using first term $a$ and common difference $d$.",
      formulas: [
        { latex: "a,\\ a+d,\\ a+2d,\\ldots,\\ a+(n-1)d" },
        { latex: "t_n=a+(n-1)d" },
        { latex: "S_n=\\frac{n}{2}[2a+(n-1)d]=\\frac{n}{2}[a+\\ell]" },
        { latex: "t_r=S_r-S_{r-1}" },
      ],
      variables: [vars.a, vars.d, vars.n],
      conditions: ["$\\ell$ denotes the last term in the source sum formula."],
      importance: 5,
      source_page: 24,
      sort_order: 1,
    }),
    card(chapterId, "ap-properties-am", {
      title: "A.P. Properties and Arithmetic Means",
      card_type: "table",
      body: "The source lists common A.P. properties and the formula for $n$ arithmetic means.",
      formulas: [],
      variables: [vars.a, vars.b, vars.d, vars.n],
      conditions: [],
      table_data: {
        columns: ["Topic", "Result"],
        rows: [
          ["Three terms in A.P.", "$a,b,c$ in A.P. $\\Rightarrow 2b=a+c$"],
          ["Four terms in A.P.", "$a,b,c,d$ in A.P. $\\Rightarrow a+d=b+c$"],
          ["Odd/even choices", "Three numbers: $a-d,a,a+d$; four: $a-3d,a-d,a+d,a+3d$; five: $a-2d,a-d,a,a+d,a+2d$"],
          ["Equidistant terms", "Sum of terms equidistant from beginning and end equals sum of first and last term."],
          ["Arithmetic mean", "If $a,b,c$ are in A.P., $b$ is A.M. of $a$ and $c$."],
          ["$n$ A.M.s", "$A_1=a+\\frac{b-a}{n+1}$, $A_2=a+\\frac{2(b-a)}{n+1}$, $\\ldots$, $A_n=a+\\frac{n(b-a)}{n+1}$"],
          ["Sum of $n$ A.M.s", "$\\sum_{r=1}^{n}A_r=nA$, where $A$ is the single A.M. between $a$ and $b$"],
        ],
      },
      importance: 5,
      source_page: 25,
      sort_order: 2,
    }),
    card(chapterId, "gp-terms-sums", {
      title: "Geometric Progression: Term and Sums",
      card_type: "formula",
      body: "The source defines a G.P. using first term $a$ and common ratio $r$.",
      formulas: [
        { latex: "a,\\ ar,\\ ar^2,\\ ar^3,\\ldots" },
        { latex: "t_n=ar^{n-1}" },
        { latex: "S_n=\\begin{cases}\\frac{a(r^n-1)}{r-1},&r\\ne1\\\\na,&r=1\\end{cases}" },
        { latex: "S_\\infty=\\frac{a}{1-r},\\quad |r|<1" },
      ],
      variables: [vars.a, vars.r, vars.n],
      conditions: [],
      importance: 5,
      source_page: 25,
      sort_order: 3,
    }),
    card(chapterId, "gm-hm-relations", {
      title: "Geometric and Harmonic Means",
      card_type: "table",
      body: "The source gives G.M., $n$ geometric means, H.M., and AM-GM-HM relations.",
      formulas: [],
      variables: [vars.a, vars.b, vars.n],
      conditions: ["The G.M. rows use positive numbers as stated in the source."],
      table_data: {
        columns: ["Topic", "Formula"],
        rows: [
          ["G.M. of $a$ and $c$", "If $a,b,c>0$ are in G.P., then $b^2=ac$"],
          ["$n$ G.M.s", "$G_1=a\\left(\\frac{b}{a}\\right)^{1/(n+1)}$, $G_2=a\\left(\\frac{b}{a}\\right)^{2/(n+1)}$, $\\ldots$, $G_n=a\\left(\\frac{b}{a}\\right)^{n/(n+1)}$"],
          ["H.M. of $a$ and $c$", "$b=\\frac{2ac}{a+c}$"],
          ["H.M. of $a_1,a_2,\\ldots,a_n$", "$\\frac{1}{H}=\\frac{1}{n}\\left[\\frac{1}{a_1}+\\frac{1}{a_2}+\\cdots+\\frac{1}{a_n}\\right]$"],
          ["Two-number relation", "$G^2=AH$, $A.M.\\ge G.M.\\ge H.M.$"],
          ["Equality", "$A.M.=G.M.=H.M.$ if $a_1=a_2=a_3=\\cdots=a_n$"],
        ],
      },
      importance: 5,
      source_page: 25,
      sort_order: 4,
    }),
    card(chapterId, "summation-properties", {
      title: "Summation Properties",
      card_type: "table",
      body: "The important results begin with linearity and constants under summation.",
      formulas: [],
      variables: [vars.n, vars.r],
      conditions: ["$k$ is a constant in the source."],
      table_data: {
        columns: ["Property"],
        rows: [
          ["$\\sum_{r=1}^{n}(a_r\\pm b_r)=\\sum_{r=1}^{n}a_r\\pm\\sum_{r=1}^{n}b_r$"],
          ["$\\sum_{r=1}^{n}ka_r=k\\sum_{r=1}^{n}a_r$"],
          ["$\\sum_{r=1}^{n}k=nk$"],
        ],
      },
      importance: 4,
      source_page: 26,
      sort_order: 5,
    }),
    card(chapterId, "standard-power-sums", {
      title: "Standard Sums of $r$, $r^2$, and $r^3$",
      card_type: "table",
      body: "The source lists the first three standard power sums.",
      formulas: [],
      variables: [vars.n, vars.r],
      conditions: [],
      table_data: {
        columns: ["Sum", "Formula"],
        rows: [
          ["$\\sum_{r=1}^{n}r$", "$\\frac{n(n+1)}{2}$"],
          ["$\\sum_{r=1}^{n}r^2$", "$\\frac{n(n+1)(2n+1)}{6}$"],
          ["$\\sum_{r=1}^{n}r^3$", "$\\frac{n^2(n+1)^2}{4}$"],
        ],
      },
      importance: 5,
      source_page: 26,
      sort_order: 6,
    }),
  ];
}

function binomialCards(chapterId) {
  return [
    card(chapterId, "statement-general-term", {
      title: "Binomial Theorem and General Term",
      card_type: "formula",
      body: "The statement is given for $a,b\\in\\mathbb{R}$ and $n\\in\\mathbb{N}$.",
      formulas: [
        { latex: "(a+b)^n={}^{n}C_0a^nb^0+{}^{n}C_1a^{n-1}b^1+{}^{n}C_2a^{n-2}b^2+\\cdots+{}^{n}C_ra^{n-r}b^r+\\cdots+{}^{n}C_na^0b^n" },
        { latex: "(a+b)^n=\\sum_{r=0}^{n}{}^{n}C_ra^{n-r}b^r" },
        { latex: "T_{r+1}={}^{n}C_ra^{n-r}b^r" },
      ],
      variables: [vars.a, vars.b, vars.n, vars.r],
      conditions: [],
      importance: 5,
      source_page: 26,
      sort_order: 1,
    }),
    card(chapterId, "middle-terms", {
      title: "Middle Terms",
      card_type: "table",
      body: "The source separates middle term rules by parity of $n$.",
      formulas: [],
      variables: [vars.n],
      conditions: [],
      table_data: {
        columns: ["Case", "Middle term(s)"],
        rows: [
          ["$n$ even", "Only one middle term: $\\left(\\frac{n+2}{2}\\right)$th term"],
          ["$n$ odd", "Two middle terms: $\\left(\\frac{n+1}{2}\\right)$th and $\\left(\\frac{n+1}{2}+1\\right)$th terms"],
        ],
      },
      importance: 4,
      source_page: 26,
      sort_order: 2,
    }),
    card(chapterId, "multinomial-terms-application", {
      title: "Multinomial Theorem and Application Result",
      card_type: "mixed",
      body: "The next source block gives the multinomial expansion, total number of terms, and a stated application result.",
      formulas: [
        { latex: "(x_1+x_2+x_3+\\cdots+x_k)^n=\\sum_{r_1+r_2+\\cdots+r_k=n}\\frac{n!}{r_1!r_2!\\cdots r_k!}x_1^{r_1}x_2^{r_2}\\cdots x_k^{r_k}" },
        { latex: "\\text{Total number of terms}={}^{n+k-1}C_{k-1}" },
        { latex: "(\\sqrt A+B)^n=I+f" },
        { latex: "0<f<1\\Rightarrow (I+f)f=k^n,\\quad A-B^2=k>0,\\quad \\sqrt A-B<1" },
        { latex: "\\text{If }n\\text{ is even, }(I+f)(1-f)=k^n" },
      ],
      variables: [vars.n],
      conditions: ["In the application result, $I$ and $n$ are positive integers and $n$ is odd before the first conclusion."],
      importance: 4,
      source_page: 27,
      sort_order: 3,
    }),
    card(chapterId, "coefficient-identities", {
      title: "Binomial Coefficient Identities",
      card_type: "table",
      body: "The coefficient properties are stored as a compact formula table.",
      formulas: [],
      variables: [vars.n, vars.r],
      conditions: [],
      table_data: {
        columns: ["Identity"],
        rows: [
          ["${}^{n}C_0+{}^{n}C_1+{}^{n}C_2+\\cdots+{}^{n}C_n=2^n$"],
          ["${}^{n}C_0-{}^{n}C_1+{}^{n}C_2-{}^{n}C_3+\\cdots+(-1)^n{}^{n}C_n=0$"],
          ["${}^{n}C_0+{}^{n}C_2+{}^{n}C_4+\\cdots={}^{n}C_1+{}^{n}C_3+{}^{n}C_5+\\cdots=2^{n-1}$"],
          ["${}^{n}C_r+{}^{n}C_{r-1}={}^{n+1}C_r$"],
          ["$\\frac{{}^{n}C_r}{{}^{n}C_{r-1}}=\\frac{n-r+1}{r}$"],
        ],
      },
      importance: 5,
      source_page: 27,
      sort_order: 4,
    }),
    card(chapterId, "negative-fractional-index", {
      title: "Negative or Fractional Index Expansion",
      card_type: "formula",
      body: "The final binomial block gives the expansion and general term for negative integer or fractional indices.",
      formulas: [
        { latex: "(1+x)^n=1+nx+\\frac{n(n-1)}{2!}x^2+\\frac{n(n-1)(n-2)}{3!}x^3+\\cdots+\\frac{n(n-1)(n-2)\\cdots(n-r+1)}{r!}x^r+\\cdots" },
        { latex: "T_{r+1}=\\frac{n(n-1)(n-2)\\cdots(n-r+1)}{r!}x^r" },
      ],
      variables: [vars.n, vars.r, vars.x],
      conditions: ["The source states $|x|<1$."],
      importance: 5,
      source_page: 27,
      sort_order: 5,
    }),
  ];
}

const CARD_BUILDERS = {
  "fundamental-of-mathematics": fundamentalsCards,
  "quadratic-equation": quadraticCards,
  "sequence-and-series": sequenceCards,
  "binomial-theorem": binomialCards,
};

export function getMathBatch4Chapters() {
  return MATH_BATCH_4_CHAPTER_DEFINITIONS.map((item) => ({
    id: chapter(item.slug),
    subject_id: "jee-mathematics",
    title: item.title,
    slug: item.slug,
    sort_order: item.sort_order,
  }));
}

export function getMathBatch4Cards() {
  return MATH_BATCH_4_CHAPTER_DEFINITIONS.flatMap((item) => CARD_BUILDERS[item.slug](chapter(item.slug)));
}
