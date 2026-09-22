CREATE TABLE IF NOT EXISTS institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_name TEXT UNIQUE NOT NULL,
    institute_state TEXT NOT NULL,
    institute_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_institutes_name ON institutes (institute_name);
CREATE INDEX IF NOT EXISTS idx_institutes_state ON institutes (institute_state);
CREATE INDEX IF NOT EXISTS idx_institutes_type ON institutes (institute_type);
