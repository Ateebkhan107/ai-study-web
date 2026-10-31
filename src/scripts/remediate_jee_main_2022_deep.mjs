import fs from "node:fs/promises";
import path from "node:path";
import katex from "katex";

const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");

function cleanText(text, fieldName = "") {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // 1. Convert \[ ... \] display math delimiters to $$ ... $$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$");

  // 2. Fix broken double-dollar subscripts like $λ$$_{visible}$ or $λ$$_{1}$ or $α$$^{8}$
  s = s.replace(/\$([a-zA-Z\u0370-\u03ff]+)\$\$([_\^]\{?[a-zA-Z0-9\+\-\s]+\}?)\$/g, "$$$1$2$$");
  s = s.replace(/\$([a-zA-Z\u0370-\u03ff]+)\$\$([_\^][a-zA-Z0-9])\$/g, "$$$1$2$$");
  // Subscript like K$_{1}$
  s = s.replace(/([a-zA-Z])\$([_\^]\{?[a-zA-Z0-9\+\-\s]+\}?)\$/g, "$$$1$2$$");
  // Superscript like x$^{2}$
  s = s.replace(/([a-zA-Z])\$\^\{?([0-9a-zA-Z\+\-]+)\}?\$/g, "$$$1^{$2}$$");

  // 3. Fix \( and \) inside math delimiters
  s = s.replace(/\$\\\(\s*/g, "$(");
  s = s.replace(/\s*\\\)\$/g, ")$");
  s = s.replace(/\$\\\(\s*\\([a-zA-Z]+)\s*\\\)\$/g, "$$$1$$");

  // 4. Fix piecewise matrix functions: { \begin{matrix} ... \end{matrix}
  s = s.replace(/\{\s*\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g, (match, inner) => {
    return `\\begin{cases}${inner}\\end{cases}`;
  });

  // 5. Fix invisible Unicode function application char U+2061 (⁡)
  s = s.replace(/\u2061/g, "");

  // 6. Fix curly prime U+2032 (′) to standard prime '
  s = s.replace(/′/g, "'");

  // 7. Fix micro symbol µ to \mu in math mode
  s = s.replace(/\$([^$]*?)µ([^$]*?)\$/g, "$$1\\mu $2$$");

  // 8. Fix circumflex accent ˆ (U+02C6) to \hat
  s = s.replace(/([ijk])ˆ/g, "\\hat{$1}");
  s = s.replace(/ˆ([ijk])/g, "\\hat{$1}");

  // 9. Fix bare fraction like \frac{3}{2} outside $
  if (/^\\frac\{\d+\}\{\d+\}$/.test(s.trim())) {
    s = `$${s.trim()}$`;
  }

  // 10. Fix bare simple chemistry formulas in options
  if (/^(?:O_3|H_2O|N_2|O_2|C_2|H_2S|H_2Se|H_2Te)$/.test(s.trim())) {
    const formula = s.trim().replace(/_(\d+)/g, "$1");
    s = `$\\mathrm{${s.trim()}}$`;
  }
  if (/^H_2S < H_2Se < H_2Te < H_2O$/.test(s.trim())) {
    s = "$\\mathrm{H_2S} < \\mathrm{H_2Se} < \\mathrm{H_2Te} < \\mathrm{H_2O}$";
  }
  if (/^H_2O < H_2S < H_2Se < H_2Te$/.test(s.trim())) {
    s = "$\\mathrm{H_2O} < \\mathrm{H_2S} < \\mathrm{H_2Se} < \\mathrm{H_2Te}$";
  }
  if (/^H_2S < H_2Te < H_2Se < H_2O$/.test(s.trim())) {
    s = "$\\mathrm{H_2S} < \\mathrm{H_2Te} < \\mathrm{H_2Se} < \\mathrm{H_2O}$";
  }
  if (/^H_2Se < H_2S < H_2Te < H_2O$/.test(s.trim())) {
    s = "$\\mathrm{H_2Se} < \\mathrm{H_2S} < \\mathrm{H_2Te} < \\mathrm{H_2O}$";
  }

  // 11. Fix bare power options in math like 6^6 or 2^{12}
  if (/^(?:\d+\^\{?\d+\}?|4\(e\^4 \+ 1\))$/.test(s.trim())) {
    s = `$${s.trim()}$`;
  }

  return s;
}

function cleanAnswer(ans, isNumerical) {
  if (ans === null || ans === undefined) return ans;
  let s = String(ans).trim();
  if (isNumerical) {
    // Strip surrounding parentheses like (5418) -> 5418
    const numMatch = s.match(/^\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)\s*$/);
    if (numMatch) {
      s = numMatch[1];
    }
  } else {
    // Clean MCQ answer
    const mcqMatch = s.match(/^\s*\(\s*([A-Da-d])\s*\)\s*$/);
    if (mcqMatch) {
      s = mcqMatch[1].toLowerCase();
    } else if (/^[A-D]$/.test(s)) {
      s = s.toLowerCase();
    }
  }
  return s;
}

async function remediateAll() {
  console.log("Starting deep remediation of all JEE Main 2022 questions...");
  const files = (await fs.readdir(TRANSCRIBED)).filter(f => f.startsWith("JEE-MAIN-22-") && f.endsWith(".json")).sort();

  let modifiedFilesCount = 0;
  let modifiedQuestionsCount = 0;

  for (const filename of files) {
    const filePath = path.join(TRANSCRIBED, filename);
    const questions = JSON.parse(await fs.readFile(filePath, "utf8"));
    const paperCode = filename.split("_")[0];
    const subject = filename.split("_")[1].replace(".json", "");
    let fileChanged = false;

    for (const q of questions) {
      const isNumerical = q.question_number % 30 > 20 || q.question_number % 30 === 0;
      let qChanged = false;

      // Clean text fields
      for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
        if (q[field]) {
          const cleaned = cleanText(q[field], field);
          if (cleaned !== q[field]) {
            q[field] = cleaned;
            qChanged = true;
          }
        }
      }

      // Clean answer
      const cleanedAns = cleanAnswer(q.correct_option, isNumerical);
      if (cleanedAns !== q.correct_option) {
        q.correct_option = cleanedAns;
        qChanged = true;
      }

      // -------------------------------------------------------------
      // Specific Question Patches
      // -------------------------------------------------------------

      // 1. JEE-MAIN-22-25JUN-S1 Q80 and Q81 (Swapped answers)
      if (paperCode === "JEE-MAIN-22-25JUN-S1") {
        if (q.question_number === 80 && q.correct_option !== "b") {
          q.correct_option = "b";
          qChanged = true;
        }
        if (q.question_number === 81 && q.correct_option !== "286") {
          q.correct_option = "286";
          qChanged = true;
        }
      }

      // 2. JEE-MAIN-22-26JUN-S1 Q52 (Numerical accepted 99 or 98)
      if (paperCode === "JEE-MAIN-22-26JUN-S1" && q.question_number === 52) {
        q.correct_option = "99";
        qChanged = true;
      }

      // 3. JEE-MAIN-22-29JUN-S2 Q60 (OCR typo "4s")
      if (paperCode === "JEE-MAIN-22-29JUN-S2" && q.question_number === 60) {
        q.correct_option = "4";
        qChanged = true;
      }

      // 4. JEE-MAIN-22-29JUL-S1 Q21 (15or75 -> 15)
      if (paperCode === "JEE-MAIN-22-29JUL-S1" && q.question_number === 21) {
        q.correct_option = "15";
        qChanged = true;
      }

      // 5. JEE-MAIN-22-26JUN-S2 Q15 Options (Clean Lambda subscripts)
      if (paperCode === "JEE-MAIN-22-26JUN-S2" && q.question_number === 15) {
        q.option_a = "$\\lambda_{\\text{visible}} < \\lambda_{\\text{X-ray}} < \\lambda_{\\text{gamma-ray}} < \\lambda_{\\text{microwave}}$";
        q.option_b = "$\\lambda_{\\text{gamma-ray}} < \\lambda_{\\text{X-ray}} < \\lambda_{\\text{visible}} < \\lambda_{\\text{microwave}}$";
        q.option_c = "$\\lambda_{\\text{X-ray}} < \\lambda_{\\text{gamma-ray}} < \\lambda_{\\text{visible}} < \\lambda_{\\text{microwave}}$";
        q.option_d = "$\\lambda_{\\text{microwave}} < \\lambda_{\\text{visible}} < \\lambda_{\\text{X-ray}} < \\lambda_{\\text{gamma-ray}}$";
        qChanged = true;
      }

      // 6. JEE-MAIN-22-25JUN-S1 Q63 (Remove \( and \) inside math)
      if (paperCode === "JEE-MAIN-22-25JUN-S1" && q.question_number === 63) {
        q.question = "Let a, b and c be the length of sides of a triangle ABC such that $\\frac{a+b}{7} = \\frac{b+c}{8} = \\frac{c+a}{9}$. If r and R are the radius of incircle and radius of circumcircle of the triangle ABC, respectively, then the value of $\\left( \\frac{R}{r} \\right)$ is equal to :";
        qChanged = true;
      }

      // 7. JEE-MAIN-22-28JUL-S1 Q14 (Stray brace around pi)
      if (paperCode === "JEE-MAIN-22-28JUL-S1" && q.question_number === 14) {
        q.question = "The equation of current in a purely inductive circuit is $5 \\sin ( 49 \\pi t - 30^{\\circ} )$. If the inductance is $30\\text{ mH}$, then the equation for the voltage across the inductor will be : (Take $\\pi = \\frac{22}{7}$)";
        qChanged = true;
      }

      // 8. JEE-MAIN-22-28JUL-S1 Q68 (Set braces escaped)
      if (paperCode === "JEE-MAIN-22-28JUL-S1" && q.question_number === 68) {
        q.question = "For $\\alpha \\in \\mathbb{N}$, consider a relation $R$ on $\\mathbb{N}$ given by $R = \\{ ( x , y ) : 3 x + \\alpha y \\text{ is a multiple of } 7 \\}$. The relation $R$ is an equivalence relation if and only if :";
        qChanged = true;
      }

      // 9. JEE-MAIN-22-29JUL-S1 Q10 (Piecewise density)
      if (paperCode === "JEE-MAIN-22-29JUL-S1" && q.question_number === 10) {
        q.question = "A spherically symmetric charge distribution is considered with charge density varying as\n\n$$\\rho ( r ) = \\begin{cases} \\rho_{0} \\left( \\frac{3}{4} - \\frac{r}{R} \\right) & \\text{for } r \\le R \\\\ 0 & \\text{for } r > R \\end{cases}$$\n\nWhere $r$ ($r < R$) is the distance from the centre O (as shown in figure). The electric field at point P will be :";
        qChanged = true;
      }

      // 10. JEE-MAIN-22-29JUL-S1 Q61 (Set braces escaped)
      if (paperCode === "JEE-MAIN-22-29JUL-S1" && q.question_number === 61) {
        q.question = "Let R be a relation from the set $\\{ 1 , 2 , 3 , \\ldots , 60 \\}$ to itself such that $R = \\{ ( a , b ) : b = pq, \\text{ where } p, q \\ge 3 \\text{ are prime numbers} \\}$. Then, the number of elements in R is :";
        qChanged = true;
      }

      // 11. JEE-MAIN-22-29JUL-S1 Q89 (Set braces escaped)
      if (paperCode === "JEE-MAIN-22-29JUL-S1" && q.question_number === 89) {
        q.question = "Let $S = \\{ 4 , 6 , 9 \\}$ and $T = \\{ 9 , 10 , 11 , \\ldots , 1000 \\}$. If $A = \\{ a_1 + a_2 + \\ldots + a_k : k \\in \\mathbb{N}, a_1, a_2, \\ldots, a_k \\in S \\}$, then the sum of all the elements in the set $T - A$ is equal to __________.";
        qChanged = true;
      }

      // 12. JEE-MAIN-22-29JUL-S2 Q64 (Piecewise limits)
      if (paperCode === "JEE-MAIN-22-29JUL-S2" && q.question_number === 64) {
        q.question = "Let the function\n\n$$f ( x ) = \\begin{cases} \\frac{\\ln( 1 + 5 x ) - \\ln( 1 + \\alpha x )}{x} & \\text{if } x \\ne 0 \\\\ 10 & \\text{if } x = 0 \\end{cases}$$\n\nbe continuous at $x = 0$. Then $\\alpha$ is equal to :";
        qChanged = true;
      }

      // 13. JEE-MAIN-22-27JUL-S2 (Comprehensive Mathematics Fixes)
      if (paperCode === "JEE-MAIN-22-27JUL-S2" && subject === "mathematics") {
        if (q.question_number === 64) {
          q.question = "Let $A = \\begin{pmatrix} 4 & -2 \\\\ \\alpha & \\beta \\end{pmatrix}$. If $A^2 + \\gamma A + 18I = O$, then $\\det(A)$ is equal to :";
          q.option_a = "$-18$";
          q.option_b = "$18$";
          q.option_c = "$-50$";
          q.option_d = "$50$";
          q.correct_option = "b";
          qChanged = true;
        } else if (q.question_number === 75) {
          // Replace duplicate with official Question 15
          q.question = "If the line of intersection of the planes $ax + by = 3$ and $ax + by + cz = 0, a > 0$ makes an angle $30^\\circ$ with the plane $y - z + 2 = 0$, then the direction cosines of the line are :";
          q.option_a = "$\\frac{1}{\\sqrt{2}}, \\frac{1}{2}, 0$";
          q.option_b = "$\\frac{1}{\\sqrt{2}}, -\\frac{1}{2}, 0$";
          q.option_c = "$\\frac{1}{\\sqrt{5}}, -\\frac{2}{\\sqrt{5}}, 0$";
          q.option_d = "$\\frac{1}{2}, -\\frac{\\sqrt{3}}{2}, 0$";
          q.correct_option = "b";
          qChanged = true;
        } else if (q.question_number === 81) {
          q.question = "Consider a matrix $A = \\begin{bmatrix} \\alpha & \\beta & \\gamma \\\\ \\alpha^2 & \\beta^2 & \\gamma^2 \\\\ \\beta+\\gamma & \\gamma+\\alpha & \\alpha+\\beta \\end{bmatrix}$, where $\\alpha, \\beta, \\gamma$ are three distinct natural numbers. If\n\n$$\\frac{\\det(\\operatorname{adj}(\\operatorname{adj}(\\operatorname{adj}(\\operatorname{adj} A))))}{(\\alpha - \\beta)^{16}(\\beta - \\gamma)^{16}(\\gamma - \\alpha)^{16}} = 2^{32} \\times 3^{16}$$\n\nthen the number of such 3-tuples $(\\alpha, \\beta, \\gamma)$ is _________.";
          q.correct_option = "42";
          qChanged = true;
        } else if (q.question_number === 82) {
          q.question = "The number of functions $f$, from the set $A = \\{ x \\in \\mathbb{N} : x^2 - 10x + 9 \\le 0 \\}$ to the set $B = \\{ n^2 : n \\in \\mathbb{N} \\}$ such that $f(x) \\le (x - 3)^2 + 1$, for every $x \\in A$, is _________.";
          q.correct_option = "1440";
          qChanged = true;
        } else if (q.question_number === 83) {
          q.correct_option = "24";
          qChanged = true;
        } else if (q.question_number === 84) {
          q.question = "The value of\n\n$$\\frac{3^3 - 2^3}{1 \\times 7} + \\frac{4^3 - 3^3}{2 \\times 11} + \\frac{5^3 - 4^3}{3 \\times 15} + \\ldots + \\frac{30^3 - 29^3}{28 \\times 115}$$\n\nis equal to _________.";
          q.correct_option = "120";
          qChanged = true;
        } else if (q.question_number === 85) {
          q.correct_option = "5";
          qChanged = true;
        } else if (q.question_number === 86) {
          q.correct_option = "16";
          qChanged = true;
        } else if (q.question_number === 87) {
          q.correct_option = "385";
          qChanged = true;
        } else if (q.question_number === 88) {
          q.correct_option = "12";
          qChanged = true;
        } else if (q.question_number === 89) {
          q.correct_option = "20";
          qChanged = true;
        } else if (q.question_number === 90) {
          q.correct_option = "36";
          qChanged = true;
        }
      }

      if (qChanged) {
        fileChanged = true;
        modifiedQuestionsCount++;
      }
    }

    if (fileChanged) {
      await fs.writeFile(filePath, `${JSON.stringify(questions, null, 2)}\n`);
      modifiedFilesCount++;
    }
  }

  console.log(`Remediation complete: Updated ${modifiedQuestionsCount} questions across ${modifiedFilesCount} files.`);
}

remediateAll().catch(e => {
  console.error("Remediation error:", e);
  process.exit(1);
});
