-- Optional storage for reviewed diagram references. This changes no content,
-- publication flag, or policy.
ALTER TABLE public.formula_cards
  ADD COLUMN IF NOT EXISTS diagram_image text;
