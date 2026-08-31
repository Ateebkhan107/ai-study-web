insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-coordination-compounds', 'jee-chemistry', 'Coordination Compounds', 'coordination-compounds', 13),
  ('jee-chemistry-metallurgy', 'jee-chemistry', 'Metallurgy', 'metallurgy', 14),
  ('neet-chemistry-coordination-compounds', 'neet-chemistry', 'Coordination Compounds', 'coordination-compounds', 13),
  ('neet-chemistry-metallurgy', 'neet-chemistry', 'Metallurgy', 'metallurgy', 14)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-coordination-compounds-addition-and-coordinate-identity",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed identity in solution"
      ],
      "rows": [
        [
          "Double salt",
          "Loses identity in solution."
        ],
        [
          "Coordination compound",
          "Retains identity in solution."
        ],
        [
          "Coordination compound example",
          "$K_4[Fe(CN)_6]$ gives $[Fe(CN)_6]^{4-}$ in aqueous solution."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition Compounds and Coordination Identity",
    "card_type": "table",
    "body": "The source classifies addition compounds into double salts and coordination compounds.",
    "formulas": [
      {
        "latex": "Fe(CN)_2+4KCN\\rightarrow Fe(CN)_2\\cdot 4KCN"
      },
      {
        "latex": "K_4[Fe(CN)_6](aq.)\\rightleftharpoons 4K^+(aq.)+[Fe(CN)_6]^{4-}(aq.)"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 54,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-coordination-compounds-core-terminology",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Term",
        "Source-backed meaning"
      ],
      "rows": [
        [
          "Central atom/ion",
          "Bound to a fixed number of ligands in a definite geometrical arrangement."
        ],
        [
          "Ligand",
          "Neutral molecule, anion, or cation directly linked to the central atom or ion."
        ],
        [
          "Chelate ligand",
          "Di- or polydentate ligand using two or more donor atoms to form a ring with one metal ion."
        ],
        [
          "Coordination number",
          "Number of ligand donor atoms directly attached to the metal."
        ],
        [
          "Oxidation number",
          "Charge the central atom would carry if ligands were removed with the shared electron pairs."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Core Coordination Terminology",
    "card_type": "table",
    "body": "The handbook defines the central atom or ion, ligand, chelate ligand, coordination number, and oxidation number.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Oxidation number is written in Roman numerals, such as Fe(III)."
    ],
    "importance": 5,
    "source_page": 54,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-coordination-compounds-ambidentate-ligands",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Ligand form",
        "Binding atom/name from source"
      ],
      "rows": [
        [
          "$NO_2^-$",
          "nitrito-N when bonded through N."
        ],
        [
          "$ONO^-$",
          "nitrito-O when bonded through O."
        ],
        [
          "$SCN^-$",
          "thiocyanato or thiocyanato-S."
        ],
        [
          "$NCS^-$",
          "isothiocyanato or thiocyanato-N."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ambidentate Ligands",
    "card_type": "table",
    "body": "Ambidentate ligands can ligate through two different atoms.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 54,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-coordination-compounds-neutral-monodentate-ligands",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Formula",
        "Ligand name"
      ],
      "rows": [
        [
          "$CH_3NC$",
          "methyl isocyanide / methylisocyanide"
        ],
        [
          "$PPh_3$",
          "triphenyl phosphine / triphenyl phosphane"
        ],
        [
          "$C_5H_5N$",
          "pyridine"
        ],
        [
          "$NH_3$",
          "ammine"
        ],
        [
          "$MeNH_2$",
          "methylamine"
        ],
        [
          "$H_2O$",
          "aqua or aquo"
        ],
        [
          "$CO$",
          "carbonyl"
        ],
        [
          "$CS$",
          "thiocarbonyl"
        ],
        [
          "$NO$",
          "nitrosyl"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Neutral Monodentate Ligands",
    "card_type": "table",
    "body": "Selected neutral monodentate ligands from the source ligand table.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The handbook notes that the 2004 IUPAC draft recommends anionic ligand names ending in -ido."
    ],
    "importance": 4,
    "source_page": 55,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-coordination-compounds-charged-monodentate-ligands",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Formula",
        "Ligand name"
      ],
      "rows": [
        [
          "$F^-$, $Cl^-$, $Br^-$, $I^-$",
          "fluoro, chloro, bromo, iodo"
        ],
        [
          "$CN^-$ / $NC^-$",
          "cyanido-C / cyanido-N"
        ],
        [
          "$SCN^-$ / $NCS^-$",
          "thiocyanato-S / thiocyanato-N"
        ],
        [
          "$OCN^-$ / $NCO^-$",
          "cyanato-O / cyanato-N"
        ],
        [
          "$OH^-$",
          "hydroxo or hydroxido"
        ],
        [
          "$NO_2^-$ / $ONO^-$",
          "nitrito-N / nitrito-O"
        ],
        [
          "$NO_3^-$",
          "nitrato"
        ],
        [
          "$O^{2-}$, $O_2^{2-}$, $O_2^-$",
          "oxido, peroxido, superoxido"
        ],
        [
          "$CH_3COO^-$",
          "acetato"
        ],
        [
          "$SO_4^{2-}$, $S_2O_3^{2-}$, $SO_3^{2-}$",
          "sulphato, thiosulphato, sulphito"
        ],
        [
          "$NO^+$, $NO_2^+$",
          "nitrosylium/nitrosonium, nitronium"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Charged Monodentate Ligands",
    "card_type": "table",
    "body": "The source table lists common anionic and cationic monodentate ligands.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The visually ambiguous imido entry is left to the PDF fallback."
    ],
    "importance": 5,
    "source_page": 55,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-coordination-compounds-chelating-multidentate-ligands",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Chelating amines",
          "columns": [
            "Denticity",
            "Ligands shown"
          ],
          "rows": [
            [
              "Bidentate",
              "ethylenediamine, en; propanediamine, pn"
            ],
            [
              "Tridentate",
              "diethylenetriamine, dien"
            ],
            [
              "Tetradentate",
              "triethylenetetraamine, trien; triaminotriethylamine, tren"
            ],
            [
              "Pentadentate",
              "tetraethylenepentaamine"
            ],
            [
              "Hexadentate",
              "ethylenediaminetetraacetate, EDTA"
            ]
          ]
        },
        {
          "title": "Other multidentate ligands",
          "columns": [
            "Ligand",
            "Abbreviation/formula shown"
          ],
          "rows": [
            [
              "acetylacetonato",
              "acac"
            ],
            [
              "2,2'-bipyridine",
              "bipy, $C_{10}H_8N_2$"
            ],
            [
              "oxalato",
              "ox, $C_2O_4^{2-}$"
            ],
            [
              "dimethylglyoximato",
              "DMG"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chelating and Multidentate Ligands",
    "card_type": "table",
    "body": "The handbook gives common chelating amines and other multidentate ligands.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 56,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-coordination-compounds-homoleptic-heteroleptic",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Homoleptic and Heteroleptic Complexes",
    "card_type": "formula",
    "body": "The source distinguishes complexes by whether one or more donor groups are present.",
    "formulas": [
      {
        "label": "Homoleptic example",
        "latex": "[Cr(NH_3)_6]^{3+}"
      },
      {
        "label": "Heteroleptic example",
        "latex": "[Co(NH_3)_4Br_2]^+"
      }
    ],
    "variables": [],
    "conditions": [
      "Homoleptic complexes have only one type of donor group.",
      "Heteroleptic complexes have more than one type of donor group."
    ],
    "importance": 3,
    "source_page": 56,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-coordination-compounds-formula-writing-rules",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Rule",
        "Source-backed wording"
      ],
      "rows": [
        [
          "Central atom",
          "Written first."
        ],
        [
          "Ligands",
          "Written alphabetically; ligand charge does not affect order."
        ],
        [
          "Polydentate ligands",
          "Also written alphabetically; abbreviation first letter is used for order."
        ],
        [
          "Brackets",
          "Formula of the entity is enclosed in square brackets."
        ],
        [
          "Polyatomic ligands",
          "Enclosed in parentheses."
        ],
        [
          "Charge",
          "Written outside square brackets as right superscript with number before sign."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Writing Coordination Formulas",
    "card_type": "table",
    "body": "The source gives rules for writing formulas of mononuclear coordination entities.",
    "formulas": [
      {
        "latex": "[Co(H_2O)_6]^{3+}"
      },
      {
        "latex": "[Fe(CN)_6]^{3-}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 57,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-coordination-compounds-nomenclature-rules-prefixes",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Naming rules",
          "columns": [
            "Item",
            "Source-backed rule"
          ],
          "rows": [
            [
              "Order",
              "The cation is named first."
            ],
            [
              "Ligands",
              "Named alphabetically by ligand name, not by prefix."
            ],
            [
              "Anionic ligands",
              "End in -o."
            ],
            [
              "Neutral exceptions",
              "$H_2O$ aqua, $NH_3$ ammine, $CO$ carbonyl, $CS$ thiocarbonyl, $NO$ nitrosyl."
            ],
            [
              "Cationic ligands",
              "End in -ium."
            ]
          ]
        },
        {
          "title": "Prefixes",
          "columns": [
            "Count",
            "Simple prefix",
            "Complex-ligand prefix"
          ],
          "rows": [
            [
              "2",
              "di",
              "bis"
            ],
            [
              "3",
              "tri",
              "tris"
            ],
            [
              "4",
              "tetra",
              "tetrakis"
            ],
            [
              "5",
              "penta",
              "pentakis"
            ],
            [
              "6",
              "hexa",
              "hexakis"
            ],
            [
              "7",
              "hepta",
              "heptakis"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nomenclature Rules and Prefixes",
    "card_type": "table",
    "body": "The handbook lists naming order, ligand suffixes, and multiplicative prefixes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 57,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-coordination-compounds-anionic-complex-metal-names",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Metal",
        "Name in anionic complex"
      ],
      "rows": [
        [
          "Iron",
          "ferrate"
        ],
        [
          "Silver",
          "argentate"
        ],
        [
          "Gold",
          "aurate"
        ],
        [
          "Lead",
          "plumbate"
        ],
        [
          "Tin",
          "stannate"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxidation State and Anionic Metal Names",
    "card_type": "table",
    "body": "The oxidation state is written in Roman numerals after the metal name; anionic complexes use the -ate suffix.",
    "formulas": [
      {
        "latex": "[Co(SCN)_4]^{2-}\\ \\text{cobaltate}"
      }
    ],
    "variables": [],
    "conditions": [
      "Neutral complex molecules are named like complex cations."
    ],
    "importance": 5,
    "source_page": 58,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-coordination-compounds-werner-ean-geometries",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Coordination number",
        "Geometry shown"
      ],
      "rows": [
        [
          "2",
          "Linear"
        ],
        [
          "3",
          "Triangular"
        ],
        [
          "4",
          "Tetrahedral or square planar"
        ],
        [
          "6",
          "Octahedral"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-coordination-geometries"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Werner Theory, EAN and Coordination Geometry",
    "card_type": "mixed",
    "body": "The source links Werner's valencies, the EAN rule, and common coordination polyhedra.",
    "formulas": [
      {
        "latex": "EAN=Z-\\text{oxidation state}+\\text{electrons donated by ligands}"
      }
    ],
    "variables": [
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "atomic number of central metal"
      }
    ],
    "conditions": [
      "Primary valency corresponds to oxidation state and is ionisable.",
      "Secondary valency corresponds to coordination number and is non-ionisable."
    ],
    "importance": 5,
    "source_page": 58,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-coordination-compounds-vbt-hybridisation-examples",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Complex",
        "Hybridisation/shape",
        "Magnetic behavior from source"
      ],
      "rows": [
        [
          "$[Co(NH_3)_6]^{3+}$",
          "$d^2sp^3$, octahedral",
          "Diamagnetic"
        ],
        [
          "$[FeF_6]^{4-}$",
          "$sp^3d^2$, octahedral",
          "Paramagnetic; outer orbital/high spin/spin free"
        ],
        [
          "$[NiCl_4]^{2-}$",
          "$sp^3$, tetrahedral",
          "Paramagnetic"
        ],
        [
          "$[Ni(CO)_4]$",
          "$sp^3$, tetrahedral",
          "Diamagnetic"
        ],
        [
          "$[Ni(CN)_4]^{2-}$",
          "$dsp^2$",
          "Shown with square-planar hybridisation scheme"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "VBT Hybridisation Examples",
    "card_type": "table",
    "body": "Valence Bond Theory uses metal orbitals to form equivalent hybrid orbitals; magnetic behavior is decided by unpaired electrons.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The source describes outer-orbital complexes as high spin or spin free."
    ],
    "importance": 5,
    "source_page": 59,
    "sort_order": 12
  },
  {
    "id": "jee-chemistry-coordination-compounds-magnetic-moment-vbt-limits",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Moment and VBT Limits",
    "card_type": "formula",
    "body": "The source gives the spin-only magnetic moment relation and lists limitations of VBT.",
    "formulas": [
      {
        "latex": "\\mu=\\sqrt{n(n+2)}\\ \\text{Bohr Magneton}"
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of unpaired electrons"
      }
    ],
    "conditions": [
      "VBT gives no quantitative interpretation of magnetic data.",
      "VBT says nothing about spectral colour.",
      "VBT does not distinguish strong and weak ligands."
    ],
    "importance": 5,
    "source_page": 60,
    "sort_order": 13
  },
  {
    "id": "jee-chemistry-coordination-compounds-cft-splitting-and-series",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-cft-splitting"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Crystal Field Splitting",
    "card_type": "mixed",
    "body": "The CFT section treats the metal-ligand bond as electrostatic and shows octahedral and tetrahedral splitting.",
    "formulas": [
      {
        "latex": "e_g:\\ +0.6\\Delta_o"
      },
      {
        "latex": "t_{2g}:\\ -0.4\\Delta_o"
      },
      {
        "latex": "\\Delta_t=\\frac{4}{9}\\Delta_o"
      }
    ],
    "variables": [
      {
        "latex": "\\Delta_o",
        "symbol": "$\\Delta_o$",
        "meaning": "octahedral crystal-field splitting energy"
      },
      {
        "latex": "\\Delta_t",
        "symbol": "$\\Delta_t$",
        "meaning": "tetrahedral crystal-field splitting energy"
      }
    ],
    "conditions": [
      "Spectrochemical series: $I^-<Br^-<SCN^-<Cl^-<S^{2-}<F^-<OH^-<C_2O_4^{2-}<H_2O<NCS^-<edta^{4-}<NH_3<en<NO_2^-<CN^-<CO$."
    ],
    "importance": 5,
    "source_page": 61,
    "sort_order": 14
  },
  {
    "id": "jee-chemistry-coordination-compounds-cfse-colour-stability",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "CFSE, Colour and Stability Constants",
    "card_type": "formula",
    "body": "The handbook gives CFSE, explains colour by d-d transition, and defines overall and stepwise stability constants.",
    "formulas": [
      {
        "latex": "CFSE=[-0.4(n)t_{2g}+0.6(n')e_g]\\Delta_o+{}^*nP"
      },
      {
        "latex": "\\beta_n=\\frac{[ML_n]}{[M(H_2O)_n][L]^n}"
      },
      {
        "latex": "M(H_2O)_n+nL\\rightleftharpoons ML_n+nH_2O"
      },
      {
        "latex": "\\beta_n=K_1K_2K_3\\cdots K_n"
      }
    ],
    "variables": [
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "central metal atom or ion"
      },
      {
        "latex": "L",
        "symbol": "$L$",
        "meaning": "ligand"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of ligands, electrons, or moles depending on context"
      }
    ],
    "conditions": [
      "Colour is due to absorption in the visible region, 400 to 700 nm, and transmission/reflection of the rest.",
      "CFT limitations include ignoring metal s and p orbitals, purely ionic bonding, and no account for pi bonding."
    ],
    "importance": 5,
    "source_page": 62,
    "sort_order": 15
  },
  {
    "id": "jee-chemistry-coordination-compounds-structural-isomerism",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed note/example"
      ],
      "rows": [
        [
          "Ionisation",
          "Counter ion is a potential ligand; $[Co(NH_3)_5SO_4]NO_3$ and $[Co(NH_3)_5NO_3]SO_4$."
        ],
        [
          "Solvate/hydrate",
          "$[Cr(H_2O)_6]Cl_3$, $[CrCl(H_2O)_5]Cl_2\\cdot H_2O$, $[CrCl_2(H_2O)_4]Cl\\cdot 2H_2O$."
        ],
        [
          "Linkage",
          "Ambidentate ligands bind through different donor atoms; $[Co(ONO)(NH_3)_5]Cl_2$ and $[Co(NO_2)(NH_3)_5]Cl_2$."
        ],
        [
          "Coordination",
          "Cationic and anionic coordination entities exchange ligands."
        ],
        [
          "Ligand",
          "Occurs when organic ligands themselves can show isomerism."
        ],
        [
          "Polymerisation",
          "Special case of coordination isomerism; formula weights differ."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Structural Isomerism",
    "card_type": "table",
    "body": "The source lists structural isomerism types with representative examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 63,
    "sort_order": 16
  },
  {
    "id": "jee-chemistry-coordination-compounds-geometrical-isomerism",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Complex type",
        "Number of geometrical isomers shown"
      ],
      "rows": [
        [
          "Square planar $Ma_2bc$",
          "2"
        ],
        [
          "Square planar $Mabcd$",
          "3"
        ],
        [
          "Octahedral $Ma_2b_4$",
          "2"
        ],
        [
          "Octahedral $Ma_4bc$",
          "2"
        ],
        [
          "$M(AA)_3b$",
          "2"
        ],
        [
          "$M(AA)a_2b_2$",
          "3"
        ],
        [
          "$M(AA)_2O_2$",
          "2"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cis-trans-square-planar"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Geometrical Isomerism",
    "card_type": "mixed",
    "body": "Geometrical isomerism is common for coordination number 4 and 6 complexes.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Tetrahedral complexes cannot show geometrical isomerism because all four positions are equivalent.",
      "The source shows cis/trans square-planar $Pt(NH_3)_2Cl_2$ and cis/trans octahedral $[Co(NH_3)_4Cl_2]^+$."
    ],
    "importance": 5,
    "source_page": 64,
    "sort_order": 17
  },
  {
    "id": "jee-chemistry-coordination-compounds-optical-isomerism",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-optical-isomers"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Optical Isomerism",
    "card_type": "mixed",
    "body": "The source defines optical activity and notes where it is common in coordination compounds.",
    "formulas": [
      {
        "latex": "[Co(en)_3]^{3+}"
      }
    ],
    "variables": [],
    "conditions": [
      "A compound rotating plane-polarised light is optically active.",
      "Optical isomerism is common in octahedral complexes involving didentate ligands.",
      "Square planar complexes rarely show optical isomerism because the four ligating atoms and metal ion form a mirror plane."
    ],
    "importance": 4,
    "source_page": 65,
    "sort_order": 18
  },
  {
    "id": "jee-chemistry-coordination-compounds-organometallics-carbonyls",
    "chapter_id": "jee-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed examples"
      ],
      "rows": [
        [
          "Metal carbonyl",
          "$[Ni(CO)_4]$, $[Fe(CO)_5]$, $Mn_2(CO)_{10}$"
        ],
        [
          "Sigma-bonded organometallic",
          "Grignard reagent $R-Mg-X$, $(CH_3)_4Sn$, $(C_2H_5)_4Pb$"
        ],
        [
          "Pi-bonded organometallic",
          "Alkenes, alkynes, benzene or ring compounds with metals; Zeise's salt"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Organometallics and Carbonyl Bonding",
    "card_type": "table",
    "body": "The coordination-compounds section closes with organometallic types and metal-carbonyl synergic bonding.",
    "formulas": [
      {
        "latex": "[Ni(CO)_4]"
      },
      {
        "latex": "[Fe(CO)_5]"
      },
      {
        "latex": "R-Mg-X"
      },
      {
        "latex": "K[PtCl_3(\\eta^2-C_2H_4)]"
      }
    ],
    "variables": [],
    "conditions": [
      "In metal carbonyls, CO acts as sigma donor and pi acceptor; synergic bonding strengthens the metal-CO bond."
    ],
    "importance": 3,
    "source_page": 66,
    "sort_order": 19
  },
  {
    "id": "jee-chemistry-metallurgy-minerals-ores-gangue",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "sections": [
        {
          "title": "Terms",
          "columns": [
            "Term",
            "Source-backed meaning"
          ],
          "rows": [
            [
              "Mineral",
              "Naturally occurring chemical substance in earth crust obtained by mining."
            ],
            [
              "Ore",
              "Mineral from which metal can be extracted conveniently and economically."
            ],
            [
              "Gangue",
              "Rocky or earthy impurities associated with ore."
            ]
          ]
        },
        {
          "title": "Ore classes",
          "columns": [
            "Class",
            "Source-backed examples/description"
          ],
          "rows": [
            [
              "Native ores",
              "Metals in free state; Ag, Au, Pt."
            ],
            [
              "Oxidised ores",
              "Oxides or oxysalts such as carbonates, phosphates, sulphates and silicates."
            ],
            [
              "Sulphurised ores",
              "Sulphides of metals such as Fe, Pb, Zn and Hg."
            ],
            [
              "Halide ores",
              "Halides of metals."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Mineral, Ore and Gangue",
    "card_type": "table",
    "body": "The metallurgy chapter begins with core extraction terminology and ore classes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-metallurgy-important-ores-al-fe-cu",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Metal",
        "Ores shown"
      ],
      "rows": [
        [
          "Aluminium",
          "Bauxite $AlO_x(OH)_{3-2x}$, Diaspore $Al_2O_3\\cdot H_2O$, Corundum $Al_2O_3$, Kaolinite $[Al_2(OH)_4Si_2O_5]$"
        ],
        [
          "Iron",
          "Haematite $Fe_2O_3$, Magnetite $Fe_3O_4$, Siderite $FeCO_3$, Iron pyrite $FeS_2$, Limonite $Fe_2O_3\\cdot 3H_2O$"
        ],
        [
          "Copper",
          "Copper pyrite $CuFeS_2$, Copper glance $Cu_2S$, Cuprite $Cu_2O$, Malachite $CuCO_3\\cdot Cu(OH)_2$, Azurite $2CuCO_3\\cdot Cu(OH)_2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Important Ores: Al, Fe and Cu",
    "card_type": "table",
    "body": "The source table lists common ores of aluminium, iron and copper.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-metallurgy-important-ores-other-metals",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Metal",
        "Ores shown"
      ],
      "rows": [
        [
          "Zinc",
          "Zinc blende/Sphalerite $ZnS$, Calamine $ZnCO_3$, Zincite $ZnO$"
        ],
        [
          "Lead",
          "Galena $PbS$, Anglesite $PbSO_4$, Cerrusite $PbCO_3$"
        ],
        [
          "Magnesium",
          "Carnallite $KCl\\cdot MgCl_2\\cdot 6H_2O$, Magnesite $MgCO_3$, Dolomite $MgCO_3\\cdot CaCO_3$, Epsomsalt $MgSO_4\\cdot 7H_2O$, Langbeinite $K_2Mg_2(SO_4)_3$"
        ],
        [
          "Tin",
          "Cassiterite $SnO_2$"
        ],
        [
          "Silver",
          "Argentite $Ag_2S$, Horn silver $AgCl$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Important Ores: Zn, Pb, Mg, Sn and Ag",
    "card_type": "table",
    "body": "The source continues the ore table for zinc, lead, magnesium, tin and silver.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-metallurgy-concentration-methods",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed basis/use"
      ],
      "rows": [
        [
          "Hydraulic washing / gravity / levigation",
          "Density difference; used for oxide and native ores."
        ],
        [
          "Electromagnetic separation",
          "Magnetic-property difference between ore and impurities."
        ],
        [
          "Froth flotation",
          "Sulphide ores; based on wetting difference with water and pine oil."
        ],
        [
          "Leaching",
          "Ore is soluble in a suitable solvent such as acids, bases or chemical reagents."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-froth-flotation"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Concentration of Ores",
    "card_type": "mixed",
    "body": "Concentration removes unwanted impurities; the source also calls it dressing or beneficiation.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 68,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-metallurgy-calcination-roasting-smelting",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Process",
        "Source-backed point"
      ],
      "rows": [
        [
          "Calcination",
          "Concentrated ore is heated strongly in limited or no air; carbonate decomposes to oxide, water and volatile impurities are expelled."
        ],
        [
          "Roasting",
          "Generally sulphide ore is heated strongly in excess air or oxygen below its melting point; process becomes exothermic once started."
        ],
        [
          "Smelting",
          "Flux combines with impurities to form stable, fusible, immiscible slag."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Calcination, Roasting and Smelting",
    "card_type": "table",
    "body": "The source separates conversion to oxide from slag-forming smelting.",
    "formulas": [
      {
        "latex": "\\text{acidic oxide}+\\text{basic oxide}\\rightarrow\\text{fusible slag}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 69,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-metallurgy-slag-formation",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Slag Formation Equations",
    "card_type": "formula",
    "body": "The handbook gives slag reactions for copper pyrite and acidic impurities.",
    "formulas": [
      {
        "latex": "2CuFeS_2+4O_2\\rightarrow Cu_2S+2FeO+3SO_2"
      },
      {
        "latex": "Cu_2S+FeO+SiO_2\\rightarrow FeSiO_3+Cu_2S"
      },
      {
        "latex": "CaCO_3\\rightarrow CaO+CO_2"
      },
      {
        "latex": "CaO+SiO_2\\rightarrow CaSiO_3"
      },
      {
        "latex": "6CaO+P_4O_{10}\\rightarrow 2Ca_3(PO_4)_2"
      }
    ],
    "variables": [],
    "conditions": [
      "$FeSiO_3$ is identified as fusible slag and $Cu_2S$ as matte in the source."
    ],
    "importance": 5,
    "source_page": 69,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-metallurgy-reduction-methods",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Reduction type",
        "Source-backed point"
      ],
      "rows": [
        [
          "Carbon / CO",
          "Used for examples such as PbO and iron oxide."
        ],
        [
          "Aluminium",
          "Goldschmidt/thermite process for Cr and Mn oxides."
        ],
        [
          "Magnesium or sodium",
          "Used for titanium tetrachloride in Kroll/IMI processes."
        ],
        [
          "Electrolytic reduction",
          "Strongest, pure and expensive method; used for very reactive metals or high-purity samples."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Reduction Methods",
    "card_type": "table",
    "body": "Metal oxide is reduced to free metal using chemical reducing agents or electrolysis.",
    "formulas": [
      {
        "latex": "PbO+C\\rightarrow Pb+CO"
      },
      {
        "latex": "Fe_2O_3+3CO\\rightarrow 2Fe+3CO_2"
      },
      {
        "latex": "Cr_2O_3+Al\\rightarrow 2Cr(l)+Al_2O_3"
      },
      {
        "latex": "TiCl_4+2Mg\\rightarrow Ti+2MgCl_2"
      },
      {
        "latex": "TiCl_4+4Na\\rightarrow Ti+4NaCl"
      }
    ],
    "variables": [],
    "conditions": [
      "The source identifies magnesium reduction as Kroll process and sodium reduction as IMI process."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-metallurgy-self-electrolytic-reduction",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Self and Electrolytic Reduction",
    "card_type": "formula",
    "body": "Self-reduction is also called auto-reduction or air reduction; electrolytic reduction is used for reactive metals.",
    "formulas": [
      {
        "latex": "Cu_2S+3O_2\\rightarrow 3Cu_2O+2SO_2"
      },
      {
        "latex": "2Cu_2O+Cu_2S\\rightarrow 6Cu+SO_2"
      },
      {
        "latex": "Al_2O_3\\ \\text{in cryolite}\\ Na_3[AlF_6]"
      }
    ],
    "variables": [],
    "conditions": [
      "Self-reduction is shown for less electropositive metals such as Hg, Cu, Pb and Sb.",
      "Aluminium is obtained from fused mixture of alumina and cryolite."
    ],
    "importance": 4,
    "source_page": 70,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-metallurgy-aluminium-extraction",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Aluminium Extraction",
    "card_type": "formula",
    "body": "The source lists bauxite purification routes and electrolysis of alumina.",
    "formulas": [
      {
        "latex": "2Al_2O_3+3C\\rightarrow 4Al+3CO_2"
      },
      {
        "latex": "Al^{3+}(melt)+3e^-\\rightarrow Al(l)"
      },
      {
        "latex": "C(s)+O^{2-}(melt)\\rightarrow CO(g)+2e^-"
      },
      {
        "latex": "C(s)+2O^{2-}(melt)\\rightarrow CO_2(g)+4e^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The dense Bayer/Hall/Serpeck purification equation table remains available through the PDF fallback."
    ],
    "importance": 4,
    "source_page": 71,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-metallurgy-iron-copper-extraction",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "sections": [
        {
          "title": "Iron from haematite",
          "columns": [
            "Zone",
            "Equations shown"
          ],
          "rows": [
            [
              "500-800 K",
              "$3Fe_2O_3+CO\\rightarrow 2Fe_3O_4+CO_2$; $Fe_3O_4+CO\\rightarrow 3FeO+CO_2$; $Fe_2O_3+CO\\rightarrow 2FeO+CO_2$"
            ],
            [
              "900-1500 K",
              "$C+CO_2\\rightarrow 2CO$; $FeO+CO\\rightarrow Fe+CO_2$; $CaCO_3\\rightarrow CaO+CO_2$; $CaO+SiO_2\\rightarrow CaSiO_3$"
            ]
          ]
        },
        {
          "title": "Copper from glance/pyrite",
          "columns": [
            "Step",
            "Equations shown"
          ],
          "rows": [
            [
              "Matte formation",
              "$2CuFeS_2+4O_2\\rightarrow Cu_2S+2FeO+3SO_2$; $FeO+SiO_2\\rightarrow FeSiO_3$"
            ],
            [
              "Self reduction",
              "$2Cu_2S+3O_2\\rightarrow 2Cu_2O+2SO_2$; $2Cu_2O+Cu_2S\\rightarrow 6Cu+SO_2$"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Iron and Copper Extraction",
    "card_type": "table",
    "body": "The source gives temperature-zoned iron reduction and copper self-reduction sequences.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 71,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-metallurgy-lead-zinc-tin-extraction",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Lead, Zinc and Tin Extraction",
    "card_type": "formula",
    "body": "The source lists concise extraction sequences for lead, zinc and tin ores.",
    "formulas": [
      {
        "label": "Lead from galena",
        "latex": "2PbS(s)+3O_2(g)\\xrightarrow{\\Delta}2PbO(s)\\xrightarrow{+C,\\Delta}2Pb(l)+CO_2(g)"
      },
      {
        "label": "Zinc blende roasting",
        "latex": "2ZnS+3O_2\\rightarrow 2ZnO+2SO_2"
      },
      {
        "label": "Zinc reduction",
        "latex": "ZnO+C\\xrightarrow{1673K}Zn+CO"
      },
      {
        "label": "Tin reduction",
        "latex": "SnO_2+2C\\rightarrow Sn+2CO"
      },
      {
        "label": "Iron removal from tin",
        "latex": "2Fe+O_2\\rightarrow 2FeO"
      }
    ],
    "variables": [],
    "conditions": [
      "Cassiterite is first concentrated by electromagnetic separation to remove wolframite."
    ],
    "importance": 4,
    "source_page": 72,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-metallurgy-magnesium-gold-silver-extraction",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnesium, Gold and Silver Extraction",
    "card_type": "formula",
    "body": "The source gives Dow-process electrolysis for magnesium and MacArthur-Forrest cyanide extraction for gold/silver.",
    "formulas": [
      {
        "latex": "MgCl_2\\rightleftharpoons Mg^{2+}+2Cl^-"
      },
      {
        "latex": "Mg^{2+}+2e^-\\rightarrow Mg"
      },
      {
        "latex": "2Cl^-\\rightarrow Cl_2+2e^-"
      },
      {
        "latex": "4Au/Ag+8CN^-+2H_2O+O_2\\rightarrow 4[Au/Ag(CN)_2]^-+4OH^-"
      },
      {
        "latex": "2[Au/Ag(CN)_2]^-+Zn\\rightarrow 2Au/Ag+[Zn(CN)_4]^{2-}"
      }
    ],
    "variables": [],
    "conditions": [
      "Detailed argentite cyanide sequence remains available in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 72,
    "sort_order": 12
  },
  {
    "id": "jee-chemistry-metallurgy-physical-refining",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed use"
      ],
      "rows": [
        [
          "Liquation",
          "Used when metal is easily fusible but impurities are not; examples Sn, Zn and removal of Pb from Zn-Ag alloy."
        ],
        [
          "Fractional distillation",
          "Used when metal is volatile and impurities are non-volatile or vice versa; examples Zn, Cd, Hg."
        ],
        [
          "Zone refining",
          "Used for very high purity; examples pure Si and Ge semiconductors."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-zone-refining"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Physical Refining Methods",
    "card_type": "mixed",
    "body": "The source groups liquation, fractional distillation and zone refining under physical refining methods.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 73,
    "sort_order": 13
  },
  {
    "id": "jee-chemistry-metallurgy-chemical-refining",
    "chapter_id": "jee-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed examples"
      ],
      "rows": [
        [
          "Oxidative refining",
          "Pb, Ag, Cu and Fe."
        ],
        [
          "Poling",
          "Copper and tin containing own oxides."
        ],
        [
          "Electrolytic refining",
          "Cu, Ni and Al."
        ],
        [
          "Vapour-phase refining",
          "Mond process and Van Arkel-De Boer process."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-electrolytic-refining"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Chemical Refining Methods",
    "card_type": "mixed",
    "body": "The source lists oxidative refining, poling, electrolytic refining and vapour-phase refining.",
    "formulas": [
      {
        "latex": "4CuO+CH_4\\rightarrow 4Cu+CO_2+2H_2O"
      },
      {
        "latex": "Ni+4CO\\xrightarrow{50^\\circ C}[Ni(CO)_4]"
      },
      {
        "latex": "[Ni(CO)_4]\\xrightarrow{200^\\circ C}Ni+4CO"
      },
      {
        "latex": "Ti+2I_2\\xrightarrow{50-250^\\circ C}TiI_4\\xrightarrow{1400^\\circ C}Ti+2I_2"
      }
    ],
    "variables": [],
    "conditions": [
      "Poling is used for purification of copper or tin containing its own oxide.",
      "Mond process is shown for nickel; Van Arkel-De Boer process is shown for titanium."
    ],
    "importance": 5,
    "source_page": 73,
    "sort_order": 14
  },
  {
    "id": "neet-chemistry-coordination-compounds-addition-and-coordinate-identity",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed identity in solution"
      ],
      "rows": [
        [
          "Double salt",
          "Loses identity in solution."
        ],
        [
          "Coordination compound",
          "Retains identity in solution."
        ],
        [
          "Coordination compound example",
          "$K_4[Fe(CN)_6]$ gives $[Fe(CN)_6]^{4-}$ in aqueous solution."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition Compounds and Coordination Identity",
    "card_type": "table",
    "body": "The source classifies addition compounds into double salts and coordination compounds.",
    "formulas": [
      {
        "latex": "Fe(CN)_2+4KCN\\rightarrow Fe(CN)_2\\cdot 4KCN"
      },
      {
        "latex": "K_4[Fe(CN)_6](aq.)\\rightleftharpoons 4K^+(aq.)+[Fe(CN)_6]^{4-}(aq.)"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 54,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-coordination-compounds-core-terminology",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Term",
        "Source-backed meaning"
      ],
      "rows": [
        [
          "Central atom/ion",
          "Bound to a fixed number of ligands in a definite geometrical arrangement."
        ],
        [
          "Ligand",
          "Neutral molecule, anion, or cation directly linked to the central atom or ion."
        ],
        [
          "Chelate ligand",
          "Di- or polydentate ligand using two or more donor atoms to form a ring with one metal ion."
        ],
        [
          "Coordination number",
          "Number of ligand donor atoms directly attached to the metal."
        ],
        [
          "Oxidation number",
          "Charge the central atom would carry if ligands were removed with the shared electron pairs."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Core Coordination Terminology",
    "card_type": "table",
    "body": "The handbook defines the central atom or ion, ligand, chelate ligand, coordination number, and oxidation number.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Oxidation number is written in Roman numerals, such as Fe(III)."
    ],
    "importance": 5,
    "source_page": 54,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-coordination-compounds-ambidentate-ligands",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Ligand form",
        "Binding atom/name from source"
      ],
      "rows": [
        [
          "$NO_2^-$",
          "nitrito-N when bonded through N."
        ],
        [
          "$ONO^-$",
          "nitrito-O when bonded through O."
        ],
        [
          "$SCN^-$",
          "thiocyanato or thiocyanato-S."
        ],
        [
          "$NCS^-$",
          "isothiocyanato or thiocyanato-N."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ambidentate Ligands",
    "card_type": "table",
    "body": "Ambidentate ligands can ligate through two different atoms.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 54,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-coordination-compounds-neutral-monodentate-ligands",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Formula",
        "Ligand name"
      ],
      "rows": [
        [
          "$CH_3NC$",
          "methyl isocyanide / methylisocyanide"
        ],
        [
          "$PPh_3$",
          "triphenyl phosphine / triphenyl phosphane"
        ],
        [
          "$C_5H_5N$",
          "pyridine"
        ],
        [
          "$NH_3$",
          "ammine"
        ],
        [
          "$MeNH_2$",
          "methylamine"
        ],
        [
          "$H_2O$",
          "aqua or aquo"
        ],
        [
          "$CO$",
          "carbonyl"
        ],
        [
          "$CS$",
          "thiocarbonyl"
        ],
        [
          "$NO$",
          "nitrosyl"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Neutral Monodentate Ligands",
    "card_type": "table",
    "body": "Selected neutral monodentate ligands from the source ligand table.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The handbook notes that the 2004 IUPAC draft recommends anionic ligand names ending in -ido."
    ],
    "importance": 4,
    "source_page": 55,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-coordination-compounds-charged-monodentate-ligands",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Formula",
        "Ligand name"
      ],
      "rows": [
        [
          "$F^-$, $Cl^-$, $Br^-$, $I^-$",
          "fluoro, chloro, bromo, iodo"
        ],
        [
          "$CN^-$ / $NC^-$",
          "cyanido-C / cyanido-N"
        ],
        [
          "$SCN^-$ / $NCS^-$",
          "thiocyanato-S / thiocyanato-N"
        ],
        [
          "$OCN^-$ / $NCO^-$",
          "cyanato-O / cyanato-N"
        ],
        [
          "$OH^-$",
          "hydroxo or hydroxido"
        ],
        [
          "$NO_2^-$ / $ONO^-$",
          "nitrito-N / nitrito-O"
        ],
        [
          "$NO_3^-$",
          "nitrato"
        ],
        [
          "$O^{2-}$, $O_2^{2-}$, $O_2^-$",
          "oxido, peroxido, superoxido"
        ],
        [
          "$CH_3COO^-$",
          "acetato"
        ],
        [
          "$SO_4^{2-}$, $S_2O_3^{2-}$, $SO_3^{2-}$",
          "sulphato, thiosulphato, sulphito"
        ],
        [
          "$NO^+$, $NO_2^+$",
          "nitrosylium/nitrosonium, nitronium"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Charged Monodentate Ligands",
    "card_type": "table",
    "body": "The source table lists common anionic and cationic monodentate ligands.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The visually ambiguous imido entry is left to the PDF fallback."
    ],
    "importance": 5,
    "source_page": 55,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-coordination-compounds-chelating-multidentate-ligands",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Chelating amines",
          "columns": [
            "Denticity",
            "Ligands shown"
          ],
          "rows": [
            [
              "Bidentate",
              "ethylenediamine, en; propanediamine, pn"
            ],
            [
              "Tridentate",
              "diethylenetriamine, dien"
            ],
            [
              "Tetradentate",
              "triethylenetetraamine, trien; triaminotriethylamine, tren"
            ],
            [
              "Pentadentate",
              "tetraethylenepentaamine"
            ],
            [
              "Hexadentate",
              "ethylenediaminetetraacetate, EDTA"
            ]
          ]
        },
        {
          "title": "Other multidentate ligands",
          "columns": [
            "Ligand",
            "Abbreviation/formula shown"
          ],
          "rows": [
            [
              "acetylacetonato",
              "acac"
            ],
            [
              "2,2'-bipyridine",
              "bipy, $C_{10}H_8N_2$"
            ],
            [
              "oxalato",
              "ox, $C_2O_4^{2-}$"
            ],
            [
              "dimethylglyoximato",
              "DMG"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chelating and Multidentate Ligands",
    "card_type": "table",
    "body": "The handbook gives common chelating amines and other multidentate ligands.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 56,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-coordination-compounds-homoleptic-heteroleptic",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Homoleptic and Heteroleptic Complexes",
    "card_type": "formula",
    "body": "The source distinguishes complexes by whether one or more donor groups are present.",
    "formulas": [
      {
        "label": "Homoleptic example",
        "latex": "[Cr(NH_3)_6]^{3+}"
      },
      {
        "label": "Heteroleptic example",
        "latex": "[Co(NH_3)_4Br_2]^+"
      }
    ],
    "variables": [],
    "conditions": [
      "Homoleptic complexes have only one type of donor group.",
      "Heteroleptic complexes have more than one type of donor group."
    ],
    "importance": 3,
    "source_page": 56,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-coordination-compounds-formula-writing-rules",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Rule",
        "Source-backed wording"
      ],
      "rows": [
        [
          "Central atom",
          "Written first."
        ],
        [
          "Ligands",
          "Written alphabetically; ligand charge does not affect order."
        ],
        [
          "Polydentate ligands",
          "Also written alphabetically; abbreviation first letter is used for order."
        ],
        [
          "Brackets",
          "Formula of the entity is enclosed in square brackets."
        ],
        [
          "Polyatomic ligands",
          "Enclosed in parentheses."
        ],
        [
          "Charge",
          "Written outside square brackets as right superscript with number before sign."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Writing Coordination Formulas",
    "card_type": "table",
    "body": "The source gives rules for writing formulas of mononuclear coordination entities.",
    "formulas": [
      {
        "latex": "[Co(H_2O)_6]^{3+}"
      },
      {
        "latex": "[Fe(CN)_6]^{3-}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 57,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-coordination-compounds-nomenclature-rules-prefixes",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Naming rules",
          "columns": [
            "Item",
            "Source-backed rule"
          ],
          "rows": [
            [
              "Order",
              "The cation is named first."
            ],
            [
              "Ligands",
              "Named alphabetically by ligand name, not by prefix."
            ],
            [
              "Anionic ligands",
              "End in -o."
            ],
            [
              "Neutral exceptions",
              "$H_2O$ aqua, $NH_3$ ammine, $CO$ carbonyl, $CS$ thiocarbonyl, $NO$ nitrosyl."
            ],
            [
              "Cationic ligands",
              "End in -ium."
            ]
          ]
        },
        {
          "title": "Prefixes",
          "columns": [
            "Count",
            "Simple prefix",
            "Complex-ligand prefix"
          ],
          "rows": [
            [
              "2",
              "di",
              "bis"
            ],
            [
              "3",
              "tri",
              "tris"
            ],
            [
              "4",
              "tetra",
              "tetrakis"
            ],
            [
              "5",
              "penta",
              "pentakis"
            ],
            [
              "6",
              "hexa",
              "hexakis"
            ],
            [
              "7",
              "hepta",
              "heptakis"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nomenclature Rules and Prefixes",
    "card_type": "table",
    "body": "The handbook lists naming order, ligand suffixes, and multiplicative prefixes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 57,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-coordination-compounds-anionic-complex-metal-names",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Metal",
        "Name in anionic complex"
      ],
      "rows": [
        [
          "Iron",
          "ferrate"
        ],
        [
          "Silver",
          "argentate"
        ],
        [
          "Gold",
          "aurate"
        ],
        [
          "Lead",
          "plumbate"
        ],
        [
          "Tin",
          "stannate"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxidation State and Anionic Metal Names",
    "card_type": "table",
    "body": "The oxidation state is written in Roman numerals after the metal name; anionic complexes use the -ate suffix.",
    "formulas": [
      {
        "latex": "[Co(SCN)_4]^{2-}\\ \\text{cobaltate}"
      }
    ],
    "variables": [],
    "conditions": [
      "Neutral complex molecules are named like complex cations."
    ],
    "importance": 5,
    "source_page": 58,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-coordination-compounds-werner-ean-geometries",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Coordination number",
        "Geometry shown"
      ],
      "rows": [
        [
          "2",
          "Linear"
        ],
        [
          "3",
          "Triangular"
        ],
        [
          "4",
          "Tetrahedral or square planar"
        ],
        [
          "6",
          "Octahedral"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-coordination-geometries"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Werner Theory, EAN and Coordination Geometry",
    "card_type": "mixed",
    "body": "The source links Werner's valencies, the EAN rule, and common coordination polyhedra.",
    "formulas": [
      {
        "latex": "EAN=Z-\\text{oxidation state}+\\text{electrons donated by ligands}"
      }
    ],
    "variables": [
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "atomic number of central metal"
      }
    ],
    "conditions": [
      "Primary valency corresponds to oxidation state and is ionisable.",
      "Secondary valency corresponds to coordination number and is non-ionisable."
    ],
    "importance": 5,
    "source_page": 58,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-coordination-compounds-vbt-hybridisation-examples",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Complex",
        "Hybridisation/shape",
        "Magnetic behavior from source"
      ],
      "rows": [
        [
          "$[Co(NH_3)_6]^{3+}$",
          "$d^2sp^3$, octahedral",
          "Diamagnetic"
        ],
        [
          "$[FeF_6]^{4-}$",
          "$sp^3d^2$, octahedral",
          "Paramagnetic; outer orbital/high spin/spin free"
        ],
        [
          "$[NiCl_4]^{2-}$",
          "$sp^3$, tetrahedral",
          "Paramagnetic"
        ],
        [
          "$[Ni(CO)_4]$",
          "$sp^3$, tetrahedral",
          "Diamagnetic"
        ],
        [
          "$[Ni(CN)_4]^{2-}$",
          "$dsp^2$",
          "Shown with square-planar hybridisation scheme"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "VBT Hybridisation Examples",
    "card_type": "table",
    "body": "Valence Bond Theory uses metal orbitals to form equivalent hybrid orbitals; magnetic behavior is decided by unpaired electrons.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The source describes outer-orbital complexes as high spin or spin free."
    ],
    "importance": 5,
    "source_page": 59,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-coordination-compounds-magnetic-moment-vbt-limits",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Moment and VBT Limits",
    "card_type": "formula",
    "body": "The source gives the spin-only magnetic moment relation and lists limitations of VBT.",
    "formulas": [
      {
        "latex": "\\mu=\\sqrt{n(n+2)}\\ \\text{Bohr Magneton}"
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of unpaired electrons"
      }
    ],
    "conditions": [
      "VBT gives no quantitative interpretation of magnetic data.",
      "VBT says nothing about spectral colour.",
      "VBT does not distinguish strong and weak ligands."
    ],
    "importance": 5,
    "source_page": 60,
    "sort_order": 13
  },
  {
    "id": "neet-chemistry-coordination-compounds-cft-splitting-and-series",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-cft-splitting"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Crystal Field Splitting",
    "card_type": "mixed",
    "body": "The CFT section treats the metal-ligand bond as electrostatic and shows octahedral and tetrahedral splitting.",
    "formulas": [
      {
        "latex": "e_g:\\ +0.6\\Delta_o"
      },
      {
        "latex": "t_{2g}:\\ -0.4\\Delta_o"
      },
      {
        "latex": "\\Delta_t=\\frac{4}{9}\\Delta_o"
      }
    ],
    "variables": [
      {
        "latex": "\\Delta_o",
        "symbol": "$\\Delta_o$",
        "meaning": "octahedral crystal-field splitting energy"
      },
      {
        "latex": "\\Delta_t",
        "symbol": "$\\Delta_t$",
        "meaning": "tetrahedral crystal-field splitting energy"
      }
    ],
    "conditions": [
      "Spectrochemical series: $I^-<Br^-<SCN^-<Cl^-<S^{2-}<F^-<OH^-<C_2O_4^{2-}<H_2O<NCS^-<edta^{4-}<NH_3<en<NO_2^-<CN^-<CO$."
    ],
    "importance": 5,
    "source_page": 61,
    "sort_order": 14
  },
  {
    "id": "neet-chemistry-coordination-compounds-cfse-colour-stability",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "CFSE, Colour and Stability Constants",
    "card_type": "formula",
    "body": "The handbook gives CFSE, explains colour by d-d transition, and defines overall and stepwise stability constants.",
    "formulas": [
      {
        "latex": "CFSE=[-0.4(n)t_{2g}+0.6(n')e_g]\\Delta_o+{}^*nP"
      },
      {
        "latex": "\\beta_n=\\frac{[ML_n]}{[M(H_2O)_n][L]^n}"
      },
      {
        "latex": "M(H_2O)_n+nL\\rightleftharpoons ML_n+nH_2O"
      },
      {
        "latex": "\\beta_n=K_1K_2K_3\\cdots K_n"
      }
    ],
    "variables": [
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "central metal atom or ion"
      },
      {
        "latex": "L",
        "symbol": "$L$",
        "meaning": "ligand"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of ligands, electrons, or moles depending on context"
      }
    ],
    "conditions": [
      "Colour is due to absorption in the visible region, 400 to 700 nm, and transmission/reflection of the rest.",
      "CFT limitations include ignoring metal s and p orbitals, purely ionic bonding, and no account for pi bonding."
    ],
    "importance": 5,
    "source_page": 62,
    "sort_order": 15
  },
  {
    "id": "neet-chemistry-coordination-compounds-structural-isomerism",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed note/example"
      ],
      "rows": [
        [
          "Ionisation",
          "Counter ion is a potential ligand; $[Co(NH_3)_5SO_4]NO_3$ and $[Co(NH_3)_5NO_3]SO_4$."
        ],
        [
          "Solvate/hydrate",
          "$[Cr(H_2O)_6]Cl_3$, $[CrCl(H_2O)_5]Cl_2\\cdot H_2O$, $[CrCl_2(H_2O)_4]Cl\\cdot 2H_2O$."
        ],
        [
          "Linkage",
          "Ambidentate ligands bind through different donor atoms; $[Co(ONO)(NH_3)_5]Cl_2$ and $[Co(NO_2)(NH_3)_5]Cl_2$."
        ],
        [
          "Coordination",
          "Cationic and anionic coordination entities exchange ligands."
        ],
        [
          "Ligand",
          "Occurs when organic ligands themselves can show isomerism."
        ],
        [
          "Polymerisation",
          "Special case of coordination isomerism; formula weights differ."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Structural Isomerism",
    "card_type": "table",
    "body": "The source lists structural isomerism types with representative examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 63,
    "sort_order": 16
  },
  {
    "id": "neet-chemistry-coordination-compounds-geometrical-isomerism",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Complex type",
        "Number of geometrical isomers shown"
      ],
      "rows": [
        [
          "Square planar $Ma_2bc$",
          "2"
        ],
        [
          "Square planar $Mabcd$",
          "3"
        ],
        [
          "Octahedral $Ma_2b_4$",
          "2"
        ],
        [
          "Octahedral $Ma_4bc$",
          "2"
        ],
        [
          "$M(AA)_3b$",
          "2"
        ],
        [
          "$M(AA)a_2b_2$",
          "3"
        ],
        [
          "$M(AA)_2O_2$",
          "2"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cis-trans-square-planar"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Geometrical Isomerism",
    "card_type": "mixed",
    "body": "Geometrical isomerism is common for coordination number 4 and 6 complexes.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Tetrahedral complexes cannot show geometrical isomerism because all four positions are equivalent.",
      "The source shows cis/trans square-planar $Pt(NH_3)_2Cl_2$ and cis/trans octahedral $[Co(NH_3)_4Cl_2]^+$."
    ],
    "importance": 5,
    "source_page": 64,
    "sort_order": 17
  },
  {
    "id": "neet-chemistry-coordination-compounds-optical-isomerism",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-optical-isomers"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Optical Isomerism",
    "card_type": "mixed",
    "body": "The source defines optical activity and notes where it is common in coordination compounds.",
    "formulas": [
      {
        "latex": "[Co(en)_3]^{3+}"
      }
    ],
    "variables": [],
    "conditions": [
      "A compound rotating plane-polarised light is optically active.",
      "Optical isomerism is common in octahedral complexes involving didentate ligands.",
      "Square planar complexes rarely show optical isomerism because the four ligating atoms and metal ion form a mirror plane."
    ],
    "importance": 4,
    "source_page": 65,
    "sort_order": 18
  },
  {
    "id": "neet-chemistry-coordination-compounds-organometallics-carbonyls",
    "chapter_id": "neet-chemistry-coordination-compounds",
    "table_data": {
      "columns": [
        "Type",
        "Source-backed examples"
      ],
      "rows": [
        [
          "Metal carbonyl",
          "$[Ni(CO)_4]$, $[Fe(CO)_5]$, $Mn_2(CO)_{10}$"
        ],
        [
          "Sigma-bonded organometallic",
          "Grignard reagent $R-Mg-X$, $(CH_3)_4Sn$, $(C_2H_5)_4Pb$"
        ],
        [
          "Pi-bonded organometallic",
          "Alkenes, alkynes, benzene or ring compounds with metals; Zeise's salt"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Organometallics and Carbonyl Bonding",
    "card_type": "table",
    "body": "The coordination-compounds section closes with organometallic types and metal-carbonyl synergic bonding.",
    "formulas": [
      {
        "latex": "[Ni(CO)_4]"
      },
      {
        "latex": "[Fe(CO)_5]"
      },
      {
        "latex": "R-Mg-X"
      },
      {
        "latex": "K[PtCl_3(\\eta^2-C_2H_4)]"
      }
    ],
    "variables": [],
    "conditions": [
      "In metal carbonyls, CO acts as sigma donor and pi acceptor; synergic bonding strengthens the metal-CO bond."
    ],
    "importance": 3,
    "source_page": 66,
    "sort_order": 19
  },
  {
    "id": "neet-chemistry-metallurgy-minerals-ores-gangue",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "sections": [
        {
          "title": "Terms",
          "columns": [
            "Term",
            "Source-backed meaning"
          ],
          "rows": [
            [
              "Mineral",
              "Naturally occurring chemical substance in earth crust obtained by mining."
            ],
            [
              "Ore",
              "Mineral from which metal can be extracted conveniently and economically."
            ],
            [
              "Gangue",
              "Rocky or earthy impurities associated with ore."
            ]
          ]
        },
        {
          "title": "Ore classes",
          "columns": [
            "Class",
            "Source-backed examples/description"
          ],
          "rows": [
            [
              "Native ores",
              "Metals in free state; Ag, Au, Pt."
            ],
            [
              "Oxidised ores",
              "Oxides or oxysalts such as carbonates, phosphates, sulphates and silicates."
            ],
            [
              "Sulphurised ores",
              "Sulphides of metals such as Fe, Pb, Zn and Hg."
            ],
            [
              "Halide ores",
              "Halides of metals."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Mineral, Ore and Gangue",
    "card_type": "table",
    "body": "The metallurgy chapter begins with core extraction terminology and ore classes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-metallurgy-important-ores-al-fe-cu",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Metal",
        "Ores shown"
      ],
      "rows": [
        [
          "Aluminium",
          "Bauxite $AlO_x(OH)_{3-2x}$, Diaspore $Al_2O_3\\cdot H_2O$, Corundum $Al_2O_3$, Kaolinite $[Al_2(OH)_4Si_2O_5]$"
        ],
        [
          "Iron",
          "Haematite $Fe_2O_3$, Magnetite $Fe_3O_4$, Siderite $FeCO_3$, Iron pyrite $FeS_2$, Limonite $Fe_2O_3\\cdot 3H_2O$"
        ],
        [
          "Copper",
          "Copper pyrite $CuFeS_2$, Copper glance $Cu_2S$, Cuprite $Cu_2O$, Malachite $CuCO_3\\cdot Cu(OH)_2$, Azurite $2CuCO_3\\cdot Cu(OH)_2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Important Ores: Al, Fe and Cu",
    "card_type": "table",
    "body": "The source table lists common ores of aluminium, iron and copper.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-metallurgy-important-ores-other-metals",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Metal",
        "Ores shown"
      ],
      "rows": [
        [
          "Zinc",
          "Zinc blende/Sphalerite $ZnS$, Calamine $ZnCO_3$, Zincite $ZnO$"
        ],
        [
          "Lead",
          "Galena $PbS$, Anglesite $PbSO_4$, Cerrusite $PbCO_3$"
        ],
        [
          "Magnesium",
          "Carnallite $KCl\\cdot MgCl_2\\cdot 6H_2O$, Magnesite $MgCO_3$, Dolomite $MgCO_3\\cdot CaCO_3$, Epsomsalt $MgSO_4\\cdot 7H_2O$, Langbeinite $K_2Mg_2(SO_4)_3$"
        ],
        [
          "Tin",
          "Cassiterite $SnO_2$"
        ],
        [
          "Silver",
          "Argentite $Ag_2S$, Horn silver $AgCl$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Important Ores: Zn, Pb, Mg, Sn and Ag",
    "card_type": "table",
    "body": "The source continues the ore table for zinc, lead, magnesium, tin and silver.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 67,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-metallurgy-concentration-methods",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed basis/use"
      ],
      "rows": [
        [
          "Hydraulic washing / gravity / levigation",
          "Density difference; used for oxide and native ores."
        ],
        [
          "Electromagnetic separation",
          "Magnetic-property difference between ore and impurities."
        ],
        [
          "Froth flotation",
          "Sulphide ores; based on wetting difference with water and pine oil."
        ],
        [
          "Leaching",
          "Ore is soluble in a suitable solvent such as acids, bases or chemical reagents."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-froth-flotation"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Concentration of Ores",
    "card_type": "mixed",
    "body": "Concentration removes unwanted impurities; the source also calls it dressing or beneficiation.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 68,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-metallurgy-calcination-roasting-smelting",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Process",
        "Source-backed point"
      ],
      "rows": [
        [
          "Calcination",
          "Concentrated ore is heated strongly in limited or no air; carbonate decomposes to oxide, water and volatile impurities are expelled."
        ],
        [
          "Roasting",
          "Generally sulphide ore is heated strongly in excess air or oxygen below its melting point; process becomes exothermic once started."
        ],
        [
          "Smelting",
          "Flux combines with impurities to form stable, fusible, immiscible slag."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Calcination, Roasting and Smelting",
    "card_type": "table",
    "body": "The source separates conversion to oxide from slag-forming smelting.",
    "formulas": [
      {
        "latex": "\\text{acidic oxide}+\\text{basic oxide}\\rightarrow\\text{fusible slag}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 69,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-metallurgy-slag-formation",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Slag Formation Equations",
    "card_type": "formula",
    "body": "The handbook gives slag reactions for copper pyrite and acidic impurities.",
    "formulas": [
      {
        "latex": "2CuFeS_2+4O_2\\rightarrow Cu_2S+2FeO+3SO_2"
      },
      {
        "latex": "Cu_2S+FeO+SiO_2\\rightarrow FeSiO_3+Cu_2S"
      },
      {
        "latex": "CaCO_3\\rightarrow CaO+CO_2"
      },
      {
        "latex": "CaO+SiO_2\\rightarrow CaSiO_3"
      },
      {
        "latex": "6CaO+P_4O_{10}\\rightarrow 2Ca_3(PO_4)_2"
      }
    ],
    "variables": [],
    "conditions": [
      "$FeSiO_3$ is identified as fusible slag and $Cu_2S$ as matte in the source."
    ],
    "importance": 5,
    "source_page": 69,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-metallurgy-reduction-methods",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Reduction type",
        "Source-backed point"
      ],
      "rows": [
        [
          "Carbon / CO",
          "Used for examples such as PbO and iron oxide."
        ],
        [
          "Aluminium",
          "Goldschmidt/thermite process for Cr and Mn oxides."
        ],
        [
          "Magnesium or sodium",
          "Used for titanium tetrachloride in Kroll/IMI processes."
        ],
        [
          "Electrolytic reduction",
          "Strongest, pure and expensive method; used for very reactive metals or high-purity samples."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Reduction Methods",
    "card_type": "table",
    "body": "Metal oxide is reduced to free metal using chemical reducing agents or electrolysis.",
    "formulas": [
      {
        "latex": "PbO+C\\rightarrow Pb+CO"
      },
      {
        "latex": "Fe_2O_3+3CO\\rightarrow 2Fe+3CO_2"
      },
      {
        "latex": "Cr_2O_3+Al\\rightarrow 2Cr(l)+Al_2O_3"
      },
      {
        "latex": "TiCl_4+2Mg\\rightarrow Ti+2MgCl_2"
      },
      {
        "latex": "TiCl_4+4Na\\rightarrow Ti+4NaCl"
      }
    ],
    "variables": [],
    "conditions": [
      "The source identifies magnesium reduction as Kroll process and sodium reduction as IMI process."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-metallurgy-self-electrolytic-reduction",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Self and Electrolytic Reduction",
    "card_type": "formula",
    "body": "Self-reduction is also called auto-reduction or air reduction; electrolytic reduction is used for reactive metals.",
    "formulas": [
      {
        "latex": "Cu_2S+3O_2\\rightarrow 3Cu_2O+2SO_2"
      },
      {
        "latex": "2Cu_2O+Cu_2S\\rightarrow 6Cu+SO_2"
      },
      {
        "latex": "Al_2O_3\\ \\text{in cryolite}\\ Na_3[AlF_6]"
      }
    ],
    "variables": [],
    "conditions": [
      "Self-reduction is shown for less electropositive metals such as Hg, Cu, Pb and Sb.",
      "Aluminium is obtained from fused mixture of alumina and cryolite."
    ],
    "importance": 4,
    "source_page": 70,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-metallurgy-aluminium-extraction",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Aluminium Extraction",
    "card_type": "formula",
    "body": "The source lists bauxite purification routes and electrolysis of alumina.",
    "formulas": [
      {
        "latex": "2Al_2O_3+3C\\rightarrow 4Al+3CO_2"
      },
      {
        "latex": "Al^{3+}(melt)+3e^-\\rightarrow Al(l)"
      },
      {
        "latex": "C(s)+O^{2-}(melt)\\rightarrow CO(g)+2e^-"
      },
      {
        "latex": "C(s)+2O^{2-}(melt)\\rightarrow CO_2(g)+4e^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The dense Bayer/Hall/Serpeck purification equation table remains available through the PDF fallback."
    ],
    "importance": 4,
    "source_page": 71,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-metallurgy-iron-copper-extraction",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "sections": [
        {
          "title": "Iron from haematite",
          "columns": [
            "Zone",
            "Equations shown"
          ],
          "rows": [
            [
              "500-800 K",
              "$3Fe_2O_3+CO\\rightarrow 2Fe_3O_4+CO_2$; $Fe_3O_4+CO\\rightarrow 3FeO+CO_2$; $Fe_2O_3+CO\\rightarrow 2FeO+CO_2$"
            ],
            [
              "900-1500 K",
              "$C+CO_2\\rightarrow 2CO$; $FeO+CO\\rightarrow Fe+CO_2$; $CaCO_3\\rightarrow CaO+CO_2$; $CaO+SiO_2\\rightarrow CaSiO_3$"
            ]
          ]
        },
        {
          "title": "Copper from glance/pyrite",
          "columns": [
            "Step",
            "Equations shown"
          ],
          "rows": [
            [
              "Matte formation",
              "$2CuFeS_2+4O_2\\rightarrow Cu_2S+2FeO+3SO_2$; $FeO+SiO_2\\rightarrow FeSiO_3$"
            ],
            [
              "Self reduction",
              "$2Cu_2S+3O_2\\rightarrow 2Cu_2O+2SO_2$; $2Cu_2O+Cu_2S\\rightarrow 6Cu+SO_2$"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Iron and Copper Extraction",
    "card_type": "table",
    "body": "The source gives temperature-zoned iron reduction and copper self-reduction sequences.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 71,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-metallurgy-lead-zinc-tin-extraction",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Lead, Zinc and Tin Extraction",
    "card_type": "formula",
    "body": "The source lists concise extraction sequences for lead, zinc and tin ores.",
    "formulas": [
      {
        "label": "Lead from galena",
        "latex": "2PbS(s)+3O_2(g)\\xrightarrow{\\Delta}2PbO(s)\\xrightarrow{+C,\\Delta}2Pb(l)+CO_2(g)"
      },
      {
        "label": "Zinc blende roasting",
        "latex": "2ZnS+3O_2\\rightarrow 2ZnO+2SO_2"
      },
      {
        "label": "Zinc reduction",
        "latex": "ZnO+C\\xrightarrow{1673K}Zn+CO"
      },
      {
        "label": "Tin reduction",
        "latex": "SnO_2+2C\\rightarrow Sn+2CO"
      },
      {
        "label": "Iron removal from tin",
        "latex": "2Fe+O_2\\rightarrow 2FeO"
      }
    ],
    "variables": [],
    "conditions": [
      "Cassiterite is first concentrated by electromagnetic separation to remove wolframite."
    ],
    "importance": 4,
    "source_page": 72,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-metallurgy-magnesium-gold-silver-extraction",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnesium, Gold and Silver Extraction",
    "card_type": "formula",
    "body": "The source gives Dow-process electrolysis for magnesium and MacArthur-Forrest cyanide extraction for gold/silver.",
    "formulas": [
      {
        "latex": "MgCl_2\\rightleftharpoons Mg^{2+}+2Cl^-"
      },
      {
        "latex": "Mg^{2+}+2e^-\\rightarrow Mg"
      },
      {
        "latex": "2Cl^-\\rightarrow Cl_2+2e^-"
      },
      {
        "latex": "4Au/Ag+8CN^-+2H_2O+O_2\\rightarrow 4[Au/Ag(CN)_2]^-+4OH^-"
      },
      {
        "latex": "2[Au/Ag(CN)_2]^-+Zn\\rightarrow 2Au/Ag+[Zn(CN)_4]^{2-}"
      }
    ],
    "variables": [],
    "conditions": [
      "Detailed argentite cyanide sequence remains available in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 72,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-metallurgy-physical-refining",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed use"
      ],
      "rows": [
        [
          "Liquation",
          "Used when metal is easily fusible but impurities are not; examples Sn, Zn and removal of Pb from Zn-Ag alloy."
        ],
        [
          "Fractional distillation",
          "Used when metal is volatile and impurities are non-volatile or vice versa; examples Zn, Cd, Hg."
        ],
        [
          "Zone refining",
          "Used for very high purity; examples pure Si and Ge semiconductors."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-zone-refining"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Physical Refining Methods",
    "card_type": "mixed",
    "body": "The source groups liquation, fractional distillation and zone refining under physical refining methods.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 73,
    "sort_order": 13
  },
  {
    "id": "neet-chemistry-metallurgy-chemical-refining",
    "chapter_id": "neet-chemistry-metallurgy",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed examples"
      ],
      "rows": [
        [
          "Oxidative refining",
          "Pb, Ag, Cu and Fe."
        ],
        [
          "Poling",
          "Copper and tin containing own oxides."
        ],
        [
          "Electrolytic refining",
          "Cu, Ni and Al."
        ],
        [
          "Vapour-phase refining",
          "Mond process and Van Arkel-De Boer process."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-electrolytic-refining"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Chemical Refining Methods",
    "card_type": "mixed",
    "body": "The source lists oxidative refining, poling, electrolytic refining and vapour-phase refining.",
    "formulas": [
      {
        "latex": "4CuO+CH_4\\rightarrow 4Cu+CO_2+2H_2O"
      },
      {
        "latex": "Ni+4CO\\xrightarrow{50^\\circ C}[Ni(CO)_4]"
      },
      {
        "latex": "[Ni(CO)_4]\\xrightarrow{200^\\circ C}Ni+4CO"
      },
      {
        "latex": "Ti+2I_2\\xrightarrow{50-250^\\circ C}TiI_4\\xrightarrow{1400^\\circ C}Ti+2I_2"
      }
    ],
    "variables": [],
    "conditions": [
      "Poling is used for purification of copper or tin containing its own oxide.",
      "Mond process is shown for nickel; Van Arkel-De Boer process is shown for titanium."
    ],
    "importance": 5,
    "source_page": 73,
    "sort_order": 14
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
  coalesce(formulas, '[]'::jsonb),
  coalesce(variables, '[]'::jsonb),
  coalesce(conditions, '[]'::jsonb),
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
