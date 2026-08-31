insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-alkane', 'jee-chemistry', 'Alkane', 'alkane', 22),
  ('jee-chemistry-alkene-alkyne', 'jee-chemistry', 'Alkene & Alkyne', 'alkene-alkyne', 23),
  ('jee-chemistry-alkyl-halide', 'jee-chemistry', 'Alkyl Halide', 'alkyl-halide', 24),
  ('neet-chemistry-alkane', 'neet-chemistry', 'Alkane', 'alkane', 22),
  ('neet-chemistry-alkene-alkyne', 'neet-chemistry', 'Alkene & Alkyne', 'alkene-alkyne', 23),
  ('neet-chemistry-alkyl-halide', 'neet-chemistry', 'Alkyl Halide', 'alkyl-halide', 24)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-alkane-wurtz-reaction",
    "chapter_id": "jee-chemistry-alkane",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-wurtz"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Wurtz Reaction",
    "card_type": "reaction",
    "body": "The Alkane section visibly gives Wurtz reaction with sodium in ether and notes that primary and secondary alkyl halides give this reaction.",
    "formulas": [
      {
        "label": "Same alkyl halide",
        "latex": "R-X+2Na\\xrightarrow{\\text{ether}}R-R"
      },
      {
        "label": "Mixed alkyl halides",
        "latex": "R-X+R'-X+2Na\\xrightarrow{\\text{ether}}R-R'+R-R+R'-R'"
      }
    ],
    "variables": [],
    "conditions": [
      "Reagent: Na, ether.",
      "The source explicitly mentions $1^\\circ$ and $2^\\circ$ alkyl halides."
    ],
    "importance": 5,
    "source_page": 127,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-alkane-wurtz-cycloalkane-example",
    "chapter_id": "jee-chemistry-alkane",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Wurtz Cycloalkane Example",
    "card_type": "reaction",
    "body": "The handbook shows a dibromocyclobutane example closing to the corresponding cyclobutane framework.",
    "formulas": [
      {
        "latex": "\\text{dibromocyclobutane structure}+2Na\\xrightarrow{\\text{ether}}\\text{ring-closure product shown in source}"
      }
    ],
    "variables": [],
    "conditions": [
      "The detailed ring drawing remains available in the original handbook because it is shown as a structure rather than a typed formula."
    ],
    "importance": 3,
    "source_page": 127,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-alkene-alkyne-electrophilic-addition-mechanism",
    "chapter_id": "jee-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-electrophilic-addition"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrophilic Addition Mechanism",
    "card_type": "mechanism",
    "body": "The source states that the characteristic reaction of alkene and alkyne is electrophilic addition.",
    "formulas": [
      {
        "label": "Step 1",
        "latex": "C=C+E^+\\longrightarrow\\text{carbocation}"
      },
      {
        "label": "Step 2",
        "latex": "\\text{carbocation}+Nu: \\longrightarrow \\text{addition product}"
      }
    ],
    "variables": [],
    "conditions": [
      "In the source mechanism, the positive charge is on the more substituted carbon."
    ],
    "importance": 5,
    "source_page": 127,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-alkene-alkyne-alkene-hydration",
    "chapter_id": "jee-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition of Water",
    "card_type": "reaction",
    "body": "The source gives addition of water to an alkene under acidic conditions.",
    "formulas": [
      {
        "latex": "C=C+H_2O\\xrightarrow{H^+}-C(H)-C(OH)-"
      }
    ],
    "variables": [],
    "conditions": [
      "The displayed product follows Markovnikov orientation."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-alkene-alkyne-alkyne-hx-addition",
    "chapter_id": "jee-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition of Hydrogen Halides to Alkyne",
    "card_type": "reaction",
    "body": "The source gives hydrogen halide addition to an alkyne in two stages.",
    "formulas": [
      {
        "label": "First addition",
        "latex": "R-C{\\equiv}C-R'\\xrightarrow{H-X}R-CH=CX-R'"
      },
      {
        "label": "Second addition",
        "latex": "R-CH=CX-R'\\xrightarrow{H-X}R-CH_2-CX_2-R'"
      }
    ],
    "variables": [
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "Cl, Br or I in the source note"
      }
    ],
    "conditions": [
      "The first addition is labelled Markovnikov addition in the source."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-alkene-alkyne-anti-addition-note",
    "chapter_id": "jee-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anti-Addition Note",
    "card_type": "rule",
    "body": "The source adds a stereochemistry note for selected electrophiles.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "When electrophiles are $Cl^+$, $Br^+$, $I^+$, $NO_2^+$ or $Hg^{2+}$, stereochemistry is important and the major product is formed by anti addition."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-alkyl-halide-sn1-hydrolysis",
    "chapter_id": "jee-chemistry-alkyl-halide",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "SN1 Hydrolysis",
    "card_type": "reaction",
    "body": "The Alkyl Halide section begins with nucleophilic substitution reactions and gives this SN1 hydrolysis route.",
    "formulas": [
      {
        "latex": "R-X+H_2O\\xrightarrow{AgNO_3}R^+ + AgX\\downarrow \\longrightarrow ROH"
      }
    ],
    "variables": [],
    "conditions": [
      "$R$ may rearrange.",
      "Alkyl halides are hydrolysed to alcohol very slowly by water, but rapidly by silver oxide suspended in boiling water."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-alkyl-halide-sn2-mechanism",
    "chapter_id": "jee-chemistry-alkyl-halide",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-sn2"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "SN2 Mechanism",
    "card_type": "mechanism",
    "body": "The source shows hydroxide attacking $R-X$ through a dotted transition representation to form alcohol and halide ion.",
    "formulas": [
      {
        "latex": "HO^-+R-X\\longrightarrow HO\\cdots R\\cdots X\\longrightarrow HO-R+X^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The page shows partial negative charge on the incoming $HO^-$ side and the leaving $X$ side in the transition representation."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-alkyl-halide-substitution-comparison",
    "chapter_id": "jee-chemistry-alkyl-halide",
    "table_data": {
      "columns": [
        "Path",
        "Reactant + reagent",
        "Source-backed product/result",
        "Note"
      ],
      "rows": [
        [
          "$S_N1$",
          "$R-X+H_2O$, $AgNO_3$",
          "$R^+ + AgX\\downarrow \\rightarrow ROH$",
          "$R$ may rearrange"
        ],
        [
          "$S_N2$",
          "$HO^-+R-X$",
          "$HO-R+X^-$",
          "Dotted transition representation shown"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "SN1 vs SN2 in the Source",
    "card_type": "comparison",
    "body": "The source names both nucleophilic substitution paths and gives one compact route for each.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 128,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-alkane-wurtz-reaction",
    "chapter_id": "neet-chemistry-alkane",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-wurtz"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Wurtz Reaction",
    "card_type": "reaction",
    "body": "The Alkane section visibly gives Wurtz reaction with sodium in ether and notes that primary and secondary alkyl halides give this reaction.",
    "formulas": [
      {
        "label": "Same alkyl halide",
        "latex": "R-X+2Na\\xrightarrow{\\text{ether}}R-R"
      },
      {
        "label": "Mixed alkyl halides",
        "latex": "R-X+R'-X+2Na\\xrightarrow{\\text{ether}}R-R'+R-R+R'-R'"
      }
    ],
    "variables": [],
    "conditions": [
      "Reagent: Na, ether.",
      "The source explicitly mentions $1^\\circ$ and $2^\\circ$ alkyl halides."
    ],
    "importance": 5,
    "source_page": 127,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-alkane-wurtz-cycloalkane-example",
    "chapter_id": "neet-chemistry-alkane",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Wurtz Cycloalkane Example",
    "card_type": "reaction",
    "body": "The handbook shows a dibromocyclobutane example closing to the corresponding cyclobutane framework.",
    "formulas": [
      {
        "latex": "\\text{dibromocyclobutane structure}+2Na\\xrightarrow{\\text{ether}}\\text{ring-closure product shown in source}"
      }
    ],
    "variables": [],
    "conditions": [
      "The detailed ring drawing remains available in the original handbook because it is shown as a structure rather than a typed formula."
    ],
    "importance": 3,
    "source_page": 127,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-alkene-alkyne-electrophilic-addition-mechanism",
    "chapter_id": "neet-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-electrophilic-addition"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Electrophilic Addition Mechanism",
    "card_type": "mechanism",
    "body": "The source states that the characteristic reaction of alkene and alkyne is electrophilic addition.",
    "formulas": [
      {
        "label": "Step 1",
        "latex": "C=C+E^+\\longrightarrow\\text{carbocation}"
      },
      {
        "label": "Step 2",
        "latex": "\\text{carbocation}+Nu: \\longrightarrow \\text{addition product}"
      }
    ],
    "variables": [],
    "conditions": [
      "In the source mechanism, the positive charge is on the more substituted carbon."
    ],
    "importance": 5,
    "source_page": 127,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-alkene-alkyne-alkene-hydration",
    "chapter_id": "neet-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition of Water",
    "card_type": "reaction",
    "body": "The source gives addition of water to an alkene under acidic conditions.",
    "formulas": [
      {
        "latex": "C=C+H_2O\\xrightarrow{H^+}-C(H)-C(OH)-"
      }
    ],
    "variables": [],
    "conditions": [
      "The displayed product follows Markovnikov orientation."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-alkene-alkyne-alkyne-hx-addition",
    "chapter_id": "neet-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition of Hydrogen Halides to Alkyne",
    "card_type": "reaction",
    "body": "The source gives hydrogen halide addition to an alkyne in two stages.",
    "formulas": [
      {
        "label": "First addition",
        "latex": "R-C{\\equiv}C-R'\\xrightarrow{H-X}R-CH=CX-R'"
      },
      {
        "label": "Second addition",
        "latex": "R-CH=CX-R'\\xrightarrow{H-X}R-CH_2-CX_2-R'"
      }
    ],
    "variables": [
      {
        "latex": "X",
        "symbol": "$X$",
        "meaning": "Cl, Br or I in the source note"
      }
    ],
    "conditions": [
      "The first addition is labelled Markovnikov addition in the source."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-alkene-alkyne-anti-addition-note",
    "chapter_id": "neet-chemistry-alkene-alkyne",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Anti-Addition Note",
    "card_type": "rule",
    "body": "The source adds a stereochemistry note for selected electrophiles.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "When electrophiles are $Cl^+$, $Br^+$, $I^+$, $NO_2^+$ or $Hg^{2+}$, stereochemistry is important and the major product is formed by anti addition."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-alkyl-halide-sn1-hydrolysis",
    "chapter_id": "neet-chemistry-alkyl-halide",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "SN1 Hydrolysis",
    "card_type": "reaction",
    "body": "The Alkyl Halide section begins with nucleophilic substitution reactions and gives this SN1 hydrolysis route.",
    "formulas": [
      {
        "latex": "R-X+H_2O\\xrightarrow{AgNO_3}R^+ + AgX\\downarrow \\longrightarrow ROH"
      }
    ],
    "variables": [],
    "conditions": [
      "$R$ may rearrange.",
      "Alkyl halides are hydrolysed to alcohol very slowly by water, but rapidly by silver oxide suspended in boiling water."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-alkyl-halide-sn2-mechanism",
    "chapter_id": "neet-chemistry-alkyl-halide",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-sn2"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "SN2 Mechanism",
    "card_type": "mechanism",
    "body": "The source shows hydroxide attacking $R-X$ through a dotted transition representation to form alcohol and halide ion.",
    "formulas": [
      {
        "latex": "HO^-+R-X\\longrightarrow HO\\cdots R\\cdots X\\longrightarrow HO-R+X^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The page shows partial negative charge on the incoming $HO^-$ side and the leaving $X$ side in the transition representation."
    ],
    "importance": 5,
    "source_page": 128,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-alkyl-halide-substitution-comparison",
    "chapter_id": "neet-chemistry-alkyl-halide",
    "table_data": {
      "columns": [
        "Path",
        "Reactant + reagent",
        "Source-backed product/result",
        "Note"
      ],
      "rows": [
        [
          "$S_N1$",
          "$R-X+H_2O$, $AgNO_3$",
          "$R^+ + AgX\\downarrow \\rightarrow ROH$",
          "$R$ may rearrange"
        ],
        [
          "$S_N2$",
          "$HO^-+R-X$",
          "$HO-R+X^-$",
          "Dotted transition representation shown"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "SN1 vs SN2 in the Source",
    "card_type": "comparison",
    "body": "The source names both nucleophilic substitution paths and gives one compact route for each.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 4,
    "source_page": 128,
    "sort_order": 3
  }
]$$::jsonb) as seed(
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
  id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, diagram_svg, importance, source_page, sort_order, is_active
)
select
  id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, diagram_svg, importance, source_page, sort_order, is_active
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
