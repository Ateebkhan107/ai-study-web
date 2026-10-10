import fs from "node:fs/promises";
import path from "node:path";

const PAPER = "JEE-MAIN-22-30JUL-S2";
const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");
const IMAGE_DIR = path.join("scratch", "jee2022", "images", PAPER);

const chapters = [
  "Units and Measurements", "Motion in A Straight Line", "System of Particles and Rotational Motion", "Laws of Motion", "Gravitation",
  "Mechanical Properties of Solids", "Thermodynamics", "Kinetic Theory", "Oscillations", "Electric Charges and Fields",
  "Current Electricity", "Alternating Current", "Electromagnetic Waves", "Wave Optics", "Moving Charges and Magnetism",
  "Moving Charges and Magnetism", "Atoms", "Semiconductor Electronics", "Dual Nature of Radiation and Matter", "Communication Systems",
  "Nuclei", "Ray Optics and Optical Instruments", "Alternating Current", "Current Electricity", "Electrostatic Potential and Capacitance",
  "Oscillations", "Mechanical Properties of Fluids", "System of Particles and Rotational Motion", "System of Particles and Rotational Motion", "Motion in A Plane",
  "States of Matter", "Structure of Atom", "Thermodynamics", "Surface Chemistry", "Classification of Elements and Periodicity in Properties",
  "General Principles and Processes of Isolation of Elements", "Hydrogen", "Chemical Bonding and Molecular Structure", "Electrochemistry", "Coordination Compounds",
  "Environmental Chemistry", "Alcohols, Phenols and Ethers", "Organic Chemistry - Some Basic Principles and Techniques", "Haloalkanes and Haloarenes", "Haloalkanes and Haloarenes",
  "Amines", "Amines", "Polymers", "Biomolecules", "Coordination Compounds",
  "Solutions", "Chemical Bonding and Molecular Structure", "Solutions", "Equilibrium", "Electrochemistry",
  "Chemical Kinetics", "Chemical Bonding and Molecular Structure", "The d- and f-Block Elements", "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons",
  "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Matrices and Determinants", "Matrices and Determinants", "Permutations and Combinations",
  "Binomial Theorem", "Sequences and Series", "Sequences and Series", "Limits, Continuity and Differentiability", "Continuity and Differentiability",
  "Integrals", "Limits, Continuity and Differentiability", "Differential Equations", "Differential Equations", "Conic Sections",
  "Conic Sections", "Three Dimensional Geometry", "Statistics", "Trigonometric Functions", "Mathematical Reasoning",
  "Complex Numbers and Quadratic Equations", "Binomial Theorem", "Applications of Derivatives", "Applications of Derivatives", "Applications of Integrals",
  "Straight Lines", "Three Dimensional Geometry", "Vector Algebra", "Probability", "Trigonometric Functions",
];

if (chapters.length !== 90) throw new Error(`Expected 90 chapters, found ${chapters.length}`);

const rows = [];
for (const subject of ["physics", "chemistry", "mathematics"]) {
  const file = path.join(TRANSCRIBED, `${PAPER}_${subject}.json`);
  rows.push(...JSON.parse(await fs.readFile(file, "utf8")));
}
rows.sort((left, right) => left.question_number - right.question_number);
if (rows.length !== 90) throw new Error(`Expected 90 questions, found ${rows.length}`);

for (const [index, row] of rows.entries()) {
  const number = index + 1;
  row.paper_code = PAPER;
  row.question_number = number;
  row.source_question_number = number;
  row.subject = number <= 30 ? "Physics" : number <= 60 ? "Chemistry" : "Mathematics";
  row.chapter = chapters[index];
  row.question_image = null;
  for (const letter of ["a", "b", "c", "d"]) row[`option_${letter}_image`] = null;
}

function update(number, values) {
  Object.assign(rows[number - 1], values);
}

update(17, {
  question: "Using Bohr's quantization of angular momentum, the relation between the radius $r$ of the $n^{\text{th}}$ allowed orbit and the quantum number $n$ for an electron in a hydrogen atom is:",
  option_a: "$r \\propto n^{1/2}$",
  option_b: "$r \\propto n^2$",
  option_c: "$r \\propto \\left(\\frac{1}{n}\\right)^2$",
  option_d: "$r \\propto \\left(\\frac{1}{n}\\right)^{1/2}$",
});
update(33, {
  question: "Which of the following is the plot of Gibbs free energy $G$ versus temperature $T$, at constant pressure, for a pure substance?",
  option_a: "", option_b: "", option_c: "", option_d: "",
});
update(35, {
  question: "For the periodic table, which of the following statements are true?\n\nA. Shielding increases as we go down a group.\nB. Shielding increases sharply across a period.\nC. Ionization enthalpy increases down a group.\nD. Metallic character increases down a group.\nE. Electronegativity decreases down a group.",
  option_a: "B, C and E only",
  option_b: "A, D and E only",
  option_c: "A, C, D and E only",
  option_d: "A, D and E only",
  // The official key accepts both 2 and 4 because those printed options are
  // identical. Store the canonical first accepted choice for the single-choice UI.
  correct_option: "b",
});
update(36, {
  question: "Match List I with List II.\n\nList I: A. Cyanide process; B. Froth flotation process; C. Hall-Heroult process; D. Mond process.\n\nList II: I. Vapour-phase refining; II. Aluminium; III. Dressing of $\\mathrm{ZnS}$; IV. Extraction of $\\mathrm{Au}$.",
  option_a: "A-IV, B-III, C-II, D-I",
  option_b: "A-I, B-II, C-III, D-IV",
  option_c: "A-II, B-III, C-IV, D-I",
  option_d: "A-III, B-II, C-IV, D-I",
});
for (const number of [43, 44, 46]) {
  update(number, { option_a: "", option_b: "", option_c: "", option_d: "" });
}
update(43, { question: "Which of the following cyclic species is unstable?" });
update(44, { question: "The major product of the following reaction is:" });
update(46, { question: "Which one of the following compounds can be prepared in good yield by the Hofmann bromamide degradation reaction?" });

update(61, {
  question: "Let $f:\\mathbb{R}\\setminus\\{5\\}\\to\\mathbb{R}$ be defined as $f(x)=\\dfrac{2x^2+3x-2}{x-5}$. Then $f$ is:",
});
update(62, {
  question: "Let $z_1=1+2i$, $z_2=2+i$, $\\dfrac{1}{z_1}+\\dfrac{1}{z_2}=\\dfrac{6}{w}$, and $z=\\dfrac{iw}{2-w}$. Consider the statements:\n\n$(S_1)\\; |z|=\\dfrac{5}{\\sqrt{17}}$\n\n$(S_2)\\; \\arg(z)+\\arg(w)=\\tan^{-1}\\left(\\dfrac{5}{3}\\right)$.",
  option_a: "Both $(S_1)$ and $(S_2)$ are wrong",
  option_b: "Only $(S_1)$ is correct",
  option_c: "Only $(S_2)$ is correct",
  option_d: "Both $(S_1)$ and $(S_2)$ are correct",
});
update(63, {
  question: "If the system of linear equations $\\lambda x+y-z=-1$, $x-y-3z=2$, and $-x+y+z=\\mu$ has infinitely many solutions, then the equation of the line passing through $(\\lambda+2\\mu,2\\lambda+\\mu)$ and $(1,\\lambda\\mu)$ is:",
  option_a: "$4x-6y=-5$", option_b: "$2x-2y=5$", option_c: "$2x-2y=-1$", option_d: "$4x+6y=5$",
});
update(64, {
  question: "Let $A$ be a matrix such that $\\begin{bmatrix}1&2\\\\0&1\\end{bmatrix}A\\begin{bmatrix}2&0\\\\-1&1\\end{bmatrix}=\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$. If $|A|$ and $|A^2|$ are the roots of $ax^2+bx+3=0$, then $a+b-ab$ is equal to:",
  option_a: "$-34$", option_b: "$50$", option_c: "$-390$", option_d: "$438$",
});
update(65, {
  question: "The sum of all values of $n$ for which $\\binom{n-1}{4}-\\binom{n-1}{3}-\\dfrac{5}{4}{}^{n-2}P_2<0$ is:",
});
update(66, {
  question: "The coefficient of $x^{1011}$ in $(1+2x)^{2022}+2x(1+2x)^{2021}+(2x)^2(1+2x)^{2020}+\\cdots+(2x)^{2022}$ is:",
  option_a: "$\\binom{2022}{1011}$",
  option_b: "$\\binom{2022}{1011}2^{1011}$",
  option_c: "$\\binom{2023}{1011}2^{1011}$",
  option_d: "$\\binom{2023}{1011}$",
});
update(67, {
  question: "For $|\\alpha|\\ge 1$, let $5^{4-2\\alpha}$, $63$, and $5^{2\\alpha-1}$ be in A.P. with common difference $d$. Let $S_n$ denote the sum of the first $n$ terms of an A.P. whose first term is $\\alpha^2$ and common difference is $d$. If $S_{30}-S_{15}=30k$, then $k$ is equal to:",
});
update(68, {
  question: "$2\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{n(2n^2+3)}{(n+1)!}$ is equal to:",
  option_a: "$2(e+7)$", option_b: "$2e+1$", option_c: "$2e+9$", option_d: "$2(e+1)$",
});
update(69, {
  question: "Let $f(x)=\\begin{cases}\\dfrac{\\sin(\\alpha x+3x)+\\sin x}{x},&x<0,\\\\2,&x=0,\\\\\\dfrac{(x+6bx^2)^{1/3}-x^{1/3}}{3x^{4/3}},&x>0.\\end{cases}$ The function is continuous at $x=0$. If $(1-k)f\\left(\\dfrac{7}{18}\\right)=ab$, then $k$ is equal to:",
});
update(70, {
  question: "If $y(x)=\\tan x-\\displaystyle\\int_0^{2x}(x^2-xt+1)\\sin t\\,dt$, then at $x=\\dfrac{\\pi}{3}$ the value of $2y'''-y''$ is:",
  option_a: "$158$", option_b: "$159-4\\sqrt{3}$", option_c: "$126$", option_d: "$127-4\\sqrt{3}$",
});
update(71, {
  question: "Let $A_k=\\displaystyle\\int_{k\\pi}^{(k+1)\\pi}e^{-x}\\sin x\\,dx$, $k=0,1,2,\\ldots,20$. Then $\\displaystyle\\sum_{k=0}^{20}|A_k|$ is equal to:",
  option_a: "$\\dfrac{e^\\pi+1}{e^\\pi-1}(1-e^{-20\\pi})$",
  option_b: "$\\dfrac{1}{2}\\dfrac{e^\\pi+1}{e^\\pi-1}(1-e^{-21\\pi})$",
  option_c: "$\\dfrac{e^\\pi+1}{e^\\pi-1}(1-e^{-21\\pi})$",
  option_d: "$\\dfrac{1}{2}\\dfrac{e^\\pi+1}{e^\\pi-1}(1-e^{-20\\pi})$",
});
update(72, {
  question: "$\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{n(n^2+k^2)}{n^4+n^2k^2+k^4}$ is equal to:",
  option_a: "$\\dfrac{\\pi}{\\sqrt{3}}$", option_b: "$\\dfrac{2\\pi}{3\\sqrt{3}}$", option_c: "$\\dfrac{\\pi}{2\\sqrt{3}}$", option_d: "$\\dfrac{\\pi}{3}$",
});
update(73, {
  question: "If $y=y(x)$ satisfies $x\\,dy+\\left(x\\tan\\left(\\dfrac{y}{x}\\right)-y\\right)dx=0$, $x>0$, and $y(1)=\\dfrac{\\pi}{2}$, then a value of $y(\\sqrt{2})$ is:",
  option_a: "$\\dfrac{\\pi}{3\\sqrt{2}}$", option_b: "$\\dfrac{3}{2\\sqrt{2}}$", option_c: "$\\dfrac{1}{2\\sqrt{2}}$", option_d: "$\\dfrac{3\\pi}{2\\sqrt{2}}$",
});
update(74, {
  question: "Let the area enclosed by the solution curve $y=y(x)$ of $\\dfrac{dy}{dx}+\\dfrac{x-2}{y-b}=2$, $b>0$, $y(5)=0$ be $13\\pi$. Let $y=y(x)$ intersect the $y$-axis at points $P$ and $Q$. If the tangents to $y=y(x)$ at $P$ and $Q$ meet at $T$, then the area of $\\triangle PTQ$ is:",
});
update(75, {
  question: "If the foci of the hyperbola $\\dfrac{x^2}{a^2}-\\dfrac{y^2}{12}=1$ and the ellipse $\\dfrac{x^2}{25}+\\dfrac{y^2}{9}=1$ coincide, then the eccentricity of the hyperbola with foci $(0,\\pm\\sqrt{10})$ passing through $(a,a+1)$ is:",
  option_a: "$2$", option_b: "$\\sqrt{2}$", option_c: "$\\dfrac{3}{\\sqrt{5}}$", option_d: "$\\sqrt{\\dfrac{5}{2}}$",
});
update(76, {
  question: "Let the curves $y^2=kx$ and $xy=-1$ have a common tangent whose slope is $\\dfrac{1}{2}$. Then $k$ can NOT lie in the interval:",
  option_a: "$(2,4]$", option_b: "$(-3,-1)$", option_c: "$[-4,-3)$", option_d: "$(1,3)$",
});
update(77, {
  question: "Let $ax+by+cz+3=0$ be the plane that bisects the acute angle between $2x-y-2z+3=0$ and $3x-2y+6z+8=0$. Then $a+b+c$ is equal to:",
  option_a: "$-31$", option_b: "$28$", option_c: "$\\dfrac{14}{15}$", option_d: "$-28$",
});
update(78, {
  question: "For the grouped data shown, if the mean and median are equal, then $xy^2$ is equal to:",
});
update(79, {
  question: "The angle of elevation of the top $P$ of a vertical tower for a person standing at point $A$ on horizontal ground due north of the tower is $45^\\circ$. Another person $B$ is standing $50$ m west of $A$. If the angle of elevation of $P$ at $B$ is $30^\\circ$, then the height of the tower, in metres, is:",
  option_a: "$25\\sqrt{2}$", option_b: "$50\\sqrt{2}$", option_c: "$25\\sqrt{6}$", option_d: "$\\dfrac{50}{\\sqrt{3}-1}$",
});
update(80, {
  question: "Which of the following is a contradiction?",
  option_a: "$((\\sim p)\\lor q)\\Rightarrow\\sim(p\\Rightarrow q)$",
  option_b: "$(\\sim(p\\Rightarrow q))\\land(\\sim p)$",
  option_c: "$(p\\Rightarrow q)\\land p$",
  option_d: "$(\\sim p)\\land(\\sim q)$",
});
update(81, { question: "The number of solutions of $|x^2+3x+2|+|x+5|-2=0$, $x\\in\\mathbb{R}$, is _____." });
update(82, { question: "If $p_1$ and $p_2$, respectively, are the second-largest and fourth-largest prime numbers in the factorization of the coefficient of $x^{30}$ in $\\left(x^2+2+\\dfrac{1}{x^2}\\right)^{-5}(1+x^2)^{40}$, then $p_1+p_2$ is equal to _____." });
update(83, { question: "The number of integral values of $b$ for which $2x^3-3x^2-12x+b=0$ has three distinct real roots is _____." });
update(84, { question: "An air duct is made of a thick metallic sheet and is open at the front and back. Its cross-section is a trapezium with base angles $60^\\circ$ and area $1.5\\,\\text{m}^2$; its length is $1\\,\\text{m}$. If its height $x=x_0$ metres makes the area of metallic sheet used minimum, then $16(x_0)^4$ is equal to _____." });
update(85, { question: "If the area enclosed by the curves $y=x^2$, $y^3=x$, $x=-1$ and $y=x^2$, $y^3=x$, $x=1$, above the line $x=2y$, is $\\dfrac{n}{n+1}$, then $n$ is equal to _____." });
update(86, { question: "Let $A(0,a+2)$, $B(0,a)$, $C(-2,0)$ and $D(2,0)$ be four points, and let $AD$ and $BC$ intersect at $P(x,y)$. If the locus of $P$ is $f(x,y)=0$ and the tangent at $(4,\\gamma)$ is $\\dfrac{x}{\\alpha}+\\dfrac{y}{\\beta}=1$, then $\\alpha(\\beta-\\gamma)$ is equal to _____." });
update(87, { question: "Let $L_1$ be a line in the $yz$-plane with $y$- and $z$-intercepts $\\dfrac14$ and $\\dfrac1C$ $(C>0)$, respectively. Let $L_2$ be a line in the $xz$-plane with $x$- and $z$-intercepts $\\dfrac13$ and $-\\dfrac1C$, respectively. If the shortest distance between $L_1$ and $L_2$ is $\\dfrac15$, then $C^2$ is equal to _____." });
update(88, { question: "Let $OABC$ be a parallelogram, with $O$ the origin, $A(2,4,-5)$ and $C(b,2,3)$. If $P(a,a,a)$ and $Q(9-a^2,3,a-1)$, $a\\in\\mathbb{N}$, are such that the projection of $\\overrightarrow{OP}$ on $\\overrightarrow{OB}$ is $2$ and $\\overrightarrow{OQ}$ makes acute angles with all three coordinate axes, then $|\\overrightarrow{OB}|^2+|\\overrightarrow{AC}|^2$ is equal to _____." });
update(89, { question: "The probability distribution of a random variable $X$ is $P(X=i)=\\dfrac{1}{2^i}$, $i=1,2,3,\\ldots$. The variance of $X$ is equal to _____." });
update(90, { question: "Let $S=\\left\\{\\theta\\in[0,2\\pi]\\setminus\\left(\\dfrac{\\pi}{2},\\dfrac{3\\pi}{2}\\right):\\sin^{-1}(\\sin\\theta)+\\cos^{-1}(\\cos\\theta)+\\tan^{-1}(\\tan\\theta)=\\dfrac{4\\pi}{5}\\right\\}$. Then $\\dfrac{30}{\\pi}\\displaystyle\\sum_{\\theta\\in S}\\theta$ is equal to _____." });

for (const number of [6, 11, 16, 18, 25, 44, 60, 78, 84]) {
  update(number, { question_image: path.join(IMAGE_DIR, `q${number}.png`) });
}
for (const number of [33, 43, 44, 46]) {
  for (const letter of ["a", "b", "c", "d"]) {
    rows[number - 1][`option_${letter}_image`] = path.join(IMAGE_DIR, `q${number}_opt_${letter}.png`);
  }
}

for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
  const file = path.join(TRANSCRIBED, `${PAPER}_${subject.toLowerCase()}.json`);
  await fs.writeFile(file, `${JSON.stringify(rows.filter((row) => row.subject === subject), null, 2)}\n`);
}

console.log(JSON.stringify({ paper_code: PAPER, questions: rows.length, chapters: new Set(rows.map((row) => row.chapter)).size }));
