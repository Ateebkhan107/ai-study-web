insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-mathematics-indefinite-integration', 'jee-mathematics', 'Indefinite Integration', 'indefinite-integration', 9),
  ('jee-mathematics-definite-integration', 'jee-mathematics', 'Definite Integration', 'definite-integration', 10)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-mathematics-indefinite-integration-definition-constant",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Indefinite Integration and Constant",
    "card_type": "formula",
    "body": "The source defines indefinite integration as the reverse process of differentiation and names $c$ as the constant of integration.",
    "formulas": [
      {
        "latex": "g'(x)=f(x)"
      },
      {
        "latex": "\\int f(x)\\,dx=g(x)+c\\Longleftrightarrow \\frac{d}{dx}\\{g(x)+c\\}=f(x)"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "function or lower limit"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [
      "$c$ is called the constant of integration."
    ],
    "importance": 5,
    "source_page": 14,
    "sort_order": 1
  },
  {
    "id": "jee-mathematics-indefinite-integration-algebraic-exponential-standard-integrals",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral",
        "Result"
      ],
      "rows": [
        [
          "$\\int (ax+b)^n\\,dx$",
          "$\\frac{(ax+b)^{n+1}}{a(n+1)}+c$"
        ],
        [
          "$\\int \\frac{dx}{ax+b}$",
          "$\\frac{1}{a}\\ln(ax+b)+c$"
        ],
        [
          "$\\int e^{ax+b}\\,dx$",
          "$\\frac{1}{a}e^{ax+b}+c$"
        ],
        [
          "$\\int a^{px+q}\\,dx$",
          "$\\frac{1}{p\\ln a}a^{px+q}+c$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Algebraic and Exponential Standard Integrals",
    "card_type": "table",
    "body": "The first standard formulas cover powers, logarithms, and exponential forms.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "integer or real parameter"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [
      "The power formula is for $n\\ne-1$.",
      "$a^u$ formula is listed with base $a>0$."
    ],
    "importance": 5,
    "source_page": 14,
    "sort_order": 2
  },
  {
    "id": "jee-mathematics-indefinite-integration-trigonometric-standard-integrals",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral",
        "Result"
      ],
      "rows": [
        [
          "$\\int \\sin(ax+b)\\,dx$",
          "$-\\frac{1}{a}\\cos(ax+b)+c$"
        ],
        [
          "$\\int \\cos(ax+b)\\,dx$",
          "$\\frac{1}{a}\\sin(ax+b)+c$"
        ],
        [
          "$\\int \\tan(ax+b)\\,dx$",
          "$\\frac{1}{a}\\ln\\sec(ax+b)+c$"
        ],
        [
          "$\\int \\cot(ax+b)\\,dx$",
          "$\\frac{1}{a}\\ln\\sin(ax+b)+c$"
        ],
        [
          "$\\int \\sec^2(ax+b)\\,dx$",
          "$\\frac{1}{a}\\tan(ax+b)+c$"
        ],
        [
          "$\\int \\cosec^2(ax+b)\\,dx$",
          "$-\\frac{1}{a}\\cot(ax+b)+c$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Trigonometric Standard Integrals",
    "card_type": "table",
    "body": "The source lists standard integrals for sine, cosine, tangent, cotangent, secant-square, and cosecant-square forms.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 14,
    "sort_order": 3
  },
  {
    "id": "jee-mathematics-indefinite-integration-sec-cosec-standard-integrals",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral",
        "Result"
      ],
      "rows": [
        [
          "$\\int \\sec x\\,dx$",
          "$\\ln(\\sec x+\\tan x)+c$"
        ],
        [
          "$\\int \\sec x\\,dx$",
          "$\\ln\\tan\\left(\\frac{\\pi}{4}+\\frac{x}{2}\\right)+c$"
        ],
        [
          "$\\int \\cosec x\\,dx$",
          "$\\ln(\\cosec x-\\cot x)+c$"
        ],
        [
          "$\\int \\cosec x\\,dx$",
          "$\\ln\\tan\\frac{x}{2}+c$"
        ],
        [
          "$\\int \\cosec x\\,dx$",
          "$-\\ln(\\cosec x+\\cot x)+c$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Secant and Cosecant Integrals",
    "card_type": "table",
    "body": "The handbook gives equivalent logarithmic forms for $\\int\\sec x\\,dx$ and $\\int\\cosec x\\,dx$.",
    "formulas": [],
    "variables": [
      {
        "latex": "x",
        "symbol": "$x$",
        "meaning": "variable"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [
      "Alternative forms are retained exactly as visible in the source."
    ],
    "importance": 5,
    "source_page": 15,
    "sort_order": 4
  },
  {
    "id": "jee-mathematics-indefinite-integration-inverse-trig-standard-integrals",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral",
        "Result"
      ],
      "rows": [
        [
          "$\\int \\frac{dx}{\\sqrt{a^2-x^2}}$",
          "$\\sin^{-1}\\frac{x}{a}+c$"
        ],
        [
          "$\\int \\frac{dx}{a^2+x^2}$",
          "$\\frac{1}{a}\\tan^{-1}\\frac{x}{a}+c$"
        ],
        [
          "$\\int \\frac{dx}{|x|\\sqrt{x^2-a^2}}$",
          "$\\frac{1}{a}\\sec^{-1}\\frac{x}{a}+c$"
        ],
        [
          "$\\int \\frac{dx}{a^2-x^2}$",
          "$\\frac{1}{2a}\\ln\\left|\\frac{a+x}{a-x}\\right|+c$"
        ],
        [
          "$\\int \\frac{dx}{x^2-a^2}$",
          "$\\frac{1}{2a}\\ln\\left|\\frac{x-a}{x+a}\\right|+c$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Inverse-Trigonometric Type Integrals",
    "card_type": "table",
    "body": "These standard forms lead to inverse sine, tangent, and secant results.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "x",
        "symbol": "$x$",
        "meaning": "variable"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 15,
    "sort_order": 5
  },
  {
    "id": "jee-mathematics-indefinite-integration-radical-standard-integrals",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral",
        "Result"
      ],
      "rows": [
        [
          "$\\int \\frac{dx}{\\sqrt{x^2+a^2}}$",
          "$\\ln\\left[x+\\sqrt{x^2+a^2}\\right]+c$"
        ],
        [
          "$\\int \\frac{dx}{\\sqrt{x^2-a^2}}$",
          "$\\ln\\left[x+\\sqrt{x^2-a^2}\\right]+c$"
        ],
        [
          "$\\int \\sqrt{a^2-x^2}\\,dx$",
          "$\\frac{x}{2}\\sqrt{a^2-x^2}+\\frac{a^2}{2}\\sin^{-1}\\frac{x}{a}+c$"
        ],
        [
          "$\\int \\sqrt{x^2+a^2}\\,dx$",
          "$\\frac{x}{2}\\sqrt{x^2+a^2}+\\frac{a^2}{2}\\ln\\left(\\frac{x+\\sqrt{x^2+a^2}}{a}\\right)+c$"
        ],
        [
          "$\\int \\sqrt{x^2-a^2}\\,dx$",
          "$\\frac{x}{2}\\sqrt{x^2-a^2}-\\frac{a^2}{2}\\ln\\left(\\frac{x+\\sqrt{x^2-a^2}}{a}\\right)+c$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Radical Standard Integrals",
    "card_type": "table",
    "body": "The radical table covers reciprocal square-root and square-root integrals.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "x",
        "symbol": "$x$",
        "meaning": "variable"
      },
      {
        "latex": "c",
        "symbol": "$c$",
        "meaning": "constant of integration"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 15,
    "sort_order": 6
  },
  {
    "id": "jee-mathematics-indefinite-integration-substitution-and-parts",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Substitution and Integration by Parts",
    "card_type": "mixed",
    "body": "The method section gives the basic substitution differential and an integration-by-parts formula.",
    "formulas": [
      {
        "latex": "f(x)=t\\Rightarrow f'(x)\\,dx=dt"
      },
      {
        "latex": "\\int f(x)g(x)\\,dx=f(x)\\int g(x)\\,dx-\\int\\left(\\frac{d}{dx}f(x)\\int g(x)\\,dx\\right)dx"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "function or lower limit"
      },
      {
        "latex": "t",
        "symbol": "$t$",
        "meaning": "substitution variable"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 16,
    "sort_order": 7
  },
  {
    "id": "jee-mathematics-indefinite-integration-quadratic-expression-methods",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral type",
        "Source-backed substitution or note"
      ],
      "rows": [
        [
          "$\\int \\frac{dx}{ax^2+bx+c}$",
          "$x+\\frac{b}{2a}=t$"
        ],
        [
          "$\\int \\frac{dx}{\\sqrt{ax^2+bx+c}}$",
          "$x+\\frac{b}{2a}=t$"
        ],
        [
          "$\\int \\sqrt{ax^2+bx+c}\\,dx$",
          "$x+\\frac{b}{2a}=t$"
        ],
        [
          "$\\int \\frac{px+q}{ax^2+bx+c}\\,dx$",
          "Use $x+\\frac{b}{2a}=t$, then split into a linear-term integral and a constant-term integral."
        ],
        [
          "$\\int \\frac{px+q}{\\sqrt{ax^2+bx+c}}\\,dx$",
          "Use $x+\\frac{b}{2a}=t$, then split into a linear-term integral and a constant-term integral."
        ],
        [
          "$\\int (px+q)\\sqrt{ax^2+bx+c}\\,dx$",
          "Use $x+\\frac{b}{2a}=t$, then split into a linear-term integral and a constant-term integral."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Quadratic Expression Substitutions",
    "card_type": "table",
    "body": "For quadratic denominator or radical forms, the source centers the quadratic before simplifying.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "t",
        "symbol": "$t$",
        "meaning": "substitution variable"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 16,
    "sort_order": 8
  },
  {
    "id": "jee-mathematics-indefinite-integration-trigonometric-integration-methods",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral type",
        "Substitution or method"
      ],
      "rows": [
        [
          "$\\int \\frac{dx}{a+b\\sin^2x}$ or $\\int \\frac{dx}{a+b\\cos^2x}$",
          "Put $\\tan x=t$."
        ],
        [
          "$\\int \\frac{dx}{a\\sin^2x+b\\sin x\\cos x+c\\cos^2x}$",
          "Put $\\tan x=t$."
        ],
        [
          "$\\int \\frac{dx}{a+b\\sin x}$ or $\\int \\frac{dx}{a+b\\cos x}$",
          "Put $\\tan\\frac{x}{2}=t$."
        ],
        [
          "$\\int \\frac{dx}{a+b\\sin x+c\\cos x}$",
          "Put $\\tan\\frac{x}{2}=t$."
        ],
        [
          "$\\int \\frac{a\\cos x+b\\sin x+c}{\\ell\\cos x+m\\sin x+n}\\,dx$",
          "Express numerator as $A(Dr)+B\\frac{d}{dx}(Dr)+c$ and proceed."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Trigonometric Integration Methods",
    "card_type": "table",
    "body": "The handbook lists substitution choices for common trigonometric rational forms.",
    "formulas": [],
    "variables": [
      {
        "latex": "t",
        "symbol": "$t$",
        "meaning": "substitution variable"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 16,
    "sort_order": 9
  },
  {
    "id": "jee-mathematics-indefinite-integration-special-rational-radical-methods",
    "chapter_id": "jee-mathematics-indefinite-integration",
    "table_data": {
      "columns": [
        "Integral type",
        "Source-backed substitution"
      ],
      "rows": [
        [
          "$\\int \\frac{x^2+1}{x^4+Kx^2+1}\\,dx$",
          "Divide numerator and denominator by $x^2$ and put $x\\mp\\frac{1}{x}=t$."
        ],
        [
          "$\\int \\frac{dx}{(ax+b)\\sqrt{px+q}}$",
          "Put $px+q=t^2$."
        ],
        [
          "$\\int \\frac{dx}{(ax^2+bx+c)\\sqrt{px+q}}$",
          "Put $px+q=t^2$."
        ],
        [
          "$\\int \\frac{dx}{(ax+b)\\sqrt{px^2+qx+r}}$",
          "Put $ax+b=\\frac{1}{t}$."
        ],
        [
          "$\\int \\frac{dx}{(ax^2+b)\\sqrt{px^2+q}}$",
          "Put $x=\\frac{1}{t}$."
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Special Rational and Radical Forms",
    "card_type": "table",
    "body": "The final method list gives substitutions for special rational and radical expressions.",
    "formulas": [],
    "variables": [
      {
        "latex": "t",
        "symbol": "$t$",
        "meaning": "substitution variable"
      }
    ],
    "conditions": [
      "The source gives substitution prompts only; no unsupported evaluated results were added."
    ],
    "importance": 4,
    "source_page": 17,
    "sort_order": 10
  },
  {
    "id": "jee-mathematics-definite-integration-basic-properties",
    "chapter_id": "jee-mathematics-definite-integration",
    "table_data": {
      "columns": [
        "Property",
        "Formula"
      ],
      "rows": [
        [
          "Dummy variable",
          "$\\int_a^b f(x)\\,dx=\\int_a^b f(t)\\,dt$"
        ],
        [
          "Reversing limits",
          "$\\int_a^b f(x)\\,dx=-\\int_b^a f(x)\\,dx$"
        ],
        [
          "Interval splitting",
          "$\\int_a^b f(x)\\,dx=\\int_a^c f(x)\\,dx+\\int_c^b f(x)\\,dx$"
        ],
        [
          "Transformation",
          "$\\int_a^b f(x)\\,dx=\\int_a^b f(a+b-x)\\,dx$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Basic Definite Integral Properties",
    "card_type": "table",
    "body": "The opening properties cover dummy variables, reversal of limits, interval splitting, and the $a+b-x$ transformation.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 17,
    "sort_order": 1
  },
  {
    "id": "jee-mathematics-definite-integration-symmetric-interval-properties",
    "chapter_id": "jee-mathematics-definite-integration",
    "table_data": {
      "columns": [
        "Interval",
        "Property"
      ],
      "rows": [
        [
          "$[-a,a]$",
          "$\\int_{-a}^{a}f(x)\\,dx=\\int_0^a(f(x)+f(-x))\\,dx$"
        ],
        [
          "Even on $[-a,a]$",
          "$\\int_{-a}^{a}f(x)\\,dx=2\\int_0^a f(x)\\,dx$, if $f(-x)=f(x)$"
        ],
        [
          "Odd on $[-a,a]$",
          "$\\int_{-a}^{a}f(x)\\,dx=0$, if $f(-x)=-f(x)$"
        ],
        [
          "$[0,a]$",
          "$\\int_0^a f(x)\\,dx=\\int_0^a f(a-x)\\,dx$"
        ],
        [
          "$[0,2a]$",
          "$\\int_0^{2a}f(x)\\,dx=\\int_0^a(f(x)+f(2a-x))\\,dx$"
        ],
        [
          "$[0,2a]$ symmetric",
          "$\\int_0^{2a}f(x)\\,dx=2\\int_0^a f(x)\\,dx$, if $f(2a-x)=f(x)$"
        ],
        [
          "$[0,2a]$ antisymmetric",
          "$\\int_0^{2a}f(x)\\,dx=0$, if $f(2a-x)=-f(x)$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Symmetric Interval Properties",
    "card_type": "table",
    "body": "The source gives separate symmetry results for $[-a,a]$, $[0,a]$, and $[0,2a]$.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 17,
    "sort_order": 2
  },
  {
    "id": "jee-mathematics-definite-integration-periodic-function-properties",
    "chapter_id": "jee-mathematics-definite-integration",
    "table_data": {
      "columns": [
        "Property",
        "Formula"
      ],
      "rows": [
        [
          "From $0$ to $nT$",
          "$\\int_0^{nT}f(x)\\,dx=n\\int_0^T f(x)\\,dx$"
        ],
        [
          "Shifted $nT$ interval",
          "$\\int_a^{a+nT}f(x)\\,dx=n\\int_0^T f(x)\\,dx$"
        ],
        [
          "From $mT$ to $nT$",
          "$\\int_{mT}^{nT}f(x)\\,dx=(n-m)\\int_0^T f(x)\\,dx$"
        ],
        [
          "Upper/lower shifted by period",
          "$\\int_{nT}^{a+nT}f(x)\\,dx=\\int_0^a f(x)\\,dx$"
        ],
        [
          "Both limits shifted",
          "$\\int_{a+nT}^{b+nT}f(x)\\,dx=\\int_a^b f(x)\\,dx$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Periodic Function Properties",
    "card_type": "table",
    "body": "The periodic-function block is kept as a dedicated card because it contains several closely related identities.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      },
      {
        "latex": "n",
        "symbol": "$n$",
        "meaning": "integer or real parameter"
      }
    ],
    "conditions": [
      "$f(x)$ has period $T$.",
      "The source states the listed integer conditions using $m,n\\in\\mathbb{Z}$."
    ],
    "importance": 5,
    "source_page": 18,
    "sort_order": 3
  },
  {
    "id": "jee-mathematics-definite-integration-inequalities-positivity",
    "chapter_id": "jee-mathematics-definite-integration",
    "table_data": {
      "columns": [
        "Condition",
        "Conclusion"
      ],
      "rows": [
        [
          "$\\psi(x)\\le f(x)\\le \\phi(x)$ for $a\\le x\\le b$",
          "$\\int_a^b\\psi(x)\\,dx\\le\\int_a^b f(x)\\,dx\\le\\int_a^b\\phi(x)\\,dx$"
        ],
        [
          "$m\\le f(x)\\le M$ for $a\\le x\\le b$",
          "$m(b-a)\\le\\int_a^b f(x)\\,dx\\le M(b-a)$"
        ],
        [
          "$f(x)\\ge0$ on $[a,b]$",
          "$\\int_a^b f(x)\\,dx\\ge0$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Integral Inequalities and Positivity",
    "card_type": "table",
    "body": "The last properties before Leibnitz theorem compare functions and bound an integral using constants.",
    "formulas": [],
    "variables": [
      {
        "latex": "a",
        "symbol": "$a$",
        "meaning": "constant or limit"
      },
      {
        "latex": "b",
        "symbol": "$b$",
        "meaning": "constant or limit"
      },
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      }
    ],
    "conditions": [],
    "importance": 4,
    "source_page": 18,
    "sort_order": 4
  },
  {
    "id": "jee-mathematics-definite-integration-leibnitz-theorem",
    "chapter_id": "jee-mathematics-definite-integration",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Leibnitz Theorem",
    "card_type": "formula",
    "body": "The definite integration section closes with differentiation of an integral having variable limits.",
    "formulas": [
      {
        "latex": "F(x)=\\int_{g(x)}^{h(x)}f(t)\\,dt"
      },
      {
        "latex": "\\frac{dF(x)}{dx}=h'(x)f(h(x))-g'(x)f(g(x))"
      }
    ],
    "variables": [
      {
        "latex": "f",
        "symbol": "$f$",
        "meaning": "function"
      },
      {
        "latex": "g",
        "symbol": "$g$",
        "meaning": "function or lower limit"
      },
      {
        "latex": "h",
        "symbol": "$h$",
        "meaning": "upper limit"
      }
    ],
    "conditions": [],
    "importance": 5,
    "source_page": 18,
    "sort_order": 5
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
