-- Intersect all browser SELECT policies with publication state.
-- Trusted server writes still use the existing service role.
CREATE POLICY formula_cards_active_browser_read
  ON public.formula_cards
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE);
