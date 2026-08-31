insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-chemical-equilibrium', 'jee-chemistry', 'Chemical Equilibrium', 'chemical-equilibrium', 5),
  ('jee-chemistry-ionic-equilibrium', 'jee-chemistry', 'Ionic Equilibrium', 'ionic-equilibrium', 6),
  ('jee-chemistry-electrochemistry', 'jee-chemistry', 'Electrochemistry', 'electrochemistry', 7),
  ('neet-chemistry-chemical-equilibrium', 'neet-chemistry', 'Chemical Equilibrium', 'chemical-equilibrium', 5),
  ('neet-chemistry-ionic-equilibrium', 'neet-chemistry', 'Ionic Equilibrium', 'ionic-equilibrium', 6),
  ('neet-chemistry-electrochemistry', 'neet-chemistry', 'Electrochemistry', 'electrochemistry', 7)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-chemical-equilibrium-equilibrium-conditions-constants",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Constant",
        "Expression"
      ],
      "rows": [
        [
          "$K_c$",
          "$\\frac{K_f}{K_b}=K_c=\\frac{[C]^c[D]^d}{[A]^a[B]^b}$"
        ],
        [
          "$K_p$",
          "$\\frac{[P_C]^c[P_D]^d}{[P_A]^a[P_B]^b}$"
        ],
        [
          "$K_x$",
          "$\\frac{x_C^cx_D^d}{x_A^ax_B^b}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Equilibrium Conditions and Constants",
    "card_type": "table",
    "body": "The source starts Chemical Equilibrium with conditions at equilibrium and expressions for $K$, $K_c$, $K_p$, and $K_x$.",
    "formulas": [
      {
        "latex": "K=\\frac{\\text{rate constant of forward reaction}}{\\text{rate constant of backward reaction}}=\\frac{K_f}{K_b}"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      }
    ],
    "conditions": [
      "At equilibrium: forward and backward rates are equal, concentrations become constant, $\\Delta G=0$, and $Q=K_{eq}$."
    ],
    "importance": 5,
    "source_page": 12,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-chemical-equilibrium-equilibrium-constant-relations",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Relations Among Equilibrium Constants",
    "card_type": "formula",
    "body": "The source gives pressure, mole-fraction, and temperature relations for equilibrium constants.",
    "formulas": [
      {
        "latex": "K_p=K_c(RT)^{\\Delta n}"
      },
      {
        "latex": "K_p=K_x(P)^{\\Delta n}"
      },
      {
        "latex": "\\log\\frac{K_2}{K_1}=\\frac{\\Delta H}{2.303R}\\left[\\frac{1}{T_1}-\\frac{1}{T_2}\\right]"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      },
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      }
    ],
    "conditions": [
      "$\\Delta H$ is enthalpy of reaction."
    ],
    "importance": 5,
    "source_page": 13,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-chemical-equilibrium-gibbs-quotient-dissociation",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Gibbs Relation, Reaction Quotient and Dissociation",
    "card_type": "formula",
    "body": "The source connects equilibrium with standard free energy, quotient, and degree of dissociation.",
    "formulas": [
      {
        "latex": "\\Delta G^\\circ=-2.303RT\\log K"
      },
      {
        "latex": "Q=\\frac{[C]^c[D]^d}{[A]^a[B]^b}"
      },
      {
        "latex": "\\alpha=\\frac{\\text{no. of moles dissociated}}{\\text{initial no. of moles taken}}"
      },
      {
        "latex": "\\%\\text{ dissociation}=\\alpha\\times100"
      }
    ],
    "variables": [
      {
        "latex": "Q",
        "symbol": "$Q$",
        "meaning": "reaction quotient"
      },
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      }
    ],
    "conditions": [
      "$\\alpha$ is also described as the fraction of moles dissociated out of 1 mole."
    ],
    "importance": 5,
    "source_page": 13,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-chemical-equilibrium-observed-molecular-weight",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Observed Molecular Weight and Vapour Density",
    "card_type": "formula",
    "body": "The observed molecular weight and vapour density relation is stated for $A_n(g)$.",
    "formulas": [
      {
        "latex": "\\text{Observed molecular weight}=\\frac{\\text{molecular weight of equilibrium mixture}}{\\text{total no. of moles}}"
      },
      {
        "latex": "\\alpha=\\frac{D-d}{(n-1)d}=\\frac{M_T-M_0}{(n-1)M_0}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 13,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-chemical-equilibrium-le-chatelier-shifts",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Change",
        "Source-backed shift"
      ],
      "rows": [
        [
          "Reactant concentration increased",
          "Forward direction"
        ],
        [
          "Product concentration increased",
          "Backward direction"
        ],
        [
          "Volume increased, $\\Delta n>0$",
          "Forward direction"
        ],
        [
          "Volume increased, $\\Delta n<0$",
          "Backward direction"
        ],
        [
          "Volume increased, $\\Delta n=0$",
          "No shift"
        ],
        [
          "Pressure increased",
          "Direction in which fewer moles of gas are formed"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n>0$",
          "Forward direction"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n<0$",
          "Backward direction"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n=0$",
          "No shift"
        ],
        [
          "Inert gas at constant volume",
          "No effect"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Le Chatelier Shifts",
    "card_type": "table",
    "body": "The source lists concentration, volume, pressure, and inert-gas effects at equilibrium.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      }
    ],
    "conditions": [
      "Le Chatelier principle: the system reacts to minimize the effect of a disturbance."
    ],
    "importance": 5,
    "source_page": 14,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-chemical-equilibrium-temperature-humidity-vant-hoff",
    "chapter_id": "jee-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed relation"
      ],
      "rows": [
        [
          "$\\ln K$ vs $1/T$",
          "Straight line with slope $-\\frac{\\Delta H^\\circ}{R}$ and intercept $\\frac{\\Delta S^\\circ}{R}$"
        ],
        [
          "Endothermic, $\\Delta H>0$",
          "$K$ increases with rise in temperature; reaction shifts forward with increase in temperature"
        ],
        [
          "Exothermic, $\\Delta H<0$",
          "$K$ decreases with increase in temperature; reaction shifts backward with increase in temperature"
        ],
        [
          "Relative humidity",
          "$\\frac{\\text{Partial pressure of }H_2O\\text{ vapours}}{\\text{Vapour pressure of }H_2O\\text{ at that temp.}}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Temperature Effect, Humidity and Van't Hoff Equation",
    "card_type": "table",
    "body": "The source gives the $\\ln K$ plot relation, temperature effects, relative humidity, and Van't Hoff equation.",
    "formulas": [
      {
        "latex": "\\Delta G=\\Delta G^0+2.303RT\\log_{10}Q"
      },
      {
        "latex": "\\log\\left(\\frac{K_1}{K_2}\\right)=\\frac{\\Delta H^0}{2.303R}\\left(\\frac{1}{T_2}-\\frac{1}{T_1}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      },
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 14,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-ostwald-acid-base",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ostwald Dilution Law",
    "card_type": "formula",
    "body": "The Ionic Equilibrium section opens with weak acid and weak base dissociation.",
    "formulas": [
      {
        "label": "Weak acid",
        "latex": "K_a=\\frac{[H^+][A^-]}{[HA]}=\\frac{[C\\alpha][C\\alpha]}{C(1-\\alpha)}=\\frac{C\\alpha^2}{1-\\alpha}"
      },
      {
        "latex": "\\alpha\\ll1\\Rightarrow 1-\\alpha\\simeq1\\quad\\text{or}\\quad K_a=C\\alpha^2\\quad\\text{or}\\quad \\alpha=\\sqrt{\\frac{K_a}{C}}=\\sqrt{K_a\\times V}"
      },
      {
        "label": "Weak base",
        "latex": "\\alpha=\\sqrt{\\frac{K_b}{C}}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "Higher $K_a/K_b$ means the acid/base is stronger."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-ph-scale",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Measure",
        "Relation"
      ],
      "rows": [
        [
          "pH",
          "$pH=-\\log a_{H^+}$; $pH=-\\log[H^+]$; $[H^+]=10^{-pH}$"
        ],
        [
          "pOH",
          "$pOH=-\\log[OH^-]$; $[OH^-]=10^{-pOH}$"
        ],
        [
          "pKa",
          "$pK_a=-\\log K_a$; $K_a=10^{-pK_a}$"
        ],
        [
          "pKb",
          "$pK_b=-\\log K_b$; $K_b=10^{-pK_b}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "pH, pOH, pKa and pKb",
    "card_type": "table",
    "body": "The source defines pH using activity, then lists the concentration relations.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "For dilute solution, $a_{H^+}$ is molar concentration. The source notes pH can be negative or greater than 14."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-water-properties",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Pure water",
          "$[H^+]=[OH^-]$; neutral"
        ],
        [
          "Molarity of water",
          "$55.56\\ M$"
        ],
        [
          "Ionic product",
          "$K_w=[H^+][OH^-]=10^{-14}$"
        ],
        [
          "Neutral",
          "$pH=7=pOH$"
        ],
        [
          "Acidic",
          "$pH<7$ or $pOH>7$"
        ],
        [
          "Basic",
          "$pH>7$ or $pOH<7$"
        ],
        [
          "Degree of dissociation",
          "$\\alpha=\\frac{10^{-7}}{55.55}=18\\times10^{-10}\\text{ or }1.8\\times10^{-7}\\%$"
        ],
        [
          "Absolute dissociation constant",
          "$K_a=K_b=\\frac{[H^+][OH^-]}{[H_2O]}=\\frac{10^{-7}\\times10^{-7}}{55.55}=1.8\\times10^{-16}$"
        ],
        [
          "Water pKa/pKb",
          "$pK_a=pK_b=-\\log(1.8\\times10^{-16})=16-\\log1.8=15.74$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Properties of Water",
    "card_type": "table",
    "body": "The handbook lists neutral water, ionic product, water dissociation, and absolute dissociation constant.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "$K_w=10^{-14}$ is stated at $25^\\circ$ experimentally."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-conjugate-acid-base",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Conjugate Acid-Base Relation",
    "card_type": "formula",
    "body": "The source connects conjugate acid-base pairs with the ionic product of water.",
    "formulas": [
      {
        "latex": "K_a\\times K_b=[H^+][OH^-]=K_w"
      },
      {
        "latex": "pK_a+pK_b=pK_w=14\\quad\\text{at }25^\\circ\\text{C}"
      },
      {
        "latex": "pK_a\\text{ of }H_3O^+\\text{ ions}=-1.74"
      },
      {
        "latex": "pK_b\\text{ of }OH^-\\text{ ions}=-1.74"
      }
    ],
    "variables": [],
    "conditions": [
      "The relation is noted for conjugate acid-base pairs."
    ],
    "importance": 5,
    "source_page": 16,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-strong-acid-base-mixtures",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Case",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Strong acid, concentration $>10^{-6}M$",
          "$H^+$ from water can be neglected"
        ],
        [
          "Strong acid, concentration $<10^{-6}M$",
          "$H^+$ from water cannot be neglected"
        ],
        [
          "Strong base",
          "Calculate $[OH^-]$ first, then use $[H^+][OH^-]=10^{-14}$"
        ],
        [
          "Two strong acids",
          "$[H^+]=N=\\frac{N_1V_1+N_2V_2}{V_1+V_2}$"
        ],
        [
          "Two strong bases",
          "$[OH^-]=N=\\frac{N_1V_1+N_2V_2}{V_1+V_2}$"
        ],
        [
          "Strong acid + strong base, $N_1V_1>N_2V_2$",
          "$[H^+]=N=\\frac{N_1V_1-N_2V_2}{V_1+V_2}$"
        ],
        [
          "Strong acid + strong base, $N_2V_2>N_1V_1$",
          "$[OH^-]=N=\\frac{N_2V_2-N_1V_1}{V_1+V_2}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Strong Acid/Base pH Cases",
    "card_type": "table",
    "body": "The source groups pH calculations for strong acids, bases, their mixtures, and neutralization excess.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 16,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-weak-acid-relative-strength",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Weak Monoprotic Acid and Relative Strength",
    "card_type": "formula",
    "body": "The weak-acid formula continues into the relative strength of two acids.",
    "formulas": [
      {
        "latex": "K_a=\\frac{[H^+][OH^-]}{[HA]}=\\frac{C\\alpha^2}{1-\\alpha}"
      },
      {
        "latex": "\\alpha\\ll1\\Rightarrow K_a\\simeq C\\alpha^2"
      },
      {
        "latex": "\\alpha=\\sqrt{\\frac{K_a}{C}}\\quad\\text{valid if }\\alpha<0.1\\text{ or }10\\%"
      },
      {
        "latex": "\\frac{[H^+]\\text{ furnished by I acid}}{[H^+]\\text{ furnished by II acid}}=\\frac{c_1\\alpha_1}{c_2\\alpha_2}=\\sqrt{\\frac{k_{a1}c_1}{k_{a2}c_2}}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "On dilution: $C\\downarrow\\Rightarrow\\alpha\\uparrow$ and $[H^+]\\downarrow\\Rightarrow pH\\uparrow$."
    ],
    "importance": 5,
    "source_page": 17,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-salt-hydrolysis",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Salt",
        "Hydrolysis",
        "$k_h$",
        "$h$",
        "pH"
      ],
      "rows": [
        [
          "Weak acid & strong base",
          "anionic",
          "$\\frac{k_w}{k_a}$",
          "$\\sqrt{\\frac{k_w}{k_ac}}$",
          "$7+\\frac{1}{2}pK_a+\\frac{1}{2}\\log c$"
        ],
        [
          "Strong acid & weak base",
          "cationic",
          "$\\frac{k_w}{k_b}$",
          "$\\sqrt{\\frac{k_w}{k_bc}}$",
          "$7-\\frac{1}{2}pK_b-\\frac{1}{2}\\log c$"
        ],
        [
          "Weak acid & weak base",
          "both",
          "$\\frac{k_w}{k_ak_b}$",
          "$\\sqrt{\\frac{k_w}{k_ak_b}}$",
          "$7+\\frac{1}{2}pK_a-\\frac{1}{2}pK_b$"
        ],
        [
          "Strong acid & strong base",
          "do not hydrolysed",
          "",
          "",
          "$pH=7$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Salt Hydrolysis Cases",
    "card_type": "table",
    "body": "The hydrolysis table is preserved as separate rows for mobile readability.",
    "formulas": [],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 17,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-polyvalent-hydrolysis",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Polyvalent Ion Hydrolysis",
    "card_type": "formula",
    "body": "The source gives a phosphate example and the first-step hydrolysis approximation.",
    "formulas": [
      {
        "latex": "K_{a1}K_{h3}=K_w,\\quad K_{a1}K_{h2}=K_w,\\quad K_{a3}K_{h1}=K_w"
      },
      {
        "latex": "K_{h1}=\\frac{Ch^2}{1-h}\\approx Ch^2"
      },
      {
        "latex": "h=\\sqrt{\\frac{K_{h1}}{c}}"
      },
      {
        "latex": "[OH^-]=ch=\\sqrt{K_{h1}\\times c}"
      },
      {
        "latex": "[H^+]=\\sqrt{\\frac{K_w\\times K_{a3}}{C}}"
      },
      {
        "latex": "pH=\\frac{1}{2}\\left[pK_w+pK_{a3}+\\log C\\right]"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "For $[Na_3PO_4]=C$, generally pH is calculated only using the first step hydrolysis."
    ],
    "importance": 4,
    "source_page": 17,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-buffers",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Buffer",
        "Example",
        "Formula"
      ],
      "rows": [
        [
          "Acidic buffer",
          "$CH_3COOH$ and $CH_3COONa$",
          "$pH=pK_a+\\log\\frac{[Salt]}{[Acid]}$"
        ],
        [
          "Basic buffer",
          "$NH_4OH+NH_4Cl$",
          "$pOH=pK_b+\\log\\frac{[Salt]}{[Base]}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acidic and Basic Buffers",
    "card_type": "table",
    "body": "The Henderson equations are listed for acidic and basic buffers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 18,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-ionic-equilibrium-solubility-precipitation",
    "chapter_id": "jee-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Solubility Product and Precipitation",
    "card_type": "formula",
    "body": "The chapter closes with solubility product and precipitation conditions before Electrochemistry starts.",
    "formulas": [
      {
        "latex": "K_{SP}=(xs)^x(ys)^y=x^x y^y(s)^{x+y}"
      }
    ],
    "variables": [],
    "conditions": [
      "If ionic product $K_{I.P}>K_{SP}$, precipitation occurs. If $K_{I.P}=K_{SP}$, the solution is saturated and precipitation just begins or is just prevented."
    ],
    "importance": 5,
    "source_page": 18,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-electrochemistry-electrode-cell-potential",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": {
      "type": "chem-galvanic-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrode and Cell Potential",
    "card_type": "mixed",
    "body": "Electrochemistry begins with oxidation/reduction potential and cell potential relations.",
    "formulas": [
      {
        "latex": "\\text{Oxidation potential}=-\\text{Reduction potential}"
      },
      {
        "latex": "E_{cell}=\\text{R.P. of cathode}-\\text{R.P. of anode}"
      },
      {
        "latex": "E_{cell}=\\text{R.P. of cathode}+\\text{O.P. of anode}"
      },
      {
        "latex": "E^\\circ_{cell}=\\text{SRP of cathode}-\\text{SRP of anode}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "$E_{cell}$ is always a positive quantity; the anode is the electrode of low R.P. Greater SRP means greater oxidising power."
    ],
    "importance": 5,
    "source_page": 18,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-electrochemistry-gibbs-nernst",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Gibbs Free Energy and Nernst Equation",
    "card_type": "formula",
    "body": "The source derives Nernst relations from Gibbs free energy and reaction quotient.",
    "formulas": [
      {
        "latex": "\\Delta G=-nFE_{cell}"
      },
      {
        "latex": "\\Delta G^\\circ=-nFE^\\circ_{cell}"
      },
      {
        "latex": "\\Delta G=\\Delta G^\\circ+RT\\ln Q"
      },
      {
        "latex": "\\Delta G^\\circ=-RT\\ln K_{eq}"
      },
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{RT}{nF}\\ln Q"
      },
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{2.303RT}{nF}\\log Q"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      },
      {
        "latex": "F",
        "symbol": "$F$",
        "meaning": "Faraday constant"
      },
      {
        "latex": "Q",
        "symbol": "$Q$",
        "meaning": "reaction quotient"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 19,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-electrochemistry-nernst-298-equilibrium",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nernst at 298 K and Equilibrium Constant",
    "card_type": "formula",
    "body": "The handbook gives the 298 K form and equilibrium relation.",
    "formulas": [
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{0.0591}{n}\\log Q\\quad[\\text{At }298\\ K]"
      },
      {
        "latex": "\\Delta G=0;\\quad E_{cell}=0\\quad\\text{at chemical equilibrium}"
      },
      {
        "latex": "\\log K_{eq}=\\frac{nE^\\circ_{cell}}{0.0591}"
      },
      {
        "latex": "E^\\circ_{cell}=\\frac{0.0591}{n}\\log K_{eq}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 19,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-electrochemistry-metal-electrode-concentration-cell",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": {
      "type": "chem-concentration-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Metal Electrode and Concentration Cells",
    "card_type": "mixed",
    "body": "The source lists a metal/metal-ion electrode relation and two concentration-cell examples.",
    "formulas": [
      {
        "latex": "E_{M^{n+}/M}=E^\\circ_{M^{n+}/M}-\\frac{2.303RT}{nF}\\log\\frac{1}{[M^{n+}]}"
      },
      {
        "latex": "E^\\circ_{cell}=0\\quad\\text{for all concentration cells}"
      },
      {
        "latex": "E=\\frac{0.0591}{2}\\log\\frac{C_2}{C_1}"
      },
      {
        "latex": "E=\\frac{0.0591}{2}\\log\\left(\\frac{P_1}{P_2}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "A concentration cell has both electrodes made of the same material."
    ],
    "importance": 5,
    "source_page": 20,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-electrochemistry-electrode-types",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Electrode",
        "Half-reaction / notation",
        "Potential relation"
      ],
      "rows": [
        [
          "Metal-metal ion",
          "$M(s)/M^{n+}$; $M^{n+}+ne^-\\to M(s)$",
          "$E=E^\\circ+\\frac{0.0591}{n}\\log[M^{n+}]$"
        ],
        [
          "Gas-ion",
          "$Pt/H_2(P\\text{ atm})/H^+(XM)$; $H^+(aq)+e^-\\to\\frac{1}{2}H_2(P\\text{ atm})$",
          "$E=E^\\circ-0.0591\\log\\frac{P_{H_2}^{1/2}}{[H^+]}$"
        ],
        [
          "Redox",
          "$Fe^{3+}+e^-\\to Fe^{2+}$",
          "$E=E^\\circ-0.0591\\log\\frac{[Fe^{2+}]}{[Fe^{3+}]}$"
        ],
        [
          "Metal-metal insoluble salt",
          "$Ag/AgCl,Cl^-$; $AgCl(s)+e^-\\to Ag(s)+Cl^-$",
          "$E_{Cl^-/AgCl/Ag}=E^0_{Cl^-/AgCl/Ag}-0.0591\\log[Cl^-]$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Different Types of Electrodes",
    "card_type": "table",
    "body": "The source gives electrode examples with reduction-electrode expressions.",
    "formulas": [],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 20,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-electrochemistry-electrolysis-deposition",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Species",
        "Order"
      ],
      "rows": [
        [
          "Cations",
          "$K^+,Ca^{+2},Na^+,Mg^{+2},Al^{+3},Zn^{+2},Fe^{+2},H^+,Cu^{+2},Ag^+,Au^{+3}$"
        ],
        [
          "Anions",
          "$SO_4^{2-},NO_3^-,OH^-,Cl^-,Br^-,I^-$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrolysis Deposition Order",
    "card_type": "table",
    "body": "The deposition order is reproduced from the source text.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "For anions, the source notes that the stronger reducing agent, with low SRP value, is liberated first at the anode."
    ],
    "importance": 4,
    "source_page": 21,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-electrochemistry-faraday-laws",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Faraday's Laws and Current Efficiency",
    "card_type": "formula",
    "body": "The source lists Faraday's first and second laws, electrochemical equivalent, and current efficiency.",
    "formulas": [
      {
        "latex": "w=zq"
      },
      {
        "latex": "w=Zit"
      },
      {
        "latex": "W\\propto E,\\quad \\frac{W}{E}=\\text{constant},\\quad \\frac{W_1}{E_1}=\\frac{W_2}{E_2}=\\cdots"
      },
      {
        "latex": "\\frac{W}{E}=\\frac{i\\times t\\times\\text{current efficiency factor}}{96500}"
      },
      {
        "latex": "\\text{Current efficiency}=\\frac{\\text{actual mass deposited/produced}}{\\text{Theoritical mass deposited/produced}}\\times100"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "$Z$ is electrochemical equivalent of substance."
    ],
    "importance": 5,
    "source_page": 21,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-electrochemistry-simultaneous-deposition-conductance",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Simultaneous Deposition and Basic Conductance",
    "card_type": "formula",
    "body": "The source gives a cathode condition for simultaneous Cu and Fe deposition, then defines conductance.",
    "formulas": [
      {
        "latex": "E^\\circ_{Cu^{2+}/Cu}-\\frac{0.0591}{2}\\log\\frac{1}{[Cu^{2+}]}=E^\\circ_{Fe^{2+}/Fe}-\\frac{0.0591}{2}\\log\\frac{1}{[Fe^{2+}]}"
      },
      {
        "latex": "\\text{Conductance}=\\frac{1}{\\text{Resistance}}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "This is the source condition for simultaneous deposition of Cu and Fe at the cathode."
    ],
    "importance": 4,
    "source_page": 21,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-electrochemistry-conductance-quantities",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Quantity",
        "Relation",
        "Unit from source"
      ],
      "rows": [
        [
          "Specific conductance",
          "$K=\\frac{1}{\\rho}$",
          ""
        ],
        [
          "Specific conductance",
          "$K=\\text{conductance}\\times\\frac{\\ell}{a}$",
          ""
        ],
        [
          "Equivalent conductance",
          "$\\lambda_E=\\frac{K\\times1000}{\\text{Normality}}$",
          "$ohm^{-1}\\ cm^2\\ eq^{-1}$"
        ],
        [
          "Molar conductance",
          "$\\lambda_m=\\frac{K\\times1000}{\\text{Molarity}}$",
          "$ohm^{-1}\\ cm^2\\ mole^{-1}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-conductivity-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Conductance Quantities",
    "card_type": "table",
    "body": "The source lists specific, equivalent, and molar conductance relations with units.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "conductance quantity"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-electrochemistry-kohlrausch-law",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Kohlrausch Law",
    "card_type": "formula",
    "body": "The Kohlrausch section lists strong-electrolyte variation and weak-electrolyte limiting molar conductivity.",
    "formulas": [
      {
        "label": "Strong electrolyte",
        "latex": "\\lambda_M^c=\\lambda_M^\\infty-b\\sqrt{c}"
      },
      {
        "label": "Weak electrolytes",
        "latex": "\\lambda_\\infty=n_+\\lambda_+^\\infty+n_-\\lambda_-^\\infty"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "conductance quantity"
      }
    ],
    "conditions": [
      "$n_+$ and $n_-$ are the number of cations and anions obtained after dissociation per formula unit."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-electrochemistry-kohlrausch-applications",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Application",
        "Formula"
      ],
      "rows": [
        [
          "$\\lambda_M^0$ of weak electrolyte",
          "$\\lambda^0_{M(CH_3COOH)}=\\lambda^0_{M(CH_3COONa)}+\\lambda^0_{M(HCl)}-\\lambda^0_{M(NaCl)}$"
        ],
        [
          "Degree of dissociation",
          "$\\alpha=\\frac{\\lambda_m^c}{\\lambda_m^0}$"
        ],
        [
          "Weak electrolyte relation",
          "$K_{eq}=\\frac{c\\alpha^2}{1-\\alpha}$"
        ],
        [
          "Sparingly soluble salt",
          "$\\lambda_M^c=\\lambda_M^\\infty=\\kappa\\times\\frac{1000}{\\text{solubility}}$"
        ],
        [
          "Solubility product application",
          "$K_{sp}=S^2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Applications of Kohlrausch Law",
    "card_type": "table",
    "body": "The source lists three conductivity applications before transport number.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 11
  },
  {
    "id": "jee-chemistry-electrochemistry-transport-number",
    "chapter_id": "jee-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Transport Number",
    "card_type": "formula",
    "body": "Electrochemistry closes with transport number expressions for cation and anion.",
    "formulas": [
      {
        "latex": "t_c=\\left[\\frac{\\mu_c}{\\mu_c+\\mu_a}\\right]"
      },
      {
        "latex": "t_a=\\left[\\frac{\\mu_a}{\\mu_a+\\mu_c}\\right]"
      }
    ],
    "variables": [],
    "conditions": [
      "$t_c$ is transport number of cation and $t_a$ is transport number of anion."
    ],
    "importance": 4,
    "source_page": 22,
    "sort_order": 12
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-equilibrium-conditions-constants",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Constant",
        "Expression"
      ],
      "rows": [
        [
          "$K_c$",
          "$\\frac{K_f}{K_b}=K_c=\\frac{[C]^c[D]^d}{[A]^a[B]^b}$"
        ],
        [
          "$K_p$",
          "$\\frac{[P_C]^c[P_D]^d}{[P_A]^a[P_B]^b}$"
        ],
        [
          "$K_x$",
          "$\\frac{x_C^cx_D^d}{x_A^ax_B^b}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Equilibrium Conditions and Constants",
    "card_type": "table",
    "body": "The source starts Chemical Equilibrium with conditions at equilibrium and expressions for $K$, $K_c$, $K_p$, and $K_x$.",
    "formulas": [
      {
        "latex": "K=\\frac{\\text{rate constant of forward reaction}}{\\text{rate constant of backward reaction}}=\\frac{K_f}{K_b}"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      }
    ],
    "conditions": [
      "At equilibrium: forward and backward rates are equal, concentrations become constant, $\\Delta G=0$, and $Q=K_{eq}$."
    ],
    "importance": 5,
    "source_page": 12,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-equilibrium-constant-relations",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Relations Among Equilibrium Constants",
    "card_type": "formula",
    "body": "The source gives pressure, mole-fraction, and temperature relations for equilibrium constants.",
    "formulas": [
      {
        "latex": "K_p=K_c(RT)^{\\Delta n}"
      },
      {
        "latex": "K_p=K_x(P)^{\\Delta n}"
      },
      {
        "latex": "\\log\\frac{K_2}{K_1}=\\frac{\\Delta H}{2.303R}\\left[\\frac{1}{T_1}-\\frac{1}{T_2}\\right]"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      },
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      }
    ],
    "conditions": [
      "$\\Delta H$ is enthalpy of reaction."
    ],
    "importance": 5,
    "source_page": 13,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-gibbs-quotient-dissociation",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Gibbs Relation, Reaction Quotient and Dissociation",
    "card_type": "formula",
    "body": "The source connects equilibrium with standard free energy, quotient, and degree of dissociation.",
    "formulas": [
      {
        "latex": "\\Delta G^\\circ=-2.303RT\\log K"
      },
      {
        "latex": "Q=\\frac{[C]^c[D]^d}{[A]^a[B]^b}"
      },
      {
        "latex": "\\alpha=\\frac{\\text{no. of moles dissociated}}{\\text{initial no. of moles taken}}"
      },
      {
        "latex": "\\%\\text{ dissociation}=\\alpha\\times100"
      }
    ],
    "variables": [
      {
        "latex": "Q",
        "symbol": "$Q$",
        "meaning": "reaction quotient"
      },
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      }
    ],
    "conditions": [
      "$\\alpha$ is also described as the fraction of moles dissociated out of 1 mole."
    ],
    "importance": 5,
    "source_page": 13,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-observed-molecular-weight",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Observed Molecular Weight and Vapour Density",
    "card_type": "formula",
    "body": "The observed molecular weight and vapour density relation is stated for $A_n(g)$.",
    "formulas": [
      {
        "latex": "\\text{Observed molecular weight}=\\frac{\\text{molecular weight of equilibrium mixture}}{\\text{total no. of moles}}"
      },
      {
        "latex": "\\alpha=\\frac{D-d}{(n-1)d}=\\frac{M_T-M_0}{(n-1)M_0}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 13,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-le-chatelier-shifts",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Change",
        "Source-backed shift"
      ],
      "rows": [
        [
          "Reactant concentration increased",
          "Forward direction"
        ],
        [
          "Product concentration increased",
          "Backward direction"
        ],
        [
          "Volume increased, $\\Delta n>0$",
          "Forward direction"
        ],
        [
          "Volume increased, $\\Delta n<0$",
          "Backward direction"
        ],
        [
          "Volume increased, $\\Delta n=0$",
          "No shift"
        ],
        [
          "Pressure increased",
          "Direction in which fewer moles of gas are formed"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n>0$",
          "Forward direction"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n<0$",
          "Backward direction"
        ],
        [
          "Inert gas at constant pressure, $\\Delta n=0$",
          "No shift"
        ],
        [
          "Inert gas at constant volume",
          "No effect"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Le Chatelier Shifts",
    "card_type": "table",
    "body": "The source lists concentration, volume, pressure, and inert-gas effects at equilibrium.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      }
    ],
    "conditions": [
      "Le Chatelier principle: the system reacts to minimize the effect of a disturbance."
    ],
    "importance": 5,
    "source_page": 14,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-chemical-equilibrium-temperature-humidity-vant-hoff",
    "chapter_id": "neet-chemistry-chemical-equilibrium",
    "table_data": {
      "columns": [
        "Topic",
        "Source-backed relation"
      ],
      "rows": [
        [
          "$\\ln K$ vs $1/T$",
          "Straight line with slope $-\\frac{\\Delta H^\\circ}{R}$ and intercept $\\frac{\\Delta S^\\circ}{R}$"
        ],
        [
          "Endothermic, $\\Delta H>0$",
          "$K$ increases with rise in temperature; reaction shifts forward with increase in temperature"
        ],
        [
          "Exothermic, $\\Delta H<0$",
          "$K$ decreases with increase in temperature; reaction shifts backward with increase in temperature"
        ],
        [
          "Relative humidity",
          "$\\frac{\\text{Partial pressure of }H_2O\\text{ vapours}}{\\text{Vapour pressure of }H_2O\\text{ at that temp.}}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Temperature Effect, Humidity and Van't Hoff Equation",
    "card_type": "table",
    "body": "The source gives the $\\ln K$ plot relation, temperature effects, relative humidity, and Van't Hoff equation.",
    "formulas": [
      {
        "latex": "\\Delta G=\\Delta G^0+2.303RT\\log_{10}Q"
      },
      {
        "latex": "\\log\\left(\\frac{K_1}{K_2}\\right)=\\frac{\\Delta H^0}{2.303R}\\left(\\frac{1}{T_2}-\\frac{1}{T_1}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "equilibrium constant"
      },
      {
        "latex": "\\Delta",
        "symbol": "$\\Delta$",
        "meaning": "change in quantity"
      },
      {
        "latex": "T",
        "symbol": "$T$",
        "meaning": "temperature"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "gas constant"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 14,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-ostwald-acid-base",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Ostwald Dilution Law",
    "card_type": "formula",
    "body": "The Ionic Equilibrium section opens with weak acid and weak base dissociation.",
    "formulas": [
      {
        "label": "Weak acid",
        "latex": "K_a=\\frac{[H^+][A^-]}{[HA]}=\\frac{[C\\alpha][C\\alpha]}{C(1-\\alpha)}=\\frac{C\\alpha^2}{1-\\alpha}"
      },
      {
        "latex": "\\alpha\\ll1\\Rightarrow 1-\\alpha\\simeq1\\quad\\text{or}\\quad K_a=C\\alpha^2\\quad\\text{or}\\quad \\alpha=\\sqrt{\\frac{K_a}{C}}=\\sqrt{K_a\\times V}"
      },
      {
        "label": "Weak base",
        "latex": "\\alpha=\\sqrt{\\frac{K_b}{C}}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "Higher $K_a/K_b$ means the acid/base is stronger."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-ph-scale",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Measure",
        "Relation"
      ],
      "rows": [
        [
          "pH",
          "$pH=-\\log a_{H^+}$; $pH=-\\log[H^+]$; $[H^+]=10^{-pH}$"
        ],
        [
          "pOH",
          "$pOH=-\\log[OH^-]$; $[OH^-]=10^{-pOH}$"
        ],
        [
          "pKa",
          "$pK_a=-\\log K_a$; $K_a=10^{-pK_a}$"
        ],
        [
          "pKb",
          "$pK_b=-\\log K_b$; $K_b=10^{-pK_b}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "pH, pOH, pKa and pKb",
    "card_type": "table",
    "body": "The source defines pH using activity, then lists the concentration relations.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "For dilute solution, $a_{H^+}$ is molar concentration. The source notes pH can be negative or greater than 14."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-water-properties",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Property",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Pure water",
          "$[H^+]=[OH^-]$; neutral"
        ],
        [
          "Molarity of water",
          "$55.56\\ M$"
        ],
        [
          "Ionic product",
          "$K_w=[H^+][OH^-]=10^{-14}$"
        ],
        [
          "Neutral",
          "$pH=7=pOH$"
        ],
        [
          "Acidic",
          "$pH<7$ or $pOH>7$"
        ],
        [
          "Basic",
          "$pH>7$ or $pOH<7$"
        ],
        [
          "Degree of dissociation",
          "$\\alpha=\\frac{10^{-7}}{55.55}=18\\times10^{-10}\\text{ or }1.8\\times10^{-7}\\%$"
        ],
        [
          "Absolute dissociation constant",
          "$K_a=K_b=\\frac{[H^+][OH^-]}{[H_2O]}=\\frac{10^{-7}\\times10^{-7}}{55.55}=1.8\\times10^{-16}$"
        ],
        [
          "Water pKa/pKb",
          "$pK_a=pK_b=-\\log(1.8\\times10^{-16})=16-\\log1.8=15.74$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Properties of Water",
    "card_type": "table",
    "body": "The handbook lists neutral water, ionic product, water dissociation, and absolute dissociation constant.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "$K_w=10^{-14}$ is stated at $25^\\circ$ experimentally."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-conjugate-acid-base",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Conjugate Acid-Base Relation",
    "card_type": "formula",
    "body": "The source connects conjugate acid-base pairs with the ionic product of water.",
    "formulas": [
      {
        "latex": "K_a\\times K_b=[H^+][OH^-]=K_w"
      },
      {
        "latex": "pK_a+pK_b=pK_w=14\\quad\\text{at }25^\\circ\\text{C}"
      },
      {
        "latex": "pK_a\\text{ of }H_3O^+\\text{ ions}=-1.74"
      },
      {
        "latex": "pK_b\\text{ of }OH^-\\text{ ions}=-1.74"
      }
    ],
    "variables": [],
    "conditions": [
      "The relation is noted for conjugate acid-base pairs."
    ],
    "importance": 5,
    "source_page": 16,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-strong-acid-base-mixtures",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Case",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Strong acid, concentration $>10^{-6}M$",
          "$H^+$ from water can be neglected"
        ],
        [
          "Strong acid, concentration $<10^{-6}M$",
          "$H^+$ from water cannot be neglected"
        ],
        [
          "Strong base",
          "Calculate $[OH^-]$ first, then use $[H^+][OH^-]=10^{-14}$"
        ],
        [
          "Two strong acids",
          "$[H^+]=N=\\frac{N_1V_1+N_2V_2}{V_1+V_2}$"
        ],
        [
          "Two strong bases",
          "$[OH^-]=N=\\frac{N_1V_1+N_2V_2}{V_1+V_2}$"
        ],
        [
          "Strong acid + strong base, $N_1V_1>N_2V_2$",
          "$[H^+]=N=\\frac{N_1V_1-N_2V_2}{V_1+V_2}$"
        ],
        [
          "Strong acid + strong base, $N_2V_2>N_1V_1$",
          "$[OH^-]=N=\\frac{N_2V_2-N_1V_1}{V_1+V_2}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Strong Acid/Base pH Cases",
    "card_type": "table",
    "body": "The source groups pH calculations for strong acids, bases, their mixtures, and neutralization excess.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 16,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-weak-acid-relative-strength",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Weak Monoprotic Acid and Relative Strength",
    "card_type": "formula",
    "body": "The weak-acid formula continues into the relative strength of two acids.",
    "formulas": [
      {
        "latex": "K_a=\\frac{[H^+][OH^-]}{[HA]}=\\frac{C\\alpha^2}{1-\\alpha}"
      },
      {
        "latex": "\\alpha\\ll1\\Rightarrow K_a\\simeq C\\alpha^2"
      },
      {
        "latex": "\\alpha=\\sqrt{\\frac{K_a}{C}}\\quad\\text{valid if }\\alpha<0.1\\text{ or }10\\%"
      },
      {
        "latex": "\\frac{[H^+]\\text{ furnished by I acid}}{[H^+]\\text{ furnished by II acid}}=\\frac{c_1\\alpha_1}{c_2\\alpha_2}=\\sqrt{\\frac{k_{a1}c_1}{k_{a2}c_2}}"
      }
    ],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      },
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "On dilution: $C\\downarrow\\Rightarrow\\alpha\\uparrow$ and $[H^+]\\downarrow\\Rightarrow pH\\uparrow$."
    ],
    "importance": 5,
    "source_page": 17,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-salt-hydrolysis",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Salt",
        "Hydrolysis",
        "$k_h$",
        "$h$",
        "pH"
      ],
      "rows": [
        [
          "Weak acid & strong base",
          "anionic",
          "$\\frac{k_w}{k_a}$",
          "$\\sqrt{\\frac{k_w}{k_ac}}$",
          "$7+\\frac{1}{2}pK_a+\\frac{1}{2}\\log c$"
        ],
        [
          "Strong acid & weak base",
          "cationic",
          "$\\frac{k_w}{k_b}$",
          "$\\sqrt{\\frac{k_w}{k_bc}}$",
          "$7-\\frac{1}{2}pK_b-\\frac{1}{2}\\log c$"
        ],
        [
          "Weak acid & weak base",
          "both",
          "$\\frac{k_w}{k_ak_b}$",
          "$\\sqrt{\\frac{k_w}{k_ak_b}}$",
          "$7+\\frac{1}{2}pK_a-\\frac{1}{2}pK_b$"
        ],
        [
          "Strong acid & strong base",
          "do not hydrolysed",
          "",
          "",
          "$pH=7$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Salt Hydrolysis Cases",
    "card_type": "table",
    "body": "The hydrolysis table is preserved as separate rows for mobile readability.",
    "formulas": [],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 17,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-polyvalent-hydrolysis",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Polyvalent Ion Hydrolysis",
    "card_type": "formula",
    "body": "The source gives a phosphate example and the first-step hydrolysis approximation.",
    "formulas": [
      {
        "latex": "K_{a1}K_{h3}=K_w,\\quad K_{a1}K_{h2}=K_w,\\quad K_{a3}K_{h1}=K_w"
      },
      {
        "latex": "K_{h1}=\\frac{Ch^2}{1-h}\\approx Ch^2"
      },
      {
        "latex": "h=\\sqrt{\\frac{K_{h1}}{c}}"
      },
      {
        "latex": "[OH^-]=ch=\\sqrt{K_{h1}\\times c}"
      },
      {
        "latex": "[H^+]=\\sqrt{\\frac{K_w\\times K_{a3}}{C}}"
      },
      {
        "latex": "pH=\\frac{1}{2}\\left[pK_w+pK_{a3}+\\log C\\right]"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "concentration"
      }
    ],
    "conditions": [
      "For $[Na_3PO_4]=C$, generally pH is calculated only using the first step hydrolysis."
    ],
    "importance": 4,
    "source_page": 17,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-buffers",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": {
      "columns": [
        "Buffer",
        "Example",
        "Formula"
      ],
      "rows": [
        [
          "Acidic buffer",
          "$CH_3COOH$ and $CH_3COONa$",
          "$pH=pK_a+\\log\\frac{[Salt]}{[Acid]}$"
        ],
        [
          "Basic buffer",
          "$NH_4OH+NH_4Cl$",
          "$pOH=pK_b+\\log\\frac{[Salt]}{[Base]}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Acidic and Basic Buffers",
    "card_type": "table",
    "body": "The Henderson equations are listed for acidic and basic buffers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 18,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-ionic-equilibrium-solubility-precipitation",
    "chapter_id": "neet-chemistry-ionic-equilibrium",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Solubility Product and Precipitation",
    "card_type": "formula",
    "body": "The chapter closes with solubility product and precipitation conditions before Electrochemistry starts.",
    "formulas": [
      {
        "latex": "K_{SP}=(xs)^x(ys)^y=x^x y^y(s)^{x+y}"
      }
    ],
    "variables": [],
    "conditions": [
      "If ionic product $K_{I.P}>K_{SP}$, precipitation occurs. If $K_{I.P}=K_{SP}$, the solution is saturated and precipitation just begins or is just prevented."
    ],
    "importance": 5,
    "source_page": 18,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-electrochemistry-electrode-cell-potential",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": {
      "type": "chem-galvanic-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrode and Cell Potential",
    "card_type": "mixed",
    "body": "Electrochemistry begins with oxidation/reduction potential and cell potential relations.",
    "formulas": [
      {
        "latex": "\\text{Oxidation potential}=-\\text{Reduction potential}"
      },
      {
        "latex": "E_{cell}=\\text{R.P. of cathode}-\\text{R.P. of anode}"
      },
      {
        "latex": "E_{cell}=\\text{R.P. of cathode}+\\text{O.P. of anode}"
      },
      {
        "latex": "E^\\circ_{cell}=\\text{SRP of cathode}-\\text{SRP of anode}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "$E_{cell}$ is always a positive quantity; the anode is the electrode of low R.P. Greater SRP means greater oxidising power."
    ],
    "importance": 5,
    "source_page": 18,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-electrochemistry-gibbs-nernst",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Gibbs Free Energy and Nernst Equation",
    "card_type": "formula",
    "body": "The source derives Nernst relations from Gibbs free energy and reaction quotient.",
    "formulas": [
      {
        "latex": "\\Delta G=-nFE_{cell}"
      },
      {
        "latex": "\\Delta G^\\circ=-nFE^\\circ_{cell}"
      },
      {
        "latex": "\\Delta G=\\Delta G^\\circ+RT\\ln Q"
      },
      {
        "latex": "\\Delta G^\\circ=-RT\\ln K_{eq}"
      },
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{RT}{nF}\\ln Q"
      },
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{2.303RT}{nF}\\log Q"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      },
      {
        "latex": "F",
        "symbol": "$F$",
        "meaning": "Faraday constant"
      },
      {
        "latex": "Q",
        "symbol": "$Q$",
        "meaning": "reaction quotient"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 19,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-electrochemistry-nernst-298-equilibrium",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nernst at 298 K and Equilibrium Constant",
    "card_type": "formula",
    "body": "The handbook gives the 298 K form and equilibrium relation.",
    "formulas": [
      {
        "latex": "E_{cell}=E^\\circ_{cell}-\\frac{0.0591}{n}\\log Q\\quad[\\text{At }298\\ K]"
      },
      {
        "latex": "\\Delta G=0;\\quad E_{cell}=0\\quad\\text{at chemical equilibrium}"
      },
      {
        "latex": "\\log K_{eq}=\\frac{nE^\\circ_{cell}}{0.0591}"
      },
      {
        "latex": "E^\\circ_{cell}=\\frac{0.0591}{n}\\log K_{eq}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "number of electrons or stoichiometric count depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 19,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-electrochemistry-metal-electrode-concentration-cell",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": {
      "type": "chem-concentration-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Metal Electrode and Concentration Cells",
    "card_type": "mixed",
    "body": "The source lists a metal/metal-ion electrode relation and two concentration-cell examples.",
    "formulas": [
      {
        "latex": "E_{M^{n+}/M}=E^\\circ_{M^{n+}/M}-\\frac{2.303RT}{nF}\\log\\frac{1}{[M^{n+}]}"
      },
      {
        "latex": "E^\\circ_{cell}=0\\quad\\text{for all concentration cells}"
      },
      {
        "latex": "E=\\frac{0.0591}{2}\\log\\frac{C_2}{C_1}"
      },
      {
        "latex": "E=\\frac{0.0591}{2}\\log\\left(\\frac{P_1}{P_2}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "A concentration cell has both electrodes made of the same material."
    ],
    "importance": 5,
    "source_page": 20,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-electrochemistry-electrode-types",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Electrode",
        "Half-reaction / notation",
        "Potential relation"
      ],
      "rows": [
        [
          "Metal-metal ion",
          "$M(s)/M^{n+}$; $M^{n+}+ne^-\\to M(s)$",
          "$E=E^\\circ+\\frac{0.0591}{n}\\log[M^{n+}]$"
        ],
        [
          "Gas-ion",
          "$Pt/H_2(P\\text{ atm})/H^+(XM)$; $H^+(aq)+e^-\\to\\frac{1}{2}H_2(P\\text{ atm})$",
          "$E=E^\\circ-0.0591\\log\\frac{P_{H_2}^{1/2}}{[H^+]}$"
        ],
        [
          "Redox",
          "$Fe^{3+}+e^-\\to Fe^{2+}$",
          "$E=E^\\circ-0.0591\\log\\frac{[Fe^{2+}]}{[Fe^{3+}]}$"
        ],
        [
          "Metal-metal insoluble salt",
          "$Ag/AgCl,Cl^-$; $AgCl(s)+e^-\\to Ag(s)+Cl^-$",
          "$E_{Cl^-/AgCl/Ag}=E^0_{Cl^-/AgCl/Ag}-0.0591\\log[Cl^-]$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Different Types of Electrodes",
    "card_type": "table",
    "body": "The source gives electrode examples with reduction-electrode expressions.",
    "formulas": [],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 20,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-electrochemistry-electrolysis-deposition",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Species",
        "Order"
      ],
      "rows": [
        [
          "Cations",
          "$K^+,Ca^{+2},Na^+,Mg^{+2},Al^{+3},Zn^{+2},Fe^{+2},H^+,Cu^{+2},Ag^+,Au^{+3}$"
        ],
        [
          "Anions",
          "$SO_4^{2-},NO_3^-,OH^-,Cl^-,Br^-,I^-$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrolysis Deposition Order",
    "card_type": "table",
    "body": "The deposition order is reproduced from the source text.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "For anions, the source notes that the stronger reducing agent, with low SRP value, is liberated first at the anode."
    ],
    "importance": 4,
    "source_page": 21,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-electrochemistry-faraday-laws",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Faraday's Laws and Current Efficiency",
    "card_type": "formula",
    "body": "The source lists Faraday's first and second laws, electrochemical equivalent, and current efficiency.",
    "formulas": [
      {
        "latex": "w=zq"
      },
      {
        "latex": "w=Zit"
      },
      {
        "latex": "W\\propto E,\\quad \\frac{W}{E}=\\text{constant},\\quad \\frac{W_1}{E_1}=\\frac{W_2}{E_2}=\\cdots"
      },
      {
        "latex": "\\frac{W}{E}=\\frac{i\\times t\\times\\text{current efficiency factor}}{96500}"
      },
      {
        "latex": "\\text{Current efficiency}=\\frac{\\text{actual mass deposited/produced}}{\\text{Theoritical mass deposited/produced}}\\times100"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "$Z$ is electrochemical equivalent of substance."
    ],
    "importance": 5,
    "source_page": 21,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-electrochemistry-simultaneous-deposition-conductance",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Simultaneous Deposition and Basic Conductance",
    "card_type": "formula",
    "body": "The source gives a cathode condition for simultaneous Cu and Fe deposition, then defines conductance.",
    "formulas": [
      {
        "latex": "E^\\circ_{Cu^{2+}/Cu}-\\frac{0.0591}{2}\\log\\frac{1}{[Cu^{2+}]}=E^\\circ_{Fe^{2+}/Fe}-\\frac{0.0591}{2}\\log\\frac{1}{[Fe^{2+}]}"
      },
      {
        "latex": "\\text{Conductance}=\\frac{1}{\\text{Resistance}}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electrode potential, cell emf, or equivalent weight depending on context"
      }
    ],
    "conditions": [
      "This is the source condition for simultaneous deposition of Cu and Fe at the cathode."
    ],
    "importance": 4,
    "source_page": 21,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-electrochemistry-conductance-quantities",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Quantity",
        "Relation",
        "Unit from source"
      ],
      "rows": [
        [
          "Specific conductance",
          "$K=\\frac{1}{\\rho}$",
          ""
        ],
        [
          "Specific conductance",
          "$K=\\text{conductance}\\times\\frac{\\ell}{a}$",
          ""
        ],
        [
          "Equivalent conductance",
          "$\\lambda_E=\\frac{K\\times1000}{\\text{Normality}}$",
          "$ohm^{-1}\\ cm^2\\ eq^{-1}$"
        ],
        [
          "Molar conductance",
          "$\\lambda_m=\\frac{K\\times1000}{\\text{Molarity}}$",
          "$ohm^{-1}\\ cm^2\\ mole^{-1}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "chem-conductivity-cell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Conductance Quantities",
    "card_type": "table",
    "body": "The source lists specific, equivalent, and molar conductance relations with units.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "conductance quantity"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-electrochemistry-kohlrausch-law",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Kohlrausch Law",
    "card_type": "formula",
    "body": "The Kohlrausch section lists strong-electrolyte variation and weak-electrolyte limiting molar conductivity.",
    "formulas": [
      {
        "label": "Strong electrolyte",
        "latex": "\\lambda_M^c=\\lambda_M^\\infty-b\\sqrt{c}"
      },
      {
        "label": "Weak electrolytes",
        "latex": "\\lambda_\\infty=n_+\\lambda_+^\\infty+n_-\\lambda_-^\\infty"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "conductance quantity"
      }
    ],
    "conditions": [
      "$n_+$ and $n_-$ are the number of cations and anions obtained after dissociation per formula unit."
    ],
    "importance": 5,
    "source_page": 22,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-electrochemistry-kohlrausch-applications",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": {
      "columns": [
        "Application",
        "Formula"
      ],
      "rows": [
        [
          "$\\lambda_M^0$ of weak electrolyte",
          "$\\lambda^0_{M(CH_3COOH)}=\\lambda^0_{M(CH_3COONa)}+\\lambda^0_{M(HCl)}-\\lambda^0_{M(NaCl)}$"
        ],
        [
          "Degree of dissociation",
          "$\\alpha=\\frac{\\lambda_m^c}{\\lambda_m^0}$"
        ],
        [
          "Weak electrolyte relation",
          "$K_{eq}=\\frac{c\\alpha^2}{1-\\alpha}$"
        ],
        [
          "Sparingly soluble salt",
          "$\\lambda_M^c=\\lambda_M^\\infty=\\kappa\\times\\frac{1000}{\\text{solubility}}$"
        ],
        [
          "Solubility product application",
          "$K_{sp}=S^2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Applications of Kohlrausch Law",
    "card_type": "table",
    "body": "The source lists three conductivity applications before transport number.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "degree of dissociation"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 22,
    "sort_order": 11
  },
  {
    "id": "neet-chemistry-electrochemistry-transport-number",
    "chapter_id": "neet-chemistry-electrochemistry",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Transport Number",
    "card_type": "formula",
    "body": "Electrochemistry closes with transport number expressions for cation and anion.",
    "formulas": [
      {
        "latex": "t_c=\\left[\\frac{\\mu_c}{\\mu_c+\\mu_a}\\right]"
      },
      {
        "latex": "t_a=\\left[\\frac{\\mu_a}{\\mu_a+\\mu_c}\\right]"
      }
    ],
    "variables": [],
    "conditions": [
      "$t_c$ is transport number of cation and $t_a$ is transport number of anion."
    ],
    "importance": 4,
    "source_page": 22,
    "sort_order": 12
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
