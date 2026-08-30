insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-physics-projectile-motion-vector', 'jee-physics', 'Projectile Motion & Vector', 'projectile-motion-vector', 3),
  ('jee-physics-relative-motion', 'jee-physics', 'Relative Motion', 'relative-motion', 4),
  ('jee-physics-newtons-laws-of-motion', 'jee-physics', 'Newton''s Laws of Motion', 'newtons-laws-of-motion', 5),
  ('jee-physics-friction', 'jee-physics', 'Friction', 'friction', 6),
  ('jee-physics-work-power-energy', 'jee-physics', 'Work, Power & Energy', 'work-power-energy', 7)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-physics-projectile-motion-vector-standard-results",
    "chapter_id": "jee-physics-projectile-motion-vector",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Standard Projectile Results",
    "card_type": "formula",
    "body": "The handbook lists time of flight, horizontal range, and maximum height for projectile motion.",
    "formulas": [
      {
        "label": "Time of flight",
        "latex": "T=\\frac{2u\\sin\\theta}{g}"
      },
      {
        "label": "Horizontal range",
        "latex": "R=\\frac{u^2\\sin 2\\theta}{g}"
      },
      {
        "label": "Maximum height",
        "latex": "H=\\frac{u^2\\sin^2\\theta}{2g}"
      }
    ],
    "variables": [
      {
        "latex": "u",
        "symbol": "$u$",
        "meaning": "speed of projection"
      },
      {
        "latex": "\\theta",
        "symbol": "$\\theta$",
        "meaning": "angle of projection"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "acceleration due to gravity"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 5,
    "sort_order": 1
  },
  {
    "id": "jee-physics-projectile-motion-vector-trajectory-equation",
    "chapter_id": "jee-physics-projectile-motion-vector",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Trajectory Equation",
    "card_type": "formula",
    "body": "The equation of path relates vertical position to horizontal position for projectile motion.",
    "formulas": [
      {
        "latex": "y=x\\tan\\theta-\\frac{gx^2}{2u^2\\cos^2\\theta}"
      },
      {
        "latex": "y=x\\tan\\theta\\left(1-\\frac{x}{R}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "u",
        "symbol": "$u$",
        "meaning": "speed of projection"
      },
      {
        "latex": "\\theta",
        "symbol": "$\\theta$",
        "meaning": "angle of projection"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "acceleration due to gravity"
      },
      {
        "latex": "R",
        "symbol": "$R$",
        "meaning": "horizontal range"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 5,
    "sort_order": 2
  },
  {
    "id": "jee-physics-projectile-motion-vector-inclined-plane-diagram",
    "chapter_id": "jee-physics-projectile-motion-vector",
    "table_data": null,
    "diagram_data": {
      "type": "projectile-incline"
    },
    "diagram_svg": null,
    "title": "Projection on an Inclined Plane",
    "card_type": "diagram",
    "body": "The handbook resolves projectile motion on axes attached to the inclined plane.",
    "formulas": [],
    "variables": [
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "angle of projection with the inclined plane"
      },
      {
        "latex": "\\beta",
        "symbol": "$\\beta$",
        "meaning": "angle of incline"
      }
    ],
    "conditions": [
      "The native diagram follows the source orientation with x along the incline and y normal to it."
    ],
    "importance": 4,
    "source_page": 5,
    "sort_order": 3
  },
  {
    "id": "jee-physics-projectile-motion-vector-inclined-plane-table",
    "chapter_id": "jee-physics-projectile-motion-vector",
    "table_data": {
      "columns": [
        "Result",
        "Up the incline",
        "Down the incline"
      ],
      "rows": [
        [
          "Range",
          "$\\frac{2u^2\\sin\\alpha\\cos(\\alpha+\\beta)}{g\\cos^2\\beta}$",
          "$\\frac{2u^2\\sin\\alpha\\cos(\\alpha-\\beta)}{g\\cos^2\\beta}$"
        ],
        [
          "Time of flight",
          "$\\frac{2u\\sin\\alpha}{g\\cos\\beta}$",
          "$\\frac{2u\\sin\\alpha}{g\\cos\\beta}$"
        ],
        [
          "Angle for maximum range",
          "$\\frac{\\pi}{4}-\\frac{\\beta}{2}$",
          "$\\frac{\\pi}{4}+\\frac{\\beta}{2}$"
        ],
        [
          "Maximum range",
          "$\\frac{u^2}{g(1+\\sin\\beta)}$",
          "$\\frac{u^2}{g(1-\\sin\\beta)}$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Inclined Plane Formula Table",
    "card_type": "table",
    "body": "The handbook compares projection up the incline and down the incline.",
    "formulas": [],
    "variables": [
      {
        "latex": "u",
        "symbol": "$u$",
        "meaning": "speed of projection"
      },
      {
        "latex": "\\alpha",
        "symbol": "$\\alpha$",
        "meaning": "angle of projection with the inclined plane"
      },
      {
        "latex": "\\beta",
        "symbol": "$\\beta$",
        "meaning": "angle of incline"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "acceleration due to gravity"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 5,
    "sort_order": 4
  },
  {
    "id": "jee-physics-relative-motion-relative-velocity-acceleration",
    "chapter_id": "jee-physics-relative-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Relative Velocity & Acceleration",
    "card_type": "formula",
    "body": "The handbook defines velocity and acceleration of A with respect to B by vector subtraction.",
    "formulas": [
      {
        "label": "Velocity of A with respect to B",
        "latex": "\\vec v_{AB}=\\vec v_A-\\vec v_B"
      },
      {
        "label": "Acceleration of A with respect to B",
        "latex": "\\vec a_{AB}=\\vec a_A-\\vec a_B"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 5,
    "sort_order": 1
  },
  {
    "id": "jee-physics-relative-motion-relative-position-straight-line",
    "chapter_id": "jee-physics-relative-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Relative Position Along a Straight Line",
    "card_type": "formula",
    "body": "For relative motion along a straight line, the handbook writes the position of B with respect to A as a difference of positions.",
    "formulas": [
      {
        "latex": "\\vec x_{BA}=\\vec x_B-\\vec x_A"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 5,
    "sort_order": 2
  },
  {
    "id": "jee-physics-relative-motion-river-shortest-time",
    "chapter_id": "jee-physics-relative-motion",
    "table_data": null,
    "diagram_data": {
      "type": "river-shortest-time"
    },
    "diagram_svg": null,
    "title": "River Crossing: Shortest Time",
    "card_type": "mixed",
    "body": "For shortest time, the velocity perpendicular to the river is the boat/man velocity relative to river.",
    "formulas": [
      {
        "latex": "v_x=v_R"
      },
      {
        "latex": "v_f=v_{mR}"
      },
      {
        "latex": "v_m=\\sqrt{v_{mR}^2+v_R^2}"
      }
    ],
    "variables": [
      {
        "latex": "v_R",
        "symbol": "$v_R$",
        "meaning": "river velocity"
      },
      {
        "latex": "v_{mR}",
        "symbol": "$v_{mR}$",
        "meaning": "man/boat velocity relative to river"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 6,
    "sort_order": 3
  },
  {
    "id": "jee-physics-relative-motion-river-shortest-path",
    "chapter_id": "jee-physics-relative-motion",
    "table_data": null,
    "diagram_data": {
      "type": "river-shortest-path"
    },
    "diagram_svg": null,
    "title": "River Crossing: Shortest Path",
    "card_type": "mixed",
    "body": "For shortest path, velocity along the river is zero, so the drift is zero.",
    "formulas": [
      {
        "latex": "v_x=0"
      },
      {
        "latex": "v_y=\\sqrt{v_{mR}^2-v_R^2}"
      },
      {
        "latex": "v_m=\\sqrt{v_{mR}^2-v_R^2}"
      },
      {
        "latex": "t=\\frac{d}{v_y}=\\frac{d}{\\sqrt{v_{mR}^2-v_R^2}}"
      },
      {
        "latex": "v_R-v_{mR}\\sin\\theta=0"
      },
      {
        "latex": "\\theta=\\sin^{-1}\\left(\\frac{v_R}{v_{mR}}\\right)"
      }
    ],
    "variables": [
      {
        "latex": "d",
        "symbol": "$d$",
        "meaning": "river width"
      },
      {
        "latex": "\\theta",
        "symbol": "$\\theta$",
        "meaning": "angle used in the source diagram"
      }
    ],
    "conditions": [
      "The source states that in this case the drift should be zero."
    ],
    "importance": 5,
    "source_page": 6,
    "sort_order": 4
  },
  {
    "id": "jee-physics-relative-motion-rain-problems",
    "chapter_id": "jee-physics-relative-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Rain Problems",
    "card_type": "formula",
    "body": "The rain velocity relative to the man is written as the vector difference of rain and man velocities.",
    "formulas": [
      {
        "latex": "\\vec v_{Rm}=\\vec v_R-\\vec v_m"
      },
      {
        "latex": "v_{Rm}=\\sqrt{v_R^2+v_m^2}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 7,
    "sort_order": 5
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-third-law",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Third Law Pair",
    "card_type": "formula",
    "body": "The handbook writes the force on A due to B as equal and opposite to the force on B due to A.",
    "formulas": [
      {
        "latex": "\\vec F_{AB}=-\\vec F_{BA}"
      }
    ],
    "variables": [
      {
        "latex": "\\vec F_{AB}",
        "symbol": "$\\vec F_{AB}$",
        "meaning": "force on A due to B"
      },
      {
        "latex": "\\vec F_{BA}",
        "symbol": "$\\vec F_{BA}$",
        "meaning": "force on B due to A"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 7,
    "sort_order": 1
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-second-law-components",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Second Law in Components",
    "card_type": "formula",
    "body": "The second law is written component-wise as rate of change of momentum.",
    "formulas": [
      {
        "latex": "F_x=\\frac{dP_x}{dt}=ma_x"
      },
      {
        "latex": "F_y=\\frac{dP_y}{dt}=ma_y"
      },
      {
        "latex": "F_z=\\frac{dP_z}{dt}=ma_z"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 7,
    "sort_order": 2
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-weighing-machine-spring-balance",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Weighing Machine & Spring Balance",
    "card_type": "concept",
    "body": "The source states that a weighing machine and spring balance measure force exerted on their contact or hook, not weight directly.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "A weighing machine measures the force exerted by the object on its upper surface.",
      "A spring balance measures the force exerted by the object at the hook."
    ],
    "importance": 3,
    "source_page": 7,
    "sort_order": 3
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-spring-force-properties",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Spring Force & Spring Constant",
    "card_type": "formula",
    "body": "The spring force and spring constant relations are listed together in the source.",
    "formulas": [
      {
        "label": "Spring force",
        "latex": "\\vec F=-k\\vec x"
      },
      {
        "label": "Spring property",
        "latex": "K\\ell=\\text{constant}"
      },
      {
        "latex": "\\ell_1=\\frac{m\\ell}{m+n}"
      },
      {
        "latex": "\\ell_2=\\frac{n\\ell}{m+n}"
      },
      {
        "latex": "k\\ell=k_1\\ell_1=k_2\\ell_2"
      }
    ],
    "variables": [
      {
        "latex": "\\vec x",
        "symbol": "$\\vec x$",
        "meaning": "displacement of the free end from natural length or deformation"
      },
      {
        "latex": "k",
        "symbol": "$k$",
        "meaning": "spring constant"
      }
    ],
    "conditions": [
      "The cut-spring relation is for a spring cut in the ratio m : n."
    ],
    "importance": 4,
    "source_page": 7,
    "sort_order": 4
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-spring-combinations",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Spring Combinations",
    "card_type": "formula",
    "body": "The source gives equivalent spring constant formulas for series and parallel combinations.",
    "formulas": [
      {
        "label": "Series",
        "latex": "\\frac{1}{k_{eq}}=\\frac{1}{k_1}+\\frac{1}{k_2}+\\cdots"
      },
      {
        "label": "Parallel",
        "latex": "k_{eq}=k_1+k_2+k_3+\\cdots"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 8,
    "sort_order": 5
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-pulley-relation",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": {
      "type": "pulley-system"
    },
    "diagram_svg": null,
    "title": "Pulley Relation",
    "card_type": "diagram",
    "body": "The pulley relation shown in the source averages the two string-end velocities and accelerations.",
    "formulas": [
      {
        "latex": "V_p=\\frac{V_1+V_2}{2}"
      },
      {
        "latex": "a_p=\\frac{a_1+a_2}{2}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 8,
    "sort_order": 6
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-atwood-machine",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": {
      "type": "atwood-machine"
    },
    "diagram_svg": null,
    "title": "Atwood Machine",
    "card_type": "diagram",
    "body": "The handbook gives acceleration and tension for the two-mass pulley system.",
    "formulas": [
      {
        "latex": "a=\\frac{(m_2-m_1)g}{m_1+m_2}"
      },
      {
        "latex": "T=\\frac{2m_1m_2g}{m_1+m_2}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 8,
    "sort_order": 7
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-wedge-constraint",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": {
      "type": "wedge-constraint"
    },
    "diagram_svg": null,
    "title": "Wedge Constraint",
    "card_type": "diagram",
    "body": "For bodies in contact without deformation, the source states that the velocity components perpendicular to the contact plane are equal.",
    "formulas": [
      {
        "latex": "V_3=V_1\\sin\\theta"
      }
    ],
    "variables": [],
    "conditions": [
      "Applies when there is no deformation and the bodies remain in contact."
    ],
    "importance": 5,
    "source_page": 8,
    "sort_order": 8
  },
  {
    "id": "jee-physics-newtons-laws-of-motion-system-and-non-inertial-frame",
    "chapter_id": "jee-physics-newtons-laws-of-motion",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "System & Non-Inertial Frame",
    "card_type": "mixed",
    "body": "The source lists Newton's law for a system and the pseudo-force form for a non-inertial frame.",
    "formulas": [
      {
        "label": "System",
        "latex": "\\vec F_{ext}=m_1\\vec a_1+m_2\\vec a_2+m_3\\vec a_3+\\cdots"
      },
      {
        "label": "Non-inertial frame",
        "latex": "\\vec F_{Real}+\\vec F_{Pseudo}=m\\vec a"
      },
      {
        "label": "Pseudo force",
        "latex": "\\vec F_{Pseudo}=-m\\vec a_{Frame}"
      }
    ],
    "variables": [],
    "conditions": [
      "An inertial reference frame moves with constant velocity.",
      "A non-inertial reference frame moves with non-zero acceleration."
    ],
    "importance": 5,
    "source_page": 9,
    "sort_order": 9
  },
  {
    "id": "jee-physics-friction-friction-types",
    "chapter_id": "jee-physics-friction",
    "table_data": {
      "columns": [
        "Type",
        "Source statement"
      ],
      "rows": [
        [
          "Kinetic",
          "$f_k=\\mu_kN$"
        ],
        [
          "Static",
          "Exists when there is tendency of relative motion but no relative motion."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Types of Friction",
    "card_type": "table",
    "body": "The handbook divides friction force into kinetic and static friction.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 9,
    "sort_order": 1
  },
  {
    "id": "jee-physics-friction-kinetic-static-formulas",
    "chapter_id": "jee-physics-friction",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Kinetic & Static Friction Formulas",
    "card_type": "formula",
    "body": "Kinetic friction has a fixed proportional form; static friction is variable and self-adjusting up to limiting friction.",
    "formulas": [
      {
        "label": "Kinetic friction",
        "latex": "f_k=\\mu_kN"
      },
      {
        "label": "Limiting friction",
        "latex": "f_{max}=\\mu_sN"
      },
      {
        "label": "Static friction range",
        "latex": "0\\le f_s\\le f_{smax}"
      }
    ],
    "variables": [
      {
        "latex": "\\mu_k",
        "symbol": "$\\mu_k$",
        "meaning": "coefficient of kinetic friction"
      },
      {
        "latex": "\\mu_s",
        "symbol": "$\\mu_s$",
        "meaning": "coefficient of static friction"
      },
      {
        "latex": "N",
        "symbol": "$N$",
        "meaning": "normal reaction"
      }
    ],
    "conditions": [
      "The source states static friction is variable and self-adjusting."
    ],
    "importance": 5,
    "source_page": 9,
    "sort_order": 2
  },
  {
    "id": "jee-physics-friction-friction-applied-force-graph",
    "chapter_id": "jee-physics-friction",
    "table_data": null,
    "diagram_data": {
      "type": "friction-graph"
    },
    "diagram_svg": null,
    "title": "Friction vs Applied Force",
    "card_type": "diagram",
    "body": "The source graph shows static friction increasing up to maximum static friction, then kinetic friction at a lower constant level.",
    "formulas": [
      {
        "latex": "f_{static\\ maximum}=\\mu_sN"
      },
      {
        "latex": "f_k=\\mu_kN"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 9,
    "sort_order": 3
  },
  {
    "id": "jee-physics-work-power-energy-constant-and-multiple-forces",
    "chapter_id": "jee-physics-work-power-energy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Work by Constant & Multiple Forces",
    "card_type": "formula",
    "body": "The source defines work by a constant force and extends it to multiple forces through the resultant force.",
    "formulas": [
      {
        "label": "Constant force",
        "latex": "W=\\vec F\\cdot\\vec S"
      },
      {
        "label": "Resultant force",
        "latex": "\\sum \\vec F=\\vec F_1+\\vec F_2+\\vec F_3+\\cdots"
      },
      {
        "latex": "W=(\\sum \\vec F)\\cdot\\vec S"
      },
      {
        "latex": "W=W_1+W_2+W_3+\\cdots"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 10,
    "sort_order": 1
  },
  {
    "id": "jee-physics-work-power-energy-variable-force",
    "chapter_id": "jee-physics-work-power-energy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Work by a Variable Force",
    "card_type": "formula",
    "body": "For a variable force, the handbook gives the differential work expression.",
    "formulas": [
      {
        "latex": "dW=\\vec F\\cdot d\\vec s"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 10,
    "sort_order": 2
  },
  {
    "id": "jee-physics-work-power-energy-momentum-kinetic-energy",
    "chapter_id": "jee-physics-work-power-energy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Momentum & Kinetic Energy",
    "card_type": "formula",
    "body": "The source relates kinetic energy and linear momentum.",
    "formulas": [
      {
        "latex": "K=\\frac{p^2}{2m}"
      },
      {
        "latex": "P=\\sqrt{2mK}"
      }
    ],
    "variables": [
      {
        "latex": "P",
        "symbol": "$P$",
        "meaning": "linear momentum"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 10,
    "sort_order": 3
  },
  {
    "id": "jee-physics-work-power-energy-potential-energy-conservative-force",
    "chapter_id": "jee-physics-work-power-energy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Potential Energy & Conservative Force",
    "card_type": "formula",
    "body": "The potential energy relation is written as the negative of work done by the force.",
    "formulas": [
      {
        "latex": "U_2-U_1=-\\int_{r_1}^{r_2}\\vec F\\cdot d\\vec r=-W"
      },
      {
        "latex": "U=-\\int_{\\infty}^{r}\\vec F\\cdot d\\vec r=-W"
      },
      {
        "label": "Conservative force",
        "latex": "F=-\\frac{\\partial U}{\\partial r}"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 10,
    "sort_order": 4
  },
  {
    "id": "jee-physics-work-power-energy-work-energy-theorem-power",
    "chapter_id": "jee-physics-work-power-energy",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "title": "Work-Energy Theorem & Power",
    "card_type": "mixed",
    "body": "The source gives the work-energy theorem, its modified form, and average/instantaneous power.",
    "formulas": [
      {
        "label": "Work-energy theorem",
        "latex": "W_C+W_{NC}+W_{PS}=\\Delta K"
      },
      {
        "latex": "W_C=-\\Delta U"
      },
      {
        "latex": "W_{NC}+W_{PS}=\\Delta K+\\Delta U"
      },
      {
        "latex": "W_{NC}+W_{PS}=\\Delta E"
      },
      {
        "label": "Average power",
        "latex": "P_{av}=\\frac{W}{t}"
      },
      {
        "label": "Instantaneous power",
        "latex": "P=\\frac{\\vec F\\cdot d\\vec S}{dt}=\\vec F\\cdot\\frac{d\\vec S}{dt}=\\vec F\\cdot\\vec v"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 10,
    "sort_order": 5
  }
]$$::jsonb) as card_row(
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
    sort_order integer
  )
)
insert into public.formula_cards
  (id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, diagram_svg, importance, source_page, sort_order, is_active)
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
  true
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
where subject_id = 'jee-physics'
  and slug in ('projectile-motion-vector', 'relative-motion', 'newtons-laws-of-motion', 'friction', 'work-power-energy')
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.formula_cards
  (id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, diagram_svg, importance, source_page, sort_order, is_active)
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
where chapter_id in ('jee-physics-projectile-motion-vector', 'jee-physics-relative-motion', 'jee-physics-newtons-laws-of-motion', 'jee-physics-friction', 'jee-physics-work-power-energy')
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
