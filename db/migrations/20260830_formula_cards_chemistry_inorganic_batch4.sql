insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-d-block-elements-compounds', 'jee-chemistry', 'd-Block Elements & their compounds', 'd-block-elements-compounds', 17),
  ('jee-chemistry-qualitative-analysis', 'jee-chemistry', 'Qualitative Analysis', 'qualitative-analysis', 18),
  ('neet-chemistry-d-block-elements-compounds', 'neet-chemistry', 'd-Block Elements & their compounds', 'd-block-elements-compounds', 17),
  ('neet-chemistry-qualitative-analysis', 'neet-chemistry', 'Qualitative Analysis', 'qualitative-analysis', 18)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-d-block-elements-compounds-configuration-metallic-trends",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed point"
      ],
      "rows": [
        [
          "Metallic character",
          "Nearly all display high tensile strength, ductility, malleability, conductivity and metallic lustre."
        ],
        [
          "Metallic structures",
          "With exceptions of Zn, Cd, Hg and Mn, they have one or more typical metallic structures at normal temperatures."
        ],
        [
          "Hardness/volatility",
          "Except Zn, Cd and Hg, transition elements are very hard and have low volatility."
        ],
        [
          "Melting/boiling",
          "Melting and boiling points are generally very high."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "d-Block Configuration and Metallic Trends",
    "card_type": "table",
    "body": "The source begins d-block with the general electronic configuration and metallic properties of transition elements.",
    "formulas": [
      {
        "latex": "(n-1)d^{1-10}ns^{0-2}"
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "outermost shell"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 96,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-density-oxidation-state-reason",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Density and Variable Oxidation States",
    "card_type": "concept",
    "body": "The source links density to low atomic volume and variable oxidation states to close ns and d-subshell energies.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Atomic volumes are low compared with groups 1 and 2; increased nuclear charge is poorly screened, so transition metals are high-density.",
      "Most transition elements show variable oxidation states.",
      "Variable oxidation states arise because inner $(n-1)d$ electrons participate along with outer ns electrons."
    ],
    "importance": 5,
    "source_page": 97,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-first-series-oxidation-states",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Element",
        "Outer electronic configuration",
        "Oxidation states"
      ],
      "rows": [
        [
          "Sc",
          "$3d^14s^2$",
          "+3"
        ],
        [
          "Ti",
          "$3d^24s^2$",
          "+2, +3, +4"
        ],
        [
          "V",
          "$3d^34s^2$",
          "+2, +3, +4, +5"
        ],
        [
          "Cr",
          "$3d^54s^1$",
          "+2, +3, (+4), (+5), +6"
        ],
        [
          "Mn",
          "$3d^54s^2$",
          "+2, +3, +4, (+5), +6, +7"
        ],
        [
          "Fe",
          "$3d^64s^2$",
          "+2, +3, (+4), (+5), (+6)"
        ],
        [
          "Co",
          "$3d^74s^2$",
          "+2, +3, (+4)"
        ],
        [
          "Ni",
          "$3d^84s^2$",
          "+2, +3, +4"
        ],
        [
          "Cu",
          "$3d^{10}4s^1$",
          "+1, +2"
        ],
        [
          "Zn",
          "$3d^{10}4s^2$",
          "+2"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "First Transition Series Oxidation States",
    "card_type": "table",
    "body": "The handbook lists outer electronic configurations and oxidation states for Sc to Zn.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Parentheses are preserved from the source table."
    ],
    "importance": 5,
    "source_page": 97,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-vanadium-chromium-colours",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Element/state",
        "Oxide/hydroxide behavior",
        "Ion",
        "Colour"
      ],
      "rows": [
        [
          "V +2",
          "$VO$, basic",
          "$V^{2+}$",
          "violet"
        ],
        [
          "V +3",
          "$V_2O_5$, basic",
          "$V^{3+}$",
          "green"
        ],
        [
          "V +4",
          "$VO_2$, amphoteric",
          "$VO^{2+}$",
          "blue"
        ],
        [
          "V +5",
          "$V_2O_5$, amphoteric",
          "$VO_2^+$ / $VO_4^{3-}$",
          "yellow / colourless"
        ],
        [
          "Cr +2",
          "$CrO$, $Cr(OH)_2$, basic",
          "$Cr^{2+}$",
          "light blue"
        ],
        [
          "Cr +3",
          "$Cr_2O_3$, $Cr(OH)_3$, amphoteric",
          "$Cr^{3+}$ / $Cr(OH)_4^-$",
          "violet / green"
        ],
        [
          "Cr +6",
          "$CrO_3$, $CrO_2(OH)_2$, $H_2Cr_2O_7$, acidic",
          "$CrO_4^{2-}$ / $Cr_2O_7^{2-}$",
          "yellow / orange"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Vanadium and Chromium Ion Colours",
    "card_type": "table",
    "body": "The visible source table gives oxide/hydroxide behavior, ion names and colours for vanadium and chromium states.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The complete large table is retained in the PDF fallback; this card keeps the clearly readable entries."
    ],
    "importance": 5,
    "source_page": 98,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-electrode-potential-stability",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrode Potentials and Oxidation-State Stability",
    "card_type": "formula",
    "body": "The source explains aqueous oxidation-state stability using total energy change and electrode potential data.",
    "formulas": [
      {
        "latex": "\\Delta H=\\Delta_{sub}H^\\Theta+IE+\\Delta_{hyd}H"
      }
    ],
    "variables": [],
    "conditions": [
      "Smaller ionisation enthalpy gives information for greater thermodynamic stability of compounds.",
      "Smaller total energy change for an oxidation state gives greater stability in aqueous solution.",
      "Lower, more negative standard reduction potential means a more stable oxidation state in aqueous solution."
    ],
    "importance": 4,
    "source_page": 98,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-first-row-thermochemical-data",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "M",
        "$\\Delta_aH_q$",
        "$\\Delta_fH_1^\\theta$",
        "$\\Delta_1H_2^\\theta$",
        "$\\Delta_{hyd}H^\\theta(M^{2+})$",
        "$E^\\theta/V$"
      ],
      "rows": [
        [
          "Ti",
          "469",
          "661",
          "1310",
          "-1866",
          "-1.63"
        ],
        [
          "V",
          "515",
          "648",
          "1370",
          "-1895",
          "-1.18"
        ],
        [
          "Cr",
          "398",
          "653",
          "1590",
          "-1925",
          "-0.90"
        ],
        [
          "Mn",
          "279",
          "716",
          "1510",
          "-1862",
          "-1.18"
        ],
        [
          "Fe",
          "418",
          "762",
          "1560",
          "-1998",
          "-0.44"
        ],
        [
          "Co",
          "427",
          "757",
          "1640",
          "-2079",
          "-0.28"
        ],
        [
          "Ni",
          "431",
          "736",
          "1750",
          "-2121",
          "-0.25"
        ],
        [
          "Cu",
          "339",
          "745",
          "1960",
          "-2121",
          "0.34"
        ],
        [
          "Zn",
          "130",
          "908",
          "1730",
          "-2059",
          "-0.76"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "First-Row Thermochemical Data",
    "card_type": "table",
    "body": "The source table gives thermochemical data and standard electrode potentials for reduction of $M^{II}$ to M.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 99,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-coloured-ions-dd-transition",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-dblock-dd-transition"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Coloured Ions and d-d Transition",
    "card_type": "mixed",
    "body": "The source attributes transition-metal colour to incomplete $(n-1)d$ subshells.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Most transition-metal compounds are coloured in solid or solution form.",
      "The observed colour is complementary to the absorbed colour.",
      "Other colours constituting white light are transmitted."
    ],
    "importance": 5,
    "source_page": 99,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-magnetic-behaviour",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Behaviour",
    "card_type": "formula",
    "body": "The source defines paramagnetic and diamagnetic substances and gives the spin-only magnetic moment relation.",
    "formulas": [
      {
        "latex": "\\mu=\\sqrt{n(n+2)}\\ B.M."
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of unpaired electrons"
      },
      {
        "latex": "\\mu",
        "symbol": "$\\mu$",
        "meaning": "magnetic moment in Bohr magneton units"
      }
    ],
    "conditions": [
      "Paramagnetic substances are attracted by magnetic field.",
      "Diamagnetic substances are repelled by magnetic field.",
      "Paramagnetism first increases in a transition series and then decreases; maximum is around the middle."
    ],
    "importance": 5,
    "source_page": 100,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-interstitial-catalytic-alloy",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed point"
      ],
      "rows": [
        [
          "Interstitial compounds",
          "Transition metals form interstitial compounds with H, B, C and N."
        ],
        [
          "Catalysts",
          "Fe, Co, Ni, V, Cr, Mn and Pt are listed as common catalysts."
        ],
        [
          "Catalysis reason",
          "Reaction intermediates provide lower activation-energy paths; surface adsorption can increase reactant concentration and weaken bonds."
        ],
        [
          "Variable oxidation state",
          "Transition-metal ions can change oxidation states and become more effective catalysts."
        ],
        [
          "Alloys",
          "Alloys are hard, high-melting and more corrosion-resistant than parent metals."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Interstitial, Catalytic and Alloy Behaviour",
    "card_type": "table",
    "body": "The source gives three important transition-metal behaviours after magnetic properties.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 100,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-potassium-permanganate",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Medium/reagent",
        "Clear source-backed product"
      ],
      "rows": [
        [
          "Acidic medium",
          "$Mn^{2+}$ products are shown with reducers such as $H_2O_2$, $C_2O_4^{2-}$, $Fe^{2+}$, $SO_3^{2-}$, $Mn^{2+}$, $X^-$ and $H_2S$."
        ],
        [
          "Alkaline/neutral medium",
          "$MnO_2$ products are shown with $I^-$, $H_2S$, $S_2O_3^{2-}$, $ZnSO_4$."
        ],
        [
          "Baeyer's reagent",
          "1% alkaline $KMnO_4$ decolourises compounds containing $C=C$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Potassium Permanganate",
    "card_type": "table",
    "body": "The source gives preparation and oxidation-reaction maps for $KMnO_4$.",
    "formulas": [
      {
        "latex": "MnO_2+KOH+KClO_3\\xrightarrow{\\Delta}K_2MnO_4"
      },
      {
        "latex": "K_2MnO_4\\xrightarrow{Cl_2}KMnO_4"
      },
      {
        "latex": "K_2MnO_4\\xrightarrow{\\text{electrolysis at anode}}KMnO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "The full radial oxidation map remains in the PDF fallback."
    ],
    "importance": 5,
    "source_page": 101,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-d-block-elements-compounds-potassium-dichromate",
    "chapter_id": "jee-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Reaction family",
        "Clear source-backed observation/product"
      ],
      "rows": [
        [
          "Oxidising nature",
          "Acidic $K_2Cr_2O_7$ gives $Cr^{3+}$ green with reducing agents shown in the map."
        ],
        [
          "Hydrogen peroxide",
          "$K_2Cr_2O_7$ with $H^+/H_2O_2$ gives $CrO_5$ deep blue in ether."
        ],
        [
          "Chrome alum",
          "$K_2SO_4Cr_2(SO_4)_3\\cdot 24H_2O$ is shown."
        ],
        [
          "Chromate lead test",
          "$Na_2CrO_4$ then lead acetate gives $PbCrO_4$ yellow."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Potassium Dichromate",
    "card_type": "table",
    "body": "The source gives preparation and oxidation behavior of $K_2Cr_2O_7$.",
    "formulas": [
      {
        "latex": "FeCr_2O_4\\xrightarrow{Na_2CO_3+air,\\Delta}Na_2CrO_4+Fe_2O_3+CO_2"
      },
      {
        "latex": "Na_2CrO_4\\xrightarrow{H^+}Na_2Cr_2O_7\\xrightarrow{KCl}K_2Cr_2O_7"
      },
      {
        "latex": "(NH_4)_2Cr_2O_7\\xrightarrow{\\Delta}N_2+Cr_2O_3+H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "The source identifies $Cr_2O_3$ from ammonium dichromate as green."
    ],
    "importance": 5,
    "source_page": 102,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-qualitative-analysis-dry-tests",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "sections": [
        {
          "title": "Charcoal cavity",
          "columns": [
            "Observation",
            "Inference"
          ],
          "rows": [
            [
              "Yellow when hot, white when cold; no metallic bead",
              "$Zn^{2+}$"
            ],
            [
              "Brown when hot, yellow when cold; grey bead marks paper",
              "$Pb^{2+}$"
            ],
            [
              "No characteristic residue; red beads or scales",
              "$Cu^{2+}$"
            ],
            [
              "White residue glows on heating",
              "$Ba^{2+}, Ca^{2+}, Mg^{2+}$"
            ],
            [
              "Black residue",
              "Nothing definite, generally coloured salt"
            ]
          ]
        },
        {
          "title": "Cobalt nitrate",
          "columns": [
            "Metal",
            "Colour of mass"
          ],
          "rows": [
            [
              "Zinc",
              "Green"
            ],
            [
              "Aluminium",
              "Blue"
            ],
            [
              "Magnesium",
              "Pink"
            ],
            [
              "Tin",
              "Bluish-green"
            ]
          ]
        },
        {
          "title": "Flame",
          "columns": [
            "Flame colour",
            "Inference"
          ],
          "rows": [
            [
              "Crimson red / carmine red",
              "Lithium"
            ],
            [
              "Golden yellow",
              "Sodium"
            ],
            [
              "Violet/Lilac",
              "Potassium"
            ],
            [
              "Brick red",
              "Calcium"
            ],
            [
              "Crimson",
              "Strontium"
            ],
            [
              "Apple green/yellowish green",
              "Barium"
            ],
            [
              "Green with blue centre/greenish blue",
              "Copper"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Dry Tests: Charcoal Cavity, Cobalt Nitrate and Flame",
    "card_type": "table",
    "body": "The qualitative-analysis section starts with quick dry-test observations.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 102,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-qualitative-analysis-borax-bead-test",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Metal",
        "Oxidising hot",
        "Oxidising cold",
        "Reducing hot",
        "Reducing cold"
      ],
      "rows": [
        [
          "Copper",
          "Green",
          "Blue",
          "Colourless",
          "Brown red"
        ],
        [
          "Iron",
          "Brown yellow",
          "Pale yellow/Yellow",
          "Bottle green",
          "Bottle green"
        ],
        [
          "Chromium",
          "Yellow",
          "Green",
          "Green",
          "Green"
        ],
        [
          "Cobalt",
          "Blue",
          "Blue",
          "Blue",
          "Blue"
        ],
        [
          "Manganese",
          "Violet/Amethyst",
          "Red/Amethyst",
          "Grey/Colourless",
          "Grey/Colourless"
        ],
        [
          "Nickel",
          "Violet",
          "Brown/Reddish brown",
          "Grey",
          "Grey"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Borax Bead Test Colours",
    "card_type": "table",
    "body": "The visible source table compares bead colours in oxidising and reducing flames.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 103,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-qualitative-analysis-anions-dilute-acid",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation/test",
        "Confirmatory relation"
      ],
      "rows": [
        [
          "$CO_3^{2-}$",
          "Colourless odourless gas with brisk effervescence.",
          "$CO_2+Ca(OH)_2\\rightarrow CaCO_3\\downarrow+H_2O$"
        ],
        [
          "$SO_3^{2-}$",
          "$SO_2$ with suffocating odour of burning sulphur.",
          "Acidified $K_2Cr_2O_7$ paper turns green; $Cr_2O_7^{2-}+2H^++3SO_2\\rightarrow 2Cr^{3+}+3SO_4^{2-}+H_2O$"
        ],
        [
          "$S^{2-}$",
          "Rotten-egg smelling gas.",
          "$Pb(CH_3COO)_2+H_2S\\rightarrow PbS\\downarrow$ black"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anions: Dilute Acid Group",
    "card_type": "table",
    "body": "The dilute sulphuric/hydrochloric acid group includes carbonate, sulphite and sulphide tests.",
    "formulas": [
      {
        "latex": "CaCO_3+H_2SO_4\\rightarrow CaSO_4+H_2O+CO_2\\uparrow"
      },
      {
        "latex": "CaSO_3+H_2SO_4\\rightarrow CaSO_4+H_2O+SO_2\\uparrow"
      },
      {
        "latex": "S^{2-}+2H^+\\rightarrow H_2S\\uparrow"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 103,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-qualitative-analysis-anions-nitrite-acetate",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anions: Nitrite and Acetate",
    "card_type": "formula",
    "body": "The source lists nitrite and acetate tests after the dilute-acid group entries.",
    "formulas": [
      {
        "latex": "NO_2^-+H^+\\rightarrow HNO_2"
      },
      {
        "latex": "3HNO_2\\rightarrow HNO_3+2NO+H_2O"
      },
      {
        "latex": "2NO+O_2\\rightarrow 2NO_2\\uparrow"
      },
      {
        "latex": "2NO_2^-+3I^-+4CH_3COOH\\rightarrow I_3^-+2NO\\uparrow+4CH_3COO^-+2H_2O"
      },
      {
        "latex": "(CH_3COO)_2Ca+H_2SO_4\\rightarrow 2CH_3COOH+CaSO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "Starch with $I_3^-$ gives a blue starch-iodine adsorption complex.",
      "Acetate gives vinegar-like smell with dilute sulphuric acid.",
      "Neutral ferric chloride gives deep red/blood red colouration with acetate."
    ],
    "importance": 4,
    "source_page": 104,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-qualitative-analysis-halide-anion-tests",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Key source-backed tests"
      ],
      "rows": [
        [
          "$Cl^-$",
          "$Cl^-+Ag^+\\rightarrow AgCl\\downarrow$ white; dissolves in aqueous ammonia and reappears with $HNO_3$."
        ],
        [
          "$Cl^-$ chromyl chloride",
          "$4Cl^-+Cr_2O_7^{2-}+6H^+\\rightarrow 2CrO_2Cl_2$ deep red vapours $+3H_2O$; then $PbCrO_4\\downarrow$ yellow."
        ],
        [
          "$Br^-$",
          "$NaBr+AgNO_3\\rightarrow AgBr\\downarrow$ pale yellow; partially soluble in dilute ammonia, readily soluble in concentrated ammonia."
        ],
        [
          "$Br^-$ chlorine water",
          "$2Br^-+Cl_2\\rightarrow 2Cl^-+Br_2$; reddish brown organic layer."
        ],
        [
          "$I^-$",
          "$I^-+Ag^+\\rightarrow AgI\\downarrow$ bright yellow; insoluble in dilute ammonia, partially soluble in concentrated ammonia."
        ],
        [
          "$I^-$ chlorine water",
          "$2NaI+Cl_2\\rightarrow 2NaCl+I_2$; violet organic layer with $CHCl_3$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Halide Anion Tests",
    "card_type": "table",
    "body": "The concentrated sulphuric-acid group gives chloride, bromide and iodide tests.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 105,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-qualitative-analysis-nitrate-sulphate-phosphate",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation"
      ],
      "rows": [
        [
          "$NO_3^-$",
          "Copper turnings or paper pellets intensify reddish-brown gas evolution."
        ],
        [
          "$SO_4^{2-}$",
          "$BaSO_4$ white precipitate; insoluble in warm dilute $HNO_3$ and HCl."
        ],
        [
          "$SO_4^{2-}$",
          "$PbSO_4$ white precipitate; soluble in excess hot ammonium acetate."
        ],
        [
          "$PO_4^{3-}$",
          "$(NH_4)_3PMo_{12}O_{40}$ canary yellow precipitate."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nitrate, Sulphate and Phosphate Tests",
    "card_type": "table",
    "body": "The source gives nitrate, sulphate and phosphate confirmatory tests.",
    "formulas": [
      {
        "latex": "4NO_3^-+2H_2SO_4\\rightarrow 4NO_2\\uparrow+O_2+2SO_4^{2-}+2H_2O"
      },
      {
        "latex": "Na_2SO_4+BaCl_2\\rightarrow BaSO_4\\downarrow+2NaCl"
      },
      {
        "latex": "Na_2SO_4+(CH_3COO)_2Pb\\rightarrow PbSO_4\\downarrow+2CH_3COONa"
      }
    ],
    "variables": [],
    "conditions": [
      "Nitrate gives pungent reddish-brown vapours with concentrated sulphuric acid.",
      "Brown-ring test gives $[Fe(H_2O)_5NO]^{2+}$ brown ring in the source.",
      "Phosphate ammonium molybdate test gives canary yellow precipitate."
    ],
    "importance": 5,
    "source_page": 106,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-qualitative-analysis-ammonium-ion",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ammonium Ion Tests",
    "card_type": "formula",
    "body": "The cation section starts with ammonium ion reactions.",
    "formulas": [
      {
        "latex": "2NH_3+Mn^{2+}+H_2O_2+H_2O\\rightarrow MnO(OH)_2\\downarrow+2NH_4^+"
      },
      {
        "latex": "NH_4^++2[HgI_4]^{2-}+4OH^-\\rightarrow HgO\\cdot Hg(NH_2)I\\downarrow+7I^-+3H_2O"
      },
      {
        "latex": "3NH_4^+ + [Co(NO_2)_6]^{3-}\\rightarrow (NH_4)_3[Co(NO_2)_6]\\downarrow"
      },
      {
        "latex": "2NH_4^+ + [PtCl_6]^{2-}\\rightarrow (NH_4)_2[PtCl_6]\\downarrow"
      }
    ],
    "variables": [],
    "conditions": [
      "$MnO(OH)_2$ precipitate is brown.",
      "Nessler reagent gives brown precipitate.",
      "Cobaltinitrite and chloroplatinate precipitates are yellow."
    ],
    "importance": 5,
    "source_page": 106,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-qualitative-analysis-cation-group-separation",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group",
        "Ions listed",
        "Source-backed separating reagent/step"
      ],
      "rows": [
        [
          "I",
          "$Pb^{2+}, Hg_2^{2+}, Ag^+$",
          "Original solution in water plus dilute HCl."
        ],
        [
          "IIA",
          "$Hg^{2+}, Pb^{2+}, Bi^{3+}, Cu^{2+}, Cd^{2+}$",
          "I group filtrate plus dilute HCl and $H_2S$."
        ],
        [
          "IIB",
          "$As^{3+}, Sb^{3+}, Sn^{2+}, Sn^{4+}$",
          "Sulphides soluble in $(NH_4)_2S$."
        ],
        [
          "III",
          "$Al^{3+}, Fe^{3+}, Cr^{3+}$",
          "Boil off $H_2S$, add conc. $HNO_3$, $NH_4Cl$, $NH_4OH$."
        ],
        [
          "IV",
          "$Zn^{2+}, Mn^{2+}, Ni^{2+}, Co^{2+}$",
          "III group filtrate plus excess $NH_4OH$, $NH_4Cl$, then pass $H_2S$."
        ],
        [
          "V",
          "$Ba^{2+}, Sr^{2+}, Ca^{2+}$",
          "Boil off $H_2S$, add $(NH_4)_2CO_3$, $NH_4OH$, $NH_4Cl$."
        ],
        [
          "VI",
          "$Mg^{2+}$",
          "Filtrate from V group."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cation-group-flow"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cation Group-Separation Flow",
    "card_type": "mixed",
    "body": "The handbook presents cation analysis as sequential group separation.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "This is a compact workflow summary; detailed branch flowcharts remain in the PDF fallback."
    ],
    "importance": 5,
    "source_page": 107,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-qualitative-analysis-group-i-cations",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Source-backed confirmation"
      ],
      "rows": [
        [
          "$Pb^{2+}$",
          "If precipitate dissolves, divide into parts: KI gives yellow $PbI_2$; $K_2CrO_4$ gives yellow $PbCrO_4$; dilute $H_2SO_4$ gives white $PbSO_4$ soluble in ammonium acetate."
        ],
        [
          "$Ag^+$",
          "If precipitate does not dissolve, add $NH_4OH$; soluble $Ag(NH_3)_2Cl$ reprecipitates $AgCl$ with dilute $HNO_3$; KI gives yellow $AgI$; $K_2CrO_4$ gives brick red/red $Ag_2CrO_4$."
        ],
        [
          "$Hg_2^{2+}$",
          "$NH_4OH$ gives black mixture; SnCl$_2$ gives grey/black Hg; KI gives red $HgI_2$ soluble in excess KI forming $K_2[HgI_4]$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group I Cations",
    "card_type": "table",
    "body": "Group I contains lead, mercurous and silver ions precipitated by dilute HCl.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "White precipitate contains $AgCl$, $Hg_2Cl_2$ or $PbCl_2$."
    ],
    "importance": 5,
    "source_page": 107,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-qualitative-analysis-group-ii-cations",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group",
        "Ions listed",
        "Source-backed observations"
      ],
      "rows": [
        [
          "IIA",
          "$Hg^{2+}, Pb^{2+}, Bi^{3+}, Cu^{2+}, Cd^{2+}$",
          "With dilute HCl and $H_2S$: black precipitate for HgS/PbS/CuS/Bi$_2$S$_3$; CdS is yellow."
        ],
        [
          "IIA Hg",
          "HgS",
          "Insoluble HgS dissolved in aqua regia plus SnCl$_2$ gives black Hg precipitate."
        ],
        [
          "IIA Cu",
          "$Cu^{2+}$",
          "Blue $Cu(NO_3)_2$ solution plus ammonia gives intense blue $[Cu(NH_3)_4](NO_3)_2$."
        ],
        [
          "IIA Cd",
          "$Cd^{2+}$",
          "$[Cd(CN)_4]^{2-}$ passed with $H_2S$ gives yellow CdS."
        ],
        [
          "IIB",
          "$As^{3+}, Sb^{3+}, Sn^{2+}, Sn^{4+}$",
          "Sulphides soluble in $(NH_4)_2S$ as ammonium thio salts, then acidified with dilute HCl."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group II Cations",
    "card_type": "table",
    "body": "The source separates Group II into IIA and IIB sulphide groups.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Detailed flowchart branches remain available through the PDF fallback."
    ],
    "importance": 5,
    "source_page": 108,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-qualitative-analysis-group-iii-cations",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation/confirmatory test"
      ],
      "rows": [
        [
          "$Al^{3+}$",
          "Gelatinous white $Al(OH)_3$; dissolves in dilute HCl, then NaOH gives $NaAlO_2$ solution; $NH_4Cl$ and heat regenerate gelatinous white $Al(OH)_3$."
        ],
        [
          "$Fe^{3+}$",
          "Reddish brown $Fe(OH)_3$; with $K_4[Fe(CN)_6]$ gives Prussian blue precipitate $Fe_4[Fe(CN)_6]_3$; KSCN gives blood red $Fe(SCN)_3$."
        ],
        [
          "$Cr^{3+}$",
          "Green $Cr(OH)_3$; fusion/extraction gives chromate solution; lead acetate gives yellow $PbCrO_4$, and BaCl$_2$ gives yellow $BaCrO_4$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group III Cations",
    "card_type": "table",
    "body": "Group III filtrate is treated to identify aluminium, iron and chromium.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Source step: boil off $H_2S$, then add concentrated $HNO_3$, $NH_4Cl$, $NH_4OH$."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-qualitative-analysis-group-iv-cations",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Source-backed confirmation"
      ],
      "rows": [
        [
          "$Co^{2+}$",
          "Black CoS/NiS branch; blue residue $CoCl_2$ turns pink in water; nitrite test gives yellow $K_3[Co(NO_2)_6]$; thiocyanate gives blue organic layer of $(NH_4)_2[Co(SCN)_4]$."
        ],
        [
          "$Ni^{2+}$",
          "Yellow residue $NiCl_2$ turns green in water; dimethylglyoxime in ammoniacal solution gives red/rosy red precipitate."
        ],
        [
          "$Mn^{2+}$",
          "Black $MnO_2$ precipitate branch; dissolution gives violet-red/purple $HMnO_4$ solution."
        ],
        [
          "$Zn^{2+}$",
          "Filtrate gives white ZnS on passing $H_2S$; ferrocyanide test gives white precipitate of composition $Zn_3K_2[Fe(CN)_6]_2$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group IV Cations",
    "card_type": "table",
    "body": "Group IV contains zinc, manganese, nickel and cobalt ions.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Group IV precipitate listed: ZnS white, MnS light pink, NiS black or CoS black."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 12
  },
  {
    "id": "jee-chemistry-qualitative-analysis-group-v-vi-cations",
    "chapter_id": "jee-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group/ion",
        "Source-backed test"
      ],
      "rows": [
        [
          "Group V precipitate",
          "White precipitate: $BaCO_3$, $SrCO_3$ or $CaCO_3$."
        ],
        [
          "$Ba^{2+}$",
          "$K_2CrO_4$ gives yellow $BaCrO_4$, insoluble in acetic acid."
        ],
        [
          "$Sr^{2+}$",
          "$(NH_4)_2SO_4$ gives white $SrSO_4$."
        ],
        [
          "$Ca^{2+}$",
          "$(NH_4)_2C_2O_4$ gives white $CaC_2O_4$."
        ],
        [
          "$Mg^{2+}$",
          "$Mg(NH_4)PO_4$ white precipitate; titan yellow gives deep red colour/precipitate."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group V and VI Cations",
    "card_type": "table",
    "body": "The final inorganic qualitative page gives alkaline-earth group tests and magnesium tests.",
    "formulas": [
      {
        "latex": "Mg^{2+}+NH_3+HPO_4^{2-}\\rightarrow Mg(NH_4)PO_4\\downarrow"
      },
      {
        "latex": "5Mg^{2+}+6CO_3^{2-}+7H_2O\\rightarrow 2MgCO_3\\cdot Mg(OH)_2\\cdot 5H_2O\\downarrow+2HCO_3^-"
      }
    ],
    "variables": [],
    "conditions": [
      "Titan yellow is adsorbed by $Mg(OH)_2$, producing deep red colour or precipitate."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 13
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-configuration-metallic-trends",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed point"
      ],
      "rows": [
        [
          "Metallic character",
          "Nearly all display high tensile strength, ductility, malleability, conductivity and metallic lustre."
        ],
        [
          "Metallic structures",
          "With exceptions of Zn, Cd, Hg and Mn, they have one or more typical metallic structures at normal temperatures."
        ],
        [
          "Hardness/volatility",
          "Except Zn, Cd and Hg, transition elements are very hard and have low volatility."
        ],
        [
          "Melting/boiling",
          "Melting and boiling points are generally very high."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "d-Block Configuration and Metallic Trends",
    "card_type": "table",
    "body": "The source begins d-block with the general electronic configuration and metallic properties of transition elements.",
    "formulas": [
      {
        "latex": "(n-1)d^{1-10}ns^{0-2}"
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "outermost shell"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 96,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-density-oxidation-state-reason",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Density and Variable Oxidation States",
    "card_type": "concept",
    "body": "The source links density to low atomic volume and variable oxidation states to close ns and d-subshell energies.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Atomic volumes are low compared with groups 1 and 2; increased nuclear charge is poorly screened, so transition metals are high-density.",
      "Most transition elements show variable oxidation states.",
      "Variable oxidation states arise because inner $(n-1)d$ electrons participate along with outer ns electrons."
    ],
    "importance": 5,
    "source_page": 97,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-first-series-oxidation-states",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Element",
        "Outer electronic configuration",
        "Oxidation states"
      ],
      "rows": [
        [
          "Sc",
          "$3d^14s^2$",
          "+3"
        ],
        [
          "Ti",
          "$3d^24s^2$",
          "+2, +3, +4"
        ],
        [
          "V",
          "$3d^34s^2$",
          "+2, +3, +4, +5"
        ],
        [
          "Cr",
          "$3d^54s^1$",
          "+2, +3, (+4), (+5), +6"
        ],
        [
          "Mn",
          "$3d^54s^2$",
          "+2, +3, +4, (+5), +6, +7"
        ],
        [
          "Fe",
          "$3d^64s^2$",
          "+2, +3, (+4), (+5), (+6)"
        ],
        [
          "Co",
          "$3d^74s^2$",
          "+2, +3, (+4)"
        ],
        [
          "Ni",
          "$3d^84s^2$",
          "+2, +3, +4"
        ],
        [
          "Cu",
          "$3d^{10}4s^1$",
          "+1, +2"
        ],
        [
          "Zn",
          "$3d^{10}4s^2$",
          "+2"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "First Transition Series Oxidation States",
    "card_type": "table",
    "body": "The handbook lists outer electronic configurations and oxidation states for Sc to Zn.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Parentheses are preserved from the source table."
    ],
    "importance": 5,
    "source_page": 97,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-vanadium-chromium-colours",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Element/state",
        "Oxide/hydroxide behavior",
        "Ion",
        "Colour"
      ],
      "rows": [
        [
          "V +2",
          "$VO$, basic",
          "$V^{2+}$",
          "violet"
        ],
        [
          "V +3",
          "$V_2O_5$, basic",
          "$V^{3+}$",
          "green"
        ],
        [
          "V +4",
          "$VO_2$, amphoteric",
          "$VO^{2+}$",
          "blue"
        ],
        [
          "V +5",
          "$V_2O_5$, amphoteric",
          "$VO_2^+$ / $VO_4^{3-}$",
          "yellow / colourless"
        ],
        [
          "Cr +2",
          "$CrO$, $Cr(OH)_2$, basic",
          "$Cr^{2+}$",
          "light blue"
        ],
        [
          "Cr +3",
          "$Cr_2O_3$, $Cr(OH)_3$, amphoteric",
          "$Cr^{3+}$ / $Cr(OH)_4^-$",
          "violet / green"
        ],
        [
          "Cr +6",
          "$CrO_3$, $CrO_2(OH)_2$, $H_2Cr_2O_7$, acidic",
          "$CrO_4^{2-}$ / $Cr_2O_7^{2-}$",
          "yellow / orange"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Vanadium and Chromium Ion Colours",
    "card_type": "table",
    "body": "The visible source table gives oxide/hydroxide behavior, ion names and colours for vanadium and chromium states.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The complete large table is retained in the PDF fallback; this card keeps the clearly readable entries."
    ],
    "importance": 5,
    "source_page": 98,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-electrode-potential-stability",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrode Potentials and Oxidation-State Stability",
    "card_type": "formula",
    "body": "The source explains aqueous oxidation-state stability using total energy change and electrode potential data.",
    "formulas": [
      {
        "latex": "\\Delta H=\\Delta_{sub}H^\\Theta+IE+\\Delta_{hyd}H"
      }
    ],
    "variables": [],
    "conditions": [
      "Smaller ionisation enthalpy gives information for greater thermodynamic stability of compounds.",
      "Smaller total energy change for an oxidation state gives greater stability in aqueous solution.",
      "Lower, more negative standard reduction potential means a more stable oxidation state in aqueous solution."
    ],
    "importance": 4,
    "source_page": 98,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-first-row-thermochemical-data",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "M",
        "$\\Delta_aH_q$",
        "$\\Delta_fH_1^\\theta$",
        "$\\Delta_1H_2^\\theta$",
        "$\\Delta_{hyd}H^\\theta(M^{2+})$",
        "$E^\\theta/V$"
      ],
      "rows": [
        [
          "Ti",
          "469",
          "661",
          "1310",
          "-1866",
          "-1.63"
        ],
        [
          "V",
          "515",
          "648",
          "1370",
          "-1895",
          "-1.18"
        ],
        [
          "Cr",
          "398",
          "653",
          "1590",
          "-1925",
          "-0.90"
        ],
        [
          "Mn",
          "279",
          "716",
          "1510",
          "-1862",
          "-1.18"
        ],
        [
          "Fe",
          "418",
          "762",
          "1560",
          "-1998",
          "-0.44"
        ],
        [
          "Co",
          "427",
          "757",
          "1640",
          "-2079",
          "-0.28"
        ],
        [
          "Ni",
          "431",
          "736",
          "1750",
          "-2121",
          "-0.25"
        ],
        [
          "Cu",
          "339",
          "745",
          "1960",
          "-2121",
          "0.34"
        ],
        [
          "Zn",
          "130",
          "908",
          "1730",
          "-2059",
          "-0.76"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "First-Row Thermochemical Data",
    "card_type": "table",
    "body": "The source table gives thermochemical data and standard electrode potentials for reduction of $M^{II}$ to M.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 99,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-coloured-ions-dd-transition",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-dblock-dd-transition"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Coloured Ions and d-d Transition",
    "card_type": "mixed",
    "body": "The source attributes transition-metal colour to incomplete $(n-1)d$ subshells.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Most transition-metal compounds are coloured in solid or solution form.",
      "The observed colour is complementary to the absorbed colour.",
      "Other colours constituting white light are transmitted."
    ],
    "importance": 5,
    "source_page": 99,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-magnetic-behaviour",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Behaviour",
    "card_type": "formula",
    "body": "The source defines paramagnetic and diamagnetic substances and gives the spin-only magnetic moment relation.",
    "formulas": [
      {
        "latex": "\\mu=\\sqrt{n(n+2)}\\ B.M."
      }
    ],
    "variables": [
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of unpaired electrons"
      },
      {
        "latex": "\\mu",
        "symbol": "$\\mu$",
        "meaning": "magnetic moment in Bohr magneton units"
      }
    ],
    "conditions": [
      "Paramagnetic substances are attracted by magnetic field.",
      "Diamagnetic substances are repelled by magnetic field.",
      "Paramagnetism first increases in a transition series and then decreases; maximum is around the middle."
    ],
    "importance": 5,
    "source_page": 100,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-interstitial-catalytic-alloy",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed point"
      ],
      "rows": [
        [
          "Interstitial compounds",
          "Transition metals form interstitial compounds with H, B, C and N."
        ],
        [
          "Catalysts",
          "Fe, Co, Ni, V, Cr, Mn and Pt are listed as common catalysts."
        ],
        [
          "Catalysis reason",
          "Reaction intermediates provide lower activation-energy paths; surface adsorption can increase reactant concentration and weaken bonds."
        ],
        [
          "Variable oxidation state",
          "Transition-metal ions can change oxidation states and become more effective catalysts."
        ],
        [
          "Alloys",
          "Alloys are hard, high-melting and more corrosion-resistant than parent metals."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Interstitial, Catalytic and Alloy Behaviour",
    "card_type": "table",
    "body": "The source gives three important transition-metal behaviours after magnetic properties.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 100,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-potassium-permanganate",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Medium/reagent",
        "Clear source-backed product"
      ],
      "rows": [
        [
          "Acidic medium",
          "$Mn^{2+}$ products are shown with reducers such as $H_2O_2$, $C_2O_4^{2-}$, $Fe^{2+}$, $SO_3^{2-}$, $Mn^{2+}$, $X^-$ and $H_2S$."
        ],
        [
          "Alkaline/neutral medium",
          "$MnO_2$ products are shown with $I^-$, $H_2S$, $S_2O_3^{2-}$, $ZnSO_4$."
        ],
        [
          "Baeyer's reagent",
          "1% alkaline $KMnO_4$ decolourises compounds containing $C=C$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Potassium Permanganate",
    "card_type": "table",
    "body": "The source gives preparation and oxidation-reaction maps for $KMnO_4$.",
    "formulas": [
      {
        "latex": "MnO_2+KOH+KClO_3\\xrightarrow{\\Delta}K_2MnO_4"
      },
      {
        "latex": "K_2MnO_4\\xrightarrow{Cl_2}KMnO_4"
      },
      {
        "latex": "K_2MnO_4\\xrightarrow{\\text{electrolysis at anode}}KMnO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "The full radial oxidation map remains in the PDF fallback."
    ],
    "importance": 5,
    "source_page": 101,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-d-block-elements-compounds-potassium-dichromate",
    "chapter_id": "neet-chemistry-d-block-elements-compounds",
    "table_data": {
      "columns": [
        "Reaction family",
        "Clear source-backed observation/product"
      ],
      "rows": [
        [
          "Oxidising nature",
          "Acidic $K_2Cr_2O_7$ gives $Cr^{3+}$ green with reducing agents shown in the map."
        ],
        [
          "Hydrogen peroxide",
          "$K_2Cr_2O_7$ with $H^+/H_2O_2$ gives $CrO_5$ deep blue in ether."
        ],
        [
          "Chrome alum",
          "$K_2SO_4Cr_2(SO_4)_3\\cdot 24H_2O$ is shown."
        ],
        [
          "Chromate lead test",
          "$Na_2CrO_4$ then lead acetate gives $PbCrO_4$ yellow."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Potassium Dichromate",
    "card_type": "table",
    "body": "The source gives preparation and oxidation behavior of $K_2Cr_2O_7$.",
    "formulas": [
      {
        "latex": "FeCr_2O_4\\xrightarrow{Na_2CO_3+air,\\Delta}Na_2CrO_4+Fe_2O_3+CO_2"
      },
      {
        "latex": "Na_2CrO_4\\xrightarrow{H^+}Na_2Cr_2O_7\\xrightarrow{KCl}K_2Cr_2O_7"
      },
      {
        "latex": "(NH_4)_2Cr_2O_7\\xrightarrow{\\Delta}N_2+Cr_2O_3+H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "The source identifies $Cr_2O_3$ from ammonium dichromate as green."
    ],
    "importance": 5,
    "source_page": 102,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-qualitative-analysis-dry-tests",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "sections": [
        {
          "title": "Charcoal cavity",
          "columns": [
            "Observation",
            "Inference"
          ],
          "rows": [
            [
              "Yellow when hot, white when cold; no metallic bead",
              "$Zn^{2+}$"
            ],
            [
              "Brown when hot, yellow when cold; grey bead marks paper",
              "$Pb^{2+}$"
            ],
            [
              "No characteristic residue; red beads or scales",
              "$Cu^{2+}$"
            ],
            [
              "White residue glows on heating",
              "$Ba^{2+}, Ca^{2+}, Mg^{2+}$"
            ],
            [
              "Black residue",
              "Nothing definite, generally coloured salt"
            ]
          ]
        },
        {
          "title": "Cobalt nitrate",
          "columns": [
            "Metal",
            "Colour of mass"
          ],
          "rows": [
            [
              "Zinc",
              "Green"
            ],
            [
              "Aluminium",
              "Blue"
            ],
            [
              "Magnesium",
              "Pink"
            ],
            [
              "Tin",
              "Bluish-green"
            ]
          ]
        },
        {
          "title": "Flame",
          "columns": [
            "Flame colour",
            "Inference"
          ],
          "rows": [
            [
              "Crimson red / carmine red",
              "Lithium"
            ],
            [
              "Golden yellow",
              "Sodium"
            ],
            [
              "Violet/Lilac",
              "Potassium"
            ],
            [
              "Brick red",
              "Calcium"
            ],
            [
              "Crimson",
              "Strontium"
            ],
            [
              "Apple green/yellowish green",
              "Barium"
            ],
            [
              "Green with blue centre/greenish blue",
              "Copper"
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Dry Tests: Charcoal Cavity, Cobalt Nitrate and Flame",
    "card_type": "table",
    "body": "The qualitative-analysis section starts with quick dry-test observations.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 102,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-qualitative-analysis-borax-bead-test",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Metal",
        "Oxidising hot",
        "Oxidising cold",
        "Reducing hot",
        "Reducing cold"
      ],
      "rows": [
        [
          "Copper",
          "Green",
          "Blue",
          "Colourless",
          "Brown red"
        ],
        [
          "Iron",
          "Brown yellow",
          "Pale yellow/Yellow",
          "Bottle green",
          "Bottle green"
        ],
        [
          "Chromium",
          "Yellow",
          "Green",
          "Green",
          "Green"
        ],
        [
          "Cobalt",
          "Blue",
          "Blue",
          "Blue",
          "Blue"
        ],
        [
          "Manganese",
          "Violet/Amethyst",
          "Red/Amethyst",
          "Grey/Colourless",
          "Grey/Colourless"
        ],
        [
          "Nickel",
          "Violet",
          "Brown/Reddish brown",
          "Grey",
          "Grey"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Borax Bead Test Colours",
    "card_type": "table",
    "body": "The visible source table compares bead colours in oxidising and reducing flames.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 103,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-qualitative-analysis-anions-dilute-acid",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation/test",
        "Confirmatory relation"
      ],
      "rows": [
        [
          "$CO_3^{2-}$",
          "Colourless odourless gas with brisk effervescence.",
          "$CO_2+Ca(OH)_2\\rightarrow CaCO_3\\downarrow+H_2O$"
        ],
        [
          "$SO_3^{2-}$",
          "$SO_2$ with suffocating odour of burning sulphur.",
          "Acidified $K_2Cr_2O_7$ paper turns green; $Cr_2O_7^{2-}+2H^++3SO_2\\rightarrow 2Cr^{3+}+3SO_4^{2-}+H_2O$"
        ],
        [
          "$S^{2-}$",
          "Rotten-egg smelling gas.",
          "$Pb(CH_3COO)_2+H_2S\\rightarrow PbS\\downarrow$ black"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anions: Dilute Acid Group",
    "card_type": "table",
    "body": "The dilute sulphuric/hydrochloric acid group includes carbonate, sulphite and sulphide tests.",
    "formulas": [
      {
        "latex": "CaCO_3+H_2SO_4\\rightarrow CaSO_4+H_2O+CO_2\\uparrow"
      },
      {
        "latex": "CaSO_3+H_2SO_4\\rightarrow CaSO_4+H_2O+SO_2\\uparrow"
      },
      {
        "latex": "S^{2-}+2H^+\\rightarrow H_2S\\uparrow"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 103,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-qualitative-analysis-anions-nitrite-acetate",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anions: Nitrite and Acetate",
    "card_type": "formula",
    "body": "The source lists nitrite and acetate tests after the dilute-acid group entries.",
    "formulas": [
      {
        "latex": "NO_2^-+H^+\\rightarrow HNO_2"
      },
      {
        "latex": "3HNO_2\\rightarrow HNO_3+2NO+H_2O"
      },
      {
        "latex": "2NO+O_2\\rightarrow 2NO_2\\uparrow"
      },
      {
        "latex": "2NO_2^-+3I^-+4CH_3COOH\\rightarrow I_3^-+2NO\\uparrow+4CH_3COO^-+2H_2O"
      },
      {
        "latex": "(CH_3COO)_2Ca+H_2SO_4\\rightarrow 2CH_3COOH+CaSO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "Starch with $I_3^-$ gives a blue starch-iodine adsorption complex.",
      "Acetate gives vinegar-like smell with dilute sulphuric acid.",
      "Neutral ferric chloride gives deep red/blood red colouration with acetate."
    ],
    "importance": 4,
    "source_page": 104,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-qualitative-analysis-halide-anion-tests",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Key source-backed tests"
      ],
      "rows": [
        [
          "$Cl^-$",
          "$Cl^-+Ag^+\\rightarrow AgCl\\downarrow$ white; dissolves in aqueous ammonia and reappears with $HNO_3$."
        ],
        [
          "$Cl^-$ chromyl chloride",
          "$4Cl^-+Cr_2O_7^{2-}+6H^+\\rightarrow 2CrO_2Cl_2$ deep red vapours $+3H_2O$; then $PbCrO_4\\downarrow$ yellow."
        ],
        [
          "$Br^-$",
          "$NaBr+AgNO_3\\rightarrow AgBr\\downarrow$ pale yellow; partially soluble in dilute ammonia, readily soluble in concentrated ammonia."
        ],
        [
          "$Br^-$ chlorine water",
          "$2Br^-+Cl_2\\rightarrow 2Cl^-+Br_2$; reddish brown organic layer."
        ],
        [
          "$I^-$",
          "$I^-+Ag^+\\rightarrow AgI\\downarrow$ bright yellow; insoluble in dilute ammonia, partially soluble in concentrated ammonia."
        ],
        [
          "$I^-$ chlorine water",
          "$2NaI+Cl_2\\rightarrow 2NaCl+I_2$; violet organic layer with $CHCl_3$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Halide Anion Tests",
    "card_type": "table",
    "body": "The concentrated sulphuric-acid group gives chloride, bromide and iodide tests.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 105,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-qualitative-analysis-nitrate-sulphate-phosphate",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation"
      ],
      "rows": [
        [
          "$NO_3^-$",
          "Copper turnings or paper pellets intensify reddish-brown gas evolution."
        ],
        [
          "$SO_4^{2-}$",
          "$BaSO_4$ white precipitate; insoluble in warm dilute $HNO_3$ and HCl."
        ],
        [
          "$SO_4^{2-}$",
          "$PbSO_4$ white precipitate; soluble in excess hot ammonium acetate."
        ],
        [
          "$PO_4^{3-}$",
          "$(NH_4)_3PMo_{12}O_{40}$ canary yellow precipitate."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nitrate, Sulphate and Phosphate Tests",
    "card_type": "table",
    "body": "The source gives nitrate, sulphate and phosphate confirmatory tests.",
    "formulas": [
      {
        "latex": "4NO_3^-+2H_2SO_4\\rightarrow 4NO_2\\uparrow+O_2+2SO_4^{2-}+2H_2O"
      },
      {
        "latex": "Na_2SO_4+BaCl_2\\rightarrow BaSO_4\\downarrow+2NaCl"
      },
      {
        "latex": "Na_2SO_4+(CH_3COO)_2Pb\\rightarrow PbSO_4\\downarrow+2CH_3COONa"
      }
    ],
    "variables": [],
    "conditions": [
      "Nitrate gives pungent reddish-brown vapours with concentrated sulphuric acid.",
      "Brown-ring test gives $[Fe(H_2O)_5NO]^{2+}$ brown ring in the source.",
      "Phosphate ammonium molybdate test gives canary yellow precipitate."
    ],
    "importance": 5,
    "source_page": 106,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-qualitative-analysis-ammonium-ion",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ammonium Ion Tests",
    "card_type": "formula",
    "body": "The cation section starts with ammonium ion reactions.",
    "formulas": [
      {
        "latex": "2NH_3+Mn^{2+}+H_2O_2+H_2O\\rightarrow MnO(OH)_2\\downarrow+2NH_4^+"
      },
      {
        "latex": "NH_4^++2[HgI_4]^{2-}+4OH^-\\rightarrow HgO\\cdot Hg(NH_2)I\\downarrow+7I^-+3H_2O"
      },
      {
        "latex": "3NH_4^+ + [Co(NO_2)_6]^{3-}\\rightarrow (NH_4)_3[Co(NO_2)_6]\\downarrow"
      },
      {
        "latex": "2NH_4^+ + [PtCl_6]^{2-}\\rightarrow (NH_4)_2[PtCl_6]\\downarrow"
      }
    ],
    "variables": [],
    "conditions": [
      "$MnO(OH)_2$ precipitate is brown.",
      "Nessler reagent gives brown precipitate.",
      "Cobaltinitrite and chloroplatinate precipitates are yellow."
    ],
    "importance": 5,
    "source_page": 106,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-qualitative-analysis-cation-group-separation",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group",
        "Ions listed",
        "Source-backed separating reagent/step"
      ],
      "rows": [
        [
          "I",
          "$Pb^{2+}, Hg_2^{2+}, Ag^+$",
          "Original solution in water plus dilute HCl."
        ],
        [
          "IIA",
          "$Hg^{2+}, Pb^{2+}, Bi^{3+}, Cu^{2+}, Cd^{2+}$",
          "I group filtrate plus dilute HCl and $H_2S$."
        ],
        [
          "IIB",
          "$As^{3+}, Sb^{3+}, Sn^{2+}, Sn^{4+}$",
          "Sulphides soluble in $(NH_4)_2S$."
        ],
        [
          "III",
          "$Al^{3+}, Fe^{3+}, Cr^{3+}$",
          "Boil off $H_2S$, add conc. $HNO_3$, $NH_4Cl$, $NH_4OH$."
        ],
        [
          "IV",
          "$Zn^{2+}, Mn^{2+}, Ni^{2+}, Co^{2+}$",
          "III group filtrate plus excess $NH_4OH$, $NH_4Cl$, then pass $H_2S$."
        ],
        [
          "V",
          "$Ba^{2+}, Sr^{2+}, Ca^{2+}$",
          "Boil off $H_2S$, add $(NH_4)_2CO_3$, $NH_4OH$, $NH_4Cl$."
        ],
        [
          "VI",
          "$Mg^{2+}$",
          "Filtrate from V group."
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-cation-group-flow"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Cation Group-Separation Flow",
    "card_type": "mixed",
    "body": "The handbook presents cation analysis as sequential group separation.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "This is a compact workflow summary; detailed branch flowcharts remain in the PDF fallback."
    ],
    "importance": 5,
    "source_page": 107,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-qualitative-analysis-group-i-cations",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Source-backed confirmation"
      ],
      "rows": [
        [
          "$Pb^{2+}$",
          "If precipitate dissolves, divide into parts: KI gives yellow $PbI_2$; $K_2CrO_4$ gives yellow $PbCrO_4$; dilute $H_2SO_4$ gives white $PbSO_4$ soluble in ammonium acetate."
        ],
        [
          "$Ag^+$",
          "If precipitate does not dissolve, add $NH_4OH$; soluble $Ag(NH_3)_2Cl$ reprecipitates $AgCl$ with dilute $HNO_3$; KI gives yellow $AgI$; $K_2CrO_4$ gives brick red/red $Ag_2CrO_4$."
        ],
        [
          "$Hg_2^{2+}$",
          "$NH_4OH$ gives black mixture; SnCl$_2$ gives grey/black Hg; KI gives red $HgI_2$ soluble in excess KI forming $K_2[HgI_4]$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group I Cations",
    "card_type": "table",
    "body": "Group I contains lead, mercurous and silver ions precipitated by dilute HCl.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "White precipitate contains $AgCl$, $Hg_2Cl_2$ or $PbCl_2$."
    ],
    "importance": 5,
    "source_page": 107,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-qualitative-analysis-group-ii-cations",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group",
        "Ions listed",
        "Source-backed observations"
      ],
      "rows": [
        [
          "IIA",
          "$Hg^{2+}, Pb^{2+}, Bi^{3+}, Cu^{2+}, Cd^{2+}$",
          "With dilute HCl and $H_2S$: black precipitate for HgS/PbS/CuS/Bi$_2$S$_3$; CdS is yellow."
        ],
        [
          "IIA Hg",
          "HgS",
          "Insoluble HgS dissolved in aqua regia plus SnCl$_2$ gives black Hg precipitate."
        ],
        [
          "IIA Cu",
          "$Cu^{2+}$",
          "Blue $Cu(NO_3)_2$ solution plus ammonia gives intense blue $[Cu(NH_3)_4](NO_3)_2$."
        ],
        [
          "IIA Cd",
          "$Cd^{2+}$",
          "$[Cd(CN)_4]^{2-}$ passed with $H_2S$ gives yellow CdS."
        ],
        [
          "IIB",
          "$As^{3+}, Sb^{3+}, Sn^{2+}, Sn^{4+}$",
          "Sulphides soluble in $(NH_4)_2S$ as ammonium thio salts, then acidified with dilute HCl."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group II Cations",
    "card_type": "table",
    "body": "The source separates Group II into IIA and IIB sulphide groups.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Detailed flowchart branches remain available through the PDF fallback."
    ],
    "importance": 5,
    "source_page": 108,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-qualitative-analysis-group-iii-cations",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Observation/confirmatory test"
      ],
      "rows": [
        [
          "$Al^{3+}$",
          "Gelatinous white $Al(OH)_3$; dissolves in dilute HCl, then NaOH gives $NaAlO_2$ solution; $NH_4Cl$ and heat regenerate gelatinous white $Al(OH)_3$."
        ],
        [
          "$Fe^{3+}$",
          "Reddish brown $Fe(OH)_3$; with $K_4[Fe(CN)_6]$ gives Prussian blue precipitate $Fe_4[Fe(CN)_6]_3$; KSCN gives blood red $Fe(SCN)_3$."
        ],
        [
          "$Cr^{3+}$",
          "Green $Cr(OH)_3$; fusion/extraction gives chromate solution; lead acetate gives yellow $PbCrO_4$, and BaCl$_2$ gives yellow $BaCrO_4$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group III Cations",
    "card_type": "table",
    "body": "Group III filtrate is treated to identify aluminium, iron and chromium.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Source step: boil off $H_2S$, then add concentrated $HNO_3$, $NH_4Cl$, $NH_4OH$."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-qualitative-analysis-group-iv-cations",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Ion",
        "Source-backed confirmation"
      ],
      "rows": [
        [
          "$Co^{2+}$",
          "Black CoS/NiS branch; blue residue $CoCl_2$ turns pink in water; nitrite test gives yellow $K_3[Co(NO_2)_6]$; thiocyanate gives blue organic layer of $(NH_4)_2[Co(SCN)_4]$."
        ],
        [
          "$Ni^{2+}$",
          "Yellow residue $NiCl_2$ turns green in water; dimethylglyoxime in ammoniacal solution gives red/rosy red precipitate."
        ],
        [
          "$Mn^{2+}$",
          "Black $MnO_2$ precipitate branch; dissolution gives violet-red/purple $HMnO_4$ solution."
        ],
        [
          "$Zn^{2+}$",
          "Filtrate gives white ZnS on passing $H_2S$; ferrocyanide test gives white precipitate of composition $Zn_3K_2[Fe(CN)_6]_2$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group IV Cations",
    "card_type": "table",
    "body": "Group IV contains zinc, manganese, nickel and cobalt ions.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Group IV precipitate listed: ZnS white, MnS light pink, NiS black or CoS black."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-qualitative-analysis-group-v-vi-cations",
    "chapter_id": "neet-chemistry-qualitative-analysis",
    "table_data": {
      "columns": [
        "Group/ion",
        "Source-backed test"
      ],
      "rows": [
        [
          "Group V precipitate",
          "White precipitate: $BaCO_3$, $SrCO_3$ or $CaCO_3$."
        ],
        [
          "$Ba^{2+}$",
          "$K_2CrO_4$ gives yellow $BaCrO_4$, insoluble in acetic acid."
        ],
        [
          "$Sr^{2+}$",
          "$(NH_4)_2SO_4$ gives white $SrSO_4$."
        ],
        [
          "$Ca^{2+}$",
          "$(NH_4)_2C_2O_4$ gives white $CaC_2O_4$."
        ],
        [
          "$Mg^{2+}$",
          "$Mg(NH_4)PO_4$ white precipitate; titan yellow gives deep red colour/precipitate."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group V and VI Cations",
    "card_type": "table",
    "body": "The final inorganic qualitative page gives alkaline-earth group tests and magnesium tests.",
    "formulas": [
      {
        "latex": "Mg^{2+}+NH_3+HPO_4^{2-}\\rightarrow Mg(NH_4)PO_4\\downarrow"
      },
      {
        "latex": "5Mg^{2+}+6CO_3^{2-}+7H_2O\\rightarrow 2MgCO_3\\cdot Mg(OH)_2\\cdot 5H_2O\\downarrow+2HCO_3^-"
      }
    ],
    "variables": [],
    "conditions": [
      "Titan yellow is adsorbed by $Mg(OH)_2$, producing deep red colour or precipitate."
    ],
    "importance": 5,
    "source_page": 109,
    "sort_order": 13
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
