import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "tmp/neet-ug-2024/neet-ug-2024-manifest.json");
const CLEAN_TEXT_SOURCE = path.join(ROOT, "tmp/neet-2024-clean/rebuild/structured-draft.json");
const LAYOUT_SOURCE = path.join(ROOT, "tmp/neet-2024-clean/vedantu-source/layout.txt");
const VISUAL_MANIFEST = path.join(ROOT, "tmp/neet-2024-clean/structured/visuals/visual-manifest.json");
const OUT_DIR = path.join(ROOT, "tmp/neet-2024-clean/structured");

const latex = String.raw;

const overrides = {
  1: { question: latex`At any instant $t$, the displacement of a particle is $x=2t-1$ in SI units. Under the influence of a force of $5\,\mathrm{N}$, its instantaneous power (in SI units) is:` },
  3: {
    question: latex`The following nuclear-emission sequence is given:

$$^{290}_{82}X \xrightarrow{\alpha} Y \xrightarrow{e^{+}} Z \xrightarrow{\beta^{-}} P \xrightarrow{e^{-}} Q$$

The mass number and atomic number of product $Q$, respectively, are:`,
  },
  4: {
    question: latex`Match List I with List II:

| List I - Material | List II - Susceptibility $\chi$ |
|---|---|
| A. Diamagnetic | I. $\chi=0$ |
| B. Ferromagnetic | II. $0>\chi\ge-1$ |
| C. Paramagnetic | III. $\chi\gg1$ |
| D. Non-magnetic | IV. $0<\chi<\varepsilon$ (a small positive number) |

Choose the correct answer from the options given below:`,
  },
  5: { option_a: latex`$1\,\mu\mathrm{F}$`, option_b: latex`$0.5\,\mu\mathrm{F}$`, option_c: latex`$4\,\mu\mathrm{F}$`, option_d: latex`$2\,\mu\mathrm{F}$` },
  6: {
    question: latex`A thin spherical shell is charged by some source. The potential difference between points $C$ and $P$ (in V), shown in the figure, is given. Take $\dfrac{1}{4\pi\varepsilon_0}=9\times10^9$ in SI units.`,
    option_a: latex`$1\times10^5$`, option_b: latex`$0.5\times10^5$`, option_c: "Zero", option_d: latex`$3\times10^5$`,
  },
  9: { question: latex`A tightly wound 100-turn coil of radius $10\,\mathrm{cm}$ carries a current of $7\,\mathrm{A}$. Find the magnetic field at its centre. Take $\mu_0=4\pi\times10^{-7}$ in SI units.` },
  10: { question: "In the diagram, a strong bar magnet moves towards solenoid 2 from solenoid 1. The directions of induced current through solenoids 1 and 2, respectively, are:" },
  11: { question: latex`Two bodies A and B of equal mass undergo a completely inelastic one-dimensional collision. Before collision, A moves with velocity $v_1$ and B is at rest. If the velocity after collision is $v_2$, the ratio $v_1:v_2$ is:` },
  12: {
    question: latex`Given below are two statements: one is labelled Assertion A and the other is labelled Reason R.

**Assertion A:** The potential $V$ at either axial point at a distance $r=2\,\mathrm{m}$ from the centre of a dipole having dipole-moment vector $\vec P$ of magnitude $4\times10^{-6}\,\mathrm{C\,m}$ is $\pm9\times10^3\,\mathrm{V}$. Take $\dfrac{1}{4\pi\varepsilon_0}=9\times10^9$ in SI units.

**Reason R:** $V=\pm\dfrac{2P}{4\pi\varepsilon_0r^2}$, where $r$ is the distance of either axial point from the centre of the dipole.

Choose the correct answer from the options given below:`,
  },
  15: {
    question: latex`Which graph correctly shows the variation of $\dfrac{1}{\lambda^2}$ with kinetic energy $E$, where $\lambda$ is the de Broglie wavelength of a free particle?`,
  },
  16: {
    option_a: latex`$\dfrac{\sqrt5}{2}$`, option_b: latex`$\dfrac{\sqrt3}{4}$`,
    option_c: latex`$\dfrac{\sqrt3}{2}$`, option_d: latex`$\dfrac{\sqrt5}{4}$`,
  },
  19: { question: latex`In an ideal transformer, the turns ratio is $\dfrac{N_p}{N_s}=\dfrac12$. The ratio $V_s:V_p$ is (symbols have their usual meanings):` },
  20: { question: latex`A thin, flat circular disc of radius $4.5\,\mathrm{cm}$ is placed gently on the surface of water. If the surface tension of water is $0.07\,\mathrm{N\,m^{-1}}$, the excess force required to lift it from the surface is:` },
  21: { question: latex`A steel wire is $1\,\mathrm{m}$ long. If the elastic limit of steel is $8\times10^8\,\mathrm{N\,m^{-2}}$ and Young's modulus is $2\times10^{11}\,\mathrm{N\,m^{-2}}$, its maximum elongation is:` },
  22: {
    question: latex`A planet has one-tenth the mass of Earth and half Earth's diameter. The acceleration due to gravity on that planet is:`,
    option_a: latex`$9.8\,\mathrm{m\,s^{-2}}$`, option_b: latex`$4.9\,\mathrm{m\,s^{-2}}$`, option_c: latex`$3.92\,\mathrm{m\,s^{-2}}$`, option_d: latex`$19.6\,\mathrm{m\,s^{-2}}$`,
  },
  24: { question: `Given below are two statements.

**Statement I:** Atoms are electrically neutral because they contain equal numbers of positive and negative charges.

**Statement II:** Atoms of each element are stable and emit their characteristic spectrum.

Choose the most appropriate answer:`, option_b: "Statement I is correct but Statement II is incorrect." },
  23: {
    question: latex`In a vernier callipers, $(N+1)$ divisions of the vernier scale coincide with $N$ divisions of the main scale. If $1\,\mathrm{MSD}$ represents $0.1\,\mathrm{mm}$, the vernier constant (in cm) is:`,
    option_a: latex`$\dfrac{1}{100(N+1)}$`,
    option_b: latex`$100N$`,
    option_c: latex`$10(N+1)$`,
    option_d: latex`$10N$`,
  },
  30: {
    question: latex`If $x=5\sin\left(\pi t+\dfrac{\pi}{3}\right)\,\mathrm{m}$ represents the motion of a particle executing simple harmonic motion, the amplitude and time period, respectively, are:`,
    option_a: latex`$5\,\mathrm{m}, 2\,\mathrm{s}$`, option_b: latex`$5\,\mathrm{cm}, 1\,\mathrm{s}$`, option_c: latex`$5\,\mathrm{m}, 1\,\mathrm{s}$`, option_d: latex`$5\,\mathrm{cm}, 2\,\mathrm{s}$`,
  },
  25: { question: latex`A horizontal force of $10\,\mathrm{N}$ is applied to block A as shown. The masses of A and B are $2\,\mathrm{kg}$ and $3\,\mathrm{kg}$, respectively. The blocks slide on a frictionless surface. The force exerted by A on B is:` },
  27: { question: latex`The moment of inertia of a thin rod about an axis through its midpoint and perpendicular to it is $2400\,\mathrm{g\,cm^2}$. The length of the $400\,\mathrm{g}$ rod is nearly:` },
  28: { question: latex`Consider statements A and B.

A. For a solar cell, the $I$-$V$ characteristic lies in the fourth quadrant of the graph.

B. In a reverse-biased $p$-$n$ junction diode, the current measured in $\mu\mathrm{A}$ is due to majority charge carriers.

Choose the correct answer:` },
  31: {
    question: latex`If $c$ is the velocity of light in free space, consider the following statements about a photon:

A. Its energy is $E=h\nu$.

B. Its velocity is $c$.

C. Its momentum is $p=\dfrac{h\nu}{c}$.

D. In a photon-electron collision, both total energy and total momentum are conserved.

E. A photon possesses positive charge.

Choose the correct answer from the options given below:`,
  },
  32: {
    question: latex`Match List I with List II:

| List I - Spectral line transition | List II - Wavelength (nm) |
|---|---|
| A. $n_2=3$ to $n_1=2$ | I. $410.2$ |
| B. $n_2=4$ to $n_1=2$ | II. $434.1$ |
| C. $n_2=5$ to $n_1=2$ | III. $656.3$ |
| D. $n_2=6$ to $n_1=2$ | IV. $486.1$ |

Choose the correct answer from the options given below:`,
  },
  33: {
    question: latex`A logic circuit produces output $Y$ according to the following truth table:

| $A$ | $B$ | $Y$ |
|---:|---:|---:|
| 0 | 0 | 1 |
| 0 | 1 | 0 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

The expression for $Y$ is:`,
    option_a: latex`$A\overline{B}+\overline{A}$`,
    option_b: latex`$\overline{B}$`,
    option_c: "$B$",
    option_d: latex`$AB+\overline{A}$`,
  },
  34: {
    question: latex`In a uniform magnetic field of $0.049\,\mathrm{T}$, a magnetic needle performs 20 complete oscillations in 5 seconds. The moment of inertia of the needle is $9.8\times10^{-6}\,\mathrm{kg\,m^2}$. If the magnitude of its magnetic moment is $x\times10^{-5}\,\mathrm{A\,m^2}$, then $x$ is:`,
    option_a: latex`$128\pi^2$`, option_b: latex`$50\pi^2$`, option_c: latex`$1280\pi^2$`, option_d: latex`$5\pi^2$`,
  },
  35: {
    question: latex`A bob is whirled in a horizontal plane by means of a string with an initial speed of $\omega\,\mathrm{rpm}$. The tension in the string is $T$. If the speed becomes $2\omega$ while the radius remains unchanged, the tension becomes:`,
    option_a: "$4T$",
    option_b: latex`$\dfrac{T}{4}$`,
    option_c: "$2T$",
    option_d: "$T$",
  },
  36: {
    question: latex`A metallic bar has Young's modulus $0.5\times10^{11}\,\mathrm{N\,m^{-2}}$, coefficient of linear expansion $10^{-5}\,{}^\circ\mathrm{C}^{-1}$, length $1\,\mathrm{m}$ and cross-sectional area $10^{-3}\,\mathrm{m^2}$. It is heated from $0^\circ\mathrm{C}$ to $100^\circ\mathrm{C}$ without expansion or bending. The compressive force developed is:`,
    option_a: latex`$50\times10^3\,\mathrm{N}$`, option_b: latex`$100\times10^3\,\mathrm{N}$`, option_c: latex`$2\times10^3\,\mathrm{N}$`, option_d: latex`$5\times10^3\,\mathrm{N}$`,
  },
  39: {
    question: latex`An iron bar of length $L$ has magnetic moment $M$. It is bent at the middle so that its two arms make an angle of $60^\circ$ with each other. The magnetic moment of the bent magnet is:`,
    option_a: latex`$\dfrac{M}{2}$`,
    option_b: "$2M$",
    option_c: latex`$\dfrac{M}{\sqrt{3}}$`,
    option_d: "$M$",
  },
  40: { question: latex`A $10\,\mu\mathrm{F}$ capacitor is connected to a $210\,\mathrm{V}$, $50\,\mathrm{Hz}$ source as shown. The peak current is nearly $(\pi=3.14)$:` },
  41: { question: latex`Two heaters A and B are rated $1\,\mathrm{kW}$ and $2\,\mathrm{kW}$, respectively. They are connected first in series and then in parallel to a fixed power source. The ratio of total power outputs in the two cases is:` },
  42: {
    question: latex`If the mass of the bob in a simple pendulum is increased to three times its original mass and its length is reduced to half its original length, the new time period is $\dfrac{x}{2}$ times the original time period. The value of $x$ is:`,
    option_a: latex`$\sqrt{2}$`,
    option_b: latex`$2\sqrt{3}$`,
    option_c: "$4$",
    option_d: latex`$\sqrt{3}$`,
  },
  43: { option_b: latex`They travel at speed $\dfrac{1}{\sqrt{\mu_0\varepsilon_0}}$` },
  44: { question: `A sheet is placed on a horizontal surface in front of a strong magnetic pole. A force is needed to:

A. Hold the sheet there if it is magnetic.

B. Hold the sheet there if it is non-magnetic.

C. Move the sheet away from the pole with uniform velocity if it is conducting.

D. Move the sheet away from the pole with uniform velocity if it is both non-conducting and non-polar.

Choose the correct statement(s):` },
  46: { option_c: "A displacement current greater than $I$ flows, but it can be in any direction." },
  47: {
    question: latex`A force defined by $F=\alpha t^2+\beta t$ acts on a particle at time $t$. Which factor is dimensionless if $\alpha$ and $\beta$ are constants?`,
    option_a: latex`$\dfrac{\alpha t}{\beta}$`,
    option_b: latex`$\alpha\beta t$`,
    option_c: latex`$\dfrac{\alpha\beta}{t}$`,
    option_d: latex`$\dfrac{\beta t}{\alpha}$`,
  },
  49: {
    question: latex`The graph represents the $T$-$V$ curves of an ideal gas, where $T$ is temperature and $V$ is volume, at pressures $P_1$, $P_2$ and $P_3$, compared with the dotted straight lines predicted by Charles's law. The correct relation is:`,
    option_a: "$P_1>P_3>P_2$", option_b: "$P_2>P_1>P_3$", option_c: "$P_1>P_2>P_3$", option_d: "$P_3>P_2>P_1$",
  },
  50: {
    question: latex`The minimum energy required to launch a satellite of mass $m$ from the surface of Earth, of mass $M$ and radius $R$, into a circular orbit at an altitude $2R$ above Earth's surface is:`,
    option_a: latex`$\dfrac{2GmM}{3R}$`,
    option_b: latex`$\dfrac{GmM}{2R}$`,
    option_c: latex`$\dfrac{GmM}{3R}$`,
    option_d: latex`$\dfrac{5GmM}{6R}$`,
  },
  52: {
    question: latex`For the reaction $2A\rightleftharpoons B+C$, $K_c=4\times10^{-3}$. At a given time, $[A]=[B]=[C]=2\times10^{-3}\,\mathrm{M}$. Which statement is correct?`,
  },
  53: {
    question: latex`The spin-only magnetic moment is the same for which of the following ions?

A. $\mathrm{Ti^{3+}}$

B. $\mathrm{Cr^{2+}}$

C. $\mathrm{Mn^{2+}}$

D. $\mathrm{Fe^{2+}}$

E. $\mathrm{Sc^{3+}}$

Choose the most appropriate answer:`,
  },
  55: {
    question: "Which reaction is not a redox reaction?",
    option_a: latex`$2\mathrm{KClO_3}+\mathrm{I_2}\rightarrow2\mathrm{KIO_3}+\mathrm{Cl_2}$`,
    option_b: latex`$\mathrm{H_2}+\mathrm{Cl_2}\rightarrow2\mathrm{HCl}$`,
    option_c: latex`$\mathrm{BaCl_2}+\mathrm{Na_2SO_4}\rightarrow\mathrm{BaSO_4}+2\mathrm{NaCl}$`,
    option_d: latex`$\mathrm{Zn}+\mathrm{CuSO_4}\rightarrow\mathrm{ZnSO_4}+\mathrm{Cu}$`,
  },
  56: { question: latex`Match List I with List II:

| List I - Molecule | List II - Bonds between the two carbon atoms |
|---|---|
| A. Ethane | I. One $\sigma$ bond and two $\pi$ bonds |
| B. Ethene | II. Two $\pi$ bonds |
| C. Carbon molecule, $\mathrm{C_2}$ | III. One $\sigma$ bond |
| D. Ethyne | IV. One $\sigma$ bond and one $\pi$ bond |

Choose the correct answer from the options given below:` },
  57: { question: latex`Match List I with List II:

| List I - Complex | List II - Type of isomerism |
|---|---|
| A. $[\mathrm{Co(NH_3)_5(NO_2)}]\mathrm{Cl_2}$ | I. Solvate isomerism |
| B. $[\mathrm{Co(NH_3)_5(SO_4)}]\mathrm{Br}$ | II. Linkage isomerism |
| C. $[\mathrm{Co(NH_3)_6}][\mathrm{Cr(CN)_6}]$ | III. Ionisation isomerism |
| D. $[\mathrm{Co(H_2O)_6}]\mathrm{Cl_3}$ | IV. Coordination isomerism |

Choose the correct answer from the options given below:` },
  54: {
    question: latex`The energy of an electron in the ground state $(n=1)$ of a $\mathrm{He}^{+}$ ion is $-x\,\mathrm{J}$. The energy, in joules, of an electron in the $n=2$ state of a $\mathrm{Be}^{3+}$ ion is:`,
    option_a: latex`$-\dfrac{x}{9}$`,
    option_b: "$-4x$",
    option_c: latex`$-\dfrac{4x}{9}$`,
    option_d: "$-x$",
  },
  58: {
    question: latex`The $E^\circ$ value for the $\mathrm{Mn}^{3+}/\mathrm{Mn}^{2+}$ couple is more positive than those of $\mathrm{Cr}^{3+}/\mathrm{Cr}^{2+}$ and $\mathrm{Fe}^{3+}/\mathrm{Fe}^{2+}$ because of the change in:`,
    option_a: "$d^5$ to $d^2$ configuration", option_b: "$d^4$ to $d^5$ configuration", option_c: "$d^3$ to $d^5$ configuration", option_d: "$d^5$ to $d^4$ configuration",
  },
  59: { option_c: latex`$2.27\,\mathrm{L}$ of helium at STP`, option_d: latex`$4\,\mathrm{mol}$ of helium` },
  60: { question: latex`Which plot of $\ln k$ against $\dfrac{1}{T}$ is consistent with the Arrhenius equation?` },
  63: {
    question: latex`The Henry's-law constants $K_H$ for three gases A, B and C in water are $145$, $2\times10^{-5}$ and $35\,\mathrm{kbar}$, respectively. The order of their solubilities in water is:`,
  },
  64: {
    question: latex`In which processes does entropy increase?

A. A liquid evaporates to vapour.

B. The temperature of a crystalline solid is lowered from $130\,\mathrm{K}$ to $0\,\mathrm{K}$.

C. $2\mathrm{NaHCO_3(s)}\rightarrow\mathrm{Na_2CO_3(s)}+\mathrm{CO_2(g)}+\mathrm{H_2O(g)}$

D. $\mathrm{Cl_2(g)}\rightarrow2\mathrm{Cl(g)}$

Choose the correct answer:`,
  },
  69: { question: latex`One gram of sodium hydroxide is treated with $25\,\mathrm{mL}$ of $0.75\,\mathrm{M}$ HCl. The mass of sodium hydroxide left unreacted is:` },
  70: { question: latex`A compound with molecular formula $\mathrm{C_6H_{14}}$ has two tertiary carbon atoms. Its IUPAC name is:` },
  72: {
    question: "For which equilibrium are $K_p$ and $K_c$ not equal?",
    option_a: "$\\mathrm{H_2(g)+I_2(g)\\rightleftharpoons2HI(g)}$",
    option_b: "$\\mathrm{CO(g)+H_2O(g)\\rightleftharpoons CO_2(g)+H_2(g)}$",
    option_c: "$\\mathrm{2BrCl(g)\\rightleftharpoons Br_2(g)+Cl_2(g)}$",
    option_d: "$\\mathrm{PCl_5(g)\\rightleftharpoons PCl_3(g)+Cl_2(g)}$",
  },
  73: {
    question: latex`With which reagents does glucose **not** react to give the corresponding test or product?

A. Tollens' reagent

B. Schiff's reagent

C. $\mathrm{HCN}$

D. $\mathrm{NH_2OH}$

E. $\mathrm{NaHSO_3}$

Choose the correct answer:`,
  },
  74: {
    question: latex`Match List I with List II:

| List I - Compound | List II - Shape/geometry |
|---|---|
| A. $\mathrm{NH_3}$ | I. Trigonal pyramidal |
| B. $\mathrm{BrF_5}$ | II. Square planar |
| C. $\mathrm{XeF_4}$ | III. Octahedral |
| D. $\mathrm{SF_6}$ | IV. Square pyramidal |

Choose the correct answer from the options given below:`,
  },
  76: {
    question: latex`Match List I with List II:

| List I - Reaction | List II - Reagent/condition |
|---|---|
| A. Two cyclohexane rings joined by an exocyclic $\mathrm{C=C}$ bond $\rightarrow$ two molecules of cyclohexanone | I. Benzoyl chloride / anhydrous $\mathrm{AlCl_3}$ |
| B. Benzene $\rightarrow$ benzophenone | II. $\mathrm{CrO_3}$ |
| C. Cyclohexanol $\rightarrow$ cyclohexanone | III. $\mathrm{KMnO_4/KOH}$, $\Delta$ |
| D. Ethylbenzene $\rightarrow$ potassium benzoate | IV. (i) $\mathrm{O_3}$; (ii) $\mathrm{Zn/H_2O}$ |

Choose the correct answer from the options given below:`,
  },
  88: {
    question: latex`For $2\mathrm{NO(g)}\rightleftharpoons\mathrm{N_2(g)}+\mathrm{O_2(g)}$, the equilibrium concentrations are $[\mathrm{N_2}]=3.0\times10^{-3}\,\mathrm{M}$, $[\mathrm{O_2}]=4.2\times10^{-3}\,\mathrm{M}$ and $[\mathrm{NO}]=2.8\times10^{-3}\,\mathrm{M}$. If $0.1\,\mathrm{mol\,L^{-1}}$ of $\mathrm{NO(g)}$ is placed in a closed vessel, what is the degree of dissociation $\alpha$ of $\mathrm{NO(g)}$ at equilibrium?`,
  },
  79: {
    option_a: latex`(i) $\mathrm{BH_3}$; (ii) $\mathrm{H_2O_2/OH^-}$; (iii) PCC`,
    option_b: latex`(i) $\mathrm{BH_3}$; (ii) $\mathrm{H_2O_2/OH^-}$; (iii) alkaline $\mathrm{KMnO_4}$; (iv) $\mathrm{H_3O^+}$`,
    option_c: latex`(i) $\mathrm{H_2O/H^+}$; (ii) PCC`,
    option_d: latex`$\mathrm{H_2O/H^+}$`,
  },
  80: {
    question: latex`Match List I with List II:

| List I - Conversion | List II - Faradays required |
|---|---|
| A. $1$ mol $\mathrm{H_2O}$ to $\mathrm{O_2}$ | I. $3F$ |
| B. $1$ mol $\mathrm{MnO_4^-}$ to $\mathrm{Mn^{2+}}$ | II. $2F$ |
| C. $1.5$ mol Ca from molten $\mathrm{CaCl_2}$ | III. $1F$ |
| D. $1$ mol $\mathrm{FeO}$ to $\mathrm{Fe_2O_3}$ | IV. $5F$ |

Choose the correct answer from the options given below:`,
  },
  82: {
    question: latex`Given below are two statements.

**Statement I:** Both $[\mathrm{Co(NH_3)_6}]^{3+}$ and $[\mathrm{CoF_6}]^{3-}$ are octahedral complexes, but they differ in magnetic behaviour.

**Statement II:** $[\mathrm{Co(NH_3)_6}]^{3+}$ is diamagnetic, whereas $[\mathrm{CoF_6}]^{3-}$ is paramagnetic.

Choose the correct answer:`,
  },
  86: {
    question: latex`The products A and B obtained in the following reactions, respectively, are:

$$3\mathrm{ROH}+\mathrm{PCl_3}\rightarrow3\mathrm{RCl}+A$$

$$\mathrm{ROH}+\mathrm{PCl_5}\rightarrow\mathrm{RCl}+\mathrm{HCl}+B$$`,
    option_a: latex`$\mathrm{POCl_3}$ and $\mathrm{H_3PO_4}$`, option_b: latex`$\mathrm{H_3PO_4}$ and $\mathrm{POCl_3}$`, option_c: latex`$\mathrm{H_3PO_3}$ and $\mathrm{POCl_3}$`, option_d: latex`$\mathrm{POCl_3}$ and $\mathrm{H_3PO_3}$`,
  },
  87: { question: latex`What mass of copper is deposited when a current of $9.6487\,\mathrm{A}$ is passed for $100\,\mathrm{s}$ through an electrolytic cell containing copper sulphate solution? Given: molar mass of Cu $=63\,\mathrm{g\,mol^{-1}}$ and $1F=96487\,\mathrm{C}$.` },
  89: {
    question: latex`Given below are two statements.

**Statement I:** $[\mathrm{Co(NH_3)_6}]^{3+}$ is a homoleptic complex, whereas $[\mathrm{Co(NH_3)_4Cl_2}]^{+}$ is heteroleptic.

**Statement II:** $[\mathrm{Co(NH_3)_6}]^{3+}$ has one kind of ligand, whereas $[\mathrm{Co(NH_3)_4Cl_2}]^{+}$ has more than one kind of ligand.

Choose the correct answer:`,
  },
  90: {
    question: latex`Identify the major product $C$ in the following sequence:

$$\mathrm{CH_3CH_2CH_2I}\xrightarrow{\mathrm{NaCN}}A\xrightarrow[\text{partial hydrolysis}]{\mathrm{OH^-}}B\xrightarrow[\mathrm{Br_2}]{\mathrm{NaOH}}C\;(\text{major})$$`,
    option_c: latex`$\alpha$-bromobutanoic acid`,
  },
  91: {
    question: "Which pair of lanthanoid ions is diamagnetic?",
    option_a: latex`$\mathrm{Ce^{3+}}$ and $\mathrm{Eu^{2+}}$`, option_b: latex`$\mathrm{Gd^{3+}}$ and $\mathrm{Eu^{3+}}$`, option_c: latex`$\mathrm{Pm^{3+}}$ and $\mathrm{Sm^{3+}}$`, option_d: latex`$\mathrm{Ce^{4+}}$ and $\mathrm{Yb^{2+}}$`,
  },
  93: {
    option_a: latex`$\mathrm{ABC_3}$`, option_b: latex`$\mathrm{AB_2C_2}$`, option_c: latex`$\mathrm{ABC_4}$`, option_d: latex`$\mathrm{A_2BC_2}$`,
  },
  94: {
    question: latex`The following cations are given. Arrange them in increasing qualitative-analysis group number from 0 to VI.

A. $\mathrm{Al^{3+}}$

B. $\mathrm{Cu^{2+}}$

C. $\mathrm{Ba^{2+}}$

D. $\mathrm{Co^{2+}}$

E. $\mathrm{Mg^{2+}}$

Choose the correct answer:`,
  },
  95: { question: latex`The work done during reversible isothermal expansion of one mole of hydrogen gas at $25^\circ\mathrm{C}$ from $20\,\mathrm{atm}$ to $10\,\mathrm{atm}$ is: (Given $R=2.0\,\mathrm{cal\,K^{-1}\,mol^{-1}}$.)` },
  97: { question: latex`The rate of a reaction quadruples when the temperature changes from $27^\circ\mathrm{C}$ to $57^\circ\mathrm{C}$. Calculate the activation energy. Given $R=8.314\,\mathrm{J\,K^{-1}\,mol^{-1}}$ and $\log4=0.6021$.` },
  98: { question: latex`During preparation of Mohr's salt solution (ferrous ammonium sulphate), which acid is added to prevent hydrolysis of $\mathrm{Fe^{2+}}$?` },
  99: { question: latex`A plot of osmotic pressure $\pi$ against concentration $(\mathrm{mol\,L^{-1}})$ gives a straight line of slope $25.73\,\mathrm{L\,bar\,mol^{-1}}$. At what temperature was the osmotic pressure measured? Use $R=0.083\,\mathrm{L\,bar\,mol^{-1}\,K^{-1}}$.` },
  100: {
    option_a: latex`$\mathrm{BF_3}$ has a non-zero dipole moment`,
    option_b: latex`The dipole moment of $\mathrm{NF_3}$ is greater than that of $\mathrm{NH_3}$`,
    option_c: latex`Three canonical forms can be drawn for $\mathrm{CO_3^{2-}}$`,
  },
  110: {
    question: latex`The Verhulst-Pearl logistic-growth equation is

$$\frac{dN}{dt}=rN\left(\frac{K-N}{K}\right).$$

In this equation, $K$ denotes:`,
  },
  102: { question: `Identify the correct statements:

A. Flowers of *Vallisneria* are colourful and produce nectar.

B. Flowers of water lily are not pollinated by water.

C. In most water-pollinated species, pollen grains are protected from wetting.

D. Pollen grains of some hydrophytes are long and ribbon-like.

E. In some hydrophytes, pollen grains are carried passively inside water.

Choose the correct answer:` },
  101: { option_c: "Promoter, structural gene, terminator" },
  109: { question: latex`How many ATP and NADPH molecules are required for every molecule of $\mathrm{CO_2}$ fixed in the Calvin cycle?` },
  113: { question: `Tropical regions show the greatest species richness because:

A. Tropical latitudes have remained relatively undisturbed for millions of years, allowing more time for species diversification.

B. Tropical environments are more seasonal.

C. More solar energy is available in the tropics.

D. Constant environments promote niche specialisation.

E. Tropical environments are constant and predictable.

Choose the correct answer:` },
  115: { question: "Identify the flower types from the positions of the calyx, corolla and androecium relative to the ovary in figures (a) and (b).", option_d: "(a) Epigynous; (b) Hypogynous" },
  117: { question: `What is the fate of a piece of DNA carrying only the gene of interest when it is transferred into an alien organism?

A. It can multiply independently in the organism's progeny cells.

B. It may integrate into the recipient genome.

C. It may multiply and be inherited along with host DNA.

D. The alien DNA is not an integral part of a chromosome.

E. It shows the ability to replicate.

Choose the correct answer:` },
  120: { question: latex`Which are required for the dark reaction of photosynthesis?

A. Light

B. Chlorophyll

C. $\mathrm{CO_2}$

D. ATP

E. NADPH

Choose the correct answer:` },
  125: { question: latex`In a plant, black seed colour $(BB/Bb)$ is dominant over white seed colour $(bb)$. To determine the genotype of a black-seeded plant, with which genotype should it be crossed?`, option_a: "$bb$", option_b: "$Bb$", option_c: "$BB/Bb$", option_d: "$BB$" },
  126: { question: "A pink-flowered Snapdragon plant is crossed with a red-flowered Snapdragon plant. Which phenotype(s) are expected in the progeny?" },
  130: { question: latex`Which statements can be explained by Mendel's law of dominance?

A. Of a pair of factors, one is dominant and the other recessive.

B. Alleles do not show any expression and both characters appear as such in the $F_2$ generation.

C. Factors occur in pairs in normal diploid plants.

D. The discrete unit controlling a character is called a factor.

E. Only one parental character is expressed in a monohybrid cross.

Choose the correct answer:` },
  137: { question: latex`Given below are two statements.

**Statement I:** In $\mathrm{C_3}$ plants, some $\mathrm{O_2}$ binds to RuBisCO, decreasing $\mathrm{CO_2}$ fixation.

**Statement II:** In $\mathrm{C_4}$ plants, mesophyll cells show very little photorespiration, whereas bundle-sheath cells show none.

Choose the correct answer:` },
  141: { option_b: latex`Succinyl-CoA $\rightarrow$ succinic acid`, option_c: latex`Isocitrate $\rightarrow$ $\alpha$-ketoglutaric acid` },
  142: { question: `Match List I with List II:

| List I | List II |
|---|---|
| A. Robert May | I. Species-area relationship |
| B. Alexander von Humboldt | II. Long-term ecosystem experiment using outdoor plots |
| C. Paul Ehrlich | III. Global species diversity of about 7 million |
| D. David Tilman | IV. Rivet-popper hypothesis |

Choose the correct answer from the options given below:` },
  144: {
    question: latex`In an ecosystem, the net primary productivity of the first trophic level is $100x\,\mathrm{kcal\,m^{-2}\,yr^{-1}}$. What would be the gross primary productivity of the third trophic level of the same ecosystem?`,
    option_a: latex`$x\,\mathrm{kcal\,m^{-2}\,yr^{-1}}$`, option_b: latex`$10x\,\mathrm{kcal\,m^{-2}\,yr^{-1}}$`, option_c: latex`$\dfrac{100x}{3x}\,\mathrm{kcal\,m^{-2}\,yr^{-1}}$`, option_d: latex`$\dfrac{x}{10}\,\mathrm{kcal\,m^{-2}\,yr^{-1}}$`,
  },
  153: { question: "Which of the following statements is incorrect?" },
  158: { option_a: latex`High $p\mathrm{O_2}$ and lower $\mathrm{H^+}$ concentration`, option_b: latex`Low $p\mathrm{CO_2}$ and high $\mathrm{H^+}$ concentration`, option_c: latex`Low $p\mathrm{CO_2}$ and high temperature`, option_d: latex`High $p\mathrm{O_2}$ and high $p\mathrm{CO_2}$` },
  161: { question: `Match List I with List II:

| List I | List II |
|---|---|
| A. Fibrous joints | I. Adjacent vertebrae; limited movement |
| B. Cartilaginous joints | II. Humerus and pectoral girdle; rotational movement |
| C. Hinge joints | III. Skull; no movement allowed |
| D. Ball-and-socket joints | IV. Knee; helps in locomotion |

Choose the correct answer from the options given below:` },
  163: { option_a: "10th segment", option_b: "8th and 9th segments", option_c: "11th segment", option_d: "5th segment" },
  178: { question: `Match List I with List II:

| List I | List II |
|---|---|
| A. Pons | I. Provides additional space for neurons; regulates posture and balance |
| B. Hypothalamus | II. Controls respiration and gastric secretions |
| C. Medulla | III. Connects different regions of the brain |
| D. Cerebellum | IV. Neurosecretory cells |

Choose the correct answer from the options given below:` },
  183: {
    question: latex`Which is the correct product of DNA-dependent RNA polymerase for the template $3'\text{-}\mathrm{TACATGGCAAATATCCATTCA}\text{-}5'$?`,
    option_a: latex`$5'\text{-}\mathrm{AUGUAAAGUUUAUAGGUAAGU}\text{-}3'$`,
    option_b: latex`$5'\text{-}\mathrm{AUGUACCGUUUAUAGGGAAGU}\text{-}3'$`,
    option_c: latex`$5'\text{-}\mathrm{ATGTACCCTTTATAGGTAAGT}\text{-}3'$`,
    option_d: latex`$5'\text{-}\mathrm{AUGUACCGUUUAUAGGUAAGU}\text{-}3'$`,
  },
  189: { question: "Choose the correct statement regarding a juxtamedullary nephron." },
  191: { question: `Match List I with List II:

| List I | List II |
|---|---|
| A. Unicellular glandular epithelium | I. Salivary glands |
| B. Compound epithelium | II. Pancreas |
| C. Multicellular glandular epithelium | III. Goblet cells of the alimentary canal |
| D. Endocrine glandular epithelium | IV. Moist surface of the buccal cavity |

Choose the correct answer from the options given below:` },
  192: { question: `Match List I with List II:

| List I | List II |
|---|---|
| A. RNA polymerase III | I. snRNPs |
| B. Termination of transcription | II. Promoter |
| C. Splicing of exons | III. Rho factor |
| D. TATA box | IV. snRNAs, tRNA |

Choose the correct answer from the options given below:` },
  199: { question: latex`Under the ABO blood-grouping system, the father's phenotype is $\mathrm{B^+}$, the mother's is $\mathrm{A^+}$ and the child's is $\mathrm{O^+}$. Their respective genotypes can be:

A. $I^Bi/I^Ai/ii$

B. $I^BI^B/I^AI^A/ii$

C. $I^AI^B/iI^A/iI^B$

D. $I^Ai/I^Bi/I^Ai$

E. $iI^B/iI^A/I^AI^B$

Choose the most appropriate answer:` },
};

function clean(value) {
  return String(value ?? "")
    .replace(/^Question\s+\d+:\s*/i, "")
    .replaceAll("–", "-")
    .replaceAll("−", "-")
    .replaceAll("Ω", "$\\Omega$")
    .replaceAll("µ", "$\\mu$")
    .replace(/\s+/g, " ")
    .trim();
}

function transformOutsideMath(value, transform) {
  return String(value).split(/(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g).map((part) => part.startsWith("$") ? part : transform(part)).join("");
}

function scientificLatex(value, subject) {
  let result = transformOutsideMath(value, (part) => part
    .replace(/\b(\d+(?:\.\d+)?)\s*[×x]\s*10\s*[-−]\s*(\d+)\b/g, (_, coefficient, exponent) => `$${coefficient}\\times10^{-${exponent}}$`)
    .replace(/\b(\d+(?:\.\d+)?)\s*[×x]\s*10\s*(\d+)\b/g, (_, coefficient, exponent) => `$${coefficient}\\times10^{${exponent}}$`)
    .replace(/\b([A-Za-z]+)\s*([+-])\s*ion\b/g, (_, symbol, charge) => `$\\mathrm{${symbol}}^{${charge}}$ ion`)
    .replace(/[αβγδεθλμπχω]/g, (symbol) => `$\\${({ α: "alpha", β: "beta", γ: "gamma", δ: "delta", ε: "varepsilon", θ: "theta", λ: "lambda", μ: "mu", π: "pi", χ: "chi", ω: "omega" })[symbol]}$`));
  if (subject === "Chemistry" || subject === "Biology") {
    result = transformOutsideMath(result, (part) => part.replace(/\b(?:[A-Z][a-z]?\d*){2,}\b/g, (formula) => {
      if (!/\d/.test(formula)) return formula;
      const converted = formula.replace(/([A-Z][a-z]?)(\d*)/g, (_, element, count) => `\\mathrm{${element}}${count ? `_{${count}}` : ""}`);
      return `$${converted}$`;
    }));
  }
  return result;
}

function rawQuestionBlocks(layout) {
  const matches = [...layout.matchAll(/Question\s+(\d+)\s*:/g)];
  const firstByNumber = new Map();
  for (const match of matches) {
    const number = Number(match[1]);
    if (number >= 1 && number <= 200 && !firstByNumber.has(number)) firstByNumber.set(number, match.index);
  }
  const blocks = new Map();
  for (let number = 1; number <= 200; number += 1) {
    const start = firstByNumber.get(number);
    const next = number < 200 ? firstByNumber.get(number + 1) : layout.length;
    if (start == null || next == null) throw new Error(`Missing raw source boundary for Q${number}`);
    blocks.set(number, layout.slice(start, next));
  }
  return blocks;
}

function markdownMatchingTable(rawBlock, flattenedQuestion) {
  const optionsAt = rawBlock.search(/\n\s*Options:\s*$/m);
  if (optionsAt < 0) return null;
  const body = rawBlock.slice(0, optionsAt).replace(/^Question\s+\d+:\s*/, "");
  if (!/Match\s+List/i.test(body)) return null;
  const chooseAt = body.search(/Choose the correct answer/i);
  const tablePart = chooseAt >= 0 ? body.slice(0, chooseAt) : body;
  const intro = tablePart.split(/\n/)[0].trim();
  const flattened = clean(flattenedQuestion);
  const match = flattened.match(/A\.\s*(.*?)\s+I\.\s*(.*?)\s+B\.\s*(.*?)\s+II\.?\s*(.*?)\s+C\.\s*(.*?)\s+III\.?\s*(.*?)\s+D\.?\s*(.*?)\s+IV\.?\s*(.*?)\s+Choose/i);
  const rows = match ? [
    ["A", match[1], "I", match[2]],
    ["B", match[3], "II", match[4]],
    ["C", match[5], "III", match[6]],
    ["D", match[7], "IV", match[8]],
  ].map((row) => row.map(clean)) : [];
  if (rows.length !== 4) return null;
  const tableRows = rows.map(([leftLabel, left, rightLabel, right]) => `| ${leftLabel}. ${left} | ${rightLabel}. ${right} |`).join("\n");
  return `${intro}\n\n| List I | List II |\n|---|---|\n${tableRows}\n\nChoose the correct answer from the options given below:`;
}

function subjectFor(number) {
  if (number <= 50) return "Physics";
  if (number <= 100) return "Chemistry";
  return "Biology";
}

const source = JSON.parse(await fs.readFile(SOURCE, "utf8"));
const cleanTextSource = JSON.parse(await fs.readFile(CLEAN_TEXT_SOURCE, "utf8"));
const cleanTextByNumber = new Map(cleanTextSource.map((item) => [item.number, item.question.replace(/\s+-\s+\d+\s+-\s+NEET \(UG\)-2024 \(Code-R3\)\s*/g, " ")]));
const rawBlocks = rawQuestionBlocks(await fs.readFile(LAYOUT_SOURCE, "utf8"));
const visualManifest = JSON.parse(await fs.readFile(VISUAL_MANIFEST, "utf8"));
const visualsByQuestion = new Map(visualManifest.map((item) => [item.number, item.visuals.map((visual) => visual.file)]));
const optionVisualQuestions = new Set([15, 37, 51, 60, 61]);
const questionAndOptionVisualQuestions = new Set([92, 96]);
const rows = source.map((item) => {
  const patch = overrides[item.number] || {};
  const table = markdownMatchingTable(rawBlocks.get(item.number), item.question);
  const subject = subjectFor(item.number);
  const visuals = visualsByQuestion.get(item.number) || [];
  let questionImage = null;
  let optionImages = [null, null, null, null];
  const reviewReasons = [];
  if (optionVisualQuestions.has(item.number)) {
    optionImages = visuals.slice(0, 4);
    if (optionImages.length !== 4) reviewReasons.push(`expected four option visuals, found ${optionImages.length}`);
  } else if (questionAndOptionVisualQuestions.has(item.number)) {
    questionImage = visuals[0] || null;
    optionImages = visuals.slice(1, 5);
    if (!questionImage || optionImages.length !== 4) reviewReasons.push(`expected one question and four option visuals, found ${visuals.length}`);
  } else if (item.number === 45) {
    questionImage = path.join(OUT_DIR, "visuals/neet-2024-q045-question.png");
    optionImages = visuals.slice(0, 4);
  } else if (item.number === 78) {
    optionImages = [visuals[0] || null, visuals[1] || null, null, visuals[2] || null];
  } else if (item.number === 83) {
    optionImages = [visuals[0] || null, visuals[1] || null, visuals[2] || null, null];
  } else if (item.number === 76) {
    // The structural schemes are represented textually inside a semantic table.
  } else if (visuals.length === 1) {
    questionImage = visuals[0];
  } else if (visuals.length > 1) {
    reviewReasons.push(`unclassified visual layout with ${visuals.length} images`);
  }
  return {
    ...item,
    subject,
    question: scientificLatex(patch.question ?? table ?? clean(cleanTextByNumber.get(item.number) || item.question), subject),
    option_a: scientificLatex(patch.option_a ?? clean(item.option_a), subject),
    option_b: scientificLatex(patch.option_b ?? clean(item.option_b), subject),
    option_c: scientificLatex(patch.option_c ?? clean(item.option_c), subject),
    option_d: scientificLatex(patch.option_d ?? clean(item.option_d), subject),
    question_image: questionImage,
    option_a_image: optionImages[0] || null,
    option_b_image: optionImages[1] || null,
    option_c_image: optionImages[2] || null,
    option_d_image: optionImages[3] || null,
    needs_review: reviewReasons.length > 0,
    review_reasons: reviewReasons,
  };
});

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, "neet-2024-structured-draft.json"), JSON.stringify(rows, null, 2));
console.log(JSON.stringify({ total: rows.length, overrides: Object.keys(overrides).length }));
