insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-physics-magnetic-effect-current-force', 'jee-physics', 'Magnetic Effect of Current & Magnetic Force on Charge/Current', 'magnetic-effect-current-force', 18),
  ('jee-physics-electromagnetic-induction', 'jee-physics', 'Electromagnetic Induction', 'electromagnetic-induction', 19),
  ('jee-physics-geometrical-optics', 'jee-physics', 'Geometrical Optics', 'geometrical-optics', 20),
  ('jee-physics-modern-physics', 'jee-physics', 'Modern Physics', 'modern-physics', 21),
  ('jee-physics-wave-optics', 'jee-physics', 'Wave Optics', 'wave-optics', 22)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-physics-magnetic-effect-current-force-moving-charge-biot-savart",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "magnetic-moving-charge"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Moving Charge and Biot-Savart Law",
    "card_type": "mixed",
    "body": "The source starts magnetic field with a moving point charge and the current-element form of Biot-Savart law.",
    "formulas": [
      {
        "label": "Moving point charge",
        "latex": "\\vec B=\\frac{\\mu_0}{4\\pi}\\frac{q(\\vec v\\times\\vec r)}{r^3}"
      },
      {
        "label": "Biot-Savart law",
        "latex": "d\\vec B=\\frac{\\mu_0 I}{4\\pi}\\frac{d\\vec l\\times\\vec r}{r^3}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 54,
    "sort_order": 1
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-straight-wire-fields",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "straight-wire-field"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Straight Wire Magnetic Field",
    "card_type": "mixed",
    "body": "For a finite straight wire the field depends on the two subtended angles; the infinite-wire result is the limiting case.",
    "formulas": [
      {
        "latex": "B=\\frac{\\mu_0 I}{4\\pi r}(\\sin\\theta_1+\\sin\\theta_2)"
      },
      {
        "label": "Infinite straight wire",
        "latex": "B=\\frac{\\mu_0 I}{2\\pi r}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 54,
    "sort_order": 2
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-circular-loop-field",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "circular-loop-field"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Circular Loop Field",
    "card_type": "mixed",
    "body": "The handbook lists the field at the centre and at a point on the axis of an N-turn circular loop.",
    "formulas": [
      {
        "label": "At centre",
        "latex": "B=\\frac{\\mu_0NI}{2r}"
      },
      {
        "label": "At axis",
        "latex": "B=\\frac{\\mu_0}{2}\\frac{NIR^2}{(R^2+x^2)^{3/2}}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 54,
    "sort_order": 3
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-solenoid-ampere-shell",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "solenoid-axis"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Solenoid Axis, Ampere Law and Cylindrical Shell",
    "card_type": "mixed",
    "body": "The source groups solenoid-axis field with Ampere's law and the field of a long cylindrical shell.",
    "formulas": [
      {
        "label": "Solenoid axis",
        "latex": "B=\\frac{\\mu_0 nI}{2}(\\cos\\theta_1-\\cos\\theta_2)"
      },
      {
        "label": "Ampere's law",
        "latex": "\\oint \\vec B\\cdot d\\vec l=\\mu_0I"
      },
      {
        "label": "Long cylindrical shell",
        "latex": "B=0,\\ r<R"
      },
      {
        "latex": "B=\\frac{\\mu_0I}{2\\pi r},\\ r\\ge R"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "refractive index, turn density, or integer depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 55,
    "sort_order": 4
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-magnetic-force-circular-motion",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "charge-circular-motion"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Force and Circular Motion",
    "card_type": "mixed",
    "body": "For velocity perpendicular to magnetic field, the source gives circular motion radius and time period.",
    "formulas": [
      {
        "latex": "\\vec F=q(\\vec v\\times\\vec B)"
      },
      {
        "latex": "r=\\frac{mv}{qB}"
      },
      {
        "latex": "T=\\frac{2\\pi m}{qB}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      }
    ],
    "conditions": [
      "This circular-motion card is for $\\vec v\\perp\\vec B$."
    ],
    "importance": 5,
    "source_page": 55,
    "sort_order": 5
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-helical-motion",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "charge-helical-motion"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Helical Motion in Magnetic Field",
    "card_type": "mixed",
    "body": "When velocity makes an angle with the magnetic field, the perpendicular component sets radius and the parallel component sets pitch.",
    "formulas": [
      {
        "latex": "r=\\frac{mv\\sin\\theta}{qB}"
      },
      {
        "latex": "T=\\frac{2\\pi m}{qB}"
      },
      {
        "latex": "\\text{Pitch}=\\frac{2\\pi mv\\cos\\theta}{qB}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 55,
    "sort_order": 6
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-electric-magnetic-wire-force",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Force in Combined Fields and on a Wire",
    "card_type": "formula",
    "body": "The source gives magnetic force with electric field and force on a current-carrying wire.",
    "formulas": [
      {
        "latex": "\\vec F=q[(\\vec v\\times\\vec B)+\\vec E]"
      },
      {
        "latex": "\\vec F=I(\\vec l\\times\\vec B)"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 55,
    "sort_order": 7
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-loop-moment-torque",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": null,
    "diagram_data": {
      "type": "magnetic-dipole"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Moment and Torque on Loop",
    "card_type": "mixed",
    "body": "For a current-carrying loop, the handbook lists magnetic moment and torque in vector form.",
    "formulas": [
      {
        "latex": "M=NIA"
      },
      {
        "latex": "\\vec\\tau=\\vec M\\times\\vec B"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 55,
    "sort_order": 8
  },
  {
    "id": "jee-physics-magnetic-effect-current-force-magnetic-pole-and-magnet",
    "chapter_id": "jee-physics-magnetic-effect-current-force",
    "table_data": {
      "columns": [
        "Case",
        "Field"
      ],
      "rows": [
        [
          "Single pole",
          "$B=\\frac{\\mu_0}{4\\pi}\\frac{m}{r^2}$"
        ],
        [
          "Axis of magnet",
          "$B=\\frac{\\mu_0}{4\\pi}\\frac{2M}{r^3}$"
        ],
        [
          "Equatorial axis",
          "$B=\\frac{\\mu_0}{4\\pi}\\frac{M}{r^3}$"
        ],
        [
          "Point P",
          "$B=\\frac{\\mu_0M}{4\\pi r^3}\\sqrt{1+3\\cos^2\\theta}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "bar-magnet-point"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Magnetic Pole and Bar Magnet Field",
    "card_type": "table",
    "body": "The source lists field due to a single pole and field of a magnet on axial, equatorial, and general directions.",
    "formulas": [],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 56,
    "sort_order": 9
  },
  {
    "id": "jee-physics-electromagnetic-induction-flux-faraday-lenz",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "emi-flux-loop"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Flux, Faraday Law and Lenz Law",
    "card_type": "mixed",
    "body": "The source defines magnetic flux, induced emf, and Lenz's law as opposition to the producing cause.",
    "formulas": [
      {
        "latex": "\\phi=\\int \\vec B\\cdot d\\vec s"
      },
      {
        "latex": "E=-\\frac{d\\phi}{dt}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      },
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      }
    ],
    "conditions": [
      "Lenz's law is stated as a conservation-of-energy principle."
    ],
    "importance": 5,
    "source_page": 56,
    "sort_order": 1
  },
  {
    "id": "jee-physics-electromagnetic-induction-rotational-emf",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "rotating-disc"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Rotational EMF",
    "card_type": "mixed",
    "body": "A conducting rod rotating about one end in a uniform perpendicular magnetic field develops emf.",
    "formulas": [
      {
        "label": "Rotating rod",
        "latex": "E=\\frac{1}{2}B\\omega l^2"
      },
      {
        "label": "Rotating disc",
        "latex": "E=\\frac{B\\omega r^2}{2}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 56,
    "sort_order": 2
  },
  {
    "id": "jee-physics-electromagnetic-induction-varying-field-electric-field",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "varying-field-loop"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Fixed Loop in Varying Magnetic Field",
    "card_type": "mixed",
    "body": "The source states that a changing magnetic field generates a non-conservative electric field whose lines are closed curves.",
    "formulas": [
      {
        "latex": "E=\\frac{r}{2}\\frac{dB}{dt}"
      }
    ],
    "variables": [
      {
        "latex": "B",
        "symbol": "$B$",
        "meaning": "magnetic field"
      },
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      }
    ],
    "conditions": [
      "The formula is for the average tangential value along a circle."
    ],
    "importance": 4,
    "source_page": 57,
    "sort_order": 3
  },
  {
    "id": "jee-physics-electromagnetic-induction-self-induction",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "inductor-symbol"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Self Induction",
    "card_type": "mixed",
    "body": "Self-induced emf is written through flux linkage and inductance.",
    "formulas": [
      {
        "latex": "\\epsilon=-\\frac{d(N\\phi)}{dt}=-\\frac{d(LI)}{dt}=-L\\frac{dI}{dt}"
      },
      {
        "label": "Solenoid self inductance",
        "latex": "L=\\mu_0n^2\\pi r^2l"
      }
    ],
    "variables": [
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\mu_0",
        "symbol": "$\\mu_0$",
        "meaning": "permeability of free space"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 57,
    "sort_order": 4
  },
  {
    "id": "jee-physics-electromagnetic-induction-inductor-energy",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Inductor Equivalent and Stored Energy",
    "card_type": "formula",
    "body": "The inductor section gives the circuit relation across an inductor and the energy stored in it.",
    "formulas": [
      {
        "latex": "V_A-L\\frac{dI}{dt}=V_B"
      },
      {
        "latex": "U=\\frac{1}{2}LI^2"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 57,
    "sort_order": 5
  },
  {
    "id": "jee-physics-electromagnetic-induction-rl-growth",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "rl-growth"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Growth of Current in Series R-L Circuit",
    "card_type": "mixed",
    "body": "After closing the switch at $t=0$, current rises exponentially toward the final current.",
    "formulas": [
      {
        "latex": "I=\\frac{\\epsilon}{R}\\left(1-e^{-Rt/L}\\right)"
      },
      {
        "latex": "\\tau=\\frac{L}{R}"
      },
      {
        "label": "Final current",
        "latex": "I_f=\\frac{\\epsilon}{R}"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [
      "After one time constant, current is 63% of the final current.",
      "More time constant implies slower rate of change of current."
    ],
    "importance": 5,
    "source_page": 57,
    "sort_order": 6
  },
  {
    "id": "jee-physics-electromagnetic-induction-rl-decay",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "rl-decay"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Decay of Current in R-L Circuit",
    "card_type": "mixed",
    "body": "For an inductor-resistor circuit with initial current $I_0$, the source gives exponential decay.",
    "formulas": [
      {
        "latex": "I=I_0e^{-Rt/L}"
      },
      {
        "latex": "\\tau=\\frac{L}{R}"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [
      "After one time constant the source gives $I=I_0e^{-1}=0.37$ of initial current."
    ],
    "importance": 5,
    "source_page": 58,
    "sort_order": 7
  },
  {
    "id": "jee-physics-electromagnetic-induction-mutual-inductance",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Mutual Inductance",
    "card_type": "formula",
    "body": "Mutual induction is emf in a secondary coil due to changing current in a primary coil.",
    "formulas": [
      {
        "latex": "N\\phi\\text{ (in secondary)}\\propto I"
      },
      {
        "latex": "N\\phi\\text{ (in secondary)}=MI"
      },
      {
        "latex": "M=k\\sqrt{L_1L_2}"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      }
    ],
    "conditions": [
      "The source states $M\\le\\sqrt{L_1L_2}$ and $k\\le1$."
    ],
    "importance": 4,
    "source_page": 58,
    "sort_order": 8
  },
  {
    "id": "jee-physics-electromagnetic-induction-inductor-combinations",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": {
      "columns": [
        "Combination",
        "Equivalent inductance"
      ],
      "rows": [
        [
          "Series, no mutual inductance",
          "$L=L_1+L_2$"
        ],
        [
          "Series, same winding direction",
          "$L=L_1+L_2+2M$"
        ],
        [
          "Series, opposite winding direction",
          "$L=L_1+L_2-2M$"
        ],
        [
          "Parallel, no mutual inductance",
          "$\\frac{1}{L}=\\frac{1}{L_1}+\\frac{1}{L_2}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Equivalent Self Inductance",
    "card_type": "table",
    "body": "The source lists series and parallel combinations, including mutual-coupling signs for two coils.",
    "formulas": [
      {
        "latex": "L=\\frac{V_A-V_B}{dI/dt}"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 58,
    "sort_order": 9
  },
  {
    "id": "jee-physics-electromagnetic-induction-transformer-relations",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "transformer"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Transformer Relations",
    "card_type": "mixed",
    "body": "The transformer relation connects emf, turns, and current ratios; the source also marks the step-up condition.",
    "formulas": [
      {
        "latex": "\\frac{E_s}{E_p}=\\frac{N_s}{N_p}=\\frac{I_p}{I_s}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [
      "$N_s>N_p\\Rightarrow E_s>E_p$ for a step-up transformer."
    ],
    "importance": 5,
    "source_page": 59,
    "sort_order": 10
  },
  {
    "id": "jee-physics-electromagnetic-induction-lc-oscillations",
    "chapter_id": "jee-physics-electromagnetic-induction",
    "table_data": null,
    "diagram_data": {
      "type": "lc-oscillation"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "LC Oscillations",
    "card_type": "mixed",
    "body": "The source gives the angular-frequency relation for LC oscillations.",
    "formulas": [
      {
        "latex": "\\omega^2=\\frac{1}{LC}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 59,
    "sort_order": 11
  },
  {
    "id": "jee-physics-geometrical-optics-reflection-plane-mirror",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "plane-mirror"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Reflection and Plane Mirror Image",
    "card_type": "mixed",
    "body": "For a plane mirror, the source lists equal incidence and reflection angles and basic image properties.",
    "formulas": [
      {
        "latex": "\\angle i=\\angle r"
      }
    ],
    "variables": [],
    "conditions": [
      "Object distance from mirror equals image distance.",
      "The line joining object and image is normal to the mirror.",
      "Image size is the same as object size.",
      "Real object gives virtual image; virtual object gives real image."
    ],
    "importance": 5,
    "source_page": 59,
    "sort_order": 1
  },
  {
    "id": "jee-physics-geometrical-optics-plane-mirror-velocity",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Object-Image Velocity in Plane Mirror",
    "card_type": "formula",
    "body": "Differentiating the plane-mirror coordinates gives the image velocity components with respect to the mirror.",
    "formulas": [
      {
        "latex": "x_{im}=-x_{om},\\ y_{im}=y_{om},\\ z_{im}=z_{om}"
      },
      {
        "latex": "v_{(im)x}=-v_{(om)x}"
      },
      {
        "latex": "v_{(im)y}=v_{(om)y},\\ v_{(im)z}=v_{(om)z}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 60,
    "sort_order": 2
  },
  {
    "id": "jee-physics-geometrical-optics-spherical-mirror-formula",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "spherical-mirror"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Spherical Mirror Formula and Sign Notes",
    "card_type": "mixed",
    "body": "The source gives mirror formula and sign notes for concave/convex mirrors and real/virtual images.",
    "formulas": [
      {
        "latex": "\\frac{1}{v}+\\frac{1}{u}=\\frac{2}{R}=\\frac{1}{f}"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "focal length"
      }
    ],
    "conditions": [
      "For mirrors, negative $v$ indicates real image and positive $v$ indicates virtual image.",
      "Concave mirror centre and focus coordinates are negative; convex mirror coordinates are positive."
    ],
    "importance": 5,
    "source_page": 60,
    "sort_order": 3
  },
  {
    "id": "jee-physics-geometrical-optics-mirror-magnification-velocity",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Mirror Magnification and Image Velocity",
    "card_type": "formula",
    "body": "The source lists transverse, differential, and longitudinal magnification relations for mirrors.",
    "formulas": [
      {
        "latex": "m=\\frac{h_2}{h_1}=-\\frac{v}{u}"
      },
      {
        "latex": "\\frac{dv}{du}=-\\frac{v^2}{u^2}"
      },
      {
        "latex": "\\frac{dv}{dt}=-\\frac{v^2}{u^2}\\frac{du}{dt}"
      },
      {
        "latex": "\\text{Longitudinal magnification}=\\frac{v_2-v_1}{u_2-u_1}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source notes image motion is opposite to object motion along the principal axis, with respect to the mirror."
    ],
    "importance": 5,
    "source_page": 60,
    "sort_order": 4
  },
  {
    "id": "jee-physics-geometrical-optics-newton-mirror-power",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Newton Formula and Mirror Power",
    "card_type": "formula",
    "body": "For distances measured from focus, Newton's formula is used; mirror power is reciprocal focal length.",
    "formulas": [
      {
        "latex": "XY=f^2"
      },
      {
        "latex": "P=\\frac{1}{f}"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "focal length"
      }
    ],
    "conditions": [
      "$f$ is focal length with sign and in meters for power in diopters."
    ],
    "importance": 4,
    "source_page": 60,
    "sort_order": 5
  },
  {
    "id": "jee-physics-geometrical-optics-refractive-index-snell",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "refraction-snell"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Refractive Index and Snell Law",
    "card_type": "mixed",
    "body": "The handbook defines refractive index and gives Snell's law in index, speed, and wavelength forms.",
    "formulas": [
      {
        "latex": "\\mu=\\frac{c}{v}"
      },
      {
        "latex": "\\frac{\\sin i}{\\sin r}=\\frac{n_2}{n_1}=\\frac{v_1}{v_2}=\\frac{\\lambda_1}{\\lambda_2}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "The ratio is for a given wavelength and pair of media."
    ],
    "importance": 5,
    "source_page": 61,
    "sort_order": 6
  },
  {
    "id": "jee-physics-geometrical-optics-deviation-reversibility",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Deviation and Reversibility",
    "card_type": "formula",
    "body": "The source gives deviation due to refraction and states reversibility of reflected and refracted rays.",
    "formulas": [
      {
        "latex": "\\delta=|i-r|"
      }
    ],
    "variables": [],
    "conditions": [
      "A ray reversed along a refracted path refracts back along the incident path."
    ],
    "importance": 4,
    "source_page": 61,
    "sort_order": 7
  },
  {
    "id": "jee-physics-geometrical-optics-apparent-depth",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "apparent-depth"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Apparent Depth and Shift",
    "card_type": "mixed",
    "body": "At near-normal incidence, apparent depth and shift are written using relative refractive index.",
    "formulas": [
      {
        "latex": "d'=\\frac{d}{n_{relative}}"
      },
      {
        "latex": "n_{relative}=\\frac{n_i}{n_r}"
      },
      {
        "latex": "\\text{Apparent shift}=d\\left(1-\\frac{1}{n_{rel}}\\right)"
      }
    ],
    "variables": [],
    "conditions": [
      "The source states the apparent-depth formula for small angle of incidence."
    ],
    "importance": 5,
    "source_page": 61,
    "sort_order": 8
  },
  {
    "id": "jee-physics-geometrical-optics-composite-slab",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Composite Slab",
    "card_type": "formula",
    "body": "For multiple parallel media, the final apparent depth is a sum over layer thicknesses divided by relative refractive indices.",
    "formulas": [
      {
        "latex": "d'_{final}=\\frac{t_1}{n_{1rel}}+\\frac{t_2}{n_{2rel}}+\\cdots+\\frac{t_n}{n_{nrel}}"
      },
      {
        "latex": "\\text{Shift}=\\sum t_i\\left(1-\\frac{1}{n_{irel}}\\right)"
      }
    ],
    "variables": [],
    "conditions": [
      "As seen from a medium of refractive index $n_0$."
    ],
    "importance": 4,
    "source_page": 61,
    "sort_order": 9
  },
  {
    "id": "jee-physics-geometrical-optics-critical-angle-tir",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Critical Angle and Total Internal Reflection",
    "card_type": "formula",
    "body": "The source gives critical angle and two conditions for total internal reflection.",
    "formulas": [
      {
        "latex": "C=\\sin^{-1}\\left(\\frac{n_r}{n_d}\\right)"
      }
    ],
    "variables": [],
    "conditions": [
      "Light must be incident from denser medium.",
      "Angle of incidence should be greater than critical angle: $i>C$."
    ],
    "importance": 5,
    "source_page": 62,
    "sort_order": 10
  },
  {
    "id": "jee-physics-geometrical-optics-prism-basic-relations",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "prism-deviation"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Prism Basic Relations",
    "card_type": "mixed",
    "body": "The prism section gives deviation and angle-sum relations.",
    "formulas": [
      {
        "latex": "\\delta=(i+e)-(r_1+r_2)"
      },
      {
        "latex": "r_1+r_2=A"
      },
      {
        "latex": "\\delta=i+e-A"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 62,
    "sort_order": 11
  },
  {
    "id": "jee-physics-geometrical-optics-minimum-deviation",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Minimum Deviation",
    "card_type": "formula",
    "body": "At minimum deviation, the source states the ray passes symmetrically through the prism.",
    "formulas": [
      {
        "latex": "i=e,\\ r_1=r_2"
      },
      {
        "latex": "\\delta_{min}=2i_{min}-A"
      },
      {
        "latex": "r=\\frac{A}{2}"
      },
      {
        "latex": "n_{rel}=\\frac{\\sin\\left(\\frac{A+\\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}"
      }
    ],
    "variables": [],
    "conditions": [
      "There is one and only one angle of incidence for minimum deviation."
    ],
    "importance": 5,
    "source_page": 63,
    "sort_order": 12
  },
  {
    "id": "jee-physics-geometrical-optics-thin-prism",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Thin Prism",
    "card_type": "formula",
    "body": "For small prism angle and small incidence, deviation is written with relative refractive index.",
    "formulas": [
      {
        "latex": "\\delta_{min}=(n-1)A"
      },
      {
        "latex": "\\delta=(n_{rel}-1)A"
      },
      {
        "latex": "n_{rel}=\\frac{n_{prism}}{n_{surrounding}}"
      }
    ],
    "variables": [],
    "conditions": [
      "The source marks thin prism as $A\\le10^\\circ$ with small angle of incidence."
    ],
    "importance": 4,
    "source_page": 63,
    "sort_order": 13
  },
  {
    "id": "jee-physics-geometrical-optics-dispersion-cauchy",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Dispersion and Cauchy's Formula",
    "card_type": "formula",
    "body": "Dispersion arises because refractive index varies slightly with wavelength; the source gives Cauchy's relation.",
    "formulas": [
      {
        "latex": "n(\\lambda)=a+\\frac{b}{\\lambda^2}"
      },
      {
        "latex": "\\theta=(n_v-n_r)A"
      },
      {
        "latex": "\\delta_y=(n_y-1)A"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "$a$ and $b$ are positive constants of the medium."
    ],
    "importance": 5,
    "source_page": 63,
    "sort_order": 14
  },
  {
    "id": "jee-physics-geometrical-optics-dispersive-power",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Dispersive Power",
    "card_type": "formula",
    "body": "The source defines dispersive power as angular dispersion over mean-ray deviation.",
    "formulas": [
      {
        "latex": "\\omega=\\frac{n_v-n_r}{n_y-1}"
      },
      {
        "latex": "\\frac{n_v-n_r}{n_y-1}=\\frac{\\delta_v-\\delta_r}{\\delta_y}=\\frac{\\theta}{\\delta_y}"
      },
      {
        "latex": "n_y=\\frac{n_v+n_r}{2}\\quad\\text{if }n_y\\text{ is not given}"
      }
    ],
    "variables": [],
    "conditions": [
      "$n_v$, $n_r$, and $n_y$ are refractive indices for violet, red, and yellow colours."
    ],
    "importance": 5,
    "source_page": 64,
    "sort_order": 15
  },
  {
    "id": "jee-physics-geometrical-optics-prism-combinations",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": {
      "columns": [
        "Combination",
        "Condition"
      ],
      "rows": [
        [
          "Direct vision",
          "$(n_y-1)A=(n'_y-1)A'$"
        ],
        [
          "Achromatic",
          "$(n_v-n_r)A=(n'_v-n'_r)A'$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Combination of Two Prisms",
    "card_type": "table",
    "body": "The source lists conditions for direct-vision and achromatic prism combinations.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 64,
    "sort_order": 16
  },
  {
    "id": "jee-physics-geometrical-optics-spherical-refracting-surface",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Spherical Refracting Surface",
    "card_type": "formula",
    "body": "For paraxial rays at a spherical surface separating two media, the source gives the refraction formula and magnification.",
    "formulas": [
      {
        "latex": "\\frac{n_2}{v}-\\frac{n_1}{u}=\\frac{n_2-n_1}{R}"
      },
      {
        "latex": "m=\\frac{v-R}{u-R}=\\frac{v/n_2}{u/n_1}"
      }
    ],
    "variables": [],
    "conditions": [
      "Light moves from refractive index $n_1$ to $n_2$."
    ],
    "importance": 5,
    "source_page": 64,
    "sort_order": 17
  },
  {
    "id": "jee-physics-geometrical-optics-thin-lens",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "thin-lens"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Thin Lens and Lens Maker",
    "card_type": "mixed",
    "body": "The source lists the thin-lens equation, lens maker relation, and magnification.",
    "formulas": [
      {
        "latex": "\\frac{1}{v}-\\frac{1}{u}=(n_{rel}-1)\\left(\\frac{1}{R_1}-\\frac{1}{R_2}\\right)"
      },
      {
        "latex": "\\frac{1}{f}=(n_{rel}-1)\\left(\\frac{1}{R_1}-\\frac{1}{R_2}\\right)"
      },
      {
        "latex": "\\frac{1}{v}-\\frac{1}{u}=\\frac{1}{f}"
      },
      {
        "latex": "m=\\frac{v}{u}"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "focal length"
      }
    ],
    "conditions": [
      "$n_{rel}=n_{lens}/n_{medium}$."
    ],
    "importance": 5,
    "source_page": 65,
    "sort_order": 18
  },
  {
    "id": "jee-physics-geometrical-optics-lens-combination",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Combination of Lenses",
    "card_type": "formula",
    "body": "For lenses in combination, the source adds the reciprocals of focal lengths.",
    "formulas": [
      {
        "latex": "\\frac{1}{F}=\\frac{1}{f_1}+\\frac{1}{f_2}+\\frac{1}{f_3}+\\cdots"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "focal length"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 65,
    "sort_order": 19
  },
  {
    "id": "jee-physics-geometrical-optics-simple-microscope",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": {
      "type": "simple-microscope"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Simple Microscope",
    "card_type": "formula",
    "body": "The simple microscope section lists magnifying power for image at infinity and at near point.",
    "formulas": [
      {
        "latex": "M_\\infty=\\frac{D}{f}"
      },
      {
        "latex": "M_D=1+\\frac{D}{f}"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "focal length"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 65,
    "sort_order": 20
  },
  {
    "id": "jee-physics-geometrical-optics-compound-microscope",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": {
      "columns": [
        "Case",
        "Magnifying power",
        "Length"
      ],
      "rows": [
        [
          "General",
          "$M=\\frac{V_oD}{U_oU_e}$",
          "$L=V_o+U_e$"
        ],
        [
          "Image at infinity",
          "$M_\\infty=\\frac{V_oD}{U_of_e}$",
          "$L=V_o+f_e$"
        ],
        [
          "Image at near point",
          "$M_D=\\frac{V_o}{U_o}\\left(1+\\frac{D}{f_e}\\right)$",
          "$L_D=V_o+\\frac{Df_e}{D+f_e}$"
        ]
      ]
    },
    "diagram_data": {
      "type": "compound-microscope"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Compound Microscope",
    "card_type": "table",
    "body": "The source provides magnifying power and length formulae for compound microscope settings.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 65,
    "sort_order": 21
  },
  {
    "id": "jee-physics-geometrical-optics-telescopes",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": {
      "columns": [
        "Instrument",
        "At infinity",
        "Length at infinity"
      ],
      "rows": [
        [
          "Astronomical",
          "$M_\\infty=\\frac{f_o}{f_e}$",
          "$L=f_o+f_e$"
        ],
        [
          "Terrestrial",
          "$M_\\infty=\\frac{f_o}{f_e}$",
          "$L=f_o+4f+f_e$"
        ],
        [
          "Galilean",
          "$M_\\infty=\\frac{f_o}{f_e}$",
          "$L=f_o-f_e$"
        ]
      ]
    },
    "diagram_data": {
      "type": "telescope"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Astronomical, Terrestrial and Galilean Telescopes",
    "card_type": "table",
    "body": "The source lists telescope magnifying powers and lengths for image at infinity and near point.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 66,
    "sort_order": 22
  },
  {
    "id": "jee-physics-geometrical-optics-resolving-power",
    "chapter_id": "jee-physics-geometrical-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Resolving Power",
    "card_type": "formula",
    "body": "Resolving power is listed separately for microscope and telescope.",
    "formulas": [
      {
        "label": "Microscope",
        "latex": "R=\\frac{1}{\\Delta d}=\\frac{2\\mu\\sin\\theta}{\\lambda}"
      },
      {
        "label": "Telescope",
        "latex": "R=\\frac{1}{\\Delta\\theta}=\\frac{a}{1.22\\lambda}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 66,
    "sort_order": 23
  },
  {
    "id": "jee-physics-modern-physics-work-function-photo-current",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Work Function and Photoelectric Current",
    "card_type": "formula",
    "body": "The source defines work function and notes how photoelectric current depends on incident intensity.",
    "formulas": [
      {
        "latex": "W=h\\nu_0=\\frac{hc}{\\lambda_0}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "Work function is minimum for cesium: $1.9\\ \\text{eV}$.",
      "Photoelectric current is directly proportional to intensity when frequency is constant."
    ],
    "importance": 5,
    "source_page": 67,
    "sort_order": 1
  },
  {
    "id": "jee-physics-modern-physics-stopping-potential-einstein",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Stopping Potential and Einstein Equation",
    "card_type": "formula",
    "body": "Photoelectrons have kinetic energies from zero to maximum; the stopping potential gives the maximum kinetic energy.",
    "formulas": [
      {
        "latex": "KE_{max}=eV_s"
      },
      {
        "latex": "h\\nu=W_0+K_{max}"
      },
      {
        "latex": "\\frac{hc}{\\lambda}=\\frac{hc}{\\lambda_0}+eV_s"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "Stopping potential is independent of intensity when frequency is constant."
    ],
    "importance": 5,
    "source_page": 67,
    "sort_order": 2
  },
  {
    "id": "jee-physics-modern-physics-intensity-photon-momentum-energy",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Intensity, Photon Momentum and Energy",
    "card_type": "formula",
    "body": "The source lists intensity in terms of electric field, photon momentum, and photon energy in eV for wavelength in angstrom.",
    "formulas": [
      {
        "latex": "I=\\frac{1}{2}\\epsilon_0E^2c"
      },
      {
        "latex": "p=\\frac{h}{\\lambda}"
      },
      {
        "latex": "\\Delta E=\\frac{12400}{\\lambda(\\mathring A)}\\ \\text{eV}"
      }
    ],
    "variables": [
      {
        "latex": "E",
        "symbol": "$E$",
        "meaning": "electric field, emf, or energy depending on context"
      },
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 67,
    "sort_order": 3
  },
  {
    "id": "jee-physics-modern-physics-radiation-pressure-normal",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": {
      "columns": [
        "Case",
        "Force",
        "Pressure"
      ],
      "rows": [
        [
          "Absorbing, $a=1,r=0$",
          "$F=\\frac{IA}{c}$",
          "$P=\\frac{I}{c}$"
        ],
        [
          "Reflecting, $r=1,a=0$",
          "$F=\\frac{2IA}{c}$",
          "$P=\\frac{2I}{c}$"
        ],
        [
          "Partial reflection",
          "$F=\\frac{IA}{c}(1+r)$",
          "$P=\\frac{I}{c}(1+r)$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Radiation Force at Normal Incidence",
    "card_type": "table",
    "body": "For perpendicular incidence with no transmission, the source gives force and pressure for absorption and reflection cases.",
    "formulas": [],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [
      "The cases use $a+r=1$ when partial reflection is present."
    ],
    "importance": 4,
    "source_page": 67,
    "sort_order": 4
  },
  {
    "id": "jee-physics-modern-physics-radiation-pressure-oblique",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": {
      "columns": [
        "Case",
        "Source-backed relation"
      ],
      "rows": [
        [
          "Absorbing",
          "$F=\\frac{IA\\cos\\theta}{c}$, $P=\\frac{I}{c}\\cos^2\\theta$"
        ],
        [
          "Reflecting",
          "$F=\\frac{2IA\\cos^2\\theta}{c}$, $P=\\frac{2I\\cos^2\\theta}{c}$"
        ],
        [
          "Partial reflection",
          "$P=\\frac{I\\cos^2\\theta}{c}(1+r)$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Radiation Pressure at Oblique Incidence",
    "card_type": "table",
    "body": "When light is incident at angle $\\theta$ with the vertical, the source adds cosine factors.",
    "formulas": [],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [
      "No transmission cases from the source."
    ],
    "importance": 4,
    "source_page": 68,
    "sort_order": 5
  },
  {
    "id": "jee-physics-modern-physics-de-broglie",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "De Broglie Wavelength",
    "card_type": "formula",
    "body": "The source writes de Broglie wavelength in terms of velocity, momentum, and kinetic energy.",
    "formulas": [
      {
        "latex": "\\lambda=\\frac{h}{mv}=\\frac{h}{P}=\\frac{h}{\\sqrt{2mKE}}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 68,
    "sort_order": 6
  },
  {
    "id": "jee-physics-modern-physics-bohr-radius-speed-energy",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Hydrogen-Like Atom Radius, Speed and Energy",
    "card_type": "formula",
    "body": "For hydrogen-like atoms, the source gives orbital radius, speed, and nth-orbit energy.",
    "formulas": [
      {
        "latex": "r_n=\\frac{n^2}{Z}a_0"
      },
      {
        "latex": "a_0=0.529\\ \\mathring A"
      },
      {
        "latex": "v_n=\\frac{Z}{n}v_0"
      },
      {
        "latex": "v_0=2.19\\times10^6\\ \\text{m/s}"
      },
      {
        "latex": "E_n=E_1\\frac{Z^2}{n^2}"
      },
      {
        "latex": "E_1=-13.6\\ \\text{eV}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 68,
    "sort_order": 7
  },
  {
    "id": "jee-physics-modern-physics-spectral-lines",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Spectral Lines",
    "card_type": "mixed",
    "body": "The source gives the spectral-line wavelength relation, named series starts, and transition count.",
    "formulas": [
      {
        "latex": "\\frac{1}{\\lambda}=R\\left(\\frac{1}{n_1^2}-\\frac{1}{n_2^2}\\right)"
      },
      {
        "latex": "N_{transitions}=\\frac{n(n-1)}{2}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "Lyman: $n_1=1$.",
      "Balmer: $n_1=2$.",
      "Paschen: $n_1=3$.",
      "Lyman is ultraviolet; Paschen, Brackett, and Pfund are infrared."
    ],
    "importance": 5,
    "source_page": 68,
    "sort_order": 8
  },
  {
    "id": "jee-physics-modern-physics-reduced-mass-correction",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Reduced Mass Correction",
    "card_type": "formula",
    "body": "When nucleus motion is considered, the source corrects radius and energy using reduced mass.",
    "formulas": [
      {
        "latex": "r_n=(0.529\\ \\mathring A)\\frac{n^2}{Z}\\frac{m}{\\mu}"
      },
      {
        "latex": "E_n=(-13.6\\ \\text{eV})\\frac{Z^2}{n^2}\\frac{\\mu}{m}"
      },
      {
        "latex": "\\mu=\\frac{Mm}{M+m}"
      }
    ],
    "variables": [],
    "conditions": [
      "$\\mu$ is reduced mass and $M$ is mass of nucleus."
    ],
    "importance": 4,
    "source_page": 68,
    "sort_order": 9
  },
  {
    "id": "jee-physics-modern-physics-xray-nucleus-binding",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "X-rays, Nuclear Radius and Binding Energy",
    "card_type": "formula",
    "body": "The source lists minimum X-ray wavelength, Moseley's law, nuclear radius, and binding energy.",
    "formulas": [
      {
        "latex": "\\lambda_{min}=\\frac{hc}{eV_0}=\\frac{12400}{V_0(\\text{volt})}\\ \\mathring A"
      },
      {
        "latex": "\\sqrt{\\nu}=a(Z-b)"
      },
      {
        "latex": "R=R_0A^{1/3}"
      },
      {
        "latex": "R_0=1.1\\times10^{-15}\\ \\text{m}"
      },
      {
        "latex": "B=(ZM_p+NM_N-M)c^2"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "In Moseley's law, $a$ and $b$ are positive constants for one type of X-rays and independent of $Z$."
    ],
    "importance": 5,
    "source_page": 69,
    "sort_order": 10
  },
  {
    "id": "jee-physics-modern-physics-nuclear-decays",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": {
      "columns": [
        "Process",
        "Decay",
        "Q-value"
      ],
      "rows": [
        [
          "Alpha",
          "$^A_ZX\\to ^{A-4}_{Z-2}Y+^4_2He$",
          "$Q=[m(^A_ZX)-m(^{A-4}_{Z-2}Y)-m(^4_2He)]c^2$"
        ],
        [
          "Beta minus",
          "$^A_ZX\\to ^A_{Z+1}Y+\\beta^-+\\bar\\nu$",
          "$Q=[m(^A_ZX)-m(^A_{Z+1}Y)]c^2$"
        ],
        [
          "Beta plus",
          "$^A_ZX\\to ^A_{Z-1}Y+\\beta^++\\nu$",
          "$Q=[m(^A_ZX)-m(^A_{Z-1}Y)-2m_e]c^2$"
        ],
        [
          "Electron capture",
          "$^A_ZX+e\\to ^A_{Z-1}Y+\\nu$",
          "$Q=[m(^A_ZX)-m(^A_{Z-1}Y)]c^2$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Alpha, Beta and Electron Capture",
    "card_type": "table",
    "body": "The source lists decay equations and Q-values for alpha, beta minus, beta plus, and electron capture.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 69,
    "sort_order": 11
  },
  {
    "id": "jee-physics-modern-physics-radioactive-decay",
    "chapter_id": "jee-physics-modern-physics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Radioactive Decay, Activity and Life",
    "card_type": "formula",
    "body": "The source gives exponential decay, activity, half-life, average life, and effective half-life for two decay processes.",
    "formulas": [
      {
        "latex": "N=N_0e^{-\\lambda t}"
      },
      {
        "latex": "A=A_0e^{-\\lambda t}"
      },
      {
        "latex": "T_{1/2}=\\frac{0.693}{\\lambda}"
      },
      {
        "latex": "T_{av}=\\frac{T_{1/2}}{0.693}"
      },
      {
        "latex": "\\frac{1}{t}=\\frac{1}{t_1}+\\frac{1}{t_2}"
      }
    ],
    "variables": [],
    "conditions": [
      "Activity per unit mass is called specific activity."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 12
  },
  {
    "id": "jee-physics-wave-optics-interference-intensity",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Interference Intensity",
    "card_type": "formula",
    "body": "The source gives resultant intensity for two waves and the incoherent-source result.",
    "formulas": [
      {
        "latex": "I=I_1+I_2+2\\sqrt{I_1I_2}\\cos(\\Delta\\phi)"
      },
      {
        "label": "Incoherent sources",
        "latex": "I=I_1+I_2"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      }
    ],
    "conditions": [
      "$\\Delta\\phi$ is phase difference."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 1
  },
  {
    "id": "jee-physics-wave-optics-constructive-destructive",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Constructive and Destructive Interference",
    "card_type": "formula",
    "body": "The handbook lists maximum and minimum intensity in terms of the two source intensities.",
    "formulas": [
      {
        "latex": "I_{max}=(\\sqrt{I_1}+\\sqrt{I_2})^2"
      },
      {
        "latex": "I_{min}=(\\sqrt{I_1}-\\sqrt{I_2})^2"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 70,
    "sort_order": 2
  },
  {
    "id": "jee-physics-wave-optics-ydse-path-fringe",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": {
      "type": "ydse"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "YDSE Path Difference and Fringe Width",
    "card_type": "mixed",
    "body": "The YDSE section gives path difference and fringe width for $d\\ll D$ and $y\\ll D$.",
    "formulas": [
      {
        "latex": "\\Delta p=S_2P-S_1P=d\\sin\\theta"
      },
      {
        "latex": "\\Delta p=\\frac{dy}{D}"
      },
      {
        "latex": "\\beta=\\frac{\\lambda D}{d}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "$\\lambda$ is wavelength in medium."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 3
  },
  {
    "id": "jee-physics-wave-optics-ydse-maxima-minima",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "YDSE Maxima and Minima",
    "card_type": "formula",
    "body": "Source-backed positions for bright and dark fringes are split from the path-difference card.",
    "formulas": [
      {
        "label": "Maxima",
        "latex": "\\Delta p=n\\lambda\\Rightarrow y=n\\beta"
      },
      {
        "label": "Minima",
        "latex": "\\Delta p=(2n-1)\\frac{\\lambda}{2}\\Rightarrow y=(2n-1)\\frac{\\beta}{2}"
      },
      {
        "latex": "\\Delta p=(2n+1)\\frac{\\lambda}{2}\\Rightarrow y=(2n+1)\\frac{\\beta}{2}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "For maxima, $n=0,\\pm1,\\pm2,\\ldots$.",
      "The two minima forms follow the positive and negative $n$ cases shown in the source."
    ],
    "importance": 5,
    "source_page": 70,
    "sort_order": 4
  },
  {
    "id": "jee-physics-wave-optics-highest-order-fringes",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Highest Order Fringes",
    "card_type": "formula",
    "body": "The source lists highest order maxima/minima and total fringe counts.",
    "formulas": [
      {
        "latex": "n_{max}=\\left[\\frac{d}{\\lambda}\\right]"
      },
      {
        "latex": "N_{maxima}=2n_{max}+1"
      },
      {
        "latex": "n_{max}=\\left[\\frac{d}{\\lambda}+\\frac{1}{2}\\right]"
      },
      {
        "latex": "N_{minima}=2n_{max}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 70,
    "sort_order": 5
  },
  {
    "id": "jee-physics-wave-optics-screen-intensity-two-wavelengths",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Screen Intensity and Two Wavelengths",
    "card_type": "formula",
    "body": "The source gives screen intensity in phase/path form and the nearest coincidence point for two wavelengths.",
    "formulas": [
      {
        "latex": "\\Delta\\phi=\\frac{2\\pi}{\\lambda}\\Delta p"
      },
      {
        "latex": "I=I_1+I_2+2\\sqrt{I_1I_2}\\cos(\\Delta\\phi)"
      },
      {
        "latex": "I_1=I_2\\Rightarrow I=4I_1\\cos^2\\left(\\frac{\\Delta\\phi}{2}\\right)"
      },
      {
        "latex": "y=n_1\\beta_1=n_2\\beta_2=\\operatorname{LCM}(\\beta_1,\\beta_2)"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      },
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      }
    ],
    "conditions": [
      "The LCM relation is for nearest bright-fringe coincidence to central maxima."
    ],
    "importance": 5,
    "source_page": 71,
    "sort_order": 6
  },
  {
    "id": "jee-physics-wave-optics-optical-path-slab",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Optical Path Difference and Slab Shift",
    "card_type": "formula",
    "body": "Optical path difference and phase are connected through refractive index; the source also gives the YDSE slab shift.",
    "formulas": [
      {
        "latex": "\\Delta p_{opt}=\\mu\\Delta p"
      },
      {
        "latex": "\\Delta\\phi=\\frac{2\\pi}{\\lambda}\\Delta p=\\frac{2\\pi}{\\lambda_{vacuum}}\\Delta p_{opt}"
      },
      {
        "latex": "\\Delta=(\\mu-1)t\\frac{D}{d}"
      },
      {
        "latex": "\\Delta=(\\mu-1)t\\frac{\\beta}{\\lambda}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      },
      {
        "latex": "\\phi",
        "symbol": "$\\phi$",
        "meaning": "magnetic flux or phase angle depending on context"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 71,
    "sort_order": 7
  },
  {
    "id": "jee-physics-wave-optics-oblique-incidence",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": {
      "type": "ydse-oblique"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "YDSE with Oblique Incidence",
    "card_type": "mixed",
    "body": "For incidence inclined by $\\theta_0$, the central maximum shifts to the point where path difference is zero.",
    "formulas": [
      {
        "latex": "\\theta_2=\\theta_0"
      },
      {
        "latex": "\\Delta p=d(\\sin\\theta_0+\\sin\\theta)"
      },
      {
        "latex": "\\Delta p=d(\\sin\\theta_0-\\sin\\theta)"
      },
      {
        "latex": "\\Delta p=d(\\sin\\theta-\\sin\\theta_0)"
      }
    ],
    "variables": [],
    "conditions": [
      "The three path-difference forms are for points above $O$, between $O$ and $O'$, and below $O'$ respectively."
    ],
    "importance": 4,
    "source_page": 71,
    "sort_order": 8
  },
  {
    "id": "jee-physics-wave-optics-thin-film-interference",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": {
      "columns": [
        "Case",
        "Destructive",
        "Constructive"
      ],
      "rows": [
        [
          "Reflected light",
          "$2\\mu d=n\\lambda$",
          "$2\\mu d=\\left(n+\\frac{1}{2}\\right)\\lambda$"
        ],
        [
          "Transmitted light",
          "$2\\mu d=\\left(n+\\frac{1}{2}\\right)\\lambda$",
          "$2\\mu d=n\\lambda$"
        ]
      ]
    },
    "diagram_data": {
      "type": "thin-film"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Thin-Film Interference",
    "card_type": "table",
    "body": "The source separates reflected-light and transmitted-light conditions for thin-film interference.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 72,
    "sort_order": 9
  },
  {
    "id": "jee-physics-wave-optics-polarisation",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Polarisation",
    "card_type": "formula",
    "body": "The source lists Brewster relation, perpendicular reflected/refracted rays, Malus law, and optical activity.",
    "formulas": [
      {
        "latex": "\\mu=\\tan\\theta_B"
      },
      {
        "latex": "\\theta_p+\\theta_r=90^\\circ"
      },
      {
        "latex": "I=I_0\\cos^2\\theta"
      },
      {
        "latex": "I=KA^2\\cos^2\\theta"
      },
      {
        "latex": "[\\alpha]_{\\lambda}^{t^\\circ C}=\\frac{\\theta}{L\\times C}"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "In optical activity, $\\theta$ is rotation in length $L$ at concentration $C$."
    ],
    "importance": 5,
    "source_page": 72,
    "sort_order": 10
  },
  {
    "id": "jee-physics-wave-optics-diffraction-widths",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": {
      "type": "single-slit-diffraction"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Single-Slit Diffraction Widths",
    "card_type": "mixed",
    "body": "The diffraction section gives maxima/minima conditions and central maximum widths.",
    "formulas": [
      {
        "label": "Maxima",
        "latex": "a\\sin\\theta=\\frac{(2m+1)\\lambda}{2}"
      },
      {
        "label": "Minima",
        "latex": "\\sin\\theta=\\frac{m\\lambda}{a}"
      },
      {
        "latex": "\\text{Linear width of central maxima}=\\frac{2D\\lambda}{a}"
      },
      {
        "latex": "\\text{Angular width of central maxima}=\\frac{2\\lambda}{a}"
      }
    ],
    "variables": [
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [
      "For maxima, $m=1,2,3,\\ldots$.",
      "For minima, $m=\\pm1,\\pm2,\\pm3,\\ldots$."
    ],
    "importance": 5,
    "source_page": 72,
    "sort_order": 11
  },
  {
    "id": "jee-physics-wave-optics-diffraction-intensity-resolving",
    "chapter_id": "jee-physics-wave-optics",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Diffraction Intensity and Resolving Power",
    "card_type": "formula",
    "body": "The final source page gives single-slit intensity and resolving power in wavelength difference form.",
    "formulas": [
      {
        "latex": "I=I_0\\left[\\frac{\\sin(\\beta/2)}{\\beta/2}\\right]^2"
      },
      {
        "latex": "\\beta=\\frac{\\pi a\\sin\\theta}{\\lambda}"
      },
      {
        "latex": "R=\\frac{\\lambda}{\\lambda_2-\\lambda_1}=\\frac{\\lambda}{\\Delta\\lambda}"
      },
      {
        "latex": "\\lambda=\\frac{\\lambda_1+\\lambda_2}{2},\\quad \\Delta\\lambda=\\lambda_2-\\lambda_1"
      }
    ],
    "variables": [
      {
        "latex": "I",
        "symbol": "$I$",
        "meaning": "current or intensity depending on context"
      },
      {
        "latex": "\\lambda",
        "symbol": "$\\lambda$",
        "meaning": "wavelength"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 73,
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

insert into public.formula_chapters (id, subject_id, title, slug, sort_order)
select
  replace(id, 'jee-', 'neet-'),
  replace(subject_id, 'jee-', 'neet-'),
  title,
  slug,
  sort_order
from public.formula_chapters
where id in ('jee-physics-magnetic-effect-current-force', 'jee-physics-electromagnetic-induction', 'jee-physics-geometrical-optics', 'jee-physics-modern-physics', 'jee-physics-wave-optics')
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
  replace(id, 'jee-', 'neet-'),
  replace(chapter_id, 'jee-', 'neet-'),
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
where chapter_id in ('jee-physics-magnetic-effect-current-force', 'jee-physics-electromagnetic-induction', 'jee-physics-geometrical-optics', 'jee-physics-modern-physics', 'jee-physics-wave-optics')
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
