import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "tmp/neet-ug-2023/neet-ug-2023-manifest.json");
const VISUALS = path.join(ROOT, "tmp/neet-2023-clean/structured/visuals/visual-manifest.json");
const OUT = path.join(ROOT, "tmp/neet-2023-clean/structured/neet-2023-structured-draft.json");
const latex = String.raw;

const overrides = {
  1: { option_a: "$V$", option_b: "$1/V$", option_c: "$1/\\sqrt{V}$", option_d: "$V^2$" },
  2: { question: latex`A Carnot engine has an efficiency of $50\%$ when its source is at $327^\circ\mathrm{C}$. The temperature of the sink is:`, option_a: "$27^\\circ\\mathrm{C}$", option_b: "$15^\\circ\\mathrm{C}$", option_c: "$100^\\circ\\mathrm{C}$", option_d: "$200^\\circ\\mathrm{C}$" },
  3: { question: latex`A bullet is fired at $280\,\mathrm{m\,s^{-1}}$ at $30^\circ$ above the horizontal. Its maximum height is: $(g=9.8\,\mathrm{m\,s^{-2}},\ \sin30^\circ=0.5)$` },
  4: { question: latex`In a series LCR circuit, $L=10\,\mathrm{mH}$, $C=1\,\mu\mathrm{F}$ and $R=100\,\Omega$. The resonant frequency is:` },
  6: { question: latex`Light travels a distance $x$ in time $t_1$ in air and a distance $10x$ in time $t_2$ in a denser medium. What is the critical angle for this medium?`, option_a: "$\\sin^{-1}(t_2/t_1)$", option_b: "$\\sin^{-1}(10t_2/t_1)$", option_c: "$\\sin^{-1}(t_1/10t_2)$", option_d: "$\\sin^{-1}(10t_1/t_2)$" },
  7: { question: latex`In the hydrogen spectrum, the shortest wavelength in the Balmer series is $\lambda$. The shortest wavelength in the Brackett series is:`, option_a: "$2\\lambda$", option_b: "$4\\lambda$", option_c: "$9\\lambda$", option_d: "$16\\lambda$" },
  8: { option_a: "$200\\,\\Omega$", option_b: "$50\\,\\Omega$", option_c: "$100\\,\\Omega$", option_d: "$400\\,\\Omega$" },
  9: { question: latex`The energy required to form a soap bubble of radius $2\,\mathrm{cm}$ is nearly: (surface tension $=0.03\,\mathrm{N\,m^{-1}}$)`, option_a: "$30.16\\times10^{-4}\\,\\mathrm{J}$", option_b: "$5.06\\times10^{-4}\\,\\mathrm{J}$", option_c: "$3.01\\times10^{-4}\\,\\mathrm{J}$", option_d: "$0.1\\times10^{-4}\\,\\mathrm{J}$" },
  10: { question: latex`The magnetic energy stored in an inductor of inductance $4\,\mu\mathrm{H}$ carrying a current of $2\,\mathrm{A}$ is:`, option_a: "$4\\,\\mu\\mathrm{J}$", option_b: "$4\\,\\mathrm{mJ}$", option_c: "$8\\,\\mathrm{mJ}$", option_d: "$8\\,\\mu\\mathrm{J}$" },
  12: { question: latex`An electric dipole is placed at $30^\circ$ to an electric field of intensity $2\times10^5\,\mathrm{N\,C^{-1}}$. It experiences a torque of $4\,\mathrm{N\,m}$. Find the magnitude of each charge if the dipole length is $2\,\mathrm{cm}$.` },
  14: { option_a: "$W/(2A)$", option_b: "$W/A$", option_c: "$2W/A$" },
  15: { question: latex`If $\displaystyle\oint_S \vec E\cdot d\vec S=0$ over a closed surface, then:` },
  17: { question: latex`A gas is initially at $-50^\circ\mathrm{C}$. To what temperature should it be heated so that its rms speed becomes three times the initial value?`, option_a: "$669^\\circ\\mathrm{C}$", option_b: "$3295^\\circ\\mathrm{C}$", option_c: "$3097\\,\\mathrm{K}$", option_d: "$223\\,\\mathrm{K}$" },
  19: { question: latex`A carbon resistor has resistance $(22000\pm5\%)\,\Omega$. The colour of its third band is:` },
  21: { question: latex`A metal wire has mass $(0.4\pm0.002)\,\mathrm{g}$, radius $(0.3\pm0.001)\,\mathrm{mm}$ and length $(5\pm0.02)\,\mathrm{cm}$. The maximum possible percentage error in its density is nearly:` },
  22: { option_a: "$2\\,\\mu\\mathrm{F}$", option_b: "$3\\,\\mu\\mathrm{F}$", option_c: "$6\\,\\mu\\mathrm{F}$", option_d: "$9\\,\\mu\\mathrm{F}$" },
  25: { question: "The half-life of a radioactive substance is 20 minutes. How long does its activity take to fall to $1/16$ of its initial value?" },
  34: { question: latex`In a plane electromagnetic wave in free space, the electric field oscillates at $2.0\times10^{10}\,\mathrm{Hz}$ with amplitude $48\,\mathrm{V\,m^{-1}}$. Find the magnetic-field amplitude. Take $c=3\times10^8\,\mathrm{m\,s^{-1}}$.`, option_a: "$1.6\\times10^{-9}\\,\\mathrm{T}$", option_b: "$1.6\\times10^{-8}\\,\\mathrm{T}$", option_c: "$1.6\\times10^{-7}\\,\\mathrm{T}$", option_d: "$1.6\\times10^{-6}\\,\\mathrm{T}$" },
  37: { question: latex`A satellite orbits just above Earth's surface with period $T$. If $d$ is Earth's density and $G$ is the gravitational constant, the quantity $\sqrt{3\pi/(Gd)}$ represents:`, option_a: "$T$", option_b: "$T/2$", option_c: "$T/3$", option_d: "$T/4$" },
  38: { question: latex`The radius of the innermost orbit of hydrogen is $5.3\times10^{-11}\,\mathrm{m}$. What is the radius of its third allowed orbit?`, option_a: "$0.53\\,\\mathring{A}$", option_b: "$1.06\\,\\mathring{A}$", option_c: "$1.59\\,\\mathring{A}$", option_d: "$4.77\\,\\mathring{A}$" },
  39: { option_a: "$10\\sqrt2\\,\\Omega$", option_b: "$15\\,\\Omega$", option_c: "$5\\sqrt5\\,\\Omega$", option_d: "$5\\,\\Omega$" },
  40: { option_a: "$8\\pi^2\\,\\mathrm{m\,s^{-2}}$", option_b: "$-8\\pi^2\\,\\mathrm{m\,s^{-2}}$", option_c: "$16\\pi^2\\,\\mathrm{m\,s^{-2}}$", option_d: "$-16\\pi^2\\,\\mathrm{m\,s^{-2}}$" },
  42: { question: latex`An electric dipole is placed as shown. The electric potential (in $10^2\,\mathrm{V}$) at point $P$ is: $(K=1/(4\pi\varepsilon_0))$`, option_a: "$3qK/8$", option_b: "$5qK/8$", option_c: "$8qK/5$", option_d: "$8qK/3$" },
  47: { option_a: "$\\mu_0 i/(4R)$, into the page", option_b: "$\\mu_0 i/(4R)$, out of the page", option_c: "$\\dfrac{\\mu_0 i}{4R}(2/\\pi-1)$, out of the page", option_d: "$\\dfrac{\\mu_0 i}{4R}(2/\\pi-1)$, into the page" },
  48: { question: latex`The resistance of a platinum wire is $2\,\Omega$ at $0^\circ\mathrm{C}$ and $6.8\,\Omega$ at $80^\circ\mathrm{C}$. Its temperature coefficient of resistance is:`, option_a: "$4\\times10^{-3}\\,{}^\\circ\\mathrm{C}^{-1}$", option_b: "$3\\times10^{-3}\\,{}^\\circ\\mathrm{C}^{-1}$", option_c: "$2\\times10^{-3}\\,{}^\\circ\\mathrm{C}^{-1}$", option_d: "$1\\times10^{-3}\\,{}^\\circ\\mathrm{C}^{-1}$" },
  49: { question: latex`A wire of length $L$ carries current $I$ along the positive $x$-axis in a magnetic field $\vec B=(2\hat i+3\hat j-4\hat k)\,\mathrm{T}$. The magnitude of the magnetic force is:`, option_a: "$3IL$", option_b: "$\\sqrt5 IL$", option_c: "$5IL$", option_d: "$\\sqrt3 IL$" },
  63: { question: latex`For a given azimuthal quantum number $l$, if $n_m$ is the number of permissible values of the magnetic quantum number $m$, then:`, option_a: "$l=(n_m-1)/2$", option_b: "$n_m=2l+1$", option_c: "$l=(n_m+1)/2$", option_d: "$n_m=2l$" },
  64: { question: "The stability of $\\mathrm{Cu^{2+}}$ is greater than that of $\\mathrm{Cu^+}$ in aqueous solution because of:" },
  70: { question: "For a reaction, $\\text{rate}=k[A]^2[B]$. If the initial concentration of A is tripled while B is kept constant, the initial rate will:" },
  82: { question: latex`Choose the correct mass of $\mathrm{CO_2}$ produced by heating $20\,\mathrm{g}$ of $20\%$ pure limestone: $\mathrm{CaCO_3\xrightarrow{1200\,K}CaO+CO_2}$. (Atomic mass of Ca $=40$.)` },
  84: { question: latex`Given Assertion A and Reason R. **Assertion A:** In $\Delta_rG=-nFE_{\mathrm{cell}}$, $\Delta_rG$ depends on $n$. **Reason R:** $E_{\mathrm{cell}}$ is intensive whereas $\Delta_rG$ is extensive. Choose the correct answer:` },
  87: { question: "Identify the major product formed in the reaction scheme shown below:" },
  92: { option_a: "$\\Delta H=\\Delta U-\\Delta n_gRT$", option_b: "$\\Delta H=\\Delta U+\\Delta n_gRT$", option_c: "$\\Delta H-\\Delta U=-\\Delta nRT$", option_d: "$\\Delta H+\\Delta U=\\Delta nR$" },
  94: { option_a: "$1/2$", option_b: "$1/3$", option_c: "$1/4$", option_d: "$1/12$" },
  96: { question: latex`For $A+B\rightleftharpoons C+D$, the equilibrium concentrations are $2,3,10,$ and $6\,\mathrm{mol\,L^{-1}}$, respectively, at $300\,\mathrm{K}$. Find $\Delta G^\circ$. $(R=2\,\mathrm{cal\,mol^{-1}\,K^{-1}})$` },
};

function clean(value) {
  return String(value ?? "").replace(/^Question\s+\d+:\s*/i, "")
    .replaceAll("–", "-").replaceAll("−", "-")
    .replaceAll("", "$\\lambda$").replaceAll("", "$\\mu$").replaceAll("", "$\\Omega$")
    .replaceAll("", "$^\\circ$").replaceAll("", "$\\alpha$").replaceAll("", "$\\beta$")
    .replaceAll("", "$\\times$").replaceAll("", "$\\to$")
    .replace(/\s+/g, " ").trim();
}

function matchingTable(value) {
  const text = clean(value);
  if (!/Match List/i.test(text)) return null;
  const start = text.search(/\bA\.\s/); const end = text.search(/Choose the correct answer/i);
  if (start < 0 || end < 0) return null;
  const part = text.slice(start, end);
  const m = part.match(/A\.\s*(.*?)\s+I\.\s*(.*?)\s+B\.\s*(.*?)\s+II\.\s*(.*?)\s+C\.\s*(.*?)\s+III\.\s*(.*?)\s+D\.\s*(.*?)\s+IV\.\s*(.*)/i);
  if (!m) return null;
  return `Match List I with List II:\n\n| List I | List II |\n|---|---|\n| A. ${m[1]} | I. ${m[2]} |\n| B. ${m[3]} | II. ${m[4]} |\n| C. ${m[5]} | III. ${m[6]} |\n| D. ${m[7]} | IV. ${m[8]} |\n\nChoose the correct answer from the options given below:`;
}

const questionVisual = new Set([8,22,31,39,40,41,42,46,47,61,71,76,83,85,86,87,90,93,100]);
const optionVisual = new Set([56,72,73,89,97,185]);
const visualMap = {
  56: [null,2,null,3], 61: [1,3,4,5,6], 71: [1,2,3,5,6], 72: [1,2,3,4], 73: [2,3,4,5],
  83: [1,2,4,5,6], 85: [1,2,null,3,4], 87: [2,3,4,5,6], 89: [1,3,4,5],
  90: [1,2,3,4,5], 97: [1,2,3,4], 185: [2,3,4,5],
};

const source = JSON.parse(await fs.readFile(SOURCE, "utf8"));
const visualManifest = JSON.parse(await fs.readFile(VISUALS, "utf8"));
const visuals = new Map(visualManifest.map(x => [x.number, x.visuals]));
const rows = source.map(item => {
  const patch = overrides[item.number] || {};
  const files = (visuals.get(item.number) || []).map(v => v.file);
  const mapping = visualMap[item.number];
  let questionImage = null; let optionImages = [null,null,null,null];
  if (mapping) {
    if (mapping.length === 5) { questionImage = mapping[0] ? files[mapping[0]-1] : null; optionImages = mapping.slice(1).map(n => n ? files[n-1] : null); }
    else optionImages = mapping.map(n => n ? files[n-1] : null);
  } else if (questionVisual.has(item.number)) {
    questionImage = files.find((_,i) => {
      const v=(visuals.get(item.number)||[])[i]; return !((500<=v.width&&v.width<=520&&500<=v.height&&v.height<=520)||(125<=v.width&&v.width<=145&&35<=v.height&&v.height<=60));
    }) || null;
  }
  if (item.number === 100) {
    questionImage = path.join(ROOT, "tmp/neet-2023-clean/structured/visuals/neet-2023-q100-question.png");
    optionImages = [files[2] || null, files[3] || null, null, files[4] || null];
  }
  const table = matchingTable(item.question);
  return {
    ...item,
    question: patch.question ?? table ?? clean(item.question),
    option_a: patch.option_a ?? clean(item.option_a).replace("Refer to the source visual.", "Diagram shown."),
    option_b: patch.option_b ?? clean(item.option_b).replace("Refer to the source visual.", "Diagram shown."),
    option_c: patch.option_c ?? clean(item.option_c).replace("Refer to the source visual.", "Diagram shown."),
    option_d: patch.option_d ?? clean(item.option_d).replace("Refer to the source visual.", "Diagram shown."),
    question_image: questionImage, option_a_image: optionImages[0], option_b_image: optionImages[1],
    option_c_image: optionImages[2], option_d_image: optionImages[3], needs_review: false,
  };
});

await fs.mkdir(path.dirname(OUT), {recursive:true});
await fs.writeFile(OUT, JSON.stringify(rows,null,2));
console.log(JSON.stringify({total:rows.length,tables:rows.filter(q=>/\n\|/.test(q.question)).length,questionImages:rows.filter(q=>q.question_image).length,optionImages:rows.reduce((n,q)=>n+[q.option_a_image,q.option_b_image,q.option_c_image,q.option_d_image].filter(Boolean).length,0)}));
