CREATE OR REPLACE VIEW josaa_cutoffs_with_state AS
SELECT 
  c.*,
  i.institute_state,
  i.institute_type
FROM josaa_cutoffs c
LEFT JOIN institutes i ON c.institute_name = i.institute_name;

-- Ensure the view respects row level security of the underlying tables
-- Alternatively, if we just want it to be queryable securely without worrying about 'institutes' RLS:
-- In Supabase, standard views invoke the caller's RLS. If 'institutes' has RLS blocking SELECT, this view might fail to join.
-- To bypass 'institutes' RLS safely strictly for this view, we could use a SECURITY DEFINER function, but standard views are fine if the user sets up RLS properly.
