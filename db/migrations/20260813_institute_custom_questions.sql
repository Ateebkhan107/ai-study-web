-- Add institute_id to public.questions so institutes can author their own questions

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS institute_id uuid REFERENCES public.institutes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_questions_institute_id ON public.questions(institute_id);

-- Update RLS policies to allow institute owners/admins to insert/update their own questions
-- Note: Assuming the table public.questions already has RLS enabled.

CREATE POLICY "Allow institute admins to insert their own questions"
  ON public.questions
  FOR INSERT
  WITH CHECK (
    institute_id IS NOT NULL AND
    institute_id IN (
      SELECT institute_id FROM public.institute_members 
      WHERE user_id = auth.uid() AND role IN ('COACHING_ADMIN', 'OWNER')
    )
  );

CREATE POLICY "Allow institute admins to update their own questions"
  ON public.questions
  FOR UPDATE
  USING (
    institute_id IS NOT NULL AND
    institute_id IN (
      SELECT institute_id FROM public.institute_members 
      WHERE user_id = auth.uid() AND role IN ('COACHING_ADMIN', 'OWNER')
    )
  );

CREATE POLICY "Allow institute admins to delete their own questions"
  ON public.questions
  FOR DELETE
  USING (
    institute_id IS NOT NULL AND
    institute_id IN (
      SELECT institute_id FROM public.institute_members 
      WHERE user_id = auth.uid() AND role IN ('COACHING_ADMIN', 'OWNER')
    )
  );
