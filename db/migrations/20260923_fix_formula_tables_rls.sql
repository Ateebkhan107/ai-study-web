-- ============================================================
-- Fix: Enable Row Level Security on formula tables
-- These tables were flagged by Supabase as publicly accessible.
-- All writes happen via supabaseAdmin in trusted server routes.
-- Read access is allowed to any authenticated user.
-- ============================================================

-- Enable RLS
ALTER TABLE public.formula_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_cards    ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated or anonymous user to read formula content
-- (it's educational reference data, not personal data)
CREATE POLICY "formula_subjects_public_read"
  ON public.formula_subjects FOR SELECT
  USING (true);

CREATE POLICY "formula_chapters_public_read"
  ON public.formula_chapters FOR SELECT
  USING (true);

CREATE POLICY "formula_cards_public_read"
  ON public.formula_cards FOR SELECT
  USING (true);

-- Write access is blocked for all browser clients.
-- Inserts/updates happen exclusively via supabaseAdmin (service role key)
-- in trusted Next.js API routes and seed scripts, bypassing RLS entirely.
