import process from "node:process";
import fs from "node:fs/promises";
import { NCERT_CHAPTERS } from "./test_jee_ncert_classifier.mjs";

const EXTENDED_PATTERNS = {
  Physics: [
    // 1. Units & Measurements
    ["Physical World, Units and Measurements", [
      "dimension", "vernier", "screw gauge", "least count", "significant figures", "error in measurement",
      "percentage error", "dimensions of", "si unit", "unit of", "dimensionless", "m l t", "m^", "l^", "t^"
    ]],
    // 2. Motion in a Straight Line
    ["Motion in a Straight Line", [
      "straight line", "rectilinear", "stopping distance", "average speed", "instantaneous velocity",
      "motion under gravity", "freely falling", "velocity-time", "displacement-time", "acceleration a =",
      "moves along x-axis", "v = u + at", "s = ut", "v^2 = u^2", "travels with speed"
    ]],
    // 3. Motion in a Plane
    ["Motion in a Plane", [
      "projectile", "horizontal range", "maximum height", "time of flight", "trajectory",
      "circular motion", "centripetal acceleration", "radius of curvature", "tangential acceleration",
      "angle of projection", "horizontal velocity", "relative velocity"
    ]],
    // 4. Laws of Motion
    ["Laws of Motion", [
      "friction", "coefficient of static friction", "coefficient of kinetic friction", "pulley",
      "tension in the string", "normal reaction", "pseudo force", "banking of road", "momentum conservation",
      "impulse", "free body", "inclined plane", "block of mass", "blocks of masses", "newton", "limiting friction"
    ]],
    // 5. Work, Energy and Power
    ["Work, Energy and Power", [
      "work done", "kinetic energy", "potential energy", "work energy theorem", "power",
      "conservative force", "spring potential energy", "vertical circle", "collision", "coefficient of restitution",
      "elastic collision", "inelastic collision", "mechanical energy", "frictionless track", "stopping distance"
    ]],
    // 6. System of Particles and Rotational Motion
    ["System of Particles and Rotational Motion", [
      "moment of inertia", "torque", "angular momentum", "center of mass", "centre of mass",
      "radius of gyration", "pure rolling", "rolling without slipping", "parallel axis", "perpendicular axis",
      "angular velocity", "angular acceleration", "rotational kinetic energy", "flywheel", "disk of mass",
      "solid sphere", "cylinder of mass", "ring of mass", "angular speed", "rad/s"
    ]],
    // 7. Gravitation
    ["Gravitation", [
      "gravitation", "gravitational field", "gravitational potential", "escape velocity", "orbital speed",
      "kepler", "satellite", "geostationary", "acceleration due to gravity", "height above earth", "depth below earth",
      "mass of earth", "radius of earth", "planet of mass", "orbiting the earth"
    ]],
    // 8. Mechanical Properties of Solids
    ["Mechanical Properties of Solids", [
      "young's modulus", "bulk modulus", "shear modulus", "modulus of rigidity", "stress", "strain",
      "hooke's law", "elastic potential energy", "breaking stress", "elongation of wire", "poisson's ratio",
      "compressibility", "wire of length", "stretched by", "tensile stress"
    ]],
    // 9. Mechanical Properties of Fluids
    ["Mechanical Properties of Fluids", [
      "bernoulli", "continuity", "terminal velocity", "stokes", "poiseuille", "surface tension",
      "surface energy", "capillary rise", "excess pressure", "viscosity", "buoyant force", "archimedes",
      "pascal's law", "hydraulic lift", "gauge pressure", "reynolds number", "venturimeter", "liquid drop",
      "soap bubble", "fluid", "streamline", "density of water", "depth of ocean", "viscous force"
    ]],
    // 10. Thermal Properties of Matter
    ["Thermal Properties of Matter", [
      "thermal expansion", "calorimetry", "specific heat", "latent heat", "thermal conductivity",
      "conduction of heat", "newton's law of cooling", "stefan", "wien's displacement", "black body",
      "emissivity", "heat current", "temperature gradient", "linear expansion", "cal/g", "joule/kg"
    ]],
    // 11. Thermodynamics
    ["Thermodynamics", [
      "first law of thermodynamics", "second law of thermodynamics", "isothermal", "adiabatic", "isobaric",
      "isochoric", "carnot", "efficiency of engine", "refrigerator", "cop of", "pv diagram", "work done by gas",
      "indicator diagram", "molar specific heat", "entropy change", "cyclic process", "heat absorbed", "delta u"
    ]],
    // 12. Kinetic Theory
    ["Kinetic Theory", [
      "kinetic theory", "rms speed", "mean free path", "degrees of freedom", "equipartition", "c_p / c_v",
      "c_p", "c_v", "most probable speed", "ideal gas", "van der waals", "triatomic", "diatomic", "monoatomic",
      "rigid gas", "non-rigid", "boltzmann", "gas molecules", "pressure of gas", "molar mass of gas"
    ]],
    // 13. Oscillations
    ["Oscillations", [
      "simple harmonic motion", "shm", "simple pendulum", "spring mass", "time period of", "restoring force",
      "angular shm", "damped oscillation", "forced oscillation", "resonance", "energy in shm", "phase difference",
      "amplitude of oscillation", "frequency of oscillation", "oscillating block", "x = a sin", "omega"
    ]],
    // 14. Waves
    ["Waves", [
      "transverse wave", "longitudinal wave", "wave on string", "standing wave", "sound wave", "speed of sound",
      "beats", "beat frequency", "organ pipe", "closed pipe", "open pipe", "doppler effect", "fundamental frequency",
      "overtone", "harmonics", "resonance tube", "stationary wave", "intensity of sound", "frequency of sound"
    ]],
    // 15. Electric Charges and Fields
    ["Electric Charges and Fields", [
      "coulomb", "electric field", "electric flux", "gauss's law", "electric dipole", "dipole moment",
      "torque on dipole", "charge distribution", "linear charge density", "surface charge density", "point charge",
      "positive charge", "negative charge", "charge q", "ring of radius", "electric force", "electrostatic force",
      "\\mu\\text{c}", "\\text{pc}", "\\text{nc}", "\\epsilon_0", "permittivity"
    ]],
    // 16. Electrostatic Potential and Capacitance
    ["Electrostatic Potential and Capacitance", [
      "capacitance", "parallel plate capacitor", "dielectric constant", "dielectric slab", "energy stored in capacitor",
      "potential difference", "electrostatic potential", "equipotential surface", "potential at a point", "common potential",
      "combination of capacitors", "capacitor", "capacitors", "microfarad", "\\mu\\text{f}", "pf"
    ]],
    // 17. Current Electricity
    ["Current Electricity", [
      "drift velocity", "mobility", "resistor", "resistance", "resistivity", "conductivity", "temperature coefficient",
      "wheatstone", "meter bridge", "potentiometer", "internal resistance", "emf of battery", "kirchhoff",
      "terminal voltage", "current density", "color code", "equivalent resistance", "electric current", "ammeter", "voltmeter",
      "ohm", "\\Omega", "current in the circuit", "cells connected"
    ]],
    // 18. Moving Charges and Magnetism
    ["Moving Charges and Magnetism", [
      "biot savart", "ampere's circuital", "lorentz force", "cyclotron", "magnetic field of circular", "magnetic field of solenoid",
      "toroid", "force between parallel", "magnetic moment", "galvanometer", "ammeter conversion", "voltmeter conversion",
      "magnetic force on", "helical path", "magnetic field at", "tesla", "\\text{t}", "gauss", "moving charge"
    ]],
    // 19. Magnetism and Matter
    ["Magnetism and Matter", [
      "magnetic dip", "angle of dip", "magnetic declination", "earth's magnetic", "magnetic susceptibility", "permeability",
      "diamagnetic", "paramagnetic", "ferromagnetic", "curie's law", "hysteresis", "coercivity", "retentivity",
      "bar magnet", "magnetometer", "magnetic meridian"
    ]],
    // 20. Electromagnetic Induction
    ["Electromagnetic Induction", [
      "magnetic flux", "faraday's law", "lenz's law", "motional emf", "induced emf", "eddy current",
      "self inductance", "mutual inductance", "solenoid inductance", "lr circuit", "time constant of inductor",
      "energy stored in inductor", "choke coil", "induced current", "henry", "\\text{h}", "coil of wire"
    ]],
    // 21. Alternating Current
    ["Alternating Current", [
      "lcr series", "impedance", "reactance", "inductive reactance", "capacitive reactance", "resonance in ac",
      "quality factor", "power factor", "wattless current", "transformer", "turns ratio", "rms voltage", "peak voltage",
      "phase angle", "ac circuit", "resonant frequency", "alternating voltage", "ac source", "frequency 50 hz"
    ]],
    // 22. Electromagnetic Waves
    ["Electromagnetic Waves", [
      "displacement current", "poynting vector", "electromagnetic spectrum", "radiation pressure", "em wave",
      "speed of light", "maxwell", "intensity of em", "electromagnetic wave", "wavelength of em", "microwaves", "x-rays"
    ]],
    // 23. Ray Optics and Optical Instruments
    ["Ray Optics and Optical Instruments", [
      "refraction", "reflection", "snell's law", "total internal reflection", "critical angle", "prism",
      "angle of minimum deviation", "lens maker", "focal length", "magnification", "microscope", "telescope",
      "concave mirror", "convex mirror", "convex lens", "concave lens", "refractive index", "dispersion", "optical fiber",
      "power of lens", "dioptre", "image formed by lens", "object placed in front"
    ]],
    // 24. Wave Optics
    ["Wave Optics", [
      "interference", "young's double slit", "ydse", "fringe width", "central maximum", "diffraction", "single slit",
      "resolving power", "polarisation", "polarization", "brewster's law", "malus' law", "polaroid", "coherent sources",
      "path difference", "wavefront", "slit width", "dark fringe", "bright fringe"
    ]],
    // 25. Dual Nature of Radiation and Matter
    ["Dual Nature of Radiation and Matter", [
      "photoelectric", "work function", "threshold frequency", "stopping potential", "einstein's photoelectric",
      "de broglie", "davisson", "matter waves", "photoelectron", "cut-off wavelength", "photon flux", "radiation pressure",
      "photon", "photons", "wavelength of electron"
    ]],
    // 26. Atoms
    ["Atoms", [
      "bohr radius", "bohr orbit", "lyman series", "balmer series", "paschen series", "brackett", "pfund", "rydberg",
      "energy level of hydrogen", "rutherford", "alpha particle scattering", "distance of closest approach",
      "spectral line", "hydrogen atom", "excitation energy", "ionization potential", "principal quantum number", "electron in nth orbit"
    ]],
    // 27. Nuclei
    ["Nuclei", [
      "binding energy", "mass defect", "radioactive", "half life", "mean life", "decay constant", "alpha decay",
      "beta decay", "gamma decay", "activity", "becquerel", "curie", "nuclear fission", "nuclear fusion", "atomic mass unit",
      "amu", "daughter nucleus", "parent nucleus", "nucleon", "mass of proton", "mass of neutron", "nucleus of mass"
    ]],
    // 28. Semiconductor Electronics
    ["Semiconductor Electronics: Materials, Devices and Simple Circuits", [
      "zener", "p-n junction", "diode", "transistor", "logic gate", "nand", "nor", "truth table", "semiconductor",
      "rectifier", "photodiode", "solar cell", "intrinsic semiconductor", "extrinsic", "valency band", "conduction band",
      "band gap", "depletion layer", "reverse breakdown", "reverse-biased", "forward-biased", "reverse bias", "forward bias",
      "n-type", "p-type", "barrier potential", "not gate", "and gate", "or gate"
    ]],
    // 29. Communication Systems
    ["Communication Systems", [
      "modulation index", "amplitude modulation", "frequency modulation", "carrier wave", "sideband", "line of sight",
      "sky wave", "ground wave", "space wave", "bandwidth", "transmitter", "antenna height", "demodulation", "repeater"
    ]],
  ],
  Chemistry: [
    ["Coordination Compounds", ["coordination compound", "ligand", "chelate", "coordination number", "crystal field splitting", "cfse", "octahedral complex", "tetrahedral complex", "spectrochemical series", "werner's theory", "magnetic moment of complex", "spin only magnetic moment", "iupac name of complex", "linkage isomerism", "ionization isomerism", "coordination isomerism", "geometrical isomerism in complex", "optical isomerism in complex", "inner orbital complex", "outer orbital complex", "d2sp3", "sp3d2", "synergic bonding", "metal carbonyl", "en_3", "ox_2", "complex ion", "[fe(", "[co(", "[ni(", "[pt(", "[cr("]],
    ["The d- and f-Block Elements", ["transition element", "lanthanoid", "actinoid", "lanthanoid contraction", "kmno4", "k2cr2o7", "d-block", "f-block", "potassium permanganate", "potassium dichromate", "variable oxidation state", "interstitial compound", "alloy", "catalytic property of transition", "paramagnetic transition", "spin only formula", "cr2+", "mn2+", "fe3+", "cu2+", "eu2+", "gd3+", "electronic configuration of transition", "scandium", "titanium", "vanadium", "chromium", "manganese", "cobalt", "nickel", "copper", "zinc"]],
    ["General Principles and Processes of Isolation of Elements", ["metallurgy", "froth floatation", "calcination", "roasting", "blast furnace", "extraction of iron", "extraction of copper", "extraction of aluminium", "hall-heroult", "zone refining", "van arkel", "mond process", "bauxite", "hematite", "pyrites", "copper matte", "ellingham diagram", "leaching of ore", "liquation", "smelting", "flux", "ore of"]],
    ["The p-Block Elements (Group 15 to 18)", ["xenon", "xef2", "xef4", "xef6", "xeo3", "xeof4", "interhalogen", "group 15", "group 16", "group 17", "group 18", "haber process", "ostwald process", "contact process", "nitric acid", "sulfuric acid", "sulphuric acid", "phosphorus halides", "oxoacids of phosphorus", "oxoacids of sulfur", "oxoacids of chlorine", "noble gases", "noble gas", "ozone", "allotropes of sulfur", "allotropes of phosphorus", "white phosphorus", "red phosphorus", "phosphine", "bleaching powder", "halogens", "interhalogen compounds", "ammonia", "hno3", "h2so4", "pcl5", "pcl3"]],
    ["The p-Block Elements (Group 13 and 14)", ["boron", "diborane", "borax", "boric acid", "silicon", "silicone", "silicate", "zeolite", "group 13", "group 14", "allotropes of carbon", "diamond", "graphite", "fullerene", "carbon monoxide", "inert pair effect", "3c-2e bond", "banana bond", "carbon family", "boron family", "bf3", "bcl3", "sio2", "ccl4", "sicl4"]],
    ["The s-Block Elements", ["alkali metal", "alkaline earth", "s-block", "group 1", "group 2", "sodium carbonate", "sodium hydroxide", "baking soda", "plaster of paris", "quick lime", "slaked lime", "anomalous behavior of lithium", "anomalous behavior of beryllium", "diagonal relationship", "biological role of sodium", "biological role of magnesium", "solubility of sulphates of group 2", "flame test", "liquid ammonia solution", "naoh", "na2co3", "caco3", "ca(oh)2", "mgso4", "caso4"]],
    ["Hydrogen", ["heavy water", "d2o", "hydrogen peroxide", "h2o2", "volume strength of h2o2", "hard water", "soft water", "temporary hardness", "permanent hardness", "hydrides", "saline hydrides", "interstitial hydrides", "protium", "deuterium", "tritium", "dihydrogen"]],
    ["Environmental Chemistry", ["biochemical oxygen demand", "bod", "cod", "photochemical smog", "classical smog", "acid rain", "greenhouse effect", "ozone layer depletion", "cfc", "freon", "tropospheric pollution", "stratospheric pollution", "green chemistry", "ppm of fluoride", "pollution of water", "drinking water standard"]],
    ["Chemistry in Everyday Life", ["antacid", "antihistamine", "tranquilizer", "analgesic", "narcotic", "antimicrobial", "antibiotic", "antiseptic", "disinfectant", "artificial sweetener", "aspartame", "saccharin", "sucralose", "detergent", "cationic detergent", "anionic detergent", "non-ionic detergent", "saponification", "food preservative", "drug"]],
    ["Polymers", ["polymer", "monomer", "addition polymer", "condensation polymer", "nylon 6", "nylon 6,6", "terylene", "dacron", "bakelite", "novolac", "melamine", "buna-s", "buna-n", "neoprene", "natural rubber", "vulcanization", "teflon", "phbv", "polyethylene", "biodegradable polymer", "glyptal", "polystyrene", "cross-linked polymer", "monomer of"]],
    ["Biomolecules", ["glucose", "fructose", "sucrose", "maltose", "lactose", "starch", "glycogen", "cellulose", "amino acid", "peptide linkage", "peptide bond", "primary structure of protein", "secondary structure of protein", "alpha helix", "beta sheet", "denaturation of protein", "enzyme", "vitamin", "fat soluble vitamin", "water soluble vitamin", "dna", "rna", "nucleotide", "nucleoside", "adenine", "guanine", "cytosine", "thymine", "uracil", "zwitter ion", "isoelectric point", "invert sugar", "reducing sugar", "non-reducing sugar", "glycine", "alanine", "nucleic acid"]],
    ["Amines", ["amine", "primary amine", "secondary amine", "tertiary amine", "aniline", "gabriel phthalimide", "hoffmann bromamide", "carbylamine", "hinsberg test", "diazonium", "benzene diazonium", "sandmeyer", "gattermann", "azo dye", "coupling reaction", "basicity of amines", "diazotisation", "acylation of aniline", "quaternary ammonium", "nh2 group", "c6h5nh2"]],
    ["Aldehydes, Ketones and Carboxylic Acids", ["aldehyde", "ketone", "carboxylic acid", "carbonyl group", "nucleophilic addition to carbonyl", "aldol condensation", "cross aldol", "cannizzaro", "clemmensen reduction", "wolff kishner", "tollens' reagent", "fehling's solution", "haloform reaction", "iodoform test", "rosenmund reduction", "etard reaction", "gattermann-koch", "hell-volhard-zelinsky", "hvz reaction", "decarboxylation", "esterification", "acidic strength of carboxylic", "acetic acid", "benzoic acid", "acetophenone", "benzaldehyde", "oxime", "hydrazone", "semicarbazone", "ch3cooh", "c=o"]],
    ["Alcohols, Phenols and Ethers", ["alcohol", "phenol", "ether", "lucas reagent", "lucas test", "reimer tiemann", "kolbe reaction", "williamson ether synthesis", "cumene process", "picric acid", "salicylic acid", "cleavage of ether by hi", "hydroboration oxidation", "fermentation of ethanol", "acidity of phenol", "bromination of phenol", "primary alcohol", "secondary alcohol", "tertiary alcohol", "phenol reacts with", "anisole", "ether cleavage", "-oh group", "c2h5oh"]],
    ["Haloalkanes and Haloarenes", ["\\text{s}_{\\text{n}}1", "\\text{s}_{\\text{n}}2", "sn1 mechanism", "sn2 mechanism", "nucleophilic substitution alkyl halide", "alkyl halide", "aryl halide", "haloalkane", "haloarene", "elimination reaction", "saytzeff", "wurtz fittig", "fittig reaction", "grignard reagent", "chiral center", "inversion of configuration", "racemisation", "chloroform", "iodoform", "ddt", "vinylic halide", "allylic halide", "benzyl chloride", "chlorobenzene", "nucleophilic substitution", "c-cl", "c-br", "halide"]],
    ["Hydrocarbons", ["acidic hydrogen", "alkane", "alkene", "alkyne", "aromatic hydrocarbon", "benzene", "markovnikov", "anti-markovnikov", "peroxide effect", "ozonolysis", "wurtz reaction", "friedel crafts alkylation", "friedel crafts acylation", "electrophilic aromatic substitution", "nitration of benzene", "bromination of benzene", "acidity of terminal alkynes", "conformations of ethane", "sawhorse", "newman projection", "huckel's rule of aromaticity", "aromaticity", "hyperconjugation in alkene", "electrophilic addition", "ethane", "ethene", "ethyne", "toluene"]],
    ["Organic Chemistry - Some Basic Principles and Techniques", ["iupac nomenclature", "inductive effect", "hyperconjugation", "electromeric effect", "carbocation stability", "carbanion stability", "free radical stability", "resonance energy", "mesomeric effect", "electrophile", "nucleophile", "lassaigne's test", "dumas method", "kjeldahl method", "carius method", "column chromatography", "thin layer chromatography", "tautomerism", "geometrical isomerism", "optical isomerism", "enantiomers", "diastereomers", "chirality", "iupac name of", "hybridisation of carbon", "isomerism", "carbocation", "carbanion", "free radical"]],
    ["Surface Chemistry", ["adsorption", "physisorption", "chemisorption", "freundlich adsorption", "langmuir adsorption", "catalysis", "homogeneous catalysis", "heterogeneous catalysis", "colloid", "lyophilic", "lyophobic", "micelle", "critical micelle concentration", "cmc", "tyndall effect", "brownian motion", "electrophoresis", "coagulation", "hardy schulze", "gold number", "emulsion", "zeta potential", "colloidal solution", "adsorbate", "adsorbent"]],
    ["Chemical Kinetics", ["rate of reaction", "rate law", "rate constant", "order of reaction", "first order reaction", "zero order reaction", "second order reaction", "half life of reaction", "integrated rate law", "arrhenius equation", "activation energy", "collision theory", "pseudo first order", "frequency factor", "temperature coefficient of reaction", "rate determining step", "rate = k", "half-life", "mol l^-1 s^-1", "rate constant k"]],
    ["Electrochemistry", ["galvanic cell", "electrochemical cell", "standard reduction potential", "nernst equation", "cell potential", "emf of cell", "standard hydrogen electrode", "kohlrausch's law", "molar conductivity", "equivalent conductivity", "specific conductivity", "conductance", "faraday's first law", "faraday's second law", "electrolysis", "lead storage battery", "fuel cell", "dry cell", "corrosion", "rusting of iron", "gibbs energy of cell", "limiting molar conductivity", "e^\\circ_{\\text{cell}}", "e^\\circ_{\\text{red}}", "electrode potential", "faraday constant", "ohm^-1 cm^-1"]],
    ["Solutions", ["molarity", "molality", "mole fraction", "raoult's law", "henry's law", "ideal solution", "non-ideal solution", "positive deviation from raoult", "negative deviation from raoult", "azeotropic mixture", "colligative property", "relative lowering of vapour pressure", "elevation in boiling point", "ebullioscopic constant", "depression in freezing point", "cryoscopic constant", "osmotic pressure", "van't hoff factor", "abnormal molar mass", "reverse osmosis", "depression of freezing point", "elevation of boiling point", "vapour pressure of solution", "k_b", "k_f"]],
    ["The Solid State", ["unit cell", "crystal lattice", "bcc", "fcc", "hcp", "simple cubic", "coordination number in crystal", "packing efficiency", "density of unit cell", "tetrahedral void", "octahedral void", "radius ratio", "schottky defect", "frenkel defect", "f-center", "metal excess defect", "metal deficiency defect", "ferromagnetism", "antiferromagnetism", "ferrimagnetism", "bragg's law", "face centered cubic", "body centered cubic", "edge length a ="]],
    ["Redox Reactions", ["oxidation number", "oxidation state", "redox reaction", "balancing redox", "half reaction method", "disproportionation", "oxidizing agent", "reducing agent", "ion electron method", "oxidation number of cr", "oxidation number of mn", "oxidation number of s", "oxidized", "reduced", "reducing power"]],
    ["Equilibrium", ["\\rightleftharpoons", "chemical equilibrium", "ionic equilibrium", "equilibrium constant", "k_c", "k_p", "k_1", "k_2", "k_3", "le chatelier", "reaction quotient", "q_c", "law of mass action", "ph calculation", "ph of solution", "poh", "dissociation constant of acid", "k_a", "k_b", "buffer solution", "henderson hasselbalch", "solubility product", "k_sp", "k_{sp}", "common ion effect", "hydrolysis of salt", "degree of ionization", "ostwald's dilution law", "degree of dissociation", "solubility of sparingly soluble", "acidic buffer", "basic buffer", "[h^+]", "[oh^-]"]],
    ["Thermodynamics", ["enthalpy of reaction", "enthalpy of formation", "enthalpy of combustion", "bond dissociation energy", "hess's law", "first law of thermo", "internal energy change", "work of expansion", "heat of reaction", "entropy change", "delta s", "delta h", "delta g", "\\delta h", "\\delta s", "\\delta g", "gibbs free energy", "spontaneity of reaction", "standard entropy", "calorimeter", "bomb calorimeter", "born haber cycle", "lattice enthalpy", "standard enthalpy", "\\Delta H", "\\Delta S", "\\Delta G", "kJ mol^-1", "exothermic", "endothermic"]],
    ["States of Matter", ["ideal gas equation", "boyle's law", "charles' law", "gay-lussac", "dalton's law of partial pressure", "graham's law of diffusion", "kinetic molecular theory of gas", "van der waals equation", "compressibility factor", "z = pv/nrt", "critical temperature", "critical pressure", "inversion temperature", "liquefaction of gases", "real gas", "surface tension of liquid", "viscosity of liquid", "partial pressure", "gas occupies volume"]],
    ["Chemical Bonding and Molecular Structure", ["lewis structure", "formal charge", "vsepr theory", "shape of molecule", "geometry of molecule", "hybridization", "hybridisation", "sp3d", "sp3d2", "sp3", "sp2", "sp hybridization", "dipole moment", "molecular orbital theory", "mot", "bond order", "magnetic nature of molecule", "paramagnetic molecule", "diamagnetic molecule", "hydrogen bonding", "intermolecular hydrogen bond", "intramolecular hydrogen bond", "valence bond theory", "resonance in molecule", "shape of sf4", "shape of xef4", "shape of pcl5", "bent shape", "trigonal bipyramidal", "octahedral shape", "bond angle", "covalent bond", "ionic bond"]],
    ["Classification of Elements and Periodicity in Properties", ["modern periodic table", "mendeleev", "ionization enthalpy", "ionization energy", "electron gain enthalpy", "electronegativity", "pauling scale", "mulliken scale", "atomic radius", "ionic radius", "isoelectronic species", "screening effect", "effective nuclear charge", "z_eff", "periodic trends", "metallic character", "non-metallic character", "diagonal relationship", "first ionization enthalpy", "second ionization enthalpy", "order of atomic radius", "electronic configuration"]],
    ["Structure of Atom", ["bohr's model of atom", "rydberg equation", "hydrogen spectrum", "de broglie wavelength", "heisenberg's uncertainty principle", "quantum numbers", "principal quantum number", "azimuthal quantum number", "magnetic quantum number", "spin quantum number", "shapes of orbitals", "radial node", "angular node", "total nodes", "aufbau principle", "pauli's exclusion principle", "hund's rule of maximum multiplicity", "electronic configuration of atom", "photoelectric effect", "black body radiation", "planck's quantum theory", "wave-particle duality", "orbital angular momentum", "radius of nth orbit", "wave function", "orbital"]],
    ["Some Basic Concepts of Chemistry", ["mole concept", "molar mass", "empirical formula", "molecular formula", "stoichiometry", "limiting reagent", "percentage composition", "molarity of solution", "molality of solution", "mole fraction", "normality", "law of conservation of mass", "law of definite proportions", "law of multiple proportions", "significant figures in chemistry", "atomic mass unit", "number of moles", "volume of oxygen required", "grams of", "molecules of", "atoms of"]],
  ],
  Mathematics: [
    ["Matrices", ["\\mathrm{adj}", "adj\\,(a)", "adj(a)", "adjoint", "trace of matrix", "symmetric matrix", "skew-symmetric", "orthogonal matrix", "inverse of matrix", "idempotent", "nilpotent", "involutory", "matrix multiplication", "transpose of matrix", "eigenvalues", "3 \\times 3 matrix", "2 \\times 2 matrix", "powers of matrix", "characteristic equation", "let a be a matrix", "a^2 = a", "matrix a =", "b = a^t"]],
    ["Determinants", ["\\mathrm{det}", "det\\,(a)", "det(a)", "determinant of matrix", "determinant", "cramer's rule", "cramers rule", "system of linear equations", "infinitely many solutions", "non-trivial solution", "trivial solution", "inconsistent system", "minors and cofactors", "properties of determinants", "|adj\\,(3", "|\\mathrm{adj}", "system of equations has no solution", "unique solution", "system of equations:", "ax + by + cz ="]],
    ["Vector Algebra", ["dot product", "cross product", "scalar triple product", "box product", "vector triple product", "coplanar vectors", "magnitude of vector", "unit vector", "projection of vector", "collinear vectors", "\\vec{a} \\times \\vec{b}", "\\vec{a} \\cdot \\vec{b}", "\\vec{r} =", "\\vec{u} \\times \\vec{v}", "(\\vec{a} \\times \\vec{b}) \\times \\vec{c}", "[\\vec{a} \\vec{b} \\vec{c}]", "position vector", "\\vec{a}", "\\vec{b}", "\\vec{c}", "\\hat{i}", "\\hat{j}", "\\hat{k}", "vector perpendicular to", "|\\vec{a}|", "vectors \\vec{a}"]],
    ["Three Dimensional Geometry", ["shortest distance between skew lines", "distance between skew lines", "angle between two lines in 3d", "equation of plane", "plane passing through", "coplanar lines in space", "foot of perpendicular from point to plane", "image of point in plane", "distance of point from plane", "line of intersection of two planes", "symmetric form of line", "direction ratios of line", "direction cosines", "skew lines", "z-axis", "x-axis", "y-axis", "line \\text{l}_1 passes through", "line l_1 passes through", "equation of line in 3d", "intersecting lines", "plane contains the line", "points (x, y, z)"]],
    ["Introduction to Three Dimensional Geometry", ["octant", "section formula in 3d", "distance formula in 3d"]],
    ["Differential Equations", ["differential equation", "order and degree of differential", "variable separable", "homogeneous differential equation", "linear differential equation", "integrating factor", "dy/dx + py = q", "\\frac{dy}{dx} +", "\\frac{dy}{dx} =", "solution curve of the differential", "formation of differential equation", "orthogonal trajectory", "solution of the differential equation", "y(1) =", "y(0) =", "\\frac{dy}{dx}"]],
    ["Application of Integrals", ["area bounded", "area enclosed", "area of region bounded", "area of the region bounded", "area under the curve", "area between curves", "area of ellipse", "bounded by the curves", "area of region", "area bounded by the parabola", "area in the first quadrant"]],
    ["Integrals", ["definite integral", "indefinite integral", "integration by parts", "integration by substitution", "properties of definite integrals", "king's property", "leibniz rule", "differentiation under integral sign", "limit of sum", "wallis formula", "definite integration", "\\int_0^", "\\int_{-", "\\int_1^", "\\int_{0}^{", "\\int \\frac{", "\\int ", "value of the integral", "dx ="]],
    ["Application of Derivatives", ["local maximum", "local minimum", "tangent to the curve", "normal to the curve", "slope of tangent", "equation of tangent", "equation of normal", "strictly increasing", "strictly decreasing", "monotonic function", "rate of change of", "lagrange's mean value", "lmvt", "rolle's theorem", "point of inflection", "critical point", "maximum value of f(x)", "minimum value of f(x)", "maximum value of", "minimum value of"]],
    ["Continuity and Differentiability", ["continuous function", "points of discontinuity", "is continuous at x", "is differentiable at x", "differentiability of function", "derivative of composite", "chain rule", "logarithmic differentiation", "derivative of implicit", "derivative of parametric", "second order derivative", "d^2y/dx^2", "\\frac{d^2y}{dx^2}", "f'(x) =", "f''(x)", "derivative of f(x)", "differentiable on"]],
    ["Limits and Derivatives", ["\\lim_{x \\to", "\\lim_{x\\to", "\\lim_{t \\to", "\\lim_{n \\to", "l'hopital's rule", "l'hospital", "first principle of derivative", "evaluation of limits", "indeterminate form", "sandwich theorem", "squeeze theorem", "limit exists", "limit as x tends to"]],
    ["Inverse Trigonometric Functions", ["\\sin^{-1}", "\\cos^{-1}", "\\tan^{-1}", "\\sec^{-1}", "\\csc^{-1}", "\\cot^{-1}", "arcsin", "arccos", "arctan", "principal value branch", "tan^{-1} x + tan^{-1} y", "properties of inverse trigonometric", "domain of \\sin^{-1}", "\\tan^{-1}"]],
    ["Trigonometric Functions", ["trigonometric identity", "\\sin(a+b)", "\\cos(a+b)", "\\tan(a+b)", "\\sin 2x", "\\cos 2x", "\\tan 2x", "\\sin 3x", "\\cos 3x", "trigonometric equation", "general solution of trigonometric equation", "principal solution", "maximum value of a sin x + b cos x", "\\cos^2 \\theta", "\\sin^2 \\theta", "\\tan \\theta", "\\sin x + \\cos x", "\\cos x", "\\sin x", "\\tan x", "\\sec x", "\\csc x", "\\cot x", "\\sin^2", "\\cos^2"]],
    ["Conic Sections", ["parabola", "ellipse", "hyperbola", "eccentricity of ellipse", "eccentricity of hyperbola", "focus of parabola", "directrix of parabola", "latus rectum of parabola", "latus rectum of ellipse", "equation of tangent to parabola", "equation of tangent to ellipse", "equation of tangent to hyperbola", "focal distance", "asymptotes of hyperbola", "rectangular hyperbola", "standard equation of circle", "circle passes through", "center and radius of circle", "tangent to circle", "chord of contact", "director circle", "equation of circle", "radius of circle", "circle x^2 + y^2"]],
    ["Straight Lines", ["slope of line", "slope intercept form", "point slope form", "two point form", "intercept form of line", "normal form of line", "angle between two lines", "distance between parallel lines", "perpendicular distance of a point from line", "foot of perpendicular to line", "image of a point with respect to line", "concurrent lines", "family of lines", "pair of straight lines", "line passing through the point", "lines l1 and l2", "triangle formed by lines", "vertices of triangle", "centroid", "orthocentre", "circumcentre"]],
    ["Sequences and Series", ["arithmetic progression", "geometric progression", "arithmetico-geometric", "harmonic progression", "ap", "gp", "agp", "n-th term of ap", "sum of first n terms", "sum to infinity of gp", "arithmetic mean", "geometric mean", "am >= gm", "am and gm inequality", "sum of series", "telescoping series", "\\sum_{r=1}", "\\sum_{k=1}", "\\sum_{n=1}", "\\sum_{i=1}", "sum of the series", "\\dots \\infty", "\\dots", "terms of an ap", "terms of a gp", "a_1, a_2, a_3"]],
    ["Binomial Theorem", ["binomial expansion", "general term in binomial", "middle term in binomial", "binomial coefficient", "sum of binomial coefficients", "term independent of x", "coefficient of x^", "multinomial theorem", "remainder when divided by", "divisibility using binomial", "{}^n\\mathrm{C}_r", "{}^{n}\\mathrm{C}_{r}", "{}^{9}\\mathrm{C}_r", "{}^nC_r", "{}^{n}C_{r}", "{}^{10}C_r", "{}^{20}C_r", "(1 + x)^n", "binomial"]],
    ["Permutations and Combinations", ["permutations", "combinations", "number of ways", "number of arrangements", "circular permutation", "distribution of distinct objects", "distribution of identical objects", "derangement", "number of integral solutions", "inclusion-exclusion", "fundamental principle of counting", "{}^n\\mathrm{P}_r", "{}^nP_r", "number of 4 digit numbers", "formed using the digits", "arranged in a row", "selection of"]],
    ["Linear Programming", ["linear programming", "lpp", "feasible region", "objective function", "constraints", "corner point method", "optimal solution", "bounded region", "maximize z", "minimize z"]],
    ["Linear Inequalities", ["linear inequality", "system of inequalities", "solution of inequality", "|x - a| < b", "|x| < "]],
    ["Probability – II", ["conditional probability", "bayes' theorem", "total probability theorem", "independent events", "random variable", "probability distribution of random variable", "expected value", "variance of random variable", "bernoulli trials", "binomial distribution", "p(x = r)", "p(a|b)", "mean and variance of binomial"]],
    ["Probability – I", ["probability that", "probability of getting", "sample space", "mutually exclusive events", "exhaustive events", "addition theorem of probability", "odds in favor", "odds against", "pack of 52 cards", "rolling a dice", "tossing a coin", "defective oranges", "box contains", "balls are drawn", "drawn at random"]],
    ["Statistics", ["mean deviation", "variance of observations", "standard deviation of", "coefficient of variation", "sum of squares of observations", "mean of 10 observations", "variance of 10 observations", "variance of 20 observations", "mean and variance of", "mean of observations", "standard deviation", "median of"]],
    ["Mathematical Reasoning", ["negation of the statement", "contrapositive of", "converse of", "tautology", "fallacy", "truth table of", "p \\implies q", "p \\land q", "p \\lor q", "biconditional", "is logically equivalent to", "compound proposition", "negation of"]],
    ["Complex Numbers and Quadratic Equations", ["complex number", "imaginary part", "real part", "modulus of complex", "argument of complex", "arg(z)", "conjugate of complex", "roots of unity", "cube roots of unity", "\\omega^2 + \\omega + 1 = 0", "quadratic equation", "roots of quadratic equation", "discriminant of quadratic", "sum and product of roots", "nature of roots", "common root", "location of roots", "quadratic expression", "z \\in \\mathbb{C}", "|z - 1|", "|z| =", "alpha and beta are roots", "roots of the equation x^2"]],
    ["Principle of Mathematical Induction", ["mathematical induction", "p(n) is true for all n", "principle of induction"]],
    ["Relations and Functions – II", ["one-one function", "onto function", "bijective function", "injective", "surjective", "composite function", "fog(x)", "gof(x)", "inverse of a function", "equivalence relation", "reflexive relation", "symmetric relation", "transitive relation", "equivalence classes", "binary operation", "number of relations", "number of functions"]],
    ["Relations and Functions – I", ["cartesian product", "domain of the function", "range of the function", "domain of f(x)", "range of f(x)", "greatest integer function", "fractional part function", "signum function", "modulus function", "rational function", "f: \\mathbb{R} \\to \\mathbb{R}", "domain of the real function", "f(x) =", "domain of f"]],
    ["Sets", ["power set", "null set", "universal set", "venn diagram", "union of sets", "intersection of sets", "difference of sets", "complement of set", "cardinality of set", "de morgan's law", "number of subsets of the set", "n(A \\cup B)", "let a and b be two sets", "set a =", "subset of"]],
  ],
};

function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function classifyQuestionExtended(row) {
  const subject = row.subject === "Maths" ? "Mathematics" : row.subject;
  const rules = EXTENDED_PATTERNS[subject];
  if (!rules) return { chapter: null, confidence: 0 };

  const validChapters = NCERT_CHAPTERS[subject];
  const exactMatch = validChapters.find(ch => normalizeKey(ch) === normalizeKey(row.chapter));
  if (exactMatch && row.chapter !== "Unmapped" && !row.chapter.startsWith("General ")) {
    return { chapter: exactMatch, confidence: 1.0 };
  }

  const rawText = [row.question, row.option_a, row.option_b, row.option_c, row.option_d, row.explanation, row.topic].filter(Boolean).join(" ");
  const normText = normalizeKey(rawText);

  const scores = [];
  for (const [chapter, keywords] of rules) {
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
  if (scores.length === 0) return { chapter: null, confidence: 0 };

  const top = scores[0];
  return { chapter: top.chapter, confidence: 0.9, reason: `Top score ${top.score}` };
}

async function runClassifier() {
  const unclassified = JSON.parse(await fs.readFile("./scratch/jee_classification/unclassified.json", "utf8"));
  console.log("Input unclassified count:", unclassified.length);

  const solved = [];
  const stillUnsolved = [];

  for (const q of unclassified) {
    const res = classifyQuestionExtended(q);
    if (res.chapter) {
      solved.push({ ...q, ncert_chapter: res.chapter, confidence: res.confidence, reason: res.reason });
    } else {
      stillUnsolved.push(q);
    }
  }

  console.log({
    total: unclassified.length,
    classified: solved.length,
    remaining: stillUnsolved.length,
  });

  await fs.writeFile("./scratch/jee_classification/batch2_classified.json", JSON.stringify(solved, null, 2));
  await fs.writeFile("./scratch/jee_classification/remaining_unsolved.json", JSON.stringify(stillUnsolved, null, 2));

  if (stillUnsolved.length > 0) {
    console.log("Remaining unsolved sample:");
    console.log(stillUnsolved.slice(0, 5).map(q => ({ subject: q.subject, q: q.question.slice(0, 100) })));
  }
}

runClassifier();
