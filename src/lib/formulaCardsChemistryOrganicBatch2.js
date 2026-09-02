export const CHEMISTRY_ORGANIC_BATCH_2_CHAPTER_DEFINITIONS = [
  { title: "Alkane", slug: "alkane", sort_order: 22 },
  { title: "Alkene & Alkyne", slug: "alkene-alkyne", sort_order: 23 },
  { title: "Alkyl Halides", slug: "alkyl-halide", sort_order: 24 },
];

const chapter = (track, slug) => `${track}-chemistry-${slug}`;

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

function alkaneCards(chapterId) {
  return [
    card(chapterId, "wurtz-reaction", {
      title: "Wurtz Reaction",
      card_type: "reaction",
      body: "The Alkane section visibly gives Wurtz reaction with sodium in ether and notes that primary and secondary alkyl halides give this reaction.",
      formulas: [
        { label: "Same alkyl halide", latex: "R-X+2Na\\xrightarrow{\\text{ether}}R-R" },
        { label: "Mixed alkyl halides", latex: "R-X+R'-X+2Na\\xrightarrow{\\text{ether}}R-R'+R-R+R'-R'" },
      ],
      variables: [],
      conditions: ["Reagent: Na, ether.", "The source explicitly mentions $1^\\circ$ and $2^\\circ$ alkyl halides."],
      diagram_data: { type: "chem-organic-wurtz" },
      importance: 5,
      source_page: 127,
      sort_order: 1,
    }),
    card(chapterId, "wurtz-cycloalkane-example", {
      title: "Wurtz Cycloalkane Example",
      card_type: "reaction",
      body: "The handbook shows a dibromocyclobutane example closing to the corresponding cyclobutane framework.",
      formulas: [{ latex: "\\text{dibromocyclobutane structure}+2Na\\xrightarrow{\\text{ether}}\\text{ring-closure product shown in source}" }],
      variables: [],
      conditions: ["The detailed ring drawing remains available in the original handbook because it is shown as a structure rather than a typed formula."],
      importance: 3,
      source_page: 127,
      sort_order: 2,
    }),
  ];
}

function alkeneAlkyneCards(chapterId) {
  return [
    card(chapterId, "electrophilic-addition-mechanism", {
      title: "Electrophilic Addition Mechanism",
      card_type: "mechanism",
      body: "The source states that the characteristic reaction of alkene and alkyne is electrophilic addition.",
      formulas: [
        { label: "Step 1", latex: "C=C+E^+\\longrightarrow\\text{carbocation}" },
        { label: "Step 2", latex: "\\text{carbocation}+Nu: \\longrightarrow \\text{addition product}" },
      ],
      variables: [],
      conditions: ["In the source mechanism, the positive charge is on the more substituted carbon."],
      diagram_data: { type: "chem-organic-electrophilic-addition" },
      importance: 5,
      source_page: 127,
      sort_order: 1,
    }),
    card(chapterId, "alkene-hydration", {
      title: "Addition of Water",
      card_type: "reaction",
      body: "The source gives addition of water to an alkene under acidic conditions.",
      formulas: [{ latex: "C=C+H_2O\\xrightarrow{H^+}-C(H)-C(OH)-" }],
      variables: [],
      conditions: ["The displayed product follows Markovnikov orientation."],
      importance: 5,
      source_page: 128,
      sort_order: 2,
    }),
    card(chapterId, "alkyne-hx-addition", {
      title: "Addition of Hydrogen Halides to Alkyne",
      card_type: "reaction",
      body: "The source gives hydrogen halide addition to an alkyne in two stages.",
      formulas: [
        { label: "First addition", latex: "R-C{\\equiv}C-R'\\xrightarrow{H-X}R-CH=CX-R'" },
        { label: "Second addition", latex: "R-CH=CX-R'\\xrightarrow{H-X}R-CH_2-CX_2-R'" },
      ],
      variables: [{ latex: "X", symbol: "$X$", meaning: "Cl, Br or I in the source note" }],
      conditions: ["The first addition is labelled Markovnikov addition in the source."],
      importance: 5,
      source_page: 128,
      sort_order: 3,
    }),
    card(chapterId, "anti-addition-note", {
      title: "Anti-Addition Note",
      card_type: "rule",
      body: "The source adds a stereochemistry note for selected electrophiles.",
      formulas: [],
      variables: [],
      conditions: ["When electrophiles are $Cl^+$, $Br^+$, $I^+$, $NO_2^+$ or $Hg^{2+}$, stereochemistry is important and the major product is formed by anti addition."],
      importance: 5,
      source_page: 128,
      sort_order: 4,
    }),
  ];
}

function alkylHalideCards(chapterId) {
  return [
    card(chapterId, "sn1-hydrolysis", {
      title: "SN1 Hydrolysis",
      card_type: "reaction",
      body: "The Alkyl Halide section begins with nucleophilic substitution reactions and gives this SN1 hydrolysis route.",
      formulas: [{ latex: "R-X+H_2O\\xrightarrow{AgNO_3}R^+ + AgX\\downarrow \\longrightarrow ROH" }],
      variables: [],
      conditions: [
        "$R$ may rearrange.",
        "Alkyl halides are hydrolysed to alcohol very slowly by water, but rapidly by silver oxide suspended in boiling water.",
      ],
      importance: 5,
      source_page: 128,
      sort_order: 1,
    }),
    card(chapterId, "sn2-mechanism", {
      title: "SN2 Mechanism",
      card_type: "mechanism",
      body: "The source shows hydroxide attacking $R-X$ through a dotted transition representation to form alcohol and halide ion.",
      formulas: [{ latex: "HO^-+R-X\\longrightarrow HO\\cdots R\\cdots X\\longrightarrow HO-R+X^-" }],
      variables: [],
      conditions: ["The page shows partial negative charge on the incoming $HO^-$ side and the leaving $X$ side in the transition representation."],
      diagram_data: { type: "chem-organic-sn2" },
      importance: 5,
      source_page: 128,
      sort_order: 2,
    }),
    card(chapterId, "substitution-comparison", {
      title: "SN1 vs SN2 in the Source",
      card_type: "comparison",
      body: "The source names both nucleophilic substitution paths and gives one compact route for each.",
      formulas: [],
      variables: [],
      conditions: [],
      table_data: {
        columns: ["Path", "Reactant + reagent", "Source-backed product/result", "Note"],
        rows: [
          ["$S_N1$", "$R-X+H_2O$, $AgNO_3$", "$R^+ + AgX\\downarrow \\rightarrow ROH$", "$R$ may rearrange"],
          ["$S_N2$", "$HO^-+R-X$", "$HO-R+X^-$", "Dotted transition representation shown"],
        ],
      },
      importance: 4,
      source_page: 128,
      sort_order: 3,
    }),
  ];
}

export function getChemistryOrganicBatch2Chapters(track) {
  return CHEMISTRY_ORGANIC_BATCH_2_CHAPTER_DEFINITIONS.map((item) => ({
    id: chapter(track, item.slug),
    subject_id: `${track}-chemistry`,
    ...item,
  }));
}

export function getChemistryOrganicBatch2Cards(track) {
  return [
    ...alkaneCards(chapter(track, "alkane")),
    ...alkeneAlkyneCards(chapter(track, "alkene-alkyne")),
    ...alkylHalideCards(chapter(track, "alkyl-halide")),
  ];
}
