CREATE TABLE IF NOT EXISTS zi_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text NOT NULL,
  preference_key text NOT NULL,
  preference_value text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(clerk_user_id, preference_key)
);

-- Enable RLS
ALTER TABLE zi_preferences ENABLE ROW LEVEL SECURITY;

-- We don't need direct client access since reads/writes happen via
-- supabaseAdmin and trusted Next.js API routes using Clerk authentication.
-- Keeping RLS enabled without any policies ensures normal browser clients
-- cannot access the table directly.

-- Since updates will happen via admin client in the route.js, 
-- we don't necessarily need insert/update RLS for the public role.
