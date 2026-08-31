insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-s-block-elements-compounds', 'jee-chemistry', 's-Block Elements & their compounds', 's-block-elements-compounds', 15),
  ('jee-chemistry-p-block-elements-compounds', 'jee-chemistry', 'p-Block Elements & their compounds', 'p-block-elements-compounds', 16),
  ('neet-chemistry-s-block-elements-compounds', 'neet-chemistry', 's-Block Elements & their compounds', 's-block-elements-compounds', 15),
  ('neet-chemistry-p-block-elements-compounds', 'neet-chemistry', 'p-Block Elements & their compounds', 'p-block-elements-compounds', 16)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-s-block-elements-compounds-group-members-hydration",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Members",
          "columns": [
            "Group",
            "Elements listed"
          ],
          "rows": [
            [
              "Group 1",
              "Li, Na, K, Rb, Cs and Fr"
            ],
            [
              "Group 2",
              "Be, Mg, Ca, Sr, Ba and Ra"
            ]
          ]
        },
        {
          "title": "Hydration",
          "columns": [
            "Ions",
            "Source-backed trend"
          ],
          "rows": [
            [
              "Alkali metal ions",
              "Hydration enthalpies decrease with increase in ionic size; $Li^+$ has maximum hydration."
            ],
            [
              "Alkaline earth metal ions",
              "$Be^{2+}>Mg^{2+}>Ca^{2+}>Sr^{2+}>Ba^{2+}$."
            ],
            [
              "Group comparison",
              "Alkaline earth metal ion hydration enthalpies are larger than alkali metal ion hydration enthalpies."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 1, Group 2 and Hydration",
    "card_type": "table",
    "body": "The s-block section opens with group membership and hydration trends.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Lithium salts are mostly hydrated; the source example is $LiCl\\cdot 2H_2O$."
    ],
    "importance": 5,
    "source_page": 74,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-alkali-physical-flame",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Metal",
        "Flame colour"
      ],
      "rows": [
        [
          "Li",
          "Crimson red"
        ],
        [
          "Na",
          "Yellow"
        ],
        [
          "K",
          "Violet/Lilac"
        ],
        [
          "Rb",
          "Red violet"
        ],
        [
          "Cs",
          "Blue"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkali Metals: Physical Properties and Flame Colours",
    "card_type": "table",
    "body": "The source describes alkali metals as silvery white, soft, light metals with low density and low melting/boiling points.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Alkali metals and their salts impart characteristic colour to an oxidizing flame."
    ],
    "importance": 4,
    "source_page": 74,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-alkali-chemical-properties",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkali Metals: Chemical Properties",
    "card_type": "formula",
    "body": "The source links high alkali-metal reactivity to larger size and low ionisation enthalpy.",
    "formulas": [
      {
        "latex": "M+(x+y)NH_3\\rightarrow [M(NH_3)_x]^+ + [e(NH_3)_y]^-"
      },
      {
        "latex": "M^+(am)+e^-+NH_3(l)\\xrightarrow{\\text{on standing}}MNH_2(am)+\\frac{1}{2}H_2(g)"
      }
    ],
    "variables": [],
    "conditions": [
      "In oxygen: lithium forms monoxide, sodium forms peroxide and the other metals form superoxide.",
      "Reducing nature: lithium is most powerful and sodium is least powerful among the listed alkali metals.",
      "Liquid ammonia solutions are deep blue, conducting and paramagnetic; concentrated solution turns bronze and diamagnetic."
    ],
    "importance": 5,
    "source_page": 74,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-lithium-anomaly-diagonal",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Comparison",
        "Source-backed values"
      ],
      "rows": [
        [
          "Atomic radii",
          "Li = 152 pm; Mg = 160 pm"
        ],
        [
          "Ionic radii",
          "$Li^+ = 76$ pm; $Mg^{2+} = 72$ pm"
        ],
        [
          "Lithium reasons",
          "Exceptionally small atom and ion; high charge/radius ratio."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anomalous Lithium and Li-Mg Diagonal Relation",
    "card_type": "table",
    "body": "Lithium is anomalous due to small atom/ion size and high polarising power.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The source says Li-Mg similarity arises because of similar size."
    ],
    "importance": 5,
    "source_page": 75,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-alkaline-earth-properties",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Flame colours",
          "columns": [
            "Be",
            "Mg",
            "Ca",
            "Sr",
            "Ba"
          ],
          "rows": [
            [
              "No colour",
              "No colour",
              "Brick red",
              "Crimson",
              "Apple green"
            ]
          ]
        },
        {
          "title": "Chemical behavior",
          "columns": [
            "Property",
            "Source-backed point"
          ],
          "rows": [
            [
              "Air and water",
              "Be and Mg are inert to oxygen and water; Mg burns in air to give $MgO$ and $Mg_3N_2$."
            ],
            [
              "Ca, Sr, Ba",
              "Readily attacked by air to form oxide and nitride."
            ],
            [
              "Reducing nature",
              "Strong reducing agents, indicated by large negative reduction potentials."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkaline Earth Metals: Properties",
    "card_type": "table",
    "body": "The source compares alkaline earth physical and chemical behavior with alkali metals.",
    "formulas": [
      {
        "latex": "M+(x+y)NH_3\\rightarrow [M(NH_3)_x]^{2+}+2[e(NH_3)_y]^-"
      }
    ],
    "variables": [],
    "conditions": [
      "From liquid ammonia solutions, ammoniates $[M(NH_3)_6]^{2+}$ can be recovered."
    ],
    "importance": 5,
    "source_page": 76,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-beryllium-anomaly-diagonal",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anomalous Beryllium and Be-Al Diagonal Relation",
    "card_type": "formula",
    "body": "Beryllium differs from the rest of Group 2 and shows a diagonal relationship with aluminium.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The ionic radius of $Be^{2+}$ is estimated to be 31 pm.",
      "The charge/radius ratio is nearly the same as that of $Al^{3+}$, so beryllium resembles aluminium in some ways."
    ],
    "importance": 5,
    "source_page": 76,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-sodium-oxide-peroxide",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Compound",
        "Clear source-backed relationships"
      ],
      "rows": [
        [
          "$Na_2O$",
          "From Na with limited $O_2$; reacts with $H_2O$ to form $NaOH$; with $NH_3$ gives $NaNH_2+NaOH$; with $Al_2O_3$ gives $NaAlO_2$."
        ],
        [
          "$Na_2O_2$",
          "From Na with excess $O_2$/combustion; with $H_2O$ gives $NaOH+H_2O_2$; with $CO_2$ gives $Na_2CO_3+O_2$; with Al gives $Al_2O_3+Na_2O$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sodium Oxide and Sodium Peroxide",
    "card_type": "table",
    "body": "The source gives reaction maps for sodium oxide and sodium peroxide; the clear products are grouped here.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The full radial reaction maps remain available through the PDF fallback."
    ],
    "importance": 4,
    "source_page": 76,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-s-block-elements-compounds-sodium-carbonate-lime-bleaching-powder",
    "chapter_id": "jee-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sodium Carbonate, Lime and Bleaching Powder",
    "card_type": "formula",
    "body": "The source shows a Solvay-route chain, lime-water preparation, and bleaching powder equation.",
    "formulas": [
      {
        "latex": "NH_3+CO_2+H_2O\\rightarrow NH_4HCO_3"
      },
      {
        "latex": "NH_4HCO_3+NaCl\\rightarrow NaHCO_3"
      },
      {
        "latex": "CaCO_3\\xrightarrow{1000^\\circ C}CaO\\xrightarrow{H_2O}Ca(OH)_2"
      },
      {
        "latex": "3Ca(OH)_2+2Cl_2\\rightarrow Ca(OCl)_2\\cdot Ca(OH)_2\\cdot CaCl_2\\cdot 2H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "Clear solution of $Ca(OH)_2$ is identified as lime water."
    ],
    "importance": 4,
    "source_page": 78,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-p-block-overall-trends",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-pblock-trends"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "p-Block Overall Trends",
    "card_type": "mixed",
    "body": "The p-block chapter opens with a trend diagram across and down the p-block.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Across a period: electronegativity, ionization enthalpy and oxidizing power increase.",
      "Down a group: covalent radius, van der Waals radius and metallic character increase.",
      "The source notes enthalpy of atomization trend down group except for $N_2$, $O_2$ and $F_2$."
    ],
    "importance": 5,
    "source_page": 78,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-13-trends-reactions",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 13: Boron Family Basics",
    "card_type": "formula",
    "body": "The boron family card covers source-backed oxidation state and reactivity shown at the start of Group 13.",
    "formulas": [
      {
        "latex": "2Al(s)+6HCl(aq)\\rightarrow 2Al^{3+}(aq)+6Cl^-(aq)+3H_2(g)"
      },
      {
        "latex": "2Al(s)+2NaOH(aq)+6H_2O(l)\\rightarrow 2Na^+[Al(OH)_4]^-(aq)+3H_2(g)"
      },
      {
        "latex": "2E(s)+3X_2(g)\\rightarrow 2EX_3(s)\\quad (X=F,Cl,Br,I)"
      }
    ],
    "variables": [],
    "conditions": [
      "General oxidation state of Group 13 is +3."
    ],
    "importance": 5,
    "source_page": 78,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-boron-compounds",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Species",
        "Source-backed relationship"
      ],
      "rows": [
        [
          "Boron",
          "With limited air/oxygen forms $B_2O_3$; with $N_2$ gives BN."
        ],
        [
          "$H_3BO_3$",
          "Forms $B_2O_3$ through $HBO_2$ on heating."
        ],
        [
          "$Na_2B_4O_7$",
          "Linked to $H_3BO_3$, $NaBO_2$, $BF_3$, $B_2H_6$ and boron nitride in the source map."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Boron Compound Relationships",
    "card_type": "table",
    "body": "The source gives large boron and borax reaction maps; clear relationships are grouped here.",
    "formulas": [
      {
        "latex": "Na_2B_4O_7+HCl\\rightarrow H_3BO_3"
      },
      {
        "latex": "H_3BO_3\\xrightarrow{100^\\circ C}HBO_2\\xrightarrow{\\text{red hot}}B_2O_3"
      },
      {
        "latex": "BF_3\\xrightarrow{NaH,453K}B_2H_6"
      }
    ],
    "variables": [],
    "conditions": [
      "The full boron and borax radial maps are intentionally left to the PDF fallback."
    ],
    "importance": 4,
    "source_page": 79,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-diborane-cleavage",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Diborane Cleavage",
    "card_type": "formula",
    "body": "The handbook distinguishes unsymmetrical and symmetrical cleavage of diborane.",
    "formulas": [
      {
        "latex": "B_2H_6+2NH_3\\rightarrow [H_2B(NH_3)_2]^+ + [BH_4]^-"
      },
      {
        "latex": "2(CH_3)_3N+B_2H_6\\rightarrow 2H_3B\\leftarrow N(CH_3)_3"
      },
      {
        "latex": "B_2H_6+2CO\\xrightarrow{200^\\circ C,20\\ atm}2BH_3CO"
      }
    ],
    "variables": [],
    "conditions": [
      "Small amines such as $NH_3$, $CH_3NH_2$ and $(CH_3)_2NH$ give unsymmetrical cleavage.",
      "Large amines such as $(CH_3)_3N$ and pyridine give symmetrical cleavage."
    ],
    "importance": 5,
    "source_page": 80,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-14-basics",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Oxidation states",
          "Common oxidation states are +4 and +2; carbon also exhibits negative oxidation states."
        ],
        [
          "Heavier members",
          "Tendency to show +2 oxidation state increases: Ge < Sn < Pb."
        ],
        [
          "Oxygen",
          "On heating in oxygen, members form monoxides MO and dioxides $MO_2$."
        ],
        [
          "Water",
          "Tin decomposes steam to form dioxide and dihydrogen gas."
        ],
        [
          "Halogens",
          "Halides of formula $MX_2$ and $MX_4$; stability of dihalides increases down the group."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 14: Carbon Family Basics",
    "card_type": "table",
    "body": "The carbon family section lists members, configuration, oxidation states and reactivity trends.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^2"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: C, Si, Ge, Sn and Pb."
    ],
    "importance": 5,
    "source_page": 80,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-14-catenation",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Bond",
        "Bond enthalpy / kJ mol$^{-1}$"
      ],
      "rows": [
        [
          "C-C",
          "348"
        ],
        [
          "Si-Si",
          "297"
        ],
        [
          "Ge-Ge",
          "260"
        ],
        [
          "Sn-Sn",
          "240"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 14 Catenation",
    "card_type": "table",
    "body": "The source connects carbon allotropy to catenation and p-p pi bond formation.",
    "formulas": [
      {
        "latex": "C\\gg Si>Ge\\approx Sn"
      }
    ],
    "variables": [],
    "conditions": [
      "Lead does not show catenation."
    ],
    "importance": 5,
    "source_page": 81,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-carbon-allotropes",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Allotrope",
        "Source-backed structure/property"
      ],
      "rows": [
        [
          "Diamond",
          "$sp^3$ hybridisation; each carbon linked tetrahedrally to four others; C-C length 154 pm; rigid 3D network."
        ],
        [
          "Graphite",
          "Layered structure; layers held by van der Waals forces; layer distance 340 pm; in-layer C-C length 141.5 pm; $sp^2$ carbon."
        ],
        [
          "$C_{60}$ fullerene",
          "Soccer-ball shape; 60 vertices; twenty six-membered rings and twelve five-membered rings; C-C distances 143.5 pm and 138.3 pm."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Carbon Allotropes",
    "card_type": "table",
    "body": "The source compares diamond, graphite and fullerene structures.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 81,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-silicate-classification",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Class shown",
        "Source-backed label"
      ],
      "rows": [
        [
          "A",
          "Orthosilicates"
        ],
        [
          "B",
          "Pyrosilicate"
        ],
        [
          "C",
          "Cyclic silicates"
        ],
        [
          "D",
          "Chain silicates"
        ],
        [
          "E",
          "Two-dimensional sheet silicates"
        ],
        [
          "F",
          "Three-dimensional sheet silicates"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-silicate-tetrahedra"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Silicate Classification",
    "card_type": "mixed",
    "body": "The source shows several silicate classes based on sharing of $SiO_4^{4-}$ tetrahedra.",
    "formulas": [
      {
        "latex": "(Si_2O_5)_n^{2n-}"
      }
    ],
    "variables": [],
    "conditions": [
      "Two-dimensional sheet silicates share three oxygen atoms of each tetrahedron with adjacent tetrahedra.",
      "Three-dimensional silicates share all four oxygen atoms with adjacent tetrahedral units."
    ],
    "importance": 4,
    "source_page": 83,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-silicones",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Silicones",
    "card_type": "formula",
    "body": "The source lists precursor types and hydrolysis behavior for silicones.",
    "formulas": [
      {
        "latex": "R_3SiCl"
      },
      {
        "latex": "R_2SiCl_2"
      },
      {
        "latex": "RSiCl_3"
      },
      {
        "latex": "2(CH_3)_3SiCl\\xrightarrow{H_2O}2(CH_3)_3SiOH"
      }
    ],
    "variables": [],
    "conditions": [
      "Hydrolysis of a mixture of $(CH_3)_3SiCl$ and $(CH_3)_2SiCl_2$ gives silicone chain structure shown in the source.",
      "Hydrolysis of $CH_3SiCl_3$ gives a complex cross-linked polymer.",
      "The hydrocarbon layer along the silicon-oxygen chain makes silicones water-repellent."
    ],
    "importance": 4,
    "source_page": 84,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-15-basics",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Radii",
          "Covalent and ionic radii in a particular state increase down the group."
        ],
        [
          "Metallic character",
          "Increases down the group."
        ],
        [
          "Oxidation states",
          "Common oxidation states are -3, +3 and +5."
        ],
        [
          "Inert pair trend",
          "+5 stability decreases and +3 stability increases down the group."
        ],
        [
          "Nitrogen with oxygen",
          "Nitrogen also exhibits +1, +2 and +4 oxidation states."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15: Nitrogen Family Trends",
    "card_type": "table",
    "body": "The nitrogen family section lists configuration, radii, physical properties and oxidation trends.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^3"
      }
    ],
    "variables": [],
    "conditions": [
      "Except nitrogen, all elements show allotropy."
    ],
    "importance": 5,
    "source_page": 84,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-15-hydrides",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "$NH_3$",
        "$PH_3$",
        "$AsH_3$",
        "$SbH_3$",
        "$BiH_3$"
      ],
      "rows": [
        [
          "m.p. / K",
          "195.2",
          "139.5",
          "156.7",
          "185",
          "-"
        ],
        [
          "b.p. / K",
          "238.5",
          "185.5",
          "210.6",
          "254.6",
          "290"
        ],
        [
          "E-H distance / pm",
          "101.7",
          "141.9",
          "151.9",
          "170.7",
          "-"
        ],
        [
          "HEH angle / degree",
          "107.8",
          "93.6",
          "91.8",
          "91.3",
          "-"
        ],
        [
          "$\\Delta_fH^\\circ$ / kJ mol$^{-1}$",
          "-46.1",
          "13.4",
          "66.4",
          "145.1",
          "278"
        ],
        [
          "$\\Delta_{diss}H(E-H)$ / kJ mol$^{-1}$",
          "389",
          "322",
          "297",
          "255",
          "-"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15 Hydrides",
    "card_type": "table",
    "body": "The source gives hydride trends and a property table for $NH_3$ through $BiH_3$.",
    "formulas": [
      {
        "latex": "NH_3>PH_3>AsH_3>SbH_3\\ge BiH_3"
      }
    ],
    "variables": [],
    "conditions": [
      "Basicity decreases in the displayed order; reducing character of hydrides increases as stability decreases."
    ],
    "importance": 5,
    "source_page": 85,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-15-oxides-halides-binary",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15 Oxides, Halides and Binary Compounds",
    "card_type": "formula",
    "body": "The source gives acidity trends, halide hydrolysis examples and binary compounds in -3 oxidation state.",
    "formulas": [
      {
        "latex": "PCl_3+H_2O\\rightarrow H_3PO_3+HCl"
      },
      {
        "latex": "SbCl_3+H_2O\\rightarrow SbOCl\\downarrow +2HCl"
      },
      {
        "latex": "BiCl_3+H_2O\\rightarrow BiOCl\\downarrow +2HCl"
      }
    ],
    "variables": [],
    "conditions": [
      "Higher oxidation-state oxides are more acidic than lower oxidation-state oxides.",
      "Acidic character of oxides decreases down the group.",
      "Nitrogen does not form pentahalide due to non-availability of d-orbitals.",
      "Examples of binary compounds: $Ca_3N_2$, $Ca_3P_2$, $Na_3As_2$."
    ],
    "importance": 5,
    "source_page": 85,
    "sort_order": 12
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-nitrogen-oxides",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Name",
        "Formula",
        "N oxidation state",
        "Preparation / appearance"
      ],
      "rows": [
        [
          "Dinitrogen oxide",
          "$N_2O$",
          "+1",
          "$NH_4NO_3\\xrightarrow{Heat}N_2O+2H_2O$; colourless neutral gas"
        ],
        [
          "Nitrogen monoxide",
          "$NO$",
          "+2",
          "$2NaNO_2+2FeSO_4+3H_2SO_4\\rightarrow Fe_2(SO_4)_3+2NaHSO_4+2H_2O+2NO$; colourless neutral gas"
        ],
        [
          "Dinitrogen trioxide",
          "$N_2O_3$",
          "+3",
          "$2NO+N_2O_4\\xrightarrow{250K}2N_2O_3$; blue acidic solid"
        ],
        [
          "Nitrogen dioxide",
          "$NO_2$",
          "+4",
          "$2Pb(NO_3)_2\\xrightarrow{673K}4NO_2+2PbO+O_2$; brown acidic gas"
        ],
        [
          "Dinitrogen tetroxide",
          "$N_2O_4$",
          "+4",
          "$2NO_2\\rightleftharpoons N_2O_4$; colourless acidic solid/liquid"
        ],
        [
          "Dinitrogen pentoxide",
          "$N_2O_5$",
          "+5",
          "$4HNO_3+P_4O_{10}\\rightarrow 4HPO_3+2N_2O_5$; colourless acidic solid"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxides of Nitrogen",
    "card_type": "table",
    "body": "The source table lists nitrogen oxides, oxidation state, preparation and appearance.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 86,
    "sort_order": 13
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-phosphorus-allotropes",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Phosphorus Allotropes",
    "card_type": "formula",
    "body": "The source states preparation temperatures and thermodynamic stability order for phosphorus allotropes.",
    "formulas": [
      {
        "latex": "\\text{black}>\\text{red}>\\text{white}"
      }
    ],
    "variables": [],
    "conditions": [
      "Red phosphorus is produced at 573 K.",
      "Alpha-black phosphorus is formed when red phosphorus is heated in a sealed tube at 803 K.",
      "Beta-black phosphorus is prepared by heating white phosphorus at 473 K under high pressure."
    ],
    "importance": 4,
    "source_page": 87,
    "sort_order": 14
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-oxoacids-phosphorus",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Acid",
        "Formula",
        "P oxidation state",
        "Characteristic bonds / preparation"
      ],
      "rows": [
        [
          "Hypophosphorous",
          "$H_3PO_2$",
          "+1",
          "One P-OH, two P-H, one P=O; white $P_4$ + alkali"
        ],
        [
          "Orthophosphorous",
          "$H_3PO_3$",
          "+3",
          "Two P-OH, one P-H, one P=O; $P_2O_3+H_2O$"
        ],
        [
          "Pyrophosphorous",
          "$H_4P_2O_5$",
          "+3",
          "Two P-OH, two P-H, two P=O; $PCl_3+H_3PO_3$"
        ],
        [
          "Hypophosphoric",
          "$H_4P_2O_6$",
          "+4",
          "Four P-OH, two P=O, one P-P; red $P_4$ + alkali"
        ],
        [
          "Orthophosphoric",
          "$H_3PO_4$",
          "+5",
          "Three P-OH, one P=O; $P_4O_{10}+H_2O$"
        ],
        [
          "Pyrophosphoric",
          "$H_4P_2O_7$",
          "+5",
          "Four P-OH, two P=O, one P-O-P; heat phosphoric acid"
        ],
        [
          "Metaphosphoric",
          "$(HPO_3)_3$",
          "+5",
          "Three P-OH, three P=O, three P-O-P; phosphorus acid + $Br_2$, heat in sealed tube"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxoacids of Phosphorus",
    "card_type": "table",
    "body": "The handbook gives formula, oxidation state, characteristic bonds and preparation for phosphorus oxoacids.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 87,
    "sort_order": 15
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-16-basics",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Radii",
          "Atomic and ionic radii increase from top to bottom; oxygen atom is exceptionally small."
        ],
        [
          "Nature",
          "O and S are non-metals; Se and Te metalloids; Po is a short-lived radioactive metal."
        ],
        [
          "Melting/boiling points",
          "Increase with atomic number down the group."
        ],
        [
          "Catenation",
          "Decreases down the group; prominently displayed by sulphur $S_8$."
        ],
        [
          "Oxidation states",
          "+2, +4 and +6; +4 and +6 are more common."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16: Oxygen Family Trends",
    "card_type": "table",
    "body": "The oxygen family section gives configuration, radii, physical properties, catenation and oxidation states.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^4"
      }
    ],
    "variables": [],
    "conditions": [
      "Oxygen is anomalous due to small size and high electronegativity; absence of d-orbitals limits its covalency to four."
    ],
    "importance": 5,
    "source_page": 88,
    "sort_order": 16
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-16-hydrides",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "$H_2O$",
        "$H_2S$",
        "$H_2Se$",
        "$H_2Te$"
      ],
      "rows": [
        [
          "m.p. / K",
          "273",
          "188",
          "208",
          "222"
        ],
        [
          "b.p. / K",
          "373",
          "213",
          "232",
          "269"
        ],
        [
          "H-E distance / pm",
          "96",
          "134",
          "146",
          "169"
        ],
        [
          "HEH angle / degree",
          "104",
          "92",
          "91",
          "90"
        ],
        [
          "$\\Delta_fH$ / kJ mol$^{-1}$",
          "-286",
          "-20",
          "73",
          "100"
        ],
        [
          "$\\Delta_{diss}H(H-E)$ / kJ mol$^{-1}$",
          "463",
          "347",
          "276",
          "238"
        ],
        [
          "Dissociation constant",
          "$1.8\\times 10^{-16}$",
          "$1.3\\times 10^{-7}$",
          "$1.3\\times 10^{-4}$",
          "$2.3\\times 10^{-3}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16 Hydrides",
    "card_type": "table",
    "body": "The source gives hydride acidity, thermal stability, reducing property and a property table.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Acidic character increases from $H_2O$ to $H_2Te$.",
      "Thermal stability decreases from $H_2O$ to $H_2Po$.",
      "All hydrides except water possess reducing property; reducing property increases from $H_2S$ to $H_2Te$."
    ],
    "importance": 5,
    "source_page": 89,
    "sort_order": 17
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-16-oxides-halides",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16 Oxides and Halides",
    "card_type": "formula",
    "body": "The source states dioxide reducing trend, halide stability and dimeric monohalide behavior.",
    "formulas": [
      {
        "latex": "2Se_2Cl_2\\rightarrow SeCl_4+3Se"
      }
    ],
    "variables": [],
    "conditions": [
      "Reducing property of dioxide decreases from $SO_2$ to $TeO_2$; $SO_2$ is reducing while $TeO_2$ is oxidising.",
      "Oxides are generally acidic.",
      "Halide stability decreases in the order F > Cl > Br > I.",
      "$SF_6$ is exceptionally stable for steric reasons.",
      "Well-known monohalides are dimeric: $S_2F_2$, $S_2Cl_2$, $S_2Br_2$, $Se_2Cl_2$ and $Se_2Br_2$."
    ],
    "importance": 4,
    "source_page": 89,
    "sort_order": 18
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-sulphur-oxoacids-contact-process",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Series",
        "Formula",
        "Oxidation state",
        "Name"
      ],
      "rows": [
        [
          "Sulphurous acid series",
          "$H_2SO_3$",
          "S(IV)",
          "sulphurous acid"
        ],
        [
          "Sulphuric acid series",
          "$H_2SO_4$",
          "S(VI)",
          "sulphuric acid"
        ],
        [
          "Peroxo acid series",
          "$H_2SO_5$",
          "S(VI)",
          "peroxomonosulphuric acid / Caro acid"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sulphur Oxoacids and Contact Process",
    "card_type": "table",
    "body": "The source shows sulphurous, sulphuric and peroxo acid series plus the contact-process chain.",
    "formulas": [
      {
        "latex": "S+O_2\\rightarrow SO_2\\xrightarrow{O_2/V_2O_5}SO_3\\xrightarrow{H_2O}H_2SO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "The full $H_2SO_4$ reaction map remains in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 91,
    "sort_order": 19
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-17-basics",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 17: Halogen Family Trends",
    "card_type": "formula",
    "body": "The halogen family section gives membership, configuration, physical states and oxidation behavior.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^5"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: F, Cl, Br, I and At.",
      "Halogens have the smallest atomic radii in their respective periods due to maximum effective nuclear charge.",
      "Fluorine and chlorine are gases, bromine is liquid and iodine is solid.",
      "Melting and boiling points steadily increase with atomic number.",
      "X-X bond dissociation enthalpy trend from chlorine onward: Cl-Cl > Br-Br > F-F > I-I."
    ],
    "importance": 5,
    "source_page": 92,
    "sort_order": 20
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-halogen-water-reactions",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Halogen Oxidation States and Water Reactions",
    "card_type": "formula",
    "body": "The source gives oxidation states and three aqueous reactions for halogens.",
    "formulas": [
      {
        "latex": "2F_2(g)+2H_2O(l)\\rightarrow 4H^+(aq)+4F^-(aq)+O_2(g)"
      },
      {
        "latex": "X_2(g)+H_2O(l)\\rightarrow HX(aq)+HOX(aq)\\quad (X=Cl\\ or\\ Br)"
      },
      {
        "latex": "4I^-(aq)+4H^+(aq)+O_2(g)\\rightarrow 2I_2(s)+2H_2O(l)"
      }
    ],
    "variables": [],
    "conditions": [
      "All halogens exhibit -1 oxidation state; Cl, Br and I also exhibit +1, +3, +5 and +7."
    ],
    "importance": 5,
    "source_page": 92,
    "sort_order": 21
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-chlorine-hx-bleaching-powder",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Family",
        "Source-backed item"
      ],
      "rows": [
        [
          "Chlorine",
          "Prepared from $KMnO_4$ or $MnO_2$ with concentrated HCl; also from NaCl by electrolysis."
        ],
        [
          "Hydrogen halides",
          "$H_2+X_2\\rightarrow HX$ is shown as the general route."
        ],
        [
          "Bleaching powder",
          "Composition shown as $Ca(OCl)_2\\cdot CaCl_2\\cdot Ca(OH)_2\\cdot 2H_2O$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chlorine, Hydrogen Halides and Bleaching Powder",
    "card_type": "table",
    "body": "The source maps chlorine, hydrogen halides and bleaching powder reaction families.",
    "formulas": [
      {
        "latex": "NaCl+conc.\\ H_2SO_4\\rightarrow HCl"
      },
      {
        "latex": "CaF_2+H_2SO_4\\rightarrow HF"
      },
      {
        "latex": "4HBr+O_2\\rightarrow 2Br_2+2H_2O"
      },
      {
        "latex": "Ca(OCl)_2\\cdot CaCl_2\\cdot Ca(OH)_2\\cdot 2H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "The source notes HBr and HI are strong reducing agents and reduce $H_2SO_4$ to $SO_2$."
    ],
    "importance": 4,
    "source_page": 93,
    "sort_order": 22
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-chlorine-oxides-oxyacids",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Central species",
        "Clear source-backed links"
      ],
      "rows": [
        [
          "$Cl_2O$",
          "From $Cl_2$ and $HgO$; gives $HOCl$ with water and $KOCl$ with KOH."
        ],
        [
          "$ClO_2$",
          "Linked to $KClO_3$, $NaClO_3$, $Cl_2O_6$, $KClO_2+KClO_3$ and $O_2+NaClO_2$."
        ],
        [
          "$Cl_2O_6$",
          "Gives $KClO_3+KClO_4$ with KOH and $NaClO_3$ with NaOH/$H_2O_2$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chlorine Oxides and Oxyacid Map",
    "card_type": "table",
    "body": "The source shows maps involving $Cl_2O$, $ClO_2$, $Cl_2O_6$, $HClO_4$, $Cl_2O_7$ and chlorates/perchlorates.",
    "formulas": [
      {
        "latex": "Cl_2O\\xrightarrow{\\Delta}Cl_2+O_2"
      },
      {
        "latex": "Cl_2O+H_2O\\rightarrow HOCl"
      },
      {
        "latex": "HClO_4\\xrightarrow{P_2O_5}Cl_2O_7"
      }
    ],
    "variables": [],
    "conditions": [
      "Crowded map-only reactions are left to the PDF fallback."
    ],
    "importance": 3,
    "source_page": 94,
    "sort_order": 23
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-group-18-basics",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Air abundance",
          "Most abundant is Ar; order: Ar > Ne > Kr > He > Xe."
        ],
        [
          "Atomic radii",
          "Increase down the group with atomic number."
        ],
        [
          "Physical properties",
          "Monoatomic, colourless, tasteless and sparingly soluble in water."
        ],
        [
          "Boiling/melting points",
          "Very low because the only interatomic interaction is weak dispersion force."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 18: Noble Gas Basics",
    "card_type": "table",
    "body": "The noble gas section lists members, abundance, configuration, radii and physical properties.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^6"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: He, Ne, Ar, Kr, Xe and Rn."
    ],
    "importance": 4,
    "source_page": 94,
    "sort_order": 24
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-noble-gas-inertness-xe",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Noble Gas Inertness and Xenon Chemistry",
    "card_type": "formula",
    "body": "The source explains noble-gas inertness and Bartlett's xenon-compound discovery.",
    "formulas": [
      {
        "latex": "O_2^+PtF_6^-"
      },
      {
        "latex": "Xe^+PtF_6^-"
      }
    ],
    "variables": [],
    "conditions": [
      "Noble gases except helium have filled $ns^2np^6$ valence configuration.",
      "They have high ionisation enthalpy and more positive electron gain enthalpy.",
      "First ionisation enthalpy of $O_2$ is 1175 kJ mol$^{-1}$; that of Xe is 1170 kJ mol$^{-1}$.",
      "After Bartlett's observation, xenon compounds with fluorine and oxygen were synthesised."
    ],
    "importance": 5,
    "source_page": 95,
    "sort_order": 25
  },
  {
    "id": "jee-chemistry-p-block-elements-compounds-helium-clathrates-xef2",
    "chapter_id": "jee-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-xef2-linear"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Helium, Clathrates and $XeF_2$",
    "card_type": "mixed",
    "body": "The handbook closes the p-block section with He(I)/He(II), clathrates and a xenon difluoride map.",
    "formulas": [
      {
        "latex": "He(I):\\ 4.2K"
      },
      {
        "latex": "He(II):\\ 2.2K"
      },
      {
        "latex": "Xe+F_2\\xrightarrow{873K,1\\ bar}XeF_2"
      }
    ],
    "variables": [],
    "conditions": [
      "He(II) is called superfluid and has very high thermal conductivity and very low viscosity.",
      "Clathrates form when Xe atoms are trapped in ice cavities.",
      "Clathrates help store radioactive isotopes of Kr and Xe from nuclear reactors.",
      "The detailed $XeF_2$ reaction map remains available in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 95,
    "sort_order": 26
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-group-members-hydration",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Members",
          "columns": [
            "Group",
            "Elements listed"
          ],
          "rows": [
            [
              "Group 1",
              "Li, Na, K, Rb, Cs and Fr"
            ],
            [
              "Group 2",
              "Be, Mg, Ca, Sr, Ba and Ra"
            ]
          ]
        },
        {
          "title": "Hydration",
          "columns": [
            "Ions",
            "Source-backed trend"
          ],
          "rows": [
            [
              "Alkali metal ions",
              "Hydration enthalpies decrease with increase in ionic size; $Li^+$ has maximum hydration."
            ],
            [
              "Alkaline earth metal ions",
              "$Be^{2+}>Mg^{2+}>Ca^{2+}>Sr^{2+}>Ba^{2+}$."
            ],
            [
              "Group comparison",
              "Alkaline earth metal ion hydration enthalpies are larger than alkali metal ion hydration enthalpies."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 1, Group 2 and Hydration",
    "card_type": "table",
    "body": "The s-block section opens with group membership and hydration trends.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Lithium salts are mostly hydrated; the source example is $LiCl\\cdot 2H_2O$."
    ],
    "importance": 5,
    "source_page": 74,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-alkali-physical-flame",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Metal",
        "Flame colour"
      ],
      "rows": [
        [
          "Li",
          "Crimson red"
        ],
        [
          "Na",
          "Yellow"
        ],
        [
          "K",
          "Violet/Lilac"
        ],
        [
          "Rb",
          "Red violet"
        ],
        [
          "Cs",
          "Blue"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkali Metals: Physical Properties and Flame Colours",
    "card_type": "table",
    "body": "The source describes alkali metals as silvery white, soft, light metals with low density and low melting/boiling points.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Alkali metals and their salts impart characteristic colour to an oxidizing flame."
    ],
    "importance": 4,
    "source_page": 74,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-alkali-chemical-properties",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkali Metals: Chemical Properties",
    "card_type": "formula",
    "body": "The source links high alkali-metal reactivity to larger size and low ionisation enthalpy.",
    "formulas": [
      {
        "latex": "M+(x+y)NH_3\\rightarrow [M(NH_3)_x]^+ + [e(NH_3)_y]^-"
      },
      {
        "latex": "M^+(am)+e^-+NH_3(l)\\xrightarrow{\\text{on standing}}MNH_2(am)+\\frac{1}{2}H_2(g)"
      }
    ],
    "variables": [],
    "conditions": [
      "In oxygen: lithium forms monoxide, sodium forms peroxide and the other metals form superoxide.",
      "Reducing nature: lithium is most powerful and sodium is least powerful among the listed alkali metals.",
      "Liquid ammonia solutions are deep blue, conducting and paramagnetic; concentrated solution turns bronze and diamagnetic."
    ],
    "importance": 5,
    "source_page": 74,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-lithium-anomaly-diagonal",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Comparison",
        "Source-backed values"
      ],
      "rows": [
        [
          "Atomic radii",
          "Li = 152 pm; Mg = 160 pm"
        ],
        [
          "Ionic radii",
          "$Li^+ = 76$ pm; $Mg^{2+} = 72$ pm"
        ],
        [
          "Lithium reasons",
          "Exceptionally small atom and ion; high charge/radius ratio."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anomalous Lithium and Li-Mg Diagonal Relation",
    "card_type": "table",
    "body": "Lithium is anomalous due to small atom/ion size and high polarising power.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The source says Li-Mg similarity arises because of similar size."
    ],
    "importance": 5,
    "source_page": 75,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-alkaline-earth-properties",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": {
      "sections": [
        {
          "title": "Flame colours",
          "columns": [
            "Be",
            "Mg",
            "Ca",
            "Sr",
            "Ba"
          ],
          "rows": [
            [
              "No colour",
              "No colour",
              "Brick red",
              "Crimson",
              "Apple green"
            ]
          ]
        },
        {
          "title": "Chemical behavior",
          "columns": [
            "Property",
            "Source-backed point"
          ],
          "rows": [
            [
              "Air and water",
              "Be and Mg are inert to oxygen and water; Mg burns in air to give $MgO$ and $Mg_3N_2$."
            ],
            [
              "Ca, Sr, Ba",
              "Readily attacked by air to form oxide and nitride."
            ],
            [
              "Reducing nature",
              "Strong reducing agents, indicated by large negative reduction potentials."
            ]
          ]
        }
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alkaline Earth Metals: Properties",
    "card_type": "table",
    "body": "The source compares alkaline earth physical and chemical behavior with alkali metals.",
    "formulas": [
      {
        "latex": "M+(x+y)NH_3\\rightarrow [M(NH_3)_x]^{2+}+2[e(NH_3)_y]^-"
      }
    ],
    "variables": [],
    "conditions": [
      "From liquid ammonia solutions, ammoniates $[M(NH_3)_6]^{2+}$ can be recovered."
    ],
    "importance": 5,
    "source_page": 76,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-beryllium-anomaly-diagonal",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anomalous Beryllium and Be-Al Diagonal Relation",
    "card_type": "formula",
    "body": "Beryllium differs from the rest of Group 2 and shows a diagonal relationship with aluminium.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The ionic radius of $Be^{2+}$ is estimated to be 31 pm.",
      "The charge/radius ratio is nearly the same as that of $Al^{3+}$, so beryllium resembles aluminium in some ways."
    ],
    "importance": 5,
    "source_page": 76,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-sodium-oxide-peroxide",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": {
      "columns": [
        "Compound",
        "Clear source-backed relationships"
      ],
      "rows": [
        [
          "$Na_2O$",
          "From Na with limited $O_2$; reacts with $H_2O$ to form $NaOH$; with $NH_3$ gives $NaNH_2+NaOH$; with $Al_2O_3$ gives $NaAlO_2$."
        ],
        [
          "$Na_2O_2$",
          "From Na with excess $O_2$/combustion; with $H_2O$ gives $NaOH+H_2O_2$; with $CO_2$ gives $Na_2CO_3+O_2$; with Al gives $Al_2O_3+Na_2O$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sodium Oxide and Sodium Peroxide",
    "card_type": "table",
    "body": "The source gives reaction maps for sodium oxide and sodium peroxide; the clear products are grouped here.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "The full radial reaction maps remain available through the PDF fallback."
    ],
    "importance": 4,
    "source_page": 76,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-s-block-elements-compounds-sodium-carbonate-lime-bleaching-powder",
    "chapter_id": "neet-chemistry-s-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sodium Carbonate, Lime and Bleaching Powder",
    "card_type": "formula",
    "body": "The source shows a Solvay-route chain, lime-water preparation, and bleaching powder equation.",
    "formulas": [
      {
        "latex": "NH_3+CO_2+H_2O\\rightarrow NH_4HCO_3"
      },
      {
        "latex": "NH_4HCO_3+NaCl\\rightarrow NaHCO_3"
      },
      {
        "latex": "CaCO_3\\xrightarrow{1000^\\circ C}CaO\\xrightarrow{H_2O}Ca(OH)_2"
      },
      {
        "latex": "3Ca(OH)_2+2Cl_2\\rightarrow Ca(OCl)_2\\cdot Ca(OH)_2\\cdot CaCl_2\\cdot 2H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "Clear solution of $Ca(OH)_2$ is identified as lime water."
    ],
    "importance": 4,
    "source_page": 78,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-p-block-overall-trends",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-pblock-trends"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "p-Block Overall Trends",
    "card_type": "mixed",
    "body": "The p-block chapter opens with a trend diagram across and down the p-block.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Across a period: electronegativity, ionization enthalpy and oxidizing power increase.",
      "Down a group: covalent radius, van der Waals radius and metallic character increase.",
      "The source notes enthalpy of atomization trend down group except for $N_2$, $O_2$ and $F_2$."
    ],
    "importance": 5,
    "source_page": 78,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-13-trends-reactions",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 13: Boron Family Basics",
    "card_type": "formula",
    "body": "The boron family card covers source-backed oxidation state and reactivity shown at the start of Group 13.",
    "formulas": [
      {
        "latex": "2Al(s)+6HCl(aq)\\rightarrow 2Al^{3+}(aq)+6Cl^-(aq)+3H_2(g)"
      },
      {
        "latex": "2Al(s)+2NaOH(aq)+6H_2O(l)\\rightarrow 2Na^+[Al(OH)_4]^-(aq)+3H_2(g)"
      },
      {
        "latex": "2E(s)+3X_2(g)\\rightarrow 2EX_3(s)\\quad (X=F,Cl,Br,I)"
      }
    ],
    "variables": [],
    "conditions": [
      "General oxidation state of Group 13 is +3."
    ],
    "importance": 5,
    "source_page": 78,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-boron-compounds",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Species",
        "Source-backed relationship"
      ],
      "rows": [
        [
          "Boron",
          "With limited air/oxygen forms $B_2O_3$; with $N_2$ gives BN."
        ],
        [
          "$H_3BO_3$",
          "Forms $B_2O_3$ through $HBO_2$ on heating."
        ],
        [
          "$Na_2B_4O_7$",
          "Linked to $H_3BO_3$, $NaBO_2$, $BF_3$, $B_2H_6$ and boron nitride in the source map."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Boron Compound Relationships",
    "card_type": "table",
    "body": "The source gives large boron and borax reaction maps; clear relationships are grouped here.",
    "formulas": [
      {
        "latex": "Na_2B_4O_7+HCl\\rightarrow H_3BO_3"
      },
      {
        "latex": "H_3BO_3\\xrightarrow{100^\\circ C}HBO_2\\xrightarrow{\\text{red hot}}B_2O_3"
      },
      {
        "latex": "BF_3\\xrightarrow{NaH,453K}B_2H_6"
      }
    ],
    "variables": [],
    "conditions": [
      "The full boron and borax radial maps are intentionally left to the PDF fallback."
    ],
    "importance": 4,
    "source_page": 79,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-diborane-cleavage",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Diborane Cleavage",
    "card_type": "formula",
    "body": "The handbook distinguishes unsymmetrical and symmetrical cleavage of diborane.",
    "formulas": [
      {
        "latex": "B_2H_6+2NH_3\\rightarrow [H_2B(NH_3)_2]^+ + [BH_4]^-"
      },
      {
        "latex": "2(CH_3)_3N+B_2H_6\\rightarrow 2H_3B\\leftarrow N(CH_3)_3"
      },
      {
        "latex": "B_2H_6+2CO\\xrightarrow{200^\\circ C,20\\ atm}2BH_3CO"
      }
    ],
    "variables": [],
    "conditions": [
      "Small amines such as $NH_3$, $CH_3NH_2$ and $(CH_3)_2NH$ give unsymmetrical cleavage.",
      "Large amines such as $(CH_3)_3N$ and pyridine give symmetrical cleavage."
    ],
    "importance": 5,
    "source_page": 80,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-14-basics",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Oxidation states",
          "Common oxidation states are +4 and +2; carbon also exhibits negative oxidation states."
        ],
        [
          "Heavier members",
          "Tendency to show +2 oxidation state increases: Ge < Sn < Pb."
        ],
        [
          "Oxygen",
          "On heating in oxygen, members form monoxides MO and dioxides $MO_2$."
        ],
        [
          "Water",
          "Tin decomposes steam to form dioxide and dihydrogen gas."
        ],
        [
          "Halogens",
          "Halides of formula $MX_2$ and $MX_4$; stability of dihalides increases down the group."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 14: Carbon Family Basics",
    "card_type": "table",
    "body": "The carbon family section lists members, configuration, oxidation states and reactivity trends.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^2"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: C, Si, Ge, Sn and Pb."
    ],
    "importance": 5,
    "source_page": 80,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-14-catenation",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Bond",
        "Bond enthalpy / kJ mol$^{-1}$"
      ],
      "rows": [
        [
          "C-C",
          "348"
        ],
        [
          "Si-Si",
          "297"
        ],
        [
          "Ge-Ge",
          "260"
        ],
        [
          "Sn-Sn",
          "240"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 14 Catenation",
    "card_type": "table",
    "body": "The source connects carbon allotropy to catenation and p-p pi bond formation.",
    "formulas": [
      {
        "latex": "C\\gg Si>Ge\\approx Sn"
      }
    ],
    "variables": [],
    "conditions": [
      "Lead does not show catenation."
    ],
    "importance": 5,
    "source_page": 81,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-carbon-allotropes",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Allotrope",
        "Source-backed structure/property"
      ],
      "rows": [
        [
          "Diamond",
          "$sp^3$ hybridisation; each carbon linked tetrahedrally to four others; C-C length 154 pm; rigid 3D network."
        ],
        [
          "Graphite",
          "Layered structure; layers held by van der Waals forces; layer distance 340 pm; in-layer C-C length 141.5 pm; $sp^2$ carbon."
        ],
        [
          "$C_{60}$ fullerene",
          "Soccer-ball shape; 60 vertices; twenty six-membered rings and twelve five-membered rings; C-C distances 143.5 pm and 138.3 pm."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Carbon Allotropes",
    "card_type": "table",
    "body": "The source compares diamond, graphite and fullerene structures.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 81,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-silicate-classification",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Class shown",
        "Source-backed label"
      ],
      "rows": [
        [
          "A",
          "Orthosilicates"
        ],
        [
          "B",
          "Pyrosilicate"
        ],
        [
          "C",
          "Cyclic silicates"
        ],
        [
          "D",
          "Chain silicates"
        ],
        [
          "E",
          "Two-dimensional sheet silicates"
        ],
        [
          "F",
          "Three-dimensional sheet silicates"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-silicate-tetrahedra"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Silicate Classification",
    "card_type": "mixed",
    "body": "The source shows several silicate classes based on sharing of $SiO_4^{4-}$ tetrahedra.",
    "formulas": [
      {
        "latex": "(Si_2O_5)_n^{2n-}"
      }
    ],
    "variables": [],
    "conditions": [
      "Two-dimensional sheet silicates share three oxygen atoms of each tetrahedron with adjacent tetrahedra.",
      "Three-dimensional silicates share all four oxygen atoms with adjacent tetrahedral units."
    ],
    "importance": 4,
    "source_page": 83,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-silicones",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Silicones",
    "card_type": "formula",
    "body": "The source lists precursor types and hydrolysis behavior for silicones.",
    "formulas": [
      {
        "latex": "R_3SiCl"
      },
      {
        "latex": "R_2SiCl_2"
      },
      {
        "latex": "RSiCl_3"
      },
      {
        "latex": "2(CH_3)_3SiCl\\xrightarrow{H_2O}2(CH_3)_3SiOH"
      }
    ],
    "variables": [],
    "conditions": [
      "Hydrolysis of a mixture of $(CH_3)_3SiCl$ and $(CH_3)_2SiCl_2$ gives silicone chain structure shown in the source.",
      "Hydrolysis of $CH_3SiCl_3$ gives a complex cross-linked polymer.",
      "The hydrocarbon layer along the silicon-oxygen chain makes silicones water-repellent."
    ],
    "importance": 4,
    "source_page": 84,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-15-basics",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Radii",
          "Covalent and ionic radii in a particular state increase down the group."
        ],
        [
          "Metallic character",
          "Increases down the group."
        ],
        [
          "Oxidation states",
          "Common oxidation states are -3, +3 and +5."
        ],
        [
          "Inert pair trend",
          "+5 stability decreases and +3 stability increases down the group."
        ],
        [
          "Nitrogen with oxygen",
          "Nitrogen also exhibits +1, +2 and +4 oxidation states."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15: Nitrogen Family Trends",
    "card_type": "table",
    "body": "The nitrogen family section lists configuration, radii, physical properties and oxidation trends.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^3"
      }
    ],
    "variables": [],
    "conditions": [
      "Except nitrogen, all elements show allotropy."
    ],
    "importance": 5,
    "source_page": 84,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-15-hydrides",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "$NH_3$",
        "$PH_3$",
        "$AsH_3$",
        "$SbH_3$",
        "$BiH_3$"
      ],
      "rows": [
        [
          "m.p. / K",
          "195.2",
          "139.5",
          "156.7",
          "185",
          "-"
        ],
        [
          "b.p. / K",
          "238.5",
          "185.5",
          "210.6",
          "254.6",
          "290"
        ],
        [
          "E-H distance / pm",
          "101.7",
          "141.9",
          "151.9",
          "170.7",
          "-"
        ],
        [
          "HEH angle / degree",
          "107.8",
          "93.6",
          "91.8",
          "91.3",
          "-"
        ],
        [
          "$\\Delta_fH^\\circ$ / kJ mol$^{-1}$",
          "-46.1",
          "13.4",
          "66.4",
          "145.1",
          "278"
        ],
        [
          "$\\Delta_{diss}H(E-H)$ / kJ mol$^{-1}$",
          "389",
          "322",
          "297",
          "255",
          "-"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15 Hydrides",
    "card_type": "table",
    "body": "The source gives hydride trends and a property table for $NH_3$ through $BiH_3$.",
    "formulas": [
      {
        "latex": "NH_3>PH_3>AsH_3>SbH_3\\ge BiH_3"
      }
    ],
    "variables": [],
    "conditions": [
      "Basicity decreases in the displayed order; reducing character of hydrides increases as stability decreases."
    ],
    "importance": 5,
    "source_page": 85,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-15-oxides-halides-binary",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 15 Oxides, Halides and Binary Compounds",
    "card_type": "formula",
    "body": "The source gives acidity trends, halide hydrolysis examples and binary compounds in -3 oxidation state.",
    "formulas": [
      {
        "latex": "PCl_3+H_2O\\rightarrow H_3PO_3+HCl"
      },
      {
        "latex": "SbCl_3+H_2O\\rightarrow SbOCl\\downarrow +2HCl"
      },
      {
        "latex": "BiCl_3+H_2O\\rightarrow BiOCl\\downarrow +2HCl"
      }
    ],
    "variables": [],
    "conditions": [
      "Higher oxidation-state oxides are more acidic than lower oxidation-state oxides.",
      "Acidic character of oxides decreases down the group.",
      "Nitrogen does not form pentahalide due to non-availability of d-orbitals.",
      "Examples of binary compounds: $Ca_3N_2$, $Ca_3P_2$, $Na_3As_2$."
    ],
    "importance": 5,
    "source_page": 85,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-nitrogen-oxides",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Name",
        "Formula",
        "N oxidation state",
        "Preparation / appearance"
      ],
      "rows": [
        [
          "Dinitrogen oxide",
          "$N_2O$",
          "+1",
          "$NH_4NO_3\\xrightarrow{Heat}N_2O+2H_2O$; colourless neutral gas"
        ],
        [
          "Nitrogen monoxide",
          "$NO$",
          "+2",
          "$2NaNO_2+2FeSO_4+3H_2SO_4\\rightarrow Fe_2(SO_4)_3+2NaHSO_4+2H_2O+2NO$; colourless neutral gas"
        ],
        [
          "Dinitrogen trioxide",
          "$N_2O_3$",
          "+3",
          "$2NO+N_2O_4\\xrightarrow{250K}2N_2O_3$; blue acidic solid"
        ],
        [
          "Nitrogen dioxide",
          "$NO_2$",
          "+4",
          "$2Pb(NO_3)_2\\xrightarrow{673K}4NO_2+2PbO+O_2$; brown acidic gas"
        ],
        [
          "Dinitrogen tetroxide",
          "$N_2O_4$",
          "+4",
          "$2NO_2\\rightleftharpoons N_2O_4$; colourless acidic solid/liquid"
        ],
        [
          "Dinitrogen pentoxide",
          "$N_2O_5$",
          "+5",
          "$4HNO_3+P_4O_{10}\\rightarrow 4HPO_3+2N_2O_5$; colourless acidic solid"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxides of Nitrogen",
    "card_type": "table",
    "body": "The source table lists nitrogen oxides, oxidation state, preparation and appearance.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 86,
    "sort_order": 13
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-phosphorus-allotropes",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Phosphorus Allotropes",
    "card_type": "formula",
    "body": "The source states preparation temperatures and thermodynamic stability order for phosphorus allotropes.",
    "formulas": [
      {
        "latex": "\\text{black}>\\text{red}>\\text{white}"
      }
    ],
    "variables": [],
    "conditions": [
      "Red phosphorus is produced at 573 K.",
      "Alpha-black phosphorus is formed when red phosphorus is heated in a sealed tube at 803 K.",
      "Beta-black phosphorus is prepared by heating white phosphorus at 473 K under high pressure."
    ],
    "importance": 4,
    "source_page": 87,
    "sort_order": 14
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-oxoacids-phosphorus",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Acid",
        "Formula",
        "P oxidation state",
        "Characteristic bonds / preparation"
      ],
      "rows": [
        [
          "Hypophosphorous",
          "$H_3PO_2$",
          "+1",
          "One P-OH, two P-H, one P=O; white $P_4$ + alkali"
        ],
        [
          "Orthophosphorous",
          "$H_3PO_3$",
          "+3",
          "Two P-OH, one P-H, one P=O; $P_2O_3+H_2O$"
        ],
        [
          "Pyrophosphorous",
          "$H_4P_2O_5$",
          "+3",
          "Two P-OH, two P-H, two P=O; $PCl_3+H_3PO_3$"
        ],
        [
          "Hypophosphoric",
          "$H_4P_2O_6$",
          "+4",
          "Four P-OH, two P=O, one P-P; red $P_4$ + alkali"
        ],
        [
          "Orthophosphoric",
          "$H_3PO_4$",
          "+5",
          "Three P-OH, one P=O; $P_4O_{10}+H_2O$"
        ],
        [
          "Pyrophosphoric",
          "$H_4P_2O_7$",
          "+5",
          "Four P-OH, two P=O, one P-O-P; heat phosphoric acid"
        ],
        [
          "Metaphosphoric",
          "$(HPO_3)_3$",
          "+5",
          "Three P-OH, three P=O, three P-O-P; phosphorus acid + $Br_2$, heat in sealed tube"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Oxoacids of Phosphorus",
    "card_type": "table",
    "body": "The handbook gives formula, oxidation state, characteristic bonds and preparation for phosphorus oxoacids.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 87,
    "sort_order": 15
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-16-basics",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Radii",
          "Atomic and ionic radii increase from top to bottom; oxygen atom is exceptionally small."
        ],
        [
          "Nature",
          "O and S are non-metals; Se and Te metalloids; Po is a short-lived radioactive metal."
        ],
        [
          "Melting/boiling points",
          "Increase with atomic number down the group."
        ],
        [
          "Catenation",
          "Decreases down the group; prominently displayed by sulphur $S_8$."
        ],
        [
          "Oxidation states",
          "+2, +4 and +6; +4 and +6 are more common."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16: Oxygen Family Trends",
    "card_type": "table",
    "body": "The oxygen family section gives configuration, radii, physical properties, catenation and oxidation states.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^4"
      }
    ],
    "variables": [],
    "conditions": [
      "Oxygen is anomalous due to small size and high electronegativity; absence of d-orbitals limits its covalency to four."
    ],
    "importance": 5,
    "source_page": 88,
    "sort_order": 16
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-16-hydrides",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Property",
        "$H_2O$",
        "$H_2S$",
        "$H_2Se$",
        "$H_2Te$"
      ],
      "rows": [
        [
          "m.p. / K",
          "273",
          "188",
          "208",
          "222"
        ],
        [
          "b.p. / K",
          "373",
          "213",
          "232",
          "269"
        ],
        [
          "H-E distance / pm",
          "96",
          "134",
          "146",
          "169"
        ],
        [
          "HEH angle / degree",
          "104",
          "92",
          "91",
          "90"
        ],
        [
          "$\\Delta_fH$ / kJ mol$^{-1}$",
          "-286",
          "-20",
          "73",
          "100"
        ],
        [
          "$\\Delta_{diss}H(H-E)$ / kJ mol$^{-1}$",
          "463",
          "347",
          "276",
          "238"
        ],
        [
          "Dissociation constant",
          "$1.8\\times 10^{-16}$",
          "$1.3\\times 10^{-7}$",
          "$1.3\\times 10^{-4}$",
          "$2.3\\times 10^{-3}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16 Hydrides",
    "card_type": "table",
    "body": "The source gives hydride acidity, thermal stability, reducing property and a property table.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Acidic character increases from $H_2O$ to $H_2Te$.",
      "Thermal stability decreases from $H_2O$ to $H_2Po$.",
      "All hydrides except water possess reducing property; reducing property increases from $H_2S$ to $H_2Te$."
    ],
    "importance": 5,
    "source_page": 89,
    "sort_order": 17
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-16-oxides-halides",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 16 Oxides and Halides",
    "card_type": "formula",
    "body": "The source states dioxide reducing trend, halide stability and dimeric monohalide behavior.",
    "formulas": [
      {
        "latex": "2Se_2Cl_2\\rightarrow SeCl_4+3Se"
      }
    ],
    "variables": [],
    "conditions": [
      "Reducing property of dioxide decreases from $SO_2$ to $TeO_2$; $SO_2$ is reducing while $TeO_2$ is oxidising.",
      "Oxides are generally acidic.",
      "Halide stability decreases in the order F > Cl > Br > I.",
      "$SF_6$ is exceptionally stable for steric reasons.",
      "Well-known monohalides are dimeric: $S_2F_2$, $S_2Cl_2$, $S_2Br_2$, $Se_2Cl_2$ and $Se_2Br_2$."
    ],
    "importance": 4,
    "source_page": 89,
    "sort_order": 18
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-sulphur-oxoacids-contact-process",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Series",
        "Formula",
        "Oxidation state",
        "Name"
      ],
      "rows": [
        [
          "Sulphurous acid series",
          "$H_2SO_3$",
          "S(IV)",
          "sulphurous acid"
        ],
        [
          "Sulphuric acid series",
          "$H_2SO_4$",
          "S(VI)",
          "sulphuric acid"
        ],
        [
          "Peroxo acid series",
          "$H_2SO_5$",
          "S(VI)",
          "peroxomonosulphuric acid / Caro acid"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sulphur Oxoacids and Contact Process",
    "card_type": "table",
    "body": "The source shows sulphurous, sulphuric and peroxo acid series plus the contact-process chain.",
    "formulas": [
      {
        "latex": "S+O_2\\rightarrow SO_2\\xrightarrow{O_2/V_2O_5}SO_3\\xrightarrow{H_2O}H_2SO_4"
      }
    ],
    "variables": [],
    "conditions": [
      "The full $H_2SO_4$ reaction map remains in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 91,
    "sort_order": 19
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-17-basics",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 17: Halogen Family Trends",
    "card_type": "formula",
    "body": "The halogen family section gives membership, configuration, physical states and oxidation behavior.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^5"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: F, Cl, Br, I and At.",
      "Halogens have the smallest atomic radii in their respective periods due to maximum effective nuclear charge.",
      "Fluorine and chlorine are gases, bromine is liquid and iodine is solid.",
      "Melting and boiling points steadily increase with atomic number.",
      "X-X bond dissociation enthalpy trend from chlorine onward: Cl-Cl > Br-Br > F-F > I-I."
    ],
    "importance": 5,
    "source_page": 92,
    "sort_order": 20
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-halogen-water-reactions",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Halogen Oxidation States and Water Reactions",
    "card_type": "formula",
    "body": "The source gives oxidation states and three aqueous reactions for halogens.",
    "formulas": [
      {
        "latex": "2F_2(g)+2H_2O(l)\\rightarrow 4H^+(aq)+4F^-(aq)+O_2(g)"
      },
      {
        "latex": "X_2(g)+H_2O(l)\\rightarrow HX(aq)+HOX(aq)\\quad (X=Cl\\ or\\ Br)"
      },
      {
        "latex": "4I^-(aq)+4H^+(aq)+O_2(g)\\rightarrow 2I_2(s)+2H_2O(l)"
      }
    ],
    "variables": [],
    "conditions": [
      "All halogens exhibit -1 oxidation state; Cl, Br and I also exhibit +1, +3, +5 and +7."
    ],
    "importance": 5,
    "source_page": 92,
    "sort_order": 21
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-chlorine-hx-bleaching-powder",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Family",
        "Source-backed item"
      ],
      "rows": [
        [
          "Chlorine",
          "Prepared from $KMnO_4$ or $MnO_2$ with concentrated HCl; also from NaCl by electrolysis."
        ],
        [
          "Hydrogen halides",
          "$H_2+X_2\\rightarrow HX$ is shown as the general route."
        ],
        [
          "Bleaching powder",
          "Composition shown as $Ca(OCl)_2\\cdot CaCl_2\\cdot Ca(OH)_2\\cdot 2H_2O$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chlorine, Hydrogen Halides and Bleaching Powder",
    "card_type": "table",
    "body": "The source maps chlorine, hydrogen halides and bleaching powder reaction families.",
    "formulas": [
      {
        "latex": "NaCl+conc.\\ H_2SO_4\\rightarrow HCl"
      },
      {
        "latex": "CaF_2+H_2SO_4\\rightarrow HF"
      },
      {
        "latex": "4HBr+O_2\\rightarrow 2Br_2+2H_2O"
      },
      {
        "latex": "Ca(OCl)_2\\cdot CaCl_2\\cdot Ca(OH)_2\\cdot 2H_2O"
      }
    ],
    "variables": [],
    "conditions": [
      "The source notes HBr and HI are strong reducing agents and reduce $H_2SO_4$ to $SO_2$."
    ],
    "importance": 4,
    "source_page": 93,
    "sort_order": 22
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-chlorine-oxides-oxyacids",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Central species",
        "Clear source-backed links"
      ],
      "rows": [
        [
          "$Cl_2O$",
          "From $Cl_2$ and $HgO$; gives $HOCl$ with water and $KOCl$ with KOH."
        ],
        [
          "$ClO_2$",
          "Linked to $KClO_3$, $NaClO_3$, $Cl_2O_6$, $KClO_2+KClO_3$ and $O_2+NaClO_2$."
        ],
        [
          "$Cl_2O_6$",
          "Gives $KClO_3+KClO_4$ with KOH and $NaClO_3$ with NaOH/$H_2O_2$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chlorine Oxides and Oxyacid Map",
    "card_type": "table",
    "body": "The source shows maps involving $Cl_2O$, $ClO_2$, $Cl_2O_6$, $HClO_4$, $Cl_2O_7$ and chlorates/perchlorates.",
    "formulas": [
      {
        "latex": "Cl_2O\\xrightarrow{\\Delta}Cl_2+O_2"
      },
      {
        "latex": "Cl_2O+H_2O\\rightarrow HOCl"
      },
      {
        "latex": "HClO_4\\xrightarrow{P_2O_5}Cl_2O_7"
      }
    ],
    "variables": [],
    "conditions": [
      "Crowded map-only reactions are left to the PDF fallback."
    ],
    "importance": 3,
    "source_page": 94,
    "sort_order": 23
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-group-18-basics",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed item"
      ],
      "rows": [
        [
          "Air abundance",
          "Most abundant is Ar; order: Ar > Ne > Kr > He > Xe."
        ],
        [
          "Atomic radii",
          "Increase down the group with atomic number."
        ],
        [
          "Physical properties",
          "Monoatomic, colourless, tasteless and sparingly soluble in water."
        ],
        [
          "Boiling/melting points",
          "Very low because the only interatomic interaction is weak dispersion force."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Group 18: Noble Gas Basics",
    "card_type": "table",
    "body": "The noble gas section lists members, abundance, configuration, radii and physical properties.",
    "formulas": [
      {
        "latex": "\\text{Electronic configuration}=ns^2np^6"
      }
    ],
    "variables": [],
    "conditions": [
      "Members listed: He, Ne, Ar, Kr, Xe and Rn."
    ],
    "importance": 4,
    "source_page": 94,
    "sort_order": 24
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-noble-gas-inertness-xe",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Noble Gas Inertness and Xenon Chemistry",
    "card_type": "formula",
    "body": "The source explains noble-gas inertness and Bartlett's xenon-compound discovery.",
    "formulas": [
      {
        "latex": "O_2^+PtF_6^-"
      },
      {
        "latex": "Xe^+PtF_6^-"
      }
    ],
    "variables": [],
    "conditions": [
      "Noble gases except helium have filled $ns^2np^6$ valence configuration.",
      "They have high ionisation enthalpy and more positive electron gain enthalpy.",
      "First ionisation enthalpy of $O_2$ is 1175 kJ mol$^{-1}$; that of Xe is 1170 kJ mol$^{-1}$.",
      "After Bartlett's observation, xenon compounds with fluorine and oxygen were synthesised."
    ],
    "importance": 5,
    "source_page": 95,
    "sort_order": 25
  },
  {
    "id": "neet-chemistry-p-block-elements-compounds-helium-clathrates-xef2",
    "chapter_id": "neet-chemistry-p-block-elements-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-xef2-linear"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Helium, Clathrates and $XeF_2$",
    "card_type": "mixed",
    "body": "The handbook closes the p-block section with He(I)/He(II), clathrates and a xenon difluoride map.",
    "formulas": [
      {
        "latex": "He(I):\\ 4.2K"
      },
      {
        "latex": "He(II):\\ 2.2K"
      },
      {
        "latex": "Xe+F_2\\xrightarrow{873K,1\\ bar}XeF_2"
      }
    ],
    "variables": [],
    "conditions": [
      "He(II) is called superfluid and has very high thermal conductivity and very low viscosity.",
      "Clathrates form when Xe atoms are trapped in ice cavities.",
      "Clathrates help store radioactive isotopes of Kr and Xe from nuclear reactors.",
      "The detailed $XeF_2$ reaction map remains available in the PDF fallback."
    ],
    "importance": 4,
    "source_page": 95,
    "sort_order": 26
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
