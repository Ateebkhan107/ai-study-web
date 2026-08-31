alter table public.formula_cards
  drop constraint if exists formula_cards_card_type_check;

alter table public.formula_cards
  add constraint formula_cards_card_type_check
  check (
    card_type in (
      'formula',
      'concept',
      'table',
      'diagram',
      'note',
      'mixed',
      'reaction',
      'preparation',
      'rule',
      'comparison',
      'classification',
      'sequence',
      'examples',
      'neet_trap',
      'fact',
      'process',
      'reactivity_order',
      'mechanism',
      'exception',
      'structure',
      'electronic_effect',
      'naming_example'
    )
  );
