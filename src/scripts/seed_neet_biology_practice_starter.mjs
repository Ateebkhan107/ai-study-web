import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

process.loadEnvFile(".env.local");

const SOURCE_TYPE = "PREPZII_PRACTICE";
const STATUS = "PUBLISHED";

const chapters = [
  {
    chapter: "The Living World & Biological Classification",
    questions: [
      ["Which feature is most useful for placing an organism in a taxonomic hierarchy?", ["Temporary body size", "Shared inherited characters", "Habitat alone", "Seasonal behaviour"], "B", "Taxonomy", "Easy", "Taxonomic hierarchy is based on shared inherited characters, not only habitat or temporary traits."],
      ["Two organisms belong to the same genus but different species. Which statement is correct?", ["They must belong to different families", "They share more characters than organisms of different genera", "They cannot interbreed under any condition", "They must have identical morphology"], "B", "Taxonomic categories", "Medium", "Members of the same genus are more closely related than members of different genera."],
      ["In five-kingdom classification, fungi are separated from plants mainly because fungi are", ["autotrophic and motile", "heterotrophic with absorptive nutrition", "prokaryotic and unicellular", "photosynthetic with cellulose walls"], "B", "Five kingdom classification", "Easy", "Fungi show absorptive heterotrophic nutrition and have cell walls mainly of chitin."],
      ["A bacterium with a circular naked DNA molecule and no membrane-bound organelles should be placed in", ["Protista", "Monera", "Fungi", "Plantae"], "B", "Kingdom Monera", "Easy", "Prokaryotic cells with naked circular DNA belong to Monera."],
      ["Viruses are considered acellular because they", ["lack genetic material", "lack cellular machinery outside a host", "always have a cell wall", "divide by binary fission"], "B", "Viruses", "Medium", "Viruses contain genetic material but lack independent cellular machinery and metabolism."],
    ],
  },
  {
    chapter: "Plant Kingdom",
    questions: [
      ["The dominant phase in the life cycle of bryophytes is the", ["sporophyte", "gametophyte", "zygote", "protonema only"], "B", "Bryophytes", "Easy", "Bryophytes have a dominant photosynthetic gametophyte generation."],
      ["Seed habit first appears in", ["algae", "bryophytes", "pteridophytes", "gymnosperms"], "D", "Gymnosperms", "Easy", "Gymnosperms are seed plants, though their seeds are naked."],
      ["Heterospory is an important evolutionary step because it is associated with", ["loss of vascular tissue", "origin of seed habit", "absence of roots", "formation of chlorophyll b"], "B", "Pteridophytes", "Medium", "Heterospory is linked with retention of the female gametophyte and evolution of seed habit."],
      ["Which plant group has vascular tissue but no seeds?", ["Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms"], "B", "Pteridophytes", "Easy", "Pteridophytes possess xylem and phloem but reproduce by spores."],
      ["Double fertilisation is a characteristic feature of", ["algae", "bryophytes", "gymnosperms", "angiosperms"], "D", "Angiosperms", "Easy", "Angiosperms show syngamy and triple fusion, collectively called double fertilisation."],
    ],
  },
  {
    chapter: "Animal Kingdom",
    questions: [
      ["Animals with a body cavity completely lined by mesoderm are called", ["acoelomates", "pseudocoelomates", "coelomates", "diploblastic"], "C", "Body cavity", "Easy", "A true coelom is lined by mesoderm on both sides."],
      ["Cnidarians possess specialised cells for defence and prey capture called", ["choanocytes", "cnidoblasts", "flame cells", "collar cells"], "B", "Cnidaria", "Easy", "Cnidoblasts or cnidocytes are characteristic of cnidarians."],
      ["Which feature distinguishes chordates from non-chordates?", ["Segmented body", "Notochord at some stage", "Jointed appendages", "Open circulatory system"], "B", "Chordata", "Easy", "Chordates possess a notochord at least during some developmental stage."],
      ["In arthropods, the exoskeleton is mainly composed of", ["silica", "chitin", "cellulose", "keratin"], "B", "Arthropoda", "Easy", "Arthropod exoskeleton is made mainly of chitin."],
      ["Radial symmetry is most suitable for animals that are generally", ["fast moving predators", "sessile or slow moving", "strictly terrestrial", "bilaterally segmented"], "B", "Symmetry", "Medium", "Radial symmetry helps sessile or slow-moving animals receive stimuli from all directions."],
    ],
  },
  {
    chapter: "Morphology & Anatomy of Flowering Plants",
    questions: [
      ["A flower with the gynoecium placed above other floral parts is described as", ["epigynous", "perigynous", "hypogynous", "zygomorphic"], "C", "Flower morphology", "Medium", "In hypogynous flowers, the ovary is superior and other whorls arise below it."],
      ["Vascular bundles in monocot stems are generally", ["arranged in a ring and open", "scattered and closed", "radial and open", "absent"], "B", "Stem anatomy", "Easy", "Monocot stems have scattered closed vascular bundles."],
      ["A placentation in which ovules arise from the central axis of a multilocular ovary is", ["marginal", "axile", "parietal", "basal"], "B", "Placentation", "Easy", "Axile placentation has ovules attached to a central axis."],
      ["Pneumatophores are modified roots mainly meant for", ["food storage", "mechanical climbing", "gaseous exchange", "vegetative propagation"], "C", "Root modifications", "Easy", "Pneumatophores help plants in marshy areas obtain oxygen."],
      ["Bulliform cells in grass leaves help in", ["secondary growth", "leaf rolling during water stress", "nitrogen fixation", "pollen formation"], "B", "Leaf anatomy", "Medium", "Bulliform cells lose turgor during water stress and help leaves roll inward."],
    ],
  },
  {
    chapter: "Structural Organisation in Animals",
    questions: [
      ["The epithelial tissue specialised for absorption in the intestine is mainly", ["squamous epithelium", "ciliated epithelium", "columnar epithelium with microvilli", "stratified epithelium"], "C", "Animal tissues", "Easy", "Columnar epithelium with microvilli increases surface area for absorption."],
      ["Tendon connects", ["bone to bone", "muscle to bone", "muscle to muscle", "cartilage to cartilage"], "B", "Connective tissue", "Easy", "Tendons are dense connective tissues connecting muscles to bones."],
      ["In cockroach, respiration occurs through", ["book lungs", "gills", "tracheal system", "skin only"], "C", "Cockroach anatomy", "Easy", "Cockroach breathes through spiracles and tracheae."],
      ["The structural and functional unit of compact bone is", ["nephron", "osteon", "sarcomere", "axon"], "B", "Bone tissue", "Medium", "Compact bone is organised into Haversian systems or osteons."],
      ["Smooth muscle differs from skeletal muscle because smooth muscle is", ["striated and voluntary", "non-striated and involuntary", "multinucleate and voluntary", "found only in bones"], "B", "Muscle tissue", "Easy", "Smooth muscle is non-striated, involuntary, and found in visceral organs."],
    ],
  },
  {
    chapter: "Cell: Structure, Function & Cell Division",
    questions: [
      ["The organelle primarily responsible for packaging and modifying proteins is the", ["lysosome", "Golgi apparatus", "ribosome", "centriole"], "B", "Cell organelles", "Easy", "Golgi apparatus modifies, sorts, and packages cellular products."],
      ["During metaphase of mitosis, chromosomes are arranged at the", ["poles", "equatorial plate", "nucleolus", "cell wall"], "B", "Mitosis", "Easy", "Metaphase is marked by alignment of chromosomes at the equatorial plate."],
      ["A cell placed in a hypotonic solution usually", ["loses water and shrinks", "gains water and swells", "shows no water movement", "loses all solutes"], "B", "Membrane transport", "Easy", "Water enters the cell in a hypotonic solution by osmosis."],
      ["Crossing over occurs during", ["leptotene", "zygotene", "pachytene", "telophase I"], "C", "Meiosis", "Medium", "Crossing over occurs between non-sister chromatids during pachytene."],
      ["The 9+2 arrangement of microtubules is found in", ["centrioles", "cilia and flagella", "nucleosomes", "ribosomes"], "B", "Cytoskeleton", "Medium", "Eukaryotic cilia and flagella have a 9+2 axonemal arrangement."],
    ],
  },
  {
    chapter: "Biomolecules",
    questions: [
      ["The bond joining two amino acids in a protein is a", ["glycosidic bond", "peptide bond", "phosphodiester bond", "hydrogen bond only"], "B", "Proteins", "Easy", "A peptide bond forms between the carboxyl group of one amino acid and amino group of another."],
      ["Enzymes increase reaction rate mainly by", ["increasing activation energy", "lowering activation energy", "changing equilibrium constant permanently", "being consumed completely"], "B", "Enzymes", "Easy", "Enzymes provide an alternate pathway with lower activation energy."],
      ["The sugar present in RNA is", ["deoxyribose", "ribose", "glucose", "fructose"], "B", "Nucleic acids", "Easy", "RNA contains ribose sugar."],
      ["A competitive inhibitor affects an enzyme by", ["destroying the active site permanently", "binding at the active site against the substrate", "binding only to DNA", "increasing product concentration"], "B", "Enzyme inhibition", "Medium", "Competitive inhibitors resemble the substrate and compete for the active site."],
      ["Starch and glycogen are polymers of", ["amino acids", "fatty acids", "glucose", "nucleotides"], "C", "Carbohydrates", "Easy", "Both starch and glycogen are polysaccharides made of glucose units."],
    ],
  },
  {
    chapter: "Plant Physiology (Photosynthesis & Respiration)",
    questions: [
      ["The primary CO2 acceptor in C3 plants is", ["PEP", "RuBP", "OAA", "PGA"], "B", "Photosynthesis", "Easy", "RuBP accepts CO2 in the Calvin cycle of C3 plants."],
      ["Photolysis of water occurs in association with", ["photosystem I", "photosystem II", "cytochrome c", "mitochondrial matrix"], "B", "Light reaction", "Easy", "Water splitting occurs at the oxygen-evolving complex of PSII."],
      ["The final electron acceptor in aerobic respiration is", ["NAD+", "oxygen", "pyruvate", "carbon dioxide"], "B", "Respiration", "Easy", "Oxygen accepts electrons and protons to form water."],
      ["Krebs cycle occurs in the", ["cytosol", "mitochondrial matrix", "chloroplast stroma", "thylakoid lumen"], "B", "Krebs cycle", "Easy", "In eukaryotes, Krebs cycle takes place in the mitochondrial matrix."],
      ["In C4 plants, the first stable product of carbon fixation is", ["3-PGA", "oxaloacetic acid", "RuBP", "glucose"], "B", "C4 pathway", "Medium", "PEP carboxylase fixes CO2 into oxaloacetic acid in C4 plants."],
    ],
  },
  {
    chapter: "Plant Growth & Development",
    questions: [
      ["The plant hormone mainly responsible for apical dominance is", ["auxin", "ethylene", "abscisic acid", "cytokinin"], "A", "Plant hormones", "Easy", "Auxin produced at the shoot apex suppresses lateral bud growth."],
      ["Bolting in rosette plants can be induced by", ["gibberellins", "ABA", "ethylene", "jasmonic acid"], "A", "Gibberellins", "Easy", "Gibberellins promote internode elongation and bolting."],
      ["Seed dormancy is often promoted by", ["IAA", "ABA", "cytokinin", "gibberellin"], "B", "Seed dormancy", "Easy", "Abscisic acid promotes dormancy and stress responses."],
      ["Photoperiodism refers to plant response to", ["soil pH", "relative length of day and night", "gravity", "mineral toxicity"], "B", "Photoperiodism", "Easy", "Photoperiodism is response to day/night duration."],
      ["Senescence of leaves is promoted by", ["ethylene", "gibberellin only", "cytokinin only", "auxin only"], "A", "Senescence", "Medium", "Ethylene promotes senescence and abscission in many plant parts."],
    ],
  },
  {
    chapter: "Human Physiology (Digestion, Respiration, Circulation)",
    questions: [
      ["Pepsinogen is converted into pepsin in the presence of", ["bile", "HCl", "salivary amylase", "trypsin"], "B", "Digestion", "Easy", "Hydrochloric acid activates pepsinogen into pepsin in the stomach."],
      ["Most oxygen in human blood is transported as", ["dissolved oxygen in plasma", "oxyhaemoglobin", "bicarbonate ion", "carbaminohaemoglobin"], "B", "Respiration", "Easy", "Oxygen is mainly transported bound to haemoglobin."],
      ["The pacemaker of the human heart is the", ["AV node", "SA node", "bundle of His", "Purkinje fibres"], "B", "Circulation", "Easy", "The sinoatrial node initiates cardiac impulse."],
      ["Bile helps digestion mainly by", ["digesting proteins", "emulsifying fats", "breaking nucleic acids", "converting glucose to glycogen"], "B", "Digestion", "Easy", "Bile salts emulsify fats and help lipase action."],
      ["The chloride shift is associated with transport of", ["oxygen", "carbon dioxide", "urea", "glucose"], "B", "Respiratory gases", "Medium", "Chloride shift helps maintain ionic balance during bicarbonate transport of CO2."],
    ],
  },
  {
    chapter: "Excretion, Locomotion & Neural Control",
    questions: [
      ["The functional unit of kidney is the", ["neuron", "nephron", "alveolus", "sarcomere"], "B", "Excretion", "Easy", "Nephron is the structural and functional unit of kidney."],
      ["Filtration of blood in nephron occurs mainly at the", ["collecting duct", "glomerulus", "loop of Henle", "distal tubule"], "B", "Ultrafiltration", "Easy", "Glomerulus performs ultrafiltration into Bowman's capsule."],
      ["The contractile unit of skeletal muscle is the", ["axon", "sarcomere", "nephron", "osteon"], "B", "Muscle contraction", "Easy", "Sarcomere is the functional unit of striated muscle."],
      ["Impulse transmission across a chemical synapse occurs through", ["direct cytoplasmic continuity", "neurotransmitters", "red blood cells", "collagen fibres"], "B", "Neural control", "Easy", "Neurotransmitters carry signals across synaptic clefts."],
      ["The myelin sheath mainly helps in", ["slowing impulse conduction", "saltatory conduction", "digestion of neurotransmitters", "blood filtration"], "B", "Neuron", "Medium", "Myelin enables faster saltatory conduction between nodes of Ranvier."],
    ],
  },
  {
    chapter: "Chemical Coordination & Integration",
    questions: [
      ["Insulin is secreted by", ["alpha cells of pancreas", "beta cells of pancreas", "adrenal cortex", "thyroid follicles"], "B", "Pancreas", "Easy", "Beta cells of islets of Langerhans secrete insulin."],
      ["Deficiency of iodine commonly reduces synthesis of", ["thyroxine", "insulin", "adrenaline", "glucagon"], "A", "Thyroid gland", "Easy", "Iodine is required for thyroid hormone synthesis."],
      ["ADH mainly acts on the kidney to", ["increase water reabsorption", "decrease glucose absorption", "increase bile secretion", "stop filtration completely"], "A", "Posterior pituitary", "Easy", "ADH increases water reabsorption from kidney tubules."],
      ["The hormone that prepares the body for emergency response is", ["melatonin", "adrenaline", "calcitonin", "progesterone"], "B", "Adrenal medulla", "Easy", "Adrenaline mediates fight-or-flight responses."],
      ["Parathormone increases blood calcium level mainly by acting on", ["bone and kidney", "lungs only", "stomach only", "sweat glands"], "A", "Parathyroid", "Medium", "PTH increases blood calcium through bone resorption and renal calcium reabsorption."],
    ],
  },
  {
    chapter: "Sexual Reproduction in Flowering Plants",
    questions: [
      ["The male gametophyte of angiosperms is represented by", ["embryo sac", "pollen grain", "zygote", "ovule wall"], "B", "Pollen", "Easy", "Pollen grain represents the male gametophyte."],
      ["A typical mature embryo sac is", ["4-celled and 4-nucleate", "7-celled and 8-nucleate", "8-celled and 7-nucleate", "2-celled and 4-nucleate"], "B", "Embryo sac", "Medium", "The Polygonum type embryo sac is 7-celled and 8-nucleate."],
      ["Triple fusion produces the", ["zygote", "primary endosperm nucleus", "antipodal cell", "pollen tube"], "B", "Double fertilisation", "Easy", "Fusion of one male gamete with two polar nuclei forms the primary endosperm nucleus."],
      ["Pollination by wind generally requires pollen grains that are", ["sticky and heavy", "light and non-sticky", "produced in very low number", "inside closed flowers only"], "B", "Pollination", "Easy", "Anemophilous flowers produce light, non-sticky pollen in large amounts."],
      ["Apomixis is the formation of seed", ["without fertilisation", "only after double fertilisation", "only in animals", "without embryo"], "A", "Apomixis", "Medium", "Apomixis produces seeds without fertilisation."],
    ],
  },
  {
    chapter: "Human Reproduction & Reproductive Health",
    questions: [
      ["Spermatogenesis occurs in the", ["epididymis", "seminiferous tubules", "prostate gland", "vas deferens"], "B", "Male reproductive system", "Easy", "Spermatogenesis occurs in seminiferous tubules of testes."],
      ["Ovulation in humans is triggered mainly by a surge of", ["FSH", "LH", "progesterone", "prolactin"], "B", "Menstrual cycle", "Easy", "LH surge triggers ovulation."],
      ["The site of fertilisation in human females is usually the", ["uterus", "ampullary-isthmic junction of oviduct", "cervix", "vagina"], "B", "Fertilisation", "Easy", "Fertilisation normally occurs near the ampullary-isthmic junction."],
      ["hCG is secreted by", ["corpus luteum only", "trophoblast cells of embryo", "Graafian follicle before ovulation", "spermatids"], "B", "Pregnancy", "Medium", "Trophoblast secretes hCG after implantation."],
      ["A copper-T prevents pregnancy mainly by", ["blocking ovulation permanently", "reducing sperm motility and fertilising capacity", "destroying the uterus", "preventing menstruation"], "B", "Contraception", "Medium", "Copper ions suppress sperm motility and fertilising capacity."],
    ],
  },
  {
    chapter: "Principles of Inheritance & Variation (Genetics)",
    questions: [
      ["A cross between two heterozygous tall pea plants gives a phenotypic ratio of", ["1:1", "3:1", "1:2:1", "9:3:3:1"], "B", "Mendelian inheritance", "Easy", "Tt x Tt gives 3 tall : 1 dwarf phenotype."],
      ["The law of segregation is explained by separation of", ["alleles during gamete formation", "species during evolution", "organs during growth", "codons during translation"], "A", "Mendel's laws", "Easy", "Alleles separate from each other during gametogenesis."],
      ["A test cross is performed between an individual of unknown genotype and a", ["homozygous dominant individual", "heterozygous individual", "homozygous recessive individual", "polyploid individual"], "C", "Test cross", "Easy", "A test cross uses a homozygous recessive parent."],
      ["Haemophilia is an example of", ["autosomal dominant inheritance", "X-linked recessive inheritance", "Y-linked inheritance", "cytoplasmic inheritance"], "B", "Pedigree", "Medium", "Haemophilia is generally X-linked recessive."],
      ["In incomplete dominance, the F2 phenotypic ratio is usually", ["3:1", "9:3:3:1", "1:2:1", "2:1"], "C", "Incomplete dominance", "Medium", "Incomplete dominance gives a 1:2:1 phenotypic as well as genotypic ratio."],
    ],
  },
  {
    chapter: "Molecular Basis of Inheritance",
    questions: [
      ["The enzyme that joins Okazaki fragments is", ["DNA ligase", "DNA helicase", "RNA polymerase", "topoisomerase"], "A", "DNA replication", "Easy", "DNA ligase seals nicks between Okazaki fragments."],
      ["A codon consists of", ["one nucleotide", "two nucleotides", "three nucleotides", "four nucleotides"], "C", "Genetic code", "Easy", "Each codon is a triplet of nucleotides."],
      ["Transcription in eukaryotes occurs mainly in the", ["ribosome", "nucleus", "lysosome", "Golgi apparatus"], "B", "Transcription", "Easy", "Eukaryotic transcription occurs in the nucleus."],
      ["The lac operon is induced when", ["glucose alone is abundant and lactose absent", "lactose is present", "repressor binds permanently to promoter", "RNA polymerase is absent"], "B", "Gene regulation", "Medium", "Lactose or allolactose acts as inducer of the lac operon."],
      ["In DNA, adenine pairs with thymine through", ["one hydrogen bond", "two hydrogen bonds", "three hydrogen bonds", "a peptide bond"], "B", "DNA structure", "Easy", "Adenine pairs with thymine by two hydrogen bonds."],
    ],
  },
  {
    chapter: "Evolution",
    questions: [
      ["Homologous organs indicate", ["convergent evolution", "divergent evolution", "temporary adaptation only", "absence of ancestry"], "B", "Evidence of evolution", "Easy", "Homologous organs share common ancestry and show divergent evolution."],
      ["Industrial melanism in peppered moth is an example of", ["artificial selection", "natural selection", "genetic drift only", "founder effect only"], "B", "Natural selection", "Easy", "Predation pressure favoured darker moths in polluted areas."],
      ["Hardy-Weinberg equilibrium is affected by", ["random mating only", "mutation, migration, selection, drift or non-random mating", "constant allele frequencies only", "absence of variation"], "B", "Population genetics", "Medium", "These evolutionary forces disturb Hardy-Weinberg equilibrium."],
      ["Analogous organs show", ["common ancestry with different function", "different origin with similar function", "same embryonic origin always", "no adaptive value"], "B", "Convergent evolution", "Easy", "Analogous organs have different origin but similar function."],
      ["The first cellular forms of life likely evolved in", ["present atmosphere", "primitive oceans", "dry deserts", "polar ice only"], "B", "Origin of life", "Medium", "Chemical evolution models propose early life arising in primitive oceans."],
    ],
  },
  {
    chapter: "Human Health, Diseases & Microbes",
    questions: [
      ["The causative agent of malaria is", ["Plasmodium", "Wuchereria", "Salmonella", "Rhizobium"], "A", "Human diseases", "Easy", "Malaria is caused by Plasmodium species."],
      ["Antibodies are produced by", ["RBCs", "plasma cells", "platelets", "neurons"], "B", "Immunity", "Easy", "Activated B lymphocytes differentiate into plasma cells that secrete antibodies."],
      ["The ELISA test is based on", ["antigen-antibody interaction", "only DNA replication", "lipid digestion", "muscle contraction"], "A", "Diagnostics", "Medium", "ELISA detects antigens or antibodies using specific immune interactions."],
      ["Biogas production mainly involves", ["methanogenic bacteria", "cyanobacteria only", "yeast only", "nitrogen-fixing algae only"], "A", "Microbes in human welfare", "Easy", "Methanogens produce methane-rich biogas under anaerobic conditions."],
      ["Vaccination primarily produces", ["passive temporary glucose", "memory immune response", "instant digestion", "permanent fever"], "B", "Immunity", "Easy", "Vaccination exposes the immune system to antigen and generates memory cells."],
    ],
  },
  {
    chapter: "Biotechnology: Principles & Applications",
    questions: [
      ["Restriction endonucleases cut DNA at", ["random protein sites", "specific recognition sequences", "only RNA primers", "only telomeres"], "B", "Recombinant DNA technology", "Easy", "Restriction enzymes recognise and cut specific DNA sequences."],
      ["PCR requires a heat-stable DNA polymerase such as", ["Taq polymerase", "RNA ligase", "pepsin", "amylase"], "A", "PCR", "Easy", "Taq polymerase remains active during high-temperature PCR cycles."],
      ["A selectable marker in a cloning vector helps in", ["destroying all transformants", "identifying transformed cells", "preventing DNA replication", "removing host ribosomes"], "B", "Vectors", "Medium", "Selectable markers allow selection of cells that received the vector."],
      ["Bt cotton is resistant to certain insects because it expresses a toxin from", ["Agrobacterium", "Bacillus thuringiensis", "Rhizopus", "Saccharomyces"], "B", "Biotech applications", "Easy", "Bt toxin genes are obtained from Bacillus thuringiensis."],
      ["RNA interference is used to silence genes at the level of", ["DNA replication only", "mRNA", "cell wall synthesis", "chromosome condensation only"], "B", "RNAi", "Medium", "RNAi causes degradation or translational inhibition of target mRNA."],
    ],
  },
  {
    chapter: "Ecology, Ecosystem & Biodiversity Conservation",
    questions: [
      ["The number of individuals of a species per unit area is called", ["natality", "density", "mortality", "dispersion"], "B", "Population ecology", "Easy", "Population density measures individuals per unit area or volume."],
      ["In an ecosystem, energy flow is", ["cyclic", "unidirectional", "absent", "always from carnivores to producers"], "B", "Ecosystem", "Easy", "Energy enters through producers and flows unidirectionally through trophic levels."],
      ["The pyramid of energy is always", ["inverted", "upright", "spindle-shaped", "absent in aquatic systems"], "B", "Ecological pyramids", "Easy", "Energy decreases at successive trophic levels, so the energy pyramid is upright."],
      ["A biodiversity hotspot is characterised by high endemism and", ["very low threat", "high degree of threat", "absence of species", "only cultivated plants"], "B", "Biodiversity", "Medium", "Hotspots have high endemism and significant habitat loss or threat."],
      ["Ex situ conservation includes", ["national parks only", "botanical gardens and seed banks", "wildlife sanctuaries only", "sacred groves only"], "B", "Conservation", "Easy", "Ex situ conservation protects species outside natural habitats, such as in seed banks."],
    ],
  },
];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toRow(chapter, item, questionOrder) {
  const [questionText, options, correctOption, topic, difficulty, explanation] = item;
  if (!questionText || options.length !== 4 || !["A", "B", "C", "D"].includes(correctOption)) {
    throw new Error(`Invalid seed question in ${chapter}: ${questionText}`);
  }

  return {
    exam: "NEET",
    subject: "Biology",
    chapter,
    topic,
    difficulty,
    question_type: "MCQ",
    question_text: questionText,
    question_image: null,
    option_a: options[0],
    option_b: options[1],
    option_c: options[2],
    option_d: options[3],
    option_a_image: null,
    option_b_image: null,
    option_c_image: null,
    option_d_image: null,
    correct_option: correctOption,
    explanation,
    explanation_image: null,
    marks: 4,
    negative_marks: 1,
    is_active: true,
    question_order: questionOrder,
    source_type: SOURCE_TYPE,
    status: STATUS,
  };
}

async function assertPracticeColumns(supabase) {
  const { error } = await supabase
    .from("questions")
    .select("id,source_type,status")
    .limit(1);

  if (error?.code === "42703") {
    throw new Error("Missing questions.source_type/status. Apply db/migrations/20260812_add_question_practice_metadata.sql first.");
  }
  if (error) throw error;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

await assertPracticeColumns(supabase);

let inserted = 0;
let skipped = 0;
for (const chapterBlock of chapters) {
  const rows = chapterBlock.questions.map((item, index) => toRow(chapterBlock.chapter, item, index + 1));
  const { data: existing, error: existingError } = await supabase
    .from("questions")
    .select("question_text")
    .eq("exam", "NEET")
    .eq("subject", "Biology")
    .eq("chapter", chapterBlock.chapter)
    .eq("source_type", SOURCE_TYPE);

  if (existingError) throw existingError;

  const existingTexts = new Set((existing || []).map((row) => normalizeText(row.question_text)));
  const newRows = rows.filter((row) => !existingTexts.has(normalizeText(row.question_text)));
  skipped += rows.length - newRows.length;

  if (newRows.length) {
    const { data, error } = await supabase.from("questions").insert(newRows).select("id");
    if (error) throw error;
    inserted += data.length;
  }
}

console.log(JSON.stringify({
  source_type: SOURCE_TYPE,
  status: STATUS,
  chapters: chapters.length,
  attempted: chapters.reduce((total, block) => total + block.questions.length, 0),
  inserted,
  skipped,
}, null, 2));
