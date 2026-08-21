import fs from "node:fs/promises";import path from "node:path";
const ROOT=process.cwd(),DIR=path.join(ROOT,"tmp/neet-2021-clean/structured");
const SOURCE=path.join(ROOT,"tmp/neet-2021-clean/source/base-manifest.json"),VISUALS=path.join(DIR,"visuals/visual-manifest.json"),OUT=path.join(DIR,"neet-2021-structured-draft.json");
const L=String.raw;
const overrides={
1:{question:L`A radioactive nucleus $^A_ZX$ undergoes spontaneous decay in the sequence $^A_ZX\to B\to C\to D$, where the atomic numbers of $B$, $C$ and $D$ are $Z-1$, $Z-3$ and $Z-2$, respectively. The possible decay particles are:`,option_a:"$\\beta^+,\\alpha,\\beta^-$",option_b:"$\\beta^-,\\alpha,\\beta^+$",option_c:"$\\alpha,\\beta^-,\\beta^+$",option_d:"$\\alpha,\\beta^+,\\beta^-$"},
4:{question:L`Match the physical quantities in Column I with their mathematical relations in Column II:

| Column I | Column II |
|---|---|
| A. Drift velocity | P. $m/(ne^2\rho)$ |
| B. Electrical resistivity | Q. $ne v_d$ |
| C. Relaxation time | R. $eE\tau/m$ |
| D. Current density | S. $E/J$ |

Choose the correct match:`},
8:{question:"A cup of coffee cools from $90^\\circ\\mathrm C$ to $80^\\circ\\mathrm C$ in $t$ minutes when the room temperature is $20^\\circ\\mathrm C$. The time required for a similar cup to cool from $80^\\circ\\mathrm C$ to $60^\\circ\\mathrm C$ in the same room is:",option_a:"$10t/13$",option_b:"$5t/13$",option_c:"$13t/10$",option_d:"$13t/5$"},
9:{question:"A capacitor $C$ is connected across $V=V_0\\sin\\omega t$. The displacement current between its plates is:",option_a:"$I_d=\\dfrac{V_0}{C}\\omega\\sin\\omega t$",option_b:"$I_d=V_0C\\omega\\sin\\omega t$",option_c:"$I_d=V_0C\\omega\\cos\\omega t$",option_d:"$I_d=\\dfrac{V_0}{C}\\omega\\cos\\omega t$"},
10:{question:"A small block slides from rest down a smooth inclined plane. Let $S_n$ be the distance travelled during the interval $t=n-1$ to $t=n$. The ratio $S_{n+1}/S_n$ is:",option_a:"$\\dfrac{2n+1}{2n-1}$",option_b:"$\\dfrac{2n}{2n-1}$",option_c:"$\\dfrac{2n-1}{2n}$",option_d:"$\\dfrac{2n+1}{2n-1}$"},
12:{question:"For a plane electromagnetic wave propagating along the $x$-direction, which pair gives possible directions for $\\vec E$ and $\\vec B$, respectively?",option_a:"$\\hat j+\\hat k,\\;\\hat j-\\hat k$",option_b:"$-\\hat j+\\hat k,\\;-\\hat j+\\hat k$",option_c:"$\\hat j+\\hat k,\\;\\hat j+\\hat k$",option_d:"$-\\hat j+\\hat k,\\;-\\hat j-\\hat k$"},
16:{question:"Two charged conducting spheres of radii $R_1$ and $R_2$ are connected by a wire. The ratio of their surface charge densities $\\sigma_1/\\sigma_2$ is:",option_a:"$(R_1/R_2)^2$",option_b:"$R_2^2/R_1^2$",option_c:"$R_1/R_2$",option_d:"$R_2/R_1$"},
18:{question:"An infinitely long straight conductor carries $5\\,\\mathrm A$. An electron moves parallel to it at $10^5\\,\\mathrm{m\\,s^{-1}}$, at a perpendicular distance of $20\\,\\mathrm{cm}$. The force on the electron is:",option_a:"$4\\pi\\times10^{-20}\\,\\mathrm N$",option_b:"$8\\times10^{-20}\\,\\mathrm N$",option_c:"$4\\times10^{-20}\\,\\mathrm N$",option_d:"$8\\pi\\times10^{-20}\\,\\mathrm N$"},
26:{question:"An electromagnetic wave of wavelength $\\lambda$ is incident on a photosensitive surface of negligible work function. If the emitted photoelectron has mass $m$ and de Broglie wavelength $\\lambda_d$, then:",option_a:"$\\lambda_d^2=\\dfrac{h\\lambda}{2mc}$",option_b:"$\\lambda_d^2=\\dfrac{h^2\\lambda}{2mc}$",option_c:"$\\lambda_d^2=\\dfrac{m\\lambda}{2hc}$",option_d:"$\\lambda_d^2=\\dfrac{mc\\lambda}{2h}$"},
27:{question:L`Match Column I with Column II:

| Column I | Column II |
|---|---|
| A. Root-mean-square speed | P. $\frac13 nm\overline{v^2}$ |
| B. Pressure of an ideal gas | Q. $\sqrt{3RT/M}$ |
| C. Average kinetic energy per molecule | R. $\frac52RT$ |
| D. Internal energy of one mole of a diatomic gas | S. $\frac32k_BT$ |

Choose the correct match:`},
29:{question:"A parallel-plate capacitor has uniform field $E$ between plates of area $A$ separated by $d$. Its stored energy is: ($\\varepsilon_0$ is the permittivity of free space.)",option_a:"$\\dfrac12\\varepsilon_0E^2Ad$",option_b:"$\\varepsilon_0E^2Ad$",option_c:"$\\dfrac12\\varepsilon_0E^2$",option_d:"$\\varepsilon_0EAd$"},
34:{question:"In the shown series LCR circuit, the rms voltages across $L$, $C$ and $R$ are $40\\,\\mathrm V$, $10\\,\\mathrm V$ and $40\\,\\mathrm V$. The current amplitude is $10\\sqrt2\\,\\mathrm A$. The impedance is:",option_a:"$4\\,\\Omega$",option_b:"$5\\,\\Omega$",option_c:"$4\\sqrt2\\,\\Omega$",option_d:"$5\\sqrt2\\,\\Omega$"},
36:{option_a:"$1/4$",option_b:"$1/8$",option_c:"$3/4$",option_d:"$7/8$"},
42:{question:"A particle is projected from Earth's surface with $u=kV_e$, where $k<1$ and $V_e$ is escape speed. Its maximum height above the surface is:",option_a:"$\\dfrac{Rk^2}{1+k^2}$",option_b:"$\\dfrac{Rk^2}{1-k^2}$",option_c:"$\\dfrac{kR}{1-k}$",option_d:"$\\dfrac{kR}{1+k}$"},
45:{question:"A particle moves uniformly in a circle of radius $R$ with period $T$. If projected with the same speed at angle $\\theta$, its maximum height is $4R$. Then:",option_a:"$\\theta=\\sin^{-1}\\!\\sqrt{\\dfrac{2R}{gT^2}}$",option_b:"$\\theta=\\sin^{-1}\\!\\sqrt{\\dfrac{2gT^2}{\\pi^2R}}$",option_c:"$\\theta=\\cos^{-1}\\!\\sqrt{\\dfrac{2gT^2}{\\pi^2R}}$",option_d:"$\\theta=\\cos^{-1}\\!\\sqrt{\\dfrac{2R}{gT^2}}$"},
47:{question:"Given $\\vec F=q(\\vec v\\times\\vec B)$, with $q=1$, $\\vec v=2\\hat i+4\\hat j+6\\hat k$ and $\\vec F=4\\hat i-20\\hat j+12\\hat k$, determine $\\vec B$:",option_a:"$8\\hat i+8\\hat j-6\\hat k$",option_b:"$6\\hat i+6\\hat j-8\\hat k$",option_c:"$-8\\hat i-8\\hat j-6\\hat k$",option_d:"$-6\\hat i-6\\hat j-8\\hat k$"},
52:{option_c:"$2\\mathrm{KClO_3}\\xrightarrow{\\Delta}2\\mathrm{KCl}+3\\mathrm{O_2}$",option_d:"$\\mathrm{Cr_2O_3+2Al\\xrightarrow{\\Delta}Al_2O_3+2Cr}$"},
66:{question:"Acetone reacts with $\\mathrm{C_2H_5MgBr}$ in dry ether followed by $\\mathrm{H_2O/H^+}$. The IUPAC name of the product is:"},
72:{option_a:"Gamma ($\\gamma$)",option_c:"Beta ($\\beta^-$)",option_d:"Alpha ($\\alpha$)"},
75:{option_a:"$C_P=RC_V$",option_b:"$C_V=RC_P$",option_c:"$C_P+C_V=R$",option_d:"$C_P-C_V=R$"},
96:{option_a:"$\\Delta U=0,\\;\\Delta S_{total}\\ne0$",option_b:"$\\Delta U\\ne0,\\;\\Delta S_{total}=0$",option_c:"$\\Delta U=0,\\;\\Delta S_{total}=0$",option_d:"$\\Delta U\\ne0,\\;\\Delta S_{total}\\ne0$"},
97:{question:"The molar conductivity of $0.007\\,\\mathrm M$ acetic acid is $20\\,\\mathrm{S\\,cm^2\\,mol^{-1}}$. Find its dissociation constant. Given $\\lambda^\\circ_{H^+}=350$ and $\\lambda^\\circ_{CH_3COO^-}=50\\,\\mathrm{S\\,cm^2\\,mol^{-1}}$.",option_a:"$1.75\\times10^{-5}\\,\\mathrm{mol\\,L^{-1}}$",option_b:"$2.50\\times10^{-5}\\,\\mathrm{mol\\,L^{-1}}$",option_c:"$1.75\\times10^{-4}\\,\\mathrm{mol\\,L^{-1}}$",option_d:"$2.50\\times10^{-4}\\,\\mathrm{mol\\,L^{-1}}$"}
,141:{question:"Match the four floral formulae labelled (a)-(d), shown below, with their families:\n\n| Label | Family in List II |\n|---|---|\n| (a) | I. Brassicaceae |\n| (b) | II. Liliaceae |\n| (c) | III. Fabaceae |\n| (d) | IV. Solanaceae |\n\nChoose the correct matching combination:"}
};
function clean(v){return String(v??"").replace(/^Question\s+\d+:\s*/i,"").replaceAll("−","-").replaceAll("–","-").replaceAll("⟶","$\\to$").replaceAll("Ω","$\\Omega$").replaceAll("μ","$\\mu$").replaceAll("𝜆𝜆","$\\lambda$").replaceAll("𝜽𝜽","$\\theta$").replaceAll("β","$\\beta$").replaceAll("∆","$\\Delta$").replace(/[𝝰]/g,"").replace(/\s+/g," ").trim()}
function semanticTable(v,n){if(n===141)return null;const t=String(v).replace(/^Question\s+\d+:\s*/i,"");const m=t.match(/\(a\)\s*(.*?)\s*\(i\)\s*(.*?)\s*\(b\)\s*(.*?)\s*\(ii\)\s*(.*?)\s*\(c\)\s*(.*?)\s*\(iii\)\s*(.*?)\s*\(d\)\s*(.*?)\s*\(iv\)\s*(.*?)(?:Choose|$)/i);if(!m)return null;const vals=m.slice(1).map((x,i)=>clean(x)||`Diagram ${i/2+1} shown below`);return `Match List I with List II:\n\n| List I | List II |\n|---|---|\n${[0,1,2,3].map(i=>`| ${"ABCD"[i]}. ${vals[i*2]} | ${["I","II","III","IV"][i]}. ${vals[i*2+1]} |`).join("\n")}\n\nChoose the correct answer from the options below:`}
function artifactFree(vs){return vs.map(v=>v.file)}
const source=JSON.parse(await fs.readFile(SOURCE,"utf8")),vm=JSON.parse(await fs.readFile(VISUALS,"utf8"));const by=new Map(vm.map(x=>[x.number,artifactFree(x.visuals)]));
const qOnly=new Set([5,18,30,31,34,43,49,50,93,134]);const maps={22:[1,2,3,4],46:[3,4,5,null],63:[1,2,3,4],70:[1,2,3,4],77:[1,2,3,4],80:[2,3,4,5],84:[1,2,3,4],87:[2,3,4,5],89:[2,3,4,5]};
const rows=source.map(item=>{const p=overrides[item.number]||{},files=by.get(item.number)||[];let qi=qOnly.has(item.number)?files[0]||null:null,oi=[null,null,null,null];if(item.number===46)qi=path.join(DIR,"visuals/neet-2021-q046-question.png");if(item.number===88)qi=path.join(DIR,"visuals/neet-2021-q088-question.png");if(item.number===141)qi=path.join(DIR,"visuals/neet-2021-q141-question.png");if([80,87,89].includes(item.number))qi=files[0];if(maps[item.number])oi=maps[item.number].map(n=>n?files[n-1]||null:null);const r={...item,question:p.question??semanticTable(item.question,item.number)??clean(item.question),option_a:p.option_a??clean(item.option_a),option_b:p.option_b??clean(item.option_b),option_c:p.option_c??clean(item.option_c),option_d:p.option_d??clean(item.option_d),question_image:qi,option_a_image:oi[0],option_b_image:oi[1],option_c_image:oi[2],option_d_image:oi[3],needs_review:false};for(const k of "abcd")if(r[`option_${k}`]==="Diagram shown."&&!r[`option_${k}_image`])r[`option_${k}`]=`Diagram-based option ${k.toUpperCase()}.`;return r});
await fs.writeFile(OUT,JSON.stringify(rows,null,2));const bad=rows.filter(q=>[q.question,q.option_a,q.option_b,q.option_c,q.option_d].some(x=>!String(x).trim()));console.log(JSON.stringify({total:rows.length,tables:rows.filter(q=>q.question.includes("\n|")).length,questionImages:rows.filter(q=>q.question_image).length,optionImages:rows.reduce((n,q)=>n+[q.option_a_image,q.option_b_image,q.option_c_image,q.option_d_image].filter(Boolean).length,0),empty:bad.map(q=>q.number)},null,2));
