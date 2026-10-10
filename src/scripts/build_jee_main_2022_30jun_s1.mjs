import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PAPER = "JEE-MAIN-22-30JUN-S1";
const alignment = JSON.parse(await fs.readFile(path.join(ROOT, "tmp/jee-main-2022", PAPER, "source-alignment.json"), "utf8"));
const outDir = path.join(ROOT, "scratch/jee2022/transcribed");

const chapterNames = {
  "magnetics": "Moving Charges and Magnetism",
  "communication-systems": "Communication Systems",
  "waves": "Waves",
  "current-electricity": "Current Electricity",
  "solid-state": "The Solid State",
  "s-block-elements": "The s-Block Elements",
  "chemistry-in-everyday-life": "Chemistry in Everyday Life",
  "surface-chemistry": "Surface Chemistry",
  "polymers": "Polymers",
  "matrices-and-determinants": "Matrices and Determinants",
  "sequences-and-series": "Sequences and Series",
  "definite-integration": "Integrals",
  "differential-equations": "Differential Equations",
  "circle": "Circles",
  "3d-geometry": "Three Dimensional Geometry",
  "vector-algebra": "Vector Algebra",
  "probability": "Probability",
  "mathematical-reasoning": "Mathematical Reasoning",
  "trigonometric-functions-and-equations": "Trigonometric Functions",
};

const ids = {
  13:"1l5w2th4o",19:"1l5w379rv",22:"1l5w3dm0l",26:"1l5w3lr3t",31:"1l5w5ekzw",38:"1l5w5vc6w",39:"1l5w5wxgq",42:"1l5w63j4e",43:"1l5w66f9j",48:"1l5w6dzq2",55:"1l5w6toqc",60:"1l5w74m67",65:"1l5vzdw08",67:"1l5vzhxr8",71:"1l5vzsdov",72:"1l5vzx4yi",74:"1l5w01mde",76:"1l5w09pb2",77:"1l5w0bd5u",78:"1l5w0d935",80:"1l5w0obkl",85:"1l5w0vbmu",90:"1l5w1pgj0",
};

const manual = {
  13:{chapter:"Moving Charges and Magnetism",question:"A cyclotron is working at a frequency of $10\\,\\text{MHz}$. If the radius of its dees is $60\\,\\text{cm}$, the maximum kinetic energy of the accelerated proton will be (take $e=1.6\\times10^{-19}\\,\\text{C}$ and $m_p=1.67\\times10^{-27}\\,\\text{kg}$):",o:["$7.4\\,\\text{MeV}$","$14.86\\,\\text{MeV}$","$7.4\\,\\text{GeV}$","$14.86\\,\\text{GeV}$"],a:"a"},
  19:{chapter:"Communication Systems",question:"A speech signal $11\\sin(2200\\pi t)\\,\\text{V}$ is used for amplitude modulation with a carrier signal $44\\sin(6600\\pi t)\\,\\text{V}$. The minimum amplitude of the modulated wave is:",o:["$33\\,\\text{V}$","$55\\,\\text{V}$","$8.25\\,\\text{V}$","$13.75\\,\\text{V}$"],a:"a"},
  22:{chapter:"Waves",type:"NUMERICAL",question:"An employee moving away from a factory by car listens to its siren. He drives at $72\\,\\text{km h}^{-1}$ in the direction of wind blowing at $72\\,\\text{km h}^{-1}$. The siren frequency is $720\\,\\text{Hz}$. Find the apparent frequency heard, assuming the speed of sound is $340\\,\\text{m s}^{-1}$.",a:"680"},
  26:{chapter:"Current Electricity",type:"NUMERICAL",question:"In the potentiometer circuit shown, the null point is at $120\\,\\text{cm}$ when $K_2$ is open and at $80\\,\\text{cm}$ when $K_2$ is closed. If the external resistance is $4\\,\\Omega$, find the internal resistance of the cell in $\\Omega$.",a:"2"},
  31:{chapter:"The Solid State",question:"An element $X$ has a body-centred cubic structure with cell edge $200\\,\\text{pm}$ and density $5\\,\\text{g cm}^{-3}$. The number of atoms in $300\\,\\text{g}$ of $X$ is (given $N_A=6.0\\times10^{23}\\,\\text{mol}^{-1}$):",o:["$5N_A$","$6N_A$","$15N_A$","$25N_A$"],a:"d"},
  38:{chapter:"The s-Block Elements",question:"Match List I with List II. List I: (a) sodium hydride, (b) silane, (c) vanadium hydride, (d) aluminium hydride. List II: (i) Lewis acid, (ii) saline hydride, (iii) molecular hydride, (iv) non-stoichiometric hydride.",o:["(a)-(ii), (b)-(iii), (c)-(iv), (d)-(i)","(a)-(ii), (b)-(iv), (c)-(iii), (d)-(i)","(a)-(iii), (b)-(ii), (c)-(i), (d)-(iv)","(a)-(i), (b)-(iii), (c)-(iv), (d)-(ii)"],a:"a"},
  39:{chapter:"The s-Block Elements",question:"Which statement about alkali-metal oxides is correct?",o:["Peroxides are coloured.","Superoxides are paramagnetic.","Oxides are paramagnetic.","Peroxides are both coloured and paramagnetic."],a:"b"},
  42:{chapter:"Chemistry in Everyday Life",question:"Which of the following chemicals has not been used for dry cleaning of clothes?",o:["Tetrachloroethene","Liquid $\\text{CO}_2$","Ethanol","$\\text{H}_2\\text{O}_2$"],a:"c"},
  43:{chapter:"Surface Chemistry",question:"TLC analysis of a mixture containing A, B and C on silica gel gives $R_f$ values $0.72$, $0.48$ and $0.20$, respectively. Which statement is not correct for column chromatography of this mixture?",o:["A is the most non-polar component.","C is the most soluble component in the mobile phase.","A will be eluted first.","C is the most strongly adsorbed component."],a:"b"},
  48:{chapter:"Polymers",question:"Match List I with List II. List I: (a) Acrilan, (b) Neoprene, (c) Polystyrene, (d) Buna-N. List II repeat units: (i) $[-\\text{CH}_2-\\text{C}(\\text{Cl})=\\text{CH}-\\text{CH}_2-]_n$; (ii) $[-\\text{CH}_2-\\text{CH}(\\text{C}_6\\text{H}_5)-]_n$; (iii) $[-\\text{CH}_2-\\text{CH}(\\text{CN})-]_n$; (iv) $[-\\text{CH}_2-\\text{CH}=\\text{CH}-\\text{CH}_2-\\text{CH}_2-\\text{CH}(\\text{CN})-]_n$.",o:["(a)-(iii), (b)-(iv), (c)-(ii), (d)-(i)","(a)-(iii), (b)-(ii), (c)-(i), (d)-(iv)","(a)-(iii), (b)-(i), (c)-(ii), (d)-(iv)","(a)-(ii), (b)-(iii), (c)-(i), (d)-(iv)"],a:"c"},
  55:{chapter:"Surface Chemistry",type:"NUMERICAL",question:"$100\\,\\text{mL}$ of $0.3\\,\\text{M}$ acetic acid is shaken with $0.8\\,\\text{g}$ wood charcoal. The final concentration is $0.125\\,\\text{M}$. The mass of acetic acid adsorbed per gram of carbon is $x\\times10^{-4}\\,\\text{g}$. Find $x$. (Molar mass of acetic acid $=60\\,\\text{g mol}^{-1}$.)",a:"13125"},
  60:{chapter:"Chemistry in Everyday Life",type:"NUMERICAL",question:"How many of the following drugs belong to the tranquilizer class: Veronal, Luminal, Propanal and Seconal?",a:"3"},
  65:{chapter:"Matrices and Determinants",question:"Let $A$ and $B$ be square matrices of order $2$. If $\\det(A)=2$, $\\det(B)=3$ and $\\det((\\det(5(\\det A)B))A^2)=2^a3^b5^c$ for some $a,b,c\\in\\mathbb{N}$, then $a+b+c$ equals:",o:["$10$","$12$","$13$","$14$"],a:"b"},
  67:{chapter:"Sequences and Series",question:"The value of $1+\\frac1{1+2}+\\frac1{1+2+3}+\\cdots+\\frac1{1+2+3+\\cdots+11}$ is:",o:["$\\frac{20}{11}$","$\\frac{11}{6}$","$\\frac{241}{132}$","$\\frac{21}{11}$"],a:"b"},
  71:{chapter:"Integrals",question:"Evaluate $\\displaystyle \\lim_{n\\to\\infty}\\sum_{r=1}^{n}\\frac{r}{2r^2-7rn+6n^2}$.",o:["$\\log_e\\!\\left(\\frac{\\sqrt3}{2}\\right)$","$\\log_e\\!\\left(\\frac{3\\sqrt3}{4}\\right)$","$\\log_e\\!\\left(\\frac{27}{4}\\right)$","$\\log_e\\!\\left(\\frac43\\right)$"],a:"b"},
  72:{chapter:"Differential Equations",question:"If $\\frac{dy}{dx}=\\frac{ax-by+a}{bx+cy+a}$, where $a,b,c\\in\\mathbb{R}$, represents a circle with centre $(\\alpha,\\beta)$, then $\\alpha+2\\beta$ equals:",o:["$-1$","$0$","$1$","$2$"],a:"c"},
  74:{chapter:"Circles",question:"Consider $C_1:x^2+y^2=r^2$, $C_2:(x-1)^2+(y-1)^2=1$ and $C_3:(x-2)^2+(y-1)^2=1$. A common tangent $L:y=mx+c$ has $C_1$ and $C_3$ on one side and $C_2$ on the other. Find $20(r^2+c^2)$.",o:["$23$","$11$","$12$","$6$"],a:"d"},
  76:{chapter:"Three Dimensional Geometry",question:"Find the distance of $(3,2,-1)$ from the plane $3x-y+4z+1=0$ measured along the line $\\frac{2-x}{2}=\\frac{y-3}{2}=\\frac{z+1}{1}$.",o:["$9$","$6$","$3$","$2$"],a:"c"},
  77:{chapter:"Vector Algebra",question:"Let $\\vec c$ be coplanar with $\\vec a=-\\hat i+\\hat j+\\hat k$ and $\\vec b=2\\hat i+\\hat j-\\hat k$. If $\\vec c\\cdot[(\\vec a+\\vec b)\\times(\\vec a\\times\\vec b)]=-42$ and $(\\vec c\\times(\\vec a-\\vec b))\\cdot\\hat k=3$, then $|\\vec c|^2$ equals:",o:["$24$","$29$","$35$","$42$"],a:"c"},
  78:{chapter:"Probability",question:"A random variable $X$ follows $B(5,p)$ and $P(X=0)=P(X=1)$. Find $\\frac{P(X=2)}{P(X=3)}$.",o:["$4$","$10$","$25$","$5$"],a:"d"},
  80:{chapter:"Mathematical Reasoning",question:"The conditional statement $((p\\land q)\\to((\\neg p)\\lor r))\\lor(((\\neg p)\\lor r)\\to(p\\land q))$ is:",o:["a tautology","a contradiction","equivalent to $p\\land q$","equivalent to $(\\neg p)\\lor r$"],a:"a"},
  85:{chapter:"Sequences and Series",type:"NUMERICAL",question:"Let $f(t)=\\displaystyle\\int_0^t e^{x^3}\\left(\\frac{x^8}{(x^6+2x^3+2)^2}\\right)dx$. If $f(1)+f'(1)=\\alpha e-\\frac16$, find $150\\alpha$.",a:"2"},
  90:{chapter:"Trigonometric Functions",type:"NUMERICAL",question:"Let $S_1=\\{x\\in[0,12\\pi]:\\sin^5x+\\cos^5x=1\\}$ and $S_2=\\{x\\in[0,8\\pi]:\\sin^7x+\\cos^7x=1\\}$. Find $n(S_1)-n(S_2)$.",a:"4"},
};

function base(number, subject, source = {}) {
  return {
    source_question_number: number,
    question_number: number,
    subject,
    chapter: source.chapter || "",
    question_type: source.question_type || "MCQ",
    question: source.question || "",
    option_a: source.option_a || "", option_b: source.option_b || "", option_c: source.option_c || "", option_d: source.option_d || "",
    correct_option: String(source.correct_option || "").toLowerCase(),
    question_image: null, option_a_image: null, option_b_image: null, option_c_image: null, option_d_image: null,
    alignment_score: source.alignment_score ?? 1,
    paper_code: PAPER,
    source_url: source.source_url || (ids[number] ? `https://hive.pracbee.com/questions/${ids[number]}` : null),
  };
}

const sourceByNumber = new Map(alignment.questions.map(q => [q.question_number, q]));
const rows = [];
for (let n=1;n<=90;n++) {
  const subject=n<=30?"Physics":n<=60?"Chemistry":"Mathematics";
  if (sourceByNumber.has(n)) rows.push(base(n,subject,sourceByNumber.get(n)));
  else {
    const x=manual[n];
    if (!x) throw new Error(`Missing manual row ${n}`);
    const row=base(n,subject);
    row.chapter=x.chapter; row.question_type=x.type||"MCQ"; row.question=x.question; row.correct_option=x.a;
    if (x.o) [row.option_a,row.option_b,row.option_c,row.option_d]=x.o;
    rows.push(row);
  }
}

await fs.mkdir(outDir,{recursive:true});
for (const subject of ["Physics","Chemistry","Mathematics"]) {
  await fs.writeFile(path.join(outDir,`${PAPER}_${subject.toLowerCase()}.json`),`${JSON.stringify(rows.filter(r=>r.subject===subject),null,2)}\n`);
}
console.log(JSON.stringify({paper_code:PAPER,questions:rows.length,manual:Object.keys(manual).length},null,2));
