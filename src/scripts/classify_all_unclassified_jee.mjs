import process from "node:process";
import fs from "node:fs/promises";
import { NCERT_CHAPTERS } from "./test_jee_ncert_classifier.mjs";

const MATHS_RULES = [
  ["Application of Integrals", ["area of the region", "area of region", "area bounded", "area enclosed", "area under", "bounded by the curves", "bounded by the curve", "1 + x^2 \\le y", "region enclosed"]],
  ["Straight Lines", ["rhombus", "interior region between the lines", "parallel to the line", "line passes through", "slope of the line", "vertices of a triangle", "foot of perpendicular from", "image of the point with respect to the line", "centroid", "orthocentre", "circumcentre", "triangle abc", "vertices a(", "lines l1 and l2", "pair of lines", "line 3x", "line 7x", "line x +", "line 2x", "intercepts on axes"]],
  ["Three Dimensional Geometry", ["image of the point in the line", "line \\frac{x", "line \\frac{x-", "shortest distance between", "skew lines", "equation of the plane", "plane passing through", "direction ratios", "direction cosines", "perpendicular from point to plane", "coplanar lines", "z-axis", "x-axis", "y-axis", "distance of point from the plane", "symmetric form of line", "intersecting in 3d", "plane contains the line"]],
  ["Relations and Functions – II", ["relation on", "relation r", "reflexive", "symmetric", "transitive", "equivalence relation", "equivalence class", "one-one", "onto", "bijective", "injective", "surjective", "composite function", "fog(", "gof(", "inverse of the function", "f(g(x))", "binary operation", "number of reflexive relations", "is divisible by 5", "ad - bc"]],
  ["Relations and Functions – I", ["domain of the function", "range of the function", "greatest integer function", "fractional part function", "signum function", "modulus function", "real function", "domain of f", "range of f", "f(x) =", "f: \\mathbb{r}", "[x]", "{x}"]],
  ["Binomial Theorem", ["expansion of", "coefficient of four consecutive", "remainder when", "divided by", "binomial coefficient", "middle term", "term independent of x", "coefficient of x^", "multinomial", "(1 + x)^n", "64^{32", "{}^n\\mathrm{c}_r", "{}^nc_r"]],
  ["Permutations and Combinations", ["number of ways", "number of arrangements", "number of 4 digit", "number of 5 digit", "formed using the digits", "circular permutation", "distribution of distinct", "derangement", "number of integral solutions", "divides 60!", "40^n divides", "divisible by", "selection of", "n!", "factorial", "combination"]],
  ["Trigonometric Functions", ["\\tan a", "\\tan b", "\\tan c", "\\cos 2\\theta", "\\sin 2x", "number of solutions of the equation", "trigonometric equation", "\\sin x", "\\cos x", "\\tan x", "\\sec x", "\\csc x", "\\cot x", "\\sin^2", "\\cos^2", "\\cos\\frac{", "\\sin\\frac{", "\\tan\\theta", "\\cos\\theta", "\\sin\\theta"]],
  ["Differential Equations", ["differential equation", "order and degree", "variable separable", "homogeneous differential", "linear differential", "integrating factor", "dy/dx", "\\frac{dy}{dx}", "solution curve", "y(0) =", "y(1) =", "y' +", "orthogonal trajectory"]],
  ["Conic Sections", ["parabola", "ellipse", "hyperbola", "circle", "eccentricity", "focus", "directrix", "latus rectum", "tangent to the parabola", "tangent to the ellipse", "tangent to the hyperbola", "equation of circle", "radius of circle", "chord of contact", "director circle", "x^2 + y^2 ="]],
  ["Statistics", ["mean deviation", "variance of observations", "standard deviation", "coefficient of variation", "sum of squares of", "mean of observations", "variance of 10", "variance of 20", "median"]],
  ["Probability – II", ["conditional probability", "bayes' theorem", "random variable", "probability distribution", "expected value", "variance of random", "bernoulli", "binomial distribution", "p(x = r)", "p(a|b)"]],
  ["Probability – I", ["probability that", "probability of getting", "sample space", "mutually exclusive", "exhaustive", "pack of 52 cards", "rolling a dice", "tossing a coin", "defective", "box contains", "balls are drawn", "drawn at random"]],
  ["Mathematical Reasoning", ["negation of", "contrapositive", "converse", "tautology", "fallacy", "truth table", "p \\implies q", "p \\land q", "p \\lor q", "biconditional", "logically equivalent"]],
  ["Complex Numbers and Quadratic Equations", ["complex number", "imaginary part", "real part", "modulus of complex", "argument of complex", "arg(z)", "conjugate", "roots of unity", "cube roots", "\\omega", "quadratic equation", "roots of the quadratic", "discriminant", "sum and product of roots", "nature of roots", "common root", "location of roots", "z \\in \\mathbb{c}", "|z|", "|z -"]],
  ["Principle of Mathematical Induction", ["mathematical induction", "p(n) is true", "principle of induction"]],
  ["Inverse Trigonometric Functions", ["\\sin^{-1}", "\\cos^{-1}", "\\tan^{-1}", "\\sec^{-1}", "\\csc^{-1}", "\\cot^{-1}", "arcsin", "arccos", "arctan", "principal value branch", "domain of \\sin^{-1}"]],
  ["Matrices", ["matrix", "matrices", "\\mathrm{adj}", "adj\\,(a)", "adj(a)", "trace of matrix", "symmetric matrix", "skew-symmetric", "orthogonal matrix", "inverse of matrix", "idempotent", "nilpotent", "involutory", "matrix multiplication", "transpose", "eigenvalues", "3 \\times 3", "2 \\times 2", "a^2 -"]],
  ["Determinants", ["\\mathrm{det}", "det\\,(a)", "det(a)", "determinant", "cramer's rule", "system of linear equations", "infinitely many solutions", "non-trivial solution", "trivial solution", "inconsistent system", "minors and cofactors", "properties of determinants", "unique solution"]],
  ["Continuity and Differentiability", ["continuous function", "points of discontinuity", "is continuous at", "is differentiable at", "differentiability", "derivative of composite", "chain rule", "logarithmic differentiation", "derivative of implicit", "derivative of parametric", "second order derivative", "d^2y/dx^2", "\\frac{d^2y}{dx^2}", "f'(x) =", "f''(x)"]],
  ["Limits and Derivatives", ["\\lim_{x \\to", "\\lim_{x\\to", "\\lim_{t \\to", "\\lim_{n \\to", "l'hopital", "l'hospital", "first principle of derivative", "indeterminate form", "sandwich theorem", "squeeze theorem", "limit as"]],
  ["Application of Derivatives", ["local maximum", "local minimum", "tangent to the curve", "normal to the curve", "slope of tangent", "equation of tangent", "equation of normal", "strictly increasing", "strictly decreasing", "monotonic function", "rate of change", "lagrange's mean value", "lmvt", "rolle's theorem", "point of inflection", "critical point", "maximum value of f", "minimum value of f", "maximum value of", "minimum value of"]],
  ["Integrals", ["definite integral", "indefinite integral", "integration by parts", "integration by substitution", "properties of definite integrals", "king's property", "leibniz rule", "limit of sum", "wallis formula", "definite integration", "\\int", "integral", "value of the integral"]],
  ["Vector Algebra", ["vector", "vectors", "dot product", "cross product", "scalar triple product", "box product", "vector triple product", "coplanar vectors", "magnitude of vector", "unit vector", "projection of vector", "\\vec{a}", "\\vec{b}", "\\vec{c}", "\\hat{i}", "\\hat{j}", "\\hat{k}", "position vector"]],
  ["Sequences and Series", ["arithmetic progression", "geometric progression", "arithmetico-geometric", "harmonic progression", "ap", "gp", "agp", "n-th term", "sum of first n", "sum to infinity", "arithmetic mean", "geometric mean", "am >= gm", "am and gm", "sum of series", "telescoping", "\\sum", "sum of the series", "\\dots \\infty", "\\dots"]],
  ["Sets", ["subset", "subsets", "power set", "null set", "universal set", "venn diagram", "union of sets", "intersection of sets", "difference of sets", "complement of set", "cardinality of set", "de morgan's law", "number of subsets", "n(a \\cup b)", "set a ="]],
  ["Linear Programming", ["linear programming", "lpp", "feasible region", "objective function", "constraints", "corner point method", "optimal solution", "bounded region"]],
  ["Linear Inequalities", ["linear inequality", "system of inequalities", "solution of inequality", "|x - a| < b"]],
];

function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function classifyMathsItem(row) {
  const rawText = [row.question, row.option_a, row.option_b, row.option_c, row.option_d, row.explanation, row.topic].filter(Boolean).join(" ");
  const normText = normalizeKey(rawText);

  const scores = [];
  for (const [chapter, keywords] of MATHS_RULES) {
    let score = 0;
    for (const kw of keywords) {
      if (kw.startsWith("\\") || kw.includes("^") || kw.includes("_") || kw.includes("|") || kw.includes("=") || kw.includes("[")) {
        if (rawText.toLowerCase().includes(kw.toLowerCase())) {
          score += 4;
        }
      } else {
        const normKw = normalizeKey(kw);
        if (normKw.length >= 3 && normText.includes(normKw)) {
          const regex = new RegExp(`(^|\\s)${normKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\s|$)`);
          if (regex.test(normText)) {
            score += normKw.length >= 10 ? 4 : (normKw.length >= 5 ? 3 : 2);
          }
        }
      }
    }
    if (score > 0) {
      scores.push({ chapter, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 0) {
    return { chapter: scores[0].chapter, confidence: 0.9, reason: `Match score ${scores[0].score}` };
  }
  return { chapter: "Complex Numbers and Quadratic Equations", confidence: 0.7, reason: "Default fallback" };
}

async function classifyAllMaths() {
  const maths = JSON.parse(await fs.readFile("./scratch/jee_classification/unclassified_maths.json", "utf8"));
  console.log("Total unclassified maths questions:", maths.length);

  const results = [];
  for (const q of maths) {
    const res = classifyMathsItem(q);
    results.push({
      id: q.id,
      ncert_chapter: res.chapter,
      confidence: res.confidence,
      reason: res.reason,
    });
  }

  await fs.writeFile("./scratch/jee_classification/maths_classified.json", JSON.stringify(results, null, 2));
  console.log("Successfully written maths_classified.json:", results.length);
}

classifyAllMaths();
