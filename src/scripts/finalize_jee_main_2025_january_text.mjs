import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "tmp/jee-main-2025-january-clean");
const CODES = (await fs.readdir(ROOT)).filter((name) => /^JEE-MAIN-25-\d\dJAN-S[12]$/.test(name) && name !== "JEE-MAIN-25-22JAN-S1").sort();

function normalizeMath(value) {
  if (value == null) return value;
  return String(value).split("$").map((part, index) => {
    if (index % 2) return part; // Never rewrite already-authored LaTeX.
    return part
      .replaceAll("−", "-")
      .replace(/(\d+(?:\.\d+)?)\s*×\s*10\s*([+-]?\d+)/g, (_, coefficient, power) =>
        `$${coefficient}\\times10^{${power}}$`)
      .replace(/\b([A-Za-zΑ-Ωα-ω]+)_([A-Za-z0-9]+)\b/g, (_, base, subscript) => `$${base}_{${subscript}}$`);
  }).join("$").replace(/\s+/g, " ").trim();
}

const OVERRIDES = {
  "JEE-MAIN-25-28JAN-S1": {
    50: {
      question: "The moment of inertia of a solid disc about a diameter is 2.5 times the moment of inertia of a ring about a diameter. A solid sphere has the same radius and mass as the disc and rotates about a diameter. If its moment of inertia is $n$ times that of the ring, find $n$.",
    },
  },
  "JEE-MAIN-25-22JAN-S2": {
    1: {
      question: "For a $3\\times3$ matrix $M$, let $\\operatorname{tr}(M)$ denote the sum of its diagonal elements. Let $A$ be a $3\\times3$ matrix such that $|A|=1$ and $\\operatorname{tr}(A)=3$. If $B=\\operatorname{adj}(\\operatorname{adj}(2A))$, then $|B|+\\operatorname{tr}(B)$ equals:",
      option_a: "256", option_b: "132", option_c: "174", option_d: "280",
    },
    39: {
      question: "A series LCR circuit is connected to an alternating source of emf $E$. The current amplitude at resonance is $I_0$. If the resistance becomes twice its initial value, then the current amplitude at resonance will be:",
      option_a: "$2I_0$", option_b: "$I_0$", option_c: "$I_0/2$", option_d: "$I_0/\\sqrt2$",
    },
    46: {
      question: "A proton moves undeflected in mutually perpendicular electric and magnetic fields with speed $2\\times10^5\\,\\mathrm{m\\,s^{-1}}$. When the electric field is switched off, it moves in a circle of radius $2\\,\\mathrm{cm}$. If the electric-field magnitude is $x\\times10^4\\,\\mathrm{N\\,C^{-1}}$, find $x$. Take the proton mass as $1.6\\times10^{-27}\\,\\mathrm{kg}$.",
    },
  },
  "JEE-MAIN-25-23JAN-S2": {
    31: {
      question: "Water of mass $m$ grams is slowly heated from temperature $T_1$ to $T_2$. If the specific heat of water is $1\\,\\mathrm{J\\,g^{-1}K^{-1}}$, the change in entropy of the water is:",
      option_a: "$m\\ln(T_2/T_1)$", option_b: "Zero", option_c: "$m\\ln(T_1/T_2)$", option_d: "$m(T_2-T_1)$",
    },
    32: {
      question: "Water flows through a horizontal pipe whose end is controlled by a valve. The pressure-gauge reading is $P_1$ when the valve is closed and $P_2$ when it is open. The speed of water in the pipe is proportional to:",
      option_a: "$P_1-P_2$", option_b: "$(P_1-P_2)^2$", option_c: "$(P_1-P_2)^4$", option_d: "$\\sqrt{P_1-P_2}$",
    },
    52: {
      question: "Consider the reactions $\\mathrm{K_2Cr_2O_7\\xrightarrow{KOH}[A]\\xrightarrow{H_2SO_4}[B]+K_2SO_4}$. The products $[A]$ and $[B]$, respectively, are:",
      option_a: "$\\mathrm{K_2CrO_4}$ and $\\mathrm{CrO_3}$", option_b: "$\\mathrm{K_2CrO_4}$ and $\\mathrm{Cr_2O_3}$", option_c: "$\\mathrm{K_2CrO_4}$ and $\\mathrm{K_2Cr_2O_7}$", option_d: "$\\mathrm{K_2Cr(OH)_6}$ and $\\mathrm{Cr_2O_3}$",
    },
  },
  "JEE-MAIN-25-24JAN-S2": {
    33: {
      question: "A solid sphere and a hollow sphere having the same mass and radius roll down the same inclined plane. If the times taken to reach the bottom are $t_1$ and $t_2$, respectively, then:",
      option_a: "$t_1>t_2$", option_b: "$t_1=t_2$", option_c: "$t_1<t_2$", option_d: "$t_1=2t_2$",
    },
    41: {
      question: "The temperature of a body in air falls from $40^\\circ\\mathrm C$ to $24^\\circ\\mathrm C$ in 4 minutes. If the air temperature is $16^\\circ\\mathrm C$, the body's temperature after the next 4 minutes will be:",
      option_a: "$14^\\circ\\mathrm C$", option_b: "$42^\\circ\\mathrm C$", option_c: "$18^\\circ\\mathrm C$", option_d: "$36^\\circ\\mathrm C$",
    },
    60: {
      question: "A compound contains $54.2\\%$ carbon, $9.2\\%$ hydrogen and $36.6\\%$ oxygen. If its molar mass is $132\\,\\mathrm{g\\,mol^{-1}}$, its molecular formula is: (Relative atomic masses: $\\mathrm{C:H:O}=12:1:16$)",
      option_a: "$\\mathrm{C_4H_9O_3}$", option_b: "$\\mathrm{C_6H_{12}O_6}$", option_c: "$\\mathrm{C_4H_8O_2}$", option_d: "$\\mathrm{C_6H_{12}O_3}$",
    },
    71: {
      question: "In the Carius method for halogen estimation, $0.25\\,\\mathrm g$ of an organic compound gives $0.15\\,\\mathrm g$ of $\\mathrm{AgBr}$. If the percentage of bromine is written as $x\\times10^{-1}\\%$, find the nearest integer $x$. (Molar masses: $\\mathrm{Ag}=108$ and $\\mathrm{Br}=80\\,\\mathrm{g\\,mol^{-1}}$.)",
    },
  },
  "JEE-MAIN-25-28JAN-S2": {
    43: {
      question: "A parallel-plate capacitor of capacitance $1\\,\\mu\\mathrm F$ is charged to a potential difference of $20\\,\\mathrm V$. The separation between its plates is $1\\,\\mu\\mathrm m$. The energy density between the plates is:",
      option_a: "$2\\times10^{-4}\\,\\mathrm{J\\,m^{-3}}$", option_b: "$1.8\\times10^5\\,\\mathrm{J\\,m^{-3}}$", option_c: "$1.8\\times10^3\\,\\mathrm{J\\,m^{-3}}$", option_d: "$2\\times10^2\\,\\mathrm{J\\,m^{-3}}$",
    },
    48: {
      question: "An electric dipole of moment $6\\times10^{-6}\\,\\mathrm{C\\,m}$ is placed in a uniform electric field of magnitude $10^6\\,\\mathrm{V\\,m^{-1}}$. Initially its dipole moment is parallel to the field. The work required to make it antiparallel to the field is ____ J.",
    },
    50: {
      question: "A solid copper cube of edge $10\\,\\mathrm{cm}$ is subjected to a hydraulic pressure of $7\\times10^6\\,\\mathrm{Pa}$. Its volume contraction, in $\\mathrm{mm^3}$, is ____. Take the bulk modulus of copper as $1.4\\times10^{11}\\,\\mathrm{N\\,m^{-2}}$.",
    },
  },
  "JEE-MAIN-25-29JAN-S1": {
    43: {
      question: "Currents $I_1$ and $I_2$ flow simultaneously in two nearby coils 1 and 2. If $L_1$ is the self-inductance of coil 1 and $M_{12}$ is the mutual inductance of coil 1 with respect to coil 2, the induced emf in coil 1 is:",
      option_a: "$\\varepsilon_1=-L_1\\dfrac{dI_2}{dt}-M_{12}\\dfrac{dI_1}{dt}$", option_b: "$\\varepsilon_1=-L_1\\dfrac{dI_1}{dt}-M_{12}\\dfrac{dI_2}{dt}$", option_c: "$\\varepsilon_1=-L_1\\dfrac{dI_1}{dt}-M_{12}\\dfrac{dI_1}{dt}$", option_d: "$\\varepsilon_1=-L_1\\dfrac{dI_1}{dt}+M_{12}\\dfrac{dI_2}{dt}$",
    },
  },
  "JEE-MAIN-25-29JAN-S2": {
    13: {
      question: "If $\\alpha x+\\beta y=109$ is the equation of the chord of the ellipse $\\dfrac{x^2}{9}+\\dfrac{y^2}{4}=1$ whose midpoint is $(5/2,1)$, then $\\alpha+\\beta$ equals:",
      option_a: "58", option_b: "46", option_c: "37", option_d: "72",
    },
    28: {
      question: "Two equal masses $A$ and $B$ are suspended from massless springs of force constants $k_1$ and $k_2$, respectively. They oscillate vertically with equal amplitudes. The ratio of the maximum velocity of $A$ to that of $B$ is:",
      option_a: "$k_1/k_2$", option_b: "$\\sqrt{k_1/k_2}$", option_c: "$\\sqrt{k_2/k_1}$", option_d: "$k_2/k_1$",
    },
    47: {
      question: "A parallel-plate capacitor consists of two circular plates of radius $10\\,\\mathrm{cm}$ and is charged by a constant current of $0.15\\,\\mathrm A$. If the potential difference changes at $7\\times10^8\\,\\mathrm{V\\,s^{-1}}$, find the integer value of the plate separation in $\\mu\\mathrm m$. Take $\\varepsilon_0=9\\times10^{-12}\\,\\mathrm{F\\,m^{-1}}$ and $\\pi=22/7$.",
    },
  },
};

const report = [];
for (const code of CODES) {
  const file = path.join(ROOT, code, "structured-dataset.json");
  const rows = JSON.parse(await fs.readFile(file, "utf8"));
  for (const row of rows) {
    Object.assign(row, OVERRIDES[code]?.[row.number] || {});
    for (const field of ["question", "option_a", "option_b", "option_c", "option_d"]) {
      row[field] = normalizeMath(row[field]);
    }
    // An option with an exact structural crop must not simultaneously display
    // unreliable flattened OCR text.
    for (const letter of ["a", "b", "c", "d"]) {
      const imageField = `option_${letter}_image`;
      const textField = `option_${letter}`;
      if (row[imageField]) row[textField] = "";
    }
  }
  const failures = [];
  if (rows.length !== 75 || rows.some((row, index) => row.number !== index + 1)) failures.push("sequence");
  for (const row of rows) {
    if (!String(row.question || "").trim()) failures.push(`Q${row.number}: blank question`);
    if ((String(row.question).match(/\$/g) || []).length % 2) failures.push(`Q${row.number}: unbalanced question LaTeX`);
    if (row.question_type === "MCQ") {
      for (const letter of ["a", "b", "c", "d"]) {
        if (!String(row[`option_${letter}`] || "").trim() && !row[`option_${letter}_image`]) failures.push(`Q${row.number}: missing option ${letter.toUpperCase()}`);
      }
    }
  }
  if (failures.length) throw new Error(`${code}: ${failures.join("; ")}`);
  await fs.writeFile(file, JSON.stringify(rows, null, 2) + "\n");
  report.push({ paperCode: code, questions: 75, mcq: rows.filter((q) => q.question_type === "MCQ").length, numerical: rows.filter((q) => q.question_type === "NUMERICAL").length });
}
console.log(JSON.stringify(report, null, 2));
