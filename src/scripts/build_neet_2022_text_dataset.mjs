import fs from "node:fs/promises";
import path from "node:path";

const ROOT=process.cwd();
const SOURCE=path.join(ROOT,"tmp/neet-2022-clean/source/base-manifest.json");
const VISUALS=path.join(ROOT,"tmp/neet-2022-clean/structured/visuals/visual-manifest.json");
const OUT=path.join(ROOT,"tmp/neet-2022-clean/structured/neet-2022-structured-draft.json");
const L=String.raw;

const overrides={
  3:{question:L`Let $T_1$ and $T_2$ be the energies of an electron in the first and second excited states of the hydrogen atom, respectively. According to Bohr's model, the ratio $T_1:T_2$ is:`},
  4:{question:"Two objects of masses $10\,\\mathrm{kg}$ and $20\,\\mathrm{kg}$ are connected to the ends of a rigid, massless rod of length $10\,\\mathrm{m}$. The distance of the centre of mass from the $10\,\\mathrm{kg}$ mass is:",option_a:"$\\dfrac{10}{3}\,\\mathrm{m}$",option_b:"$\\dfrac{20}{3}\,\\mathrm{m}$"},
  6:{option_a:"$\\sqrt2:1$",option_b:"$2:1$",option_c:"$4:1$",option_d:"$1:\\sqrt2$"},
  7:{question:"The angular speed of a flywheel undergoing uniform angular acceleration changes from $1200\,\\mathrm{rpm}$ to $3120\,\\mathrm{rpm}$ in $16\,\\mathrm{s}$. Its angular acceleration is:",option_a:"$2\\pi\,\\mathrm{rad\,s^{-2}}$",option_b:"$4\\pi\,\\mathrm{rad\,s^{-2}}$",option_c:"$12\\pi\,\\mathrm{rad\,s^{-2}}$",option_d:"$104\\pi\,\\mathrm{rad\,s^{-2}}$"},
  10:{question:"When light propagates through a medium of relative permittivity $\\varepsilon_r$ and relative permeability $\\mu_r$, its speed $v$ is: ($c$ is the speed of light in vacuum.)",option_a:"$v=c$",option_b:"$v=c\\sqrt{\\mu_r/\\varepsilon_r}$",option_c:"$v=c\\sqrt{\\varepsilon_r\\mu_r}$",option_d:"$v=\\dfrac{c}{\\sqrt{\\varepsilon_r\\mu_r}}$"},
  11:{option_a:"$6.28\\times10^{-2}\,\\mathrm{T}$",option_b:"$12.56\\times10^{-2}\,\\mathrm{T}$",option_c:"$12.26\\times10^{-4}\,\\mathrm{T}$",option_d:"$6.28\\times10^{-4}\,\\mathrm{T}$"},
  12:{option_c:"$\\sqrt2$ times the rms voltage",option_d:"$1/\\sqrt2$ times the rms voltage"},
  15:{question:"A copper wire of length $10\,\\mathrm{m}$ and radius $10^{-2}/\\sqrt\\pi\,\\mathrm{m}$ has resistance $10\,\\Omega$. The current density for an electric field of $10\,\\mathrm{V\,m^{-1}}$ is:",option_a:"$10^4\,\\mathrm{A\,m^{-2}}$",option_b:"$10^6\,\\mathrm{A\,m^{-2}}$",option_c:"$10^{-5}\,\\mathrm{A\,m^{-2}}$",option_d:"$10^5\,\\mathrm{A\,m^{-2}}$"},
  16:{question:"The dimensions $[MLT^{-2}A^{-2}]$ belong to:"},
  17:{option_a:"$1:1$",option_b:"$\\sqrt2:1$",option_c:"$1:\\sqrt2$",option_d:"$1:2$"},
  19:{question:"The displacement-time graphs of two particles make angles of $30^\\circ$ and $45^\\circ$ with the time axis, as shown. The ratio of their velocities is:",option_a:"$\\sqrt3:1$",option_d:"$1:\\sqrt3$"},
  21:{option_a:"$3.6\\times10^8\,\\mathrm{J}$",option_b:"$3.6\\times10^5\,\\mathrm{J}$",option_c:"$3.6\\times10^6\,\\mathrm{J}$",option_d:"$1\\times10^5\,\\mathrm{J}$"},
  24:{question:"A shell initially at rest explodes into three fragments whose masses are in the ratio $2:2:1$. The two equal fragments fly off in mutually perpendicular directions with speed $v$. The speed of the third fragment is:",option_a:"$v$",option_b:"$2v$",option_c:"$2\\sqrt2v$",option_d:"$3\\sqrt2v$"},
  27:{question:"In the nuclear reaction $^{22}_{11}\\mathrm{Na}\\to X+e^++\\nu$, the element $X$ is:",option_a:"$^{23}_{11}\\mathrm{Na}$",option_b:"$^{23}_{10}\\mathrm{Ne}$",option_c:"$^{22}_{10}\\mathrm{Ne}$",option_d:"$^{22}_{12}\\mathrm{Mg}$"},
  33:{question:"Two resistors of $100\,\\Omega$ and $200\,\\Omega$ are connected in parallel. The ratio of heat developed in them in a given time, $H_{100}:H_{200}$, is:"},
  34:{question:"When monochromatic light of frequencies $\\nu$ and $\\nu/2$ is incident on a photoelectric metal, the stopping potentials are $V_s/2$ and $V_s$, respectively. The threshold frequency is:",option_a:"$2\\nu$",option_b:"$3\\nu$",option_c:"$2\\nu/3$",option_d:"$3\\nu/2$"},
  36:{option_a:"$1/R^2$",option_b:"$1/R^3$",option_c:"$1/R^4$",option_d:"$1/R^6$"},
  37:{option_a:"$1.38\\times10^3$",option_d:"$1.4\\times10^3$"},
  38:{option_a:"| A | B | C |\n|---:|---:|---:|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |",option_b:"| A | B | C |\n|---:|---:|---:|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |",option_c:"| A | B | C |\n|---:|---:|---:|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |",option_d:"| A | B | C |\n|---:|---:|---:|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |"},
  41:{question:"A series LCR circuit with $L=10\,\\mathrm{H}$, $C=10\,\\mu\\mathrm{F}$ and $R=50\,\\Omega$ is connected to $V=200\\sin(100t)\,\\mathrm{V}$. If $\\nu_0$ is its resonant frequency and $\\nu$ is the source frequency, then:",option_a:"$\\nu_0=\\nu=50\,\\mathrm{Hz}$",option_b:"$\\nu_0=\\nu=50/\\pi\,\\mathrm{Hz}$",option_c:"$\\nu_0=50\,\\mathrm{Hz},\\;\\nu=50/\\pi\,\\mathrm{Hz}$",option_d:"$\\nu_0=100/\\pi\,\\mathrm{Hz},\\;\\nu=100\,\\mathrm{Hz}$"},
  45:{option_a:"$4.5\\times10^{-6}\,\\mathrm{J}$",option_b:"$3.25\\times10^{-6}\,\\mathrm{J}$",option_c:"$2.25\\times10^{-6}\,\\mathrm{J}$",option_d:"$1.5\\times10^{-6}\,\\mathrm{J}$"},
  48:{option_a:"$5.6\\times10^6\,\\mathrm{m^3}$",option_b:"$5.6\\times10^3\,\\mathrm{m^3}$",option_c:"$5.6\\times10^{-3}\,\\mathrm{m^3}$",option_d:"$5.6\,\\mathrm{m^3}$"},
  49:{option_b:"$5\\sqrt3\,\\mathrm{m\,s^{-1}}$",option_c:"$5\,\\mathrm{m\,s^{-1}}$"},
  50:{option_a:"$\\sin^{-1}(0.500)$",option_b:"$\\sin^{-1}(0.750)$",option_c:"$\\tan^{-1}(0.500)$",option_d:"$\\tan^{-1}(0.750)$"},
  52:{option_a:"$p=p_1+p_2+p_3$",option_b:"$p=\\dfrac{n_1RT}{V}+\\dfrac{n_2RT}{V}+\\dfrac{n_3RT}{V}$",option_c:"$p_i=\\chi_i p$",option_d:"$p_i=\\chi_i p_i^\\circ$"},
  64:{question:"In the reaction $\\mathrm{RMgX+CO_2\\xrightarrow{dry\ ether}Y\\xrightarrow{H_3O^+}RCOOH}$, what is $Y$?",option_a:"$\\mathrm{RCOO^-Mg^+X}$",option_b:"$\\mathrm{R_3CO^-Mg^+X}$",option_c:"$\\mathrm{RCOO^-X^+}$",option_d:"$\\mathrm{(RCOO)_2Mg}$"},
  73:{option_d:"The shapes of $d_{xy}$, $d_{yz}$ and $d_{zx}$ are similar to one another; and those of $d_{x^2-y^2}$ and $d_{z^2}$ are similar to one another."},
  79:{option_a:"Benzene + $\\mathrm{Cl_2}$ / anhydrous $\\mathrm{FeCl_3}$",option_b:"Phenol + $\\mathrm{NaNO_2/HCl}$, then $\\mathrm{CuCl}$",option_c:"Diagram shown.",option_d:"Diagram shown."},
  92:{option_a:"Diagram shown.",option_b:"Diagram shown.",option_c:"Diagram shown.",option_d:"Diagram shown."},
  93:{option_a:"1-bromo-5-chloro-4-methylhexan-3-ol",option_b:"6-bromo-2-chloro-4-methylhexan-4-ol",option_c:"1-bromo-4-chloro-5-methylhexan-3-ol",option_d:"6-bromo-4-chloro-4-methylhexan-4-ol"},
  100:{option_a:"Diagram shown.",option_b:"Diagram shown.",option_c:"Diagram shown.",option_d:"Diagram shown."},
  121:{option_d:"(a), (c), (d) and (e) only",question:"Read the statements about vascular bundles:\n\n(a) In roots, xylem and phloem are arranged alternately along different radii.\n\n(b) Conjoint closed vascular bundles do not possess cambium.\n\n(c) In open vascular bundles, cambium occurs between xylem and phloem.\n\n(d) Dicot stems possess endarch protoxylem.\n\n(e) Monocot roots usually have more than six xylem bundles.\n\nChoose the correct answer:"}
};

const tables={
23:[["AM radio waves","$10^{-10}\,\\mathrm m$"],["Microwaves","$10^2\,\\mathrm m$"],["Infrared radiation","$10^{-2}\,\\mathrm m$"],["X-rays","$10^{-10}\,\\mathrm m$"]],
42:[["Gravitational constant, $G$","$[L^2T^{-2}]$"],["Gravitational potential energy","$[M^{-1}L^3T^{-2}]$"],["Gravitational potential","$[LT^{-2}]$"],["Gravitational intensity","$[ML^2T^{-2}]$"]],
70:[["Antacids","Salvarsan"],["Antihistamines","Morphine"],["Analgesics","Cimetidine"],["Antimicrobials","Seldane"]],
78:[["Li","Absorbent for carbon dioxide"],["Na","Electrochemical cells"],["KOH","Coolant in fast breeder reactors"],["Cs","Photoelectric cell"]],
81:[["Cyanohydrin","$\\mathrm{NH_2OH}$"],["Acetal","$\\mathrm{RNH_2}$"],["Schiff's base","Alcohol"],["Oxime","HCN"]],
83:[["$\\mathrm{MgH_2}$","Electron precise"],["$\\mathrm{GeH_4}$","Electron deficient"],["$\\mathrm{B_2H_6}$","Electron rich"],["HF","Ionic"]],
86:[["Haematite","$\\mathrm{Fe_3O_4}$"],["Magnetite","$\\mathrm{ZnCO_3}$"],["Calamine","$\\mathrm{Fe_2O_3}$"],["Kaolinite","$\\mathrm{Al_2(OH)_4Si_2O_5}$"]],
107:[["Manganese","Activates catalase"],["Magnesium","Required for pollen germination"],["Boron","Activates respiratory enzymes"],["Iron","Functions in water splitting during photosynthesis"]],
147:[["Spirogyra","Dominant diploid vascular sporophyte with highly reduced gametophytes"],["Fern","Dominant haploid free-living gametophyte"],["Funaria","Dominant sporophyte alternating with a reduced prothallus"],["Cycas","Dominant leafy gametophyte with a partly dependent sporophyte"]],
148:[["Metacentric chromosome","Centromere near an end; one extremely short and one long arm"],["Acrocentric chromosome","Centromere at the terminal end"],["Submetacentric chromosome","Centromere in the middle; two equal arms"],["Telocentric chromosome","Centromere slightly off-centre; one short and one long arm"]],
190:[["Glycogen","Hormone"],["Globulin","Biocatalyst"],["Steroids","Antibody"],["Thrombin","Storage product"]],
191:[["Diaphragms","Inhibit ovulation and implantation"],["Contraceptive pills","Increase phagocytosis of sperm in uterus"],["Intrauterine devices","Absence of menstrual cycle and ovulation after parturition"],["Lactational amenorrhoea","Cover the cervix and block sperm entry"]],
197:[["Bronchioles","Dense regular connective tissue"],["Goblet cell","Loose connective tissue"],["Tendons","Glandular tissue"],["Adipose tissue","Ciliated epithelium"]]
};

function clean(v){return String(v??"").replace(/^Question\s+\d+:\s*/i,"").replaceAll("–","-").replaceAll("−","-").replaceAll("Ω","$\\Omega$").replaceAll("π","$\\pi$").replaceAll("λ","$\\lambda$").replaceAll("ν","$\\nu$").replaceAll("µ","$\\mu$").replace(/\s+/g," ").trim()}
function tableQuestion(n){const r=tables[n];if(!r)return null;return `Match List I with List II:\n\n| List I | List II |\n|---|---|\n${r.map((x,i)=>`| ${"ABCD"[i]}. ${x[0]} | ${["I","II","III","IV"][i]}. ${x[1]} |`).join("\n")}\n\nChoose the correct answer from the options below:`}
function artifact(v){return (v.width>=500&&v.width<=520&&v.height>=500&&v.height<=520)||(v.width>=125&&v.width<=145&&v.height>=35&&v.height<=60)}

const src=JSON.parse(await fs.readFile(SOURCE,"utf8"));
const vm=JSON.parse(await fs.readFile(VISUALS,"utf8"));const visualBy=new Map(vm.map(x=>[x.number,x.visuals]));
const questionVisual=new Set([4,8,19,31,32,36,38,45,47,85,93]);
const optionMap={1:[2,3,4,5],61:[3,4,5,7],67:[3,4,5,6],76:[3,4,5,6],79:[null,null,1,2],92:[1,2,3,5],100:[2,5,6,7]};
const rows=src.map(item=>{const p=overrides[item.number]||{};const vs=visualBy.get(item.number)||[];let qi=null,oi=[null,null,null,null];if(questionVisual.has(item.number))qi=(vs.find(v=>!artifact(v))||{}).file||null;if(optionMap[item.number])oi=optionMap[item.number].map(i=>i?vs[i-1]?.file||null:null);const base={...item,question:p.question??tableQuestion(item.number)??clean(item.question),option_a:p.option_a??clean(item.option_a),option_b:p.option_b??clean(item.option_b),option_c:p.option_c??clean(item.option_c),option_d:p.option_d??clean(item.option_d)};for(const k of ["a","b","c","d"])if(!base[`option_${k}`]&&oi["abcd".indexOf(k)])base[`option_${k}`]="Diagram shown.";return {...base,question_image:qi,option_a_image:oi[0],option_b_image:oi[1],option_c_image:oi[2],option_d_image:oi[3],needs_review:false}});
await fs.writeFile(OUT,JSON.stringify(rows,null,2));
const bad=rows.filter(q=>[q.question,q.option_a,q.option_b,q.option_c,q.option_d].some(x=>!String(x).trim()));
console.log(JSON.stringify({total:rows.length,tables:rows.filter(q=>q.question.includes("\n|")).length,questionImages:rows.filter(q=>q.question_image).length,optionImages:rows.reduce((n,q)=>n+[q.option_a_image,q.option_b_image,q.option_c_image,q.option_d_image].filter(Boolean).length,0),empty:bad.map(q=>q.number),dropped:rows.filter(q=>q.correct_option==="none").map(q=>q.number)},null,2));
