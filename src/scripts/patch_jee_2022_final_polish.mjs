import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TRANSCRIBED = path.join(ROOT, "scratch", "jee2022", "transcribed");

async function updateQuestion(paper, qnum, updater) {
  const subj = qnum <= 30 ? "physics" : qnum <= 60 ? "chemistry" : "mathematics";
  const filename = `${paper}_${subj}.json`;
  const filePath = path.join(TRANSCRIBED, filename);
  const data = JSON.parse(await fs.readFile(filePath, "utf8"));
  const q = data.find(x => x.question_number === qnum);
  if (!q) {
    console.error(`Not found: ${paper} Q${qnum}`);
    return;
  }
  updater(q);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ${paper} Q${qnum}`);
}

async function main() {
  // 1. 24JUN-S1 Q23 [Physics]: stray brace in 1\mu A}
  await updateQuestion("JEE-MAIN-22-24JUN-S1", 23, q => {
    q.question = q.question.replace("$1\\mu A}$", "$1\\,\\mu\\text{A}$");
  });

  // 2. 25JUN-S1 Q79 [Mathematics]: \li typo
  await updateQuestion("JEE-MAIN-22-25JUN-S1", 79, q => {
    q.question = "Let $x = 2t, y = \\frac{t}{3}$ be a conic. Let S be the focus and B be the point on the axis of the conic such that $SA \\perp BA$, where A is any point on the conic. If k is the ordinate of the centroid of $\\Delta SAB$, then $\\lim_{t \\to 1} k$ is equal to :";
  });

  // 3. 26JUN-S1 Q66 [Mathematics]: \li typo
  await updateQuestion("JEE-MAIN-22-26JUN-S1", 66, q => {
    q.question = "$\\lim_{x \\to \\frac{1}{\\sqrt{2}}} \\frac{\\sin(\\cos^{-1} x) - x}{1 - \\tan(\\cos^{-1} x)}$ is equal to :";
  });

  // 4. 27JUN-S2 Q66 [Mathematics]: touching dollars $b_1$$b_2$
  await updateQuestion("JEE-MAIN-22-27JUN-S2", 66, q => {
    q.question = "If $a_1, a_2, a_3, \\ldots$ and $b_1, b_2, b_3, \\ldots$ are A.P.s, and $a_1 = 2, a_{10} = 3, a_1 b_1 = 1 = a_{10} b_{10}$, then $a_4 b_4$ is equal to :";
  });

  // 5. 29JUN-S1 Q31 [Chemistry]: touching dollars F$e_3$$O_4$
  await updateQuestion("JEE-MAIN-22-29JUN-S1", 31, q => {
    q.question = "Production of iron in blast furnace follows the following equation:\n\n$$\\mathrm{Fe_3O_4(s) + 4CO(g) \\to 3Fe(l) + 4CO_2(g)}$$\n\nWhen $4.640\\text{ kg}$ of $\\mathrm{Fe_3O_4}$ and $2.520\\text{ kg}$ of $\\mathrm{CO}$ are allowed to react, then the amount of iron (in g) produced is : [Given: Molar atomic mass (in $\\mathrm{g\\cdot mol^{-1}}$): $\\mathrm{Fe} = 56, \\mathrm{O} = 16, \\mathrm{C} = 12$]";
  });

  // 6. 29JUN-S1 Q56 [Chemistry]: touching dollars in reactions
  await updateQuestion("JEE-MAIN-22-29JUN-S1", 56, q => {
    q.question = "The number of terminal oxygen atoms present in the product B obtained from the following reaction is ____________.\n\n$$\\mathrm{FeCr_2O_4 + Na_2CO_3 + O_2 \\to A + Fe_2O_3 + CO_2}$$\n\n$$\\mathrm{A + H^+ \\to B + H_2O + Na^+}$$";
  });

  // 7. 29JUN-S1 Q90 [Mathematics]: touching dollars $b_1$$b_2$
  await updateQuestion("JEE-MAIN-22-29JUN-S1", 90, q => {
    q.question = "Let $b_1 b_2 b_3 b_4$ be a 4-element permutation with $b_i \\in \\{1, 2, 3, \\ldots, 100\\}$ for $1 \\le i \\le 4$ and $b_i \\ne b_j$ for $i \\ne j$, such that either $b_1, b_2, b_3$ are consecutive integers or $b_2, b_3, b_4$ are consecutive integers. Then the number of such permutations $b_1 b_2 b_3 b_4$ is equal to ____________.";
  });

  // 8. 27JUL-S2 Q86 [Mathematics]: {y}^{' '} double prime
  await updateQuestion("JEE-MAIN-22-27JUL-S2", 86, q => {
    q.question = "For the curve $C : (x^2 + y^2 - 3) + (x^2 - y^2 - 1)^5 = 0$, the value of $3y' - y^3 y''$, at the point $(\\alpha, \\alpha), \\alpha > 0$, on C, is equal to ____________.";
  });

  // 9. 28JUL-S1 Q83 [Mathematics]: {f}^{' '} double prime
  await updateQuestion("JEE-MAIN-22-28JUL-S1", 83, q => {
    q.question = "Let $f : [0, 1] \\to \\mathbb{R}$ be a twice differentiable function in $(0, 1)$ such that $f(0) = 3$ and $f(1) = 5$. If the line $y = 2x + 3$ intersects the graph of $f$ at only two distinct points in $(0, 1)$, then the least number of points $x \\in (0, 1)$, at which $f''(x) = 0$, is ____________.";
  });

  // 10. 24JUN-S2 Q58 [Chemistry]: bare N_2
  await updateQuestion("JEE-MAIN-22-24JUN-S2", 58, q => {
    q.question = q.question.replace("N_2", "$\\mathrm{N_2}$");
  });

  // 11. 24JUN-S2 Q87 [Mathematics]: bare r^2
  await updateQuestion("JEE-MAIN-22-24JUN-S2", 87, q => {
    q.question = "Let circles $(x - h)^2 + (y - k)^2 = r^2, k > 0$, touch the x-axis at $(1, 0)$. If the line $x + y = 0$ intersects the circles at two points P and Q such that length of chord $PQ = 2$, then the value of $h + k + r$ is equal to :";
  });

  // 12. 25JUN-S1 Q66 [Mathematics]: bare x^3
  await updateQuestion("JEE-MAIN-22-25JUN-S1", 66, q => {
    q.question = "Let $f : \\mathbb{R} \\to \\mathbb{R}$ be defined as $f(x) = x^3 + x - 5$. If $g(x)$ is a function such that $f(g(x)) = x, \\forall x \\in \\mathbb{R}$, then $g'(63)$ is equal to :";
  });

  // 13. 25JUN-S1 Q75 [Mathematics]: bare e^{3x}
  await updateQuestion("JEE-MAIN-22-25JUN-S1", 75, q => {
    q.question = "Consider the differential equation $(x + 1)y' - y = e^{3x}(x + 1)^2$, with $y(0) = \\frac{1}{3}$. Then, the point $x = -\\frac{4}{3}$ is :";
  });

  // 14. 26JUN-S1 Q44 [Chemistry]: bare C_6H_5
  await updateQuestion("JEE-MAIN-22-26JUN-S1", 44, q => {
    q.option_a = "$\\mathrm{C_6H_5-C(=O)-C_6H_5}$";
    q.option_b = "$\\mathrm{C_6H_5-CH(OH)-C_6H_5}$";
  });

  // 15. 26JUN-S1 Q51 [Chemistry]: bare \mathrm{J}
  await updateQuestion("JEE-MAIN-22-26JUN-S1", 51, q => {
    q.question = q.question.replace("R=8.3 \\mathrm{J}\\, \\, )", "$R = 8.3\\text{ J}\\cdot\\text{K}^{-1}\\cdot\\text{mol}^{-1}$)");
  });

  // 16. Convert 10 tabular questions to clean markdown tables
  // 24JUN-S2 Q72
  await updateQuestion("JEE-MAIN-22-24JUN-S2", 72, q => {
    q.question = "A random variable X has the following probability distribution:\n\n| $X$ | $0$ | $1$ | $2$ | $3$ | $4$ |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| $P(X)$ | $k$ | $2k$ | $4k$ | $6k$ | $8k$ |\n\nThe value of $P(1 < X < 4 \\mid X \\le 2)$ is equal to :";
  });

  // 27JUN-S1 Q36
  await updateQuestion("JEE-MAIN-22-27JUN-S1", 36, q => {
    q.question = "Match List-I with List-II:\n\n| List-I | List-II |\n| :--- | :--- |\n| (A) Concentration of gold ore | (I) $\\mathrm{Aniline}$ |\n| (B) Leaching of alumina | (II) $\\mathrm{NaOH}$ |\n| (C) Froth stabiliser | (III) $\\mathrm{SO_2}$ |\n| (D) Blister copper | (IV) $\\mathrm{NaCN}$ |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUN-S1 Q39
  await updateQuestion("JEE-MAIN-22-27JUN-S1", 39, q => {
    q.question = "Match List-I with List-II:\n\n| List-I (Si-Compounds) | List-II (Si-Polymer/other products) |\n| :--- | :--- |\n| (A) $(\\mathrm{CH_3})_4\\mathrm{Si}$ | (I) Chain silicone |\n| (B) $(\\mathrm{CH_3})\\mathrm{Si(OH)_3}$ | (II) Dimeric silicone |\n| (C) $(\\mathrm{CH_3})_2\\mathrm{Si(OH)_2}$ | (III) Silane |\n| (D) $(\\mathrm{CH_3})_3\\mathrm{Si(OH)}$ | (IV) 2D-Silicone |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUN-S1 Q48
  await updateQuestion("JEE-MAIN-22-27JUN-S1", 48, q => {
    q.question = "Match List-I with List-II:\n\n| List-I (Polymer) | List-II (Used in) |\n| :--- | :--- |\n| (A) Bakelite | (I) Radio and television cabinets |\n| (B) Glyptal | (II) Electrical switches |\n| (C) PVC | (III) Paints and lacquers |\n| (D) Polystyrene | (IV) Water pipes |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUL-S1 Q43
  await updateQuestion("JEE-MAIN-22-27JUL-S1", 43, q => {
    q.question = "Match List-I with List-II:\n\n| List-I (Pollutant) | List-II (Disease / sickness) |\n| :--- | :--- |\n| (A) Sulphate ($>500\\text{ ppm}$) | (I) Methemoglobinemia |\n| (B) Nitrate ($>50\\text{ ppm}$) | (II) Brown mottling of teeth |\n| (C) Lead ($>50\\text{ ppb}$) | (III) Laxative effect |\n| (D) Fluoride ($>2\\text{ ppm}$) | (IV) Kidney damage |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUL-S1 Q46
  await updateQuestion("JEE-MAIN-22-27JUL-S1", 46, q => {
    q.question = "Match List-I with List-II:\n\n| List-I (Polymers) | List-II (Commercial names) |\n| :--- | :--- |\n| (A) Phenol-formaldehyde resin | (I) Glyptal |\n| (B) Copolymer of 1,3-butadiene and styrene | (II) Novolac |\n| (C) Polyester of glycol and phthalic acid | (III) Buna-S |\n| (D) Polyester of glycol and terephthalic acid | (IV) Dacron |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUL-S1 Q48 (Link image and clean text)
  await updateQuestion("JEE-MAIN-22-27JUL-S1", 48, q => {
    q.question = "Match List-I with List-II (chemical structures given in image):\n\n| List-I | List-II |\n| :--- | :--- |\n| (A) Structure A | (I) Anti-depressant |\n| (B) Structure B | (II) 550 times sweeter than cane sugar |\n| (C) Structure C | (III) Narcotic analgesic |\n| (D) Structure D | (IV) Antiseptic |\n\nChoose the correct answer from the options given below:";
    q.question_image = "scratch/jee2022/images/JEE-MAIN-22-27JUL-S1/q48.png";
  });

  // 27JUL-S1 Q50
  await updateQuestion("JEE-MAIN-22-27JUL-S1", 50, q => {
    q.question = "Match List-I with List-II:\n\n| List-I | List-II |\n| :--- | :--- |\n| (A) Benzenesulphonyl chloride | (I) Test for primary amines |\n| (B) Hoffmann bromamide reaction | (II) Anti-Saytzeff |\n| (C) Carbylamine reaction | (III) Hinsberg reagent |\n| (D) Hoffmann orientation | (IV) Known reaction of isocyanates |\n\nChoose the correct answer from the options given below:";
  });

  // 27JUL-S1 Q52
  await updateQuestion("JEE-MAIN-22-27JUL-S1", 52, q => {
    q.question = "$2\\mathrm{NO} + 2\\mathrm{H_2} \\rightarrow \\mathrm{N_2} + 2\\mathrm{H_2O}$\n\nThe above reaction has been studied at $800^\\circ\\text{C}$. The related data are given in the table below:\n\n| Reaction serial number | Initial pressure of $\\mathrm{H_2}$ / $\\text{kPa}$ | Initial pressure of $\\mathrm{NO}$ / $\\text{kPa}$ | Initial rate $\\left(-\\frac{\\mathrm{d}p}{\\mathrm{d}t}\\right)$ / $(\\text{kPa}/\\text{s})$ |\n| :--- | :--- | :--- | :--- |\n| 1 | 65.6 | 40.0 | 0.135 |\n| 2 | 65.6 | 20.1 | 0.033 |\n| 3 | 38.6 | 65.6 | 0.214 |\n| 4 | 19.2 | 65.6 | 0.106 |\n\nThe order of the reaction with respect to $\\mathrm{NO}$ is _________.";
  });

  console.log("All manual targeted fixes applied successfully.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
