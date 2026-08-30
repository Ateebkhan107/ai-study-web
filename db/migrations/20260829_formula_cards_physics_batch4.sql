insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-physics-heat-thermodynamics', 'jee-physics', 'Heat & Thermodynamics', 'heat-thermodynamics', 13),
  ('jee-physics-electrostatics', 'jee-physics', 'Electrostatics', 'electrostatics', 14),
  ('jee-physics-current-electricity', 'jee-physics', 'Current Electricity', 'current-electricity', 15),
  ('jee-physics-capacitance', 'jee-physics', 'Capacitance', 'capacitance', 16),
  ('jee-physics-alternating-current', 'jee-physics', 'Alternating Current', 'alternating-current', 17)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-physics-heat-thermodynamics-kinetic-theory-speeds",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Translational KE and Molecular Speeds",
    "card_type": "mixed",
    "body": "The source lists translational kinetic energy of gas, RMS speed, average speed, and most probable speed.",
    "formulas": [
      {
        "latex": "K=\\frac{1}{2}M\\langle V^2\\rangle=\\frac{3}{2}PV=\\frac{3}{2}nRT"
      },
      {
        "latex": "\\langle V^2\\rangle=\\frac{3P}{\\rho}"
      },
      {
        "latex": "V_{rms}=\\sqrt{\\frac{3P}{\\rho}}=\\sqrt{\\frac{3RT}{M_{mol}}}=\\sqrt{\\frac{3KT}{m}}"
      },
      {
        "latex": "\\bar V=\\sqrt{\\frac{8KT}{\\pi m}}=1.59\\sqrt{\\frac{KT}{m}}"
      },
      {
        "latex": "V_p=\\sqrt{\\frac{2KT}{m}}=1.41\\sqrt{\\frac{KT}{m}}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source notes $V_{rms}\\propto\\sqrt{T}$ and $V_{rms}>\\bar V>V_{mp}$."
    ],
    "importance": 5,
    "source_page": 31,
    "sort_order": 1
  },
  {
    "id": "jee-physics-heat-thermodynamics-degrees-equipartition-internal-energy",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Degrees of Freedom and Internal Energy",
    "card_type": "mixed",
    "body": "The handbook lists degrees of freedom, equipartition, and ideal-gas internal energy.",
    "formulas": [
      {
        "label": "Equipartition",
        "latex": "\\text{Total KE of molecule}=\\frac{1}{2}fKT"
      },
      {
        "label": "Ideal gas internal energy",
        "latex": "U=\\frac{f}{2}nRT"
      }
    ],
    "variables": [],
    "conditions": [
      "Monoatomic: $f=3$.",
      "Diatomic: $f=5$.",
      "Polyatomic: $f=6$."
    ],
    "importance": 5,
    "source_page": 32,
    "sort_order": 2
  },
  {
    "id": "jee-physics-heat-thermodynamics-basic-processes",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": {
      "columns": [
        "Process",
        "Source-backed relations"
      ],
      "rows": [
        [
          "Isothermal",
          "$W=2.303nRT\\log_{10}\\left(\\frac{V_f}{V_i}\\right)$, $\\Delta U=0$"
        ],
        [
          "Isochoric",
          "$dW=0$, $\\Delta U=n\\frac{f}{2}R\\Delta T=\\text{heat given}$"
        ],
        [
          "Isobaric",
          "$\\Delta W=nR(T_f-T_i)$, $\\Delta U=nC_v\\Delta T$, $\\Delta Q=\\Delta U+\\Delta W$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Isothermal, Isochoric and Isobaric Processes",
    "card_type": "table",
    "body": "The source groups work and internal-energy relations for the basic gas processes.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 32,
    "sort_order": 3
  },
  {
    "id": "jee-physics-heat-thermodynamics-specific-heats-gamma",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Specific Heats, Gamma and Mayer's Relation",
    "card_type": "mixed",
    "body": "Specific heats and gamma are listed in terms of degrees of freedom.",
    "formulas": [
      {
        "latex": "C_v=\\frac{f}{2}R"
      },
      {
        "latex": "C_p=\\left(\\frac{f}{2}+1\\right)R"
      },
      {
        "latex": "\\gamma=\\frac{C_p}{C_v}=1+\\frac{2}{f}"
      },
      {
        "latex": "C_p-C_v=R"
      }
    ],
    "variables": [],
    "conditions": [
      "Mayer's equation is marked for ideal gas only.",
      "Monoatomic: $C_p/C_v=1.67$.",
      "Diatomic: $C_p/C_v=1.4$.",
      "Triatomic: $C_p/C_v=1.33$."
    ],
    "importance": 5,
    "source_page": 32,
    "sort_order": 4
  },
  {
    "id": "jee-physics-heat-thermodynamics-adiabatic-cyclic-mixtures",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Adiabatic, Cyclic and Gas Mixtures",
    "card_type": "formula",
    "body": "The source gives adiabatic work, cyclic-process equality, and non-reacting gas mixture relations.",
    "formulas": [
      {
        "label": "Adiabatic work",
        "latex": "\\Delta W=\\frac{nR(T_i-T_f)}{\\gamma-1}"
      },
      {
        "label": "Cyclic process",
        "latex": "\\Delta Q=\\Delta W"
      },
      {
        "label": "Mixture molecular weight",
        "latex": "M_{mix}=\\frac{n_1M_1+n_2M_2}{n_1+n_2}"
      },
      {
        "latex": "C_v=\\frac{n_1C_{v1}+n_2C_{v2}}{n_1+n_2}"
      },
      {
        "latex": "\\gamma=\\frac{C_{p(mix)}}{C_{v(mix)}}=\\frac{n_1C_{p1}+n_2C_{p2}+\\cdots}{n_1C_{v1}+n_2C_{v2}+\\cdots}"
      }
    ],
    "variables": [],
    "conditions": [
      "Mixture relation is for non-reacting gases."
    ],
    "importance": 4,
    "source_page": 33,
    "sort_order": 5
  },
  {
    "id": "jee-physics-heat-thermodynamics-heat-engine",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": {
      "type": "heat-engine"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Heat Engine Efficiency",
    "card_type": "mixed",
    "body": "The heat engine receives heat from the hot reservoir, rejects heat to the cold reservoir, and does work.",
    "formulas": [
      {
        "latex": "\\eta=\\frac{\\text{work done by the engine}}{\\text{heat supplied to it}}"
      },
      {
        "latex": "\\eta=\\frac{W}{Q_H}=\\frac{Q_H-Q_L}{Q_H}=1-\\frac{Q_L}{Q_H}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 33,
    "sort_order": 6
  },
  {
    "id": "jee-physics-heat-thermodynamics-second-law-entropy",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Second Law and Entropy",
    "card_type": "mixed",
    "body": "The source lists Kelvin-Planck and Clausius statements, then defines entropy change.",
    "formulas": [
      {
        "latex": "\\Delta S=\\frac{\\Delta Q}{T}"
      },
      {
        "latex": "S_f-S_i=\\int_i^f\\frac{\\Delta Q}{T}"
      }
    ],
    "variables": [],
    "conditions": [
      "Kelvin-Planck: an engine operating in a cycle cannot produce only the effect of extracting heat from a reservoir and doing equivalent work.",
      "Clausius: heat cannot flow from lower to higher temperature without external work on the working substance.",
      "In an adiabatic reversible process, entropy remains constant."
    ],
    "importance": 5,
    "source_page": 34,
    "sort_order": 7
  },
  {
    "id": "jee-physics-heat-thermodynamics-carnot-engine",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": {
      "type": "carnot-pv"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Carnot Engine",
    "card_type": "mixed",
    "body": "The handbook lists the four Carnot operations and the thermal efficiency relation.",
    "formulas": [
      {
        "latex": "\\frac{V_2}{V_1}=\\frac{V_3}{V_4}\\Rightarrow\\frac{Q_2}{Q_1}=\\frac{T_2}{T_1}"
      },
      {
        "latex": "\\eta=1-\\frac{T_2}{T_1}"
      }
    ],
    "variables": [],
    "conditions": [
      "Operations: isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression."
    ],
    "importance": 5,
    "source_page": 34,
    "sort_order": 8
  },
  {
    "id": "jee-physics-heat-thermodynamics-refrigerator",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": {
      "type": "refrigerator"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Refrigerator and COP",
    "card_type": "mixed",
    "body": "The source gives a refrigerator schematic and defines coefficient of performance.",
    "formulas": [
      {
        "latex": "\\beta=\\frac{Q_2}{W}"
      }
    ],
    "variables": [],
    "conditions": [
      "The printed COP temperature expression is retained in the PDF fallback because its duplicated equality layout is ambiguous."
    ],
    "importance": 4,
    "source_page": 35,
    "sort_order": 9
  },
  {
    "id": "jee-physics-heat-thermodynamics-thermometers",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": {
      "columns": [
        "Thermometer",
        "Formula"
      ],
      "rows": [
        [
          "Liquid",
          "$T=\\left[\\frac{\\ell-\\ell_0}{\\ell_{100}-\\ell_0}\\right]\\times100$"
        ],
        [
          "Gas, constant volume",
          "$T=\\left[\\frac{P-P_0}{P_{100}-P_0}\\right]\\times100$, $P=P_0+\\rho gh$"
        ],
        [
          "Gas, constant pressure",
          "$T=\\left[\\frac{V}{V-V'}\\right]T_0$"
        ],
        [
          "Electrical resistance",
          "$T=\\left[\\frac{R_t-R_0}{R_{100}-R_0}\\right]\\times100$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Thermometers",
    "card_type": "table",
    "body": "The source lists liquid, gas, and electrical resistance thermometer formulas.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 35,
    "sort_order": 10
  },
  {
    "id": "jee-physics-heat-thermodynamics-thermal-expansion-stress",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Thermal Expansion and Stress",
    "card_type": "mixed",
    "body": "The expansion coefficients, stress relation, stored energy, and pendulum-clock variation are listed together.",
    "formulas": [
      {
        "label": "Linear",
        "latex": "\\alpha=\\frac{\\Delta L}{L_0\\Delta T},\\quad L=L_0(1+\\alpha\\Delta T)"
      },
      {
        "label": "Area",
        "latex": "\\beta=\\frac{\\Delta A}{A_0\\Delta T},\\quad A=A_0(1+\\beta\\Delta T)"
      },
      {
        "label": "Volume",
        "latex": "\\gamma=\\frac{\\Delta V}{V_0\\Delta T},\\quad V=V_0(1+\\gamma\\Delta T)"
      },
      {
        "latex": "\\alpha=\\frac{\\beta}{2}=\\frac{\\gamma}{3}"
      },
      {
        "label": "Thermal stress",
        "latex": "\\frac{F}{A}=Y\\frac{\\Delta\\ell}{\\ell}"
      },
      {
        "label": "Energy per unit volume",
        "latex": "E=\\frac{1}{2}K(\\Delta L)^2\\quad\\text{or}\\quad E=\\frac{1}{2}\\frac{AY}{L}(\\Delta L)^2"
      },
      {
        "label": "Pendulum clock",
        "latex": "\\Delta T=\\frac{1}{2}\\alpha\\Delta\\theta T"
      }
    ],
    "variables": [],
    "conditions": [
      "$T'<T$: clock fast/time gain.",
      "$T'>T$: clock slow/time loss."
    ],
    "importance": 5,
    "source_page": 36,
    "sort_order": 11
  },
  {
    "id": "jee-physics-heat-thermodynamics-calorimetry-conduction",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Calorimetry and Conduction",
    "card_type": "formula",
    "body": "The source gives specific heat, molar specific heat, water equivalent, conduction, and thermal resistance.",
    "formulas": [
      {
        "latex": "S=\\frac{Q}{m\\Delta T}"
      },
      {
        "latex": "C=\\frac{\\Delta Q}{n\\Delta T}"
      },
      {
        "latex": "\\text{Water equivalent}=m_WS_W"
      },
      {
        "latex": "\\frac{dQ}{dt}=-KA\\frac{dT}{dx}"
      },
      {
        "latex": "R=\\frac{\\ell}{KA}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 36,
    "sort_order": 12
  },
  {
    "id": "jee-physics-heat-thermodynamics-thermal-resistance-combinations",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Thermal Resistance Combinations",
    "card_type": "formula",
    "body": "The handbook gives series and parallel rod combination relations.",
    "formulas": [
      {
        "label": "Series rods",
        "latex": "\\frac{\\ell_{eq}}{K_{eq}}=\\frac{\\ell_1}{K_1}+\\frac{\\ell_2}{K_2}+\\cdots"
      },
      {
        "label": "Parallel rods",
        "latex": "K_{eq}A_{eq}=K_1A_1+K_2A_2+\\cdots"
      }
    ],
    "variables": [],
    "conditions": [
      "Series relation is listed when $A_1=A_2=A_3=\\cdots$.",
      "Parallel relation is listed when $\\ell_1=\\ell_2=\\ell_3=\\cdots$."
    ],
    "importance": 4,
    "source_page": 37,
    "sort_order": 13
  },
  {
    "id": "jee-physics-heat-thermodynamics-radiation-cooling",
    "chapter_id": "jee-physics-heat-thermodynamics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Radiation Laws and Cooling",
    "card_type": "formula",
    "body": "The source lists absorption/reflection/transmission, emissive quantities, Kirchhoff, Wien, Stefan-Boltzmann, and Newton cooling.",
    "formulas": [
      {
        "latex": "r+t+a=1"
      },
      {
        "label": "Emissive power",
        "latex": "E=\\frac{\\Delta U}{\\Delta A\\Delta t}"
      },
      {
        "label": "Spectral emissive power",
        "latex": "E_\\lambda=\\frac{dE}{d\\lambda}"
      },
      {
        "label": "Emissivity",
        "latex": "e=\\frac{E\\text{ of a body at }T}{E\\text{ of a black body at }T}"
      },
      {
        "label": "Kirchhoff's law",
        "latex": "\\frac{E_{body}}{a_{body}}=E_{black\\ body}"
      },
      {
        "label": "Wien's law",
        "latex": "\\lambda_mT=b,\\quad b=0.282\\ \\text{cm-k}"
      },
      {
        "label": "Stefan-Boltzmann",
        "latex": "u=\\sigma T^4,\\quad \\Delta u=e\\sigma A(T^4-T_0^4)"
      },
      {
        "label": "Newton cooling",
        "latex": "\\frac{d\\theta}{dt}=k(\\theta-\\theta_0),\\quad \\theta=\\theta_0+(\\theta_i-\\theta_0)e^{-kt}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source lists $\\sigma=5.67\\times10^{-8}\\ W/m^2k^4$."
    ],
    "importance": 5,
    "source_page": 37,
    "sort_order": 14
  },
  {
    "id": "jee-physics-electrostatics-coulomb-field-potential",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Coulomb Force, Field and Potential",
    "card_type": "formula",
    "body": "The electrostatics chapter starts with Coulomb force, electric field, electric force, and electric potential.",
    "formulas": [
      {
        "label": "Coulomb force",
        "latex": "\\vec F=\\frac{1}{4\\pi\\epsilon_0\\epsilon_r}\\frac{q_1q_2}{|\\vec r|^3}\\vec r=\\frac{1}{4\\pi\\epsilon_0\\epsilon_r}\\frac{q_1q_2}{|\\vec r|^2}\\hat r"
      },
      {
        "label": "Electric field",
        "latex": "\\vec E=\\frac{\\vec F}{q_0}"
      },
      {
        "label": "Electric force",
        "latex": "\\vec F=q\\vec E"
      },
      {
        "label": "Electric potential",
        "latex": "V_P=\\left[\\frac{(W_{\\infty P})_{ext}}{q}\\right]_{acc=0}"
      }
    ],
    "variables": [
      {
        "latex": "q",
        "symbol": "$q$",
        "meaning": "charge"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 37,
    "sort_order": 1
  },
  {
    "id": "jee-physics-electrostatics-field-potential-point-line-sheet",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": {
      "columns": [
        "Distribution",
        "Field",
        "Potential relation"
      ],
      "rows": [
        [
          "Point charge",
          "$\\vec E=\\frac{Kq}{|\\vec r|^2}\\hat r=\\frac{Kq}{r^3}\\vec r$",
          "$V=\\frac{Kq}{r}$"
        ],
        [
          "Infinitely long line charge",
          "$\\vec E=\\frac{\\lambda}{2\\pi\\epsilon_0r}\\hat r=\\frac{2K\\lambda}{r}\\hat r$",
          "$V$ not defined; $V_B-V_A=-2K\\lambda\\ln(r_B/r_A)$"
        ],
        [
          "Infinite nonconducting thin sheet",
          "$\\vec E=\\frac{\\sigma}{2\\epsilon_0}\\hat n$",
          "$V$ not defined; $V_B-V_A=-\\frac{\\sigma}{2\\epsilon_0}(r_B-r_A)$"
        ],
        [
          "Infinitely large conducting sheet",
          "$\\vec E=\\frac{\\sigma}{\\epsilon_0}\\hat n$",
          "$V$ not defined; $V_B-V_A=-\\frac{\\sigma}{\\epsilon_0}(r_B-r_A)$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Field and Potential: Point, Line, Sheets",
    "card_type": "table",
    "body": "The source compares electric field and potential for common charge distributions.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 38,
    "sort_order": 2
  },
  {
    "id": "jee-physics-electrostatics-ring-spheres-disc",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": {
      "columns": [
        "Body",
        "Source-backed field/potential"
      ],
      "rows": [
        [
          "Uniformly charged ring",
          "$E_{axis}=\\frac{KQx}{(R^2+x^2)^{3/2}}$, $E_{centre}=0$, $V_{axis}=\\frac{KQ}{\\sqrt{R^2+x^2}}$, $V_{centre}=\\frac{KQ}{R}$"
        ],
        [
          "Hollow conducting/nonconducting or solid conducting sphere",
          "$r\\ge R$: $\\vec E=\\frac{KQ}{|\\vec r|^2}\\hat r$, $V=\\frac{KQ}{r}$; $r<R$: $\\vec E=0$, $V=\\frac{KQ}{R}$"
        ],
        [
          "Solid nonconducting sphere",
          "$r\\ge R$: $\\vec E=\\frac{KQ}{|\\vec r|^2}\\hat r$, $V=\\frac{KQ}{r}$; $r\\le R$: $\\vec E=\\frac{KQ}{R^3}\\vec r=\\frac{\\rho\\vec r}{3\\epsilon_0}$, $V=\\frac{\\rho}{6\\epsilon_0}(3R^2-r^2)$"
        ],
        [
          "Thin uniformly charged disc",
          "$E_{axis}=\\frac{\\sigma}{2\\epsilon_0}\\left[1-\\frac{x}{\\sqrt{R^2+x^2}}\\right]$, $V_{axis}=\\frac{\\sigma}{2\\epsilon_0}\\left[\\sqrt{R^2+x^2}-x\\right]$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Field and Potential: Ring, Spheres, Disc",
    "card_type": "table",
    "body": "Ring, sphere, and disc expressions are preserved as structured formulas.",
    "formulas": [],
    "variables": [
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 39,
    "sort_order": 3
  },
  {
    "id": "jee-physics-electrostatics-work-energy-self-energy",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Work, Potential Energy and Self Energy",
    "card_type": "formula",
    "body": "The source lists work by external/electric agents, point-charge potential energy, energy density, and self energy.",
    "formulas": [
      {
        "latex": "(W_{ext})_{AB}=q(V_B-V_A)"
      },
      {
        "latex": "(W_{el})_{AB}=q(V_A-V_B)"
      },
      {
        "latex": "U=qV"
      },
      {
        "latex": "u=\\frac{1}{2}\\epsilon E^2"
      },
      {
        "label": "Uniformly charged shell",
        "latex": "U_{self}=\\frac{KQ^2}{2R}"
      },
      {
        "label": "Solid nonconducting sphere",
        "latex": "U_{self}=\\frac{3KQ^2}{5R}"
      }
    ],
    "variables": [
      {
        "latex": "q",
        "symbol": "$q$",
        "meaning": "charge"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 39,
    "sort_order": 4
  },
  {
    "id": "jee-physics-electrostatics-dipole-field",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electric Dipole Field",
    "card_type": "formula",
    "body": "The handbook gives dipole field on axis, equatorial position, and a general point.",
    "formulas": [
      {
        "label": "Axis",
        "latex": "\\vec E=\\frac{2K\\vec P}{r^3}"
      },
      {
        "label": "Equatorial position",
        "latex": "\\vec E=-\\frac{K\\vec P}{r^3}"
      },
      {
        "label": "General point",
        "latex": "E_{res}=\\frac{KP}{r^3}\\sqrt{1+3\\cos^2\\theta}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 39,
    "sort_order": 5
  },
  {
    "id": "jee-physics-electrostatics-dipole-energy-torque-potential",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Dipole Energy, Torque and Potential",
    "card_type": "formula",
    "body": "The source gives dipole potential energy, torque, nonuniform-field force, and potential.",
    "formulas": [
      {
        "latex": "U=-\\vec p\\cdot\\vec E"
      },
      {
        "label": "Uniform field",
        "latex": "\\vec\\tau=\\vec p\\times\\vec E,\\quad \\vec F=0"
      },
      {
        "label": "Nonuniform field",
        "latex": "\\vec\\tau=\\vec p\\times\\vec E,\\quad U=-\\vec p\\cdot\\vec E,\\quad |F|=p\\frac{\\partial E}{\\partial r}"
      },
      {
        "label": "Dipole potential",
        "latex": "V=\\frac{P\\cos\\theta}{4\\pi\\epsilon_0r^2}=\\frac{\\vec p\\cdot\\vec r}{4\\pi\\epsilon_0r^3}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 40,
    "sort_order": 6
  },
  {
    "id": "jee-physics-electrostatics-flux-gauss",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Electric Flux and Gauss's Law",
    "card_type": "formula",
    "body": "Electric flux over an area and flux through a closed surface are given directly in the source.",
    "formulas": [
      {
        "label": "Electric flux",
        "latex": "\\phi_E=\\int_S\\vec E\\cdot d\\vec S=\\int_SE_n\\,dS"
      },
      {
        "label": "Gauss's law",
        "latex": "\\phi_E=\\oint\\vec E\\cdot d\\vec S=\\frac{q_{in}}{\\epsilon_0}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 40,
    "sort_order": 7
  },
  {
    "id": "jee-physics-electrostatics-conducting-surface-pressure",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Conducting Surface Field and Electric Pressure",
    "card_type": "formula",
    "body": "The source gives field near a conducting surface and electric pressure at a conductor surface.",
    "formulas": [
      {
        "latex": "\\vec E=\\frac{\\sigma}{\\epsilon_0}\\hat n"
      },
      {
        "latex": "P=\\frac{\\sigma^2}{2\\epsilon_0}"
      }
    ],
    "variables": [
      {
        "latex": "\\sigma",
        "symbol": "$\\sigma$",
        "meaning": "surface charge density or conductivity depending on context"
      }
    ],
    "conditions": [
      "$\\sigma$ is the local surface charge density."
    ],
    "importance": 4,
    "source_page": 40,
    "sort_order": 8
  },
  {
    "id": "jee-physics-electrostatics-relation-e-v",
    "chapter_id": "jee-physics-electrostatics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Relation Between Electric Field and Potential",
    "card_type": "formula",
    "body": "The handbook relates potential difference to line integral of field and writes field as negative gradient of potential.",
    "formulas": [
      {
        "latex": "V_B-V_A=-\\int_A^B\\vec E\\cdot d\\vec r"
      },
      {
        "latex": "\\vec E=-\\nabla V=-\\operatorname{grad}V"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 40,
    "sort_order": 9
  },
  {
    "id": "jee-physics-current-electricity-current-drift-density",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Current, Drift Velocity and Current Density",
    "card_type": "formula",
    "body": "The source defines average and instantaneous current, conductor current, drift velocity, and current density.",
    "formulas": [
      {
        "latex": "I_{av}=\\frac{\\Delta q}{\\Delta t}"
      },
      {
        "latex": "i=\\lim_{\\Delta t\\to0}\\frac{\\Delta q}{\\Delta t}=\\frac{dq}{dt}"
      },
      {
        "latex": "I=nAeV_d"
      },
      {
        "latex": "v_d=\\frac{\\lambda}{\\tau}"
      },
      {
        "latex": "v_d=\\frac{1}{2}\\frac{eE}{m}\\tau"
      },
      {
        "latex": "\\vec J=\\frac{dI}{ds}\\hat n"
      }
    ],
    "variables": [
      {
        "latex": "q",
        "symbol": "$q$",
        "meaning": "charge"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 41,
    "sort_order": 1
  },
  {
    "id": "jee-physics-current-electricity-resistance-ohm-law",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Resistance, Resistivity and Ohm's Law",
    "card_type": "formula",
    "body": "The source derives current proportionality and identifies Ohm's law.",
    "formulas": [
      {
        "latex": "E=\\frac{V}{\\ell}"
      },
      {
        "latex": "I=\\left(\\frac{A}{\\rho\\ell}\\right)V=\\frac{V}{R}"
      },
      {
        "latex": "V=IR"
      },
      {
        "latex": "\\rho=\\frac{2m}{ne^2\\tau}=\\frac{1}{\\sigma}"
      }
    ],
    "variables": [
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      },
      {
        "latex": "\\sigma",
        "symbol": "$\\sigma$",
        "meaning": "surface charge density or conductivity depending on context"
      }
    ],
    "conditions": [
      "$\\rho$ is resistivity, also called specific resistance.",
      "$\\sigma$ is conductivity.",
      "Units: $R$ in ohm, $\\rho$ in ohm-meter, $\\sigma$ in $\\Omega^{-1}m^{-1}$."
    ],
    "importance": 5,
    "source_page": 41,
    "sort_order": 2
  },
  {
    "id": "jee-physics-current-electricity-temperature-power-heating",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Temperature Dependence, Power and Heating",
    "card_type": "formula",
    "body": "Resistance temperature dependence, current through resistance, electric power, and heating are listed together.",
    "formulas": [
      {
        "latex": "R=R_0(1+\\alpha\\theta)"
      },
      {
        "latex": "I=\\frac{V_2-V_1}{R}"
      },
      {
        "latex": "P=VI"
      },
      {
        "latex": "\\text{Energy}=\\int p\\,dt"
      },
      {
        "latex": "P=I^2R=VI=\\frac{V^2}{R}"
      },
      {
        "latex": "H=VIt=I^2Rt=\\frac{V^2}{R}t"
      },
      {
        "latex": "H=I^2RT\\ \\text{Joule}=\\frac{I^2RT}{4.2}\\ \\text{Calorie}"
      }
    ],
    "variables": [
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 42,
    "sort_order": 3
  },
  {
    "id": "jee-physics-current-electricity-kirchhoff-resistors",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "resistor-combinations"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Kirchhoff Laws and Resistor Combinations",
    "card_type": "mixed",
    "body": "The source lists KCL, KVL, and resistor series/parallel results.",
    "formulas": [
      {
        "label": "Junction law",
        "latex": "\\sum I_{in}=\\sum I_{out}"
      },
      {
        "label": "Loop law",
        "latex": "\\sum IR+\\sum EMF=0"
      },
      {
        "label": "Series",
        "latex": "R=R_1+R_2+R_3+\\cdots+R_n"
      },
      {
        "latex": "V=V_1+V_2+\\cdots+V_n"
      },
      {
        "latex": "V_1=\\frac{R_1}{R_1+R_2+\\cdots+R_n}V"
      },
      {
        "label": "Parallel",
        "latex": "\\frac{1}{R_{eq}}=\\frac{1}{R_1}+\\frac{1}{R_2}+\\frac{1}{R_3}"
      }
    ],
    "variables": [
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 42,
    "sort_order": 4
  },
  {
    "id": "jee-physics-current-electricity-wheatstone",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "wheatstone-bridge"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Wheatstone Network",
    "card_type": "mixed",
    "body": "At null point, the handbook gives the balanced Wheatstone bridge condition.",
    "formulas": [
      {
        "latex": "\\frac{P}{Q}=\\frac{R}{S}"
      },
      {
        "latex": "PS=QR"
      }
    ],
    "variables": [],
    "conditions": [
      "Current through the galvanometer is zero at the null or balance point."
    ],
    "importance": 5,
    "source_page": 43,
    "sort_order": 5
  },
  {
    "id": "jee-physics-current-electricity-cells-grouping",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": {
      "columns": [
        "Grouping",
        "Equivalent relations"
      ],
      "rows": [
        [
          "Series",
          "$E_{eq}=E_1+E_2+\\cdots+E_n$, $r_{eq}=r_1+r_2+r_3+\\cdots+r_n$"
        ],
        [
          "Parallel",
          "$E_{eq}=\\frac{\\epsilon_1/r_1+\\epsilon_2/r_2+\\cdots+\\epsilon_n/r_n}{1/r_1+1/r_2+\\cdots+1/r_n}$, $\\frac{1}{r_{eq}}=\\frac{1}{r_1}+\\frac{1}{r_2}+\\cdots+\\frac{1}{r_n}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "cells-grouping"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Grouping of Cells",
    "card_type": "table",
    "body": "The source gives equivalent EMF and internal resistance for cells in series and parallel.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Use EMF with polarity."
    ],
    "importance": 5,
    "source_page": 43,
    "sort_order": 6
  },
  {
    "id": "jee-physics-current-electricity-ammeter",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "ammeter-shunt"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ammeter Conversion",
    "card_type": "mixed",
    "body": "The source converts a galvanometer to an ammeter by adding a shunt in parallel.",
    "formulas": [
      {
        "latex": "I_GR_G=(I-I_G)S"
      },
      {
        "latex": "S=\\frac{I_GR_G}{I-I_G}"
      },
      {
        "latex": "S=\\frac{I_G R_G}{I}\\quad\\text{when }I\\gg I_G"
      }
    ],
    "variables": [],
    "conditions": [
      "An ideal ammeter has zero resistance."
    ],
    "importance": 5,
    "source_page": 44,
    "sort_order": 7
  },
  {
    "id": "jee-physics-current-electricity-voltmeter",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "voltmeter-series"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Voltmeter Conversion",
    "card_type": "mixed",
    "body": "A high resistance is placed in series with the galvanometer to make a voltmeter.",
    "formulas": [
      {
        "latex": "V=I_GR_S+I_GR_G"
      },
      {
        "latex": "R_S=\\frac{V}{I_G}-R_G"
      },
      {
        "latex": "R_G\\ll R_S\\Rightarrow R_S\\approx\\frac{V}{I_G}"
      }
    ],
    "variables": [],
    "conditions": [
      "A voltmeter measures potential difference across a resistor in a circuit."
    ],
    "importance": 5,
    "source_page": 44,
    "sort_order": 8
  },
  {
    "id": "jee-physics-current-electricity-potentiometer-base",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "potentiometer-base"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Potentiometer and Potential Gradient",
    "card_type": "mixed",
    "body": "The source gives potentiometer current, wire potential difference, and potential gradient.",
    "formulas": [
      {
        "latex": "I=\\frac{\\epsilon}{r+R}"
      },
      {
        "latex": "V_A-V_B=\\frac{\\epsilon}{R+r}R"
      },
      {
        "latex": "x=\\frac{V_A-V_B}{L}=\\frac{\\epsilon}{R+r}\\cdot\\frac{R}{L}"
      }
    ],
    "variables": [],
    "conditions": [
      "Potential gradient $x$ is potential difference per unit length of wire."
    ],
    "importance": 5,
    "source_page": 44,
    "sort_order": 9
  },
  {
    "id": "jee-physics-current-electricity-potentiometer-applications",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Potentiometer Applications",
    "card_type": "formula",
    "body": "The source lists EMF comparison, current finding, and internal resistance measurement.",
    "formulas": [
      {
        "label": "Compare EMFs",
        "latex": "\\epsilon_1=x\\ell_1,\\quad \\epsilon_2=x\\ell_2,\\quad \\frac{\\epsilon_1}{\\epsilon_2}=\\frac{\\ell_1}{\\ell_2}"
      },
      {
        "label": "Find current",
        "latex": "V_A-V_C=x\\ell_1,\\quad IR_1=x\\ell_1,\\quad I=\\frac{x\\ell_1}{R_1}"
      },
      {
        "label": "Internal resistance",
        "latex": "r'=\\left[\\frac{\\ell_1-\\ell_2}{\\ell_2}\\right]R"
      }
    ],
    "variables": [],
    "conditions": [
      "The source states potentiometer is an ideal voltmeter because it draws no current at balance point."
    ],
    "importance": 5,
    "source_page": 45,
    "sort_order": 10
  },
  {
    "id": "jee-physics-current-electricity-metre-bridge",
    "chapter_id": "jee-physics-current-electricity",
    "table_data": null,
    "diagram_data": {
      "type": "metre-bridge"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Metre Bridge",
    "card_type": "mixed",
    "body": "The metre bridge card keeps the wire ratio and unknown resistance formula from the source.",
    "formulas": [
      {
        "latex": "AB=\\ell\\ \\text{cm},\\quad BC=(100-\\ell)\\ \\text{cm}"
      },
      {
        "latex": "P=\\sigma\\ell,\\quad Q=\\sigma(100-\\ell)"
      },
      {
        "latex": "\\frac{P}{Q}=\\frac{\\ell}{100-\\ell}"
      },
      {
        "latex": "RQ=PX"
      },
      {
        "latex": "X=\\frac{100-\\ell}{\\ell}R"
      }
    ],
    "variables": [],
    "conditions": [
      "Used to measure unknown resistance."
    ],
    "importance": 5,
    "source_page": 46,
    "sort_order": 11
  },
  {
    "id": "jee-physics-capacitance-definition-energy-density",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Capacitance, Stored Energy and Energy Density",
    "card_type": "formula",
    "body": "The chapter starts with charge-potential relation, stored energy, and energy density.",
    "formulas": [
      {
        "latex": "q=CV"
      },
      {
        "latex": "U=\\frac{1}{2}CV^2=\\frac{Q^2}{2C}=\\frac{QV}{2}"
      },
      {
        "latex": "u=\\frac{1}{2}\\epsilon_0\\epsilon_rE^2=\\frac{1}{2}\\epsilon_0KE^2"
      },
      {
        "label": "Vacuum",
        "latex": "u=\\frac{1}{2}\\epsilon_0E^2"
      }
    ],
    "variables": [
      {
        "latex": "q",
        "symbol": "$q$",
        "meaning": "charge"
      },
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      }
    ],
    "conditions": [
      "$K=\\epsilon_r$ is dielectric constant."
    ],
    "importance": 5,
    "source_page": 47,
    "sort_order": 1
  },
  {
    "id": "jee-physics-capacitance-capacitor-types",
    "chapter_id": "jee-physics-capacitance",
    "table_data": {
      "columns": [
        "Capacitor",
        "Capacitance"
      ],
      "rows": [
        [
          "Parallel plate",
          "$C=\\frac{\\epsilon_0\\epsilon_rA}{d}=K\\frac{\\epsilon_0A}{d}$"
        ],
        [
          "Isolated spherical conductor",
          "$C=4\\pi\\epsilon_0\\epsilon_rR$"
        ],
        [
          "Spherical capacitor",
          "$C=4\\pi\\epsilon_0\\frac{ab}{b-a}$"
        ],
        [
          "Spherical capacitor with dielectric",
          "$C=\\frac{4\\pi\\epsilon_0K_2ab}{b-a}$"
        ],
        [
          "Cylindrical capacitor",
          "$\\frac{C}{\\ell}=\\frac{2\\pi\\epsilon_0}{\\ln(b/a)}\\ F/m$, $\\ell\\gg\\{a,b\\}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "capacitor-types"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Types of Capacitors",
    "card_type": "table",
    "body": "The source lists parallel plate, spherical, and cylindrical capacitor formulas.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 48,
    "sort_order": 2
  },
  {
    "id": "jee-physics-capacitance-plate-field-force",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Plate Dependencies, Field and Force",
    "card_type": "formula",
    "body": "The source states what capacitance depends on, then gives field between plates and force on either plate.",
    "formulas": [
      {
        "latex": "E=\\frac{\\sigma}{\\epsilon_0}=\\frac{V}{d}"
      },
      {
        "latex": "F=\\frac{q^2}{2A\\epsilon_0}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      },
      {
        "latex": "q",
        "symbol": "$q$",
        "meaning": "charge"
      }
    ],
    "conditions": [
      "Capacitance depends on plate area, plate separation, and dielectric medium between plates."
    ],
    "importance": 5,
    "source_page": 48,
    "sort_order": 3
  },
  {
    "id": "jee-physics-capacitance-charge-redistribution",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "capacitor-redistribution"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Charge Redistribution",
    "card_type": "mixed",
    "body": "When two charged capacitors are connected, the source gives common potential and final charges.",
    "formulas": [
      {
        "latex": "V=\\frac{C_1V_1+C_2V_2}{C_1+C_2}=\\frac{\\text{Total charge}}{\\text{Total capacitance}}"
      },
      {
        "latex": "Q_1'=C_1V=\\frac{C_1}{C_1+C_2}(Q_1+Q_2)"
      },
      {
        "latex": "Q_2'=C_2V=\\frac{C_2}{C_1+C_2}(Q_1+Q_2)"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 48,
    "sort_order": 4
  },
  {
    "id": "jee-physics-capacitance-heat-loss-combinations",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "capacitor-combinations"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Heat Loss and Capacitor Combinations",
    "card_type": "mixed",
    "body": "The source gives heat loss during redistribution and series/parallel capacitor results.",
    "formulas": [
      {
        "label": "Heat loss",
        "latex": "\\Delta H=U_i-U_f=\\frac{1}{2}\\frac{C_1C_2}{C_1+C_2}(V_1-V_2)^2"
      },
      {
        "label": "Series",
        "latex": "\\frac{1}{C_{eq}}=\\frac{1}{C_1}+\\frac{1}{C_2}+\\frac{1}{C_3}"
      },
      {
        "latex": "V_1:V_2:V_3=\\frac{1}{C_1}:\\frac{1}{C_2}:\\frac{1}{C_3}"
      },
      {
        "label": "Parallel",
        "latex": "C_{eq}=C_1+C_2+C_3"
      },
      {
        "latex": "Q_1:Q_2:Q_3=C_1:C_2:C_3"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      }
    ],
    "conditions": [
      "The loss of energy is in the form of Joule heating in the wire."
    ],
    "importance": 5,
    "source_page": 49,
    "sort_order": 5
  },
  {
    "id": "jee-physics-capacitance-rc-charging",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "rc-charging"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "RC Charging",
    "card_type": "mixed",
    "body": "For an initially uncharged capacitor, the source gives charge and current during charging.",
    "formulas": [
      {
        "latex": "q=q_0(1-e^{-t/\\tau})"
      },
      {
        "latex": "q_0=CV"
      },
      {
        "latex": "\\tau=CR_{eq}"
      },
      {
        "latex": "I=\\frac{q_0}{\\tau}e^{-t/\\tau}=\\frac{V}{R}e^{-t/\\tau}"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      }
    ],
    "conditions": [
      "At $t=\\tau$, the source graph marks $q=0.63q_0$."
    ],
    "importance": 5,
    "source_page": 50,
    "sort_order": 6
  },
  {
    "id": "jee-physics-capacitance-rc-discharging",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "rc-discharging"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "RC Discharging",
    "card_type": "mixed",
    "body": "For discharging, charge and current decay exponentially.",
    "formulas": [
      {
        "latex": "q=q_0e^{-t/\\tau}"
      },
      {
        "latex": "I=\\frac{q_0}{\\tau}e^{-t/\\tau}"
      }
    ],
    "variables": [],
    "conditions": [
      "$q_0$ is the initial charge on the capacitor.",
      "At $t=\\tau$, the source graph marks $q=0.37q_0$."
    ],
    "importance": 5,
    "source_page": 50,
    "sort_order": 7
  },
  {
    "id": "jee-physics-capacitance-dielectric-capacitor",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "dielectric-capacitor"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Capacitor with Dielectric",
    "card_type": "mixed",
    "body": "The source gives capacitance, internal electric field, and bound charge density with dielectric.",
    "formulas": [
      {
        "latex": "C=\\frac{K\\epsilon_0A}{d}=KC_0"
      },
      {
        "latex": "E_{in}=E-E_{ind}=\\frac{\\sigma}{\\epsilon_0}-\\frac{\\sigma_b}{\\epsilon_0}=\\frac{\\sigma}{K\\epsilon_0}=\\frac{V}{d}"
      },
      {
        "latex": "\\sigma_b=\\sigma\\left(1-\\frac{1}{K}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field or energy depending on context"
      },
      {
        "latex": "K",
        "symbol": "$K$",
        "meaning": "dielectric constant or constant used in the source"
      }
    ],
    "conditions": [
      "$C_0$ is capacitance in the absence of dielectric.",
      "$E=\\sigma/\\epsilon_0$ is electric field in absence of dielectric."
    ],
    "importance": 5,
    "source_page": 50,
    "sort_order": 8
  },
  {
    "id": "jee-physics-capacitance-force-on-dielectric",
    "chapter_id": "jee-physics-capacitance",
    "table_data": null,
    "diagram_data": {
      "type": "dielectric-force"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Force on Dielectric",
    "card_type": "mixed",
    "body": "The source gives force on a dielectric with battery connected and disconnected.",
    "formulas": [
      {
        "label": "Battery connected",
        "latex": "F=\\frac{\\epsilon_0b(K-1)V^2}{2d}"
      },
      {
        "label": "Battery not connected",
        "latex": "F=\\frac{Q^2}{2C^2}\\frac{dC}{dx}"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      },
      {
        "latex": "V",
        "symbol": "$V$",
        "meaning": "potential difference or potential"
      }
    ],
    "conditions": [
      "Force on the dielectric is zero when the dielectric is fully inside."
    ],
    "importance": 5,
    "source_page": 51,
    "sort_order": 9
  },
  {
    "id": "jee-physics-alternating-current-ac-dc",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": {
      "type": "ac-dc-waveforms"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "AC and DC Current",
    "card_type": "mixed",
    "body": "The source defines alternating current and direct current and shows representative waveforms.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "AC changes direction periodically.",
      "DC maintains constant direction."
    ],
    "importance": 4,
    "source_page": 52,
    "sort_order": 1
  },
  {
    "id": "jee-physics-alternating-current-rms-power-factor",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "RMS, Average Power and Power Factor",
    "card_type": "formula",
    "body": "The RMS definition and average AC power relation are listed together.",
    "formulas": [
      {
        "label": "RMS",
        "latex": "f_{rms}=\\sqrt{\\frac{\\int_{t_1}^{t_2}f^2dt}{t_2-t_1}}"
      },
      {
        "label": "Average power",
        "latex": "\\langle P\\rangle=\\frac{\\int_0^{2\\pi/\\omega}Pdt}{2\\pi/\\omega}=\\frac{1}{2}V_mI_m\\cos\\phi"
      },
      {
        "latex": "\\langle P\\rangle=V_{rms}I_{rms}\\cos\\phi"
      }
    ],
    "variables": [],
    "conditions": [
      "$\\cos\\phi$ is called power factor."
    ],
    "importance": 5,
    "source_page": 52,
    "sort_order": 2
  },
  {
    "id": "jee-physics-alternating-current-definitions",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "AC Definitions",
    "card_type": "formula",
    "body": "The source defines power factor, wattless current, impedance, and reactances.",
    "formulas": [
      {
        "latex": "\\text{Power factor}=\\cos\\phi"
      },
      {
        "latex": "\\text{Wattless current}=I_m\\sin\\phi"
      },
      {
        "latex": "Z=\\frac{V_m}{I_m}=\\frac{V_{rms}}{I_{rms}}"
      },
      {
        "latex": "X_L=\\omega L"
      },
      {
        "latex": "X_C=\\frac{1}{\\omega C}"
      }
    ],
    "variables": [],
    "conditions": [
      "$\\omega L$ is inductive reactance.",
      "$1/(\\omega C)$ is capacitive reactance."
    ],
    "importance": 5,
    "source_page": 53,
    "sort_order": 3
  },
  {
    "id": "jee-physics-alternating-current-pure-resistive",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": {
      "type": "ac-resistor"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Purely Resistive Circuit",
    "card_type": "mixed",
    "body": "In a purely resistive AC circuit, current follows the source voltage over resistance.",
    "formulas": [
      {
        "latex": "I=\\frac{v_s}{R}=\\frac{V_m\\sin\\omega t}{R}=I_m\\sin\\omega t"
      },
      {
        "latex": "I_m=\\frac{V_m}{R}"
      },
      {
        "latex": "I_{rms}=\\frac{V_{rms}}{R}"
      },
      {
        "latex": "\\langle P\\rangle=V_{rms}I_{rms}\\cos\\phi=\\frac{V_{rms}^2}{R}"
      }
    ],
    "variables": [
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "resistance or radius depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 53,
    "sort_order": 4
  },
  {
    "id": "jee-physics-alternating-current-pure-capacitive",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": {
      "type": "ac-capacitor"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Purely Capacitive Circuit",
    "card_type": "mixed",
    "body": "For a purely capacitive circuit, the source writes current in cosine form and defines capacitive reactance.",
    "formulas": [
      {
        "latex": "I=\\frac{V_m}{1/\\omega C}\\cos\\omega t=\\frac{V_m}{X_C}\\cos\\omega t=I_m\\cos\\omega t"
      },
      {
        "latex": "X_C=\\frac{1}{\\omega C}"
      },
      {
        "latex": "\\phi=90^\\circ"
      },
      {
        "latex": "\\langle P\\rangle=V_{rms}I_{rms}\\cos\\phi=0"
      }
    ],
    "variables": [
      {
        "latex": "C",
        "symbol": "$C$",
        "meaning": "capacitance or heat capacity depending on context"
      }
    ],
    "conditions": [
      "The source states $I_C$ leads $V_C$ by $\\pi/2$."
    ],
    "importance": 5,
    "source_page": 53,
    "sort_order": 5
  },
  {
    "id": "jee-physics-alternating-current-capacitive-phase",
    "chapter_id": "jee-physics-alternating-current",
    "table_data": null,
    "diagram_data": {
      "type": "ac-capacitive-phase"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Capacitive Phase Relationship",
    "card_type": "diagram",
    "body": "The source shows voltage and current waveforms plus the phasor relation for a capacitive circuit.",
    "formulas": [
      {
        "latex": "I_C\\text{ leads }V_C\\text{ by }\\frac{\\pi}{2}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 54,
    "sort_order": 6
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
  coalesce(formulas, '[]'::jsonb),
  coalesce(variables, '[]'::jsonb),
  coalesce(conditions, '[]'::jsonb),
  table_data,
  diagram_data,
  diagram_svg,
  importance,
  source_page,
  sort_order,
  coalesce(is_active, true)
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

insert into public.formula_chapters (id, subject_id, title, slug, sort_order)
select
  replace(id, 'jee-', 'neet-') as id,
  'neet-physics' as subject_id,
  title,
  slug,
  sort_order
from public.formula_chapters
where subject_id = 'jee-physics'
  and slug in ('heat-thermodynamics', 'electrostatics', 'current-electricity', 'capacitance', 'alternating-current')
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

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
  replace(id, 'jee-', 'neet-') as id,
  replace(chapter_id, 'jee-', 'neet-') as chapter_id,
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
from public.formula_cards
where chapter_id in ('jee-physics-heat-thermodynamics', 'jee-physics-electrostatics', 'jee-physics-current-electricity', 'jee-physics-capacitance', 'jee-physics-alternating-current')
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
