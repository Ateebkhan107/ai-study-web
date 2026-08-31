export const CHEMISTRY_BATCH_1_CHAPTER_DEFINITIONS = [
  { title: "Atomic Structure", slug: "atomic-structure", sort_order: 1 },
  { title: "Stoichiometry", slug: "stoichiometry", sort_order: 2 },
  { title: "Gaseous State", slug: "gaseous-state", sort_order: 3 },
  { title: "Thermodynamics", slug: "thermodynamics", sort_order: 4 },
];

const chapter = (track, slug) => `${track}-chemistry-${slug}`;

const vars = {
  h: { latex: "h", symbol: "$h$", meaning: "Planck constant" },
  nu: { latex: "\\nu", symbol: "$\\nu$", meaning: "frequency" },
  lambda: { latex: "\\lambda", symbol: "$\\lambda$", meaning: "wavelength" },
  n: { latex: "n", symbol: "$n$", meaning: "moles, principal quantum number, or count depending on context" },
  Z: { latex: "Z", symbol: "$Z$", meaning: "atomic number of hydrogen-like species" },
  R: { latex: "R", symbol: "$R$", meaning: "gas constant or Rydberg constant depending on context" },
  T: { latex: "T", symbol: "$T$", meaning: "absolute temperature" },
  P: { latex: "P", symbol: "$P$", meaning: "pressure" },
  V: { latex: "V", symbol: "$V$", meaning: "volume" },
  M: { latex: "M", symbol: "$M$", meaning: "molarity or molar mass depending on context" },
  gamma: { latex: "\\gamma", symbol: "$\\gamma$", meaning: "ratio of heat capacities" },
  delta: { latex: "\\Delta", symbol: "$\\Delta$", meaning: "change in a thermodynamic quantity" },
};

function card(chapterId, slug, payload) {
  return {
    id: `${chapterId}-${slug}`,
    chapter_id: chapterId,
    table_data: null,
    diagram_data: null,
    diagram_svg: null,
    is_active: true,
    ...payload,
  };
}

function atomicStructureCards(chapterId) {
  return [
    card(chapterId, "photon-photoelectric", {
      title: "Photon Energy and Photoelectric Equation",
      card_type: "formula",
      body: "The handbook opens Atomic Structure with Planck's quantum relation and photoelectric effect.",
      formulas: [
        { label: "Energy of one photon", latex: "E=h\\nu=\\frac{hc}{\\lambda}" },
        { label: "Photoelectric effect", latex: "h\\nu=h\\nu_0+\\frac{1}{2}m_ev^2" },
      ],
      variables: [vars.h, vars.nu, vars.lambda],
      conditions: [],
      importance: 5,
      source_page: 1,
      sort_order: 1,
    }),
    card(chapterId, "bohr-quantization-energy", {
      title: "Bohr Quantization and Energy",
      card_type: "formula",
      body: "For hydrogen-like atoms, the source lists angular momentum quantization and the energy expression.",
      formulas: [
        { label: "Angular momentum quantization", latex: "mvr=\\frac{nh}{2\\pi}" },
        { label: "Bohr energy", latex: "E_n=-\\frac{E_1}{n^2}Z^2=-2.178\\times10^{-18}\\frac{Z^2}{n^2}\\ \\text{J/atom}=-13.6\\frac{Z^2}{n^2}\\ \\text{eV}" },
        { label: "Source expression for $E_1$", latex: "E_1=\\frac{-2\\pi^2me^4}{n^2}" },
      ],
      variables: [vars.n, vars.Z],
      conditions: [],
      importance: 5,
      source_page: 1,
      sort_order: 2,
    }),
    card(chapterId, "bohr-radius-velocity", {
      title: "Bohr Radius and Electron Velocity",
      card_type: "formula",
      body: "The radius and velocity expressions are given for hydrogen-like species.",
      formulas: [
        { label: "Radius", latex: "r_n=\\frac{n^2}{Z}\\times\\frac{h^2}{4\\pi^2e^2m}=\\frac{0.529\\times n^2}{Z}\\ \\text{\\AA}" },
        { label: "Velocity", latex: "v=\\frac{2\\pi Ze^2}{nh}=\\frac{2.18\\times10^6\\times Z}{n}\\ \\text{m/s}" },
      ],
      variables: [vars.n, vars.Z],
      conditions: [],
      importance: 5,
      source_page: 1,
      sort_order: 3,
    }),
    card(chapterId, "debroglie-rydberg-uncertainty", {
      title: "de Broglie, Emitted Photon and Uncertainty",
      card_type: "formula",
      body: "The source groups de Broglie wavelength, emitted photon wavelength, and uncertainty principle around the quantum number section.",
      formulas: [
        { label: "de Broglie wavelength", latex: "\\lambda=\\frac{h}{mc}=\\frac{h}{p}\\quad\\text{(for photon)}" },
        { label: "Emitted photon", latex: "\\frac{1}{\\lambda}=\\overline{\\nu}=RZ^2\\left(\\frac{1}{n_1^2}-\\frac{1}{n_2^2}\\right)" },
        { label: "Uncertainty", latex: "\\Delta x\\,\\Delta p>\\frac{h}{4\\pi}\\quad\\text{or}\\quad m\\Delta x\\,\\Delta v\\ge\\frac{h}{4\\pi}\\quad\\text{or}\\quad \\Delta x\\,\\Delta v\\ge\\frac{h}{4\\pi m}" },
      ],
      variables: [vars.lambda, vars.R, vars.Z],
      conditions: [],
      importance: 5,
      source_page: 1,
      sort_order: 4,
    }),
    card(chapterId, "quantum-number-relations", {
      title: "Quantum Number Relations",
      card_type: "table",
      body: "The handbook lists principal and azimuthal quantum number relations plus subshell capacity.",
      formulas: [],
      variables: [vars.n],
      conditions: ["$\\hbar=\\frac{h}{2\\pi}$."],
      table_data: {
        columns: ["Relation", "Source-backed expression"],
        rows: [
          ["Principal quantum number", "$n=1,2,3,4,\\ldots$ to $\\infty$"],
          ["Orbital angular momentum in any orbit", "$\\frac{nh}{2\\pi}$"],
          ["Azimuthal quantum number", "$\\ell=0,1,\\ldots,(n-1)$"],
          ["Number of orbitals in a subshell", "$2\\ell+1$"],
          ["Maximum electrons in a subshell", "$2(2\\ell+1)$"],
          ["Orbital angular momentum", "$L=\\frac{h}{2\\pi}\\sqrt{\\ell(\\ell+1)}=\\hbar\\sqrt{\\ell(\\ell+1)}$"],
        ],
      },
      importance: 5,
      source_page: 2,
      sort_order: 5,
    }),
  ];
}

function stoichiometryCards(chapterId) {
  return [
    card(chapterId, "relative-atomic-mass-y-map", {
      title: "Relative Atomic Mass and Mole Y-Map",
      card_type: "mixed",
      body: "The source connects number, mole, mass, and STP volume with a Y-map.",
      formulas: [
        { latex: "\\text{R.A.M.}=\\frac{\\text{Mass of one atom of an element}}{\\frac{1}{12}\\times\\text{mass of one carbon atom}}" },
      ],
      variables: [],
      conditions: ["Relative atomic mass is also noted as total number of nucleons."],
      diagram_data: { type: "chem-mole-y-map" },
      importance: 5,
      source_page: 2,
      sort_order: 1,
    }),
    card(chapterId, "density-vapour-density", {
      title: "Specific Gravity, Gas Density and Vapour Density",
      card_type: "formula",
      body: "The gas-density and vapour-density relations are visually verified from the Stoichiometry section.",
      formulas: [
        { latex: "\\text{Specific gravity}=\\frac{\\text{density of the substance}}{\\text{density of water at }4^\\circ\\text{C}}" },
        { latex: "\\rho=\\frac{PM}{RT}" },
        { latex: "\\text{V.D.}=\\frac{d_{gas}}{d_{H_2}}=\\frac{PM_{gas}/RT}{PM_{H_2}/RT}=\\frac{M_{gas}}{M_{H_2}}=\\frac{M_{gas}}{2}" },
        { latex: "M_{gas}=2\\,\\text{V.D.}" },
      ],
      variables: [vars.P, vars.M, vars.R, vars.T],
      conditions: [],
      importance: 5,
      source_page: 3,
      sort_order: 2,
    }),
    card(chapterId, "mole-mole-analysis", {
      title: "Mole-Mole Analysis",
      card_type: "diagram",
      body: "The source shows a relationship chain from mass to mole, through equation relationships, then back to mole, mass, and STP volume.",
      formulas: [],
      variables: [],
      conditions: ["Use atomic/molecular weight to move between mass and mole; use $22.4$ L for STP volume."],
      diagram_data: { type: "chem-mole-analysis" },
      importance: 4,
      source_page: 3,
      sort_order: 3,
    }),
    card(chapterId, "concentration-basic", {
      title: "Concentration Terms",
      card_type: "table",
      body: "The handbook lists molarity, molality, mole fraction, and percentage concentration formulas.",
      formulas: [],
      variables: [vars.M],
      conditions: [],
      table_data: {
        columns: ["Term", "Formula"],
        rows: [
          ["Molarity", "$M=\\frac{w\\times1000}{(\\text{Mol. wt. of solute})\\times V_{\\text{in ml}}}$"],
          ["Molality", "$m=\\frac{\\text{number of moles of solute}}{\\text{mass of solvent in gram}}\\times1000=\\frac{1000w_1}{M_1w_2}$"],
          ["Mole fraction of solute", "$x_1=\\frac{n}{n+N}$"],
          ["Mole fraction of solvent", "$x_2=\\frac{N}{n+N}$"],
          ["Mole fraction sum", "$x_1+x_2=1$"],
          ["$\\%\\ w/w$", "$\\frac{\\text{mass of solute in gm}}{\\text{mass of solution in gm}}\\times100$"],
          ["$\\%\\ w/v$", "$\\frac{\\text{mass of solute in gm}}{\\text{Volume of solution in ml}}\\times100$"],
          ["$\\%\\ v/v$", "$\\frac{\\text{Volume of solute in ml}}{\\text{Volume of solution}}\\times100$"],
        ],
      },
      importance: 5,
      source_page: 3,
      sort_order: 4,
    }),
    card(chapterId, "concentration-conversions", {
      title: "Concentration Conversion Formulae",
      card_type: "table",
      body: "The source derives conversions among mole fraction, molarity, and molality.",
      formulas: [],
      variables: [vars.M],
      conditions: ["$M_1$ and $M_2$ are molar masses of solvent and solute; $\\rho$ is density of solution in g/mL; $x_1$ is mole fraction of solvent and $x_2$ of solute."],
      table_data: {
        columns: ["Conversion", "Formula"],
        rows: [
          ["Mole fraction of solute to molarity", "$M=\\frac{x_2\\rho\\times1000}{x_1M_1+M_2x_2}$"],
          ["Molarity to mole fraction", "$x_2=\\frac{MM_1\\times1000}{\\rho\\times1000-MM_2}$"],
          ["Mole fraction to molality", "$m=\\frac{x_2\\times1000}{x_1M_1}$"],
          ["Molality to mole fraction", "$x_2=\\frac{mM_1}{1000+mM_1}$"],
          ["Molality to molarity", "$M=\\frac{m\\rho\\times1000}{1000+mM_2}$"],
          ["Molarity to molality", "$m=\\frac{M\\times1000}{1000\\rho-MM_2}$"],
        ],
      },
      importance: 5,
      source_page: 4,
      sort_order: 5,
    }),
    card(chapterId, "average-mass", {
      title: "Average Atomic and Molecular Mass",
      card_type: "formula",
      body: "The average-mass formulas are stated after concentration conversions.",
      formulas: [
        { label: "Average atomic mass", latex: "A_x=\\frac{a_1x_1+a_2x_2+\\cdots+a_nx_n}{100}" },
        { label: "Mean molar or molecular mass", latex: "M_{avg}=\\frac{n_1M_1+n_2M_2+\\cdots+n_nM_n}{n_1+n_2+\\cdots+n_n}=\\frac{\\sum_{j=1}^{j=n}n_jM_j}{\\sum_{j=1}^{j=n}n_j}" },
      ],
      variables: [],
      conditions: [],
      importance: 4,
      source_page: 4,
      sort_order: 6,
    }),
    card(chapterId, "oxidation-equivalent", {
      title: "Oxidation Number and Equivalent Weight",
      card_type: "table",
      body: "The source then moves into oxidation number, equivalent mass, and equivalents.",
      formulas: [],
      variables: [],
      conditions: ["$M$ is molar mass; v.f. is valency factor."],
      table_data: {
        columns: ["Concept", "Formula"],
        rows: [
          ["Oxidation number", "number of electrons in the valence shell - number of electrons left after bonding"],
          ["Equivalent weight of element", "$E=\\frac{\\text{Atomic weight}}{\\text{Valency-factor}}$"],
          ["Equivalent weight of acid/base", "$E=\\frac{M}{\\text{Basicity/Acidity}}$"],
          ["Equivalent weight for O.A/R.A", "$E=\\frac{M}{\\text{no. of moles of }e^-\\text{ gained/lost}}$"],
          ["General equivalent weight", "$E=\\frac{\\text{Atomic or molecular weight}}{\\text{v.f.}}$"],
        ],
      },
      importance: 5,
      source_page: 5,
      sort_order: 7,
    }),
    card(chapterId, "equivalents-normality-nfactor", {
      title: "Equivalents, Normality and n-Factor",
      card_type: "formula",
      body: "The handbook connects equivalents, normality, molarity, and valency factor.",
      formulas: [
        { latex: "\\text{No. of equivalents of solute}=\\frac{\\text{Wt}}{\\text{Eq. wt.}}=\\frac{W}{E}=\\frac{W}{M/n}" },
        { latex: "\\text{No. of equivalents of solute}=\\text{No. of moles of solute}\\times\\text{v.f.}" },
        { latex: "N=\\frac{\\text{Number of equivalents of solute}}{\\text{Volume of solution (in litres)}}" },
        { latex: "N=M\\times\\text{v.f.}" },
      ],
      variables: [vars.M],
      conditions: ["n-factor of acid = basicity = number of $H^+$ ions furnished per molecule; n-factor of base = acidity = number of $OH^-$ ions furnished per molecule."],
      importance: 5,
      source_page: 5,
      sort_order: 8,
    }),
    card(chapterId, "equivalence-special-calculations", {
      title: "Equivalence Point and Special Calculations",
      card_type: "table",
      body: "The final Stoichiometry formulas cover equivalence point, hydrogen peroxide, hardness, and available chlorine.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Topic", "Formula"],
        rows: [
          ["Equivalence point", "$N_1V_1=N_2V_2$"],
          ["Equivalence point", "$n_1M_1V_1=n_2M_2V_2$"],
          ["Normality of $H_2O_2$", "$N=\\frac{\\text{Volume strength of }H_2O_2}{5.6}$"],
          ["Molarity of $H_2O_2$", "$M=\\frac{\\text{Volume strength of }H_2O_2}{11.2}$"],
          ["Hardness in ppm", "$\\frac{\\text{mass of }CaCO_3}{\\text{Total mass of water}}\\times10^6$"],
          ["Available chlorine", "$\\%\\text{ of }Cl_2=\\frac{3.55\\times x\\times V(\\text{mL})}{W(\\text{g})}$"],
        ],
      },
      importance: 5,
      source_page: 6,
      sort_order: 9,
    }),
  ];
}

function gaseousStateCards(chapterId) {
  return [
    card(chapterId, "temperature-laws", {
      title: "Temperature Scale and Basic Gas Laws",
      card_type: "table",
      body: "The Gaseous State chapter begins with temperature conversion and three empirical laws.",
      formulas: [],
      variables: [vars.P, vars.V, vars.T],
      conditions: ["$R$ in the temperature-scale formula is the reading on an unknown scale."],
      table_data: {
        columns: ["Topic", "Formula"],
        rows: [
          ["Temperature scale", "$\\frac{C-0}{100-0}=\\frac{K-273}{373-273}=\\frac{F-32}{212-32}=\\frac{R-R(O)}{R(100)-R(O)}$"],
          ["Boyle's law", "$V\\propto\\frac{1}{P}$ at constant temperature; $P_1V_1=P_2V_2$"],
          ["Charles' law", "$V\\propto T$ at constant pressure; $\\frac{V_1}{T_1}=\\frac{V_2}{T_2}$"],
          ["Gay-Lussac's law", "$P\\propto T$ at constant volume; $\\frac{P_1}{T_1}=\\frac{P_2}{T_2}$"],
        ],
      },
      diagram_data: { type: "chem-gas-laws" },
      importance: 5,
      source_page: 6,
      sort_order: 1,
    }),
    card(chapterId, "ideal-gas-partial-pressure", {
      title: "Ideal Gas Equation and Partial Pressure",
      card_type: "formula",
      body: "The source lists ideal gas forms and Dalton partial-pressure relations.",
      formulas: [
        { latex: "PV=nRT" },
        { latex: "PV=\\frac{w}{m}RT\\quad\\text{or}\\quad P=\\frac{d}{m}RT\\quad\\text{or}\\quad Pm=dRT" },
        { latex: "P_1=\\frac{n_1RT}{V},\\quad P_2=\\frac{n_2RT}{V},\\quad P_3=\\frac{n_3RT}{V}" },
        { latex: "P_{total}=P_1+P_2+P_3+\\cdots" },
      ],
      variables: [vars.P, vars.V, vars.n, vars.R, vars.T],
      conditions: ["Partial pressure = mole fraction x total pressure."],
      importance: 5,
      source_page: 6,
      sort_order: 2,
    }),
    card(chapterId, "mixture-diffusion", {
      title: "Gas Mixtures and Graham's Law",
      card_type: "formula",
      body: "Amagat's law, mixture molar mass, and diffusion are grouped together in the source.",
      formulas: [
        { label: "Amagat's law", latex: "V=V_1+V_2+V_3+\\cdots" },
        { label: "Average molecular mass", latex: "M_{mix}=\\frac{\\text{Total mass of mixture}}{\\text{Total no. of moles in mixture}}=\\frac{n_1M_1+n_2M_2+n_3M_3}{n_1+n_2+n_3}" },
        { label: "Graham's law", latex: "r\\propto\\frac{1}{\\sqrt d}" },
        { latex: "\\frac{r_1}{r_2}=\\frac{\\sqrt{d_2}}{\\sqrt{d_1}}=\\frac{\\sqrt{M_2}}{\\sqrt{M_1}}=\\sqrt{\\frac{\\text{V.D.}_2}{\\text{V.D.}_1}}" },
      ],
      variables: [vars.M],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 3,
    }),
    card(chapterId, "kinetic-equation-energy", {
      title: "Kinetic Equation and Average Kinetic Energy",
      card_type: "formula",
      body: "The kinetic theory block gives the gas kinetic equation and average kinetic energy for one mole.",
      formulas: [
        { latex: "PV=\\frac{1}{3}mN\\overline{U^2}" },
        { latex: "\\text{Average K.E. for one mole}=N_A\\left(\\frac{1}{2}m\\overline{U^2}\\right)=\\frac{3}{2}KN_AT=\\frac{3}{2}RT" },
      ],
      variables: [vars.P, vars.V, vars.R, vars.T],
      conditions: [],
      importance: 5,
      source_page: 7,
      sort_order: 4,
    }),
    card(chapterId, "molecular-speeds", {
      title: "Molecular Speeds",
      card_type: "table",
      body: "The three speed formulas are kept as a table for quick comparison.",
      formulas: [],
      variables: [vars.R, vars.T, vars.M],
      conditions: ["For $U_{rms}$, the source notes molar mass must be in kg/mole."],
      table_data: {
        columns: ["Speed", "Formula"],
        rows: [
          ["Root mean square speed", "$U_{rms}=\\sqrt{\\frac{3RT}{M}}$"],
          ["Average speed", "$U_{avg}=\\sqrt{\\frac{8RT}{\\pi M}}=\\sqrt{\\frac{8KT}{\\pi m}}$"],
          ["Most probable speed", "$U_{MPS}=\\sqrt{\\frac{2RT}{M}}=\\sqrt{\\frac{2KT}{m}}$"],
        ],
      },
      diagram_data: { type: "chem-molecular-speeds" },
      importance: 5,
      source_page: 7,
      sort_order: 5,
    }),
    card(chapterId, "vanderwaals-critical", {
      title: "van der Waals Equation and Critical Constants",
      card_type: "formula",
      body: "The chapter closes with the real-gas equation and critical constants.",
      formulas: [
        { label: "van der Waals equation", latex: "\\left(P+\\frac{an^2}{V^2}\\right)(V-nb)=nRT" },
        { label: "Critical volume", latex: "V_c=3b" },
        { label: "Critical pressure", latex: "P_c=\\frac{a}{27b^2}" },
        { label: "Critical temperature", latex: "T_c=\\frac{8a}{27Rb}" },
      ],
      variables: [vars.P, vars.V, vars.n, vars.R, vars.T],
      conditions: [],
      importance: 5,
      source_page: 8,
      sort_order: 6,
    }),
  ];
}

function thermodynamicsCards(chapterId) {
  return [
    card(chapterId, "processes-sign-first-law", {
      title: "Processes, Sign Convention and First Law",
      card_type: "table",
      body: "Thermodynamics begins with process definitions, the IUPAC sign convention, and the first law.",
      formulas: [
        { latex: "\\Delta U=(U_2-U_1)=q+w" },
      ],
      variables: [vars.delta],
      conditions: ["Work done on the system is positive; work done by the system is negative."],
      table_data: {
        columns: ["Process", "Condition"],
        rows: [
          ["Isothermal", "$T=\\text{constant}$; $dT=0$; $\\Delta T=0$"],
          ["Isochoric", "$V=\\text{constant}$; $dV=0$; $\\Delta V=0$"],
          ["Isobaric", "$P=\\text{constant}$; $dP=0$; $\\Delta P=0$"],
          ["Adiabatic", "$q=0$; heat exchange with surrounding = 0"],
        ],
      },
      importance: 5,
      source_page: 8,
      sort_order: 1,
    }),
    card(chapterId, "equipartition-heat-capacity", {
      title: "Equipartition and Heat Capacities",
      card_type: "table",
      body: "The source lists ideal-gas equipartition and heat-capacity definitions.",
      formulas: [
        { latex: "U=\\frac{f}{2}nRT\\quad\\text{(only for ideal gas)}" },
        { latex: "\\Delta E=\\frac{f}{2}nR(\\Delta T)" },
      ],
      variables: [vars.R, vars.T],
      conditions: [],
      table_data: {
        sections: [
          {
            title: "Degrees of freedom",
            columns: ["Gas type", "$f$"],
            rows: [
              ["Monoatomic", "$3$"],
              ["Diatomic or linear polyatomic", "$5$"],
              ["Non-linear polyatomic", "$6$"],
            ],
          },
          {
            title: "Heat capacities",
            columns: ["Quantity", "Formula"],
            rows: [
              ["Total heat capacity", "$C_T=\\frac{\\Delta q}{\\Delta T}=\\frac{dq}{dT}$"],
              ["Molar heat capacity", "$C=\\frac{\\Delta q}{n\\Delta T}=\\frac{dq}{ndT}$"],
              ["Specific heat capacity", "$S=\\frac{\\Delta q}{m\\Delta T}=\\frac{dq}{mdT}$"],
              ["$C_p$", "$C_p=\\frac{\\gamma R}{\\gamma-1}$"],
              ["$C_v$", "$C_v=\\frac{R}{\\gamma-1}$"],
            ],
          },
        ],
      },
      importance: 5,
      source_page: 9,
      sort_order: 2,
    }),
    card(chapterId, "work-formulas", {
      title: "Work Formulae",
      card_type: "table",
      body: "The source lists work under isothermal, isochoric, isobaric, adiabatic, irreversible, and free-expansion cases.",
      formulas: [],
      variables: [vars.gamma, vars.P, vars.V, vars.R, vars.T],
      conditions: [],
      table_data: {
        columns: ["Case", "Formula"],
        rows: [
          ["Isothermal reversible expansion/compression", "$W=-nRT\\ln\\left(\\frac{V_f}{V_i}\\right)$"],
          ["Isochoric", "$dW=-P_{ext}\\,dV=0$"],
          ["Isobaric reversible", "$W=P(V_f-V_i)$"],
          ["Adiabatic reversible relation", "$T_2V_2^{\\gamma-1}=T_1V_1^{\\gamma-1}$"],
          ["Reversible work", "$W=\\frac{P_2V_2-P_1V_1}{\\gamma-1}=\\frac{nR(T_2-T_1)}{\\gamma-1}$"],
          ["Irreversible work", "$W=\\frac{P_2V_2-P_1V_1}{\\gamma-1}=\\frac{nR(T_2-T_1)}{\\gamma-1}=nC_v(T_2-T_1)=-P_{ext}(V_2-V_1)$"],
          ["Free expansion", "$P_{ext}=0\\Rightarrow dW=-P_{ext}\\,dV=0$"],
        ],
      },
      importance: 5,
      source_page: 9,
      sort_order: 3,
    }),
    card(chapterId, "constant-volume-pressure", {
      title: "Constant Volume and Constant Pressure",
      card_type: "formula",
      body: "The source connects constant-volume heat to internal energy and constant-pressure heat to enthalpy.",
      formulas: [
        { latex: "\\Delta U=\\Delta Q+\\Delta W,\\quad \\Delta W=-P\\Delta V" },
        { latex: "\\Delta U=\\Delta Q-P\\Delta V" },
        { latex: "du=(dq)_v,\\quad du=nC_vdT" },
        { latex: "C_v=\\frac{1}{n}\\frac{du}{dT}=\\frac{f}{2}R" },
        { latex: "H=U+PV" },
        { latex: "C_p-C_v=R\\quad\\text{(only for ideal gas)}" },
      ],
      variables: [vars.delta],
      conditions: ["The source states enthalpy is a state function and extensive property."],
      importance: 5,
      source_page: 10,
      sort_order: 4,
    }),
    card(chapterId, "entropy-laws-gibbs", {
      title: "Entropy, Third Law and Gibbs Free Energy",
      card_type: "formula",
      body: "The second-law and entropy block leads into Gibbs free energy.",
      formulas: [
        { latex: "\\Delta S_{universe}=\\Delta S_{system}+\\Delta S_{surrounding}>0\\quad\\text{for a spontaneous process}" },
        { latex: "\\Delta S_{system}=\\int_A^B\\frac{dq_{rev}}{T}" },
        { latex: "\\Delta S_{system}=nC_v\\ln\\frac{T_2}{T_1}+nR\\ln\\frac{V_2}{V_1}\\quad\\text{(only for an ideal gas)}" },
        { latex: "G_{system}=H_{system}-TS_{system}" },
      ],
      variables: [vars.T],
      conditions: ["Third law: entropy of perfect crystals of all pure elements and compounds is zero at absolute zero temperature."],
      importance: 5,
      source_page: 10,
      sort_order: 5,
    }),
    card(chapterId, "spontaneity-standard-gibbs", {
      title: "Spontaneity and Standard Free Energy",
      card_type: "table",
      body: "The source gives spontaneity criteria and standard free-energy equations.",
      formulas: [
        { latex: "\\Delta G=dw_{non-exp}=dH-TdS" },
        { latex: "\\Delta G^\\circ=-2.303RT\\log_{10}K" },
        { latex: "-\\Delta G=W_{net}=2.303nRT\\log_{10}\\frac{V_2}{V_1}" },
      ],
      variables: [vars.delta, vars.R, vars.T],
      conditions: ["At equilibrium, $\\Delta G=0$."],
      table_data: {
        columns: ["Criterion", "Source statement"],
        rows: [
          ["$\\Delta G_{system}<0$", "Process is spontaneous"],
          ["$\\Delta G_{system}>0$", "Process is non spontaneous"],
          ["$\\Delta G_{system}=0$", "System is at equilibrium"],
          ["Elemental state", "$\\Delta G_f^\\circ=0$"],
          ["Formation free energy", "$\\Delta G_f^\\circ=G^\\circ_{products}-G^\\circ_{reactants}$"],
        ],
      },
      importance: 5,
      source_page: 11,
      sort_order: 6,
    }),
    card(chapterId, "thermochemistry-reaction-enthalpy", {
      title: "Thermochemistry and Reaction Enthalpy",
      card_type: "formula",
      body: "The source defines standard enthalpy change and signs for endothermic/exothermic reactions.",
      formulas: [
        { latex: "\\Delta H^\\circ=H^0_{m,2}-H^0_{m,1}=C_p\\Delta T" },
        { latex: "\\Delta H_{reaction}=H_{products}-H_{reactants}" },
        { latex: "\\Delta H^\\circ_{reaction}=H^\\circ_{products}-H^\\circ_{reactants}" },
      ],
      variables: [vars.delta],
      conditions: ["Positive $\\Delta H$ is endothermic; negative $\\Delta H$ is exothermic."],
      importance: 5,
      source_page: 11,
      sort_order: 7,
    }),
    card(chapterId, "kirchhoff-formation-bond-resonance", {
      title: "Kirchhoff, Formation, Bond and Resonance Relations",
      card_type: "table",
      body: "The final Thermodynamics formulas before Chemical Equilibrium cover temperature dependence and enthalpy estimation.",
      formulas: [],
      variables: [vars.delta],
      conditions: ["$\\nu_B$ is the stoichiometric coefficient."],
      table_data: {
        columns: ["Topic", "Formula"],
        rows: [
          ["Kirchhoff equation at constant pressure", "$\\Delta H_2^\\circ=\\Delta H_1^\\circ+\\Delta C_p(T_2-T_1)$"],
          ["Constant volume reaction", "$\\Delta E_2^0=\\Delta E_1^0+\\int \\Delta C_v\\,dT$"],
          ["Reaction enthalpy from formation enthalpies", "$\\Delta H_r^\\circ=\\sum \\nu_B\\Delta H^\\circ_{f,products}-\\sum \\nu_B\\Delta H^\\circ_{f,reactants}$"],
          ["Bond enthalpy method", "$\\Delta H=(\\text{Enthalpy required to break reactants into gaseous atoms})-(\\text{Enthalpy released to form products from gaseous atoms})$"],
          ["Resonance energy", "$\\Delta H^\\circ_{resonance}=\\Delta H^\\circ_{f,experimental}-\\Delta H^\\circ_{f,calculated}=\\Delta H^\\circ_{c,calculated}-\\Delta H^\\circ_{c,experimental}$"],
        ],
      },
      importance: 5,
      source_page: 12,
      sort_order: 8,
    }),
  ];
}

function cardsForTrack(track) {
  return [
    ...atomicStructureCards(chapter(track, "atomic-structure")),
    ...stoichiometryCards(chapter(track, "stoichiometry")),
    ...gaseousStateCards(chapter(track, "gaseous-state")),
    ...thermodynamicsCards(chapter(track, "thermodynamics")),
  ];
}

export function getChemistryBatch1Chapters(track) {
  return CHEMISTRY_BATCH_1_CHAPTER_DEFINITIONS.map((definition) => ({
    id: chapter(track, definition.slug),
    subject_id: `${track}-chemistry`,
    title: definition.title,
    slug: definition.slug,
    sort_order: definition.sort_order,
  }));
}

export function getChemistryBatch1Cards(track) {
  return cardsForTrack(track);
}
