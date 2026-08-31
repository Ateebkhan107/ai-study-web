insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-chemistry-aromatic-compounds', 'jee-chemistry', 'Aromatic Compounds', 'aromatic-compounds', 31),
  ('jee-chemistry-polymers', 'jee-chemistry', 'Polymers', 'polymers', 32),
  ('neet-chemistry-aromatic-compounds', 'neet-chemistry', 'Aromatic Compounds', 'aromatic-compounds', 31),
  ('neet-chemistry-polymers', 'neet-chemistry', 'Polymers', 'polymers', 32)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

with card_seed as (
  select *
  from jsonb_to_recordset($$[
  {
    "id": "jee-chemistry-aromatic-compounds-eas-bromination-overview",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-eas-benzene"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination as Electrophilic Aromatic Substitution",
    "card_type": "reaction",
    "body": "The source introduces bromination of benzene as following the general mechanism for electrophilic aromatic substitution.",
    "formulas": [
      {
        "latex": "C_6H_6+Br_2\\xrightarrow{FeBr_3}C_6H_5Br+HBr"
      }
    ],
    "variables": [],
    "conditions": [
      "Bromine itself is not sufficiently electrophilic to react with benzene.",
      "$FeBr_3$ acts as the Lewis acid catalyst."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-aromatic-compounds-bromination-electrophile-generation",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 1: Stronger Electrophile",
    "card_type": "mechanism",
    "body": "The first source step is activation of bromine by ferric bromide.",
    "formulas": [
      {
        "latex": "Br_2+FeBr_3\\rightleftharpoons Br^{\\delta+}-Br^{\\delta-}-FeBr_3"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-aromatic-compounds-bromination-sigma-complex",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-sigma-complex"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 2: Sigma Complex",
    "card_type": "mechanism",
    "body": "The source shows electrophilic attack by the activated bromine reagent and resonance forms of the sigma complex.",
    "formulas": [
      {
        "latex": "C_6H_6+Br_2\\cdot FeBr_3\\longrightarrow [C_6H_6Br]^++FeBr_4^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The drawn resonance contributors are kept in the PDF fallback; this card preserves the source mechanism level."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-aromatic-compounds-bromination-deprotonation",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 3: Restore Aromaticity",
    "card_type": "mechanism",
    "body": "The final source step removes proton from the sigma complex to form bromobenzene.",
    "formulas": [
      {
        "latex": "[C_6H_6Br]^++FeBr_4^-\\longrightarrow C_6H_5Br+HBr+FeBr_3"
      }
    ],
    "variables": [],
    "conditions": [
      "The source reaction-coordinate sketch marks the product level lower by $10.8\\ \\text{kcal/mol}$."
    ],
    "importance": 4,
    "source_page": 143,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-aromatic-compounds-nitration-mechanism",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nitration of Benzene",
    "card_type": "mechanism",
    "body": "The rendered source shows nitronium ion formation followed by electrophilic attack, pi-complex, sigma-complex and nitrobenzene formation.",
    "formulas": [
      {
        "latex": "HNO_3\\xrightarrow{H_2SO_4}NO_2^+"
      },
      {
        "latex": "C_6H_6+NO_2^+\\longrightarrow C_6H_5NO_2+H^+"
      }
    ],
    "variables": [],
    "conditions": [
      "The source labels $NO_2^+$ as nitronium ion."
    ],
    "importance": 5,
    "source_page": 143,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-aromatic-compounds-sulphonation-mechanism",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sulphonation of Benzene",
    "card_type": "mechanism",
    "body": "The source says electrophilic $SO_3$ attacks the benzene ring to form the intermediate carbocation.",
    "formulas": [
      {
        "latex": "2H_2SO_4\\rightleftharpoons SO_3+H_3O^++HSO_4^-"
      },
      {
        "latex": "C_6H_6+SO_3\\longrightarrow C_6H_5SO_3H"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 143,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-aromatic-compounds-friedel-crafts-alkylation",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Friedel-Crafts Alkylation Mechanism",
    "card_type": "mechanism",
    "body": "The source gives a three-step alkylation mechanism through carbocation formation, sigma complex and product formation.",
    "formulas": [
      {
        "label": "Electrophile",
        "latex": "R-Cl+AlCl_3\\longrightarrow R^++AlCl_4^-"
      },
      {
        "label": "Product",
        "latex": "C_6H_6+R^+\\longrightarrow C_6H_5R+HCl+AlCl_3"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 144,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-aromatic-compounds-friedel-crafts-acylation",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Friedel-Crafts Acylation Mechanism",
    "card_type": "mechanism",
    "body": "The source states that acylation of benzene may be brought about with acid chlorides or anhydrides in presence of Lewis acids.",
    "formulas": [
      {
        "label": "Acylium ion",
        "latex": "RCOCl+AlCl_3\\rightleftharpoons R-C{\\equiv}O^++AlCl_4^-"
      },
      {
        "label": "Product",
        "latex": "C_6H_6+RCOCl\\xrightarrow{AlCl_3}C_6H_5COR+HCl"
      }
    ],
    "variables": [],
    "conditions": [
      "The source note says Friedel-Crafts acylations are generally free from rearrangements and multiple substitution.",
      "They do not go on strongly deactivated rings."
    ],
    "importance": 5,
    "source_page": 144,
    "sort_order": 8
  },
  {
    "id": "jee-chemistry-aromatic-compounds-ethylbenzene-acylation-example",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-eas-positions"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ethylbenzene Acylation Example",
    "card_type": "reaction",
    "body": "The source gives acylation of ethylbenzene with acetyl chloride.",
    "formulas": [
      {
        "latex": "C_6H_5CH_2CH_3+CH_3COCl\\xrightarrow[(2)\\ H_2O]{(1)\\ AlCl_3}p\\text{-ethyl-acetophenone}"
      }
    ],
    "variables": [],
    "conditions": [
      "Yield shown in the source: $70-80\\%$."
    ],
    "importance": 4,
    "source_page": 145,
    "sort_order": 9
  },
  {
    "id": "jee-chemistry-aromatic-compounds-benzene-reaction-map",
    "chapter_id": "jee-chemistry-aromatic-compounds",
    "table_data": {
      "columns": [
        "Reaction",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "Nitration",
          "conc. $HNO_3/H_2SO_4$",
          "nitrobenzene + $H_2O$"
        ],
        [
          "Sulphonation",
          "conc. $H_2SO_4+SO_3$",
          "benzenesulphonic acid + $H_2O$"
        ],
        [
          "Chlorination",
          "$Cl_2/FeCl_3$",
          "chlorobenzene + HCl"
        ],
        [
          "Friedel-Crafts alkylation",
          "$RCl/AlCl_3$",
          "$C_6H_5R+HCl$"
        ],
        [
          "Friedel-Crafts acylation",
          "$RCOCl/AlCl_3$",
          "$C_6H_5COR+HCl$"
        ],
        [
          "Deuteration",
          "$D^+/D_2O$",
          "$C_6H_5D+H^+$"
        ],
        [
          "Azo coupling shown in map",
          "$ArN_2^+X^-$",
          "$C_6H_5-N=N-Ar+HX$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chemical Reactions of Benzene",
    "card_type": "comparison",
    "body": "The source gives a compact benzene reaction map.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 145,
    "sort_order": 10
  },
  {
    "id": "jee-chemistry-polymers-biodegradable-polymers",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Biodegradable Polymers",
    "card_type": "concept",
    "body": "The source says biodegradable synthetic polymers contain functional groups similar to those present in biopolymers.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Aliphatic polyesters are listed as an important class of biodegradable polymers."
    ],
    "importance": 4,
    "source_page": 146,
    "sort_order": 1
  },
  {
    "id": "jee-chemistry-polymers-phbv",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-polymer-repeat"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "PHBV",
    "card_type": "structure",
    "body": "The source lists PHBV as poly beta-hydroxybutyrate-co-beta-hydroxy valerate.",
    "formulas": [
      {
        "latex": "\\text{3-hydroxybutanoic acid}+\\text{3-hydroxypentanoic acid}\\longrightarrow \\text{PHBV}"
      }
    ],
    "variables": [],
    "conditions": [
      "Obtained by copolymerisation of 3-hydroxybutanoic acid and 3-hydroxypentanoic acid.",
      "Uses shown: speciality packaging, orthopaedic devices and controlled release of drugs.",
      "The source says PHBV undergoes bacterial degradation in the environment."
    ],
    "importance": 5,
    "source_page": 146,
    "sort_order": 2
  },
  {
    "id": "jee-chemistry-polymers-nylon-2-nylon-6",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nylon-2-Nylon-6",
    "card_type": "structure",
    "body": "The source lists Nylon-2-Nylon-6 as an alternating polyamide copolymer.",
    "formulas": [
      {
        "latex": "nH_2NCH_2COOH+nH_2N(CH_2)_5COOH\\longrightarrow [-NHCH_2CO-NH(CH_2)_5CO-]_n"
      }
    ],
    "variables": [],
    "conditions": [
      "Monomers shown: glycine and amino caproic acid.",
      "The source also calls it biodegradable polymer."
    ],
    "importance": 5,
    "source_page": 146,
    "sort_order": 3
  },
  {
    "id": "jee-chemistry-polymers-addition-polymers-alkenes",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses shown"
      ],
      "rows": [
        [
          "LDPE",
          "$-(CH_2-CH_2)_n-$",
          "$CH_2=CH_2$ / ethylene",
          "Film wrap, plastic bags"
        ],
        [
          "HDPE",
          "$-(CH_2-CH_2)_n-$",
          "$CH_2=CH_2$ / ethylene",
          "Electrical insulation bottles, toys"
        ],
        [
          "Polypropylene",
          "$[-CH(CH_3)-CH_2-]_n$",
          "$CH_2=CHCH_3$ / propylene",
          "Ropes, toys, pipes, fibres"
        ],
        [
          "PVC",
          "$[-CH(Cl)-CH_2-]_n$",
          "$CH_2=CHCl$ / vinyl chloride",
          "Rain coats, hand bags, vinyl flooring, water pipes"
        ],
        [
          "Poly vinylidene chloride / Saran A",
          "$[-CCl_2-CH_2-]_n$",
          "$CH_2=CCl_2$",
          "Seat covers, films and fibers"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Common Addition Polymers: Alkene Families",
    "card_type": "comparison",
    "body": "The source table labels these as common addition polymers / chain-growth polymers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 4
  },
  {
    "id": "jee-chemistry-polymers-addition-polymers-substituted-vinyls",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses shown"
      ],
      "rows": [
        [
          "Polystyrene / Styron",
          "$[-CH_2-CH(C_6H_5)-]_n$",
          "$CH_2=CHC_6H_5$ / styrene",
          "Insulator, wrapping material, toys, radio and television cabinets"
        ],
        [
          "Polyacrylonitrile / PAN / Orlon / Acrilan",
          "$[-CH(CN)-CH_2-]_n$",
          "$CH_2=CHCN$ / acrylonitrile",
          "Rugs, blankets, clothing"
        ],
        [
          "PTFE / Teflon",
          "$-(CF_2-CF_2)_n-$",
          "$CF_2=CF_2$ / tetrafluoroethylene",
          "Non-stick surfaces, electrical insulation"
        ],
        [
          "PMMA / Lucite / Plexiglas / perspex",
          "$-[CH_2C(CH_3)CO_2CH_3]_n-$",
          "$CH_2=C(CH_3)CO_2CH_3$",
          "Lighting covers, signs, skylights"
        ],
        [
          "PVAc",
          "$-(CH_2-CHOCOCH_3)_n-$",
          "$CH_2=CHOCOCH_3$",
          "Latex paints, adhesives"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Common Addition Polymers: Substituted Vinyls",
    "card_type": "comparison",
    "body": "This card continues the source addition-polymer table.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 5
  },
  {
    "id": "jee-chemistry-polymers-addition-polymers-rubbers",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses / note shown"
      ],
      "rows": [
        [
          "Natural rubber",
          "$-[CH_2-CH=C(CH_3)-CH_2]_n-$ / cis",
          "$CH_2=CH-C(CH_3)=CH_2$ / isoprene",
          "Requires vulcanization for practical use"
        ],
        [
          "Neoprene",
          "$-[CH_2-CH=CCl-CH_2]_n-$",
          "$CH_2=CH-CCl=CH_2$ / chloroprene",
          "Synthetic rubber; oil resistant seal, gaskets, hoses and conveyor belts"
        ],
        [
          "SBR / Buna-S",
          "$-[CH_2-CH(Ph)-CH_2-CH=CH-CH_2]-$",
          "$H_2C=CHC_6H_5$ and $H_2C=CH-CH=CH_2$",
          "Tyres, floortiles, foot wear and cable insulation"
        ],
        [
          "Nitrile rubber / Buna-N",
          "$-[CH_2-CH(CN)-CH_2-CH=CH-CH_2]-$",
          "$H_2C=CHCN$ and $H_2C=CH-CH=CH_2$",
          "Oil seals, tank lining and hoses"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition Polymers: Rubbers",
    "card_type": "comparison",
    "body": "The source table lists natural rubber and synthetic rubber examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 6
  },
  {
    "id": "jee-chemistry-polymers-condensation-polyesters-polyamides",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Monomer(s) shown",
        "Uses shown"
      ],
      "rows": [
        [
          "Polyester / Dacron / Terylene / Mylar",
          "terephthalic acid + ethylene glycol",
          "Fabric, tyrecord"
        ],
        [
          "Glyptal or alkyd resin",
          "phthalic acid + ethylene glycol",
          "Paints and lacquers"
        ],
        [
          "Nylon 6,6",
          "adipic acid + hexamethylenediamine",
          "Parachutes and clothing"
        ],
        [
          "Nylon 6,10",
          "sebacic acid + hexamethylenediamine",
          ""
        ],
        [
          "Nylon 6 / Perlon-L",
          "caprolactam structure shown",
          "Rope and tyrecord"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Condensation Polymers: Polyesters and Polyamides",
    "card_type": "comparison",
    "body": "The source table labels these as condensation polymers / step-growth polymers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 148,
    "sort_order": 7
  },
  {
    "id": "jee-chemistry-polymers-condensation-resins-special-polymers",
    "chapter_id": "jee-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Monomer(s) shown",
        "Uses shown"
      ],
      "rows": [
        [
          "Bakelite",
          "phenol + excess formaldehyde",
          "Electrical switch, combs, handles of utensils, computer discs and bowling balls"
        ],
        [
          "Urea-formaldehyde resin",
          "urea + formaldehyde",
          "Unbreakable cups and laminated sheets"
        ],
        [
          "Melamine formaldehyde resin",
          "melamine + formaldehyde",
          "Unbreakable crockery"
        ],
        [
          "Kevlar",
          "para terephthalic acid relation shown",
          "Tyre"
        ],
        [
          "Nomex",
          "meta dicarboxylic acid + meta diamine relation shown",
          ""
        ],
        [
          "Polyurethane / Spandex",
          "ethylene glycol and diisocyanate-type monomer shown",
          "Foams, shoes, automobile seats and components"
        ],
        [
          "Polycarbonate / Lexan",
          "bisphenol A + $X_2C=O$ where $X=OCH_3$ or Cl",
          "Bike helmet, goggles, bullet proof glass"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Condensation Polymers: Resins and Specialty Polymers",
    "card_type": "comparison",
    "body": "This card continues the source condensation-polymer table.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 148,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-aromatic-compounds-eas-bromination-overview",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-eas-benzene"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination as Electrophilic Aromatic Substitution",
    "card_type": "reaction",
    "body": "The source introduces bromination of benzene as following the general mechanism for electrophilic aromatic substitution.",
    "formulas": [
      {
        "latex": "C_6H_6+Br_2\\xrightarrow{FeBr_3}C_6H_5Br+HBr"
      }
    ],
    "variables": [],
    "conditions": [
      "Bromine itself is not sufficiently electrophilic to react with benzene.",
      "$FeBr_3$ acts as the Lewis acid catalyst."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-aromatic-compounds-bromination-electrophile-generation",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 1: Stronger Electrophile",
    "card_type": "mechanism",
    "body": "The first source step is activation of bromine by ferric bromide.",
    "formulas": [
      {
        "latex": "Br_2+FeBr_3\\rightleftharpoons Br^{\\delta+}-Br^{\\delta-}-FeBr_3"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 142,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-aromatic-compounds-bromination-sigma-complex",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-sigma-complex"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 2: Sigma Complex",
    "card_type": "mechanism",
    "body": "The source shows electrophilic attack by the activated bromine reagent and resonance forms of the sigma complex.",
    "formulas": [
      {
        "latex": "C_6H_6+Br_2\\cdot FeBr_3\\longrightarrow [C_6H_6Br]^++FeBr_4^-"
      }
    ],
    "variables": [],
    "conditions": [
      "The drawn resonance contributors are kept in the PDF fallback; this card preserves the source mechanism level."
    ],
    "importance": 5,
    "source_page": 142,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-aromatic-compounds-bromination-deprotonation",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Bromination Step 3: Restore Aromaticity",
    "card_type": "mechanism",
    "body": "The final source step removes proton from the sigma complex to form bromobenzene.",
    "formulas": [
      {
        "latex": "[C_6H_6Br]^++FeBr_4^-\\longrightarrow C_6H_5Br+HBr+FeBr_3"
      }
    ],
    "variables": [],
    "conditions": [
      "The source reaction-coordinate sketch marks the product level lower by $10.8\\ \\text{kcal/mol}$."
    ],
    "importance": 4,
    "source_page": 143,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-aromatic-compounds-nitration-mechanism",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nitration of Benzene",
    "card_type": "mechanism",
    "body": "The rendered source shows nitronium ion formation followed by electrophilic attack, pi-complex, sigma-complex and nitrobenzene formation.",
    "formulas": [
      {
        "latex": "HNO_3\\xrightarrow{H_2SO_4}NO_2^+"
      },
      {
        "latex": "C_6H_6+NO_2^+\\longrightarrow C_6H_5NO_2+H^+"
      }
    ],
    "variables": [],
    "conditions": [
      "The source labels $NO_2^+$ as nitronium ion."
    ],
    "importance": 5,
    "source_page": 143,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-aromatic-compounds-sulphonation-mechanism",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Sulphonation of Benzene",
    "card_type": "mechanism",
    "body": "The source says electrophilic $SO_3$ attacks the benzene ring to form the intermediate carbocation.",
    "formulas": [
      {
        "latex": "2H_2SO_4\\rightleftharpoons SO_3+H_3O^++HSO_4^-"
      },
      {
        "latex": "C_6H_6+SO_3\\longrightarrow C_6H_5SO_3H"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 143,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-aromatic-compounds-friedel-crafts-alkylation",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Friedel-Crafts Alkylation Mechanism",
    "card_type": "mechanism",
    "body": "The source gives a three-step alkylation mechanism through carbocation formation, sigma complex and product formation.",
    "formulas": [
      {
        "label": "Electrophile",
        "latex": "R-Cl+AlCl_3\\longrightarrow R^++AlCl_4^-"
      },
      {
        "label": "Product",
        "latex": "C_6H_6+R^+\\longrightarrow C_6H_5R+HCl+AlCl_3"
      }
    ],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 144,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-aromatic-compounds-friedel-crafts-acylation",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Friedel-Crafts Acylation Mechanism",
    "card_type": "mechanism",
    "body": "The source states that acylation of benzene may be brought about with acid chlorides or anhydrides in presence of Lewis acids.",
    "formulas": [
      {
        "label": "Acylium ion",
        "latex": "RCOCl+AlCl_3\\rightleftharpoons R-C{\\equiv}O^++AlCl_4^-"
      },
      {
        "label": "Product",
        "latex": "C_6H_6+RCOCl\\xrightarrow{AlCl_3}C_6H_5COR+HCl"
      }
    ],
    "variables": [],
    "conditions": [
      "The source note says Friedel-Crafts acylations are generally free from rearrangements and multiple substitution.",
      "They do not go on strongly deactivated rings."
    ],
    "importance": 5,
    "source_page": 144,
    "sort_order": 8
  },
  {
    "id": "neet-chemistry-aromatic-compounds-ethylbenzene-acylation-example",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-eas-positions"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "Ethylbenzene Acylation Example",
    "card_type": "reaction",
    "body": "The source gives acylation of ethylbenzene with acetyl chloride.",
    "formulas": [
      {
        "latex": "C_6H_5CH_2CH_3+CH_3COCl\\xrightarrow[(2)\\ H_2O]{(1)\\ AlCl_3}p\\text{-ethyl-acetophenone}"
      }
    ],
    "variables": [],
    "conditions": [
      "Yield shown in the source: $70-80\\%$."
    ],
    "importance": 4,
    "source_page": 145,
    "sort_order": 9
  },
  {
    "id": "neet-chemistry-aromatic-compounds-benzene-reaction-map",
    "chapter_id": "neet-chemistry-aromatic-compounds",
    "table_data": {
      "columns": [
        "Reaction",
        "Reagent / condition",
        "Product shown"
      ],
      "rows": [
        [
          "Nitration",
          "conc. $HNO_3/H_2SO_4$",
          "nitrobenzene + $H_2O$"
        ],
        [
          "Sulphonation",
          "conc. $H_2SO_4+SO_3$",
          "benzenesulphonic acid + $H_2O$"
        ],
        [
          "Chlorination",
          "$Cl_2/FeCl_3$",
          "chlorobenzene + HCl"
        ],
        [
          "Friedel-Crafts alkylation",
          "$RCl/AlCl_3$",
          "$C_6H_5R+HCl$"
        ],
        [
          "Friedel-Crafts acylation",
          "$RCOCl/AlCl_3$",
          "$C_6H_5COR+HCl$"
        ],
        [
          "Deuteration",
          "$D^+/D_2O$",
          "$C_6H_5D+H^+$"
        ],
        [
          "Azo coupling shown in map",
          "$ArN_2^+X^-$",
          "$C_6H_5-N=N-Ar+HX$"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Chemical Reactions of Benzene",
    "card_type": "comparison",
    "body": "The source gives a compact benzene reaction map.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 145,
    "sort_order": 10
  },
  {
    "id": "neet-chemistry-polymers-biodegradable-polymers",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Biodegradable Polymers",
    "card_type": "concept",
    "body": "The source says biodegradable synthetic polymers contain functional groups similar to those present in biopolymers.",
    "formulas": [],
    "variables": [],
    "conditions": [
      "Aliphatic polyesters are listed as an important class of biodegradable polymers."
    ],
    "importance": 4,
    "source_page": 146,
    "sort_order": 1
  },
  {
    "id": "neet-chemistry-polymers-phbv",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": null,
    "diagram_data": {
      "type": "chem-organic-polymer-repeat"
    },
    "diagram_svg": null,
    "is_active": true,
    "title": "PHBV",
    "card_type": "structure",
    "body": "The source lists PHBV as poly beta-hydroxybutyrate-co-beta-hydroxy valerate.",
    "formulas": [
      {
        "latex": "\\text{3-hydroxybutanoic acid}+\\text{3-hydroxypentanoic acid}\\longrightarrow \\text{PHBV}"
      }
    ],
    "variables": [],
    "conditions": [
      "Obtained by copolymerisation of 3-hydroxybutanoic acid and 3-hydroxypentanoic acid.",
      "Uses shown: speciality packaging, orthopaedic devices and controlled release of drugs.",
      "The source says PHBV undergoes bacterial degradation in the environment."
    ],
    "importance": 5,
    "source_page": 146,
    "sort_order": 2
  },
  {
    "id": "neet-chemistry-polymers-nylon-2-nylon-6",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": null,
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Nylon-2-Nylon-6",
    "card_type": "structure",
    "body": "The source lists Nylon-2-Nylon-6 as an alternating polyamide copolymer.",
    "formulas": [
      {
        "latex": "nH_2NCH_2COOH+nH_2N(CH_2)_5COOH\\longrightarrow [-NHCH_2CO-NH(CH_2)_5CO-]_n"
      }
    ],
    "variables": [],
    "conditions": [
      "Monomers shown: glycine and amino caproic acid.",
      "The source also calls it biodegradable polymer."
    ],
    "importance": 5,
    "source_page": 146,
    "sort_order": 3
  },
  {
    "id": "neet-chemistry-polymers-addition-polymers-alkenes",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses shown"
      ],
      "rows": [
        [
          "LDPE",
          "$-(CH_2-CH_2)_n-$",
          "$CH_2=CH_2$ / ethylene",
          "Film wrap, plastic bags"
        ],
        [
          "HDPE",
          "$-(CH_2-CH_2)_n-$",
          "$CH_2=CH_2$ / ethylene",
          "Electrical insulation bottles, toys"
        ],
        [
          "Polypropylene",
          "$[-CH(CH_3)-CH_2-]_n$",
          "$CH_2=CHCH_3$ / propylene",
          "Ropes, toys, pipes, fibres"
        ],
        [
          "PVC",
          "$[-CH(Cl)-CH_2-]_n$",
          "$CH_2=CHCl$ / vinyl chloride",
          "Rain coats, hand bags, vinyl flooring, water pipes"
        ],
        [
          "Poly vinylidene chloride / Saran A",
          "$[-CCl_2-CH_2-]_n$",
          "$CH_2=CCl_2$",
          "Seat covers, films and fibers"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Common Addition Polymers: Alkene Families",
    "card_type": "comparison",
    "body": "The source table labels these as common addition polymers / chain-growth polymers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 4
  },
  {
    "id": "neet-chemistry-polymers-addition-polymers-substituted-vinyls",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses shown"
      ],
      "rows": [
        [
          "Polystyrene / Styron",
          "$[-CH_2-CH(C_6H_5)-]_n$",
          "$CH_2=CHC_6H_5$ / styrene",
          "Insulator, wrapping material, toys, radio and television cabinets"
        ],
        [
          "Polyacrylonitrile / PAN / Orlon / Acrilan",
          "$[-CH(CN)-CH_2-]_n$",
          "$CH_2=CHCN$ / acrylonitrile",
          "Rugs, blankets, clothing"
        ],
        [
          "PTFE / Teflon",
          "$-(CF_2-CF_2)_n-$",
          "$CF_2=CF_2$ / tetrafluoroethylene",
          "Non-stick surfaces, electrical insulation"
        ],
        [
          "PMMA / Lucite / Plexiglas / perspex",
          "$-[CH_2C(CH_3)CO_2CH_3]_n-$",
          "$CH_2=C(CH_3)CO_2CH_3$",
          "Lighting covers, signs, skylights"
        ],
        [
          "PVAc",
          "$-(CH_2-CHOCOCH_3)_n-$",
          "$CH_2=CHOCOCH_3$",
          "Latex paints, adhesives"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Common Addition Polymers: Substituted Vinyls",
    "card_type": "comparison",
    "body": "This card continues the source addition-polymer table.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 5
  },
  {
    "id": "neet-chemistry-polymers-addition-polymers-rubbers",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Formula shown",
        "Monomer",
        "Uses / note shown"
      ],
      "rows": [
        [
          "Natural rubber",
          "$-[CH_2-CH=C(CH_3)-CH_2]_n-$ / cis",
          "$CH_2=CH-C(CH_3)=CH_2$ / isoprene",
          "Requires vulcanization for practical use"
        ],
        [
          "Neoprene",
          "$-[CH_2-CH=CCl-CH_2]_n-$",
          "$CH_2=CH-CCl=CH_2$ / chloroprene",
          "Synthetic rubber; oil resistant seal, gaskets, hoses and conveyor belts"
        ],
        [
          "SBR / Buna-S",
          "$-[CH_2-CH(Ph)-CH_2-CH=CH-CH_2]-$",
          "$H_2C=CHC_6H_5$ and $H_2C=CH-CH=CH_2$",
          "Tyres, floortiles, foot wear and cable insulation"
        ],
        [
          "Nitrile rubber / Buna-N",
          "$-[CH_2-CH(CN)-CH_2-CH=CH-CH_2]-$",
          "$H_2C=CHCN$ and $H_2C=CH-CH=CH_2$",
          "Oil seals, tank lining and hoses"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Addition Polymers: Rubbers",
    "card_type": "comparison",
    "body": "The source table lists natural rubber and synthetic rubber examples.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 147,
    "sort_order": 6
  },
  {
    "id": "neet-chemistry-polymers-condensation-polyesters-polyamides",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Monomer(s) shown",
        "Uses shown"
      ],
      "rows": [
        [
          "Polyester / Dacron / Terylene / Mylar",
          "terephthalic acid + ethylene glycol",
          "Fabric, tyrecord"
        ],
        [
          "Glyptal or alkyd resin",
          "phthalic acid + ethylene glycol",
          "Paints and lacquers"
        ],
        [
          "Nylon 6,6",
          "adipic acid + hexamethylenediamine",
          "Parachutes and clothing"
        ],
        [
          "Nylon 6,10",
          "sebacic acid + hexamethylenediamine",
          ""
        ],
        [
          "Nylon 6 / Perlon-L",
          "caprolactam structure shown",
          "Rope and tyrecord"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Condensation Polymers: Polyesters and Polyamides",
    "card_type": "comparison",
    "body": "The source table labels these as condensation polymers / step-growth polymers.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 148,
    "sort_order": 7
  },
  {
    "id": "neet-chemistry-polymers-condensation-resins-special-polymers",
    "chapter_id": "neet-chemistry-polymers",
    "table_data": {
      "columns": [
        "Polymer",
        "Monomer(s) shown",
        "Uses shown"
      ],
      "rows": [
        [
          "Bakelite",
          "phenol + excess formaldehyde",
          "Electrical switch, combs, handles of utensils, computer discs and bowling balls"
        ],
        [
          "Urea-formaldehyde resin",
          "urea + formaldehyde",
          "Unbreakable cups and laminated sheets"
        ],
        [
          "Melamine formaldehyde resin",
          "melamine + formaldehyde",
          "Unbreakable crockery"
        ],
        [
          "Kevlar",
          "para terephthalic acid relation shown",
          "Tyre"
        ],
        [
          "Nomex",
          "meta dicarboxylic acid + meta diamine relation shown",
          ""
        ],
        [
          "Polyurethane / Spandex",
          "ethylene glycol and diisocyanate-type monomer shown",
          "Foams, shoes, automobile seats and components"
        ],
        [
          "Polycarbonate / Lexan",
          "bisphenol A + $X_2C=O$ where $X=OCH_3$ or Cl",
          "Bike helmet, goggles, bullet proof glass"
        ]
      ]
    },
    "diagram_data": null,
    "diagram_svg": null,
    "is_active": true,
    "title": "Condensation Polymers: Resins and Specialty Polymers",
    "card_type": "comparison",
    "body": "This card continues the source condensation-polymer table.",
    "formulas": [],
    "variables": [],
    "conditions": [],
    "importance": 5,
    "source_page": 148,
    "sort_order": 8
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
