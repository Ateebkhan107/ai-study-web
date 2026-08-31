insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-aldehyde-ketones', 'jee-chemistry', 'Aldehyde & Ketones', 'aldehyde-ketones', 29),
  ('jee-chemistry-carboxylic-acid-derivatives', 'jee-chemistry', 'Carboxylic Acid & Derivatives', 'carboxylic-acid-derivatives', 30),
  ('neet-chemistry-aldehyde-ketones', 'neet-chemistry', 'Aldehyde & Ketones', 'aldehyde-ketones', 29),
  ('neet-chemistry-carboxylic-acid-derivatives', 'neet-chemistry', 'Carboxylic Acid & Derivatives', 'carboxylic-acid-derivatives', 30)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-aldehyde-ketones-aldol-condensation",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-aldol"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Aldol Condensation",
    "card_type": "reaction",
    "body": "The source states that carbonyl compounds having acidic $sp^3$ alpha-H show aldol condensation in dilute NaOH or dilute acid.",
    "formulas": [
      {
        "latex": "2CH_3CHO\\xrightarrow{\\text{dil. }NaOH}CH_3CH(OH)CH_2CHO\\xrightarrow[-H_2O]{H^+,\\Delta}CH_3CH=CHCHO"
      }
    ],
    "variables": [],
    "conditions": [
      "Requirement: acidic $sp^3$ alpha-H on the carbonyl compound."
    ],
    "importance": 5,
    "source_page": 136,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-crossed-aldol",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crossed Aldol Condensation",
    "card_type": "reaction",
    "body": "The visible source gives two crossed aldol examples using formaldehyde.",
    "formulas": [
      {
        "latex": "CH_3CHO+HCHO\\xrightarrow{\\text{dil. }NaOH}HOCH_2CH_2CHO\\xrightarrow[\\Delta]{H^+/H_2O}CH_2=CHCHO"
      },
      {
        "latex": "CH_3COCH_3+HCHO\\xrightarrow{\\text{dil. }NaOH}CH_3COCH_2CH_2OH\\xrightarrow[\\Delta]{H^+/H_2O}CH_3COCH=CH_2"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 136,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-cannizzaro-reaction",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-cannizzaro"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cannizzaro Reaction",
    "card_type": "reaction",
    "body": "The source says carbonyl compounds not having $sp^3$ alpha-H show this disproportionation reaction.",
    "formulas": [
      {
        "latex": "2HCHO+NaOH\\ (50\\%)\\longrightarrow CH_3OH+HCOONa"
      },
      {
        "latex": "2C_6H_5CHO+NaOH\\ (50\\%)\\longrightarrow C_6H_5CH_2OH+C_6H_5COONa"
      }
    ],
    "variables": [],
    "conditions": [
      "Requirement: carbonyl compound not having $sp^3$ alpha-H."
    ],
    "importance": 5,
    "source_page": 136,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-crossed-cannizzaro",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crossed Cannizzaro Reaction",
    "card_type": "reaction",
    "body": "The source gives a crossed Cannizzaro example with anisaldehyde-type aromatic aldehyde and formaldehyde.",
    "formulas": [
      {
        "latex": "CH_3OC_6H_4CHO+HCHO+NaOH\\ (50\\%)\\longrightarrow CH_3OC_6H_4CH_2OH+HCOONa"
      }
    ],
    "variables": [],
    "conditions": [
      "The aromatic aldehyde structure is retained in compact formula form; the drawn ring remains in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 136,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-hydrazones-azines",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Hydrazones and Azines",
    "card_type": "reaction",
    "body": "The source shows carbonyl compounds reacting with hydrazine to form hydrazones and then azines.",
    "formulas": [
      {
        "latex": ">C=O+NH_2NH_2\\longrightarrow >C=NNH_2+H_2O"
      },
      {
        "latex": ">C=NNH_2+O=C<\\longrightarrow >C=N-N=C<"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 136,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-perkin-reaction",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Perkin Reaction",
    "card_type": "reaction",
    "body": "The source states that benzaldehyde or another aromatic aldehyde heated with an acid anhydride in presence of its sodium salt gives a beta-arylacrylic acid.",
    "formulas": [
      {
        "latex": "C_6H_5CHO+(CH_3CO)_2O\\xrightarrow{CH_3CO_2Na}C_6H_5CH=CHCO_2H"
      }
    ],
    "variables": [],
    "conditions": [
      "With acetic anhydride and sodium acetate, cinnamic acid is formed."
    ],
    "importance": 5,
    "source_page": 137,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-haloform-reaction",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-haloform"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Haloform Reaction",
    "card_type": "reaction",
    "body": "The source says acetaldehyde and methyl alkyl ketones react rapidly with halogen in alkali to give haloform and acid salt.",
    "formulas": [
      {
        "latex": "R-C(=O)-CH_3\\xrightarrow{Br_2/NaOH}R-C(=O)-ONa+CHBr_3"
      }
    ],
    "variables": [],
    "conditions": [
      "Halogens listed: $Cl_2$, $Br_2$ or $I_2$.",
      "The $-CH_3$ of the $CH_3-C(=O)-$ group is converted into haloform."
    ],
    "importance": 5,
    "source_page": 137,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-haloform-two-steps",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Haloform Two-Step Route",
    "card_type": "mechanism",
    "body": "The source breaks haloform preparation from methyl ketone into halogenation followed by alkaline hydrolysis.",
    "formulas": [
      {
        "label": "Halogenation",
        "latex": "R-C(=O)-CH_3\\xrightarrow{Br_2}R-C(=O)-CBr_3"
      },
      {
        "label": "Alkaline hydrolysis",
        "latex": "R-C(=O)-CBr_3\\xrightarrow{NaOH}CHBr_3+R-C(=O)-ONa"
      }
    ],
    "variables": [],
    "conditions": [
      "The reaction is used to distinguish the presence of the $CH_3-C(=O)-$ group."
    ],
    "importance": 5,
    "source_page": 138,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-formaldehyde-reaction-map",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$CH_2=O$",
          "$NH_3$",
          "hexamethylene tetramine / urotropine"
        ],
        [
          "$CH_2=O$",
          "evaporated to dryness",
          "paraformaldehyde"
        ],
        [
          "$CH_2=O$",
          "kept at room temperature for a long time",
          "trioxane / metaformaldehyde"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Formaldehyde Reaction Map",
    "card_type": "comparison",
    "body": "The source gives three formaldehyde reactions in its other-reactions map.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 138,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-acetaldehyde-reaction-map",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$CH_3CHO$",
          "$NH_3$",
          "acetaldehyde ammonia"
        ],
        [
          "$CH_3CHO$",
          "conc. $H_2SO_4$ few drops",
          "cyclic trimer / paraldehyde"
        ],
        [
          "$CH_3CHO$",
          "dry HCl",
          "cyclic tetramer / metaldehyde"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acetaldehyde Reaction Map",
    "card_type": "comparison",
    "body": "The source maps acetaldehyde to ammonia and polymerisation-type products.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 138,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-acetone-reaction-map",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "acetone",
          "$NH_3$",
          "diacetone amine"
        ],
        [
          "acetone",
          "$H_2SO_4/\\Delta$",
          "mesitylene"
        ],
        [
          "acetone",
          "dry HCl",
          "phorone + mesityloxide"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acetone Reaction Map",
    "card_type": "comparison",
    "body": "The source maps acetone to products under ammonia, sulphuric acid/heat and dry HCl conditions.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The detailed drawn products for phorone and mesityloxide remain in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 138,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-aldehyde-ketones-benzaldehyde-acetophenone-benzophenone-map",
    "chapter_id": "jee-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Starting carbonyl",
        "Readable source-backed conversions"
      ],
      "rows": [
        [
          "benzaldehyde",
          "Schiff's base/anil with $C_6H_5NH_2$; benzoyl chloride with $H_2/Pd-BaSO_4$ in boiling xylene; benzaldehyde from Friedel-Crafts/Gattermann-type arrows shown."
        ],
        [
          "acetophenone",
          "from benzene with $CH_3COCl/AlCl_3$; chlorination without catalyst gives phenacyl chloride; $Zn-Hg/HCl$ gives ethylbenzene."
        ],
        [
          "benzophenone",
          "from benzene with $C_6H_5COCl/AlCl_3$ or with $COCl_2/AlCl_3$ under excess benzene."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Aromatic Carbonyl Reaction Maps",
    "card_type": "comparison",
    "body": "The source gives dense reaction maps for benzaldehyde, acetophenone and benzophenone.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Only clearly readable reagent-product pairs are summarized here.",
      "Detailed ring structures and multi-step arrows remain available through the original handbook."
    ],
    "importance": 3,
    "source_page": 139,
    "sort_order": 12
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-acid-salt-and-acid-base-reactions",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "Na metal",
          "$R-CH_2-COONa+\\frac{1}{2}H_2$"
        ],
        [
          "NaOH",
          "$R-CH_2-COONa+H_2O$"
        ],
        [
          "$NaHCO_3$",
          "$R-CH_2-COONa+CO_2\\uparrow+H_2O$"
        ],
        [
          "$CH_3MgBr$",
          "$R-CH_2-COOMgBr+CH_4\\uparrow$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Carboxylic Acid: Salt and Acid-Base Reactions",
    "card_type": "comparison",
    "body": "The source starts the carboxylic acid map from $R-CH_2-COOH$.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-acid-derivative-formation",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$SOCl_2$",
          "$RCH_2COCl+SO_2\\uparrow$"
        ],
        [
          "$PCl_5$",
          "$R-CH_2-COCl$"
        ],
        [
          "$NH_3,\\Delta$",
          "$R-CH_2-C(=O)-NH_2$"
        ],
        [
          "$P_2O_5,\\Delta$",
          "$R-CH_2-C(=O)-O-C(=O)-CH_2-R$"
        ],
        [
          "$R'OH/H_2SO_4$",
          "$R-CH_2-C(=O)-OR'$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-organic-carboxy-derivatives"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Carboxylic Acid to Derivatives",
    "card_type": "comparison",
    "body": "The source map gives acid chloride, amide, anhydride and ester formation from carboxylic acid.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-decarboxylation-hunsdiecker-kolbe",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$NaOH(CaO),\\Delta$",
          "$R-CH_3+Na_2CO_3$"
        ],
        [
          "$AgOH,Br_2/\\Delta$",
          "$R-CH_2-Br+CO_2$"
        ],
        [
          "NaOH, electrolysis",
          "$R-CH_2-CH_2-R$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Decarboxylation, Hunsdiecker and Kolbe-Type Reactions",
    "card_type": "comparison",
    "body": "The carboxylic acid summary map includes decarboxylation, silver-salt bromination and electrolysis.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-hvz-arndt-eistert-ketone",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "(i) $P+X_2$, (ii) $H_2O$",
          "$R-CH(X)-COOH$"
        ],
        [
          "(i) $SOCl_2$, (ii) $CH_2N_2$, (iii) $Ag_2O$, (iv) $H_2O$",
          "$R-CH_2-CH_2-COOH$"
        ],
        [
          "$Ca(OH)_2/\\Delta$, dry distillation",
          "$R-CH_2-C(=O)-CH_2-R+CaCO_3$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "HVZ, Chain Extension and Ketone Formation",
    "card_type": "comparison",
    "body": "The source map includes alpha-halogenation, homologation and ketone formation routes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-acid-chloride-hydrolysis-ammonolysis",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$H_2O$",
          "$RCOOH+HCl$"
        ],
        [
          "$R'OH$",
          "$RCOOR'+HCl$"
        ],
        [
          "$2NH_3$",
          "$RCONH_2+NH_4Cl$"
        ],
        [
          "$2R'NH_2$",
          "$RCONHR'+R'NH_3^+Cl^-$"
        ],
        [
          "$RCOOH$/pyridine",
          "$(RCO)_2O+HCl$"
        ],
        [
          "$RCOONa$",
          "$(RCO)_2O+NaCl$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acid Chloride: Hydrolysis, Alcoholysis and Ammonolysis",
    "card_type": "comparison",
    "body": "The acid chloride reaction map gives several substitution reactions at the acyl chloride.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-acid-chloride-carbonyl-conversions",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$C_6H_6$/anhyd. $AlCl_3$",
          "$C_6H_5COR+HCl$ (Friedel-Crafts reaction)"
        ],
        [
          "$H_2/Pd-BaSO_4+S$ or quinoline",
          "$RCHO+HCl$ (Rosenmund's reduction)"
        ],
        [
          "$R'_2Cd$/ether",
          "$2RCOR'+CdCl_2$"
        ],
        [
          "$LiAlH_4$/ether",
          "$RCH_2OH$"
        ],
        [
          "KCN, then $H^+/H_2O$",
          "$R-CO-COOH+NH_3$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acid Chloride: Carbonyl Conversions",
    "card_type": "comparison",
    "body": "The acid chloride map includes Friedel-Crafts, Rosenmund, organocadmium, LiAlH4 and KCN reactions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-amide-acid-base-hydrolysis",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$H^+/H_2O$",
          "$RCOOH+NH_4^+$"
        ],
        [
          "NaOH",
          "$RCOONa+NH_3$"
        ],
        [
          "conc. HCl",
          "$RCONH_2\\cdot HCl$"
        ],
        [
          "2Na",
          "$RCONHNa+\\frac{1}{2}H_2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Amide: Hydrolysis and Salt Reactions",
    "card_type": "comparison",
    "body": "The source gives acid and base hydrolysis plus salt formation reactions for amides.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 141,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-amide-dehydration-and-hofmann",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$P_2O_5$",
          "$3RC{\\equiv}N+2H_3PO_4$"
        ],
        [
          "$SOCl_2$",
          "$RC{\\equiv}N+SO_2+HCl$"
        ],
        [
          "HONO",
          "$RCOOH+N_2+H_2O$"
        ],
        [
          "$Br_2+4KOH$",
          "$RNH_2+CO_2+2KBr+H_2O$ (Hoffmann bromide reaction)"
        ],
        [
          "$LiAlH_4$/dry ether",
          "$RCH_2NH_2$ / $1^\\circ$ amine"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Amide: Dehydration, Nitrous Acid and Hofmann Bromide",
    "card_type": "comparison",
    "body": "The source map gives conversion of acid amide to nitrile, acid and amine products.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-ester-hydrolysis-ammonolysis",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$H^+/H_2O$",
          "$RCOOH+R'OH$ (hydrolysis)"
        ],
        [
          "$NaOH/H_2O$",
          "$RCOONa+R'OH$ (saponification)"
        ],
        [
          "$NH_3$",
          "$RCONH_2+R'OH$ (ammonolysis)"
        ],
        [
          "$R''NH_2$",
          "$RCONHR''+R'OH$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester: Hydrolysis, Saponification and Ammonolysis",
    "card_type": "comparison",
    "body": "The ester reaction map gives acid/base hydrolysis and nitrogen nucleophile reactions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-ester-alcoholysis-reductions",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$R''OH/H^+$ or $R''ONa$",
          "$RCOOR''+R'OH$ (trans-esterification)"
        ],
        [
          "$H_2$/copper chromite or $LiAlH_4$",
          "$RCH_2OH+R'OH$"
        ],
        [
          "Na/alcohol",
          "$RCH_2OH+R'OH$ (Bouveault-Blanc reduction)"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester: Transesterification and Reductions",
    "card_type": "comparison",
    "body": "The source map lists transesterification and ester reductions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-carboxylic-acid-derivatives-ester-grignard-reaction",
    "chapter_id": "jee-chemistry-carboxylic-acid-derivatives",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester + Grignard Reagent",
    "card_type": "reaction",
    "body": "The source ester map shows ester reaction with two equivalents of Grignard reagent followed by acidic hydrolysis.",
    "formulas": [
      {
        "latex": "R-C(=O)-OR'\\xrightarrow[(ii)\\ H^+/H_2O]{(i)\\ 2R''MgX}R-C(OH)(R'')(R'')"
      }
    ],
    "variables": [],
    "conditions": [
      "Product shown: $3^\\circ$ alcohol.",
      "In case of esters of formic acid, $2^\\circ$ alcohols are obtained."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-aldol-condensation",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-aldol"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Aldol Condensation",
    "card_type": "reaction",
    "body": "The source states that carbonyl compounds having acidic $sp^3$ alpha-H show aldol condensation in dilute NaOH or dilute acid.",
    "formulas": [
      {
        "latex": "2CH_3CHO\\xrightarrow{\\text{dil. }NaOH}CH_3CH(OH)CH_2CHO\\xrightarrow[-H_2O]{H^+,\\Delta}CH_3CH=CHCHO"
      }
    ],
    "variables": [],
    "conditions": [
      "Requirement: acidic $sp^3$ alpha-H on the carbonyl compound."
    ],
    "importance": 5,
    "source_page": 136,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-crossed-aldol",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crossed Aldol Condensation",
    "card_type": "reaction",
    "body": "The visible source gives two crossed aldol examples using formaldehyde.",
    "formulas": [
      {
        "latex": "CH_3CHO+HCHO\\xrightarrow{\\text{dil. }NaOH}HOCH_2CH_2CHO\\xrightarrow[\\Delta]{H^+/H_2O}CH_2=CHCHO"
      },
      {
        "latex": "CH_3COCH_3+HCHO\\xrightarrow{\\text{dil. }NaOH}CH_3COCH_2CH_2OH\\xrightarrow[\\Delta]{H^+/H_2O}CH_3COCH=CH_2"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 136,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-cannizzaro-reaction",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-cannizzaro"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cannizzaro Reaction",
    "card_type": "reaction",
    "body": "The source says carbonyl compounds not having $sp^3$ alpha-H show this disproportionation reaction.",
    "formulas": [
      {
        "latex": "2HCHO+NaOH\\ (50\\%)\\longrightarrow CH_3OH+HCOONa"
      },
      {
        "latex": "2C_6H_5CHO+NaOH\\ (50\\%)\\longrightarrow C_6H_5CH_2OH+C_6H_5COONa"
      }
    ],
    "variables": [],
    "conditions": [
      "Requirement: carbonyl compound not having $sp^3$ alpha-H."
    ],
    "importance": 5,
    "source_page": 136,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-crossed-cannizzaro",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crossed Cannizzaro Reaction",
    "card_type": "reaction",
    "body": "The source gives a crossed Cannizzaro example with anisaldehyde-type aromatic aldehyde and formaldehyde.",
    "formulas": [
      {
        "latex": "CH_3OC_6H_4CHO+HCHO+NaOH\\ (50\\%)\\longrightarrow CH_3OC_6H_4CH_2OH+HCOONa"
      }
    ],
    "variables": [],
    "conditions": [
      "The aromatic aldehyde structure is retained in compact formula form; the drawn ring remains in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 136,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-hydrazones-azines",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Hydrazones and Azines",
    "card_type": "reaction",
    "body": "The source shows carbonyl compounds reacting with hydrazine to form hydrazones and then azines.",
    "formulas": [
      {
        "latex": ">C=O+NH_2NH_2\\longrightarrow >C=NNH_2+H_2O"
      },
      {
        "latex": ">C=NNH_2+O=C<\\longrightarrow >C=N-N=C<"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 136,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-perkin-reaction",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Perkin Reaction",
    "card_type": "reaction",
    "body": "The source states that benzaldehyde or another aromatic aldehyde heated with an acid anhydride in presence of its sodium salt gives a beta-arylacrylic acid.",
    "formulas": [
      {
        "latex": "C_6H_5CHO+(CH_3CO)_2O\\xrightarrow{CH_3CO_2Na}C_6H_5CH=CHCO_2H"
      }
    ],
    "variables": [],
    "conditions": [
      "With acetic anhydride and sodium acetate, cinnamic acid is formed."
    ],
    "importance": 5,
    "source_page": 137,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-haloform-reaction",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-haloform"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Haloform Reaction",
    "card_type": "reaction",
    "body": "The source says acetaldehyde and methyl alkyl ketones react rapidly with halogen in alkali to give haloform and acid salt.",
    "formulas": [
      {
        "latex": "R-C(=O)-CH_3\\xrightarrow{Br_2/NaOH}R-C(=O)-ONa+CHBr_3"
      }
    ],
    "variables": [],
    "conditions": [
      "Halogens listed: $Cl_2$, $Br_2$ or $I_2$.",
      "The $-CH_3$ of the $CH_3-C(=O)-$ group is converted into haloform."
    ],
    "importance": 5,
    "source_page": 137,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-haloform-two-steps",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Haloform Two-Step Route",
    "card_type": "mechanism",
    "body": "The source breaks haloform preparation from methyl ketone into halogenation followed by alkaline hydrolysis.",
    "formulas": [
      {
        "label": "Halogenation",
        "latex": "R-C(=O)-CH_3\\xrightarrow{Br_2}R-C(=O)-CBr_3"
      },
      {
        "label": "Alkaline hydrolysis",
        "latex": "R-C(=O)-CBr_3\\xrightarrow{NaOH}CHBr_3+R-C(=O)-ONa"
      }
    ],
    "variables": [],
    "conditions": [
      "The reaction is used to distinguish the presence of the $CH_3-C(=O)-$ group."
    ],
    "importance": 5,
    "source_page": 138,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-formaldehyde-reaction-map",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$CH_2=O$",
          "$NH_3$",
          "hexamethylene tetramine / urotropine"
        ],
        [
          "$CH_2=O$",
          "evaporated to dryness",
          "paraformaldehyde"
        ],
        [
          "$CH_2=O$",
          "kept at room temperature for a long time",
          "trioxane / metaformaldehyde"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Formaldehyde Reaction Map",
    "card_type": "comparison",
    "body": "The source gives three formaldehyde reactions in its other-reactions map.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 138,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-acetaldehyde-reaction-map",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$CH_3CHO$",
          "$NH_3$",
          "acetaldehyde ammonia"
        ],
        [
          "$CH_3CHO$",
          "conc. $H_2SO_4$ few drops",
          "cyclic trimer / paraldehyde"
        ],
        [
          "$CH_3CHO$",
          "dry HCl",
          "cyclic tetramer / metaldehyde"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acetaldehyde Reaction Map",
    "card_type": "comparison",
    "body": "The source maps acetaldehyde to ammonia and polymerisation-type products.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 138,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-acetone-reaction-map",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Reactant",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "acetone",
          "$NH_3$",
          "diacetone amine"
        ],
        [
          "acetone",
          "$H_2SO_4/\\Delta$",
          "mesitylene"
        ],
        [
          "acetone",
          "dry HCl",
          "phorone + mesityloxide"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acetone Reaction Map",
    "card_type": "comparison",
    "body": "The source maps acetone to products under ammonia, sulphuric acid/heat and dry HCl conditions.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The detailed drawn products for phorone and mesityloxide remain in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 138,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-aldehyde-ketones-benzaldehyde-acetophenone-benzophenone-map",
    "chapter_id": "neet-chemistry-aldehyde-ketones",
    "table_data": {
      "columns": [
        "Starting carbonyl",
        "Readable source-backed conversions"
      ],
      "rows": [
        [
          "benzaldehyde",
          "Schiff's base/anil with $C_6H_5NH_2$; benzoyl chloride with $H_2/Pd-BaSO_4$ in boiling xylene; benzaldehyde from Friedel-Crafts/Gattermann-type arrows shown."
        ],
        [
          "acetophenone",
          "from benzene with $CH_3COCl/AlCl_3$; chlorination without catalyst gives phenacyl chloride; $Zn-Hg/HCl$ gives ethylbenzene."
        ],
        [
          "benzophenone",
          "from benzene with $C_6H_5COCl/AlCl_3$ or with $COCl_2/AlCl_3$ under excess benzene."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Aromatic Carbonyl Reaction Maps",
    "card_type": "comparison",
    "body": "The source gives dense reaction maps for benzaldehyde, acetophenone and benzophenone.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Only clearly readable reagent-product pairs are summarized here.",
      "Detailed ring structures and multi-step arrows remain available through the original handbook."
    ],
    "importance": 3,
    "source_page": 139,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-acid-salt-and-acid-base-reactions",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "Na metal",
          "$R-CH_2-COONa+\\frac{1}{2}H_2$"
        ],
        [
          "NaOH",
          "$R-CH_2-COONa+H_2O$"
        ],
        [
          "$NaHCO_3$",
          "$R-CH_2-COONa+CO_2\\uparrow+H_2O$"
        ],
        [
          "$CH_3MgBr$",
          "$R-CH_2-COOMgBr+CH_4\\uparrow$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Carboxylic Acid: Salt and Acid-Base Reactions",
    "card_type": "comparison",
    "body": "The source starts the carboxylic acid map from $R-CH_2-COOH$.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-acid-derivative-formation",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$SOCl_2$",
          "$RCH_2COCl+SO_2\\uparrow$"
        ],
        [
          "$PCl_5$",
          "$R-CH_2-COCl$"
        ],
        [
          "$NH_3,\\Delta$",
          "$R-CH_2-C(=O)-NH_2$"
        ],
        [
          "$P_2O_5,\\Delta$",
          "$R-CH_2-C(=O)-O-C(=O)-CH_2-R$"
        ],
        [
          "$R'OH/H_2SO_4$",
          "$R-CH_2-C(=O)-OR'$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-organic-carboxy-derivatives"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Carboxylic Acid to Derivatives",
    "card_type": "comparison",
    "body": "The source map gives acid chloride, amide, anhydride and ester formation from carboxylic acid.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-decarboxylation-hunsdiecker-kolbe",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$NaOH(CaO),\\Delta$",
          "$R-CH_3+Na_2CO_3$"
        ],
        [
          "$AgOH,Br_2/\\Delta$",
          "$R-CH_2-Br+CO_2$"
        ],
        [
          "NaOH, electrolysis",
          "$R-CH_2-CH_2-R$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Decarboxylation, Hunsdiecker and Kolbe-Type Reactions",
    "card_type": "comparison",
    "body": "The carboxylic acid summary map includes decarboxylation, silver-salt bromination and electrolysis.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-hvz-arndt-eistert-ketone",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "(i) $P+X_2$, (ii) $H_2O$",
          "$R-CH(X)-COOH$"
        ],
        [
          "(i) $SOCl_2$, (ii) $CH_2N_2$, (iii) $Ag_2O$, (iv) $H_2O$",
          "$R-CH_2-CH_2-COOH$"
        ],
        [
          "$Ca(OH)_2/\\Delta$, dry distillation",
          "$R-CH_2-C(=O)-CH_2-R+CaCO_3$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "HVZ, Chain Extension and Ketone Formation",
    "card_type": "comparison",
    "body": "The source map includes alpha-halogenation, homologation and ketone formation routes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 140,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-acid-chloride-hydrolysis-ammonolysis",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$H_2O$",
          "$RCOOH+HCl$"
        ],
        [
          "$R'OH$",
          "$RCOOR'+HCl$"
        ],
        [
          "$2NH_3$",
          "$RCONH_2+NH_4Cl$"
        ],
        [
          "$2R'NH_2$",
          "$RCONHR'+R'NH_3^+Cl^-$"
        ],
        [
          "$RCOOH$/pyridine",
          "$(RCO)_2O+HCl$"
        ],
        [
          "$RCOONa$",
          "$(RCO)_2O+NaCl$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acid Chloride: Hydrolysis, Alcoholysis and Ammonolysis",
    "card_type": "comparison",
    "body": "The acid chloride reaction map gives several substitution reactions at the acyl chloride.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-acid-chloride-carbonyl-conversions",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$C_6H_6$/anhyd. $AlCl_3$",
          "$C_6H_5COR+HCl$ (Friedel-Crafts reaction)"
        ],
        [
          "$H_2/Pd-BaSO_4+S$ or quinoline",
          "$RCHO+HCl$ (Rosenmund's reduction)"
        ],
        [
          "$R'_2Cd$/ether",
          "$2RCOR'+CdCl_2$"
        ],
        [
          "$LiAlH_4$/ether",
          "$RCH_2OH$"
        ],
        [
          "KCN, then $H^+/H_2O$",
          "$R-CO-COOH+NH_3$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acid Chloride: Carbonyl Conversions",
    "card_type": "comparison",
    "body": "The acid chloride map includes Friedel-Crafts, Rosenmund, organocadmium, LiAlH4 and KCN reactions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-amide-acid-base-hydrolysis",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$H^+/H_2O$",
          "$RCOOH+NH_4^+$"
        ],
        [
          "NaOH",
          "$RCOONa+NH_3$"
        ],
        [
          "conc. HCl",
          "$RCONH_2\\cdot HCl$"
        ],
        [
          "2Na",
          "$RCONHNa+\\frac{1}{2}H_2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Amide: Hydrolysis and Salt Reactions",
    "card_type": "comparison",
    "body": "The source gives acid and base hydrolysis plus salt formation reactions for amides.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 141,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-amide-dehydration-and-hofmann",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent",
        "Product shown"
      ],
      "rows": [
        [
          "$P_2O_5$",
          "$3RC{\\equiv}N+2H_3PO_4$"
        ],
        [
          "$SOCl_2$",
          "$RC{\\equiv}N+SO_2+HCl$"
        ],
        [
          "HONO",
          "$RCOOH+N_2+H_2O$"
        ],
        [
          "$Br_2+4KOH$",
          "$RNH_2+CO_2+2KBr+H_2O$ (Hoffmann bromide reaction)"
        ],
        [
          "$LiAlH_4$/dry ether",
          "$RCH_2NH_2$ / $1^\\circ$ amine"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Amide: Dehydration, Nitrous Acid and Hofmann Bromide",
    "card_type": "comparison",
    "body": "The source map gives conversion of acid amide to nitrile, acid and amine products.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 141,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-ester-hydrolysis-ammonolysis",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$H^+/H_2O$",
          "$RCOOH+R'OH$ (hydrolysis)"
        ],
        [
          "$NaOH/H_2O$",
          "$RCOONa+R'OH$ (saponification)"
        ],
        [
          "$NH_3$",
          "$RCONH_2+R'OH$ (ammonolysis)"
        ],
        [
          "$R''NH_2$",
          "$RCONHR''+R'OH$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester: Hydrolysis, Saponification and Ammonolysis",
    "card_type": "comparison",
    "body": "The ester reaction map gives acid/base hydrolysis and nitrogen nucleophile reactions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-ester-alcoholysis-reductions",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": {
      "columns": [
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "$R''OH/H^+$ or $R''ONa$",
          "$RCOOR''+R'OH$ (trans-esterification)"
        ],
        [
          "$H_2$/copper chromite or $LiAlH_4$",
          "$RCH_2OH+R'OH$"
        ],
        [
          "Na/alcohol",
          "$RCH_2OH+R'OH$ (Bouveault-Blanc reduction)"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester: Transesterification and Reductions",
    "card_type": "comparison",
    "body": "The source map lists transesterification and ester reductions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-carboxylic-acid-derivatives-ester-grignard-reaction",
    "chapter_id": "neet-chemistry-carboxylic-acid-derivatives",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ester + Grignard Reagent",
    "card_type": "reaction",
    "body": "The source ester map shows ester reaction with two equivalents of Grignard reagent followed by acidic hydrolysis.",
    "formulas": [
      {
        "latex": "R-C(=O)-OR'\\xrightarrow[(ii)\\ H^+/H_2O]{(i)\\ 2R''MgX}R-C(OH)(R'')(R'')"
      }
    ],
    "variables": [],
    "conditions": [
      "Product shown: $3^\\circ$ alcohol.",
      "In case of esters of formic acid, $2^\\circ$ alcohols are obtained."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 11
  }
]$$::jsonb) as cards(
    id text,
    chapter_id text,
    title text,
    card_type text,
    body text,
    formulas jsonb,
    variables jsonb,
    conditions jsonb,
    table_data jsonb,
    diagram_data jsonb,
    diagram_svg text,
    importance integer,
    source_page integer,
    sort_order integer,
    is_active boolean
  )
)
insert into public.formula_cards (
  id,
  chapter_id,
  title,
  card_type,
  body,
  formulas,
  variables,
  conditions,
  table_data,
  diagram_data,
  diagram_svg,
  importance,
  source_page,
  sort_order,
  is_active
)
select
  id,
  chapter_id,
  title,
  card_type,
  body,
  formulas,
  variables,
  conditions,
  table_data,
  diagram_data,
  diagram_svg,
  importance,
  source_page,
  sort_order,
  is_active
from card_seed
on conflict (id) do update set
  chapter_id = excluded.chapter_id,
  title = excluded.title,
  card_type = excluded.card_type,
  body = excluded.body,
  formulas = excluded.formulas,
  variables = excluded.variables,
  conditions = excluded.conditions,
  table_data = excluded.table_data,
  diagram_data = excluded.diagram_data,
  diagram_svg = excluded.diagram_svg,
  importance = excluded.importance,
  source_page = excluded.source_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
