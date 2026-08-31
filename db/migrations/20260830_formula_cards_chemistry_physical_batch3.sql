insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-solution-colligative-properties', 'jee-chemistry', 'Solution & Colligative Properties', 'solution-colligative-properties', 8),
  ('jee-chemistry-solid-state', 'jee-chemistry', 'Solid State', 'solid-state', 9),
  ('jee-chemistry-chemical-kinetics-radioactivity', 'jee-chemistry', 'Chemical Kinetics & Radioactivity', 'chemical-kinetics-radioactivity', 10),
  ('neet-chemistry-solution-colligative-properties', 'neet-chemistry', 'Solution & Colligative Properties', 'solution-colligative-properties', 8),
  ('neet-chemistry-solid-state', 'neet-chemistry', 'Solid State', 'solid-state', 9),
  ('neet-chemistry-chemical-kinetics-radioactivity', 'neet-chemistry', 'Chemical Kinetics & Radioactivity', 'chemical-kinetics-radioactivity', 10)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-solution-colligative-properties-osmotic-pressure",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Osmotic Pressure",
    "card_type": "formula",
    "body": "The solution chapter starts with osmotic pressure and the Van't Hoff osmotic-pressure relation.",
    "formulas": [
      {
        "latex": "\\pi=\\rho gh"
      },
      {
        "latex": "\\pi=CST"
      },
      {
        "latex": "\\pi=CRT=\\frac{n}{V}RT"
      },
      {
        "latex": "C=C_1+C_2+C_3+\\cdots=\\frac{n_1+n_2+n_3+\\cdots}{V}"
      },
      {
        "latex": "\\pi=\\left(\\frac{C_1V_1+C_2V_2}{V_1+V_2}\\right)RT"
      }
    ],
    "variables": [
      {
        "latex": "\\pi",
        "symbol": "$\\pi$",
        "meaning": "osmotic pressure"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "Isotonic solutions have the same osmotic pressure at the same temperature.",
      "If $\\pi_1>\\pi_2$, solution 1 is hypertonic with respect to solution 2."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-vant-hoff-factor",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Van't Hoff Factor",
    "card_type": "formula",
    "body": "The handbook defines $i$ using observed colligative properties, particle counts, molality, and molar mass.",
    "formulas": [
      {
        "latex": "i=\\frac{\\text{observed value of colligative property}}{\\text{theoretical value of colligative property}}"
      },
      {
        "latex": "i=\\frac{\\text{observed no. of particles}}{\\text{theoretical no. of particles}}=\\frac{\\text{observed molality}}{\\text{theoretical molality}}"
      },
      {
        "latex": "i=\\frac{\\text{theoretical molar mass}}{\\text{experimental molar mass}}"
      },
      {
        "latex": "i=\\frac{\\pi_{exp}}{\\pi_{theor}}"
      },
      {
        "latex": "\\pi=iCRT"
      },
      {
        "latex": "\\pi=(i_1C_1+i_2C_2+i_3C_3+\\cdots)RT"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "\\pi",
        "symbol": "$\\pi$",
        "meaning": "osmotic pressure"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "$i>1$ indicates dissociation.",
      "$i<1$ indicates association."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-association-dissociation",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Association and Dissociation",
    "card_type": "formula",
    "body": "The source gives separate $i$ relations for dissociation and association.",
    "formulas": [
      {
        "label": "Dissociation",
        "latex": "i=1+(n-1)\\alpha"
      },
      {
        "latex": "n=x+y"
      },
      {
        "label": "Association",
        "latex": "i=1+\\left(\\frac{1}{n}-1\\right)\\beta"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "\\beta",
        "symbol": "$\\beta$",
        "meaning": "degree of association"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "moles or reaction order depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-raoult-rlvp",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Raoult's Law and RLVP",
    "card_type": "formula",
    "body": "For non-volatile solute, the source relates relative lowering of vapour pressure to mole fraction.",
    "formulas": [
      {
        "latex": "P_{soln}<P"
      },
      {
        "latex": "\\Delta P=P-P_s"
      },
      {
        "latex": "\\text{RLVP}=\\frac{\\Delta P}{P}"
      },
      {
        "latex": "\\frac{P-P_s}{P}=X_{solute}=\\frac{n}{n+N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=\\frac{n}{N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=\\text{molality}\\times\\frac{M}{1000}"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [
      "$M$ is molar mass of solvent in the source relation."
    ],
    "importance": 5,
    "source_page": 23,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-rlvp-with-i",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "RLVP with Abnormal Solute",
    "card_type": "formula",
    "body": "When solute association or dissociation is present, the source multiplies the RLVP relation by $i$.",
    "formulas": [
      {
        "latex": "\\frac{P-P_s}{P_s}=\\frac{in}{N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=i\\times\\text{molality}\\times\\frac{M}{1000}"
      },
      {
        "latex": "p_1=p_1^0X_1"
      },
      {
        "latex": "\\frac{p_1^0-p_1}{p_1^0}=X_2"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 23,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-boiling-freezing",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": {
      "columns": [
        "Property",
        "Formula",
        "Constant relation"
      ],
      "rows": [
        [
          "Elevation in boiling point",
          "$\\Delta T_b=iK_bm$",
          "$K_b=\\frac{RT_b^2}{1000L_{vap}}=\\frac{RT_b^2M}{1000\\Delta H_{vap}}$"
        ],
        [
          "Depression in freezing point",
          "$\\Delta T_f=iK_fm$",
          "$K_f=\\frac{RT_f^2}{1000L_{fusion}}=\\frac{RT_f^2M}{1000\\Delta H_{fusion}}$"
        ],
        [
          "Latent heat relation",
          "$L_{vap}=\\frac{\\Delta H_{vap}}{M}$",
          ""
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Boiling and Freezing Point Shifts",
    "card_type": "table",
    "body": "The handbook gives elevation in boiling point and depression in freezing point in parallel form.",
    "formulas": [],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 24,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-ideal-volatile-mixture",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": {
      "type": "chem-vapour-pressure-ideal"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ideal Volatile Binary Mixture",
    "card_type": "mixed",
    "body": "For ideal binary mixtures, the source combines Raoult's law with Dalton's law and vapour-phase mole fractions.",
    "formulas": [
      {
        "latex": "P_A=X_AP_A^0"
      },
      {
        "latex": "P_B=X_BP_B^0"
      },
      {
        "latex": "P_T=P_A+P_B=X_AP_A^0+X_BP_B^0"
      },
      {
        "latex": "P_A=X_AP_A^0=x_A'P_T"
      },
      {
        "latex": "P_B=x_B'P_T=X_BP_B^0"
      },
      {
        "latex": "\\frac{1}{P_T}=\\frac{x_A'}{P_A^0}+\\frac{x_B'}{P_B^0}"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      }
    ],
    "conditions": [
      "If $P_A^0>P_B^0$, A is more volatile and its boiling point is lower than B."
    ],
    "importance": 5,
    "source_page": 24,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-ideal-nonideal-solutions",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": {
      "type": "chem-raoult-deviations"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ideal and Non-Ideal Solutions",
    "card_type": "mixed",
    "body": "The source contrasts ideal solutions with positive and negative deviations from Raoult's law.",
    "formulas": [
      {
        "label": "Ideal",
        "latex": "\\Delta H_{mix}=0,\\quad \\Delta V_{mix}=0,\\quad \\Delta S_{mix}=+ve,\\quad \\Delta G_{mix}=-ve"
      },
      {
        "label": "Positive deviation",
        "latex": "P_{T,exp}>X_AP_A^0+X_BP_B^0"
      },
      {
        "latex": "\\Delta H_{mix}=+ve,\\quad \\Delta V_{mix}=+ve"
      },
      {
        "label": "Negative deviation",
        "latex": "P_{T,exp}<X_AP_A^0+X_BP_B^0"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      }
    ],
    "conditions": [
      "Ideal solutions obey Raoult's law at all temperatures.",
      "Positive deviation is listed where A-A and B-B attractions are stronger than A-B attraction; negative deviation is listed for stronger A-B attraction."
    ],
    "importance": 5,
    "source_page": 25,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-solution-colligative-properties-immiscible-henry",
    "chapter_id": "jee-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Immiscible Liquids and Henry's Law",
    "card_type": "formula",
    "body": "The source closes this part with immiscible-liquid vapour pressure and Henry's law.",
    "formulas": [
      {
        "label": "Immiscible liquids",
        "latex": "P_{total}=P_A+P_B=P_A^0+P_B^0"
      },
      {
        "latex": "\\frac{P_A^0}{P_B^0}=\\frac{n_A}{n_B}"
      },
      {
        "latex": "\\frac{P_A^0}{P_B^0}=\\frac{W_AM_B}{M_AW_B}"
      },
      {
        "latex": "P_A^0=\\frac{n_ART}{V},\\quad P_B^0=\\frac{n_BRT}{V}"
      },
      {
        "label": "Henry's law",
        "latex": "m\\propto p,\\quad m=kp"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "For immiscible liquids, boiling point of the solution is less than the individual boiling points of both liquids.",
      "$m$ is weight of gas per volume of liquid in the source note."
    ],
    "importance": 4,
    "source_page": 26,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-solid-state-crystal-systems",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "System",
        "Axial relation",
        "Angle relation",
        "Bravais lattices",
        "Example"
      ],
      "rows": [
        [
          "Cubic",
          "$a=b=c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC, FCC",
          "NaCl"
        ],
        [
          "Orthorhombic",
          "$a\\ne b\\ne c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC, end centred, FCC",
          "$S_R$"
        ],
        [
          "Tetragonal",
          "$a=b\\ne c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC",
          "$Sn, ZnO_2$"
        ],
        [
          "Monoclinic",
          "$a\\ne b\\ne c$",
          "$\\alpha=\\gamma=90^\\circ\\ne\\beta$",
          "SC, end centred",
          "$S_M$"
        ],
        [
          "Rhombohedral",
          "$a=b=c$",
          "$\\alpha=\\beta=\\gamma\\ne90^\\circ$",
          "SC",
          "Quartz"
        ],
        [
          "Triclinic",
          "$a\\ne b\\ne c$",
          "$\\alpha\\ne\\beta\\ne\\gamma\\ne90^\\circ$",
          "SC",
          "$H_3BO_3$"
        ],
        [
          "Hexagonal",
          "$a=b\\ne c$",
          "$\\alpha=\\beta=90^\\circ,\\ \\gamma=120^\\circ$",
          "SC",
          "Graphite"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Seven Crystal Systems",
    "card_type": "table",
    "body": "The Solid State chapter begins with lattice parameters, Bravais lattice types, and examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 27,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-solid-state-cubic-cell-comparison",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Cell",
        "Atomic radius",
        "Atoms/unit cell",
        "Coordination no.",
        "Packing efficiency",
        "Voids"
      ],
      "rows": [
        [
          "SC",
          "$r=\\frac{a}{2}$",
          "1",
          "6",
          "52%",
          "None listed"
        ],
        [
          "BCC",
          "$r=\\frac{\\sqrt3a}{4}$",
          "2",
          "8",
          "68%",
          "None listed"
        ],
        [
          "FCC",
          "$r=\\frac{a}{2\\sqrt2}$",
          "4",
          "12",
          "74%",
          "Octahedral voids $=Z=4$; tetrahedral voids $=2Z=8$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cubic-cells"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cubic Unit Cell Comparison",
    "card_type": "mixed",
    "body": "The source compares simple, body-centred, and face-centred cubic cells.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      },
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "number of particles per unit cell"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 27,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-solid-state-nearest-neighbours",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Cell",
        "Nearest",
        "Next 1",
        "Next 2"
      ],
      "rows": [
        [
          "SC",
          "$a$; 6 neighbours",
          "$a\\sqrt2$; 12 neighbours",
          "$a\\sqrt3$; 8 neighbours"
        ],
        [
          "BCC",
          "$2r=\\frac{a\\sqrt3}{2}$; 8 neighbours",
          "$a$; 6 neighbours",
          "$a\\sqrt2$; 12 neighbours"
        ],
        [
          "FCC",
          "$\\frac{a}{\\sqrt2}$; 12 neighbours",
          "$a$; 6 neighbours",
          "$a\\sqrt{\\frac32}$; 24 neighbours"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nearest-Neighbour Distances",
    "card_type": "table",
    "body": "The source lists first, next-first, and next-second neighbour distances for SC, BCC, and FCC.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 28,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-solid-state-unit-cell-density-radius-ratio",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Coordination no.",
        "$r_+/r_-$ range",
        "Geometry"
      ],
      "rows": [
        [
          "3",
          "$0.155-0.225$",
          "Triangular"
        ],
        [
          "4",
          "$0.225-0.414$",
          "Tetrahedral"
        ],
        [
          "6",
          "$0.414-0.732$",
          "Octahedral"
        ],
        [
          "8",
          "$0.732-0.999$",
          "Cubic"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Density and Radius Ratio",
    "card_type": "table",
    "body": "The handbook gives unit-cell density and limiting radius-ratio ranges for ionic crystals.",
    "formulas": [
      {
        "latex": "d=\\frac{Z}{N_A}\\left(\\frac{M}{a^3}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "number of particles per unit cell"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      },
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [
      "$N_A$ is Avogadro's number; $M$ is atomic or molecular mass."
    ],
    "importance": 5,
    "source_page": 29,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-solid-state-ionic-crystal-edge-length",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Structure",
        "Coordination no.",
        "Edge-length relation"
      ],
      "rows": [
        [
          "Rock salt, NaCl",
          "$(6:6)$",
          ""
        ],
        [
          "CsCl",
          "$(8:8)$",
          "$a_{sc}=\\frac{2}{\\sqrt3}(r_+ + r_-)$"
        ],
        [
          "Zinc blende, ZnS",
          "$(4:4)$",
          "$a_{fcc}=\\frac{4}{\\sqrt3}(r_{Zn^{2+}}+r_{S^{2-}})$"
        ],
        [
          "Fluorite, $CaF_2$",
          "$(8:4)$",
          "$a_{fcc}=\\frac{4}{\\sqrt3}(r_{Ca^{2+}}+r_{F^-})$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ionic Crystal Edge Lengths",
    "card_type": "table",
    "body": "The source lists coordination number and edge-length relations for common ionic crystal structures.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 29,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-solid-state-crystal-defects",
    "chapter_id": "jee-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Class",
        "Defect",
        "Source-backed note"
      ],
      "rows": [
        [
          "Stoichiometric",
          "Schottky",
          "Ion pairs missing"
        ],
        [
          "Stoichiometric",
          "Frenkel",
          "Dislocation of ions"
        ],
        [
          "Metal excess",
          "Electron in place of anion",
          "Listed under non-stoichiometric defects"
        ],
        [
          "Metal excess",
          "Extra cation in interstitial site",
          "Listed under non-stoichiometric defects"
        ],
        [
          "Non-metal excess",
          "Extra anion in interstitial site",
          "Marked as not common in the source"
        ],
        [
          "Non-metal excess",
          "Vacant site in place of cation",
          "Listed under non-stoichiometric defects"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crystal Defects",
    "card_type": "table",
    "body": "The source presents point defects as stoichiometric and non-stoichiometric defects.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 30,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-reaction-rate",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-rate-curve"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Rate of Reaction",
    "card_type": "mixed",
    "body": "The source defines reaction rate and shows average and instantaneous rate on a concentration-time graph.",
    "formulas": [
      {
        "latex": "\\text{Rate}=\\frac{\\Delta c}{\\Delta t}=mol\\ lit^{-1}\\ time^{-1}=mol\\ dm^{-3}\\ time^{-1}"
      },
      {
        "latex": "r_{av}=-\\frac{\\Delta [R]}{\\Delta t}=-\\frac{c_2-c_1}{t_2-t_1}"
      },
      {
        "latex": "r_{inst}=\\lim_{t\\to0}\\frac{\\Delta c}{\\Delta t}=\\frac{dc}{dt}=-\\frac{d[R]}{dt}=\\frac{d[P]}{dt}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source labels instantaneous rate as the slope of the concentration-time curve."
    ],
    "importance": 5,
    "source_page": 31,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-rate-law-order",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Rate Law, Rate Constant and Order",
    "card_type": "formula",
    "body": "The rate-law section defines rate constant, order, and units of the rate constant.",
    "formulas": [
      {
        "latex": "\\text{Rate}=K(\\text{conc.})^{order}"
      },
      {
        "latex": "\\text{Unit of }K=(\\text{conc.})^{1-order}\\ time^{-1}"
      },
      {
        "latex": "R\\propto[A]^p[B]^q"
      },
      {
        "latex": "\\text{Overall order}=p+q"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "The source notes $p$ and $q$ may or may not be equal to stoichiometric coefficients."
    ],
    "importance": 5,
    "source_page": 31,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-zero-first-order",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Order",
        "Integrated relation",
        "Unit of $k$",
        "Half-life"
      ],
      "rows": [
        [
          "Zero",
          "$k=\\frac{C_0-C_t}{t}$ or $C_t=C_0-kt$",
          "$mol\\ lit^{-1}\\ sec^{-1}$",
          "$t_{1/2}=\\frac{C_0}{2k}$; $t_{1/2}\\propto C_0$"
        ],
        [
          "First",
          "$t=\\frac{2.303}{k}\\log\\frac{a}{a-x}$; $k=\\frac{2.303}{t}\\log\\frac{C_0}{C_t}$",
          "",
          "$t_{1/2}=\\frac{\\ln2}{k}=\\frac{0.693}{k}$"
        ],
        [
          "First order average life",
          "$t_{avg}=\\frac{1}{k}=1.44t_{1/2}$",
          "",
          ""
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Zero and First Order Reactions",
    "card_type": "table",
    "body": "The source gives integrated relations and half-life formulas for zero and first order reactions.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "$C_0$ or $a$ is initial concentration; $C_t$ or $a-x$ is concentration at time $t$."
    ],
    "importance": 5,
    "source_page": 32,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-first-order-plots",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-first-order-plots"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "First Order Graphs",
    "card_type": "mixed",
    "body": "The handbook shows first-order graphical forms for $t$ against logarithmic concentration terms.",
    "formulas": [
      {
        "latex": "t=-\\frac{2.303}{k}\\log C_t+\\frac{2.303}{k}\\log C_0"
      },
      {
        "latex": "\\tan\\theta=\\frac{2.303}{k}"
      },
      {
        "latex": "\\tan\\theta=-\\frac{2.303}{k}"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 32,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-second-order",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Second Order Relations",
    "card_type": "formula",
    "body": "The source includes two second-order forms: $A+A$ and $A+B$.",
    "formulas": [
      {
        "label": "$A+A$",
        "latex": "\\frac{dx}{dt}=k(a-x)^2"
      },
      {
        "latex": "\\frac{1}{a-x}-\\frac{1}{a}=kt"
      },
      {
        "label": "$A+B$",
        "latex": "\\frac{dx}{dt}=k(a-x)(b-x)"
      },
      {
        "latex": "k=\\frac{2.303}{t(a-b)}\\log\\frac{b(a-x)}{a(b-x)}"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 32,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-order-methods",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Initial rate",
          "$r=k[A]^a[B]^b[C]^c$"
        ],
        [
          "Initial rate with $B,C$ constant",
          "$\\frac{r_{01}}{r_{02}}=\\left(\\frac{[A_0]_1}{[A_0]_2}\\right)^a$"
        ],
        [
          "Integrated rate law",
          "Method of trial and error"
        ],
        [
          "Half-life for nth order",
          "$t_{1/2}\\propto\\frac{1}{[R_0]^{n-1}}$"
        ],
        [
          "Ostwald isolation",
          "$rate=k[A]^a[B]^b[C]^c=k_0[A]^a$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Methods to Determine Order",
    "card_type": "table",
    "body": "The source lists initial-rate, integrated-rate, half-life, and isolation methods.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 33,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-monitoring-progress",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Method",
        "Formula"
      ],
      "rows": [
        [
          "Pressure/volume for gaseous reaction",
          "$k=\\frac{2.303}{t}\\log\\frac{P_0(n-1)}{nP_0-P_t}$"
        ],
        [
          "Titration",
          "$a\\propto V_0,\\quad a-x\\propto V_t,\\quad k=\\frac{2.303}{t}\\log\\frac{V_0}{V_t}$"
        ],
        [
          "Ester hydrolysis",
          "$k=\\frac{2.303}{t}\\log\\frac{V_\\infty-V_0}{V_\\infty-V_t}$"
        ],
        [
          "Optical rotation",
          "$k=\\frac{2.303}{t}\\log\\frac{\\theta_0-\\theta_\\infty}{\\theta_t-\\theta_\\infty}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Monitoring Reaction Progress",
    "card_type": "table",
    "body": "The source gives formulas for following reaction progress using pressure, titration, and optical rotation.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "The gaseous-reaction formula is noted as not applicable when $n=1$."
    ],
    "importance": 4,
    "source_page": 33,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-arrhenius-activation",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Arrhenius Activation Energy",
    "card_type": "formula",
    "body": "The Arrhenius theory page defines threshold energy, activation energy, and enthalpy change.",
    "formulas": [
      {
        "latex": "\\Delta H=E_P-E_r"
      },
      {
        "latex": "\\Delta H=E_{af}-E_{ab}"
      },
      {
        "latex": "E_{threshold}=E_{af}+E_r=E_b+E_p"
      }
    ],
    "variables": [
      {
        "latex": "E_a",
        "symbol": "$E_a$",
        "meaning": "activation energy"
      }
    ],
    "conditions": [
      "$E_P>E_r$ is labelled endothermic; $E_P<E_r$ is labelled exothermic."
    ],
    "importance": 4,
    "source_page": 34,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-chemical-kinetics-radioactivity-arrhenius-equations",
    "chapter_id": "jee-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-arrhenius-plot"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Arrhenius Equations",
    "card_type": "mixed",
    "body": "The source gives the exponential Arrhenius equation, differential relation, straight-line form, and two-temperature relation.",
    "formulas": [
      {
        "latex": "k=Ae^{-E_a/RT}"
      },
      {
        "latex": "\\frac{d\\ln k}{dT}=\\frac{E_a}{RT^2}"
      },
      {
        "latex": "\\log k=\\left(\\frac{-E_a}{2.303R}\\right)\\frac{1}{T}+\\log A"
      },
      {
        "latex": "\\ln k=\\ln A-\\frac{E_a}{RT}"
      },
      {
        "latex": "\\log\\frac{k_2}{k_1}=\\frac{E_a}{2.303R}\\left(\\frac{1}{T_1}-\\frac{1}{T_2}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      },
      {
        "latex": "E_a",
        "symbol": "$E_a$",
        "meaning": "activation energy"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "The source notes $E_a\\ge0$ and as $T\\to\\infty$, $K\\to A$."
    ],
    "importance": 5,
    "source_page": 34,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-osmotic-pressure",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Osmotic Pressure",
    "card_type": "formula",
    "body": "The solution chapter starts with osmotic pressure and the Van't Hoff osmotic-pressure relation.",
    "formulas": [
      {
        "latex": "\\pi=\\rho gh"
      },
      {
        "latex": "\\pi=CST"
      },
      {
        "latex": "\\pi=CRT=\\frac{n}{V}RT"
      },
      {
        "latex": "C=C_1+C_2+C_3+\\cdots=\\frac{n_1+n_2+n_3+\\cdots}{V}"
      },
      {
        "latex": "\\pi=\\left(\\frac{C_1V_1+C_2V_2}{V_1+V_2}\\right)RT"
      }
    ],
    "variables": [
      {
        "latex": "\\pi",
        "symbol": "$\\pi$",
        "meaning": "osmotic pressure"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "Isotonic solutions have the same osmotic pressure at the same temperature.",
      "If $\\pi_1>\\pi_2$, solution 1 is hypertonic with respect to solution 2."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-vant-hoff-factor",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Van't Hoff Factor",
    "card_type": "formula",
    "body": "The handbook defines $i$ using observed colligative properties, particle counts, molality, and molar mass.",
    "formulas": [
      {
        "latex": "i=\\frac{\\text{observed value of colligative property}}{\\text{theoretical value of colligative property}}"
      },
      {
        "latex": "i=\\frac{\\text{observed no. of particles}}{\\text{theoretical no. of particles}}=\\frac{\\text{observed molality}}{\\text{theoretical molality}}"
      },
      {
        "latex": "i=\\frac{\\text{theoretical molar mass}}{\\text{experimental molar mass}}"
      },
      {
        "latex": "i=\\frac{\\pi_{exp}}{\\pi_{theor}}"
      },
      {
        "latex": "\\pi=iCRT"
      },
      {
        "latex": "\\pi=(i_1C_1+i_2C_2+i_3C_3+\\cdots)RT"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "\\pi",
        "symbol": "$\\pi$",
        "meaning": "osmotic pressure"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "$i>1$ indicates dissociation.",
      "$i<1$ indicates association."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-association-dissociation",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Association and Dissociation",
    "card_type": "formula",
    "body": "The source gives separate $i$ relations for dissociation and association.",
    "formulas": [
      {
        "label": "Dissociation",
        "latex": "i=1+(n-1)\\alpha"
      },
      {
        "latex": "n=x+y"
      },
      {
        "label": "Association",
        "latex": "i=1+\\left(\\frac{1}{n}-1\\right)\\beta"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "\\beta",
        "symbol": "$\\beta$",
        "meaning": "degree of association"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "moles or reaction order depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-raoult-rlvp",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Raoult's Law and RLVP",
    "card_type": "formula",
    "body": "For non-volatile solute, the source relates relative lowering of vapour pressure to mole fraction.",
    "formulas": [
      {
        "latex": "P_{soln}<P"
      },
      {
        "latex": "\\Delta P=P-P_s"
      },
      {
        "latex": "\\text{RLVP}=\\frac{\\Delta P}{P}"
      },
      {
        "latex": "\\frac{P-P_s}{P}=X_{solute}=\\frac{n}{n+N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=\\frac{n}{N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=\\text{molality}\\times\\frac{M}{1000}"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [
      "$M$ is molar mass of solvent in the source relation."
    ],
    "importance": 5,
    "source_page": 23,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-rlvp-with-i",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "RLVP with Abnormal Solute",
    "card_type": "formula",
    "body": "When solute association or dissociation is present, the source multiplies the RLVP relation by $i$.",
    "formulas": [
      {
        "latex": "\\frac{P-P_s}{P_s}=\\frac{in}{N}"
      },
      {
        "latex": "\\frac{P-P_s}{P_s}=i\\times\\text{molality}\\times\\frac{M}{1000}"
      },
      {
        "latex": "p_1=p_1^0X_1"
      },
      {
        "latex": "\\frac{p_1^0-p_1}{p_1^0}=X_2"
      }
    ],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 23,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-boiling-freezing",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": {
      "columns": [
        "Property",
        "Formula",
        "Constant relation"
      ],
      "rows": [
        [
          "Elevation in boiling point",
          "$\\Delta T_b=iK_bm$",
          "$K_b=\\frac{RT_b^2}{1000L_{vap}}=\\frac{RT_b^2M}{1000\\Delta H_{vap}}$"
        ],
        [
          "Depression in freezing point",
          "$\\Delta T_f=iK_fm$",
          "$K_f=\\frac{RT_f^2}{1000L_{fusion}}=\\frac{RT_f^2M}{1000\\Delta H_{fusion}}$"
        ],
        [
          "Latent heat relation",
          "$L_{vap}=\\frac{\\Delta H_{vap}}{M}$",
          ""
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Boiling and Freezing Point Shifts",
    "card_type": "table",
    "body": "The handbook gives elevation in boiling point and depression in freezing point in parallel form.",
    "formulas": [],
    "variables": [
      {
        "latex": "i",
        "symbol": "$i$",
        "meaning": "van't Hoff factor"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 24,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-ideal-volatile-mixture",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": {
      "type": "chem-vapour-pressure-ideal"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ideal Volatile Binary Mixture",
    "card_type": "mixed",
    "body": "For ideal binary mixtures, the source combines Raoult's law with Dalton's law and vapour-phase mole fractions.",
    "formulas": [
      {
        "latex": "P_A=X_AP_A^0"
      },
      {
        "latex": "P_B=X_BP_B^0"
      },
      {
        "latex": "P_T=P_A+P_B=X_AP_A^0+X_BP_B^0"
      },
      {
        "latex": "P_A=X_AP_A^0=x_A'P_T"
      },
      {
        "latex": "P_B=x_B'P_T=X_BP_B^0"
      },
      {
        "latex": "\\frac{1}{P_T}=\\frac{x_A'}{P_A^0}+\\frac{x_B'}{P_B^0}"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "mole fraction"
      }
    ],
    "conditions": [
      "If $P_A^0>P_B^0$, A is more volatile and its boiling point is lower than B."
    ],
    "importance": 5,
    "source_page": 24,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-ideal-nonideal-solutions",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": {
      "type": "chem-raoult-deviations"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ideal and Non-Ideal Solutions",
    "card_type": "mixed",
    "body": "The source contrasts ideal solutions with positive and negative deviations from Raoult's law.",
    "formulas": [
      {
        "label": "Ideal",
        "latex": "\\Delta H_{mix}=0,\\quad \\Delta V_{mix}=0,\\quad \\Delta S_{mix}=+ve,\\quad \\Delta G_{mix}=-ve"
      },
      {
        "label": "Positive deviation",
        "latex": "P_{T,exp}>X_AP_A^0+X_BP_B^0"
      },
      {
        "latex": "\\Delta H_{mix}=+ve,\\quad \\Delta V_{mix}=+ve"
      },
      {
        "label": "Negative deviation",
        "latex": "P_{T,exp}<X_AP_A^0+X_BP_B^0"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      }
    ],
    "conditions": [
      "Ideal solutions obey Raoult's law at all temperatures.",
      "Positive deviation is listed where A-A and B-B attractions are stronger than A-B attraction; negative deviation is listed for stronger A-B attraction."
    ],
    "importance": 5,
    "source_page": 25,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-solution-colligative-properties-immiscible-henry",
    "chapter_id": "neet-chemistry-solution-colligative-properties",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Immiscible Liquids and Henry's Law",
    "card_type": "formula",
    "body": "The source closes this part with immiscible-liquid vapour pressure and Henry's law.",
    "formulas": [
      {
        "label": "Immiscible liquids",
        "latex": "P_{total}=P_A+P_B=P_A^0+P_B^0"
      },
      {
        "latex": "\\frac{P_A^0}{P_B^0}=\\frac{n_A}{n_B}"
      },
      {
        "latex": "\\frac{P_A^0}{P_B^0}=\\frac{W_AM_B}{M_AW_B}"
      },
      {
        "latex": "P_A^0=\\frac{n_ART}{V},\\quad P_B^0=\\frac{n_BRT}{V}"
      },
      {
        "label": "Henry's law",
        "latex": "m\\propto p,\\quad m=kp"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "pressure or vapour pressure depending on context"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "For immiscible liquids, boiling point of the solution is less than the individual boiling points of both liquids.",
      "$m$ is weight of gas per volume of liquid in the source note."
    ],
    "importance": 4,
    "source_page": 26,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-solid-state-crystal-systems",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "System",
        "Axial relation",
        "Angle relation",
        "Bravais lattices",
        "Example"
      ],
      "rows": [
        [
          "Cubic",
          "$a=b=c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC, FCC",
          "NaCl"
        ],
        [
          "Orthorhombic",
          "$a\\ne b\\ne c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC, end centred, FCC",
          "$S_R$"
        ],
        [
          "Tetragonal",
          "$a=b\\ne c$",
          "$\\alpha=\\beta=\\gamma=90^\\circ$",
          "SC, BCC",
          "$Sn, ZnO_2$"
        ],
        [
          "Monoclinic",
          "$a\\ne b\\ne c$",
          "$\\alpha=\\gamma=90^\\circ\\ne\\beta$",
          "SC, end centred",
          "$S_M$"
        ],
        [
          "Rhombohedral",
          "$a=b=c$",
          "$\\alpha=\\beta=\\gamma\\ne90^\\circ$",
          "SC",
          "Quartz"
        ],
        [
          "Triclinic",
          "$a\\ne b\\ne c$",
          "$\\alpha\\ne\\beta\\ne\\gamma\\ne90^\\circ$",
          "SC",
          "$H_3BO_3$"
        ],
        [
          "Hexagonal",
          "$a=b\\ne c$",
          "$\\alpha=\\beta=90^\\circ,\\ \\gamma=120^\\circ$",
          "SC",
          "Graphite"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Seven Crystal Systems",
    "card_type": "table",
    "body": "The Solid State chapter begins with lattice parameters, Bravais lattice types, and examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 27,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-solid-state-cubic-cell-comparison",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Cell",
        "Atomic radius",
        "Atoms/unit cell",
        "Coordination no.",
        "Packing efficiency",
        "Voids"
      ],
      "rows": [
        [
          "SC",
          "$r=\\frac{a}{2}$",
          "1",
          "6",
          "52%",
          "None listed"
        ],
        [
          "BCC",
          "$r=\\frac{\\sqrt3a}{4}$",
          "2",
          "8",
          "68%",
          "None listed"
        ],
        [
          "FCC",
          "$r=\\frac{a}{2\\sqrt2}$",
          "4",
          "12",
          "74%",
          "Octahedral voids $=Z=4$; tetrahedral voids $=2Z=8$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cubic-cells"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cubic Unit Cell Comparison",
    "card_type": "mixed",
    "body": "The source compares simple, body-centred, and face-centred cubic cells.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      },
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "number of particles per unit cell"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 27,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-solid-state-nearest-neighbours",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Cell",
        "Nearest",
        "Next 1",
        "Next 2"
      ],
      "rows": [
        [
          "SC",
          "$a$; 6 neighbours",
          "$a\\sqrt2$; 12 neighbours",
          "$a\\sqrt3$; 8 neighbours"
        ],
        [
          "BCC",
          "$2r=\\frac{a\\sqrt3}{2}$; 8 neighbours",
          "$a$; 6 neighbours",
          "$a\\sqrt2$; 12 neighbours"
        ],
        [
          "FCC",
          "$\\frac{a}{\\sqrt2}$; 12 neighbours",
          "$a$; 6 neighbours",
          "$a\\sqrt{\\frac32}$; 24 neighbours"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nearest-Neighbour Distances",
    "card_type": "table",
    "body": "The source lists first, next-first, and next-second neighbour distances for SC, BCC, and FCC.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 28,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-solid-state-unit-cell-density-radius-ratio",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Coordination no.",
        "$r_+/r_-$ range",
        "Geometry"
      ],
      "rows": [
        [
          "3",
          "$0.155-0.225$",
          "Triangular"
        ],
        [
          "4",
          "$0.225-0.414$",
          "Tetrahedral"
        ],
        [
          "6",
          "$0.414-0.732$",
          "Octahedral"
        ],
        [
          "8",
          "$0.732-0.999$",
          "Cubic"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Density and Radius Ratio",
    "card_type": "table",
    "body": "The handbook gives unit-cell density and limiting radius-ratio ranges for ionic crystals.",
    "formulas": [
      {
        "latex": "d=\\frac{Z}{N_A}\\left(\\frac{M}{a^3}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "Z",
        "symbol": "$Z$",
        "meaning": "number of particles per unit cell"
      },
      {
        "latex": "M",
        "symbol": "$M$",
        "meaning": "molar mass"
      },
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [
      "$N_A$ is Avogadro's number; $M$ is atomic or molecular mass."
    ],
    "importance": 5,
    "source_page": 29,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-solid-state-ionic-crystal-edge-length",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Structure",
        "Coordination no.",
        "Edge-length relation"
      ],
      "rows": [
        [
          "Rock salt, NaCl",
          "$(6:6)$",
          ""
        ],
        [
          "CsCl",
          "$(8:8)$",
          "$a_{sc}=\\frac{2}{\\sqrt3}(r_+ + r_-)$"
        ],
        [
          "Zinc blende, ZnS",
          "$(4:4)$",
          "$a_{fcc}=\\frac{4}{\\sqrt3}(r_{Zn^{2+}}+r_{S^{2-}})$"
        ],
        [
          "Fluorite, $CaF_2$",
          "$(8:4)$",
          "$a_{fcc}=\\frac{4}{\\sqrt3}(r_{Ca^{2+}}+r_{F^-})$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ionic Crystal Edge Lengths",
    "card_type": "table",
    "body": "The source lists coordination number and edge-length relations for common ionic crystal structures.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "edge length or initial concentration depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 29,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-solid-state-crystal-defects",
    "chapter_id": "neet-chemistry-solid-state",
    "table_data": {
      "columns": [
        "Class",
        "Defect",
        "Source-backed note"
      ],
      "rows": [
        [
          "Stoichiometric",
          "Schottky",
          "Ion pairs missing"
        ],
        [
          "Stoichiometric",
          "Frenkel",
          "Dislocation of ions"
        ],
        [
          "Metal excess",
          "Electron in place of anion",
          "Listed under non-stoichiometric defects"
        ],
        [
          "Metal excess",
          "Extra cation in interstitial site",
          "Listed under non-stoichiometric defects"
        ],
        [
          "Non-metal excess",
          "Extra anion in interstitial site",
          "Marked as not common in the source"
        ],
        [
          "Non-metal excess",
          "Vacant site in place of cation",
          "Listed under non-stoichiometric defects"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Crystal Defects",
    "card_type": "table",
    "body": "The source presents point defects as stoichiometric and non-stoichiometric defects.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 30,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-reaction-rate",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-rate-curve"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Rate of Reaction",
    "card_type": "mixed",
    "body": "The source defines reaction rate and shows average and instantaneous rate on a concentration-time graph.",
    "formulas": [
      {
        "latex": "\\text{Rate}=\\frac{\\Delta c}{\\Delta t}=mol\\ lit^{-1}\\ time^{-1}=mol\\ dm^{-3}\\ time^{-1}"
      },
      {
        "latex": "r_{av}=-\\frac{\\Delta [R]}{\\Delta t}=-\\frac{c_2-c_1}{t_2-t_1}"
      },
      {
        "latex": "r_{inst}=\\lim_{t\\to0}\\frac{\\Delta c}{\\Delta t}=\\frac{dc}{dt}=-\\frac{d[R]}{dt}=\\frac{d[P]}{dt}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source labels instantaneous rate as the slope of the concentration-time curve."
    ],
    "importance": 5,
    "source_page": 31,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-rate-law-order",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Rate Law, Rate Constant and Order",
    "card_type": "formula",
    "body": "The rate-law section defines rate constant, order, and units of the rate constant.",
    "formulas": [
      {
        "latex": "\\text{Rate}=K(\\text{conc.})^{order}"
      },
      {
        "latex": "\\text{Unit of }K=(\\text{conc.})^{1-order}\\ time^{-1}"
      },
      {
        "latex": "R\\propto[A]^p[B]^q"
      },
      {
        "latex": "\\text{Overall order}=p+q"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "The source notes $p$ and $q$ may or may not be equal to stoichiometric coefficients."
    ],
    "importance": 5,
    "source_page": 31,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-zero-first-order",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Order",
        "Integrated relation",
        "Unit of $k$",
        "Half-life"
      ],
      "rows": [
        [
          "Zero",
          "$k=\\frac{C_0-C_t}{t}$ or $C_t=C_0-kt$",
          "$mol\\ lit^{-1}\\ sec^{-1}$",
          "$t_{1/2}=\\frac{C_0}{2k}$; $t_{1/2}\\propto C_0$"
        ],
        [
          "First",
          "$t=\\frac{2.303}{k}\\log\\frac{a}{a-x}$; $k=\\frac{2.303}{t}\\log\\frac{C_0}{C_t}$",
          "",
          "$t_{1/2}=\\frac{\\ln2}{k}=\\frac{0.693}{k}$"
        ],
        [
          "First order average life",
          "$t_{avg}=\\frac{1}{k}=1.44t_{1/2}$",
          "",
          ""
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Zero and First Order Reactions",
    "card_type": "table",
    "body": "The source gives integrated relations and half-life formulas for zero and first order reactions.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "$C_0$ or $a$ is initial concentration; $C_t$ or $a-x$ is concentration at time $t$."
    ],
    "importance": 5,
    "source_page": 32,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-first-order-plots",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-first-order-plots"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "First Order Graphs",
    "card_type": "mixed",
    "body": "The handbook shows first-order graphical forms for $t$ against logarithmic concentration terms.",
    "formulas": [
      {
        "latex": "t=-\\frac{2.303}{k}\\log C_t+\\frac{2.303}{k}\\log C_0"
      },
      {
        "latex": "\\tan\\theta=\\frac{2.303}{k}"
      },
      {
        "latex": "\\tan\\theta=-\\frac{2.303}{k}"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 32,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-second-order",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Second Order Relations",
    "card_type": "formula",
    "body": "The source includes two second-order forms: $A+A$ and $A+B$.",
    "formulas": [
      {
        "label": "$A+A$",
        "latex": "\\frac{dx}{dt}=k(a-x)^2"
      },
      {
        "latex": "\\frac{1}{a-x}-\\frac{1}{a}=kt"
      },
      {
        "label": "$A+B$",
        "latex": "\\frac{dx}{dt}=k(a-x)(b-x)"
      },
      {
        "latex": "k=\\frac{2.303}{t(a-b)}\\log\\frac{b(a-x)}{a(b-x)}"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 32,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-order-methods",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Method",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Initial rate",
          "$r=k[A]^a[B]^b[C]^c$"
        ],
        [
          "Initial rate with $B,C$ constant",
          "$\\frac{r_{01}}{r_{02}}=\\left(\\frac{[A_0]_1}{[A_0]_2}\\right)^a$"
        ],
        [
          "Integrated rate law",
          "Method of trial and error"
        ],
        [
          "Half-life for nth order",
          "$t_{1/2}\\propto\\frac{1}{[R_0]^{n-1}}$"
        ],
        [
          "Ostwald isolation",
          "$rate=k[A]^a[B]^b[C]^c=k_0[A]^a$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Methods to Determine Order",
    "card_type": "table",
    "body": "The source lists initial-rate, integrated-rate, half-life, and isolation methods.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 33,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-monitoring-progress",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": {
      "columns": [
        "Method",
        "Formula"
      ],
      "rows": [
        [
          "Pressure/volume for gaseous reaction",
          "$k=\\frac{2.303}{t}\\log\\frac{P_0(n-1)}{nP_0-P_t}$"
        ],
        [
          "Titration",
          "$a\\propto V_0,\\quad a-x\\propto V_t,\\quad k=\\frac{2.303}{t}\\log\\frac{V_0}{V_t}$"
        ],
        [
          "Ester hydrolysis",
          "$k=\\frac{2.303}{t}\\log\\frac{V_\\infty-V_0}{V_\\infty-V_t}$"
        ],
        [
          "Optical rotation",
          "$k=\\frac{2.303}{t}\\log\\frac{\\theta_0-\\theta_\\infty}{\\theta_t-\\theta_\\infty}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Monitoring Reaction Progress",
    "card_type": "table",
    "body": "The source gives formulas for following reaction progress using pressure, titration, and optical rotation.",
    "formulas": [],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      }
    ],
    "conditions": [
      "The gaseous-reaction formula is noted as not applicable when $n=1$."
    ],
    "importance": 4,
    "source_page": 33,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-arrhenius-activation",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Arrhenius Activation Energy",
    "card_type": "formula",
    "body": "The Arrhenius theory page defines threshold energy, activation energy, and enthalpy change.",
    "formulas": [
      {
        "latex": "\\Delta H=E_P-E_r"
      },
      {
        "latex": "\\Delta H=E_{af}-E_{ab}"
      },
      {
        "latex": "E_{threshold}=E_{af}+E_r=E_b+E_p"
      }
    ],
    "variables": [
      {
        "latex": "E_a",
        "symbol": "$E_a$",
        "meaning": "activation energy"
      }
    ],
    "conditions": [
      "$E_P>E_r$ is labelled endothermic; $E_P<E_r$ is labelled exothermic."
    ],
    "importance": 4,
    "source_page": 34,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-chemical-kinetics-radioactivity-arrhenius-equations",
    "chapter_id": "neet-chemistry-chemical-kinetics-radioactivity",
    "table_data": null,
    "diagram_data": {
      "type": "chem-arrhenius-plot"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Arrhenius Equations",
    "card_type": "mixed",
    "body": "The source gives the exponential Arrhenius equation, differential relation, straight-line form, and two-temperature relation.",
    "formulas": [
      {
        "latex": "k=Ae^{-E_a/RT}"
      },
      {
        "latex": "\\frac{d\\ln k}{dT}=\\frac{E_a}{RT^2}"
      },
      {
        "latex": "\\log k=\\left(\\frac{-E_a}{2.303R}\\right)\\frac{1}{T}+\\log A"
      },
      {
        "latex": "\\ln k=\\ln A-\\frac{E_a}{RT}"
      },
      {
        "latex": "\\log\\frac{k_2}{k_1}=\\frac{E_a}{2.303R}\\left(\\frac{1}{T_1}-\\frac{1}{T_2}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "rate constant"
      },
      {
        "latex": "E_a",
        "symbol": "$E_a$",
        "meaning": "activation energy"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      }
    ],
    "conditions": [
      "The source notes $E_a\\ge0$ and as $T\\to\\infty$, $K\\to A$."
    ],
    "importance": 5,
    "source_page": 34,
    "sort_order": 9
  }
]$$::jsonb) as x(
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
